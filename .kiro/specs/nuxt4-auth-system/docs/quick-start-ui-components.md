# Quick Start: UI Components

## 🚀 5-Minute UI Setup

Get professional authentication UI components working with Vuetify 3, i18n, and theming in just 5 minutes!

## Step 1: Basic Authentication UI

### Login Form

```vue
<!-- pages/auth/login.vue -->
<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12" rounded="lg">
          <v-card-title class="text-center pa-6">
            <h1 class="text-h4">{{ $t("auth.login.title") }}</h1>
          </v-card-title>

          <v-card-text class="pa-6">
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="form.username"
                :label="$t('auth.login.username')"
                :error-messages="errors.username"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                class="mb-3"
                required
              />

              <v-text-field
                v-model="form.password"
                :label="$t('auth.login.password')"
                :type="showPassword ? 'text' : 'password'"
                :error-messages="errors.password"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                class="mb-3"
                required
              />

              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="loading"
                class="mb-3"
              >
                {{ $t("auth.login.submit") }}
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// Middleware for guest-only access
definePageMeta({
  middleware: 'guest',
  layout: 'auth'
})

const { login } = useAuth()
const { t } = useI18n()

const form = reactive({
  username: '',
  password: ''
})

const errors = reactive({
  username: [],
  password: []
})

const showPassword = ref(false)
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  errors.username = []
  errors.password = []

  try {
    const result = await login(form.username, form.password)

    if (result.success) {
      // Redirect to dashboard or return URL
      const returnUrl = useRoute().query.returnUrl as string
      await navigateTo(returnUrl || '/dashboard')
    } else {
      // Handle login error
      if (result.errors) {
        Object.assign(errors, result.errors)
      } else {
        // Show general error
        useSnackbar().showError(result.message || t('auth.errors.loginFailed'))
      }
    }
  } catch (error) {
    useSnackbar().showError(t('auth.errors.loginFailed'))
  } finally {
    loading.value = false
  }
}
</script>
```

### Unauthorized Page

```vue
<!-- pages/unauthorized.vue -->
<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12 text-center" rounded="lg">
          <v-card-item class="pa-8">
            <v-avatar size="80" color="warning" class="mb-4">
              <v-icon size="40" color="white">mdi-shield-lock-outline</v-icon>
            </v-avatar>

            <v-card-title class="text-h5 mb-2">
              {{ $t("auth.unauthorized.title") }}
            </v-card-title>

            <v-card-subtitle class="text-body-1 mb-4">
              {{ $t("auth.unauthorized.message") }}
            </v-card-subtitle>

            <v-card-text v-if="requiredPermission" class="text-caption">
              {{ $t("auth.unauthorized.requiredPermission") }}:
              <code>{{ requiredPermission }}</code>
            </v-card-text>
          </v-card-item>

          <v-card-actions class="pa-6">
            <v-btn
              color="primary"
              variant="elevated"
              block
              size="large"
              @click="goToLogin"
            >
              {{ $t("auth.login.title") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const route = useRoute()
const requiredPermission = route.query.permission as string

const goToLogin = () => {
  navigateTo({
    path: '/auth/login',
    query: { returnUrl: route.fullPath }
  })
}
</script>
```

## Step 2: Navigation Components

### User Menu

```vue
<!-- components/layout/UserMenu.vue -->
<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn v-bind="props" icon variant="text" class="ml-2">
        <v-avatar size="32">
          <v-img v-if="user?.avatar" :src="user.avatar" :alt="user.name" />
          <v-icon v-else>mdi-account-circle</v-icon>
        </v-avatar>
      </v-btn>
    </template>

    <v-list>
      <!-- User info -->
      <v-list-item>
        <v-list-item-title class="font-weight-bold">
          {{ user?.name }}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ user?.email }}
        </v-list-item-subtitle>
      </v-list-item>

      <v-divider />

      <!-- Profile link -->
      <v-list-item to="/profile" prepend-icon="mdi-account">
        <v-list-item-title>{{ $t("nav.profile") }}</v-list-item-title>
      </v-list-item>

      <!-- Settings (admin only) -->
      <v-list-item
        v-if="hasPermission('settings.view')"
        to="/settings"
        prepend-icon="mdi-cog"
      >
        <v-list-item-title>{{ $t("nav.settings") }}</v-list-item-title>
      </v-list-item>

      <v-divider />

      <!-- Logout -->
      <v-list-item @click="handleLogout" prepend-icon="mdi-logout">
        <v-list-item-title>{{ $t("auth.logout") }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
const { user, hasPermission, logout } = useAuth();

const handleLogout = async () => {
  await logout();
  navigateTo("/auth/login");
};
</script>
```

### Navigation Drawer

```vue
<!-- components/layout/NavigationDrawer.vue -->
<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="rail"
    permanent
    @click="rail = false"
  >
    <!-- Header -->
    <v-list-item prepend-avatar="/logo.png" :title="$t('app.name')" nav>
      <template #append>
        <v-btn
          variant="text"
          icon="mdi-chevron-left"
          @click.stop="rail = !rail"
        />
      </template>
    </v-list-item>

    <v-divider />

    <!-- Navigation items -->
    <v-list density="compact" nav>
      <!-- Dashboard (always visible) -->
      <v-list-item
        prepend-icon="mdi-view-dashboard"
        :title="$t('nav.dashboard')"
        to="/dashboard"
      />

      <!-- Users (permission-based) -->
      <v-list-item
        v-if="canViewUsers"
        prepend-icon="mdi-account-group"
        :title="$t('nav.users')"
        to="/users"
      />

      <!-- Reports (permission-based) -->
      <v-list-item
        v-if="canViewReports"
        prepend-icon="mdi-chart-line"
        :title="$t('nav.reports')"
        to="/reports"
      />

      <!-- Admin section (role-based) -->
      <v-list-group v-if="isAdmin" value="admin">
        <template #activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-cog"
            :title="$t('nav.admin')"
          />
        </template>

        <v-list-item
          prepend-icon="mdi-account-cog"
          :title="$t('nav.userManagement')"
          to="/admin/users"
        />

        <v-list-item
          prepend-icon="mdi-shield-account"
          :title="$t('nav.permissions')"
          to="/admin/permissions"
        />

        <v-list-item
          prepend-icon="mdi-cog-outline"
          :title="$t('nav.systemSettings')"
          to="/admin/settings"
        />
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
const { hasPermission, hasRole } = useAuth();

const drawer = ref(true);
const rail = ref(false);

// Permission-based navigation
const canViewUsers = hasPermission("users.view");
const canViewReports = hasPermission("reports.view");
const isAdmin = hasRole("admin");
</script>
```

## Step 3: Loading and Error States

### Loading Overlay

```vue
<!-- components/ui/LoadingOverlay.vue -->
<template>
  <v-overlay
    :model-value="loading"
    class="align-center justify-center"
    persistent
  >
    <div class="text-center">
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
        class="mb-4"
      />
      <div class="text-h6">{{ message || $t("common.loading") }}</div>
    </div>
  </v-overlay>
</template>

<script setup>
interface Props {
  loading: boolean
  message?: string
}

defineProps<Props>()
</script>
```

### Error Alert

```vue
<!-- components/ui/ErrorAlert.vue -->
<template>
  <v-alert
    v-if="error"
    type="error"
    variant="tonal"
    closable
    class="mb-4"
    @click:close="$emit('close')"
  >
    <v-alert-title v-if="title">{{ title }}</v-alert-title>
    {{ error }}
  </v-alert>
</template>

<script setup>
interface Props {
  error?: string | null
  title?: string
}

defineProps<Props>()
defineEmits<{
  close: []
}>()
</script>
```

### Network Status Indicator

```vue
<!-- components/ui/NetworkStatus.vue -->
<template>
  <v-snackbar
    v-model="showOffline"
    :timeout="-1"
    color="warning"
    location="top"
  >
    <v-icon start>mdi-wifi-off</v-icon>
    {{ $t("network.offline") }}
  </v-snackbar>

  <v-snackbar
    v-model="showOnline"
    :timeout="3000"
    color="success"
    location="top"
  >
    <v-icon start>mdi-wifi</v-icon>
    {{ $t("network.online") }}
  </v-snackbar>
</template>

<script setup>
const { isOnline } = useNetworkStatus();

const showOffline = ref(false);
const showOnline = ref(false);
const wasOffline = ref(false);

watch(isOnline, (online) => {
  if (!online) {
    showOffline.value = true;
    wasOffline.value = true;
  } else {
    showOffline.value = false;
    if (wasOffline.value) {
      showOnline.value = true;
      wasOffline.value = false;
    }
  }
});
</script>
```

## Step 4: Form Components

### Permission-Based Form Fields

```vue
<!-- components/forms/UserForm.vue -->
<template>
  <v-form @submit.prevent="handleSubmit">
    <!-- Basic fields (everyone can see) -->
    <v-text-field
      v-model="form.name"
      :label="$t('user.name')"
      :error-messages="errors.name"
      variant="outlined"
      class="mb-3"
      required
    />

    <v-text-field
      v-model="form.email"
      :label="$t('user.email')"
      :error-messages="errors.email"
      variant="outlined"
      class="mb-3"
      required
    />

    <!-- Admin-only fields -->
    <template v-if="canManageUsers">
      <v-select
        v-model="form.role"
        :items="availableRoles"
        :label="$t('user.role')"
        :error-messages="errors.role"
        variant="outlined"
        class="mb-3"
      />

      <v-switch
        v-model="form.isActive"
        :label="$t('user.isActive')"
        color="primary"
        class="mb-3"
      />
    </template>

    <!-- Manager-level fields -->
    <v-select
      v-if="canAssignDepartment"
      v-model="form.department"
      :items="departments"
      :label="$t('user.department')"
      variant="outlined"
      class="mb-3"
    />

    <!-- Action buttons -->
    <v-card-actions>
      <v-spacer />
      <v-btn variant="text" @click="$emit('cancel')">
        {{ $t("common.cancel") }}
      </v-btn>
      <v-btn type="submit" color="primary" :loading="loading">
        {{ isEdit ? $t("common.update") : $t("common.create") }}
      </v-btn>
    </v-card-actions>
  </v-form>
</template>

<script setup>
interface Props {
  user?: User | null
  loading?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  submit: [data: any]
  cancel: []
}>()

const { hasPermission } = useAuth()

const isEdit = computed(() => !!props.user)
const canManageUsers = hasPermission('users.manage')
const canAssignDepartment = hasPermission('users.assign.department')

const form = reactive({
  name: props.user?.name || '',
  email: props.user?.email || '',
  role: props.user?.role || '',
  isActive: props.user?.isActive ?? true,
  department: props.user?.department || ''
})

const errors = reactive({
  name: [],
  email: [],
  role: []
})

const availableRoles = ['user', 'editor', 'admin']
const departments = ['IT', 'HR', 'Finance', 'Marketing']

const handleSubmit = () => {
  emit('submit', { ...form })
}
</script>
```

## Step 5: Data Display Components

### Permission-Based Data Table

```vue
<!-- components/ui/DataTable.vue -->
<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <span>{{ title }}</span>
      <v-spacer />
      <v-btn
        v-if="canCreate"
        color="primary"
        prepend-icon="mdi-plus"
        @click="$emit('create')"
      >
        {{ $t("common.create") }}
      </v-btn>
    </v-card-title>

    <v-data-table
      :headers="visibleHeaders"
      :items="items"
      :loading="loading"
      :items-per-page="itemsPerPage"
      class="elevation-1"
    >
      <!-- Custom slots for each column -->
      <template #item.actions="{ item }">
        <div class="d-flex gap-2">
          <v-btn
            v-if="canView"
            icon="mdi-eye"
            size="small"
            variant="text"
            @click="$emit('view', item)"
          />
          <v-btn
            v-if="canEdit"
            icon="mdi-pencil"
            size="small"
            variant="text"
            @click="$emit('edit', item)"
          />
          <v-btn
            v-if="canDelete"
            icon="mdi-delete"
            size="small"
            variant="text"
            color="error"
            @click="$emit('delete', item)"
          />
        </div>
      </template>

      <!-- Status column with chips -->
      <template #item.status="{ item }">
        <v-chip
          :color="getStatusColor(item.status)"
          size="small"
          variant="tonal"
        >
          {{ $t(`status.${item.status}`) }}
        </v-chip>
      </template>

      <!-- Role column with permission check -->
      <template #item.role="{ item }">
        <v-chip v-if="canViewRoles" size="small" variant="outlined">
          {{ $t(`roles.${item.role}`) }}
        </v-chip>
        <span v-else>{{ $t("common.hidden") }}</span>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup>
interface Props {
  title: string
  items: any[]
  loading?: boolean
  itemsPerPage?: number
}

defineProps<Props>()
defineEmits<{
  create: []
  view: [item: any]
  edit: [item: any]
  delete: [item: any]
}>()

const { hasPermission } = useAuth()

// Permission checks
const canCreate = hasPermission('users.create')
const canView = hasPermission('users.view')
const canEdit = hasPermission('users.edit')
const canDelete = hasPermission('users.delete')
const canViewRoles = hasPermission('users.roles.view')

// Base headers
const baseHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Status', key: 'status' },
]

// Permission-based headers
const visibleHeaders = computed(() => {
  const headers = [...baseHeaders]

  if (canViewRoles) {
    headers.push({ title: 'Role', key: 'role' })
  }

  // Add actions column if user has any action permissions
  if (canView || canEdit || canDelete) {
    headers.push({ title: 'Actions', key: 'actions', sortable: false })
  }

  return headers
})

const getStatusColor = (status: string) => {
  const colors = {
    active: 'success',
    inactive: 'warning',
    suspended: 'error'
  }
  return colors[status] || 'default'
}
</script>
```

## 🎨 Theming and Customization

### Custom Theme Configuration

```typescript
// app/theme.ts
import { createVuetify } from "vuetify";

export default createVuetify({
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        colors: {
          primary: "#1976D2",
          secondary: "#424242",
          accent: "#82B1FF",
          error: "#FF5252",
          info: "#2196F3",
          success: "#4CAF50",
          warning: "#FFC107",
          // Custom auth colors
          authPrimary: "#1976D2",
          authSecondary: "#F5F5F5",
          authError: "#FF5252",
        },
      },
      dark: {
        colors: {
          primary: "#2196F3",
          secondary: "#616161",
          accent: "#FF4081",
          error: "#FF5252",
          info: "#2196F3",
          success: "#4CAF50",
          warning: "#FFC107",
          // Custom auth colors for dark theme
          authPrimary: "#2196F3",
          authSecondary: "#424242",
          authError: "#FF5252",
        },
      },
    },
  },
});
```

### RTL Support for Arabic

```vue
<!-- layouts/auth.vue -->
<template>
  <v-app :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'">
    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

<script setup>
// Watch for locale changes and update direction
const { locale } = useI18n();

watch(
  locale,
  (newLocale) => {
    document.dir = newLocale === "ar" ? "rtl" : "ltr";
  },
  { immediate: true }
);
</script>
```

## 🔧 Common UI Patterns

### Confirmation Dialog

```vue
<!-- components/ui/ConfirmDialog.vue -->
<template>
  <v-dialog v-model="dialog" max-width="400">
    <v-card>
      <v-card-title class="text-h6">
        {{ title || $t("common.confirm") }}
      </v-card-title>

      <v-card-text>
        {{ message }}
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="cancel">
          {{ $t("common.cancel") }}
        </v-btn>
        <v-btn color="primary" variant="elevated" @click="confirm">
          {{ $t("common.confirm") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
interface Props {
  modelValue: boolean
  title?: string
  message: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const confirm = () => {
  emit('confirm')
  dialog.value = false
}

const cancel = () => {
  emit('cancel')
  dialog.value = false
}
</script>
```

### Snackbar Notifications

```typescript
// composables/useSnackbar.ts
export const useSnackbar = () => {
  const snackbar = ref({
    show: false,
    message: "",
    color: "info",
    timeout: 4000,
  });

  const showSnackbar = (message: string, color = "info", timeout = 4000) => {
    snackbar.value = {
      show: true,
      message,
      color,
      timeout,
    };
  };

  const showSuccess = (message: string) => {
    showSnackbar(message, "success");
  };

  const showError = (message: string) => {
    showSnackbar(message, "error", 6000);
  };

  const showWarning = (message: string) => {
    showSnackbar(message, "warning");
  };

  const showInfo = (message: string) => {
    showSnackbar(message, "info");
  };

  return {
    snackbar: readonly(snackbar),
    showSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
```

## 📝 Copy-Paste Examples

### Complete Login Page with Validation

```vue
<!-- pages/auth/login.vue -->
<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12" rounded="lg">
          <!-- Logo and title -->
          <v-card-item class="text-center pa-6">
            <v-avatar size="64" class="mb-4">
              <v-img src="/logo.png" alt="Logo" />
            </v-avatar>
            <v-card-title class="text-h4 mb-2">
              {{ $t("auth.login.title") }}
            </v-card-title>
            <v-card-subtitle>
              {{ $t("auth.login.subtitle") }}
            </v-card-subtitle>
          </v-card-item>

          <!-- Login form -->
          <v-card-text class="pa-6">
            <v-form ref="form" @submit.prevent="handleLogin">
              <v-text-field
                v-model="credentials.username"
                :label="$t('auth.login.username')"
                :rules="usernameRules"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                class="mb-3"
                required
                autofocus
              />

              <v-text-field
                v-model="credentials.password"
                :label="$t('auth.login.password')"
                :type="showPassword ? 'text' : 'password'"
                :rules="passwordRules"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                class="mb-3"
                required
              />

              <v-checkbox
                v-model="rememberMe"
                :label="$t('auth.login.rememberMe')"
                class="mb-3"
              />

              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="loading"
                class="mb-3"
              >
                {{ $t("auth.login.submit") }}
              </v-btn>
            </v-form>

            <!-- Additional links -->
            <div class="text-center">
              <NuxtLink to="/auth/forgot-password" class="text-decoration-none">
                {{ $t("auth.login.forgotPassword") }}
              </NuxtLink>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
definePageMeta({
  middleware: 'guest',
  layout: 'auth'
})

const { t } = useI18n()
const { login } = useAuth()
const { showError, showSuccess } = useSnackbar()

const form = ref()
const loading = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)

const credentials = reactive({
  username: '',
  password: ''
})

// Validation rules
const usernameRules = [
  (v: string) => !!v || t('validation.required'),
  (v: string) => v.length >= 3 || t('validation.minLength', { min: 3 })
]

const passwordRules = [
  (v: string) => !!v || t('validation.required'),
  (v: string) => v.length >= 6 || t('validation.minLength', { min: 6 })
]

const handleLogin = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true

  try {
    const result = await login(credentials.username, credentials.password)

    if (result.success) {
      showSuccess(t('auth.login.success'))

      // Redirect to return URL or dashboard
      const returnUrl = useRoute().query.returnUrl as string
      await navigateTo(returnUrl || '/dashboard')
    } else {
      showError(result.message || t('auth.errors.loginFailed'))
    }
  } catch (error) {
    showError(t('auth.errors.loginFailed'))
  } finally {
    loading.value = false
  }
}
</script>
```

---

**Next Steps:**

- [Error Handling Quick Start](./quick-start-error-handling.md)
- [Testing Quick Start](./quick-start-testing.md)
- [Deployment Quick Start](./quick-start-deployment.md)
