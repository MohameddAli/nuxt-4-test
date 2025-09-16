<template>
  <v-menu v-model="isOpen" :close-on-content-click="false" :location="location" :offset="offset" transition="fade-transition">
    <template #activator="{ props }">
      <v-btn v-bind="props" icon variant="text" size="small" class="me-2 notification-activator">
        <v-badge v-if="badgeCount > 0" :content="badgeCount" :color="badgeColor" offset-x="2" offset-y="2">
          <v-icon>{{ icon }}</v-icon>
        </v-badge>
        <v-icon v-else>{{ icon }}</v-icon>
      </v-btn>
    </template>

    <v-card class="notifications-card" min-width="360" max-width="420">
      <v-card-title class="d-flex align-center justify-space-between">
        <span>{{ t('header.notifications') }}</span>
        <v-btn icon size="small" @click="isOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider />
      <v-list class="notifications-list" max-height="300">
        <v-list-item v-for="item in items" :key="item.id" class="notification-item" @click="handleSelect(item)">
          <template #prepend>
            <v-avatar :color="item.color" size="32">
              <v-icon color="white">{{ item.icon }}</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="text-body-2">{{ item.title }}</v-list-item-title>
          <v-list-item-subtitle class="text-caption">{{ item.time }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
      <v-card-actions>
        <v-btn variant="text" size="small" block @click="emit('view-all')">
          {{ t('header.viewAllNotifications') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
type NotificationColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error'
type NotificationItem = { id: string | number; title: string; time: string; icon: string; color: NotificationColor }

const props = withDefaults(defineProps<{
  items?: NotificationItem[]
  count?: number
  location?: 'bottom end' | 'bottom start' | 'top end' | 'top start'
  offset?: [number, number]
  icon?: string
  badgeColor?: NotificationColor
}>(), {
  items: () => [],
  location: 'bottom end',
  offset: () => [0, 8],
  icon: 'mdi-bell-outline',
  badgeColor: 'error'
})

const emit = defineEmits<{
  (e: 'open'): void
  (e: 'close'): void
  (e: 'select', item: NotificationItem): void
  (e: 'view-all'): void
}>()

const { t } = useI18n()

const isOpen = ref(false)
watch(isOpen, (val) => (val ? emit('open') : emit('close')))

const badgeCount = computed(() => typeof props.count === 'number' ? props.count : (props.items?.length ?? 0))

const handleSelect = (item: NotificationItem) => emit('select', item)
</script>

<style scoped>
.notifications-card { border-radius: 12px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); }
.notification-item { border-bottom: 1px solid rgba(var(--v-border-color), 0.06); }
.notification-item:last-child { border-bottom: none; }
</style>


