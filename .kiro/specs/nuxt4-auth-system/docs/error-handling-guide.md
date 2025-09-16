# دليل التعامل مع الأخطاء الشامل

# Comprehensive Error Handling Guide

## نظرة عامة | Overview

يوفر نظام المصادقة المحسن في Nuxt 4 نظاماً شاملاً للتعامل مع الأخطاء يتضمن:

The enhanced Nuxt 4 authentication system provides a comprehensive error handling system that includes:

- **تصنيف ذكي للأخطاء** - Intelligent error categorization
- **رسائل ذكية باللغة العربية** - Smart Arabic fallback messages
- **إعطاء الأولوية لرسائل الخادم** - Backend message priority
- **معالج عام لانتهاء الجلسة** - Global session expiry handler
- **مراقبة حالة الشبكة** - Network status monitoring
- **آليات إعادة المحاولة التلقائية** - Automatic retry mechanisms

## المكونات الأساسية | Core Components

### 1. useErrorHandler - معالج الأخطاء المحسن

```typescript
import { useErrorHandler } from "~/composables/useErrorHandler";

const {
  handleError,
  handleNetworkError,
  handleServerError,
  handleValidationError,
  handleAuthError,
  handlePermissionError,
} = useErrorHandler();
```

### 2. useSessionExpiry - معالج انتهاء الجلسة

```typescript
import {
  useSessionExpiry,
  useGlobalSessionExpiry,
} from "~/composables/useSessionExpiry";

const { handleSessionExpiry, isSessionExpired } = useSessionExpiry();
const { handle401Error } = useGlobalSessionExpiry();
```

### 3. useNetworkStatus - مراقب حالة الشبكة

```typescript
import { useNetworkStatus } from "~/composables/useNetworkStatus";

const { isOnline, connectionQuality, addToRetryQueue } = useNetworkStatus();
```

## تصنيف الأخطاء | Error Categories

### الفئات المدعومة | Supported Categories

| الفئة        | Category  | الوصف                    | Description                   | مثال            | Example                |
| ------------ | --------- | ------------------------ | ----------------------------- | --------------- | ---------------------- |
| `network`    | شبكة      | أخطاء الاتصال والشبكة    | Connection and network errors | انقطاع الإنترنت | Internet disconnection |
| `server`     | خادم      | أخطاء الخادم (5xx)       | Server errors (5xx)           | خطأ داخلي       | Internal server error  |
| `validation` | تحقق      | أخطاء التحقق من البيانات | Data validation errors        | حقل مطلوب       | Required field         |
| `auth`       | مصادقة    | أخطاء المصادقة (401)     | Authentication errors (401)   | انتهاء الجلسة   | Session expired        |
| `permission` | صلاحيات   | أخطاء التفويض (403)      | Authorization errors (403)    | عدم وجود صلاحية | No permission          |
| `client`     | عميل      | أخطاء العميل الأخرى      | Other client errors           | طلب خاطئ        | Bad request            |
| `unknown`    | غير معروف | أخطاء غير مصنفة          | Unclassified errors           | خطأ غير متوقع   | Unexpected error       |

## الاستخدام الأساسي | Basic Usage

### 1. معالجة الأخطاء العامة | General Error Handling

```typescript
// في composable أو component
// In a composable or component
export default defineComponent({
  setup() {
    const { handleError } = useErrorHandler();

    const submitForm = async (formData: any) => {
      try {
        const response = await $fetch("/api/submit", {
          method: "POST",
          body: formData,
        });

        return response;
      } catch (error) {
        // معالجة شاملة للخطأ مع السياق
        // Comprehensive error handling with context
        await handleError(error, {
          context: "إرسال النموذج", // 'Form submission'
          endpoint: "/api/submit",
          showToUser: true,
          enableRetry: true,
        });

        throw error;
      }
    };

    return { submitForm };
  },
});
```

### 2. معالجة أخطاء محددة | Specific Error Handling

```typescript
const { handleNetworkError, handleServerError, handleValidationError } =
  useErrorHandler();

// معالجة أخطاء الشبكة
// Network error handling
try {
  await apiCall();
} catch (error) {
  if (isNetworkError(error)) {
    await handleNetworkError(error, "تحميل البيانات");
  }
}

// معالجة أخطاء الخادم
// Server error handling
try {
  await serverOperation();
} catch (error) {
  if (isServerError(error)) {
    await handleServerError(error, "العملية على الخادم");
  }
}

// معالجة أخطاء التحقق
// Validation error handling
try {
  await validateAndSubmit(data);
} catch (error) {
  if (isValidationError(error)) {
    await handleValidationError(error, "التحقق من البيانات");
  }
}
```

## معالجة انتهاء الجلسة | Session Expiry Handling

### 1. المعالج العام لـ 401 | Global 401 Handler

```typescript
// يتم استدعاؤه تلقائياً من useApi
// Called automatically from useApi
const { handle401Error } = useGlobalSessionExpiry();

// أو يمكن استدعاؤه يدوياً
// Or can be called manually
const handleApiCall = async () => {
  try {
    return await $fetch("/api/protected-endpoint");
  } catch (error) {
    if (error.status === 401) {
      const wasHandled = await handle401Error(
        error,
        "/api/protected-endpoint",
        "العملية المحمية"
      );

      if (wasHandled) {
        return; // تم التعامل مع انتهاء الجلسة
      }
    }

    throw error;
  }
};
```

### 2. التحكم في سلوك انتهاء الجلسة | Session Expiry Behavior Control

```typescript
const { handleSessionExpiry } = useSessionExpiry();

// تخصيص سلوك انتهاء الجلسة
// Customize session expiry behavior
await handleSessionExpiry(error, "/api/endpoint", {
  message: "رسالة مخصصة لانتهاء الجلسة",
  redirectDelay: 3000,
  saveReturnUrl: true,
  showSnackbar: true,
  allowTokenRefresh: true,
});
```

### 3. مراقبة حالة الجلسة | Session State Monitoring

```typescript
const { isSessionExpired, isSessionLikelyExpired, lastExpiryEvent } =
  useSessionExpiry();

// مراقبة حالة الجلسة في المكون
// Monitor session state in component
watch(isSessionExpired, (expired) => {
  if (expired) {
    console.log("الجلسة منتهية الصلاحية");
    // تنفيذ منطق إضافي
  }
});
```

## التكامل مع رسائل الخادم | Backend Message Integration

### 1. أولوية الرسائل | Message Priority

النظام يعطي الأولوية لرسائل الخادم على الرسائل المحلية:

The system prioritizes backend messages over local messages:

```typescript
// مثال على استجابة الخادم
// Example server response
{
  "status": 400,
  "data": {
    "message": "اسم المستخدم مطلوب", // Backend message in Arabic
    "errors": {
      "username": ["هذا الحقل مطلوب"]
    }
  }
}

// النظام سيعرض رسالة الخادم أولاً
// System will display backend message first
const { handleError } = useErrorHandler()

await handleError(serverError, {
  context: 'تسجيل الدخول',
  customFallback: 'خطأ في تسجيل الدخول' // Used only if no backend message
})
```

### 2. استخراج الرسائل المعقدة | Complex Message Extraction

```typescript
// للرسائل المعقدة من الخادم
// For complex server messages
import { extractErrorMessage } from "~/shared/utils/errorHandler";

const serverResponse = {
  data: {
    message: "خطأ في التحقق",
    validation: {
      email: ["البريد الإلكتروني غير صحيح"],
      password: ["كلمة المرور قصيرة جداً"],
    },
  },
};

const message = extractErrorMessage(serverResponse, {
  includeDetails: true,
  maxDetails: 3,
  separator: " • ",
});

console.log(message); // "خطأ في التحقق (البريد الإلكتروني غير صحيح • كلمة المرور قصيرة جداً)"
```

## مراقبة الشبكة وإعادة المحاولة | Network Monitoring & Retry

### 1. مراقبة حالة الشبكة | Network Status Monitoring

```typescript
const { isOnline, connectionQuality, isSlowConnection } = useNetworkStatus();

// مراقبة تغييرات الشبكة
// Monitor network changes
watch(isOnline, (online) => {
  if (online) {
    console.log("تم استعادة الاتصال");
    // إعادة تنفيذ العمليات المؤجلة
  } else {
    console.log("انقطع الاتصال");
    // إيقاف العمليات غير الضرورية
  }
});
```

### 2. إضافة العمليات لقائمة إعادة المحاولة | Adding Operations to Retry Queue

```typescript
const { addToRetryQueue } = useNetworkStatus();
const { addToNetworkRetryQueue } = useErrorHandler();

// إضافة عملية لإعادة المحاولة عند استعادة الاتصال
// Add operation to retry when connection is restored
const criticalOperation = async () => {
  return await $fetch("/api/critical-data");
};

// الطريقة الأولى: استخدام useNetworkStatus
// Method 1: Using useNetworkStatus
addToRetryQueue(criticalOperation);

// الطريقة الثانية: استخدام useErrorHandler (مع رسائل)
// Method 2: Using useErrorHandler (with messages)
addToNetworkRetryQueue(criticalOperation, "تحميل البيانات الحرجة");
```

### 3. إعادة المحاولة التلقائية | Automatic Retry

```typescript
const { mutate } = useMutation();

// إعادة المحاولة التلقائية مع تأخير
// Automatic retry with delay
const result = await mutate("post", "/api/data", formData, {
  retries: 3, // عدد المحاولات
  showSuccess: true,
  successMessage: "تم الحفظ بنجاح",
});
```

## أمثلة متقدمة | Advanced Examples

### 1. معالجة شاملة في صفحة | Comprehensive Page Error Handling

```vue
<template>
  <div>
    <v-form @submit.prevent="handleSubmit">
      <!-- محتوى النموذج -->
    </v-form>

    <!-- عرض أخطاء التحقق -->
    <div v-if="validationErrors.length">
      <v-alert type="error">
        <ul>
          <li v-for="error in validationErrors" :key="error">
            {{ error }}
          </li>
        </ul>
      </v-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
const { handleError, handleValidationError, lastError } = useErrorHandler();

const { isOnline } = useNetworkStatus();
const validationErrors = ref<string[]>([]);

const handleSubmit = async (formData: any) => {
  try {
    validationErrors.value = [];

    const response = await $fetch("/api/submit", {
      method: "POST",
      body: formData,
    });

    // نجحت العملية
    navigateTo("/success");
  } catch (error) {
    const statusCode = error?.status || error?.statusCode;

    if (statusCode === 422) {
      // أخطاء التحقق - عرض في النموذج
      await handleValidationError(error, "إرسال النموذج");

      // استخراج أخطاء التحقق للعرض
      if (error.data?.errors) {
        validationErrors.value = Object.values(error.data.errors).flat();
      }
    } else {
      // أخطاء أخرى - معالجة عامة
      await handleError(error, {
        context: "إرسال النموذج",
        endpoint: "/api/submit",
        enableRetry: !isOnline.value,
      });
    }
  }
};

// مراقبة آخر خطأ للتصحيح
watch(lastError, (error) => {
  if (error && import.meta.dev) {
    console.log("آخر خطأ:", error);
  }
});
</script>
```

### 2. معالجة الأخطاء في Composable | Error Handling in Composable

```typescript
// composables/useUserData.ts
export const useUserData = () => {
  const { handleError, handleNetworkError, addToNetworkRetryQueue } =
    useErrorHandler();

  const users = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchUsers = async (retryOnFailure = true) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await $fetch("/api/users");
      users.value = response.data;
    } catch (fetchError) {
      error.value = fetchError;

      // معالجة مختلفة حسب نوع الخطأ
      if (fetchError.status === 0 || !navigator.onLine) {
        // خطأ شبكة
        await handleNetworkError(fetchError, "تحميل المستخدمين");

        if (retryOnFailure) {
          // إضافة لقائمة إعادة المحاولة
          addToNetworkRetryQueue(() => fetchUsers(false), "تحميل المستخدمين");
        }
      } else {
        // أخطاء أخرى
        await handleError(fetchError, {
          context: "تحميل المستخدمين",
          endpoint: "/api/users",
          enableRetry: true,
        });
      }

      throw fetchError;
    } finally {
      loading.value = false;
    }
  };

  return {
    users: readonly(users),
    loading: readonly(loading),
    error: readonly(error),
    fetchUsers,
  };
};
```

### 3. معالجة الأخطاء في Plugin | Error Handling in Plugin

```typescript
// plugins/global-error-handler.client.ts
export default defineNuxtPlugin(() => {
  const { handleError } = useErrorHandler();
  const { handle401Error } = useGlobalSessionExpiry();

  // معالج عام للأخطاء غير المتوقعة
  window.addEventListener("unhandledrejection", async (event) => {
    console.error("خطأ غير معالج:", event.reason);

    await handleError(event.reason, {
      context: "خطأ غير متوقع",
      showToUser: true,
    });
  });

  // معالج عام لأخطاء JavaScript
  window.addEventListener("error", async (event) => {
    console.error("خطأ JavaScript:", event.error);

    await handleError(event.error, {
      context: "خطأ في JavaScript",
      showToUser: false, // لا نعرض أخطاء JS للمستخدم عادة
      logError: true,
    });
  });
});
```

## أفضل الممارسات | Best Practices

### 1. تصنيف الأخطاء | Error Categorization

```typescript
// ✅ جيد: استخدام المعالجات المحددة
// ✅ Good: Use specific handlers
const { handleValidationError, handleNetworkError } = useErrorHandler()

if (error.status === 422) {
  await handleValidationError(error, 'التحقق من النموذج')
} else if (!navigator.onLine) {
  await handleNetworkError(error, 'تحميل البيانات')
}

// ❌ سيء: معالجة عامة لكل شيء
// ❌ Bad: Generic handling for everything
catch (error) {
  showError('حدث خطأ')
}
```

### 2. السياق والرسائل | Context and Messages

```typescript
// ✅ جيد: توفير سياق واضح
// ✅ Good: Provide clear context
await handleError(error, {
  context: "حفظ إعدادات المستخدم",
  endpoint: "/api/user/settings",
  customFallback: "فشل في حفظ الإعدادات",
});

// ❌ سيء: بدون سياق
// ❌ Bad: Without context
await handleError(error);
```

### 3. إعادة المحاولة الذكية | Smart Retry

```typescript
// ✅ جيد: إعادة محاولة ذكية
// ✅ Good: Smart retry
const { isOnline } = useNetworkStatus();
const { addToNetworkRetryQueue } = useErrorHandler();

if (!isOnline.value) {
  // إضافة للقائمة بدلاً من المحاولة الفورية
  addToNetworkRetryQueue(operation, "العملية المهمة");
} else {
  // محاولة فورية
  await operation();
}

// ❌ سيء: إعادة محاولة عمياء
// ❌ Bad: Blind retry
for (let i = 0; i < 3; i++) {
  try {
    await operation();
    break;
  } catch (error) {
    // محاولة مرة أخرى بدون تحقق من السبب
  }
}
```

### 4. معالجة أخطاء التحقق | Validation Error Handling

```typescript
// ✅ جيد: عرض أخطاء التحقق في المكون
// ✅ Good: Display validation errors in component
const validationErrors = ref<Record<string, string[]>>({})

try {
  await submitForm(data)
} catch (error) {
  if (error.status === 422) {
    // لا تعرض في snackbar، بل في النموذج
    await handleValidationError(error, 'إرسال النموذج')
    validationErrors.value = error.data?.errors || {}
  }
}

// ❌ سيء: عرض أخطاء التحقق في snackbar
// ❌ Bad: Show validation errors in snackbar
catch (error) {
  showError(error.message) // مربك للمستخدم
}
```

## التصحيح والمراقبة | Debugging and Monitoring

### 1. مراقبة الأخطاء | Error Monitoring

```typescript
const { errorStats, recentErrors, getErrorSummary } = useErrorHandler();

// في وضع التطوير
if (import.meta.dev) {
  // مراقبة إحصائيات الأخطاء
  watch(errorStats, (stats) => {
    console.log("إحصائيات الأخطاء:", stats);
  });

  // عرض ملخص الأخطاء
  console.log("ملخص الأخطاء:", getErrorSummary());
}
```

### 2. تسجيل الأخطاء | Error Logging

```typescript
// تخصيص تسجيل الأخطاء
const { handleError } = useErrorHandler();

await handleError(error, {
  context: "عملية حرجة",
  logError: true, // تسجيل في console
  // TODO: إرسال لخدمة التسجيل الخارجية
});
```

### 3. اختبار معالجة الأخطاء | Testing Error Handling

```typescript
// للاختبار في وضع التطوير
const { triggerSessionExpiry } = useSessionExpiry();

// محاكاة انتهاء الجلسة
await triggerSessionExpiry("اختبار انتهاء الجلسة");

// محاكاة أخطاء مختلفة
const mockErrors = {
  network: { status: 0, message: "Network Error" },
  server: { status: 500, message: "Internal Server Error" },
  validation: { status: 422, data: { errors: { field: ["خطأ"] } } },
};

for (const [type, error] of Object.entries(mockErrors)) {
  await handleError(error, { context: `اختبار ${type}` });
}
```

## الخلاصة | Summary

نظام معالجة الأخطاء المحسن يوفر:

The enhanced error handling system provides:

- **معالجة ذكية ومصنفة للأخطاء** - Smart and categorized error handling
- **رسائل باللغة العربية مع أولوية للخادم** - Arabic messages with backend priority
- **معالجة تلقائية لانتهاء الجلسة** - Automatic session expiry handling
- **مراقبة الشبكة وإعادة المحاولة** - Network monitoring and retry
- **تكامل سلس مع النظام الموجود** - Seamless integration with existing system

استخدم هذا النظام لتوفير تجربة مستخدم محسنة ومعالجة أخطاء موثوقة في تطبيق Nuxt 4.

Use this system to provide an enhanced user experience and reliable error handling in your Nuxt 4 application.
