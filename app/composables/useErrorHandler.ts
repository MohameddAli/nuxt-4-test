import { useSnackbar } from './useSnackbar'
import { useAuthStore } from '~/stores/auth'

export interface ErrorHandlerOptions {
  showSnackbar?: boolean
  logToConsole?: boolean
  fallbackMessage?: string
  redirect?: string
  context?: string
  retryFn?: () => void
}

export interface ErrorInfo {
  error: Error
  component?: string
  context?: string
  timestamp: Date
  statusCode?: number
  type: 'auth' | 'validation' | 'network' | 'server' | 'client' | 'unknown'
}

/**
 * النظام الموحد لمعالجة الأخطاء
 * يجمع بين جميع أنواع معالجة الأخطاء في مكان واحد
 * 
 * استخدامات:
 * - أخطاء API (401, 403, 400, 500)
 * - أخطاء الشبكة  
 * - أخطاء التحقق من البيانات
 * - أخطاء المكونات
 * - أخطاء عامة
 */
export const useErrorHandler = () => {
  const { showError, showWarning, showInfo, showSuccess } = useSnackbar()
  const authStore = useAuthStore()
  
  /**
   * تحديد نوع الخطأ تلقائياً
   */
  const getErrorType = (error: any): ErrorInfo['type'] => {
    const statusCode = error?.status || error?.statusCode

    if (statusCode === 401 || statusCode === 403) return 'auth'
    if (statusCode === 400) return 'validation'
    if (statusCode === 404 || statusCode >= 500) return 'server'
    if (!navigator.onLine || error.message?.includes('network')) return 'network'
    if (error.name === 'TypeError' || error.name === 'ReferenceError') return 'client'
    
    return 'unknown'
  }

  /**
   * معالجة أخطاء المصادقة والصلاحيات (401, 403)
   */
  const handleAuthError = (statusCode: number, message?: string, options: ErrorHandlerOptions = {}) => {
    if (statusCode === 401) {
      authStore.clearAuth()
      showError('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى', {
        timeout: 5000
      })
      
      if (options.logToConsole !== false) {
        console.warn('401 Unauthorized - User logged out')
      }
      
      navigateTo('/login')
    } else if (statusCode === 403) {
      const errorMessage = message || 'ليس لديك صلاحية للوصول إلى هذا المورد'
      showError(errorMessage, {
        timeout: 5000
      })
      
      if (options.logToConsole !== false) {
        console.warn('403 Forbidden:', errorMessage)
      }
      
      // العودة للصفحة السابقة أو الرئيسية
      if (options.redirect) {
        navigateTo(options.redirect)
      } else {
        navigateTo('/')
      }
    }
  }

  /**
   * معالجة أخطاء التحقق من صحة البيانات (400)
   */
  const handleValidationError = (errors: Record<string, string[]> | string, options: ErrorHandlerOptions = {}) => {
    if (typeof errors === 'string') {
      showWarning(errors, { timeout: 4000 })
      return
    }

    // عرض أول خطأ فقط لتجنب إزعاج المستخدم
    const firstError = Object.values(errors)[0]
    if (firstError && Array.isArray(firstError) && firstError.length > 0) {
      showWarning(firstError[0], { timeout: 4000 })
    } else {
      showWarning('يرجى التحقق من البيانات المدخلة', { timeout: 4000 })
    }

    if (options.logToConsole !== false) {
      console.warn('Validation Error:', errors)
    }
  }

  /**
   * معالجة أخطاء الشبكة
   */
  const handleNetworkError = (error: any, options: ErrorHandlerOptions = {}) => {
    const isOffline = !navigator.onLine
    
    if (isOffline) {
      showError('لا يوجد اتصال بالإنترنت، يرجى التحقق من الاتصال والمحاولة مرة أخرى', {
        timeout: 8000,
        actions: options.retryFn ? [{
          label: 'إعادة المحاولة',
          handler: options.retryFn
        }] : undefined
      })
    } else {
      showError('حدث خطأ في الاتصال بالخادم، يرجى المحاولة مرة أخرى', {
        timeout: 5000,
        actions: options.retryFn ? [{
          label: 'إعادة المحاولة', 
          handler: options.retryFn
        }] : undefined
      })
    }

    if (options.logToConsole !== false) {
      console.error('Network Error:', error)
    }
  }

  /**
   * معالجة أخطاء الخادم (500+)
   */
  const handleServerError = (error: any, options: ErrorHandlerOptions = {}) => {
    const statusCode = error?.status || error?.statusCode
    let message = 'حدث خطأ في الخادم، يرجى المحاولة مرة أخرى لاحقاً'
    
    if (statusCode === 404) {
      message = 'المورد المطلوب غير موجود'
    } else if (statusCode >= 500) {
      message = 'خطأ داخلي في الخادم، يرجى المحاولة لاحقاً'
    }

    if (options.context) {
      message = `${options.context}: ${message}`
    }

    showError(message, {
      timeout: 5000,
      actions: options.retryFn ? [{
        label: 'إعادة المحاولة',
        handler: options.retryFn
      }] : undefined
    })

    if (options.logToConsole !== false) {
      console.error('Server Error:', error)
    }
  }

  /**
   * معالجة أخطاء المكونات (Client-side)
   */
  const handleClientError = (error: Error, options: ErrorHandlerOptions = {}) => {
    const message = options.fallbackMessage || 'حدث خطأ في العرض، يرجى إعادة تحميل الصفحة'
    
    showError(message, {
      timeout: 4000,
      actions: [{
        label: 'إعادة التحميل',
        handler: () => window.location.reload()
      }]
    })

    if (options.logToConsole !== false) {
      console.error('Client Error:', {
        message: error.message,
        stack: error.stack,
        component: options.context,
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * المعالج الذكي الموحد - يحدد نوع الخطأ ويعالجه تلقائياً
   */
  const handleError = (
    error: Error | string | any,
    options: ErrorHandlerOptions = {}
  ): ErrorInfo => {
    // تحويل الخطأ إلى كائن موحد
    const errorObj = typeof error === 'string' ? new Error(error) : error
    const statusCode = errorObj?.status || errorObj?.statusCode
    const errorType = getErrorType(errorObj)
    
    // إنشاء معلومات الخطأ
    const errorInfo: ErrorInfo = {
      error: errorObj,
      context: options.context,
      timestamp: new Date(),
      statusCode,
      type: errorType
    }

    // معالجة حسب النوع
    switch (errorType) {
      case 'auth':
        handleAuthError(statusCode, errorObj.message, options)
        break
        
      case 'validation':
        handleValidationError(errorObj?.data?.errors || errorObj.message, options)
        break
        
      case 'network':
        handleNetworkError(errorObj, options)
        break
        
      case 'server':
        handleServerError(errorObj, options)
        break
        
      case 'client':
        handleClientError(errorObj, options)
        break
        
      default:
        // خطأ عام
        const message = errorObj?.message || 
                       errorObj?.data?.message || 
                       options.fallbackMessage ||
                       'حدث خطأ غير متوقع'
        
        const contextMessage = options.context ? `${options.context}: ${message}` : message
        
        showError(contextMessage, {
          timeout: 4000,
          actions: options.retryFn ? [{
            label: 'إعادة المحاولة',
            handler: options.retryFn
          }] : undefined
        })

        if (options.logToConsole !== false) {
          console.error('Unknown Error:', errorInfo)
        }
    }

    // إعادة التوجيه إذا تم تحديده
    if (options.redirect && errorType !== 'auth') {
      navigateTo(options.redirect)
    }
    
    return errorInfo
  }

  /**
   * معالجة أخطاء API مع ميزات متقدمة
   */
  const handleApiError = (error: any, retryFn?: () => void, context?: string) => {
    return handleError(error, {
      retryFn,
      context: context || 'API Request',
      logToConsole: true,
      showSnackbar: true
    })
  }

  /**
   * معالجة أخطاء من عملية غير متزامنة مع حماية
   */
  const handleAsyncError = async <T>(
    asyncFn: () => Promise<T>,
    fallback?: T,
    options?: ErrorHandlerOptions
  ): Promise<T | undefined> => {
    try {
      return await asyncFn()
    } catch (error) {
      handleError(error, options)
      return fallback
    }
  }

  /**
   * معالجة أخطاء مع إعادة المحاولة التلقائية
   */
  const handleErrorWithRetry = async <T>(
    asyncFn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    context?: string
  ): Promise<T> => {
    let lastError: Error
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await asyncFn()
      } catch (error) {
        lastError = error as Error
        
        if (attempt === maxRetries) {
          // فشلت جميع المحاولات
          handleError(lastError, {
            context: `${context} (المحاولة ${attempt}/${maxRetries})`,
            showSnackbar: true,
            logToConsole: true
          })
          throw lastError
        }
        
        // انتظار قبل إعادة المحاولة
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
        
        // عرض تحذير للمستخدم
        showWarning(`إعادة المحاولة ${attempt}/${maxRetries}...`, { timeout: 2000 })
      }
    }
    
    throw lastError!
  }

  /**
   * إنشاء خطأ مخصص
   */
  const createCustomError = (
    message: string,
    statusCode?: number,
    context?: string
  ) => {
    const error = new Error(message) as any
    error.statusCode = statusCode
    error.context = context
    return error
  }

  /**
   * التحقق من أنواع الأخطاء المختلفة
   */
  const isNetworkError = (error: any): boolean => {
    return getErrorType(error) === 'network'
  }
  
  const isAuthError = (error: any): boolean => {
    return getErrorType(error) === 'auth'
  }
  
  const isValidationError = (error: any): boolean => {
    return getErrorType(error) === 'validation'
  }

  /**
   * رسائل إيجابية سريعة
   */
  const showSuccessMessage = (message: string) => {
    showSuccess(message, { timeout: 3000 })
  }

  const showWarningMessage = (message: string) => {
    showWarning(message, { timeout: 4000 })
  }

  const showInfoMessage = (message: string) => {
    showInfo(message, { timeout: 3000 })
  }

  return {
    // المعالج الرئيسي الذكي
    handleError,
    
    // معالجات محددة
    handleAuthError,
    handleValidationError,
    handleNetworkError,
    handleServerError,
    handleClientError,
    handleApiError,
    
    // معالجات متقدمة
    handleAsyncError,
    handleErrorWithRetry,
    
    // مساعدات
    createCustomError,
    getErrorType,
    
    // فحص الأنواع
    isNetworkError,
    isAuthError,
    isValidationError,
    
    // رسائل سريعة
    showSuccessMessage,
    showWarningMessage,
    showInfoMessage
  }
}