// Notification system types and interfaces

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading'
export type NotificationPosition = 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical'

export interface NotificationAction {
  id: string
  label: string
  color?: string
  icon?: string
  variant?: 'text' | 'outlined' | 'flat' | 'tonal' | 'elevated'
  handler: (notification: Notification) => void | Promise<void>
}

export interface Notification {
  id: string
  message: string
  type: NotificationType
  title?: string
  description?: string
  timeout?: number
  persistent?: boolean
  closable?: boolean
  position?: NotificationPosition
  priority?: NotificationPriority
  icon?: string
  color?: string
  actions?: NotificationAction[]
  metadata?: Record<string, any>
  createdAt: Date
  dismissedAt?: Date
  category?: string
  source?: string
  group?: string
}

export interface NotificationQueue {
  notifications: Notification[]
  maxItems: number
  maxDuplicates: number
}

export interface NotificationStore {
  queue: NotificationQueue
  history: Notification[]
  settings: NotificationSettings
}

export interface NotificationSettings {
  enabled: boolean
  maxNotifications: number
  defaultTimeout: number
  allowDuplicates: boolean
  playSound: boolean
  showInTitle: boolean
  persistCritical: boolean
  groupSimilar: boolean
  position: NotificationPosition
}

export interface NetworkStatus {
  isOnline: boolean
  isConnecting: boolean
  lastOnline?: Date
  lastOffline?: Date
  connectionQuality?: 'slow' | 'fast' | 'unknown'
  retryCount: number
  maxRetries: number
}

export interface NotificationTemplate {
  id: string
  name: string
  type: NotificationType
  message: string
  title?: string
  icon?: string
  timeout?: number
  actions?: Omit<NotificationAction, 'handler'>[]
}

// Predefined notification categories
export const NOTIFICATION_CATEGORIES = {
  AUTH: 'auth',
  API: 'api',
  NETWORK: 'network',
  USER_ACTION: 'user-action',
  SYSTEM: 'system',
  VALIDATION: 'validation',
  UPLOAD: 'upload',
  EXPORT: 'export'
} as const

export type NotificationCategory = typeof NOTIFICATION_CATEGORIES[keyof typeof NOTIFICATION_CATEGORIES]

// Error notification specific types
export interface ErrorNotificationConfig {
  showDetails?: boolean
  allowRetry?: boolean
  retryAction?: () => void | Promise<void>
  reportAction?: () => void | Promise<void>
  context?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

// Success notification config
export interface SuccessNotificationConfig {
  showUndo?: boolean
  undoAction?: () => void | Promise<void>
  showDetails?: boolean
  celebratory?: boolean
}

// Loading notification config
export interface LoadingNotificationConfig {
  showProgress?: boolean
  progress?: number
  cancellable?: boolean
  cancelAction?: () => void
  estimatedTime?: number
}

// Network retry configuration
export interface RetryConfig {
  maxRetries: number
  retryDelay: number
  backoffMultiplier: number
  maxRetryDelay: number
}

// Notification filters for history/search
export interface NotificationFilter {
  type?: NotificationType[]
  category?: NotificationCategory[]
  dateFrom?: Date
  dateTo?: Date
  priority?: NotificationPriority[]
  dismissed?: boolean
  source?: string
}
