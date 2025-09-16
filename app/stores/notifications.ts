import { defineStore } from 'pinia'
import type { 
  Notification, 
  NotificationSettings, 
  NotificationFilter,
  NotificationType,
  NotificationPriority,
  NotificationPosition
} from '~/shared/types/notifications'

export const useNotificationsStore = defineStore('notifications', () => {
  // State
  const notifications = ref<Notification[]>([])
  const history = ref<Notification[]>([])
  const settings = ref<NotificationSettings>({
    enabled: true,
    maxNotifications: 5,
    defaultTimeout: 5000,
    allowDuplicates: false,
    playSound: false,
    showInTitle: false,
    persistCritical: true,
    groupSimilar: true,
    position: 'top'
  })

  // Getters
  const activeNotifications = computed(() => 
    notifications.value.filter(n => !n.dismissedAt)
  )

  const criticalNotifications = computed(() =>
    activeNotifications.value.filter(n => n.priority === 'critical')
  )

  const notificationsByType = computed(() => (type: NotificationType) =>
    activeNotifications.value.filter(n => n.type === type)
  )

  const hasUnreadNotifications = computed(() =>
    activeNotifications.value.length > 0
  )

  const unreadCount = computed(() => activeNotifications.value.length)

  // Actions
  const generateId = (): string => {
    return `notification_${Date.now()}_${Math.random().toString(36).substring(2)}`
  }

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>): Notification => {
    // Check if notifications are enabled
    if (!settings.value.enabled) {
      return {} as Notification
    }

    // Create notification with ID and timestamp
    const newNotification: Notification = {
      id: generateId(),
      createdAt: new Date(),
      ...notification
    }

    // Check for duplicates if not allowed
    if (!settings.value.allowDuplicates) {
      const duplicate = notifications.value.find(n => 
        n.message === newNotification.message && 
        n.type === newNotification.type &&
        !n.dismissedAt
      )
      
      if (duplicate) {
        // Update existing notification timestamp
        duplicate.createdAt = new Date()
        return duplicate
      }
    }

    // Handle grouping similar notifications
    if (settings.value.groupSimilar && notification.group) {
      const existingGroup = notifications.value.find(n => 
        n.group === notification.group && !n.dismissedAt
      )
      
      if (existingGroup) {
        // Update existing notification in group
        existingGroup.message = newNotification.message
        existingGroup.createdAt = new Date()
        return existingGroup
      }
    }

    // Add to notifications array
    notifications.value.unshift(newNotification)

    // Maintain max notifications limit
    while (activeNotifications.value.length > settings.value.maxNotifications) {
      const oldest = notifications.value
        .filter(n => !n.persistent && n.priority !== 'critical')
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0]
      
      if (oldest) {
        dismissNotification(oldest.id)
      } else {
        break
      }
    }

    // Add to history
    history.value.unshift({ ...newNotification })

    // Maintain history limit (keep last 100)
    if (history.value.length > 100) {
      history.value = history.value.slice(0, 100)
    }

    return newNotification
  }

  const dismissNotification = (id: string): boolean => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.dismissedAt = new Date()
      return true
    }
    return false
  }

  const removeNotification = (id: string): boolean => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
      return true
    }
    return false
  }

  const clearAll = (): void => {
    notifications.value.forEach(n => {
      if (!n.persistent && n.priority !== 'critical') {
        n.dismissedAt = new Date()
      }
    })
  }

  const clearByType = (type: NotificationType): void => {
    notifications.value
      .filter(n => n.type === type && !n.persistent && n.priority !== 'critical')
      .forEach(n => n.dismissedAt = new Date())
  }

  const clearByCategory = (category: string): void => {
    notifications.value
      .filter(n => n.category === category && !n.persistent && n.priority !== 'critical')
      .forEach(n => n.dismissedAt = new Date())
  }

  const updateSettings = (newSettings: Partial<NotificationSettings>): void => {
    settings.value = { ...settings.value, ...newSettings }
    
    // Save to localStorage
    if (process.client) {
      localStorage.setItem('notification-settings', JSON.stringify(settings.value))
    }
  }

  const loadSettings = (): void => {
    if (process.client) {
      try {
        const saved = localStorage.getItem('notification-settings')
        if (saved) {
          const savedSettings = JSON.parse(saved) as NotificationSettings
          settings.value = { ...settings.value, ...savedSettings }
        }
      } catch (error) {
        console.warn('Failed to load notification settings:', error)
      }
    }
  }

  const getHistory = (filter?: NotificationFilter): Notification[] => {
    let filtered = [...history.value]

    if (filter) {
      if (filter.type && filter.type.length > 0) {
        filtered = filtered.filter(n => filter.type!.includes(n.type))
      }

      if (filter.category && filter.category.length > 0) {
        filtered = filtered.filter(n => filter.category!.includes(n.category || ''))
      }

      if (filter.priority && filter.priority.length > 0) {
        filtered = filtered.filter(n => filter.priority!.includes(n.priority || 'normal'))
      }

      if (filter.dateFrom) {
        filtered = filtered.filter(n => n.createdAt >= filter.dateFrom!)
      }

      if (filter.dateTo) {
        filtered = filtered.filter(n => n.createdAt <= filter.dateTo!)
      }

      if (typeof filter.dismissed === 'boolean') {
        filtered = filtered.filter(n => !!n.dismissedAt === filter.dismissed)
      }

      if (filter.source) {
        filtered = filtered.filter(n => n.source === filter.source)
      }
    }

    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  const cleanup = (): void => {
    // Remove old dismissed notifications (older than 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    notifications.value = notifications.value.filter(n => 
      !n.dismissedAt || n.dismissedAt > oneDayAgo
    )

    // Limit history to last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    history.value = history.value.filter(n => n.createdAt > sevenDaysAgo)
  }

  // Initialize settings on store creation
  if (process.client) {
    loadSettings()
    
    // Cleanup old notifications on startup
    cleanup()
    
    // Setup periodic cleanup (every hour)
    setInterval(cleanup, 60 * 60 * 1000)
  }

  return {
    // State
    notifications: readonly(notifications),
    history: readonly(history),
    settings: readonly(settings),

    // Getters
    activeNotifications,
    criticalNotifications,
    notificationsByType,
    hasUnreadNotifications,
    unreadCount,

    // Actions
    addNotification,
    dismissNotification,
    removeNotification,
    clearAll,
    clearByType,
    clearByCategory,
    updateSettings,
    loadSettings,
    getHistory,
    cleanup
  }
})