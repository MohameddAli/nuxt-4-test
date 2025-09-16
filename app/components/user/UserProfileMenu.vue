<template>
  <v-menu :location="location" :offset="offset" transition="fade-transition">
    <template #activator="{ props: activatorProps }">
      <v-btn v-bind="activatorProps" :variant="btnVariant" class="user-profile-btn">
        <div class="d-flex align-center">
          <v-avatar :size="avatarSize" class="me-2">
            <v-img :src="avatarSrc" :alt="avatarAlt" />
          </v-avatar>
          <div v-if="showUserInfo" class="user-info d-none d-sm-block text-start">
            <div class="user-name text-body-2 font-weight-medium">
              {{ displayName }}
            </div>
            <div class="user-role text-caption text-medium-emphasis">
              {{ displayRole }}
            </div>
          </div>
          <v-icon class="ms-1">mdi-chevron-down</v-icon>
        </div>
      </v-btn>
    </template>

    <v-card class="user-menu-card" min-width="240" max-width="280">
      <v-list class="user-menu" density="comfortable">
        <v-list-item v-for="item in resolvedItems" :key="item.title" @click="item.action">
          <template #prepend>
            <v-icon>{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
type MenuItem = { title: string; icon: string; action: () => void }

const props = withDefaults(defineProps<{
  name?: string
  role?: string
  avatar?: string
  avatarAlt?: string
  showUserInfo?: boolean
  items?: MenuItem[]
  location?: 'bottom end' | 'bottom start' | 'top end' | 'top start'
  offset?: [number, number]
  avatarSize?: number | string
  btnVariant?: 'text' | 'elevated' | 'flat' | 'tonal' | 'outlined' | 'plain'
}>(), {
  name: 'Robin Jivan',
  role: 'Admin',
  avatar: 'https://cdn.vuetifyjs.com/images/john.jpg',
  avatarAlt: 'User avatar',
  showUserInfo: true,
  location: 'bottom end',
  offset: () => [0, 8],
  avatarSize: 32,
  btnVariant: 'text',
})

const emit = defineEmits<{
  (e: 'logout'): void
  (e: 'navigate', to: string): void
}>()

const displayName = computed(() => props.name)
const displayRole = computed(() => props.role)
const avatarSrc = computed(() => props.avatar)

const navigate = (to: string) => emit('navigate', to)
const logout = () => emit('logout')

const { t } = useI18n()

const defaultItems = computed<MenuItem[]>(() => [
  { title: t('header.profile'), icon: 'mdi-account-outline', action: () => navigate('/profile') },
  { title: t('navigation.settings'), icon: 'mdi-cog-outline', action: () => navigate('/settings') },
  { title: t('navigation.support'), icon: 'mdi-help-circle-outline', action: () => navigate('/support') },
  { title: t('header.logout'), icon: 'mdi-logout', action: logout },
])

const resolvedItems = computed<MenuItem[]>(() => props.items ?? defaultItems.value)
</script>

<style scoped>
.user-profile-btn {
  border-radius: 12px;
  padding: 4px 8px;
  text-transform: none;
  background-color: rgba(var(--v-theme-surface-variant), 0.6);
  height: 40px;
}

.user-menu {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.user-menu-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

@media (max-width: 600px) {
  .user-info { display: none !important; }
}
</style>


