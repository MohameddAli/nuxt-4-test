# مرجع المطور السريع | Developer Quick Reference

## نظام المصادقة والصلاحيات | Authentication & Authorization System

### مرجع سريع للدوال | Quick Function Reference

#### في الـ Composables | In Composables

```typescript
import { useAuth, usePermissions } from '~/composables/useAuth'

// useAuth - للحالة والإجراءات الأساسية
const {
  // الحالة - State
  isAuthenticated,      // boolean - هل المستخدم مسجل دخول؟
  currentUser,          // User | null - بيانات المستخدم الحالي
  loading,              // boolean - حالة التحميل
  error,                // string | null - آخر خطأ

  // الإجراءات - Actions  
  login,                // (username, password) => Promise
  logout,               // () => Promise
  refreshUser,          // () => Promise<User>
  validateToken,        // () => Promise<boolean>
  updateProfile,        // (data) => Promise<User>

  // فحص الصلاحيات - Permission checking
  hasPermission,        // (permission: string) => boolean
  hasRole,              // (role: string) => boolean
  hasAllPermissions,    // (permissions: string[]) => boolean
  hasAnyPermission,     // (permissions: string[]) => boolean
  canAccess,            // (config) => boolean

  // مساعدات - Helpers
  getUserName,          // () => string
  getUserEmail,         // () => string
  getUserPermissions,   // () => string[]
  getUserRoles,         // () => string[]
} = useAuth()

// usePermissions - للاستخدام في القوالب
const {
  can: $can,            // للتحقق من صلاحية واحدة
  canAny: $canAny,      // للتحقق من أي صلاحية من مجموعة
  canAll: $canAll,      // للتحقق من جميع الصلاحيات
  hasRole: $hasRole,    // للتحقق من الدور
} = usePermissions()
```

#### في Auth Store | In Auth Store

```typescript
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

// الحالة - State
authStore.token           // string | null
authStore.user            // User | null  
authStore.loading         // boolean
authStore.error           // string | null
authStore.isInitialized   // boolean

// Getters
authStore.isAuthenticated // boolean
authStore.currentUser     // User | null
authStore.getUserInfo     // UserInfo | null

// Actions
authStore.initAuth()                        // تهيئة المصادقة
authStore.login(username, password)         // تسجيل الدخول
authStore.logout()                          // تسجيل الخروج
authStore.clearAuth()                       // مسح البيانات
authStore.refreshUser()                     // تحديث بيانات المستخدم
authStore.validateToken()                   // التحقق من الرمز
authStore.updateProfile(data)               // تحديث الملف الشخصي

// Permission checking
authStore.hasPermission(permission)         // صلاحية واحدة
authStore.hasRole(role)                     // دور واحد
authStore.hasAllPermissions(permissions)    // جميع الصلاحيات
authStore.hasAnyPermission(permissions)     // أي صلاحية
```

### مرجع Middleware | Middleware Reference

#### Auth Middleware
```javascript
// للصفحات المحمية - For protected pages
definePageMeta({
  middleware: ['auth']
})
```

#### Permission Middleware  
```javascript
// صلاحية واحدة - Single permission
definePageMeta({
  middleware: ['auth', 'permission'],
  permission: 'users.view'
})

// صلاحيات متعددة - Multiple permissions
definePageMeta({
  middleware: ['auth', 'permission'],
  permissions: ['users.view', 'users.edit'],
  permissionMode: 'all' // 'all' أو 'any'
})
```

#### Guest Middleware
```javascript
// للضيوف فقط - For guests only (login, register pages)
definePageMeta({
  middleware: ['guest']
})
```

### أمثلة الاستخدام في القوالب | Template Usage Examples

#### عرض/إخفاء العناصر | Show/Hide Elements

```vue
<template>
  <div>
    <!-- أزرار حسب الصلاحيات - Permission-based buttons -->
    <v-btn v-if="$can('users.create')" @click="createUser">
      إنشاء مستخدم | Create User
    </v-btn>
    
    <v-btn v-if="$canAny(['orders.edit', 'orders.delete'])" @click="manageOrders">
      إدارة الطلبات | Manage Orders
    </v-btn>
    
    <v-btn v-if="$hasRole('admin')" @click="openAdminPanel">
      لوحة الإدارة | Admin Panel
    </v-btn>

    <!-- محتوى شرطي معقد - Complex conditional content -->
    <v-card v-if="isAdmin || canManageUsers">
      <v-card-title>إدارة النظام | System Management</v-card-title>
      <!-- محتوى الإدارة - Admin content -->
    </v-card>
  </div>
</template>

<script setup>
import { usePermissions, useAuth } from '~/composables/useAuth'

const { can: $can, canAny: $canAny, hasRole: $hasRole } = usePermissions()
const { hasRole } = useAuth()

// computed للفحوصات المعقدة - Computed for complex checks
const isAdmin = computed(() => hasRole('admin'))
const canManageUsers = computed(() => 
  $can('users.create') && $can('users.edit') && $can('users.delete')
)
</script>
```

#### جدول بأزرار إجراءات | Table with Action Buttons

```vue
<template>
  <v-data-table :items="users" :headers="headers">
    <template #item.actions="{ item }">
      <div class="d-flex gap-1">
        <v-btn
          v-if="$can('users.edit')"
          @click="editUser(item)"
          icon="mdi-pencil"
          size="small"
          variant="tonal"
        />
        <v-btn
          v-if="$can('users.delete') && !item.is_system"
          @click="deleteUser(item)"
          icon="mdi-delete"
          size="small"
          color="error"
          variant="tonal"
        />
        <v-btn
          v-if="$can('users.manage') && $hasRole('admin')"
          @click="resetPassword(item)"
          icon="mdi-key-variant"
          size="small"
          color="warning"
          variant="tonal"
        />
      </div>
    </template>
  </v-data-table>
</template>
```

#### قائمة تنقل ديناميكية | Dynamic Navigation Menu

```vue
<template>
  <v-list>
    <!-- عناصر دائماً ظاهرة - Always visible items -->
    <v-list-item to="/dashboard" prepend-icon="mdi-view-dashboard">
      لوحة التحكم | Dashboard
    </v-list-item>
    
    <!-- عناصر حسب الصلاحيات - Permission-based items -->
    <template v-for="item in filteredMenuItems" :key="item.to">
      <v-list-item
        v-if="!item.children && canAccessItem(item)"
        :to="item.to"
        :prepend-icon="item.icon"
      >
        {{ $t(item.title) }}
      </v-list-item>
      
      <v-list-group
        v-else-if="item.children && hasChildAccess(item)"
        :value="item.to"
      >
        <template #activator="{ props }">
          <v-list-item
            v-bind="props"
            :prepend-icon="item.icon"
            :title="$t(item.title)"
          />
        </template>
        
        <v-list-item
          v-for="child in item.children"
          v-if="canAccessItem(child)"
          :key="child.to"
          :to="child.to"
          :prepend-icon="child.icon"
        >
          {{ $t(child.title) }}
        </v-list-item>
      </v-list-group>
    </template>
  </v-list>
</template>

<script setup>
import { usePermissions } from '~/composables/useAuth'

const { can, hasRole, canAccess } = usePermissions()

const menuItems = [
  {
    title: 'menu.users',
    to: '/dashboard/users',
    icon: 'mdi-account-group',
    permission: 'users.view'
  },
  {
    title: 'menu.reports',
    to: '/dashboard/reports',
    icon: 'mdi-chart-box',
    children: [
      {
        title: 'menu.financial_reports',
        to: '/dashboard/reports/financial',
        permission: 'reports.financial'
      },
      {
        title: 'menu.user_reports', 
        to: '/dashboard/reports/users',
        permission: 'reports.users'
      }
    ]
  }
]

const canAccessItem = (item) => {
  if (item.permission) {
    return can(item.permission)
  }
  if (item.role) {
    return hasRole(item.role)
  }
  return true
}

const hasChildAccess = (item) => {
  return item.children?.some(child => canAccessItem(child))
}

const filteredMenuItems = computed(() => 
  menuItems.filter(item => canAccessItem(item) || hasChildAccess(item))
)
</script>
```

### أمثلة للمكونات المتقدمة | Advanced Component Examples

#### مكون حماية شرطية | Conditional Protection Component

```vue
<!-- components/ProtectedContent.vue -->
<template>
  <div v-if="hasAccess">
    <slot />
  </div>
  <div v-else-if="showFallback">
    <slot name="fallback">
      <v-alert type="warning" variant="tonal">
        {{ fallbackMessage }}
      </v-alert>
    </slot>
  </div>
</template>

<script setup>
import { useAuth } from '~/composables/useAuth'

interface Props {
  permission?: string
  permissions?: string[]
  role?: string
  roles?: string[]
  mode?: 'all' | 'any'
  showFallback?: boolean
  fallbackMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'all',
  showFallback: true,
  fallbackMessage: 'ليس لديك صلاحية للوصول | You don\'t have permission to access this'
})

const { canAccess } = useAuth()

const hasAccess = computed(() => canAccess({
  permission: props.permission,
  permissions: props.permissions,
  role: props.role,
  roles: props.roles,
  mode: props.mode
}))
</script>

<!-- الاستخدام - Usage -->
<template>
  <ProtectedContent permission="users.create">
    <v-btn @click="createUser">إنشاء مستخدم | Create User</v-btn>
  </ProtectedContent>
  
  <ProtectedContent 
    :permissions="['reports.view', 'analytics.view']" 
    mode="any"
  >
    <ReportsSection />
  </ProtectedContent>
</template>
```

#### مكون تسجيل الدخول المتقدم | Advanced Login Component

```vue
<!-- components/LoginForm.vue -->
<template>
  <v-card class="mx-auto" max-width="400">
    <v-card-title class="text-center">
      {{ $t('auth.login') }}
    </v-card-title>
    
    <v-card-text>
      <v-form @submit.prevent="handleLogin" ref="form">
        <v-text-field
          v-model="credentials.username"
          :label="$t('auth.username')"
          :rules="[rules.required]"
          prepend-inner-icon="mdi-account"
          :disabled="loading"
          autocomplete="username"
        />
        
        <v-text-field
          v-model="credentials.password"
          :label="$t('auth.password')"
          :rules="[rules.required]"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock"
          :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="showPassword = !showPassword"
          :disabled="loading"
          autocomplete="current-password"
        />
        
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-4"
        >
          {{ error }}
        </v-alert>
        
        <v-btn
          type="submit"
          block
          color="primary"
          :loading="loading"
          :disabled="!isFormValid"
        >
          {{ $t('common.login') }}
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useAuth } from '~/composables/useAuth'

const { login, loading, error } = useAuth()
const router = useRouter()

const form = ref()
const showPassword = ref(false)
const credentials = ref({
  username: '',
  password: ''
})

const rules = {
  required: (value) => !!value || 'مطلوب | Required'
}

const isFormValid = computed(() => {
  return credentials.value.username && credentials.value.password
})

const handleLogin = async () => {
  try {
    await login(credentials.value.username, credentials.value.password)
    
    // التوجيه التلقائي - Auto redirect
    const redirectUrl = localStorage.getItem('auth_redirect_url') || '/dashboard'
    localStorage.removeItem('auth_redirect_url')
    await router.push(redirectUrl)
  } catch (err) {
    // الخطأ سيظهر تلقائياً من store - Error will show automatically from store
  }
}
</script>
```

### نصائح الأداء | Performance Tips

#### 1. تخزين النتائج | Cache Results
```vue
<script setup>
import { useAuth } from '~/composables/useAuth'

const { canAccess } = useAuth()

// ✅ جيد - Cache complex permission checks
const userPermissions = computed(() => ({
  canCreate: canAccess({ permission: 'users.create' }),
  canEdit: canAccess({ permission: 'users.edit' }),
  canDelete: canAccess({ permission: 'users.delete' }),
  isManager: canAccess({ role: 'manager' })
}))

// ❌ تجنب - Repeated calculations in template
// calling canAccess multiple times in template
</script>

<template>
  <div>
    <v-btn v-if="userPermissions.canCreate">Create</v-btn>
    <v-btn v-if="userPermissions.canEdit">Edit</v-btn>
    <v-btn v-if="userPermissions.canDelete">Delete</v-btn>
  </div>
</template>
```

#### 2. استخدام watchEffect للمراقبة | Use watchEffect for Watching
```vue
<script setup>
import { useAuth } from '~/composables/useAuth'

const { isAuthenticated, currentUser } = useAuth()

// مراقبة التغييرات - Watch for changes
watchEffect(() => {
  if (isAuthenticated.value && currentUser.value) {
    // إعداد البيانات حسب المستخدم - Setup user-specific data
    setupUserData(currentUser.value)
  }
})
</script>
```

### أخطاء شائعة وحلولها | Common Errors & Solutions

#### 1. "Cannot read property 'permissions' of null"
```typescript
// ❌ خطأ - Wrong
const canCreate = user.permissions.includes('users.create')

// ✅ صحيح - Correct  
const canCreate = user?.permissions?.includes('users.create') || false

// أو استخدم الدوال المساعدة - Or use helper functions
const { hasPermission } = useAuth()
const canCreate = hasPermission('users.create')
```

#### 2. "Middleware not working"
```javascript
// تأكد من الترتيب الصحيح - Make sure correct order
definePageMeta({
  middleware: ['auth', 'permission'], // auth أولاً - auth first
  permission: 'users.view'
})
```

#### 3. "Permissions not updating"
```typescript
// تأكد من إعادة تحميل بيانات المستخدم - Make sure to refresh user data
const { refreshUser } = useAuth()

// بعد تحديث الصلاحيات على الخادم - After updating permissions on server
await refreshUser()
```

### مرجع سريع لنقاط API | API Endpoints Quick Reference

```typescript
// Base URL يجب تعريفه في nuxt.config.ts
// Base URL should be defined in nuxt.config.ts

// تسجيل الدخول - Login
POST /auth/login
Body: { username: string, password: string }
Response: { token: string, user: User }

// تسجيل الخروج - Logout
POST /auth/logout
Headers: { Authorization: Bearer <token> }

// بيانات المستخدم - User data
GET /auth/me
Headers: { Authorization: Bearer <token> }
Response: { user: User }

// التحقق من الرمز - Token validation
GET /auth/validate
Headers: { Authorization: Bearer <token> }

// تحديث الملف الشخصي - Update profile
PUT /auth/profile
Headers: { Authorization: Bearer <token> }
Body: Partial<User>
Response: { user: User }
```

---

## التحديثات المستقبلية | Future Updates

عند إضافة ميزات جديدة، تأكد من:
- إضافة الصلاحيات المناسبة
- تحديث الوثائق
- اختبار جميع المسارات
- مراجعة الأمان

When adding new features, make sure to:
- Add appropriate permissions
- Update documentation  
- Test all routes
- Review security

هذا المرجع سيتم تحديثه مع تطور النظام.

This reference will be updated as the system evolves.