import { useAuthStore } from '~/stores/auth'
import { useSnackbar } from '~/composables/useSnackbar'

/**
 * Handle API errors globally with smart redirect strategy
 * Only handles system-level errors (401, 403, 500+)
 * Business logic errors (400) are handled by components
 */
const handleApiError = async (error: any) => {
  // تشغيل فقط على العميل
  if (!process.client) return
  
  const { showError, showWarning } = useSnackbar()
  const authStore = useAuthStore()
  const route = useRoute()
  
  // Handle 401 - Token expired (system level) with smart redirect
  if (error?.status === 401 || error?.statusCode === 401) {
    // Save current page for redirect after login
    if (route.path !== '/login' && route.path !== '/unauthorized') {
      localStorage.setItem('auth_redirect_url', route.fullPath)
    }
    
    authStore.clearAuth()
    
    // Smart redirect based on context - simple & clear
    const isAdminArea = route.path.includes('/admin')
    const isCriticalArea = route.path.includes('/financial') || route.path.includes('/settings')
    
    if (isAdminArea || isCriticalArea) {
      // For critical areas, redirect directly to login
      showError('انتهت صلاحية الجلسة - جاري التوجيه لتسجيل الدخول')
      setTimeout(() => navigateTo('/login'), 800)
    } else {
      // For general areas, use friendly unauthorized page
      showWarning('انتهت صلاحية جلستك، يرجى تسجيل الدخول مرة أخرى')
      navigateTo('/unauthorized')
    }
    return
  }
  
  // Handle 403 - Access Denied (system level)
  if (error?.status === 403 || error?.statusCode === 403) {
    const message = error?.data?.message || 'ليس لديك صلاحية للوصول إلى هذا المورد'
    
    if (authStore.isAuthenticated) {
      // User is logged in but doesn't have permission
      showError(message)
      navigateTo('/unauthorized')
    } else {
      // User is not logged in - treat as 401
      showWarning('يجب تسجيل الدخول أولاً')
      navigateTo('/unauthorized')
    }
    return
  }
  
  // Network error (no response / failed to fetch)
  try {
    // Lazy import to avoid circular deps
    const { getErrorType } = await import('../../shared/utils/errorHandler')
    const errorInfo = getErrorType(error)
    if (errorInfo.type === 'network') {
      showError('تعذر الاتصال بالخادم، يرجى التحقق من الاتصال بالإنترنت أو المحاولة لاحقًا')
      return
    }
  } catch (_) {
    // ignore import errors
  }

  // Handle server errors 500+ (system level)
  if ((error?.status >= 500 || error?.statusCode >= 500)) {
    showError('خطأ في الخادم، يرجى المحاولة لاحقاً')
    return
  }
  
  // 400 errors are handled by individual components
  // No global handling for business logic errors
}

/**
 * Get authorization headers
 */
const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
  
  // Only add token on client side
  if (process.client) {
    const token = localStorage.getItem('auth_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  
  return headers
}

/**
 * Unified API composable for data fetching
 */
export const useApi = () => {
  const config = useRuntimeConfig()

  /**
   * GET requests using useFetch (with SSR support)
   */
  const get = async <T = any>(endpoint: string, options: any = {}) => {
    return await useFetch<T>(endpoint, {
      baseURL: config.public.apiBaseUrl as string,
      headers: getAuthHeaders(),
      server: options.server ?? true,
      lazy: options.lazy ?? false,
      onResponseError({ response }) {
        handleApiError(response)
      }
    })
  }

  /**
   * POST requests using $fetch
   */
  const post = async <T = any>(endpoint: string, body?: any) => {
    try {
      return await $fetch<T>(endpoint, {
        baseURL: config.public.apiBaseUrl as string,
        method: 'POST',
        headers: getAuthHeaders(),
        body
      })
    } catch (error) {
      await handleApiError(error)
      throw error
    }
  }

  /**
   * PUT requests using $fetch
   */
  const put = async <T = any>(endpoint: string, body?: any) => {
    try {
      return await $fetch<T>(endpoint, {
        baseURL: config.public.apiBaseUrl as string,
        method: 'PUT',
        headers: getAuthHeaders(),
        body
      })
    } catch (error) {
      await handleApiError(error)
      throw error
    }
  }

  /**
   * PATCH requests using $fetch
   */
  const patch = async <T = any>(endpoint: string, body?: any) => {
    try {
      return await $fetch<T>(endpoint, {
        baseURL: config.public.apiBaseUrl as string,
        method: 'PATCH',
        headers: getAuthHeaders(),
        body
      })
    } catch (error) {
      await handleApiError(error)
      throw error
    }
  }

  /**
   * DELETE requests using $fetch
   */
  const del = async <T = any>(endpoint: string) => {
    try {
      return await $fetch<T>(endpoint, {
        baseURL: config.public.apiBaseUrl as string,
        method: 'DELETE',
        headers: getAuthHeaders()
      })
    } catch (error) {
      await handleApiError(error)
      throw error
    }
  }

  return {
    get,
    post,
    put,
    patch,
    delete: del
  }
}

/**
 * Fetch data using GET method with useFetch
 * Best for: Initial data loading, SSR data, reactive data
 */
export const useFetchData = <T = any>(endpoint: string, options: {
  server?: boolean
  lazy?: boolean
  default?: () => T
  transform?: (data: any) => T
} = {}) => {
  const { get } = useApi()
  return get<T>(endpoint, options)
}

/**
 * Mutation composable for POST/PUT/PATCH/DELETE operations
 * Best for: Form submissions, data mutations, client-side operations
 */
export const useMutation = () => {
  const api = useApi()
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const mutate = async <T = any>(
    method: 'post' | 'put' | 'patch' | 'delete',
    endpoint: string,
    data?: any
  ): Promise<T | null> => {
    try {
      loading.value = true
      error.value = null
      
      let result: T
      switch (method) {
        case 'post':
          result = await api.post<T>(endpoint, data)
          break
        case 'put':
          result = await api.put<T>(endpoint, data)
          break
        case 'delete':
          result = await api.delete<T>(endpoint)
          break
        case 'patch':
          result = await api.patch<T>(endpoint, data)
          break
        default:
          throw new Error(`Unsupported method: ${method}`)
      }
      
      return result
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    mutate,
    loading: readonly(loading),
    error: readonly(error)
  }
} 