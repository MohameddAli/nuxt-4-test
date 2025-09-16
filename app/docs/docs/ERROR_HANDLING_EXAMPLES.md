# دليل معالجة الأخطاء المتقدم - Error Handling Guide

## نظرة عامة

تم تطوير نظام شامل لمعالجة الأخطاء يدعم جميع أنواع استجابات السيرفر المختلفة.

## أنواع استجابات السيرفر المدعومة

### 1. الرسائل البسيطة
```json
{
  "message": "اسم المستخدم أو كلمة المرور غير صحيحة"
}
```

### 2. الرسائل المعقدة (كائنات متداخلة)
```json
{
  "message": {
    "user": "اسم المستخدم مطلوب",
    "password": "كلمة المرور قصيرة جداً"
  }
}
```

### 3. رسائل التحقق (Validation Errors)
```json
{
  "message": "فشل في التحقق من البيانات",
  "validation": {
    "email": "البريد الإلكتروني غير صحيح",
    "phone": "رقم الهاتف مطلوب"
  }
}
```

### 4. مصفوفات الأخطاء
```json
{
  "message": "أخطاء متعددة",
  "errors": [
    "الحقل الأول مطلوب",
    "الحقل الثاني غير صحيح"
  ]
}
```

## أمثلة الاستخدام

### 1. الاستخدام البسيط
```typescript
import { extractErrorMessage } from '~/utils/errorHandler'

try {
  await apiCall()
} catch (error) {
  const message = extractErrorMessage(error)
  showError(message)
}
```

### 2. مع خيارات متقدمة
```typescript
const message = extractErrorMessage(error, {
  fallbackMessage: 'فشل في حفظ البيانات',
  includeDetails: true,
  maxDetails: 3,
  separator: ' • '
})
```

### 3. مع السياق
```typescript
const { message, canRetry } = createContextualErrorMessage(error, 'حفظ الملف الشخصي', {
  includeDetails: true
})

if (canRetry) {
  // عرض زر إعادة المحاولة
}
```

### 4. في useSnackbar
```typescript
// عرض بسيط
showFromError(error)

// مع خيارات
showFromError(error, {
  context: 'تسجيل الدخول',
  includeDetails: false,
  fallbackMessage: 'فشل في تسجيل الدخول'
})

// مع رسالة مخصصة
showFromError(error, {
  customMessage: 'حدث خطأ في النظام'
})
```

## أمثلة لحالات مختلفة

### حالة تسجيل الدخول
```typescript
// في login.vue
try {
  await authStore.login(username, password)
} catch (error) {
  showFromError(error, {
    context: 'تسجيل الدخول',
    fallbackMessage: 'فشل في تسجيل الدخول'
  })
}
```

### حالة حفظ ملف شخصي
```typescript
// في profile.vue
try {
  await updateProfile(profileData)
} catch (error) {
  showFromError(error, {
    context: 'تحديث الملف الشخصي',
    includeDetails: true, // عرض تفاصيل أخطاء التحقق
    fallbackMessage: 'فشل في حفظ البيانات'
  })
}
```

### حالة رفع ملف
```typescript
// في file-upload.vue
try {
  await uploadFile(file)
} catch (error) {
  const { message, canRetry } = createContextualErrorMessage(error, 'رفع الملف')
  
  if (canRetry) {
    showFromError(error, {
      context: 'رفع الملف'
    })
    // إضافة زر إعادة المحاولة
  } else {
    showError(message)
  }
}
```

## أفضل الممارسات

### 1. اختيار الخيارات المناسبة
- **تسجيل الدخول**: `includeDetails: false` (للأمان)
- **نماذج البيانات**: `includeDetails: true` (لإظهار أخطاء التحقق)
- **عمليات الملفات**: مع `canRetry` للعمليات القابلة للإعادة

### 2. استخدام السياق
```typescript
// بدلاً من رسالة عامة
showFromError(error)

// استخدم السياق للوضوح
showFromError(error, { context: 'حفظ البيانات' })
```

### 3. الرسائل الاحتياطية المناسبة
```typescript
showFromError(error, {
  fallbackMessage: 'رسالة واضحة ومفيدة للمستخدم'
})
```

### 4. التعامل مع الأخطاء القابلة للإعادة
```typescript
const { message, canRetry, type } = createContextualErrorMessage(error, 'العملية')

if (type === 'network' && canRetry) {
  // إضافة زر إعادة المحاولة
}
```

## أنواع الأخطاء المدعومة

1. **validation** (400): أخطاء التحقق من البيانات
2. **authentication** (401): أخطاء المصادقة
3. **authorization** (403): أخطاء الصلاحيات
4. **server** (500+): أخطاء الخادم
5. **network**: أخطاء الشبكة
6. **unknown**: أخطاء غير معروفة

## مثال شامل

```typescript
// في أي component
const handleSubmit = async () => {
  try {
    await submitForm(formData)
    showSuccess('تم الحفظ بنجاح')
  } catch (error) {
    const { message, canRetry, type } = createContextualErrorMessage(
      error, 
      'حفظ النموذج',
      {
        includeDetails: true,
        maxDetails: 3
      }
    )
    
    if (type === 'validation') {
      // أخطاء التحقق - عرض التفاصيل
      showFromError(error, {
        context: 'حفظ النموذج',
        includeDetails: true
      })
    } else if (canRetry) {
      // أخطاء قابلة للإعادة
      showFromError(error, {
        context: 'حفظ النموذج'
      })
    } else {
      // أخطاء غير قابلة للإعادة
      showError(message)
    }
  }
}
```

هذا النظام يوفر مرونة كاملة في التعامل مع جميع أنواع الأخطاء مع الحفاظ على تجربة مستخدم ممتازة.