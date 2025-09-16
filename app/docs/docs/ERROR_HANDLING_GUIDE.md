# دليل معالجة الأخطاء الشامل المحدث - Nuxt 3

## 📋 نظرة عامة

> **🎉 تم التحديث:** دمج نظامي معالجة الأخطاء في نظام واحد ذكي ومحسّن!

هذا الدليل يوضح كيفية استخدام نظام معالجة الأخطاء المتطور والموحد في تطبيق Nuxt 3.

## 🎯 استراتيجية معالجة الأخطاء المحسّنة

### 1. **المعالجة الذكية التلقائية** 🧠
- النظام يحدد نوع الخطأ تلقائياً
- معالجة مناسبة لكل نوع
- رسائل واضحة ومفيدة

### 2. **التصنيف التلقائي:**
| النوع | الأخطاء | المعالجة |
|-------|---------|----------|
| `auth` | 401, 403 | Snackbar + إعادة توجيه |
| `validation` | 400 | Snackbar تحذيري |
| `server` | 404, 500+ | Error page أو Snackbar |
| `network` | اتصال | Snackbar + إعادة محاولة |
| `client` | JavaScript | Snackbar + إعادة تحميل |
| `unknown` | غير محدد | معالجة عامة |

### 3. **المرونة الكاملة:**
- خيارات تخصيص شاملة
- إعادة المحاولة التلقائية
- رسائل مخصصة لكل سياق

---

## 🛠️ كيفية الاستخدام

### 1. الاستخدام البسيط - المعالج الذكي

```vue
<script setup>
import { useErrorHandler } from '~/composables/useErrorHandler'

const { handleError, showSuccessMessage } = useErrorHandler()

const submitData = async () => {
  try {
    await $fetch('/api/submit', { method: 'POST', body: data })
    showSuccessMessage('تم بنجاح!')
  } catch (error) {
    // 🧠 معالجة ذكية - يحدد النوع ويعالج تلقائياً
    handleError(error)
  }
}
</script>
```

### 2. الاستخدام المتقدم - مع خيارات

```vue
<script setup>
const { handleError, handleApiError } = useErrorHandler()

const complexOperation = async () => {
  try {
    const result = await $fetch('/api/complex')
    return result
  } catch (error) {
    // مع خيارات متقدمة
    handleError(error, {
      context: 'العملية المعقدة',
      retryFn: complexOperation,
      fallbackMessage: 'فشلت العملية المعقدة',
      redirect: '/safe-page'
    })
  }
}

// أو للـ API خاصة
const apiCall = async () => {
  try {
    return await $fetch('/api/data')
  } catch (error) {
    // معالجة API مع إعادة المحاولة
    handleApiError(error, apiCall, 'جلب البيانات')
  }
}
</script>
```

### 3. حماية الصفحات بالصلاحيات

```vue
<!-- pages/protected.vue -->
<script setup>
// 🔒 حماية بالصلاحيات
definePageMeta({
  middleware: ['auth', 'permission'],
  permission: 'users.view', // صلاحية واحدة
  // أو
  permissions: ['users.view', 'users.edit'], // صلاحيات متعددة
  permissionMode: 'any' // 'any' أو 'all'
})
</script>

<template>
  <div>محتوى محمي</div>
</template>
```

### 4. حماية المكونات بـ Error Boundary

```vue
<template>
  <div>
    <!-- محتوى آمن -->
    <SafeComponent />
    
    <!-- مكون محمي -->
    <NuxtErrorBoundary>
      <RiskyComponent />
      
      <template #error="{ error, clearError }">
        <v-alert type="error" closable @click:close="clearError">
          <v-alert-title>
            <v-icon start icon="mdi-alert-circle" />
            خطأ في المكون
          </v-alert-title>
          <p>{{ error.message }}</p>
          
          <div class="mt-3">
            <v-btn @click="clearError" size="small" color="primary">
              إعادة المحاولة
            </v-btn>
          </div>
        </v-alert>
      </template>
    </NuxtErrorBoundary>
    
    <!-- محتوى آمن آخر -->
    <AnotherSafeComponent />
  </div>
</template>
```

---

## 🎛️ API الموحد المحسّن

```typescript
const {
  // 🧠 المعالج الذكي الرئيسي
  handleError,              // يحدد النوع تلقائياً ويعالج
  
  // 🎯 معالجات محددة
  handleApiError,           // لطلبات API مع إعادة المحاولة
  handleAuthError,          // أخطاء المصادقة (401/403)
  handleValidationError,    // أخطاء التحقق (400)
  handleNetworkError,       // أخطاء الشبكة
  handleServerError,        // أخطاء الخادم (500+)
  handleClientError,        // أخطاء JavaScript
  
  // 🚀 معالجات متقدمة
  handleAsyncError,         // حماية العمليات غير المتزامنة
  handleErrorWithRetry,     // إعادة محاولة تلقائية متقدمة
  
  // 📝 مساعدات
  createCustomError,        // إنشاء أخطاء مخصصة
  getErrorType,             // تحديد نوع الخطأ
  
  // 🔍 فحص الأنواع
  isAuthError,              // فحص أخطاء المصادقة
  isNetworkError,           // فحص أخطاء الشبكة
  isValidationError,        // فحص أخطاء التحقق
  
  // 💬 رسائل سريعة
  showSuccessMessage,       // رسائل النجاح
  showWarningMessage,       // رسائل التحذير
  showInfoMessage           // رسائل المعلومات
} = useErrorHandler()
```

---

## 📱 أمثلة عملية محدثة

### 1. صفحة إدارة المستخدمين

```vue
<!-- pages/admin/users.vue -->
<template>
  <div>
    <v-card>
      <v-card-title>إدارة المستخدمين</v-card-title>
      <v-card-text>
        <NuxtErrorBoundary>
          <UserDataTable 
            :users="users"
            @delete="handleDeleteUser"
            @edit="handleEditUser"
          />
          
          <template #error="{ error, clearError }">
            <v-alert type="error">
              <p>خطأ في جدول المستخدمين: {{ error.message }}</p>
              <v-btn @click="clearError" size="small">إعادة تحميل</v-btn>
            </v-alert>
          </template>
        </NuxtErrorBoundary>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { useErrorHandler } from '~/composables/useErrorHandler'

definePageMeta({
  middleware: ['auth', 'permission'],
  permission: 'users.manage',
  layout: 'admin'
})

const { handleApiError, showSuccessMessage } = useErrorHandler()

// جلب البيانات
const { data: users, error, refresh } = await useFetch('/api/users')

if (error.value) {
  handleApiError(error.value, refresh, 'جلب بيانات المستخدمين')
}

// حذف مستخدم
const handleDeleteUser = async (userId) => {
  try {
    await $fetch(`/api/users/${userId}`, { method: 'DELETE' })
    showSuccessMessage('تم حذف المستخدم بنجاح')
    await refresh()
  } catch (error) {
    handleApiError(error, () => handleDeleteUser(userId), 'حذف المستخدم')
  }
}

// تعديل مستخدم
const handleEditUser = async (userData) => {
  try {
    await $fetch(`/api/users/${userData.id}`, {
      method: 'PUT',
      body: userData
    })
    showSuccessMessage('تم تحديث المستخدم بنجاح')
    await refresh()
  } catch (error) {
    handleApiError(error, () => handleEditUser(userData), 'تحديث المستخدم')
  }
}
</script>
```

### 2. نموذج تسجيل الدخول المحسّن

```vue
<!-- components/LoginForm.vue -->
<template>
  <v-form @submit.prevent="handleLogin">
    <v-text-field
      v-model="form.username"
      label="اسم المستخدم"
      :error-messages="errors.username"
    />
    
    <v-text-field
      v-model="form.password"
      label="كلمة المرور"
      type="password"
      :error-messages="errors.password"
    />
    
    <v-btn type="submit" :loading="loading" block>
      تسجيل الدخول
    </v-btn>
  </v-form>
</template>

<script setup>
import { useErrorHandler } from '~/composables/useErrorHandler'
import { useAuth } from '~/composables/useAuth'

const { handleError, showSuccessMessage } = useErrorHandler()
const { login } = useAuth()

const form = reactive({
  username: '',
  password: ''
})

const errors = ref({})
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  errors.value = {}
  
  try {
    await login(form.username, form.password)
    showSuccessMessage('تم تسجيل الدخول بنجاح')
    // سيتم التوجيه تلقائياً
  } catch (error) {
    // 🧠 معالجة ذكية تلقائية
    handleError(error, {
      context: 'تسجيل الدخول',
      fallbackMessage: 'فشل في تسجيل الدخول'
    })
    
    // معالجة أخطاء التحقق للحقول
    if (error.status === 400 && error.data?.errors) {
      errors.value = error.data.errors
    }
  } finally {
    loading.value = false
  }
}
</script>
```

### 3. معالجة متقدمة مع إعادة المحاولة

```vue
<script setup>
import { useErrorHandler } from '~/composables/useErrorHandler'

const { handleErrorWithRetry, handleAsyncError } = useErrorHandler()

// إعادة محاولة تلقائية متقدمة
const reliableApiCall = async () => {
  return await handleErrorWithRetry(
    () => $fetch('/api/important-data'),
    3, // عدد المحاولات
    1000, // تأخير بالميللي ثانية
    'جلب البيانات المهمة' // السياق
  )
}

// حماية العمليات غير المتزامنة
const safeOperation = async () => {
  const result = await handleAsyncError(
    () => complexAsyncOperation(),
    'قيمة افتراضية', // قيمة احتياطية
    { 
      context: 'العملية المعقدة',
      fallbackMessage: 'فشلت العملية، تم استخدام القيمة الافتراضية'
    }
  )
  
  return result
}
</script>
```

---

## 🚨 حالات الاستخدام المتقدمة

### 1. معالجة أخطاء مخصصة

```typescript
// إنشاء خطأ مخصص
const customError = createCustomError(
  'رسالة خطأ مخصصة',
  422, // رمز الحالة
  'العملية المخصصة' // السياق
)

// معالجة الخطأ المخصص
handleError(customError, {
  retryFn: () => retryCustomOperation(),
  redirect: '/custom-page'
})
```

### 2. فحص نوع الخطأ

```typescript
const processError = (error) => {
  const errorType = getErrorType(error)
  
  switch (errorType) {
    case 'auth':
      // معالجة خاصة لأخطاء المصادقة
      break
    case 'network':
      // معالجة خاصة لأخطاء الشبكة
      break
    default:
      // معالجة عامة
      handleError(error)
  }
}
```

### 3. نظام إنذار متقدم

```typescript
// مراقبة الأخطاء وإرسال إحصائيات
const monitorErrors = () => {
  const originalHandleError = handleError
  
  return (...args) => {
    // إرسال للـ analytics
    if (process.client) {
      // تتبع الأخطاء
      gtag('event', 'error', {
        error_type: getErrorType(args[0]),
        error_message: args[0]?.message
      })
    }
    
    return originalHandleError(...args)
  }
}
```

---

## ✅ أفضل الممارسات المحدثة

### 1. **استخدم المعالج الذكي أولاً**
```typescript
// ✅ ممتاز - يحدد النوع تلقائياً
handleError(error)

// ⚠️ جيد - عندما تحتاج خيارات محددة
handleApiError(error, retryFn, context)
```

### 2. **أضف السياق دائماً**
```typescript
// ✅ ممتاز - مع سياق واضح
handleError(error, { context: 'حفظ بيانات المستخدم' })

// ❌ سيء - بدون سياق
handleError(error)
```

### 3. **استخدم إعادة المحاولة للعمليات المهمة**
```typescript
// ✅ ممتاز - مع إعادة محاولة
handleApiError(error, retryFunction, 'العملية المهمة')

// ⚠️ جيد - للعمليات غير الحرجة
handleError(error)
```

### 4. **Error Boundary للمكونات المعقدة فقط**
```vue
<!-- ✅ ممتاز - للمكونات المعقدة -->
<NuxtErrorBoundary>
  <ComplexDataVisualization />
</NuxtErrorBoundary>

<!-- ❌ سيء - للعناصر البسيطة -->
<NuxtErrorBoundary>
  <v-btn>زر بسيط</v-btn>
</NuxtErrorBoundary>
```

---

## 🎯 الخلاصة الجديدة

النظام الموحد الجديد يوفر:

- 🧠 **ذكاء تلقائي:** يحدد نوع الخطأ ويعالجه تلقائياً
- 🎯 **دقة في المعالجة:** كل نوع خطأ له معالجة مناسبة
- 🚀 **أداء محسّن:** نظام واحد بدلاً من اثنين
- 💡 **سهولة الاستخدام:** API واحد لجميع الاحتياجات
- 🔧 **مرونة كاملة:** خيارات متقدمة عند الحاجة
- 📱 **تجربة مستخدم ممتازة:** رسائل واضحة وإجراءات مناسبة

استمتع ببناء تطبيقات Nuxt 3 قوية وموثوقة مع النظام الجديد المحسّن! 🚀✨