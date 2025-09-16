# نظام المصادقة والصلاحيات - Authentication & Authorization System

## نظرة عامة | Overview

هذا الوثيقة تشرح نظام المصادقة والصلاحيات الشامل في المشروع والذي يستخدم **Pinia** لإدارة الحالة و **Nuxt 3** للتطبيق.

This document explains the comprehensive authentication and authorization system in the project that uses **Pinia** for state management and **Nuxt 3** for the application.

## البنية الأساسية | Architecture

### 1. Auth Store (`stores/auth.ts`)

```typescript
// مخزن المصادقة الأساسي - Core auth store
interface AuthState {
  token: string | null          // رمز الوصول - Access token
  user: User | null             // بيانات المستخدم - User data
  loading: boolean              // حالة التحميل - Loading state
  error: string | null          // الأخطاء - Errors
  isInitialized: boolean        // حالة التهيئة - Initialization state
}
```

#### الوظائف الأساسية | Core Functions

```typescript
// تسجيل الدخول - Login
await authStore.login(username, password)

// تسجيل الخروج - Logout
await authStore.logout()

// التحقق من الصلاحيات - Permission checking
authStore.hasPermission('users.create')
authStore.hasRole('admin')
authStore.hasAllPermissions(['users.create', 'users.edit'])
authStore.hasAnyPermission(['users.view', 'orders.view'])

// تحديث بيانات المستخدم - Update user data
await authStore.refreshUser()
await authStore.updateProfile(data)

// التحقق من صحة الرمز - Validate token
await authStore.validateToken()
```

### 2. Middleware System

#### Auth Middleware (`middleware/auth.ts`)
```typescript
// حماية المسارات التي تتطلب مصادقة
// Protects routes that require authentication
definePageMeta({
  middleware: ['auth']
})
```

#### Guest Middleware (`middleware/guest.ts`)
```typescript
// للصفحات التي يجب أن يصل إليها الضيوف فقط
// For pages that should only be accessed by guests
definePageMeta({
  middleware: ['guest']
})
```

#### Permission Middleware (`middleware/permission.ts`)
```typescript
// للصفحات التي تتطلب صلاحيات معينة
// For pages that require specific permissions
definePageMeta({
  middleware: ['auth', 'permission'],
  permission: 'users.view',              // صلاحية واحدة - Single permission
  permissions: ['users.view', 'users.edit'], // صلاحيات متعددة - Multiple permissions
  permissionMode: 'all' // أو 'any' - or 'any'
})
```

### 3. Composables

#### useAuth Composable
```vue
<script setup>
import { useAuth } from '~/composables/useAuth'

const { 
  isAuthenticated, 
  currentUser, 
  hasPermission, 
  canAccess,
  login, 
  logout 
} = useAuth()

// استخدام في الكومبوننت - Usage in component
const canCreateUser = hasPermission('users.create')
const canEditOrders = canAccess({
  permissions: ['orders.edit', 'orders.manage'],
  mode: 'any'
})
</script>
```

#### usePermissions للقوالب | usePermissions for Templates
```vue
<template>
  <div>
    <!-- إظهار الأزرار حسب الصلاحيات - Show buttons based on permissions -->
    <v-btn v-if="$can('users.create')" @click="createUser">
      إنشاء مستخدم | Create User
    </v-btn>
    
    <v-btn v-if="$canAny(['orders.edit', 'orders.delete'])" @click="editOrder">
      تعديل الطلب | Edit Order
    </v-btn>
  </div>
</template>

<script setup>
import { usePermissions } from '~/composables/useAuth'

// جعل الدوال متاحة في القالب - Make functions available in template
const { can: $can, canAny: $canAny } = usePermissions()
</script>
```

## أمثلة الاستخدام | Usage Examples

### 1. إعداد صفحة محمية | Protected Page Setup

```vue
<!-- pages/dashboard/users/index.vue -->
<template>
  <div>
    <h1>إدارة المستخدمين | User Management</h1>
    
    <!-- أزرار الإجراءات - Action buttons -->
    <v-btn 
      v-if="$can('users.create')" 
      @click="showCreateDialog = true"
      color="primary"
    >
      إضافة مستخدم | Add User
    </v-btn>
    
    <!-- جدول المستخدمين - Users table -->
    <v-data-table :items="users">
      <template #item.actions="{ item }">
        <v-btn 
          v-if="$can('users.edit')"
          @click="editUser(item)"
          icon="mdi-pencil"
          size="small"
        />
        <v-btn 
          v-if="$can('users.delete')"
          @click="deleteUser(item)"
          icon="mdi-delete"
          size="small"
          color="error"
        />
      </template>
    </v-data-table>
  </div>
</template>

<script setup>
import { useAuth, usePermissions } from '~/composables/useAuth'

// إعداد الصفحة - Page setup
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'permission'],
  permission: 'users.view' // مطلوب للوصول - Required for access
})

// المتغيرات التفاعلية - Reactive variables
const { currentUser } = useAuth()
const { can: $can } = usePermissions()
const users = ref([])
const showCreateDialog = ref(false)

// الوظائف - Functions
const editUser = (user) => {
  // منطق التعديل - Edit logic
}

const deleteUser = (user) => {
  // منطق الحذف - Delete logic
}
</script>
```

### 2. إعداد صفحة الضيوف | Guest Page Setup

```vue
<!-- pages/login.vue -->
<template>
  <div>
    <!-- نموذج تسجيل الدخول - Login form -->
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default',
  middleware: ['guest'], // المستخدمون المسجلون سيتم توجيههم - Authenticated users will be redirected
  title: 'تسجيل الدخول | Login'
})
</script>
```

### 3. التحقق من الصلاحيات المتقدمة | Advanced Permission Checking

```vue
<script setup>
import { useAuth } from '~/composables/useAuth'

const { canAccess } = useAuth()

// التحقق من صلاحيات متعددة - Multiple permissions check
const canManageUsers = canAccess({
  permissions: ['users.create', 'users.edit', 'users.delete'],
  mode: 'all' // يجب أن يمتلك كل الصلاحيات - Must have ALL permissions
})

const canViewReports = canAccess({
  permissions: ['reports.financial', 'reports.users'],
  mode: 'any' // يكفي صلاحية واحدة - ANY permission is enough
})

const canAccessAdminPanel = canAccess({
  role: 'admin',
  permissions: ['admin.access']
})
</script>
```

## إدارة المسارات | Route Management

### المسارات العامة | Public Routes
```typescript
// في middleware/auth.ts - In middleware/auth.ts
const publicRoutes = ['/login', '/register', '/']
```

### المسارات المحمية | Protected Routes
```typescript
// تطبق تلقائياً على جميع المسارات عدا العامة
// Applied automatically to all routes except public ones
```

### إعادة التوجيه بعد تسجيل الدخول | Redirect After Login
```typescript
// يتم حفظ المسار المقصود تلقائياً - Intended path is saved automatically
localStorage.setItem('auth_redirect_url', to.fullPath)

// ثم التوجيه إليه بعد النجاح - Then redirect after successful login
const redirectUrl = localStorage.getItem('auth_redirect_url') || '/dashboard'
```

## الميزات المتقدمة | Advanced Features

### 1. مزامنة متعددة الألسنة | Multi-tab Synchronization
```typescript
// تزامن تلقائي عند تغيير الحالة في لسان آخر
// Automatic sync when state changes in another tab
window.addEventListener('storage', handleStorageChange)
```

### 2. التحقق الدوري من الرمز | Periodic Token Validation
```typescript
// كل 10 دقائق - Every 10 minutes
setInterval(async () => {
  if (authStore.isAuthenticated) {
    await authStore.validateToken()
  }
}, 10 * 60 * 1000)
```

### 3. معالجة الأخطاء | Error Handling
```typescript
// معالجة أخطاء 401 تلقائياً - Handle 401 errors automatically
if (error.status === 401) {
  authStore.clearAuth()
  navigateTo('/login')
}
```

## إعداد API | API Setup

### Headers التلقائية | Automatic Headers
```typescript
// في composables/useApi.ts - In composables/useApi.ts
const getAuthHeaders = () => {
  const authStore = useAuthStore()
  return {
    'Authorization': `Bearer ${authStore.token}`,
    'Content-Type': 'application/json'
  }
}
```

### نقاط API المطلوبة | Required API Endpoints

```typescript
// تسجيل الدخول - Login
POST /auth/login
Body: { username: string, password: string }
Response: { token: string, user: User }

// تسجيل الخروج - Logout
POST /auth/logout
Headers: { Authorization: Bearer <token> }

// الحصول على بيانات المستخدم - Get user data
GET /auth/me
Headers: { Authorization: Bearer <token> }
Response: { user: User }

// التحقق من صحة الرمز - Validate token
GET /auth/validate
Headers: { Authorization: Bearer <token> }

// تحديث الملف الشخصي - Update profile
PUT /auth/profile
Headers: { Authorization: Bearer <token> }
Body: Partial<User>
Response: { user: User }
```

## أفضل الممارسات | Best Practices

### 1. استخدام الـ Composables
```vue
<script setup>
// ✅ جيد - Good
import { useAuth } from '~/composables/useAuth'
const { hasPermission } = useAuth()

// ❌ تجنب - Avoid
import { useAuthStore } from '~/stores/auth'
const authStore = useAuthStore()
</script>
```

### 2. التحقق من الصلاحيات في القوالب
```vue
<template>
  <!-- ✅ جيد - Good -->
  <v-btn v-if="$can('users.create')">
    إنشاء | Create
  </v-btn>
  
  <!-- ❌ تجنب - Avoid -->
  <v-btn v-if="authStore.hasPermission('users.create')">
    إنشاء | Create
  </v-btn>
</template>
```

### 3. معالجة الأخطاء
```typescript
// ✅ جيد - Good
try {
  await authStore.login(username, password)
  // Success handling
} catch (error) {
  // Error handling
  showError(error.message)
}

// ❌ تجنب - Avoid
authStore.login(username, password).then(() => {
  // Success without error handling
})
```

### 4. تعريف الصلاحيات
```typescript
// ✅ استخدم أسماء واضحة - Use clear names
'users.create', 'users.edit', 'users.delete', 'users.view'
'orders.manage', 'reports.financial'

// ❌ تجنب الأسماء المبهمة - Avoid vague names
'admin', 'user', 'manage'
```

## استكشاف الأخطاء | Troubleshooting

### مشاكل شائعة | Common Issues

1. **المستخدم لا يتم إعادة توجيهه بعد تسجيل الدخول**
   ```typescript
   // تأكد من وجود guest middleware في صفحة login
   // Make sure guest middleware exists in login page
   definePageMeta({
     middleware: ['guest']
   })
   ```

2. **الصلاحيات لا تعمل**
   ```typescript
   // تأكد من أن المستخدم يحتوي على مصفوفة permissions
   // Make sure user has permissions array
   user: {
     permissions: ['users.view', 'users.create']
   }
   ```

3. **المزامنة بين الألسنة لا تعمل**
   ```typescript
   // تأكد من تهيئة plugin auth بشكل صحيح
   // Make sure auth plugin is initialized correctly
   ```

## الأمان | Security

### التدابير الأمنية | Security Measures

1. **تخزين آمن للرموز** - Secure token storage
2. **التحقق الدوري** - Periodic validation
3. **مزامنة متعددة الألسنة** - Multi-tab synchronization
4. **معالجة انتهاء الصلاحية** - Expiration handling
5. **تشفير البيانات الحساسة** - Encrypt sensitive data

### نصائح الأمان | Security Tips

```typescript
// ✅ جيد - Good
// تخزين الرمز فقط في localStorage
// Store only token in localStorage
localStorage.setItem('auth_token', token)

// ❌ تجنب - Avoid
// تخزين كلمة المرور
// Storing password
localStorage.setItem('password', password)
```

---

## الخلاصة | Summary

هذا النظام يوفر:
- **مصادقة شاملة** مع إدارة الرموز
- **نظام صلاحيات مرن** يدعم الأدوار والصلاحيات
- **حماية تلقائية للمسارات**
- **مزامنة متعددة الألسنة**
- **معالجة أخطاء محترفة**

This system provides:
- **Comprehensive authentication** with token management
- **Flexible permission system** supporting roles and permissions
- **Automatic route protection**
- **Multi-tab synchronization**
- **Professional error handling**

للدعم الفني، راجع الكود أو تواصل مع فريق التطوير.
For technical support, review the code or contact the development team.