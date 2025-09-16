# نظام المصادقة والصلاحيات المحدث | Updated Authentication & Authorization System

## ما تم تحديثه | What's Updated

تم تحديث نظام المصادقة والصلاحيات في المشروع ليصبح أكثر شمولية ومرونة مع الحفاظ على البساطة والاحترافية.

The authentication and authorization system has been updated to be more comprehensive and flexible while maintaining simplicity and professionalism.

## الملفات المحدثة | Updated Files

### 1. المخازن | Stores
- ✅ `stores/auth.ts` - مخزن المصادقة المحدث مع TypeScript
- ✅ Enhanced with types, better error handling, and more features

### 2. Middleware
- ✅ `middleware/auth.ts` - محدث للدعم الأفضل للمسارات
- ✅ `middleware/guest.ts` - جديد للصفحات العامة
- ✅ `middleware/permission.ts` - جديد للصلاحيات

### 3. Composables
- ✅ `composables/useAuth.ts` - جديد للوصول السهل للمصادقة
- ✅ Provides reactive auth state and helper functions

### 4. Plugins
- ✅ `plugins/auth.ts` - محدث للمزامنة متعددة الألسنة والتحقق الدوري

### 5. الصفحات | Pages
- ✅ `pages/login.vue` - محدث مع guest middleware
- ✅ `pages/register.vue` - محدث مع guest middleware
- ✅ `pages/dashboard/users/index.vue` - محدث مع permission checking

### 6. الوثائق | Documentation
- ✅ `docs/AUTHENTICATION_SYSTEM.md` - وثائق شاملة
- ✅ `docs/QUICK_START_GUIDE.md` - دليل البدء السريع

## الميزات الجديدة | New Features

### 1. نظام صلاحيات متقدم | Advanced Permission System
```typescript
// فحص صلاحية واحدة - Single permission check
hasPermission('users.create')

// فحص صلاحيات متعددة - Multiple permissions check
hasAllPermissions(['users.create', 'users.edit'])
hasAnyPermission(['reports.view', 'analytics.view'])

// فحص الأدوار - Role checking
hasRole('admin')
```

### 2. Middleware ذكي | Smart Middleware
```javascript
// للصفحات المحمية - Protected pages
definePageMeta({
  middleware: ['auth']
})

// للصفحات التي تتطلب صلاحيات - Permission-required pages
definePageMeta({
  middleware: ['auth', 'permission'],
  permission: 'users.view'
})

// للضيوف فقط - Guests only
definePageMeta({
  middleware: ['guest']
})
```

### 3. Composables سهل الاستخدام | Easy-to-use Composables
```vue
<template>
  <v-btn v-if="$can('users.create')" @click="createUser">
    إنشاء مستخدم | Create User
  </v-btn>
</template>

<script setup>
import { usePermissions } from '~/composables/useAuth'
const { can: $can } = usePermissions()
</script>
```

### 4. مزامنة متعددة الألسنة | Multi-tab Synchronization
- تزامن تلقائي عند تسجيل الدخول/الخروج في لسان آخر
- Automatic sync when login/logout in another tab

### 5. التحقق الدوري من الرمز | Periodic Token Validation
- فحص صحة الرمز كل 10 دقائق
- Token validation every 10 minutes

### 6. إعادة التوجيه الذكي | Smart Redirecting
- حفظ المسار المقصود قبل تسجيل الدخول
- Save intended path before login

## كيفية الاستخدام | How to Use

### للصفحات الجديدة | For New Pages

#### 1. صفحة محمية عادية | Regular Protected Page
```vue
<script setup>
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})
</script>
```

#### 2. صفحة تتطلب صلاحية | Permission-Required Page
```vue
<script setup>
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'permission'],
  permission: 'users.view' // أو permissions: ['users.view', 'users.edit']
})
</script>
```

#### 3. صفحة للضيوف | Guest Page
```vue
<script setup>
definePageMeta({
  layout: 'default',
  middleware: ['guest']
})
</script>
```

### للتحقق من الصلاحيات في المكونات | Permission Checking in Components

```vue
<template>
  <div>
    <v-btn v-if="$can('users.create')" @click="create">
      إنشاء | Create
    </v-btn>
    
    <v-btn v-if="$canAny(['orders.edit', 'orders.delete'])" @click="manage">
      إدارة | Manage
    </v-btn>
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

## إعداد API مطلوب | Required API Setup

تأكد من وجود هذه النقاط في API الخاص بك:

Make sure your API has these endpoints:

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
```

## بنية المستخدم المطلوبة | Required User Structure

```typescript
interface User {
  id: number
  name: string
  username: string
  email: string
  permissions: string[]  // مهم - Important!
  roles: string[]        // اختياري - Optional
  group?: any           // اختياري - Optional
}
```

## الصلاحيات المقترحة | Suggested Permissions

```typescript
// إدارة المستخدمين - User Management
'users.view'
'users.create'
'users.edit'
'users.delete'

// إدارة الطلبات - Order Management
'orders.view'
'orders.create'
'orders.edit'
'orders.delete'
'orders.manage'

// التقارير - Reports
'reports.view'
'reports.financial'
'reports.export'

// الإعدادات - Settings
'settings.system'
'settings.users'
'admin.access'
```

## الأخطاء الشائعة | Common Issues

### 1. المستخدم لا يحتوي على permissions
```typescript
// ❌ خطأ - Wrong
user: {
  id: 1,
  name: "Ahmed"
  // لا يوجد permissions
}

// ✅ صحيح - Correct
user: {
  id: 1,
  name: "Ahmed",
  permissions: ['users.view', 'orders.view'],
  roles: ['user']
}
```

### 2. عدم استخدام middleware صحيح
```vue
<!-- ❌ خطأ - Wrong -->
<script setup>
definePageMeta({
  middleware: ['auth'] // نسيان permission middleware
})
</script>

<!-- ✅ صحيح - Correct -->
<script setup>
definePageMeta({
  middleware: ['auth', 'permission'],
  permission: 'users.view'
})
</script>
```

### 3. استخدام store مباشرة بدلاً من composables
```vue
<!-- ❌ خطأ - Wrong -->
<script setup>
import { useAuthStore } from '~/stores/auth'
const authStore = useAuthStore()
const canCreate = authStore.hasPermission('users.create')
</script>

<!-- ✅ صحيح - Correct -->
<script setup>
import { usePermissions } from '~/composables/useAuth'
const { can } = usePermissions()
const canCreate = can('users.create')
</script>
```

## اختبار النظام | Testing the System

### 1. اختبار المصادقة | Authentication Testing
```typescript
// تسجيل دخول - Login
await login('username', 'password')

// تحقق من الحالة - Check state
console.log(isAuthenticated.value) // true
console.log(currentUser.value)     // user object
```

### 2. اختبار الصلاحيات | Permission Testing
```typescript
// إضافة صلاحيات للمستخدم - Add permissions to user
user.permissions = ['users.view', 'users.create']

// اختبار - Test
console.log(hasPermission('users.view'))    // true
console.log(hasPermission('users.delete'))  // false
```

### 3. اختبار Middleware | Middleware Testing
- جرب الوصول لصفحة محمية بدون تسجيل دخول
- Try accessing protected page without login
- جرب الوصول لصفحة تتطلب صلاحية لا تملكها
- Try accessing page requiring permission you don't have

## الدعم والمساعدة | Support & Help

للحصول على المساعدة:
1. راجع الوثائق في `docs/AUTHENTICATION_SYSTEM.md`
2. انظر للأمثلة في `docs/QUICK_START_GUIDE.md`
3. تحقق من الصفحات المحدثة كأمثلة
4. تواصل مع فريق التطوير

For help:
1. Check documentation in `docs/AUTHENTICATION_SYSTEM.md`
2. See examples in `docs/QUICK_START_GUIDE.md`
3. Check updated pages as examples
4. Contact the development team

---

## الخلاصة | Summary

النظام الجديد يوفر:
- ✅ مصادقة شاملة وآمنة
- ✅ نظام صلاحيات مرن
- ✅ middleware ذكي
- ✅ composables سهل الاستخدام
- ✅ مزامنة متعددة الألسنة
- ✅ وثائق شاملة

The new system provides:
- ✅ Comprehensive and secure authentication
- ✅ Flexible permission system
- ✅ Smart middleware
- ✅ Easy-to-use composables
- ✅ Multi-tab synchronization
- ✅ Comprehensive documentation

الحفاظ على النهج البسيط والاحترافي كما طلبت! 🚀

Maintaining the simple and professional approach as requested! 🚀