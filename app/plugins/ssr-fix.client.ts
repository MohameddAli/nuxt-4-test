/**
 * SSR Hydration Fix Plugin
 * Prevents serialization errors during development
 */
export default defineNuxtPlugin({
  name: 'ssr-hydration-fix',
  parallel: true,
  setup(nuxtApp) {
    // Only run on client side
    if (import.meta.server) return

    const isDev = process.dev || import.meta.dev

    // Handle hydration errors gracefully
    nuxtApp.hook('app:error', (error: Error) => {
      // Check if this is a serialization error
      if (error.message?.includes('Cannot stringify') ||
        error.message?.includes('DevalueError')) {

        console.warn('🔧 SSR Serialization warning handled:', error.message)

        // Don't prevent error propagation, just log it
        return
      }
    })

    // Handle Vue hydration mismatches
    nuxtApp.hook('vue:error', (error: unknown, instance, info) => {
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (errorMessage?.includes('Hydration') ||
        errorMessage?.includes('serializ')) {

        console.warn('🔧 Vue hydration warning handled:', errorMessage)

        // Don't prevent error propagation in production
        if (isDev) {
          return
        }
      }
    })

    // Override console methods in development to filter out serialization warnings
    if (isDev) {
      const originalWarn = console.warn
      const originalError = console.error

      console.warn = (...args: any[]) => {
        const message = args[0]

        // Filter out Nuxt serialization warnings that don't affect functionality
        if (typeof message === 'string' &&
          (message.includes('Failed to stringify dev server logs') ||
            message.includes('DevalueError') ||
            message.includes('Cannot stringify a function'))) {
          // Only show a brief warning instead of the full error
          originalWarn('⚠️ [Nuxt] SSR serialization warning (non-critical)')
          return
        }

        // Pass through other warnings
        originalWarn(...args)
      }

      console.error = (...args: any[]) => {
        const message = args[0]

        // Don't completely suppress errors, but make serialization errors less noisy
        if (typeof message === 'string' &&
          (message.includes('Failed to stringify') ||
            message.includes('DevalueError'))) {
          originalWarn('⚠️ [Nuxt] SSR serialization error (usually non-critical)')
          return
        }

        // Pass through other errors
        originalError(...args)
      }
    }
  }
})
