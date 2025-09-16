import type { 
  Notification,
  NotificationAction,
  NotificationType,
  NotificationPriority,
  ErrorNotificationConfig,
  SuccessNotificationConfig,
  LoadingNotificationConfig,
  NOTIFICATION_CATEGORIES
} from '~/shared/types/notifications'
import { extractErrorMessage, createContextualErrorMessage } from '../../shared/utils/errorHandler'

export interface SnackbarOptions {
  message: string
  title?: string
  type?: NotificationType
  priority?: NotificationPriority
  timeout?: number
  persistent?: boolean
  closable?: boolean
  icon?: string
  color?: string
  actions?: NotificationAction[]
  category?: string
  group?: string
  metadata?: Record<string, any>
}

/**
 * Enhanced Snackbar Composable with Queue Management
 * Integrates with the notifications store for advanced notification handling
 */
export const useSnackbar = () => {
  const notificationsStore = useNotificationsStore()
  const { $i18n } = useNuxtApp()

  /**
   * Show a notification via the store
   */
  const showNotification = (options: SnackbarOptions | string): Notification => {
    // Handle string input for simple messages
    if (typeof options === 'string') {
      options = { message: options }
    }

    const {
      message,
      title,
      type = 'info',
      priority = 'normal',
      timeout = getDefaultTimeout(type),
      persistent = priority === 'critical',
      closable = true,
      icon,
      color,
      actions = [],
      category = NOTIFICATION_CATEGORIES.SYSTEM,
      group,
      metadata = {}
    } = options

    return notificationsStore.addNotification({
      message,
      title,
      type,
      priority,
      timeout: persistent ? 0 : timeout,
      persistent,
      closable,
      icon: icon || getDefaultIcon(type),
      color: color || getDefaultColor(type),
      actions,
      category,
      group,
      metadata: {
        ...metadata,
        source: 'snackbar'
      }
    })
  }

  /**
   * Get default timeout based on notification type
   */
  const getDefaultTimeout = (type: NotificationType): number => {
    const timeouts = {
      success: 3000,
      info: 4000,
      warning: 5000,
      error: 6000,
      loading: 0 // No timeout for loading
    }
    return timeouts[type] || 4000
  }

  /**
   * Get default icon based on notification type
   */
  const getDefaultIcon = (type: NotificationType): string => {
    const icons = {
      success: 'mdi-check-circle',
      error: 'mdi-alert-circle',
      warning: 'mdi-alert',
      info: 'mdi-information',
      loading: 'mdi-loading'
    }
    return icons[type]
  }

  /**
   * Get default color based on notification type
   */
  const getDefaultColor = (type: NotificationType): string => {
    const colors = {
      success: 'success',
      error: 'error',
      warning: 'warning',
      info: 'info',
      loading: 'primary'
    }
    return colors[type]
  }

  /**
   * Show success notification with enhanced options
   */
  const showSuccess = (
    message: string, 
    config?: SuccessNotificationConfig & Partial<SnackbarOptions>
  ): Notification => {
    const actions: NotificationAction[] = []

    // Add undo action if provided
    if (config?.showUndo && config.undoAction) {
      actions.push({
        id: 'undo',
        label: $i18n?.t('common.undo') || 'تراجع',
        color: 'primary',
        handler: async (notification) => {
          await config.undoAction!()
          notificationsStore.dismissNotification(notification.id)
        }
      })
    }

    return showNotification({
      message,
      type: 'success',
      priority: 'normal',
      category: NOTIFICATION_CATEGORIES.USER_ACTION,
      icon: config?.celebratory ? 'mdi-party-popper' : 'mdi-check-circle',
      actions,
      ...config
    })
  }

  /**
   * Show error notification with enhanced options
   */
  const showError = (
    message: string, 
    config?: ErrorNotificationConfig & Partial<SnackbarOptions>
  ): Notification => {
    const actions: NotificationAction[] = []

    // Add retry action if provided
    if (config?.allowRetry && config.retryAction) {
      actions.push({
        id: 'retry',
        label: $i18n?.t('common.retry') || 'إعادة المحاولة',
        color: 'primary',
        icon: 'mdi-refresh',
        handler: async (notification) => {
          try {
            await config.retryAction!()
            notificationsStore.dismissNotification(notification.id)
          } catch (error) {
            // Show new error if retry fails
            showFromError(error, { context: 'retry_failed' })
          }
        }
      })
    }

    // Add report action if provided
    if (config?.reportAction) {
      actions.push({
        id: 'report',
        label: $i18n?.t('common.report') || 'إبلاغ',
        color: 'warning',
        icon: 'mdi-bug',
        handler: async (notification) => {
          await config.reportAction!()
        }
      })
    }

    const priority: NotificationPriority = config?.severity === 'critical' ? 'critical' : 
                                          config?.severity === 'high' ? 'high' : 'normal'

    return showNotification({
      message,
      type: 'error',
      priority,
      category: NOTIFICATION_CATEGORIES.API,
      actions,
      persistent: priority === 'critical',
      ...config
    })
  }

  /**
   * Show warning notification
   */
  const showWarning = (
    message: string, 
    options?: Partial<SnackbarOptions>
  ): Notification => {
    return showNotification({
      message,
      type: 'warning',
      priority: 'normal',
      category: NOTIFICATION_CATEGORIES.VALIDATION,
      ...options
    })
  }

  /**
   * Show info notification
   */
  const showInfo = (
    message: string, 
    options?: Partial<SnackbarOptions>
  ): Notification => {
    return showNotification({
      message,
      type: 'info',
      priority: 'low',
      category: NOTIFICATION_CATEGORIES.SYSTEM,
      ...options
    })
  }

  /**
   * Show loading notification
   */
  const showLoading = (
    message: string,
    config?: LoadingNotificationConfig & Partial<SnackbarOptions>
  ): Notification => {
    const actions: NotificationAction[] = []

    // Add cancel action if cancellable
    if (config?.cancellable && config.cancelAction) {
      actions.push({
        id: 'cancel',
        label: $i18n?.t('common.cancel') || 'إلغاء',
        color: 'error',
        handler: async (notification) => {
          config.cancelAction!()
          notificationsStore.dismissNotification(notification.id)
        }
      })
    }

    return showNotification({
      message,
      type: 'loading',
      priority: 'normal',
      category: NOTIFICATION_CATEGORIES.SYSTEM,
      persistent: true,
      actions,
      metadata: {
        showProgress: config?.showProgress,
        progress: config?.progress,
        estimatedTime: config?.estimatedTime
      },
      ...config
    })
  }

  /**
   * Update loading notification progress
   */
  const updateLoadingProgress = (notificationId: string, progress: number, message?: string): void => {
    const notification = notificationsStore.notifications.find(n => n.id === notificationId)
    if (notification && notification.type === 'loading') {
      if (message) notification.message = message
      if (notification.metadata) {
        notification.metadata.progress = progress
      }
    }
  }

  /**
   * Show notification from HTTP response
   */
  const showFromResponse = (response: any, successMessage?: string): Notification | null => {
    if (response.status >= 200 && response.status < 300) {
      const message = successMessage || response.data?.message || 
                     $i18n?.t('common.operationSuccess') || 'تمت العملية بنجاح'
      return showSuccess(message)
    } else if (response.status >= 400) {
      const message = response.data?.message || response.message || 
                     $i18n?.t('common.operationFailed') || 'فشلت العملية'
      return showError(message)
    }
    return null
  }

  /**
   * Show notification from error with enhanced extraction
   */
  const showFromError = (error: any, options?: {
    customMessage?: string
    context?: string
    allowRetry?: boolean
    retryAction?: () => void | Promise<void>
    severity?: ErrorNotificationConfig['severity']
  }): Notification => {
    // Use custom message if provided
    if (options?.customMessage) {
      return showError(options.customMessage, {
        severity: options.severity,
        allowRetry: options.allowRetry,
        retryAction: options.retryAction
      })
    }

    let message: string
    let canRetry = false

    // Extract message with context if provided
    if (options?.context) {
      const result = createContextualErrorMessage(error, options.context, {
        includeDetails: false,
        fallbackMessage: $i18n?.t('errors.unexpectedError') || 'حدث خطأ غير متوقع'
      })
      message = result.message
      canRetry = result.canRetry
    } else {
      message = extractErrorMessage(error, {
        includeDetails: false,
        fallbackMessage: $i18n?.t('errors.unexpectedError') || 'حدث خطأ غير متوقع'
      })
    }

    return showError(message, {
      severity: options?.severity || 'medium',
      allowRetry: (options?.allowRetry ?? canRetry) && !!options?.retryAction,
      retryAction: options?.retryAction,
      context: options?.context
    })
  }

  /**
   * Dismiss notification by ID
   */
  const dismiss = (id: string): boolean => {
    return notificationsStore.dismissNotification(id)
  }

  /**
   * Clear all notifications
   */
  const clearAll = (): void => {
    notificationsStore.clearAll()
  }

  /**
   * Clear notifications by type
   */
  const clearByType = (type: NotificationType): void => {
    notificationsStore.clearByType(type)
  }

  return {
    // Store reference
    store: notificationsStore,
    
    // Core methods
    showNotification,
    dismiss,
    clearAll,
    clearByType,
    
    // Type-specific methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    updateLoadingProgress,
    
    // Response/Error helpers
    showFromResponse,
    showFromError,

    // Convenience getters
    notifications: notificationsStore.activeNotifications,
    unreadCount: notificationsStore.unreadCount,
    hasNotifications: notificationsStore.hasUnreadNotifications
  }
} 