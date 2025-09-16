# نظام عرض أسماء الصفحات أثناء التنقل - Page Name Display During Navigation

## نظرة عامة - Overview

تم تطوير نظام التحميل ليعرض أسماء الصفحات المترجمة أثناء التنقل في كلا من اللغة العربية والإنجليزية. هذا النظام يوفر تجربة مستخدم محسنة من خلال إظهار وجهة التنقل بوضوح.

The loading system has been enhanced to display translated page names during navigation in both Arabic and English languages. This provides an improved user experience by clearly showing the navigation destination.

## الميزات الجديدة - New Features

### 1. ترجمة أسماء الصفحات - Page Name Translation

يتم عرض أسماء الصفحات بناءً على اللغة الحالية للتطبيق:

**العربية:**
- `/` → "جاري الانتقال إلى الصفحة الرئيسية..."
- `/analytics` → "جاري الانتقال إلى التحليلات..."
- `/cards` → "جاري الانتقال إلى البطاقات..."

**English:**
- `/` → "Navigating to Home Page..."
- `/analytics` → "Navigating to Analytics..."
- `/cards` → "Navigating to Cards..."

### 2. استخراج ذكي لأسماء الصفحات - Smart Page Name Extraction

النظام يستخرج أسماء الصفحات تلقائياً من المسارات:
- إزالة المعاملات والمراسي من الرابط
- أخذ الجزء الأول من المسار فقط
- البحث عن الترجمة المناسبة
- التراجع للاسم المنسق إذا لم توجد ترجمة

## الملفات المطلوبة - Required Files

### 1. useLoadingText.ts - كومبوزابل إدارة النصوص
```typescript
// موقع الملف - File location
c:\projects\nuxt\nuxt4\app\composables\useLoadingText.ts
```

**الوظائف الرئيسية:**
- `getPageName(path: string)` - استخراج اسم الصفحة المترجم
- `getNavigationText(path: string)` - إنشاء نص التنقل الكامل
- `getPageLoadingText(path: string)` - نص تحميل الصفحة العام
- `hasCustomTranslation(path: string)` - فحص وجود ترجمة مخصصة

### 2. loading.client.ts - البلاجين المحدث
```typescript
// موقع الملف - File location
c:\projects\nuxt\nuxt4\app\plugins\loading.client.ts
```

**التحديثات:**
- استيراد `useLoadingText` كومبوزابل
- استخدام `getNavigationText()` لإنشاء رسائل التحميل
- عرض أسماء الصفحات المترجمة أثناء التنقل

### 3. ملفات الترجمة - Translation Files

**ar.json:**
```json
{
  "loading": {
    "navigating": "جاري الانتقال إلى {page}...",
    "loadingPage": "جاري تحميل {page}...",
    "pageNames": {
      "home": "الصفحة الرئيسية",
      "analytics": "التحليلات",
      "cards": "البطاقات",
      // ... المزيد
    }
  }
}
```

**en.json:**
```json
{
  "loading": {
    "navigating": "Navigating to {page}...",
    "loadingPage": "Loading {page}...",
    "pageNames": {
      "home": "Home Page",
      "analytics": "Analytics",
      "cards": "Cards",
      // ... more
    }
  }
}
```

## كيفية الاستخدام - How to Use

### 1. التنقل التلقائي - Automatic Navigation

النظام يعمل تلقائياً عند التنقل بين الصفحات:

```vue
<template>
  <!-- أي رابط للتنقل -->
  <router-link to="/analytics">الذهاب للتحليلات</router-link>
  <nuxt-link to="/cards">عرض البطاقات</nuxt-link>
</template>
```

### 2. الاستخدام البرمجي - Programmatic Usage

```vue
<script setup>
import { useLoadingText } from '~/composables/useLoadingText';

const { getNavigationText, getPageName } = useLoadingText();

// الحصول على اسم صفحة مترجم
const pageName = getPageName('/analytics'); // "التحليلات" أو "Analytics"

// الحصول على نص تنقل كامل
const navigationText = getNavigationText('/analytics'); // "جاري الانتقال إلى التحليلات..."

// استخدام في التحميل اليدوي
const loading = useLoading();
const control = loading.startLoading({
  text: navigationText,
  type: 'navigation'
});
</script>
```

### 3. إضافة صفحات جديدة - Adding New Pages

لإضافة ترجمة لصفحة جديدة:

1. **أضف المفتاح في ar.json:**
```json
{
  "loading": {
    "pageNames": {
      "new-page": "الصفحة الجديدة"
    }
  }
}
```

2. **أضف المفتاح في en.json:**
```json
{
  "loading": {
    "pageNames": {
      "new-page": "New Page"
    }
  }
}
```

3. **النظام سيتعرف تلقائياً على الترجمة:**
```javascript
// عند التنقل إلى /new-page
// العربية: "جاري الانتقال إلى الصفحة الجديدة..."
// الإنجليزية: "Navigating to New Page..."
```

## اختبار النظام - Testing the System

### 1. صفحة الاختبار - Test Page

تم إنشاء صفحة اختبار خاصة:
```
/translation-test
```

هذه الصفحة تتيح:
- عرض أسماء جميع الصفحات المترجمة
- تبديل اللغة ومشاهدة التغييرات
- اختبار التحميل مع أسماء الصفحات
- التنقل المباشر للصفحات المختلفة

### 2. اختبار يدوي - Manual Testing

```vue
<script setup>
// اختبر الترجمات المختلفة
const testPaths = ['/', '/analytics', '/cards', '/custom-page'];

testPaths.forEach(path => {
  console.log(`${path}: ${getPageName(path)}`);
});

// اختبار تغيير اللغة
await setLocale('ar');
console.log(getNavigationText('/analytics')); // "جاري الانتقال إلى التحليلات..."

await setLocale('en');
console.log(getNavigationText('/analytics')); // "Navigating to Analytics..."
</script>
```

## المسارات المدعومة - Supported Routes

النظام يدعم جميع المسارات التالية مع ترجمات كاملة:

| المسار | العربية | English |
|--------|----------|---------|
| `/` | الصفحة الرئيسية | Home Page |
| `/overview` | نظرة عامة | Overview |
| `/analytics` | التحليلات | Analytics |
| `/chat` | المحادثة | Chat |
| `/cards` | البطاقات | Cards |
| `/customers` | العملاء | Customers |
| `/movies` | الأفلام | Movies |
| `/support` | الدعم | Support |
| `/settings` | الإعدادات | Settings |
| `/profile` | الملف الشخصي | Profile |
| `/users` | المستخدمون | Users |
| `/reports` | التقارير | Reports |
| `/transactions` | المعاملات | Transactions |
| `/wallets` | المحافظ | Wallets |
| `/help` | المساعدة | Help |
| `/loading-test` | اختبار التحميل | Loading Test |
| `/translation-test` | اختبار الترجمة | Translation Test |

## الأداء والتحسين - Performance & Optimization

### 1. كاش الترجمات
النظام يستخدم نظام i18n المدمج في Nuxt للحصول على أداء محسن للترجمات.

### 2. استخراج ذكي
- معالجة سريعة للمسارات المعقدة
- إزالة المعاملات والمراسي تلقائياً
- التراجع الآمن للأسماء غير المترجمة

### 3. ذاكرة مُحسنة
- لا يتم تخزين ترجمات غير ضرورية
- استخدام composables reactive للتحديث التلقائي

## استكشاف الأخطاء - Troubleshooting

### مشكلة: لا يظهر اسم الصفحة مترجماً

**الحل:**
1. تأكد من وجود المفتاح في ملفات الترجمة
2. تحقق من صحة اسم المسار
3. تأكد من تفعيل i18n في التطبيق

### مشكلة: يظهر اسم المسار بدلاً من الترجمة

**الحل:**
1. أضف الترجمة في كلا الملفين (ar.json, en.json)
2. تأكد من صحة بناء JSON
3. أعد تشغيل الخادم بعد إضافة ترجمات جديدة

### مشكلة: لا يتغير النص عند تبديل اللغة

**الحل:**
1. تأكد من استخدام composable reactive
2. تحقق من تحديث locale في i18n
3. استخدم `watch` لمراقبة تغييرات اللغة

## خلاصة - Conclusion

النظام الجديد يوفر:
- ✅ عرض أسماء الصفحات المترجمة أثناء التنقل
- ✅ دعم كامل للعربية والإنجليزية
- ✅ استخراج ذكي للمسارات المعقدة
- ✅ سهولة إضافة صفحات جديدة
- ✅ اختبار شامل للوظائف
- ✅ أداء محسن وذاكرة فعالة

The new system provides:
- ✅ Translated page names during navigation
- ✅ Full Arabic and English support
- ✅ Smart extraction of complex paths
- ✅ Easy addition of new pages
- ✅ Comprehensive testing capabilities
- ✅ Optimized performance and memory usage
