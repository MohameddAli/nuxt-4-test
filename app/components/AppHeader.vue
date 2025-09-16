<template>
  <v-app-bar
    app
    elevation="0"
    height="72"
    class="app-header"
    color="surface"
    border="b"
  >
      <div class="header-content d-flex align-center justify-space-between w-100 px-4">
      <!-- Left Section: Logo and Menu Toggle -->
        <div class="header-left d-flex align-center">
        <!-- Mobile Menu Toggle -->
          <v-btn
          v-if="mobile"
          icon
          variant="text"
          size="small"
            class="me-3"
          @click="appStore.toggleSidebar"
        >
          <v-icon>mdi-menu</v-icon>
        </v-btn>

        <!-- Logo -->
        <div class="logo-container d-flex align-center">
          <div class="logo-icon">
            <v-icon size="32" color="primary">mdi-shield-check</v-icon>
          </div>
          <h2 class="logo-text ms-2 text-h5 font-weight-bold">
            Prime
          </h2>
        </div>
      </div>

      <!-- Center Section: Search (opens lightbox) -->
      <div class="header-center flex-grow-1 mx-8" style="max-width: 500px;">
        <GlobalSearchInput
          v-model="searchQuery"
          class="search-field"
          :max-width="400"
          @open="() => appStore.openSearch()"
        />
      </div>

      <!-- Right Section: Actions and Profile -->
      <div class="header-right d-flex align-center">
        <!-- Download Button -->
          <v-btn
          variant="outlined"
          size="small"
          class="me-3 download-btn"
          prepend-icon="mdi-download"
        >
          {{ $t('common.download') }}
        </v-btn>

        <!-- Date Range Picker -->
        <div class="me-4">
          <DateRangePicker />
        </div>

        <!-- Notifications -->
        <NotificationsMenu
          class="me-2"
          :items="notifications"
          :count="notificationCount"
          :location="menuLocation"
          :offset="menuOffset"
          @select="handleNotificationSelect"
          @view-all="handleViewAllNotifications"
        />

        <!-- Theme Toggle -->
        <v-btn
          icon
          variant="text"
          size="small"
          class="me-2"
          :aria-label="$t('header.toggleTheme')"
          :aria-pressed="isDark"
          @click="toggle"
          @keydown.enter.prevent="toggle"
        >
          <v-icon>{{ isDark ? 'mdi-weather-night' : 'mdi-weather-sunny' }}</v-icon>
        </v-btn>

        <!-- Language Toggle -->
        <v-menu :location="menuLocation" :offset="menuOffset" transition="fade-transition">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon variant="text" size="small" class="me-2">
              <v-icon>mdi-translate</v-icon>
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item @click="setLang('en')">
              <v-list-item-title>English</v-list-item-title>
            </v-list-item>
            <v-list-item @click="setLang('ar')">
              <v-list-item-title>العربية</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <!-- User Profile -->
        <UserProfileMenu
          :location="menuLocation"
          :offset="menuOffset"
          :name="userName"
          :role="userRole"
          :avatar="userAvatar"
          :items="userMenuItems"
          @navigate="handleUserNavigate"
          @logout="logout"
        />
      </div>
    </div>

    <!-- Notifications menu now handled above via activator -->
  </v-app-bar>
</template>

<script setup lang="ts">
import { useDisplay, useLocale } from 'vuetify'
import { useAppStore } from '~/stores/app'
import GlobalSearchInput from '~/components/search/GlobalSearchInput.vue'
import UserProfileMenu from '~/components/user/UserProfileMenu.vue'
import NotificationsMenu from '~/components/notifications/NotificationsMenu.vue'

// Composables
const { mobile } = useDisplay()
const vuetifyLocale = useLocale()
const appStore = useAppStore()
const { t, locale, setLocale: i18nSetLocale } = useI18n()

// State
const searchQuery = ref('')
const showNotifications = ref(false)
const notificationCount = ref(3)

// Computed
const isArabic = computed(() => locale.value === 'ar')
const menuLocation = computed(() => (isArabic.value ? 'bottom start' : 'bottom end'))
const menuOffset = computed<[number, number]>(() => [0, 8])

// Reflect HTML dir/lang immediately on language change
watch(locale, (code) => {
  if (import.meta.client) {
    document.documentElement.setAttribute('lang', code)
    document.documentElement.setAttribute('dir', code === 'ar' ? 'rtl' : 'ltr')
  }
}, { immediate: true })

// Date range handled by DateRangePicker component and store

const userMenuItems = computed(() => [
  {
    title: t('navigation.profile'),
    icon: 'mdi-account-outline',
    action: () => navigateTo('/profile')
  },
  {
    title: t('navigation.settings'),
    icon: 'mdi-cog-outline',
    action: () => navigateTo('/settings')
  },
  {
    title: t('navigation.help'),
    icon: 'mdi-help-circle-outline',
    action: () => navigateTo('/help')
  },
  {
    title: t('header.logout'),
    icon: 'mdi-logout',
    action: () => logout()
  }
])

const notifications = ref([
  {
    id: 1,
    title: 'New transaction received',
    time: '2 minutes ago',
    icon: 'mdi-currency-btc',
    color: 'success' as const
  },
  {
    id: 2,
    title: 'Wallet backup completed',
    time: '1 hour ago',
    icon: 'mdi-shield-check',
    color: 'info' as const
  },
  {
    id: 3,
    title: 'Security alert',
    time: '3 hours ago',
    icon: 'mdi-alert',
    color: 'warning' as const
  }
])

const { isDark, toggle } = useAppTheme()

// User info (could later come from auth store)
const userName = ref('Robin Jivan')
const userRole = ref('Admin')
const userAvatar = ref('https://cdn.vuetifyjs.com/images/john.jpg')

const handleUserNavigate = (to: string) => navigateTo(to)

const handleNotificationSelect = () => {}
const handleViewAllNotifications = () => {}

const setLang = (code = 'en') => {
  if (code !== 'en' && code !== 'ar') return
  if (locale.value === code) return
  appStore.setLocale(code)
  locale.value = code
  i18nSetLocale(code)
  vuetifyLocale.current.value = code
  if (import.meta.client) localStorage.setItem('locale', code)
}

const logout = () => {
  // Implement logout functionality
  console.log('Logging out...')
}
</script>

<style scoped>
.app-header {
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
}

.header-content {
  height: 100%;
}

.logo-container {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.logo-container:hover {
  opacity: 0.8;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
  border-radius: 8px;
}

.search-field {
  max-width: 100%;
}

.search-field :deep(.v-field) {
  background-color: rgba(var(--v-theme-surface-variant), 0.5);
  border-radius: 24px;
}

.download-btn {
  border-radius: 20px;
  text-transform: none;
  font-weight: 500;
}

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

.notifications-card {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.notification-item {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.06);
}

.notification-item:last-child {
  border-bottom: none;
}

.date-range {
  padding: 8px 12px;
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 8px;
}

@media (max-width: 960px) {
  .header-center {
    margin: 0 16px;
  }
  
  .date-range {
    display: none !important;
  }
}

@media (max-width: 600px) {
  .header-center {
    margin: 0 8px;
  }
  
  .user-info {
    display: none !important;
  }
}
</style>