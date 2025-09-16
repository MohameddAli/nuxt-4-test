# 🛡️ Zod + VeeValidate Integration for Nuxt 3

نظام تكامل شامل بين Zod و VeeValidate مع Nuxt 3 لبناء نماذج آمنة ومحمية بطريقة احترافية.

## 🚀 الميزات

- ✅ **Type-safe validation** مع TypeScript
- ✅ **تكامل سلس** مع VeeValidate
- ✅ **رسائل خطأ مخصصة** باللغة العربية والإنجليزية
- ✅ **Validators جاهزة** للاستخدام المباشر
- ✅ **Schemas معرفة مسبقاً** للنماذج الشائعة
- ✅ **Performance optimized** مع caching
- ✅ **Server-side validation** للأمان الإضافي
- ✅ **شامل ومرن** لجميع أنواع النماذج

## 📁 بنية الملفات

```
├── composables/
│   └── useZod.ts              # النظام الأساسي
├── plugins/
│   └── zod.global.ts          # Global setup
├── pages/
│   ├── login.vue              # مثال: تسجيل دخول
│   └── register.vue           # مثال: تسجيل جديد
├── components/
│   └── DynamicForm.vue        # مثال: نموذج ديناميكي
└── docs/
    ├── zod-integration.md     # الدليل الشامل
    └── zod-examples.md        # أمثلة عملية
```

## ⚡ الاستخدام السريع

### 1. تسجيل دخول بسيط

```vue
<template>
  <VeeForm @submit="handleLogin" :validation-schema="schema">
    <VeeField name="username" v-slot="{ field, errors }">
      <v-text-field v-bind="field" :error-messages="errors" label="اسم المستخدم" />
    </VeeField>
    <VeeField name="password" v-slot="{ field, errors }">
      <v-text-field v-bind="field" :error-messages="errors" label="كلمة المرور" type="password" />
    </VeeField>
    <v-btn type="submit">تسجيل الدخول</v-btn>
  </VeeForm>
</template>

<script setup>
import { useLoginSchema } from '@/composables/useZod'

const schema = useLoginSchema()
const handleLogin = (values) => {
  console.log('تم التحقق من البيانات:', values)
}
</script>
```

### 2. نموذج مخصص

```vue
<script setup>
import { useCustomSchema, useZodEmail, useZodRequiredString } from '@/composables/useZod'

const schema = useCustomSchema({
  name: useZodRequiredString('الاسم مطلوب'),
  email: useZodEmail('البريد الإلكتروني غير صحيح'),
  age: useZodNumber({ min: 18, max: 100 })
})
</script>
```

## 🔧 Validators المتاحة

### أساسية
- `useZodRequiredString()` - نص مطلوب
- `useZodEmail()` - بريد إلكتروني
- `useZodPassword()` - كلمة مرور (مع خيارات متقدمة)
- `useZodPhoneNumber()` - رقم هاتف
- `useZodNumber()` - رقم (مع خيارات)
- `useZodDate()` - تاريخ
- `useZodUrl()` - رابط
- `useZodFile()` - ملف (مع قيود حجم ونوع)

### Schemas جاهزة
- `useLoginSchema()` - تسجيل دخول
- `useRegisterSchema()` - تسجيل جديد
- `useProfileSchema()` - ملف شخصي
- `useContactSchema()` - نموذج اتصال
- `usePasswordChangeSchema()` - تغيير كلمة المرور

### متقدمة
- `useCustomSchema()` - إنشاء schema مخصص
- `useArraySchema()` - للنماذج الديناميكية
- `useValidateData()` - التحقق المباشر من البيانات

## 💡 أمثلة سريعة

### كلمة مرور قوية
```javascript
const strongPassword = useZodPassword({
  min: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
})
```

### رقم مع قيود
```javascript
const price = useZodNumber({
  min: 0,
  max: 10000,
  positive: true,
  message: 'السعر يجب أن يكون بين 0 و 10000'
})
```

### ملف صورة
```javascript
const avatar = useZodFile({
  maxSize: 2 * 1024 * 1024, // 2MB
  allowedTypes: ['image/jpeg', 'image/png'],
  message: 'الملف يجب أن يكون صورة أقل من 2MB'
})
```

## 🔒 الأمان

### Client + Server Validation
```typescript
// Client-side (pages/contact.vue)
const schema = useContactSchema()

// Server-side (server/api/contact.post.ts)
import { z } from 'zod'
const serverSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(10)
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validation = serverSchema.safeParse(body)
  
  if (!validation.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid data' })
  }
  
  // البيانات آمنة للاستخدام
  const { name, email, message } = validation.data
})
```

## 📚 التوثيق

- **[الدليل الشامل](docs/zod-integration.md)** - كل شيء عن النظام
- **[أمثلة عملية](docs/zod-examples.md)** - حالات استخدام متنوعة

## 🎯 المميزات الخاصة

### 1. Type Safety
جميع النماذج محمية بـ TypeScript مع type inference تلقائي.

### 2. Performance
- Schema caching تلقائي
- Lazy validation
- Optimized re-renders

### 3. Developer Experience
- IntelliSense كامل
- رسائل خطأ واضحة
- Hot reload سريع

### 4. Production Ready
- Server-side validation
- Data sanitization
- Error handling شامل

## 🔄 التحديثات

### إضافة validator جديد
```typescript
// في composables/useZod.ts
export const useZodCustomField = (options?: CustomOptions) => {
  const zod = useZod()
  return zod.string().transform(/* logic */)
}
```

### إضافة schema جديد
```typescript
export const useMyCustomSchema = () => {
  const zod = useZod()
  const schema = zod.object({
    // تعريف الحقول
  })
  return useZodSchema(schema)
}
```

## 🛠️ التطوير

### اختبار Validators
```bash
npm run test
```

### بناء المشروع
```bash
npm run build
```

---

**💡 نصيحة**: ابدأ بالـ schemas الجاهزة واستخدم المخصصة عند الحاجة لمرونة إضافية.

**🔗 روابط مفيدة**:
- [Zod Documentation](https://zod.dev/)
- [VeeValidate v4](https://vee-validate.logaretm.com/v4/)
- [Nuxt 3 Docs](https://nuxt.com/docs) 