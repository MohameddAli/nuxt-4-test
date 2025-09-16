import { useAuthStore } from '~/stores/auth'

/**
 * Guest middleware - redirects authenticated users away from guest-only pages
 * Usage: Add `middleware: ['guest']` to page meta for login, register pages
 */
export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  // Skip on server side
  if (process.server) {
    return
  }

  // Initialize auth if not done already
  if (!authStore.isInitialized) {
    authStore.initAuth()
  }

  // If user is authenticated, redirect to dashboard
  if (authStore.isAuthenticated) {
    // Check for stored redirect URL
    let redirectUrl = '/dashboard'
    
    if (process.client) {
      const storedRedirect = localStorage.getItem('auth_redirect_url')
      if (storedRedirect) {
        redirectUrl = storedRedirect
        localStorage.removeItem('auth_redirect_url')
      }
    }

    return navigateTo(redirectUrl)
  }
})