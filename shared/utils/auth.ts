/**
 * Authentication utilities for token management and validation
 */

// Token storage keys
export const AUTH_STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
  REDIRECT_URL: 'auth_redirect_url',
  LAST_VALIDATION: 'token_last_validation'
} as const

// Token validation interval (5 minutes)
export const TOKEN_VALIDATION_INTERVAL = 5 * 60 * 1000

/**
 * Check if we should validate token based on last validation time
 */
export function shouldValidateToken(): boolean {
  if (!process.client) return false
  
  const lastValidation = localStorage.getItem(AUTH_STORAGE_KEYS.LAST_VALIDATION)
  if (!lastValidation) return true
  
  const now = Date.now()
  const validationAge = now - parseInt(lastValidation)
  
  return validationAge > TOKEN_VALIDATION_INTERVAL
}

/**
 * Update last validation timestamp
 */
export function updateValidationTimestamp(): void {
  if (process.client) {
    localStorage.setItem(AUTH_STORAGE_KEYS.LAST_VALIDATION, Date.now().toString())
  }
}

/**
 * Get redirect URL and clear it from storage
 */
export function getAndClearRedirectUrl(): string {
  if (!process.client) return '/dashboard'
  
  const redirectUrl = localStorage.getItem(AUTH_STORAGE_KEYS.REDIRECT_URL)
  if (redirectUrl) {
    localStorage.removeItem(AUTH_STORAGE_KEYS.REDIRECT_URL)
    return redirectUrl
  }
  
  return '/dashboard'
}

/**
 * Save redirect URL for after login
 */
export function saveRedirectUrl(url: string): void {
  if (process.client && url !== '/login' && url !== '/unauthorized') {
    localStorage.setItem(AUTH_STORAGE_KEYS.REDIRECT_URL, url)
  }
}

/**
 * Clear all auth-related storage
 */
export function clearAuthStorage(): void {
  if (!process.client) return
  
  Object.values(AUTH_STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key)
  })
}

/**
 * Simple token decoder for basic token info (for our mock tokens)
 */
export function decodeToken(token: string): { userId?: number; timestamp?: number } | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
    return decoded
  } catch {
    return null
  }
}

/**
 * Check if token is expired (for our mock tokens)
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.timestamp) return true
  
  const maxAge = 24 * 60 * 60 * 1000 // 24 hours
  const tokenAge = Date.now() - decoded.timestamp
  
  return tokenAge > maxAge
}

/**
 * Auth route configuration helper
 */
export function isPublicRoute(path: string): boolean {
  const publicRoutes = ['/', '/login', '/register', '/unauthorized', '/forgot-password']
  return publicRoutes.includes(path) || path.startsWith('/public/')
}

/**
 * Check if route requires authentication
 */
export function requiresAuth(path: string): boolean {
  return !isPublicRoute(path)
}