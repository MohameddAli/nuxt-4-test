/**
 * Auth initialization plugin
 * This plugin runs on both client and server side to initialize authentication state
 */
export default defineNuxtPlugin({
  name: 'auth-init',
  async setup() {
    // Only run on client side for localStorage access
    if (process.client) {
      const authStore = useAuthStore()
      
      // Initialize auth from localStorage if not already done
      if (!authStore.isInitialized) {
        authStore.initAuth()
      }
      
      // Optional: Validate token on app start if user appears authenticated
      if (authStore.isAuthenticated && authStore.token) {
        try {
          // Validate token in background to ensure it's still valid
          const isValid = await authStore.validateToken()
          
          if (!isValid) {
            console.warn('Stored token is invalid, clearing auth state')
            authStore.clearAuth()
          } else {
            // Refresh user data to get latest info
            await authStore.refreshUser().catch(() => {
              console.warn('Failed to refresh user data on startup')
            })
          }
        } catch (error) {
          console.error('Auth initialization error:', error)
          // Clear auth on any initialization error
          authStore.clearAuth()
        }
      }
    }
  }
})