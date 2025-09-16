# دليل البدء السريع - Quick Start Guide

## نظام المصادقة والصلاحيات | Authentication & Authorization System

### البدء السريع | Quick Start

#### 1. إعداد صفحة محمية | Protected Page Setup

```vue
<!-- pages/admin/users.vue -->
<template>
  <div>
    <h1>المستخدمون | Users</h1>
    
    <!-- أزرار حسب الصلاحيات - Permission-based buttons -->
    <v-btn v-if="$can('users.create')" @click="createUser">
      إضافة مستخدم | Add User
    </v-btn>
  </div>
</template>

<script setup>
import { usePermissions } from '~/composables/useAuth'

// إعداد الصفحة - Page setup
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'permission'],
  permission: 'users.view' // مطلوب للدخول - Required to access
})

// جعل التحقق من الصلاحيات متاح في القالب
// Make permission checking available in template
const { can: $can } = usePermissions()

const createUser = () => {
  // منطق إنشاء المستخدم - User creation logic
}
</script>
```

#### 2. التحقق من الصلاحيات في الكومبوننت | Permission Checking in Component

```vue
<script setup>
import { useAuth } from '~/composables/useAuth'

const { hasPermission, hasRole, canAccess } = useAuth()

// فحص صلاحية واحدة - Single permission check
const canEdit = hasPermission('users.edit')

// فحص دور - Role check
const isAdmin = hasRole('admin')

// فحص متقدم - Advanced check
const canManageUsers = canAccess({
  permissions: ['users.create', 'users.edit'],
  mode: 'all' // يحتاج كل الصلاحيات - Needs all permissions
})

const canViewReports = canAccess({
  permissions: ['reports.users', 'reports.orders'],
  mode: 'any' // يكفي صلاحية واحدة - Any permission is enough
})
</script>
```

#### 3. إعداد middleware حسب نوع الصفحة | Middleware Setup by Page Type

```javascript
// صفحة محمية عادية - Regular protected page
definePageMeta({
  middleware: ['auth']
})

// صفحة تتطلب صلاحية معينة - Page requiring specific permission
definePageMeta({
  middleware: ['auth', 'permission'],
  permission: 'orders.view'
})

// صفحة تتطلب صلاحيات متعددة - Page requiring multiple permissions
definePageMeta({
  middleware: ['auth', 'permission'],
  permissions: ['users.view', 'users.edit'],
  permissionMode: 'all' // أو 'any' - or 'any'
})

// صفحة للضيوف فقط - Guest-only page
definePageMeta({
  middleware: ['guest']
})
```

### الاستخدام في القوالب | Template Usage

#### عرض/إخفاء العناصر | Show/Hide Elements

```vue
<template>
  <div>
    <!-- أزرار الإجراءات - Action buttons -->
    <v-btn v-if="$can('users.create')" color="primary">
      إنشاء مستخدم | Create User
    </v-btn>
    
    <v-btn v-if="$canAny(['orders.edit', 'orders.delete'])" color="warning">
      إدارة الطلبات | Manage Orders
    </v-btn>
    
    <!-- قوائم حسب الدور - Role-based menus -->
    <v-menu v-if="$hasRole('admin')">
      <template #activator="{ props }">
        <v-btn v-bind="props">إعدادات الإدارة | Admin Settings</v-btn>
      </template>
      <v-list>
        <v-list-item>إعداد النظام | System Settings</v-list-item>
        <v-list-item>إدارة المستخدمين | User Management</v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script setup>
import { usePermissions } from '~/composables/useAuth'

const { 
  can: $can, 
  canAny: $canAny, 
  hasRole: $hasRole 
} = usePermissions()
</script>
```

### إدارة حالة المصادقة | Auth State Management

#### تسجيل الدخول | Login

```vue
<script setup>
import { useAuth } from '~/composables/useAuth'

const { login, logout, isAuthenticated, currentUser } = useAuth()
const router = useRouter()

const handleLogin = async (credentials) => {
  try {
    await login(credentials.username, credentials.password)
    // سيتم التوجيه تلقائياً للمسار المطلوب
    // Will automatically redirect to intended route
  } catch (error) {
    // معالجة الخطأ - Error handling
    console.error('Login failed:', error.message)
  }
}

const handleLogout = async () => {
  await logout()
  // سيتم التوجيه تلقائياً لصفحة login
  // Will automatically redirect to login page
}
</script>
```

#### الوصول لبيانات المستخدم | Access User Data

```vue
<script setup>
import { useAuth } from '~/composables/useAuth'

const { 
  currentUser, 
  getUserName, 
  getUserEmail, 
  getUserPermissions,
  getUserRoles 
} = useAuth()

// استخدام البيانات - Using the data
console.log('User name:', getUserName())
console.log('User email:', getUserEmail())
console.log('User permissions:', getUserPermissions())
console.log('User roles:', getUserRoles())
</script>
```

### أمثلة شائعة | Common Examples

#### 1. صفحة إدارة المستخدمين | User Management Page

```vue
<!-- pages/dashboard/users/index.vue -->
<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1>إدارة المستخدمين | User Management</h1>
        
        <v-btn 
          v-if="$can('users.create')"
          @click="showCreateDialog = true"
          color="primary"
          class="mb-4"
        >
          <v-icon start>mdi-plus</v-icon>
          إضافة مستخدم | Add User
        </v-btn>
        
        <v-data-table
          :headers="headers"
          :items="users"
          :loading="loading"
        >
          <template #item.actions="{ item }">
            <v-btn
              v-if="$can('users.edit')"
              @click="editUser(item)"
              icon="mdi-pencil"
              size="small"
              class="mr-2"
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
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { usePermissions } from '~/composables/useAuth'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'permission'],
  permission: 'users.view'
})

const { can: $can } = usePermissions()
const users = ref([])
const loading = ref(false)
const showCreateDialog = ref(false)

const headers = [
  { title: 'الاسم | Name', key: 'name' },
  { title: 'البريد | Email', key: 'email' },
  { title: 'الحالة | Status', key: 'status' },
  { title: 'الإجراءات | Actions', key: 'actions', sortable: false }
]

const editUser = (user) => {
  // منطق التعديل - Edit logic
}

const deleteUser = (user) => {
  // منطق الحذف - Delete logic
}
</script>
```

#### 2. مكون الشريط الجانبي | Sidebar Component

```vue
<!-- components/AppSidebar.vue -->
<template>
  <v-navigation-drawer>
    <v-list>
      <!-- عنصر دائماً ظاهر - Always visible item -->
      <v-list-item to="/dashboard" prepend-icon="mdi-view-dashboard">
        لوحة التحكم | Dashboard
      </v-list-item>
      
      <!-- عناصر حسب الصلاحيات - Permission-based items -->
      <v-list-item 
        v-if="$can('users.view')"
        to="/dashboard/users" 
        prepend-icon="mdi-account-group"
      >
        المستخدمون | Users
      </v-list-item>
      
      <v-list-item 
        v-if="$canAny(['orders.view', 'orders.manage'])"
        to="/dashboard/orders" 
        prepend-icon="mdi-file-document"
      >
        الطلبات | Orders
      </v-list-item>
      
      <!-- قسم الإدارة - Admin section -->
      <v-list-group v-if="$hasRole('admin')">
        <template #activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-cog"
            title="الإعدادات | Settings"
          />
        </template>
        
        <v-list-item to="/dashboard/settings/system">
          إعدادات النظام | System Settings
        </v-list-item>
        <v-list-item to="/dashboard/settings/users">
          إعدادات المستخدمين | User Settings
        </v-list-item>
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { usePermissions } from '~/composables/useAuth'

const { 
  can: $can, 
  canAny: $canAny, 
  hasRole: $hasRole 
} = usePermissions()
</script>
```

#### 3. حماية متقدمة للمكونات | Advanced Component Protection

```vue
<template>
  <div>
    <!-- محتوى حسب مستوى الصلاحية - Content based on permission level -->
    <div v-if="canViewBasicInfo">
      <h3>معلومات أساسية | Basic Info</h3>
      <!-- محتوى أساسي - Basic content -->
    </div>
    
    <div v-if="canViewSensitiveInfo">
      <h3>معلومات حساسة | Sensitive Info</h3>
      <!-- محتوى حساس - Sensitive content -->
    </div>
    
    <div v-if="canManageAll">
      <h3>إدارة شاملة | Full Management</h3>
      <!-- أدوات إدارة كاملة - Full management tools -->
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '~/composables/useAuth'

const { canAccess } = useAuth()

const canViewBasicInfo = canAccess({
  permissions: ['basic.view']
})

const canViewSensitiveInfo = canAccess({
  permissions: ['sensitive.view'],
  role: 'manager'
})

const canManageAll = canAccess({
  permissions: ['manage.all'],
  role: 'admin'
})
</script>
```

### نصائح الأداء | Performance Tips

#### 1. تخزين النتائج | Cache Results

```vue
<script setup>
import { useAuth } from '~/composables/useAuth'

const { canAccess } = useAuth()

// ✅ جيد - Cache permission check
const canManageUsers = computed(() => canAccess({
  permissions: ['users.create', 'users.edit', 'users.delete'],
  mode: 'all'
}))

// ❌ تجنب - Repeated calculations
// calling canAccess in template multiple times
</script>
```

#### 2. استخدام computed للفحوصات المعقدة | Use computed for complex checks

```vue
<script setup>
import { useAuth } from '~/composables/useAuth'

const { hasPermission, hasRole } = useAuth()

const userActions = computed(() => ({
  canCreate: hasPermission('users.create'),
  canEdit: hasPermission('users.edit'),
  canDelete: hasPermission('users.delete') && hasRole('admin'),
  canExport: hasPermission('users.export')
}))
</script>

<template>
  <div>
    <v-btn v-if="userActions.canCreate">إنشاء | Create</v-btn>
    <v-btn v-if="userActions.canEdit">تعديل | Edit</v-btn>
    <v-btn v-if="userActions.canDelete">حذف | Delete</v-btn>
    <v-btn v-if="userActions.canExport">تصدير | Export</v-btn>
  </div>
</template>
```

### الأخطاء الشائعة | Common Mistakes

#### ❌ تجنب هذه الأخطاء | Avoid These Mistakes

```vue
<!-- خطأ: استخدام store مباشرة - Wrong: Using store directly -->
<template>
  <v-btn v-if="authStore.hasPermission('users.create')">
    Create
  </v-btn>
</template>

<!-- خطأ: عدم التحقق من المصادقة أولاً - Wrong: Not checking auth first -->
<script setup>
const userPermissions = currentUser.value.permissions // قد يكون null
</script>

<!-- خطأ: تكرار فحص الصلاحيات - Wrong: Repeating permission checks -->
<template>
  <div v-if="$can('users.edit')">
    <v-btn v-if="$can('users.edit')">Edit</v-btn> <!-- تكرار -->
  </div>
</template>
```

#### ✅ الطريقة الصحيحة | Correct Way

```vue
<!-- صحيح: استخدام composables - Correct: Using composables -->
<template>
  <v-btn v-if="$can('users.create')">
    Create
  </v-btn>
</template>

<!-- صحيح: التحقق الآمن - Correct: Safe checking -->
<script setup>
const { currentUser } = useAuth()
const userPermissions = computed(() => 
  currentUser.value?.permissions || []
)
</script>

<!-- صحيح: تخزين النتيجة - Correct: Cache result -->
<template>
  <div v-if="canEditUsers">
    <v-btn>Edit</v-btn>
    <v-btn>Update</v-btn>
  </div>
</template>

<script setup>
const canEditUsers = computed(() => $can('users.edit'))
</script>
```

---

## المرجع السريع | Quick Reference

### Middleware Options
- `['auth']` - صفحة محمية | Protected page
- `['guest']` - للضيوف فقط | Guests only
- `['auth', 'permission']` - محمية + صلاحيات | Protected + permissions

### Permission Meta
```javascript
definePageMeta({
  permission: 'users.view',                    // صلاحية واحدة
  permissions: ['users.view', 'users.edit'],  // صلاحيات متعددة
  permissionMode: 'all'                       // 'all' أو 'any'
})
```

### Composable Functions
```javascript
// من useAuth - From useAuth
hasPermission(permission)
hasRole(role)
canAccess(config)
login(username, password)
logout()

// من usePermissions - From usePermissions
can(permission)          // للقوالب - For templates
hasRole(role)           // للقوالب - For templates
canAny(permissions)     // للقوالب - For templates
```

للمزيد من التفاصيل، راجع [الوثائق الكاملة](./AUTHENTICATION_SYSTEM.md)

For more details, see [Complete Documentation](./AUTHENTICATION_SYSTEM.md)