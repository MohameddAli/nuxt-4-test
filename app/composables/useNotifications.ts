import type { 
  Notification, 
  NotificationCreatePayload, 
  NotificationSettings,
  NotificationFilter 
} from '~/shared/types/notifications'

/**
 * Unified Notifications Composable
 * Central interface for all notification operations
 */
export const useNotifications = () => {
  const notificationsStore = useNotificationsStore()
  const { showSuccess, showError, showWarning, showInfo, showLoading } = useSnackbar()
  const { $i18n } = useNuxtApp()

  // Enhanced notification methods with store integration
  const notify = (payload: NotificationCreatePayload) => {
    return notificationsStore.addNotification(payload)
  }

  // Quick notification methods
  const success = (
    message: string, 
    options?: Partial<Omit<NotificationCreatePayload, 'type' | 'message'>>
  ) => {
    const notification = notify({
      type: 'success',
      message,
      icon: 'mdi-check-circle',
      timeout: 4000,
      ...options
    })
    
    showSuccess(message, {
      icon: options?.icon || 'mdi-check-circle',
      timeout: options?.timeout || 4000,
      actions: options?.actions
    })
    
    return notification
  }

  const error = (
    message: string, 
    options?: Partial<Omit<NotificationCreatePayload, 'type' | 'message'>>
  ) => {
    const notification = notify({
      type: 'error',
      message,
      icon: 'mdi-alert-circle',
      persistent: true,
      priority: 'high',
      ...options
    })
    
    showError(message, {
      icon: options?.icon || 'mdi-alert-circle',
      persistent: options?.persistent ?? true,
      actions: options?.actions
    })
    
    return notification
  }

  const warning = (
    message: string, 
    options?: Partial<Omit<NotificationCreatePayload, 'type' | 'message'>>
  ) => {
    const notification = notify({
      type: 'warning',
      message,
      icon: 'mdi-alert',
      timeout: 6000,
      priority: 'medium',
      ...options
    })
    
    showWarning(message, {
      icon: options?.icon || 'mdi-alert',
      timeout: options?.timeout || 6000,
      priority: options?.priority || 'medium',
      actions: options?.actions
    })
    
    return notification
  }

  const info = (
    message: string, 
    options?: Partial<Omit<NotificationCreatePayload, 'type' | 'message'>>
  ) => {
    const notification = notify({
      type: 'info',
      message,
      icon: 'mdi-information',
      timeout: 5000,
      ...options
    })
    
    showInfo(message, {
      icon: options?.icon || 'mdi-information',
      timeout: options?.timeout || 5000,
      actions: options?.actions
    })
    
    return notification
  }

  const loading = (
    message: string, 
    options?: Partial<Omit<NotificationCreatePayload, 'type' | 'message'>>
  ) => {
    const notification = notify({
      type: 'loading',
      message,
      icon: 'mdi-loading',
      persistent: true,
      ...options
    })
    
    const snackbarId = showLoading(message, {
      icon: options?.icon || 'mdi-loading',
      persistent: options?.persistent ?? true,
      progress: options?.progress
    })
    
    return { notification, snackbarId }
  }

  // System notifications
  const notifySuccess = (key: string, values?: Record<string, any>) => {
    const message = $i18n?.t(`notifications.${key}`, values) || key
    return success(message)
  }

  const notifyError = (key: string, values?: Record<string, any>) => {
    const message = $i18n?.t(`errors.${key}`, values) || key
    return error(message)
  }

  const notifyWarning = (key: string, values?: Record<string, any>) => {
    const message = $i18n?.t(`warnings.${key}`, values) || key
    return warning(message)
  }

  const notifyInfo = (key: string, values?: Record<string, any>) => {
    const message = $i18n?.t(`info.${key}`, values) || key
    return info(message)
  }

  // Progress tracking for operations
  const trackProgress = (
    operationId: string,
    message: string,
    onCancel?: () => void
  ) => {
    const actions = onCancel ? [{
      id: 'cancel',
      label: $i18n?.t('common.cancel') || 'إلغاء',
      handler: onCancel
    }] : undefined

    const { notification, snackbarId } = loading(message, {
      operationId,
      actions,
      progress: { current: 0, total: 100 }
    })

    return {
      notification,
      snackbarId,
      updateProgress: (current: number, total: number = 100, message?: string) => {
        notificationsStore.updateProgress(notification.id, current, total, message)
      },
      complete: (successMessage?: string) => {
        notificationsStore.completeOperation(notification.id)
        if (successMessage) {
          success(successMessage)
        }
      },
      fail: (errorMessage: string) => {
        notificationsStore.completeOperation(notification.id)
        error(errorMessage)
      }
    }
  }

  // Batch operations
  const clearAll = (filter?: NotificationFilter) => {
    notificationsStore.clearAll(filter)
  }

  const markAllAsRead = (filter?: NotificationFilter) => {
    notificationsStore.markAllAsRead(filter)
  }

  // Settings management
  const updateSettings = (settings: Partial<NotificationSettings>) => {
    notificationsStore.updateSettings(settings)
  }

  // Get notifications with filtering
  const getNotifications = (filter?: NotificationFilter) => {
    return notificationsStore.getNotifications(filter)
  }

  const getActiveNotifications = () => {
    return notificationsStore.getNotifications({ 
      isActive: true 
    })
  }

  const getUnreadNotifications = () => {
    return notificationsStore.getNotifications({ 
      isRead: false 
    })
  }

  const getNotificationsByType = (type: Notification['type']) => {
    return notificationsStore.getNotifications({ 
      types: [type] 
    })
  }

  // Statistics
  const getStats = () => {
    const all = notificationsStore.notifications
    const active = notificationsStore.activeNotifications
    const unread = notificationsStore.unreadNotifications

    return {
      total: all.length,
      active: active.length,
      unread: unread.length,
      byType: {
        success: all.filter(n => n.type === 'success').length,
        error: all.filter(n => n.type === 'error').length,
        warning: all.filter(n => n.type === 'warning').length,
        info: all.filter(n => n.type === 'info').length,
        loading: all.filter(n => n.type === 'loading').length
      }
    }
  }

  // Auto-dismiss management
  const pauseAutoDismiss = (notificationId: string) => {
    notificationsStore.pauseAutoDismiss(notificationId)
  }

  const resumeAutoDismiss = (notificationId: string) => {
    notificationsStore.resumeAutoDismiss(notificationId)
  }

  // Advanced features
  const scheduleNotification = (
    payload: NotificationCreatePayload,
    delay: number
  ): string => {
    const scheduledId = `scheduled-${Date.now()}`
    
    setTimeout(() => {
      notify({
        ...payload,
        scheduledId
      })
    }, delay)

    return scheduledId
  }

  const createTemplate = (
    name: string,
    template: Partial<NotificationCreatePayload>
  ) => {
    notificationsStore.saveTemplate(name, template)
  }

  const useTemplate = (
    name: string,
    overrides?: Partial<NotificationCreatePayload>
  ) => {
    const template = notificationsStore.getTemplate(name)
    if (!template) {
      throw new Error(`Template "${name}" not found`)
    }

    return notify({
      ...template,
      ...overrides
    })
  }

  return {
    // Core notification methods
    notify,
    success,
    error,
    warning,
    info,
    loading,

    // I18n methods
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,

    // Progress tracking
    trackProgress,

    // Batch operations
    clearAll,
    markAllAsRead,

    // Settings
    updateSettings,

    // Queries
    getNotifications,
    getActiveNotifications,
    getUnreadNotifications,
    getNotificationsByType,
    getStats,

    // Auto-dismiss control
    pauseAutoDismiss,
    resumeAutoDismiss,

    // Advanced features
    scheduleNotification,
    createTemplate,
    useTemplate,

    // Store access (for advanced usage)
    store: notificationsStore
  }
}