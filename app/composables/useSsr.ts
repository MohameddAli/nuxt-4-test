/**
 * SSR-Safe utilities composable
 * Provides utilities to handle client/server differences safely
 */
export const useSsr = () => {
  /**
   * Check if we're running on the client side
   */
  const isClient = computed(() => import.meta.client)

  /**
   * Check if we're running on the server side
   */
  const isServer = computed(() => import.meta.server)

  /**
   * Execute a function only on the client side
   * @param fn Function to execute
   * @param fallback Optional fallback value for server side
   */
  const clientOnly = <T, F = undefined>(
    fn: () => T,
    fallback?: F
  ): F extends undefined ? T | undefined : T | F => {
    if (import.meta.client) {
      try {
        return fn() as any
      } catch (error) {
        console.warn('Client-only function failed:', error)
        return fallback as any
      }
    }
    return fallback as any
  }

  /**
   * Safe localStorage access
   */
  const safeLocalStorage = {
    getItem: (key: string): string | null => {
      return clientOnly(() => localStorage.getItem(key), null)
    },

    setItem: (key: string, value: string): void => {
      clientOnly(() => localStorage.setItem(key, value))
    },

    removeItem: (key: string): void => {
      clientOnly(() => localStorage.removeItem(key))
    }
  }

  /**
   * Safe document access
   */
  const safeDocument = {
    querySelector: (selector: string) => {
      return clientOnly(() => document.querySelector(selector), null)
    },

    getAttribute: (selector: string, attribute: string) => {
      return clientOnly(() => {
        const element = document.querySelector(selector)
        return element?.getAttribute(attribute) || null
      }, null)
    },

    setAttribute: (selector: string, attribute: string, value: string) => {
      clientOnly(() => {
        const element = document.querySelector(selector)
        if (element) {
          element.setAttribute(attribute, value)
        }
      })
    }
  }

  /**
   * Safe window access
   */
  const safeWindow = {
    location: computed(() => {
      return clientOnly(() => window.location, null)
    }),

    scrollTo: (options: ScrollToOptions) => {
      clientOnly(() => window.scrollTo(options))
    }
  }

  return {
    isClient,
    isServer,
    clientOnly,
    safeLocalStorage,
    safeDocument,
    safeWindow
  }
}
