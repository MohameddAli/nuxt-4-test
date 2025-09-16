/**
 * Authentication middleware - protects routes that require authentication
 * Usage: Add `middleware: ['auth']` to page meta or use it globally
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { $i18n } = useNuxtApp()
  const authStore = useAuthStore()

  // Skip auth check for login page and other public routes
  const publicRoutes = ['/login', '/register', '/', '/unauthorized']
  if (publicRoutes.includes(to.path)) {
    return
  }

  // Initialize auth if not done already
  if (!authStore.isInitialized) {
    authStore.initAuth()
  }

  // On server side, we can't access localStorage, so redirect to unauthorized
  if (process.server) {
    return navigateTo('/unauthorized')
  }

  // Wait a tick for auth initialization to complete on client
  if (process.client && !authStore.isInitialized) {
    await nextTick()
  }

  // Client-side authentication check
  if (!authStore.isAuthenticated) {
    // Store the intended destination for redirect after login
    if (process.client && to.path !== '/login' && to.path !== '/unauthorized') {
      localStorage.setItem('auth_redirect_url', to.fullPath)
    }
    
    // Use snackbar to show message if available
    try {
      const { showError } = useSnackbar()
      const message = $i18n?.t('auth.loginRequired') || 'يرجى تسجيل الدخول للوصول إلى هذه الصفحة'
      showError(message)
    } catch (e) {
      // Fallback if snackbar is not available
      console.warn('Authentication required for this page')
    }
    
    return navigateTo('/login')
  }

  // Optional: Validate token periodically (every 5 minutes)
  if (process.client && authStore.isAuthenticated) {
    const lastValidation = localStorage.getItem('token_last_validation')
    const now = Date.now()
    const validationInterval = 5 * 60 * 1000 // 5 minutes

    if (!lastValidation || (now - parseInt(lastValidation)) > validationInterval) {
      // Validate token in background
      authStore.validateToken().then((isValid) => {
        if (isValid) {
          localStorage.setItem('token_last_validation', now.toString())
        } else {
          // Token is invalid, user will be redirected to login
          console.warn('Token validation failed, redirecting to login')
        }
      }).catch((error) => {
        console.error('Token validation error:', error)
      })
    }
  }
})