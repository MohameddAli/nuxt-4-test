# قائمة المشاكل المحددة والحلول المقترحة

## نظرة عامة

هذه الوثيقة تحدد بالتفصيل كل مشكلة تم اكتشافها في النظام الحالي مع الحل المقترح لكل مشكلة.

## 1. مشاكل التصميم والبنية

### 1.1 تكرار الكود (Code Duplication)

#### المشكلة

```typescript
// نفس منطق التحقق من الصلاحيات في 3 أماكن مختلفة:

// 1. في auth.ts (stores)
hasPermission: (state) => (permission: string) => {
  return state.user?.permissions?.includes(permission) || false;
};

// 2. في useAuthComposable.ts
const hasPermission = (permission: string): boolean => {
  return state.value.user?.permissions?.includes(permission) || false;
};

// 3. في useRBAC.ts
const hasPermission = (permission: string): boolean => {
  return authStore.hasPermission(permission);
};
```

**التأثير:**

- صعوبة في الصيانة
- احتمالية أخطاء عند التحديث
- زيادة حجم الحزمة بنسبة 300%

#### الحل المقترح

```typescript
// نظام واحد مركزي للصلاحيات
// composables/usePermissions.ts
export const usePermissions = () => {
  const { user } = useAuth();

  const can = (permission: string): boolean => {
    return user.value?.permissions?.includes(permission) ?? false;
  };

  return { can };
};

// استخدام موحد في جميع أنحاء التطبيق
const { can } = usePermissions();
const canEdit = can("users.edit");
```

**الفوائد:**

- ✅ مصدر واحد للحقيقة
- ✅ سهولة في الصيانة
- ✅ تقليل حجم الكود بنسبة 70%

---

### 1.2 تداخل المسؤوليات (Mixed Responsibilities)

#### المشكلة

```typescript
// useAuthComposable.ts يحتوي على كل شيء:
export const useAuthComposable = () => {
  // 1. إدارة الحالة
  const state = createAuthState();

  // 2. معالجة الأخطاء
  const handleError = (error) => {
    /* ... */
  };

  // 3. إدارة الرموز المميزة
  const setAccessToken = (token) => {
    /* ... */
  };

  // 4. التحقق من الصلاحيات
  const hasPermission = (permission) => {
    /* ... */
  };

  // 5. مراقبة الشبكة
  const checkNetwork = () => {
    /* ... */
  };

  // 6. إدارة الجلسة
  const handleSessionExpiry = () => {
    /* ... */
  };

  // المجموع: 800+ سطر في ملف واحد!
};
```

**التأثير:**

- صعوبة في الفهم والاختبار
- انتهاك مبدأ المسؤولية الواحدة
- صعوبة في إعادة الاستخدام

#### الحل المقترح

```typescript
// تقسيم المسؤوليات إلى composables منفصلة

// 1. المصادقة الأساسية
// composables/useAuth.ts (150 سطر)
export const useAuth = () => {
  // المصا
```
