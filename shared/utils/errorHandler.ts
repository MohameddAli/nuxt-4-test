/**
 * Advanced Error Message Extraction Utility
 * يدعم جميع أنواع استجابات السيرفر المختلفة
 */

export interface ErrorExtractOptions {
  /** رسالة افتراضية في حالة عدم وجود رسالة من السيرفر */
  fallbackMessage?: string
  /** هل تريد عرض التفاصيل الفرعية (مثل validation errors) */
  includeDetails?: boolean
  /** الحد الأقصى لعدد الرسائل الفرعية */
  maxDetails?: number
  /** فصل الرسائل المتعددة بـ */
  separator?: string
}


/**
 * التحقق مما إذا كان الخطأ ناتجًا عن فقدان الاتصال بالشبكة أو الخادم
 */
const isNetworkError = (err: any): boolean => {
  // axios: err.code === 'ERR_NETWORK' أو !err.response
  if (!err) return false
  const message: string = err.message || ''
  const networkPatterns = ['Network Error', 'Failed to fetch', 'timeout', 'ECONNREFUSED', 'ERR_NETWORK', 'ERR_CONNECTION', 'ECONNABORTED']
  const matchedByMsg = networkPatterns.some(pat => message.toLowerCase().includes(pat.toLowerCase()))
  const noResponse = typeof err === 'object' && !err.response && err.request
  return matchedByMsg || noResponse
}

/**
 * استخراج رسالة الخطأ الرئيسية من استجابة السيرفر
 * @param error - كائن الخطأ من API
 * @param options - خيارات الاستخراج
 * @returns رسالة الخطأ المستخرجة
 */
export const extractErrorMessage = (
  error: any, 
  options: ErrorExtractOptions = {}
): string => {
  const {
    fallbackMessage = 'حدث خطأ غير متوقع',
    includeDetails = false,
    maxDetails = 3,
    separator = ' • '
  } = options

  // 1. التحقق من وجود الخطأ أساساً
  if (!error) return fallbackMessage

  // 1.1 التحقق من أخطاء الشبكة (انقطاع الاتصال أو فشل الطلب)
  if (isNetworkError(error)) {
    return 'تعذر الاتصال بالخادم، يرجى التحقق من الاتصال بالإنترنت أو المحاولة لاحقًا'
  }

  // 2. استخراج البيانات من مستويات مختلفة
  const errorData = error?.data || error?.response?.data || error

  // 3. البحث عن الرسالة الرئيسية
  let mainMessage = ''
  
  // أولوية البحث: message > error > statusText
  if (errorData?.message) {
    if (typeof errorData.message === 'string') {
      mainMessage = errorData.message
    } else if (typeof errorData.message === 'object') {
      // معالجة الكائنات المعقدة
      mainMessage = extractFromNestedObject(errorData.message, includeDetails, maxDetails, separator)
    }
  } else if (errorData?.error) {
    if (typeof errorData.error === 'string') {
      mainMessage = errorData.error
    } else if (typeof errorData.error === 'object') {
      mainMessage = extractFromNestedObject(errorData.error, includeDetails, maxDetails, separator)
    }
  } else if (error?.message) {
    mainMessage = error.message
  } else if (error?.statusText) {
    mainMessage = error.statusText
  }

  // 4. إضافة التفاصيل الإضافية إذا كانت مطلوبة
  if (includeDetails && mainMessage) {
    const details = extractAdditionalDetails(errorData, maxDetails, separator)
    if (details) {
      mainMessage += ` (${details})`
    }
  }

  return mainMessage || fallbackMessage
}

/**
 * استخراج الرسائل من الكائنات المتداخلة
 */
const extractFromNestedObject = (
  obj: any, 
  includeDetails: boolean, 
  maxDetails: number, 
  separator: string
): string => {
  if (!obj || typeof obj !== 'object') return ''

  const messages: string[] = []

  // البحث في الخصائص الشائعة
  const commonFields = ['user', 'email', 'password', 'username', 'name', 'phone', 'validation']
  
  for (const field of commonFields) {
    if (obj[field]) {
      if (typeof obj[field] === 'string') {
        messages.push(obj[field])
      } else if (Array.isArray(obj[field])) {
        messages.push(...obj[field].slice(0, maxDetails))
      }
    }
  }

  // إذا لم نجد في الحقول الشائعة، نبحث في جميع الخصائص
  if (messages.length === 0) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        messages.push(value)
      } else if (Array.isArray(value) && value.length > 0) {
        messages.push(...value.slice(0, maxDetails).filter(v => typeof v === 'string'))
      }
      
      if (messages.length >= maxDetails) break
    }
  }

  return messages.slice(0, maxDetails).join(separator)
}

/**
 * استخراج التفاصيل الإضافية من استجابة الخطأ
 */
const extractAdditionalDetails = (
  errorData: any,
  maxDetails: number,
  separator: string
): string => {
  const details: string[] = []

  // البحث عن تفاصيل validation
  if (errorData?.validation && typeof errorData.validation === 'object') {
    const validationErrors = extractFromNestedObject(errorData.validation, true, maxDetails, separator)
    if (validationErrors) details.push(validationErrors)
  }

  // البحث عن errors array
  if (Array.isArray(errorData?.errors)) {
    const errorMessages = errorData.errors
      .slice(0, maxDetails)
      .filter((err: any) => typeof err === 'string' || err?.message)
      .map((err: any) => typeof err === 'string' ? err : err.message)
    details.push(...errorMessages)
  }

  // البحث عن تفاصيل إضافية
  if (errorData?.details && typeof errorData.details === 'string') {
    details.push(errorData.details)
  }

  return details.slice(0, maxDetails).join(separator)
}

/**
 * تحديد نوع الخطأ وإرجاع معلومات إضافية
 */
export const getErrorType = (error: any): {
  type: 'validation' | 'authentication' | 'authorization' | 'server' | 'network' | 'unknown'
  canRetry: boolean
  statusCode?: number
} => {
  const status = error?.status || error?.statusCode || error?.response?.status

  if (status === 400) {
    return { type: 'validation', canRetry: false, statusCode: status }
  } else if (status === 401) {
    return { type: 'authentication', canRetry: false, statusCode: status }
  } else if (status === 403) {
    return { type: 'authorization', canRetry: false, statusCode: status }
  } else if (status >= 500) {
    return { type: 'server', canRetry: true, statusCode: status }
  } else if (!status || status === 0) {
    return { type: 'network', canRetry: true }
  } else {
    return { type: 'unknown', canRetry: false, statusCode: status }
  }
}

/**
 * إنشاء رسالة خطأ متكاملة مع السياق
 */
export const createContextualErrorMessage = (
  error: any,
  context: string,
  options: ErrorExtractOptions = {}
): {
  message: string
  details?: string
  type: string
  canRetry: boolean
} => {
  const extractedMessage = extractErrorMessage(error, options)
  const errorInfo = getErrorType(error)
  
  // إضافة السياق إذا لم تكن الرسالة واضحة
  let contextualMessage = extractedMessage
  if (!extractedMessage.includes(context) && extractedMessage === options.fallbackMessage) {
    contextualMessage = `خطأ في ${context}: ${extractedMessage}`
  }

  return {
    message: contextualMessage,
    details: options.includeDetails ? extractAdditionalDetails(error?.data || error, 3, ' • ') : undefined,
    type: errorInfo.type,
    canRetry: errorInfo.canRetry
  }
}

/**
 * أمثلة على الاستخدام:
 * 
 * // استخدام بسيط
 * const message = extractErrorMessage(error)
 * 
 * // مع خيارات متقدمة
 * const message = extractErrorMessage(error, {
 *   fallbackMessage: 'فشل في تسجيل الدخول',
 *   includeDetails: true,
 *   maxDetails: 2,
 *   separator: ' | '
 * })
 * 
 * // مع السياق
 * const { message, canRetry } = createContextualErrorMessage(error, 'تسجيل الدخول', {
 *   includeDetails: true
 * })
 */