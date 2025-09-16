import { defineStore } from 'pinia'
import type { 
  User, 
  AuthState, 
  LoginCredentials, 
  RegisterData,
  AuthResponse,
  UpdateProfileData,
  ChangePasswordData,
  Permission,
  Role 
} from '~/shared/types/auth'
import { extractErrorMessage } from '../../shared/utils/errorHandler'

export const useAuthStore = defineStore('auth', () => {
  // State - using refs for reactivity
  const token = ref<string | null>(null)
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)

  // Getters - using computed for reactive getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const currentUser = computed(() => user.value)
  
  // Permission checking getters
  const hasPermission = computed(() => (permission: Permission | string) => {
    return user.value?.permissions?.includes(permission) || false
  })
  
  const hasRole = computed(() => (role: Role | string) => {
    return user.value?.roles?.includes(role) || false
  })
  
  const hasAllPermissions = computed(() => (permissions: (Permission | string)[]) => {
    if (!user.value?.permissions) return false
    return permissions.every(permission => 
      user.value?.permissions?.includes(permission)
    )
  })
  
  const hasAnyPermission = computed(() => (permissions: (Permission | string)[]) => {
    if (!user.value?.permissions) return false
    return permissions.some(permission => 
      user.value?.permissions?.includes(permission)
    )
  })
  
  const getUserInfo = computed(() => {
    if (!user.value) return null
    return {
      id: user.value.id,
      name: user.value.name,
      username: user.value.username,
      email: user.value.email,
      phone: user.value.phone,
      avatar: user.value.avatar,
      permissions: user.value.permissions || [],
      roles: user.value.roles || [],
      group: user.value.group
    }
  })

  // Actions
  const initAuth = () => {
    if (process.client && !isInitialized.value) {
      try {
        const storedToken = localStorage.getItem('auth_token')
        const storedUser = localStorage.getItem('auth_user')

        if (storedToken && storedUser) {
          token.value = storedToken
          user.value = JSON.parse(storedUser)
        } else if (storedToken) {
          // Token exists but no user data, clear everything
          clearAuth()
        }
      } catch (err) {
        console.error('Failed to initialize auth from localStorage:', err)
        clearAuth()
      } finally {
        isInitialized.value = true
      }
    }
  }

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    loading.value = true
    error.value = null

    try {
      const { post } = useApi()
      const response = await post<AuthResponse>('/auth/login', credentials)

      if (!response.token || !response.user) {
        throw new Error('Invalid response from server')
      }

      token.value = response.token
      user.value = response.user

      // Store in localStorage
      if (process.client) {
        localStorage.setItem('auth_token', response.token)
        localStorage.setItem('auth_user', JSON.stringify(response.user))
      }

      return response
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err, {
        fallbackMessage: 'فشل في تسجيل الدخول',
        includeDetails: false
      })
      
      error.value = errorMessage
      clearAuth()
      throw err
    } finally {
      loading.value = false
    }
  }

  const register = async (userData: RegisterData): Promise<AuthResponse> => {
    loading.value = true
    error.value = null

    try {
      const { post } = useApi()
      const response = await post<AuthResponse>('/auth/register', userData)

      if (!response.token || !response.user) {
        throw new Error('Invalid response from server')
      }

      token.value = response.token
      user.value = response.user

      // Store in localStorage
      if (process.client) {
        localStorage.setItem('auth_token', response.token)
        localStorage.setItem('auth_user', JSON.stringify(response.user))
      }

      return response
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err, {
        fallbackMessage: 'فشل في إنشاء الحساب',
        includeDetails: false
      })
      
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true

    try {
      // Attempt to logout on server
      const { post } = useApi()
      await post('/auth/logout')
    } catch (err) {
      console.warn('Server logout failed:', err)
    } finally {
      clearAuth()
      loading.value = false
      
      // Navigate to login page
      if (process.client) {
        await navigateTo('/login')
      }
    }
  }

  const clearAuth = () => {
    token.value = null
    user.value = null
    error.value = null
    isInitialized.value = false

    if (process.client) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      localStorage.removeItem('token_last_validation')
      localStorage.removeItem('auth_redirect_url')
    }
  }

  const refreshUser = async (): Promise<User | undefined> => {
    if (!token.value) return

    try {
      const { get } = useApi()
      const { data: response } = await get<{user: User}>('/auth/me')
      
      if (response.value?.user) {
        user.value = response.value.user
        
        if (process.client) {
          localStorage.setItem('auth_user', JSON.stringify(response.value.user))
        }
        
        return response.value.user
      }
    } catch (err) {
      console.error('Failed to refresh user data:', err)
      clearAuth()
      throw err
    }
  }

  const validateToken = async (): Promise<boolean> => {
    if (!token.value) return false

    try {
      const { get } = useApi()
      await get('/auth/validate')
      return true
    } catch (err) {
      console.warn('Token validation failed:', err)
      clearAuth()
      return false
    }
  }

  const updateProfile = async (profileData: UpdateProfileData): Promise<User> => {
    loading.value = true
    
    try {
      const { put } = useApi()
      const response = await put<{user: User}>('/auth/profile', profileData)
      
      if (response?.user) {
        user.value = response.user
        
        if (process.client) {
          localStorage.setItem('auth_user', JSON.stringify(response.user))
        }
        
        return response.user
      }
      
      throw new Error('Failed to update profile')
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err, {
        fallbackMessage: 'فشل في تحديث الملف الشخصي',
        includeDetails: false
      })
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (passwordData: ChangePasswordData): Promise<void> => {
    loading.value = true
    error.value = null
    
    try {
      const { post } = useApi()
      await post('/auth/change-password', passwordData)
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err, {
        fallbackMessage: 'فشل في تغيير كلمة المرور',
        includeDetails: false
      })
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  const resetPassword = async (email: string): Promise<void> => {
    loading.value = true
    error.value = null
    
    try {
      const { post } = useApi()
      await post('/auth/reset-password', { email })
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err, {
        fallbackMessage: 'فشل في إرسال رابط إعادة تعيين كلمة المرور',
        includeDetails: false
      })
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  // Auto-initialize when store is created
  if (process.client) {
    initAuth()
  }

  return {
    // State
    token: readonly(token),
    user: readonly(user),
    loading: readonly(loading),
    error: readonly(error),
    isInitialized: readonly(isInitialized),
    
    // Getters
    isAuthenticated,
    currentUser,
    hasPermission,
    hasRole,
    hasAllPermissions,
    hasAnyPermission,
    getUserInfo,
    
    // Actions
    initAuth,
    login,
    register,
    logout,
    clearAuth,
    refreshUser,
    validateToken,
    updateProfile,
    changePassword,
    resetPassword
  }
})