import type { NetworkStatus, RetryConfig } from '~/shared/types/notifications'

/**
 * Enhanced Network Status Composable
 * Provides comprehensive network monitoring and retry logic
 */
export const useNetworkStatus = () => {
  const { $i18n } = useNuxtApp()
  const { showWarning, showInfo, showError } = useSnackbar()

  // Network status state
  const networkStatus = ref<NetworkStatus>({
    isOnline: true,
    isConnecting: false,
    retryCount: 0,
    maxRetries: 3,
    connectionQuality: 'unknown'
  })

  // Retry configuration
  const retryConfig = ref<RetryConfig>({
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2,
    maxRetryDelay: 10000
  })

  // Connection quality check
  const checkConnectionQuality = async (): Promise<'slow' | 'fast' | 'unknown'> => {
    if (!networkStatus.value.isOnline) return 'unknown'

    try {
      const startTime = performance.now()
      
      // Test with a small request to a reliable endpoint
      await $fetch('/api/health', { 
        timeout: 3000,
        retry: 0
      })
      
      const endTime = performance.now()
      const responseTime = endTime - startTime
      
      return responseTime > 2000 ? 'slow' : 'fast'
    } catch (error) {
      return 'unknown'
    }
  }

  // Update online status
  const updateOnlineStatus = async () => {
    const wasOnline = networkStatus.value.isOnline
    const isOnline = navigator.onLine

    networkStatus.value.isOnline = isOnline

    if (isOnline && !wasOnline) {
      // Just came back online
      networkStatus.value.lastOnline = new Date()
      networkStatus.value.isConnecting = false
      networkStatus.value.retryCount = 0
      
      // Check connection quality
      networkStatus.value.connectionQuality = await checkConnectionQuality()
      
      // Show notification
      const message = $i18n?.t('network.backOnline') || 'تم استعادة الاتصال بالإنترنت'
      showInfo(message, {
        icon: 'mdi-wifi',
        timeout: 2000
      })
    } else if (!isOnline && wasOnline) {
      // Just went offline
      networkStatus.value.lastOffline = new Date()
      networkStatus.value.connectionQuality = 'unknown'
      
      // Show warning
      const message = $i18n?.t('network.offline') || 'انقطع الاتصال بالإنترنت'
      showWarning(message, {
        icon: 'mdi-wifi-off',
        persistent: true,
        priority: 'high'
      })
    }
  }

  // Retry connection with exponential backoff
  const retryConnection = async (
    action: () => Promise<any>,
    config?: Partial<RetryConfig>
  ): Promise<any> => {
    const finalConfig = { ...retryConfig.value, ...config }
    let attempt = 0
    let delay = finalConfig.retryDelay

    const executeWithRetry = async (): Promise<any> => {
      try {
        networkStatus.value.isConnecting = true
        const result = await action()
        
        // Success - reset retry count
        networkStatus.value.retryCount = 0
        networkStatus.value.isConnecting = false
        
        return result
      } catch (error) {
        attempt++
        networkStatus.value.retryCount = attempt

        if (attempt >= finalConfig.maxRetries) {
          networkStatus.value.isConnecting = false
          throw error
        }

        // Show retry notification
        const message = $i18n?.t('network.retrying', { attempt, max: finalConfig.maxRetries }) || 
                       `محاولة ${attempt} من ${finalConfig.maxRetries}`
        
        showWarning(message, {
          timeout: Math.min(delay, 3000),
          icon: 'mdi-refresh'
        })

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay))
        
        // Increase delay for next attempt (exponential backoff)
        delay = Math.min(delay * finalConfig.backoffMultiplier, finalConfig.maxRetryDelay)
        
        return executeWithRetry()
      }
    }

    return executeWithRetry()
  }

  // Monitor connection quality periodically
  const startQualityMonitoring = () => {
    if (!process.client) return

    const interval = setInterval(async () => {
      if (networkStatus.value.isOnline) {
        const quality = await checkConnectionQuality()
        
        if (quality !== networkStatus.value.connectionQuality) {
          networkStatus.value.connectionQuality = quality
          
          // Notify about quality changes
          if (quality === 'slow') {
            const message = $i18n?.t('network.slowConnection') || 'الاتصال بطيء'
            showWarning(message, { timeout: 3000 })
          }
        }
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }

  // Handle page visibility changes
  const handleVisibilityChange = async () => {
    if (document.visibilityState === 'visible' && networkStatus.value.isOnline) {
      // Page became visible, check connection
      networkStatus.value.connectionQuality = await checkConnectionQuality()
    }
  }

  // Auto-retry failed requests when back online
  const createAutoRetryFunction = <T>(
    originalFunction: () => Promise<T>,
    options?: {
      maxRetries?: number
      retryMessage?: string
    }
  ) => {
    return async (): Promise<T> => {
      try {
        return await originalFunction()
      } catch (error) {
        // If we're offline, wait for connection and retry
        if (!networkStatus.value.isOnline) {
          const message = options?.retryMessage || 
                         $i18n?.t('network.willRetryOnline') || 
                         'سيتم إعادة المحاولة عند استعادة الاتصال'
          
          showInfo(message, {
            persistent: true,
            actions: [{
              id: 'cancel-retry',
              label: $i18n?.t('common.cancel') || 'إلغاء',
              handler: () => {
                throw new Error('User cancelled retry')
              }
            }]
          })

          // Wait for online status
          await new Promise<void>((resolve, reject) => {
            const unwatch = watch(() => networkStatus.value.isOnline, (isOnline) => {
              if (isOnline) {
                unwatch()
                resolve()
              }
            })

            // Timeout after 5 minutes
            setTimeout(() => {
              unwatch()
              reject(new Error('Retry timeout'))
            }, 5 * 60 * 1000)
          })

          // Retry the original function
          return retryConnection(originalFunction, {
            maxRetries: options?.maxRetries || 2
          })
        }
        
        throw error
      }
    }
  }

  // Initialize network monitoring
  onMounted(() => {
    if (process.client) {
      // Set initial status
      updateOnlineStatus()

      // Listen to online/offline events
      window.addEventListener('online', updateOnlineStatus)
      window.addEventListener('offline', updateOnlineStatus)
      
      // Listen to visibility changes
      document.addEventListener('visibilitychange', handleVisibilityChange)

      // Start quality monitoring
      const stopQualityMonitoring = startQualityMonitoring()

      // Cleanup on unmount
      onUnmounted(() => {
        window.removeEventListener('online', updateOnlineStatus)
        window.removeEventListener('offline', updateOnlineStatus)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        stopQualityMonitoring?.()
      })
    }
  })

  return {
    // State
    networkStatus: readonly(networkStatus),
    retryConfig: readonly(retryConfig),
    
    // Computed
    isOnline: computed(() => networkStatus.value.isOnline),
    isConnecting: computed(() => networkStatus.value.isConnecting),
    connectionQuality: computed(() => networkStatus.value.connectionQuality),
    retryCount: computed(() => networkStatus.value.retryCount),
    
    // Methods
    retryConnection,
    checkConnectionQuality,
    createAutoRetryFunction,
    updateOnlineStatus
  }
}