# نظام الصفحات غير المصرح بها - Unauthorized Access System

## نظرة عامة

تم تطوير نظام شامل ومتكامل للتعامل مع الصفحات غير المصرح بها، يوفر تجربة مستخدم احترافية عند محاولة الوصول لصفحات محمية دون تصريح مناسب.

## المكونات الرئيسية

### 1. Layout غير المصرح بها (`layouts/unauthorized.vue`)

Layout احترافي ومصمم خصيصاً للصفحات غير المصرح بها:

**الميزات:**
- تصميم عصري مع تدرجات لونية احترافية
- دعم كامل للوضع المظلم/الفاتح
- تصميم متجاوب يعمل على جميع الأجهزة
- دعم اللغة العربية والإنجليزية (RTL/LTR)
- تكامل مع Error Boundary للأمان
- أيقونات وألوان تتماشى مع نظام التصميم

**المحتوى:**
- أيقونة قفل مع تأثيرات بصرية
- رسالة واضحة للمستخدم
- أزرار للتوجيه (تسجيل دخول، الرئيسية)
- شعار الشركة
- محتوى مخصص من الصفحة

### 2. الصفحة النموذجية (`pages/unauthorized.vue`)

صفحة متكاملة للتعامل مع حالات عدم التصريح:

**الميزات:**
- عد تنازلي تلقائي للتوجيه (10 ثوان)
- إمكانية إلغاء التوجيه التلقائي
- عرض أسباب منع الوصول
- معلومات المساعدة والدعم
- تكامل مع نظام المصادقة

### 3. Composable متخصص (`composables/useUnauthorized.ts`)

Composable شامل يوفر جميع الوظائف المطلوبة:

```typescript
const {
  // وظائف التوجيه
  redirectToLogin,
  redirectToUnauthorized,
  redirectToHome,
  redirectToDashboard,
  checkAuthAndRedirect,

  // معالجة الأخطاء
  handleUnauthorizedError,
  createUnauthorizedMessage,
  getUnauthorizedReason,

  // المؤقتات
  createCountdown
} = useUnauthorized()
```

## طرق الاستخدام

### 1. الاستخدام الأساسي

#### في أي صفحة محمية:
```vue
<script setup>
definePageMeta({
  layout: 'unauthorized',
  middleware: ['auth'] // سيوجه تلقائياً عند عدم المصادقة
})
</script>

<template>
  <div>
    <!-- محتوى إضافي مخصص -->
    <p>معلومات إضافية حول عدم التصريح</p>
  </div>
</template>
```

#### للتوجيه المباشر:
```typescript
const { redirectToUnauthorized } = useUnauthorized()

// توجيه مع سبب محدد
await redirectToUnauthorized('insufficient_permissions')
```

### 2. العد التنازلي المخصص

```typescript
const { createCountdown } = useUnauthorized()

const { countdown, stop, reset } = createCountdown(30, () => {
  console.log('انتهى العد!')
  // تنفيذ إجراء معين
})

// إيقاف العد
stop()

// إعادة تعيين العد
reset(60) // 60 ثانية جديدة
```

### 3. معالجة الأخطاء المتقدمة

```typescript
const { handleUnauthorizedError } = useUnauthorized()

try {
  await apiCall()
} catch (error) {
  // معالجة تلقائية للأخطاء 401/403
  await handleUnauthorizedError(error)
}
```

## التكامل مع النظام الموجود

### 1. مع نظام المصادقة

```typescript
// في middleware/auth.ts
if (!authStore.isAuthenticated) {
  return navigateTo('/unauthorized') // بدلاً من /login مباشرة
}
```

### 2. مع معالج الأخطاء

```typescript
// في composables/useApi.ts
if (error?.status === 403) {
  showError(message)
  setTimeout(() => {
    navigateTo('/unauthorized')
  }, 2000)
}
```

### 3. مع Error Boundary

Layout محمي بـ Error Boundary للتعامل مع أي أخطاء غير متوقعة.

## السيناريوهات المدعومة

### 1. عدم تسجيل الدخول (401)
- **الحدث:** المستخدم يحاول الوصول لصفحة محمية
- **الاستجابة:** توجيه لصفحة غير المصرح بها مع عد تنازلي
- **الإجراء:** توجيه تلقائي لصفحة تسجيل الدخول

### 2. نقص الصلاحيات (403)
- **الحدث:** المستخدم مصادق لكن بدون صلاحيات كافية
- **الاستجابة:** عرض رسالة محددة عن نوع الصلاحية المطلوبة
- **الإجراء:** إمكانية العودة أو الذهاب للرئيسية

### 3. انتهاء الجلسة
- **الحدث:** انتهاء صلاحية Token
- **الاستجابة:** مسح بيانات المصادقة وعرض رسالة واضحة
- **الإجراء:** توجيه لتسجيل الدخول مع حفظ المسار المطلوب

### 4. حساب معطل
- **الحدث:** الحساب غير مفعل أو محظور
- **الاستجابة:** رسالة توضيحية مع معلومات الاتصال
- **الإجراء:** توجيه للدعم الفني

## أسباب عدم التصريح المدعومة

```typescript
const reasons = {
  'not_logged_in': 'لم تقم بتسجيل الدخول',
  'session_expired': 'انتهت صلاحية جلستك',
  'insufficient_permissions': 'لا تملك الصلاحيات الكافية',
  'account_deactivated': 'تم إلغاء تفعيل حسابك',
  'invalid_token': 'رمز المصادقة غير صالح'
}
```

## الميزات المتقدمة

### 1. التوجيه الذكي
- حفظ المسار المطلوب للعودة إليه بعد تسجيل الدخول
- توجيه مناسب حسب نوع الخطأ
- منع التوجيه الدائري

### 2. العد التنازلي المرن
- قابل للإيقاف والتحكم
- رسائل تفاعلية للمستخدم
- تنظيف تلقائي للذاكرة

### 3. الرسائل الذكية
- رسائل مخصصة حسب نوع الخطأ
- دعم للمعاملات الديناميكية
- ترجمة كاملة للعربية

### 4. التصميم المتجاوب
- يعمل على جميع أحجام الشاشات
- تحسين للشاشات الصغيرة
- دعم كامل للمس واللمس

## صفحة الاختبار

تم إنشاء صفحة اختبار شاملة (`/test-unauthorized`) لاختبار جميع السيناريوهات:

**الاختبارات المتاحة:**
- محاكاة خطأ 401
- محاكاة خطأ 403  
- اختبار العد التنازلي
- التوجيه المباشر للصفحات
- عرض حالة المصادقة الحالية

## أفضل الممارسات

### 1. استخدام Middleware المناسب
```vue
<script setup>
definePageMeta({
  middleware: ['auth'] // للصفحات المحمية
})
</script>
```

### 2. معالجة الأخطاء المناسبة
```typescript
// استخدام composable بدلاً من التعامل المباشر
const { handleUnauthorizedError } = useUnauthorized()
```

### 3. الرسائل الواضحة
```typescript
// رسائل محددة ومفيدة للمستخدم
const message = createUnauthorizedMessage(error)
```

### 4. التنظيف المناسب
```typescript
// تنظيف المؤقتات عند مغادرة الصفحة
onBeforeUnmount(() => {
  stop()
})
```

## الملفات المعدلة والجديدة

### الملفات الجديدة:
- `layouts/unauthorized.vue` - Layout مخصص
- `pages/unauthorized.vue` - الصفحة الرئيسية
- `composables/useUnauthorized.ts` - Composable متخصص  
- `pages/test-unauthorized.vue` - صفحة اختبار

### الملفات المعدلة:
- `middleware/auth.ts` - توجيه للصفحة الجديدة
- `composables/useApi.ts` - تكامل مع معالج الأخطاء
- `i18n/locales/ar.json` - إضافة ترجمات

## التوافق والأمان

- ✅ متوافق مع Vue 3 و Nuxt 3
- ✅ يعمل مع Vuetify 3
- ✅ دعم TypeScript كامل
- ✅ أمان من XSS و CSRF
- ✅ تنظيف تلقائي للذاكرة
- ✅ معالجة أخطاء شاملة

هذا النظام يوفر تجربة مستخدم احترافية ومتكاملة للتعامل مع جميع حالات عدم التصريح في التطبيق.