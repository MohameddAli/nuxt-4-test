<template>
  <v-navigation-drawer
    v-model="appStore.sidebarOpen"
    app
    :rail="railMode"
    :temporary="mobile"
    :permanent="!mobile"
    width="280"
    rail-width="72"
    class="app-sidebar"
    color="surface"
    border="e"
  >
    <!-- Sidebar Header -->
    <div class="sidebar-header pa-4">
      <div v-if="!railMode" class="d-flex align-center justify-space-between">
        <div class="logo-section d-flex align-center" :aria-label="$t('navigation.overview')">
          <div class="logo-icon">
            <v-icon size="28" color="primary">mdi-shield-check</v-icon>
          </div>
          <h3 class="logo-text ml-2 text-h6 font-weight-bold">Prime</h3>
        </div>
        <v-btn
          v-if="!mobile"
          icon
          variant="text"
          size="small"
          @click="appStore.toggleSidebarMini"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
      </div>
      <div v-else class="text-center">
        <v-btn
          icon
          variant="text"
          size="small"
          @click="appStore.toggleSidebarMini"
        >
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </div>

    <v-divider />

    <!-- Navigation Menu -->
    <v-list class="navigation-list pa-2" nav>
      <template v-for="(item, index) in navigationItems" :key="index">
        <!-- Menu Group with Children -->
        <v-list-group
          v-if="item.children"
          :value="item.value"
          class="nav-group mb-1"
          :expand-icon="railMode ? '' : undefined"
          :collapse-icon="railMode ? '' : undefined"
        >
          <template #activator="{ props }">
            <v-list-item
              v-if="railMode"
              v-bind="props"
              class="nav-item d-flex align-center pa-0"
              rounded="lg"
              :min-height="48"
              :style="railItemVars"
            >
              <template #prepend>
                <div class="w-100 d-flex justify-center">
                  <v-icon :icon="item.icon" size="20" />
                </div>
              </template>
              <v-tooltip activator="parent" location="end">
                {{ $t(item.title) }}
              </v-tooltip>
            </v-list-item>
            <v-list-item
              v-else
              v-bind="props"
              class="nav-item"
              rounded="lg"
            >
              <template #prepend>
                <v-icon :icon="item.icon" size="20" />
              </template>
              <v-list-item-title class="nav-title">
                {{ $t(item.title) }}
              </v-list-item-title>
            </v-list-item>
          </template>

          <template v-for="child in item.children" :key="child.value">
            <v-list-item
              v-if="railMode"
              :to="child.to"
              :value="child.value"
              class="nav-child-item d-flex align-center pa-0"
              rounded="lg"
              :min-height="48"
              :style="railItemVars"
            >
              <template #prepend>
                <div class="w-100 d-flex justify-center">
                  <v-icon :icon="child.icon" size="18" />
                </div>
              </template>
              <v-tooltip activator="parent" location="end">
                {{ $t(child.title) }}
              </v-tooltip>
            </v-list-item>
            <v-list-item
              v-else
              :to="child.to"
              :value="child.value"
              class="nav-child-item"
              rounded="lg"
            >
              <template #prepend>
                <v-icon :icon="child.icon" size="18" />
              </template>
              <v-list-item-title class="nav-title">
                {{ $t(child.title) }}
              </v-list-item-title>
            </v-list-item>
          </template>
        </v-list-group>

        <!-- Regular Menu Item -->
          <v-list-item
            v-else-if="railMode"
            :to="item.to"
            :value="item.value"
            class="nav-item mb-1 d-flex align-center pa-0"
            rounded="lg"
            :min-height="48"
            :class="isActiveRoute(item.to) ? 'nav-item-active' : ''"
            :style="railItemVars"
          >
            <template #prepend>
              <div class="w-100 d-flex justify-center">
                <v-icon :icon="item.icon" size="20" />
              </div>
            </template>
            <v-tooltip activator="parent" location="end">
              {{ $t(item.title) }}
            </v-tooltip>
          </v-list-item>
          <v-list-item
            v-else
            :to="item.to"
            :value="item.value"
            class="nav-item mb-1"
            rounded="lg"
            :class="isActiveRoute(item.to) ? 'nav-item-active' : ''"
          >
            <template #prepend>
              <v-icon :icon="item.icon" size="20" />
            </template>
            <v-list-item-title class="nav-title">
              {{ $t(item.title) }}
            </v-list-item-title>
            <template v-if="item.badge" #append>
              <v-chip size="x-small" :color="item.badgeColor || 'primary'" variant="flat">
                {{ item.badge }}
              </v-chip>
            </template>
          </v-list-item>

        <!-- Divider -->
        <v-divider v-if="item.divider" class="my-3 mx-4" />
      </template>
    </v-list>

    <!-- Bottom Section -->
    <template #append>
      <div class="sidebar-footer pa-4">
        <v-divider class="mb-4" />

        <!-- Support -->
        <v-list-item
          class="nav-item mb-2"
          rounded="lg"
          :min-height="48"
          :class="railMode ? 'd-flex justify-center align-center' : ''"
          :style="railMode ? railItemVars : undefined"
          @click="openSupport"
        >
          <template v-if="railMode" #prepend>
            <div class="w-100 d-flex justify-center">
              <v-icon icon="mdi-help-circle-outline" size="20" />
            </div>
          </template>
          <template v-else #prepend>
            <v-icon icon="mdi-help-circle-outline" size="20" />
          </template>
          <v-list-item-title v-if="!railMode" class="nav-title">
            {{ $t('navigation.support') }}
          </v-list-item-title>
          <v-tooltip v-if="railMode" activator="parent" location="end">
            {{ $t('navigation.support') }}
          </v-tooltip>
        </v-list-item>

        <!-- Settings -->
        <v-list-item
          to="/settings"
          class="nav-item mb-4"
          rounded="lg"
          :min-height="48"
          :class="railMode ? 'd-flex justify-center align-center' : ''"
          :style="railMode ? railItemVars : undefined"
        >
          <template v-if="railMode" #prepend>
            <div class="w-100 d-flex justify-center">
              <v-icon icon="mdi-cog-outline" size="20" />
            </div>
          </template>
          <template v-else #prepend>
            <v-icon icon="mdi-cog-outline" size="20" />
          </template>
          <v-list-item-title v-if="!railMode" class="nav-title">
            {{ $t('navigation.settings') }}
          </v-list-item-title>
          <v-tooltip v-if="railMode" activator="parent" location="end">
            {{ $t('navigation.settings') }}
          </v-tooltip>
        </v-list-item>

        <!-- Logout (always red) -->
        <v-list-item
          class="nav-item logout-item mb-4"
          rounded="lg"
          :min-height="48"
          :class="railMode ? 'd-flex justify-center align-center' : ''"
          :style="railMode ? railItemVars : undefined"
          @click="onLogout"
        >
          <template v-if="railMode" #prepend>
            <div class="w-100 d-flex justify-center">
              <v-icon icon="mdi-logout" size="20" />
            </div>
          </template>
          <template v-else #prepend>
            <v-icon icon="mdi-logout" size="20" />
          </template>
          <v-list-item-title v-if="!railMode" class="nav-title">
            {{ $t('header.logout') }}
          </v-list-item-title>
          <v-tooltip v-if="railMode" activator="parent" location="end">
            {{ $t('header.logout') }}
          </v-tooltip>
        </v-list-item>

        <!-- User Profile Card -->
        <div v-if="!railMode" class="user-profile-card">
          <v-card class="user-card" variant="tonal" rounded="lg">
            <v-card-text class="pa-3">
              <div class="d-flex align-center">
                <v-avatar size="40" class="mr-3">
                  <v-img
                    src="https://cdn.vuetifyjs.com/images/john.jpg"
                    alt="Robin Jivan"
                  />
                </v-avatar>
                <div class="user-details flex-grow-1">
                  <div class="user-name text-body-2 font-weight-medium">
                    Robin Jivan
                  </div>
                  <div class="user-email text-caption text-medium-emphasis">
                    robin@prime.com
                  </div>
                </div>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  @click="showUserMenu = !showUserMenu"
                >
                  <v-icon size="16">mdi-dots-vertical</v-icon>
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
import { useAppStore } from "~/stores/app";

// Composables
const { mobile } = useDisplay();
const appStore = useAppStore();
const route = useRoute();

// State
const showUserMenu = ref(false);

// Navigation items matching the design
const navigationItems = ref([
  {
    title: 'navigation.overview',
    icon: "mdi-view-dashboard-outline",
    to: "/",
    value: "overview",
  },
  {
    title: 'navigation.chat',
    icon: "mdi-chat-outline",
    to: "/chat",
    value: "chat",
  },
  {
    title: 'navigation.inbox',
    icon: "mdi-inbox-outline",
    to: "/inbox",
    value: "inbox",
    badge: "12",
    badgeColor: "error",
  },
  {
    title: 'navigation.cards',
    icon: "mdi-credit-card-outline",
    to: "/cards",
    value: "cards",
  },
  {
    title: 'navigation.customers',
    icon: "mdi-account-group-outline",
    to: "/customers",
    value: "customers",
  },
  {
    title: 'navigation.movies',
    icon: "mdi-movie-outline",
    to: "/movies",
    value: "movies",
    divider: true,
  },
  {
    title: 'navigation.analytics',
    icon: "mdi-chart-line",
    value: "analytics",
    children: [
      {
        title: 'navigation.dashboard',
        icon: "mdi-chart-box-outline",
        to: "/analytics/dashboard",
        value: "analytics-dashboard",
      },
      {
        title: 'navigation.reports',
        icon: "mdi-file-chart-outline",
        to: "/analytics/reports",
        value: "analytics-reports",
      },
      {
        title: 'navigation.insights',
        icon: "mdi-lightbulb-outline",
        to: "/analytics/insights",
        value: "analytics-insights",
      },
    ],
  },
  {
    title: 'navigation.transactions',
    icon: "mdi-swap-horizontal",
    value: "transactions",
    children: [
      {
        title: 'navigation.allTransactions',
        icon: "mdi-format-list-bulleted",
        to: "/transactions",
        value: "all-transactions",
      },
      {
        title: 'navigation.pending',
        icon: "mdi-clock-outline",
        to: "/transactions/pending",
        value: "pending-transactions",
      },
      {
        title: 'navigation.completed',
        icon: "mdi-check-circle-outline",
        to: "/transactions/completed",
        value: "completed-transactions",
      },
    ],
  },
  {
    title: 'navigation.wallets',
    icon: "mdi-wallet-outline",
    value: "wallets",
    children: [
      {
        title: 'navigation.personal',
        icon: "mdi-account-outline",
        to: "/wallets/personal",
        value: "personal-wallet",
      },
      {
        title: 'navigation.corporate',
        icon: "mdi-office-building-outline",
        to: "/wallets/corporate",
        value: "corporate-wallet",
      },
      {
        title: 'navigation.investment',
        icon: "mdi-trending-up",
        to: "/wallets/investment",
        value: "investment-wallet",
      },
    ],
  },
]);

// Computed
const railMode = computed(() => !mobile.value && appStore.sidebarMini);

// Vuetify-only centering using CSS variables and utility classes
const railItemVars = {
  '--v-list-item-padding-start': '0',
  '--v-list-item-padding-end': '0',
  '--v-list-item-prepend-width': '100%',
  '--v-list-item-prepend-margin-after': '0',
};

// Methods
const isActiveRoute = (path = "") => {
  return route.path === path;
};

const openSupport = () => {
  // Open support modal or navigate to support page
  console.log("Opening support...");
};

// Logout handler (replace with real auth later)
const onLogout = () => {
  // TODO: integrate with real auth logout if available
  console.log("Logging out...");
  // Example: await auth.logout(); navigateTo('/login')
};

// Watch for route changes to close mobile sidebar
watch(
  () => route.path,
  () => {
    if (mobile.value) {
      appStore.sidebarOpen = false;
    }
  }
);
</script>

<style scoped>
.app-sidebar {
  border-right: 1px solid rgba(var(--v-border-color), 0.12);
}

.sidebar-header {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.06);
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-primary)),
    rgb(var(--v-theme-secondary))
  );
  border-radius: 8px;
}

.navigation-list {
  flex: 1;
  overflow-y: auto;
}

/* Icon alignment improvements for compact mode */
.nav-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.nav-item {
  margin-bottom: 4px;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.nav-item-active {
  background-color: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
}

.nav-item-active :deep(.v-icon) {
  color: rgb(var(--v-theme-primary));
}

.nav-child-item {
  margin-bottom: 2px;
}

.v-navigation-drawer--rail .nav-child-item {
  margin-left: 0 !important;
}

.nav-title {
  font-size: 0.875rem;
  font-weight: 500;
}

.nav-group :deep(.v-list-group__items) {
  padding-left: 0;
}

.user-profile-card {
  margin-top: 16px;
}

.user-card {
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  border: 1px solid rgba(var(--v-border-color), 0.08);
}

.user-details {
  min-width: 0;
}

.user-name {
  line-height: 1.2;
  margin-bottom: 2px;
}

.user-email {
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-footer {
  border-top: 1px solid rgba(var(--v-border-color), 0.06);
}

/* Rail mode adjustments for perfect icon centering */
.v-navigation-drawer--rail .navigation-list {
  padding: 8px 0;
}

/* Ensure the list itself has no side padding in rail */
.v-navigation-drawer--rail :deep(.v-list) {
  padding-inline: 0 !important;
}

.v-navigation-drawer--rail :deep(.v-list-item) {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 48px !important;
  height: 48px !important;
  margin: 4px auto !important;
  padding: 0 !important;
  min-height: 48px !important;
  border-radius: 12px !important;
  position: relative !important; /* allow absolute centering of children */
}

.v-navigation-drawer--rail :deep(.v-list-item--nav) {
  padding-inline-start: 0 !important;
  padding-inline-end: 0 !important;
}

/* Hard center the prepend container regardless of LTR/RTL */
.v-navigation-drawer--rail :deep(.v-list-item__prepend) {
  position: absolute !important;
  inset: 0 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  margin-inline-start: 0 !important;
  margin-inline-end: 0 !important;
  padding: 0 !important;
  z-index: 1; /* above overlay for proper centering */
}

.v-navigation-drawer--rail :deep(.v-list-item__prepend .v-icon) {
  display: block !important;
  margin: 0 !important;
}

.v-navigation-drawer--rail :deep(.v-list-item__content) {
  display: none !important;
}

.v-navigation-drawer--rail :deep(.v-list-item__append) {
  display: none !important;
}

.v-navigation-drawer--rail :deep(.v-list-group__items) {
  padding: 0 !important;
}

.v-navigation-drawer--rail :deep(.v-list-group__items .v-list-item) {
  margin-left: auto !important;
  margin-right: auto !important;
}

/* Hide group expand icon in rail mode */
.v-navigation-drawer--rail :deep(.v-list-group__header .v-list-item__append) {
  display: none !important;
}

.v-navigation-drawer--rail .sidebar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0;
}

.v-navigation-drawer--rail .sidebar-header :deep(.v-btn) {
  width: 48px !important;
  height: 48px !important;
  margin: 0 auto !important;
}

.v-navigation-drawer--rail .sidebar-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.v-navigation-drawer--rail .sidebar-footer :deep(.v-list-item) {
  margin: 4px auto !important;
}

/* Logout item: always red in light and dark */
.logout-item,
.logout-item :deep(.v-list-item-title),
.logout-item :deep(.v-icon) {
  color: #d32f2f !important; /* nice red */
}

.logout-item:hover {
  background-color: rgba(211, 47, 47, 0.12) !important; /* red hover */
}

/* Scrollbar styling */
.navigation-list::-webkit-scrollbar {
  width: 4px;
}

.navigation-list::-webkit-scrollbar-track {
  background: transparent;
}

.navigation-list::-webkit-scrollbar-thumb {
  background-color: rgba(var(--v-border-color), 0.2);
  border-radius: 2px;
}

.navigation-list::-webkit-scrollbar-thumb:hover {
  background-color: rgba(var(--v-border-color), 0.3);
}

/* Dark mode tooltip styling */
:deep(.v-tooltip .v-overlay__content) {
  background: rgba(var(--v-theme-surface), 0.95);
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
</style>
