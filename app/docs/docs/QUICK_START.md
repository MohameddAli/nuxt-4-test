# دليل البدء السريع - معالجة الأخطاء المحدث

## 🚀 البدء السريع (5 دقائق)

> **تم التحديث:** دمج نظامي معالجة الأخطاء في نظام واحد محسّن! 

### 1. حماية صفحة بالصلاحيات

```vue
<!-- pages/protected.vue -->
<script setup>
// 🔒 هذا كل ما تحتاجه لحماية الصفحة
definePageMeta({
  middleware: ['auth', 'permission'],
  permission: 'users.view'
})
</script>

<template>
  <div>محتوى محمي</div>
</template>
```

**النتيجة:**
- ✅ إذا كان لديك الصلاحية → تفتح الصفحة
- ❌ إذا لم تكن لديك → Snackbar + العودة للرئيسية

### 2. معالجة أخطاء API (الطريقة الجديدة المحسّنة)

```vue
<script setup>
import { useErrorHandler } from '~/composables/useErrorHandler'

const { handleApiError, showSuccessMessage } = useErrorHandler()

const saveData = async () => {
  try {
    await $fetch('/api/save', { method: 'POST', body: data })
    showSuccessMessage('تم الحفظ بنجاح!')
  } catch (error) {
    // 🎯 معالجة ذكية تلقائية - يحدد نوع الخطأ ويعالجه
    handleApiError(error, saveData, 'حفظ البيانات')
  }
}

// أو استخدام المعالج الذكي العام
const handleAnyError = async () => {
  try {
    // عملية قد تفشل
  } catch (error) {
    handleError(error, {
      context: 'وصف العملية',
      retryFn: handleAnyError, // إعادة المحاولة
      fallbackMessage: 'رسالة خطأ مخصصة'
    })
  }
}
</script>
```

### 3. حماية مكون من الأخطاء

```vue
<template>
  <NuxtErrorBoundary>
    <RiskyComponent />
    
    <template #error="{ error, clearError }">
      <v-alert type="error" closable @click:close="clearError">
        خطأ: {{ error.message }}
        <v-btn @click="clearError" size="small" class="ml-2">
          إعادة المحاولة
        </v-btn>
      </v-alert>
    </template>
  </NuxtErrorBoundary>
</template>
```

---

## 🎯 الميزات الجديدة المحسّنة

### ✨ **معالجة ذكية تلقائية:**
```typescript
const { handleError } = useErrorHandler()

// يحدد نوع الخطأ تلقائياً ويعالجه
handleError(anyError) // 🧠 ذكي!
```

### ✨ **إعادة المحاولة المدمجة:**
```typescript
const { handleApiError } = useErrorHandler()

// مع إعادة المحاولة التلقائية
handleApiError(error, retryFunction, 'العملية')
```

### ✨ **معالجة متقدمة مع خيارات:**
```typescript
const { handleError } = useErrorHandler()

handleError(error, {
  context: 'تحميل الصفحة',
  retryFn: () => window.location.reload(),
  fallbackMessage: 'فشل التحميل',
  redirect: '/safe-page'
})
```

---

## 📱 أمثلة جاهزة للتجربة

1. **صفحة محمية:** `/examples/protected-page`
2. **Error Boundary Demo:** `/examples/error-boundary-demo`

---

## 🎯 ما يحدث تلقائياً (محدث)

| الخطأ | النوع | العرض | الإجراء |
|-------|-------|-------|---------|
| 401 | `auth` | Snackbar: "انتهت الجلسة" | تسجيل خروج + login |
| 403 | `auth` | Snackbar: "لا توجد صلاحية" | العودة للرئيسية |
| 400 | `validation` | Snackbar تحذيري | عرض أخطاء التحقق |
| 404/500 | `server` | صفحة خطأ أو Snackbar | إعادة المحاولة |
| Network | `network` | Snackbar: "مشكلة اتصال" | إعادة المحاولة |
| Client | `client` | Snackbar: "خطأ عرض" | إعادة تحميل |

**النظام ذكي - يحدد النوع تلقائياً ويعالج بالطريقة المناسبة!** 🧠✨

---

## 🔧 API المحسّن

```typescript
const {
  // المعالج الذكي الرئيسي
  handleError,              // 🧠 ذكي - يحدد النوع تلقائياً
  
  // معالجات محددة  
  handleApiError,           // لطلبات API مع إعادة المحاولة
  handleAuthError,          // أخطاء 401/403
  handleValidationError,    // أخطاء 400
  handleNetworkError,       // أخطاء الشبكة
  handleServerError,        // أخطاء 500+
  handleClientError,        // أخطاء JavaScript
  
  // معالجات متقدمة
  handleAsyncError,         // حماية العمليات غير المتزامنة
  handleErrorWithRetry,     // إعادة محاولة تلقائية
  
  // رسائل سريعة
  showSuccessMessage,       // رسائل النجاح
  showWarningMessage,       // رسائل التحذير
  showInfoMessage,          // رسائل المعلومات
  
  // فحص الأنواع
  isAuthError,              // فحص أخطاء المصادقة
  isNetworkError,           // فحص أخطاء الشبكة
  isValidationError,        // فحص أخطاء التحقق
  getErrorType              // تحديد نوع الخطأ
} = useErrorHandler()
```

**لا تحتاج فعل أي شيء إضافي - النظام ذكي ويعمل تلقائياً!** ✨🎊