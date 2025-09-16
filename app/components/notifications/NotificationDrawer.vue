<template>
  <v-navigation-drawer
    v-model="drawer"
    temporary
    location="end"
    width="400"
    class="notifications-drawer"
  >
    <!-- Header -->
    <template #prepend>
      <v-toolbar flat>
        <v-toolbar-title class="text-h6">
          {{ $t('notifications.title') }}
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          variant="text"
          size="small"
          @click="closeDrawer"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      
      <!-- Action Bar -->
      <v-divider />
      <div class="pa-2 d-flex align-center gap-2">
        <v-chip
          :color="unreadCount > 0 ? 'primary' : 'default'"
          size="small"
          variant="tonal"
        >
          {{ unreadCount }} {{ $t('notifications.unread') }}
        </v-chip>
        <v-spacer />
        <v-btn
          v-if="unreadCount > 0"
          size="small"
          variant="text"
          @click="markAllAsRead"
        >
          {{ $t('notifications.markAllRead') }}
        </v-btn>
        <v-btn
          size="small"
          variant="text"
          icon
          @click="clearAll"
        >
          <v-icon>mdi-delete-sweep</v-icon>
        </v-btn>
      </div>
    </template>

    <!-- Notifications List -->
    <v-list>
      <template v-if="notifications.length === 0">
        <v-list-item>
          <div class="text-center pa-4">
            <v-icon
              size="48"
              color="grey-lighten-1"
              class="mb-2"
            >
              mdi-bell-outline
            </v-icon>
            <div class="text-body-2 text-grey-darken-1">
              {{ $t('notifications.empty') }}
            </div>
          </div>
        </v-list-item>
      </template>

      <template v-else>
        <v-list-item
          v-for="notification in notifications"
          :key="notification.id"
          :class="[
            'notification-item',
            { 'notification-unread': !notification.isRead }
          ]"
          @click="markAsRead(notification.id)"
        >
          <!-- Notification Content -->
          <template #prepend>
            <v-avatar
              :color="getNotificationColor(notification.type)"
              size="32"
            >
              <v-icon
                :icon="notification.icon"
                color="white"
                size="18"
              />
            </v-avatar>
          </template>

          <v-list-item-title class="text-wrap">
            {{ notification.title || notification.message }}
          </v-list-item-title>

          <v-list-item-subtitle 
            v-if="notification.title && notification.message !== notification.title"
            class="text-wrap mt-1"
          >
            {{ notification.message }}
          </v-list-item-subtitle>

          <!-- Progress Bar -->
          <v-progress-linear
            v-if="notification.type === 'loading' && notification.progress"
            :model-value="(notification.progress.current / notification.progress.total) * 100"
            :color="getNotificationColor(notification.type)"
            height="4"
            class="mt-2"
          />

          <!-- Time and Actions -->
          <template #append>
            <div class="d-flex flex-column align-end">
              <div class="text-caption text-grey-darken-1">
                {{ formatTime(notification.timestamp) }}
              </div>
              
              <!-- Actions -->
              <div v-if="notification.actions?.length" class="mt-1">
                <v-btn
                  v-for="action in notification.actions.slice(0, 2)"
                  :key="action.id"
                  size="x-small"
                  variant="text"
                  :color="action.style === 'primary' ? 'primary' : 'default'"
                  @click.stop="handleAction(action, notification)"
                >
                  {{ action.label }}
                </v-btn>
              </div>

              <!-- Dismiss Button -->
              <v-btn
                icon
                size="x-small"
                variant="text"
                @click.stop="dismiss(notification.id)"
              >
                <v-icon size="14">mdi-close</v-icon>
              </v-btn>
            </div>
          </template>

          <!-- Priority Indicator -->
          <div
            v-if="notification.priority === 'high'"
            class="notification-priority-indicator"
          />
        </v-list-item>
      </template>
    </v-list>

    <!-- Footer -->
    <template #append>
      <v-divider />
      <div class="pa-2 text-center">
        <v-btn
          variant="text"
          size="small"
          @click="openSettings"
        >
          <v-icon start>mdi-cog</v-icon>
          {{ $t('notifications.settings') }}
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>

  <!-- Settings Dialog -->
  <v-dialog
    v-model="settingsDialog"
    max-width="500"
  >
    <v-card>
      <v-card-title>
        {{ $t('notifications.settings') }}
      </v-card-title>

      <v-card-text>
        <v-switch
          v-model="localSettings.enabled"
          :label="$t('notifications.enableNotifications')"
          @update:model-value="updateSettings"
        />

        <v-switch
          v-model="localSettings.soundEnabled"
          :label="$t('notifications.enableSound')"
          :disabled="!localSettings.enabled"
          @update:model-value="updateSettings"
        />

        <v-switch
          v-model="localSettings.showInHistory"
          :label="$t('notifications.showInHistory')"
          :disabled="!localSettings.enabled"
          @update:model-value="updateSettings"
        />

        <v-divider class="my-4" />

        <v-subheader>{{ $t('notifications.autoCleanup') }}</v-subheader>

        <v-switch
          v-model="localSettings.autoCleanup"
          :label="$t('notifications.enableAutoCleanup')"
          @update:model-value="updateSettings"
        />

        <v-text-field
          v-if="localSettings.autoCleanup"
          v-model="localSettings.maxHistoryDays"
          :label="$t('notifications.maxHistoryDays')"
          type="number"
          min="1"
          max="365"
          @update:model-value="updateSettings"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          @click="settingsDialog = false"
        >
          {{ $t('common.close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { Notification, NotificationAction, NotificationSettings } from '~/shared/types/notifications'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { $t } = useI18n()
const notificationsStore = useNotificationsStore()
const { formatDistanceToNow } = useUtils()

// Local state
const drawer = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const settingsDialog = ref(false)
const localSettings = ref<NotificationSettings>({ ...notificationsStore.settings })

// Computed properties
const notifications = computed(() => 
  notificationsStore.getNotifications({ isActive: true })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
)

const unreadCount = computed(() => notificationsStore.unreadNotifications.length)

// Methods
const closeDrawer = () => {
  drawer.value = false
}

const markAsRead = (id: string) => {
  notificationsStore.markAsRead(id)
}

const markAllAsRead = () => {
  notificationsStore.markAllAsRead()
}

const dismiss = (id: string) => {
  notificationsStore.dismiss(id)
}

const clearAll = () => {
  notificationsStore.clearAll()
}

const handleAction = (action: NotificationAction, notification: Notification) => {
  try {
    action.handler()
    // Auto-dismiss after action unless it's persistent
    if (!notification.persistent) {
      dismiss(notification.id)
    }
  } catch (error) {
    console.error('Notification action error:', error)
  }
}

const getNotificationColor = (type: Notification['type']): string => {
  const colors = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
    loading: 'primary'
  }
  return colors[type] || 'default'
}

const formatTime = (timestamp: string): string => {
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  } catch {
    return ''
  }
}

const openSettings = () => {
  localSettings.value = { ...notificationsStore.settings }
  settingsDialog.value = true
}

const updateSettings = () => {
  notificationsStore.updateSettings(localSettings.value)
}

// Watch settings changes
watch(() => notificationsStore.settings, (newSettings) => {
  localSettings.value = { ...newSettings }
}, { deep: true })
</script>

<style scoped>
.notifications-drawer {
  z-index: 2000;
}

.notification-item {
  transition: all 0.2s ease;
}

.notification-item:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}

.notification-unread {
  background-color: rgba(var(--v-theme-primary), 0.04);
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.notification-priority-indicator {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 8px;
  height: 8px;
  background-color: rgb(var(--v-theme-error));
  border-radius: 50%;
}

.v-list-item__prepend .v-avatar {
  margin-inline-end: 12px;
}
</style>