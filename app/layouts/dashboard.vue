<template>
  <v-layout>
    <!-- Error Boundary للتعامل مع أي أخطاء في المكونات -->
    <ErrorBoundary>
      <AppSidebar ref="sidebar" />
      <AppNavbar @toggle-drawer="toggleDrawer" />

      <v-main :class="[$i18n.locale === 'ar' ? 'main-rtl' : 'main-ltr']">
        <v-container fluid class="fill-height pa-3 pa-sm-4">
          <slot />
        </v-container>
      </v-main>
    </ErrorBoundary>
  </v-layout>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const { locale } = useI18n()
const { mobile } = useDisplay()
const sidebar = ref(null)
const authStore = useAuthStore()

const toggleDrawer = () => {
  if (sidebar.value) {
    sidebar.value.drawer = !sidebar.value.drawer
  }
}

// فحص المصادقة عند تحميل الـ layout
onMounted(() => {
  // إذا لم يكن المستخدم مصادق عليه، وجهه لصفحة unauthorized
  if (!authStore.isAuthenticated) {
    navigateTo('/unauthorized')
  }
})
</script>

<style scoped>
.main-ltr,
.main-rtl {
  padding-top: 64px !important;
  transition: all 0.3s ease;
  width: 100% !important;
}

/* Adjust padding when sidebar is open */
:deep(.v-navigation-drawer--open:not(.v-navigation-drawer--rail)) ~ .main-ltr {
  padding-left: 280px !important;
}

:deep(.v-navigation-drawer--open:not(.v-navigation-drawer--rail)) ~ .main-rtl {
  padding-right: 280px !important;
}

/* Adjust padding when sidebar is in rail mode */
:deep(.v-navigation-drawer--rail) ~ .main-ltr {
  padding-left: 72px !important;
}

:deep(.v-navigation-drawer--rail) ~ .main-rtl {
  padding-right: 72px !important;
}

/* Mobile responsive adjustments */
@media (max-width: 960px) {
  .main-ltr,
  .main-rtl {
    padding-left: 0 !important;
    padding-right: 0 !important;
    padding-top: 56px !important;
  }
}

.v-container {
  max-width: 100% !important;
  height: calc(100vh - 64px);
  padding: 16px !important;
}

/* Ensure full height utilization */
:deep(.v-main__wrap) {
  height: 100%;
}
</style>