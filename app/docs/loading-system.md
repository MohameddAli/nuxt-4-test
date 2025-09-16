# نظام التحميل العام - Global Loading System

## نظرة عامة

نظام التحميل العام هو نظام موحد وفعال لإدارة جميع حالات التحميل في التطبيق. يتميز بالبساطة والأداء العالي وعدم وجود تداخل أو تكرار.

## الميزات الرئيسية

### ✨ الميزات

- **مكون واحد فقط**: `LoadingOverlay` واحد في كل التطبيق
- **إدارة أولوية**: العمليات ذات الأولوية العالية تظهر أولاً
- **تنظيف تلقائي**: إزالة العمليات القديمة تلقائياً
- **أداء محسن**: بدون تكرار أو تداخل
- **تصميم حديث**: spinner احترافي مع تأثيرات متقدمة
- **دعم RTL**: يعمل مع اللغة العربية بشكل مثالي

### 🔧 المكونات الأساسية

#### 1. المتجر (Store) - `stores/loading.ts`

```typescript
interface LoadingOperation {
  id: string;
  text: string;
  type: "navigation" | "api" | "manual";
  priority: number;
  timestamp: number;
}
```

#### 2. المكون (Component) - `components/ui/LoadingOverlay.vue`

- Teleport إلى body لضمان العرض الصحيح
- انيميشن smooth وحديث
- دعم تأثيرات blur و backdrop
- تصميم responsive

#### 3. الـ Composable - `composables/useLoading.ts`

```typescript
const { startLoading, stopLoading, withLoading } = useLoading();
```

#### 4. الـ Plugin - `plugins/loading.client.ts`

- إدارة تحميل التنقل تلقائياً
- hooks للـ router و Nuxt
- تنظيف تلقائي عند الأخطاء

## طريقة الاستخدام

### 1. التحميل البسيط

```typescript
const loading = useLoading();

// بدء التحميل
const control = loading.startLoading({
  text: "جاري التحميل...",
  type: "manual",
});

// إيقاف التحميل
control.stop();
```

### 2. التحميل مع العمليات غير المتزامنة

```typescript
const result = await loading.withLoading(
  async () => {
    return await $fetch("/api/data");
  },
  {
    text: "جاري تحميل البيانات...",
    type: "api",
  }
);
```

### 3. التحميل التلقائي للمكونات

```typescript
const { startLoading, activeLoadingsCount } = useAutoLoading({
  type: "manual",
  text: "تحميل افتراضي...",
});

// سيتم إيقاف التحميل تلقائياً عند unmount
```

### 4. التحميل لاستدعاءات API

```typescript
const apiId = loading.startApiLoading("جاري تحميل المستخدمين...");
try {
  const users = await $fetch("/api/users");
} finally {
  loading.stopApiLoading(apiId);
}
```

### 5. تخصيص لون الـ Spinner

```typescript
loading.setSpinnerColor("success"); // أو primary، secondary، etc.
```

## أولوية العمليات

النظام يدير أولوية العمليات تلقائياً:

| النوع        | الأولوية | الوصف                        |
| ------------ | -------- | ---------------------------- |
| `navigation` | 100      | تحميل التنقل (الأعلى أولوية) |
| `api`        | 50       | استدعاءات API                |
| `manual`     | 25       | التحميل اليدوي               |

## التكامل مع Router

التحميل أثناء التنقل يتم **تلقائياً**:

```typescript
// تلقائي - لا حاجة لكود إضافي
router.push("/dashboard"); // سيظهر "Loading dashboard..."
router.push("/users"); // سيظهر "Loading users..."
```

## الأخطاء الشائعة وحلولها

### ❌ خطأ: استخدام أكثر من LoadingOverlay

```vue
<!-- خطأ -->
<template>
  <div>
    <LoadingOverlay :loading="someCondition" />
    <LoadingOverlay :loading="anotherCondition" />
  </div>
</template>
```

### ✅ الحل الصحيح

```typescript
// استخدم النظام العام
const loading = useLoading();
loading.startLoading({ text: "Custom loading..." });
```

### ❌ خطأ: عدم إيقاف التحميل

```typescript
// خطأ - قد يبقى التحميل مستمراً
loading.startLoading();
// نسيان استدعاء stop()
```

### ✅ الحل الصحيح

```typescript
const control = loading.startLoading();
try {
  await someOperation();
} finally {
  control.stop(); // ضروري دائماً
}

// أو استخدم withLoading
await loading.withLoading(someOperation);
```

## التحسينات والأداء

### 1. تنظيف تلقائي

```typescript
// يتم تلقائياً كل 10 ثوان
loadingStore.cleanupOldOperations();
```

### 2. منع التحميل المفرط

```typescript
// الحد الأدنى لمدة التحميل
const MIN_LOADING_TIME = 300; // ms
```

### 3. معالجة الأخطاء

```typescript
// تنظيف تلقائي عند الأخطاء
nuxtApp.hook("app:error", () => {
  loadingStore.clearAllLoading();
});
```

## اختبار النظام

### 1. اختبار أساسي

```typescript
// في أي صفحة أو مكون
const loading = useLoading();

// اختبار لمدة 3 ثوان
loading.showLoadingFor(3000, {
  text: "اختبار النظام...",
});
```

### 2. اختبار API

```typescript
await loading.withLoading(
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("اكتمل!");
  },
  {
    text: "جاري الاختبار...",
    type: "api",
  }
);
```

## الميزات المتقدمة

### 1. مراقبة العمليات النشطة

```typescript
const loading = useLoading();

watch(
  () => loading.operationsCount.value,
  (count) => {
    console.log(`عدد عمليات التحميل النشطة: ${count}`);
  }
);
```

### 2. تحديث النص أثناء التحميل

```typescript
const control = loading.startLoading({ text: "بدء العملية..." });

setTimeout(() => {
  control.updateText("معالجة البيانات...");
}, 1000);

setTimeout(() => {
  control.updateText("اكمال العملية...");
}, 2000);
```

## الخلاصة

نظام التحميل الجديد يوفر:

- **🚀 أداء أفضل**: بدون تكرار أو تداخل
- **🎯 سهولة الاستخدام**: API بسيط وواضح
- **🔧 مرونة عالية**: قابل للتخصيص بالكامل
- **🌐 دعم شامل**: يعمل مع جميع أجزاء التطبيق
- **♿ إمكانية وصول**: يدعم تقنيات المساعدة

استخدم هذا النظام لجميع احتياجات التحميل في التطبيق وستحصل على تجربة مستخدم متسقة ومحسنة.
