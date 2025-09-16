# أفضل الممارسات في Nuxt 3 | Nuxt 3 Best Practices

## استعمال Composables بدلاً من Browser APIs

### ❌ الطريقة القديمة (تجنب) | Old Way (Avoid)

```typescript
// استعمال window object مباشرة - Direct window object usage
if (process.client) {
  const currentPath = window.location.pathname
  const fullUrl = window.location.href
  const searchParams = new URLSearchParams(window.location.search)
}

// استعمال $fetch مباشرة - Direct $fetch usage
const data = await $fetch('/api/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### ✅ الطريقة الصحيحة (Nuxt 3) | Correct Way (Nuxt 3)

```typescript
// استعمال Nuxt 3 composables - Using Nuxt 3 composables
const route = useRoute()         // يعمل على server & client - Works on server & client
const router = useRouter()       // للتنقل - For navigation
const url = useRequestURL()      // للحصول على URL كامل - Get full URL

// الوصول للبيانات - Accessing data
const currentPath = route.path           // "/dashboard/users"
const fullUrl = url.href                 // "https://example.com/dashboard/users"
const queryParams = route.query          // { page: "1", search: "john" }
const routeParams = route.params         // { id: "123" }

// استعمال useApi للطلبات - Using useApi for requests
const { get, post, put, del } = useApi()
const { data } = await get('/api/users')  // Headers تلقائية - Automatic headers
const result = await post('/api/users', userData)  // Returns data directly
```

## مقارنة التفصيلية | Detailed Comparison

### 1. الحصول على معلومات المسار | Getting Route Information

```typescript
// ❌ الطريقة القديمة - Old way
if (process.client) {
  const path = window.location.pathname
  const search = window.location.search
  const hash = window.location.hash
}

// ✅ طريقة Nuxt 3 - Nuxt 3 way
const route = useRoute()

// يعمل على server و client بدون تحقق - Works on both server & client without checking
const path = route.path          // "/dashboard/users"
const search = route.query       // { search: "john", page: "1" }
const hash = route.hash          // "#section1"
const fullPath = route.fullPath  // "/dashboard/users?search=john&page=1#section1"
```

### 2. التنقل البرمجي | Programmatic Navigation

```typescript
// ❌ الطريقة القديمة - Old way
if (process.client) {
  window.location.href = '/dashboard'
  window.history.pushState({}, '', '/dashboard')
}

// ✅ طريقة Nuxt 3 - Nuxt 3 way
const router = useRouter()

// للتنقل مع navigation guards - Navigate with navigation guards
await router.push('/dashboard')
await router.replace('/dashboard')
await navigateTo('/dashboard')           // Nuxt helper

// للرجوع - Go back
router.back()
router.go(-1)
```

### 3. مراقبة تغييرات المسار | Watching Route Changes

```typescript
// ❌ الطريقة القديمة - Old way
if (process.client) {
  window.addEventListener('popstate', () => {
    // Handle route change
  })
}

// ✅ طريقة Nuxt 3 - Nuxt 3 way
const route = useRoute()

// مراقبة تفاعلية - Reactive watching
watch(() => route.path, (newPath, oldPath) => {
  console.log(`Navigated from ${oldPath} to ${newPath}`)
})

// أو في component - Or in component
watchEffect(() => {
  console.log('Current route:', route.path)
})
```

### 4. الحصول على URL الكامل | Getting Full URL

```typescript
// ❌ الطريقة القديمة - Old way
if (process.client) {
  const fullUrl = window.location.href
  const origin = window.location.origin
}

// ✅ طريقة Nuxt 3 - Nuxt 3 way
const url = useRequestURL()

// يعمل على server و client - Works on server & client
const fullUrl = url.href        // "https://example.com/dashboard?page=1"
const origin = url.origin       // "https://example.com"
const protocol = url.protocol   // "https:"
const hostname = url.hostname   // "example.com"
```

## استعمال useApi بدلاً من $fetch المباشر | Using useApi Instead of Direct $fetch

### لماذا useApi أفضل؟ | Why useApi is Better?

1. **Headers تلقائية** - Automatic headers (Authorization, Content-Type)
2. **Error handling موحد** - Consistent error handling
3. **Base URL تلقائي** - Automatic base URL
4. **TypeScript support أفضل** - Better TypeScript support
5. **Interceptors** - Request/Response interceptors

```typescript
// ❌ $fetch مباشرة - Direct $fetch
const data = await $fetch('/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})

// ✅ useApi - استعمال الـ composable
const { get } = useApi()
const data = await get('/auth/me')  // Headers تلقائية - Automatic headers
```

### مثال متقدم | Advanced Example

```typescript
// useApi الموجود يدعم - Existing useApi supports:
const { get, post, put, del } = useApi()

// GET - returns _AsyncData object
const { data, error, pending } = await get<{users: User[]}>('/api/users')
if (data.value) {
  console.log(data.value.users)
}

// POST/PUT/DELETE - return data directly
const newUser = await post<{user: User}>('/api/users', userData)
const updatedUser = await put<{user: User}>('/api/users/1', userData)
await del('/api/users/1')
```

## مراقبة تغييرات المصادقة | Watching Auth Changes

```typescript
// ✅ الطريقة الصحيحة - Correct way
export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  const route = useRoute()  // بدلاً من window.location - Instead of window.location

  // مراقبة تغييرات المصادقة - Watch auth changes
  watch(() => authStore.isAuthenticated, (isAuthenticated) => {
    if (!isAuthenticated && !route.path.includes('/login')) {
      navigateTo('/login')
    }
  })

  // معالجة multi-tab sync - Handle multi-tab sync
  if (process.client) {
    window.addEventListener('storage', (event) => {
      if (event.key === 'auth_token' && !event.newValue) {
        authStore.clearAuth()
        if (!route.path.includes('/login')) {
          navigateTo('/login')
        }
      }
    })
  }
})
```

## فوائد استعمال Nuxt 3 Composables | Benefits of Using Nuxt 3 Composables

### 1. **SSR/SSG Support**
```typescript
// ✅ يعمل على server و client - Works on server & client
const route = useRoute()
console.log(route.path) // يعمل في both environments

// ❌ يعمل على client فقط - Client-only
if (process.client) {
  console.log(window.location.pathname)
}
```

### 2. **Reactive State**
```typescript
// ✅ تفاعلي - Reactive
const route = useRoute()
const isUsersPage = computed(() => route.path.includes('/users'))

// ❌ غير تفاعلي - Not reactive
const currentPath = window.location.pathname
```

### 3. **Type Safety**
```typescript
// ✅ Type-safe
const route = useRoute()
route.params.id  // TypeScript support

// ❌ Less type-safe
const params = new URLSearchParams(window.location.search)
```

### 4. **Navigation Guards**
```typescript
// ✅ يمر عبر navigation guards - Goes through navigation guards
await router.push('/dashboard')

// ❌ يتجاهل navigation guards - Bypasses navigation guards
window.location.href = '/dashboard'
```

## أمثلة عملية | Practical Examples

### مراقبة تغييرات Query Parameters
```vue
<script setup>
// ✅ طريقة Nuxt 3 - Nuxt 3 way
const route = useRoute()
const router = useRouter()

// مراقبة تغييرات الصفحة - Watch page changes
watch(() => route.query.page, (newPage) => {
  fetchData(newPage)
})

// تحديث query parameter - Update query parameter
const updatePage = (page: number) => {
  router.push({
    query: { ...route.query, page }
  })
}
</script>
```

### التحقق من المسار الحالي
```vue
<script setup>
// ✅ طريقة Nuxt 3 - Nuxt 3 way
const route = useRoute()

const isAdminPage = computed(() => route.path.startsWith('/admin'))
const isDashboard = computed(() => route.name === 'dashboard')
const hasUserId = computed(() => !!route.params.id)
</script>

<template>
  <div>
    <AdminNavbar v-if="isAdminPage" />
    <DashboardSidebar v-if="isDashboard" />
    <UserProfile v-if="hasUserId" :userId="route.params.id" />
  </div>
</template>
```

## الخلاصة | Summary

### ✅ استعمل دائماً | Always Use:
- `useRoute()` للحصول على معلومات المسار
- `useRouter()` للتنقل البرمجي
- `useRequestURL()` للحصول على URL كامل
- `useApi()` للطلبات API
- `navigateTo()` للتوجيه

### ❌ تجنب | Avoid:
- `window.location.*` مباشرة
- `$fetch` مباشرة للطلبات المصادقة
- `window.history.*` مباشرة
- فحوصات `process.client` غير الضرورية

### 📈 النتائج | Results:
- كود يعمل على server و client
- دعم أفضل للـ TypeScript
- performance محسن
- navigation guards تعمل بشكل صحيح
- reactive state management
- error handling موحد

هذا هو السبب في أن Nuxt 3 يوفر هذه الـ composables - لجعل التطوير أسهل وأكثر اتساقاً! 🚀