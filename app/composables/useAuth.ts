import type { 
  LoginCredentials, 
  RegisterData, 
  UpdateProfileData, 
  ChangePasswordData,
  Permission,
  Role,
  AccessConfig
} from '~/shared/types/auth'

/**
 * Authentication composable for easy access to auth state and methods
 * This provides a reactive interface to the auth store
 */
export const useAuth = () => {
  const authStore = useAuthStore()

  // Reactive computed properties
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const currentUser = computed(() => authStore.currentUser)
  const loading = computed(() => authStore.loading)
  const error = computed(() => authStore.error)
  const userInfo = computed(() => authStore.getUserInfo)
  const isInitialized = computed(() => authStore.isInitialized)

  // Permission checking functions
  const hasPermission = (permission: Permission | string) => {
    return authStore.hasPermission(permission)
  }

  const hasRole = (role: Role | string) => {
    return authStore.hasRole(role)
  }

  const hasAllPermissions = (permissions: (Permission | string)[]) => {
    return authStore.hasAllPermissions(permissions)
  }

  const hasAnyPermission = (permissions: (Permission | string)[]) => {
    return authStore.hasAnyPermission(permissions)
  }

  // Check if user can access a specific route/feature
  const canAccess = (config: AccessConfig): boolean => {
    const { 
      permission, 
      permissions, 
      role, 
      roles, 
      mode = 'all',
      requireAuth = true 
    } = config

    // If authentication is required and user is not authenticated
    if (requireAuth && !authStore.isAuthenticated) {
      return false
    }

    // Check single permission
    if (permission && !hasPermission(permission)) {
      return false
    }

    // Check single role
    if (role && !hasRole(role)) {
      return false
    }

    // Check multiple permissions
    if (permissions && permissions.length > 0) {
      if (mode === 'all') {
        return hasAllPermissions(permissions)
      } else {
        return hasAnyPermission(permissions)
      }
    }

    // Check multiple roles
    if (roles && roles.length > 0) {
      if (mode === 'all') {
        return roles.every(r => hasRole(r))
      } else {
        return roles.some(r => hasRole(r))
      }
    }

    return true
  }

  // Enhanced login function
  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authStore.login(credentials)
      
      // Check for saved redirect URL
      if (process.client) {
        const redirectUrl = localStorage.getItem('auth_redirect_url')
        if (redirectUrl) {
          localStorage.removeItem('auth_redirect_url')
          await navigateTo(redirectUrl)
        } else {
          await navigateTo('/dashboard')
        }
      }
      
      return response
    } catch (error) {
      throw error
    }
  }

  // Enhanced register function
  const register = async (userData: RegisterData) => {
    try {
      const response = await authStore.register(userData)
      
      // Navigate to dashboard after successful registration
      if (process.client) {
        await navigateTo('/dashboard')
      }
      
      return response
    } catch (error) {
      throw error
    }
  }

  // Direct access to store actions
  const {
    logout,
    refreshUser,
    validateToken,
    updateProfile,
    changePassword,
    resetPassword,
    clearAuth
  } = authStore

  return {
    // State
    isAuthenticated,
    currentUser,
    loading,
    error,
    userInfo,
    isInitialized,

    // Permission checking
    hasPermission,
    hasRole,
    hasAllPermissions,
    hasAnyPermission,
    canAccess,

    // Enhanced actions
    login,
    register,
    
    // Direct store actions
    logout,
    refreshUser,
    validateToken,
    updateProfile,
    changePassword,
    resetPassword,
    clearAuth
  }
}

/**
 * Template helper for permissions - used in components
 */
export const usePermissions = () => {
  const { 
    hasPermission, 
    hasRole, 
    hasAllPermissions, 
    hasAnyPermission, 
    canAccess 
  } = useAuth()
  
  return {
    can: hasPermission,
    hasRole,
    canAll: hasAllPermissions,
    canAny: hasAnyPermission,
    canAccess
  }
}