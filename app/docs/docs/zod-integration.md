# دليل تكامل Zod مع VeeValidate في Nuxt 3

## المقدمة

هذا الدليل يوضح كيفية استخدام مكتبة Zod مع VeeValidate في مشروع Nuxt 3 بطريقة احترافية وآمنة. تم تصميم هذا النظام ليكون شاملاً ومرناً وقابلاً لإعادة الاستخدام.

## 🏗️ بنية النظام

### 1. الملفات الأساسية

```
├── plugins/
│   └── zod.global.ts          # تهيئة Zod كـ global plugin
├── composables/
│   └── useZod.ts              # جميع دوال Zod والتحقق
└── docs/
    └── zod-integration.md     # هذا الملف
```

### 2. التبعيات المطلوبة

```bash
npm install zod @vee-validate/zod vee-validate
```

## 🚀 الإعداد الأولي

### 1. إعداد Plugin

```typescript
// plugins/zod.global.ts
import { z } from 'zod'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('z', z)
})
```

### 2. إعداد Nuxt Config

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // ... باقي الإعدادات
})
```

## 📋 الدوال المتاحة

### دوال التحقق الأساسية

#### 1. `useZodRequiredString(message?)`
```typescript
// استخدام بسيط
const username = useZodRequiredString()

// مع رسالة مخصصة
const title = useZodRequiredString('العنوان مطلوب')
```

#### 2. `useZodEmail(message?)`
```typescript
const email = useZodEmail()
// أو
const email = useZodEmail('عنوان البريد الإلكتروني غير صحيح')
```

#### 3. `useZodPassword(options?)`
```typescript
// كلمة مرور بسيطة
const simplePassword = useZodPassword()

// كلمة مرور معقدة
const strongPassword = useZodPassword({
    min: 8,
    max: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    message: 'كلمة المرور يجب أن تحتوي على حروف كبيرة وصغيرة وأرقام ورموز خاصة'
})
```

#### 4. `useZodPhoneNumber(message?)`
```typescript
const phoneNumber = useZodPhoneNumber('رقم الهاتف غير صحيح')
```

#### 5. `useZodNumber(options?)`
```typescript
// رقم بسيط
const age = useZodNumber()

// رقم بشروط
const price = useZodNumber({
    min: 0,
    max: 10000,
    positive: true,
    message: 'السعر يجب أن يكون رقم موجب'
})
```

#### 6. `useZodFile(options?)`
```typescript
// ملف بسيط
const document = useZodFile()

// ملف بشروط
const avatar = useZodFile({
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    message: 'يجب أن يكون الملف صورة (JPEG, PNG, WebP) وأقل من 2MB'
})
```

### Schemas جاهزة للاستخدام

#### 1. `useLoginSchema()`
```vue
<script setup>
import { useLoginSchema } from '@/composables/useZod'

const schema = useLoginSchema()
</script>
```

#### 2. `useRegisterSchema()`
```vue
<script setup>
import { useRegisterSchema } from '@/composables/useZod'

const schema = useRegisterSchema()
</script>
```

#### 3. `useProfileSchema()`
```vue
<script setup>
import { useProfileSchema } from '@/composables/useZod'

const schema = useProfileSchema()
</script>
```

#### 4. `usePasswordChangeSchema()`
```vue
<script setup>
import { usePasswordChangeSchema } from '@/composables/useZod'

const schema = usePasswordChangeSchema()
</script>
```

### دوال مساعدة متقدمة

#### 1. `useCustomSchema(schemaObject)`
```typescript
// إنشاء schema مخصص
const customSchema = useCustomSchema({
    productName: useZodRequiredString('اسم المنتج مطلوب'),
    price: useZodNumber({ min: 0, positive: true }),
    category: useZodRequiredString('الفئة مطلوبة'),
    description: useZodRequiredString().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل')
})
```

#### 2. `useArraySchema(itemSchema)`
```typescript
// للنماذج الديناميكية
const itemSchema = useCustomSchema({
    name: useZodRequiredString(),
    quantity: useZodNumber({ min: 1, int: true })
})

const orderItemsSchema = useArraySchema(itemSchema)
```

## 💡 أمثلة عملية

### 1. صفحة تسجيل الدخول

```vue
<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>تسجيل الدخول</v-card-title>
          <v-card-text>
            <VeeForm @submit="handleLogin" :validation-schema="schema" v-slot="{ errors, meta }">
              <VeeField name="username" v-slot="{ field, errors: fieldErrors, meta: fieldMeta }">
                <v-text-field
                  v-bind="field"
                  :error-messages="(submitCount > 0 || fieldMeta.touched) ? fieldErrors : []"
                  label="اسم المستخدم"
                  variant="outlined"
                  class="mb-4"
                  :disabled="loading"
                />
              </VeeField>

              <VeeField name="password" v-slot="{ field, errors: fieldErrors, meta: fieldMeta }">
                <v-text-field
                  v-bind="field"
                  :error-messages="(submitCount > 0 || fieldMeta.touched) ? fieldErrors : []"
                  label="كلمة المرور"
                  type="password"
                  variant="outlined"
                  class="mb-4"
                  :disabled="loading"
                />
              </VeeField>

              <v-btn
                type="submit"
                block
                color="primary"
                :loading="loading"
                :disabled="!meta.valid"
              >
                تسجيل الدخول
              </v-btn>
            </VeeForm>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { Form as VeeForm, Field as VeeField } from 'vee-validate'
import { useLoginSchema } from '@/composables/useZod'

const loading = ref(false)
const submitCount = ref(0)
const schema = useLoginSchema()

const handleLogin = async (values) => {
  try {
    submitCount.value++
    loading.value = true
    
    // منطق تسجيل الدخول هنا
    console.log('Login data:', values)
    
  } catch (error) {
    console.error('Login failed:', error)
  } finally {
    loading.value = false
  }
}
</script>
```

### 2. نموذج تسجيل مستخدم جديد

```vue
<template>
  <VeeForm @submit="handleRegister" :validation-schema="schema" v-slot="{ errors, meta }">
    <v-row>
      <v-col cols="12" md="6">
        <VeeField name="firstName" v-slot="{ field, errors: fieldErrors }">
          <v-text-field
            v-bind="field"
            :error-messages="fieldErrors"
            label="الاسم الأول"
            variant="outlined"
          />
        </VeeField>
      </v-col>
      
      <v-col cols="12" md="6">
        <VeeField name="lastName" v-slot="{ field, errors: fieldErrors }">
          <v-text-field
            v-bind="field"
            :error-messages="fieldErrors"
            label="الاسم الأخير"
            variant="outlined"
          />
        </VeeField>
      </v-col>
      
      <v-col cols="12">
        <VeeField name="email" v-slot="{ field, errors: fieldErrors }">
          <v-text-field
            v-bind="field"
            :error-messages="fieldErrors"
            label="البريد الإلكتروني"
            type="email"
            variant="outlined"
          />
        </VeeField>
      </v-col>
      
      <v-col cols="12">
        <VeeField name="username" v-slot="{ field, errors: fieldErrors }">
          <v-text-field
            v-bind="field"
            :error-messages="fieldErrors"
            label="اسم المستخدم"
            variant="outlined"
          />
        </VeeField>
      </v-col>
      
      <v-col cols="12">
        <VeeField name="password" v-slot="{ field, errors: fieldErrors }">
          <v-text-field
            v-bind="field"
            :error-messages="fieldErrors"
            label="كلمة المرور"
            type="password"
            variant="outlined"
          />
        </VeeField>
      </v-col>
      
      <v-col cols="12">
        <VeeField name="confirmPassword" v-slot="{ field, errors: fieldErrors }">
          <v-text-field
            v-bind="field"
            :error-messages="fieldErrors"
            label="تأكيد كلمة المرور"
            type="password"
            variant="outlined"
          />
        </VeeField>
      </v-col>
      
      <v-col cols="12">
        <v-btn
          type="submit"
          block
          color="primary"
          :disabled="!meta.valid"
        >
          تسجيل حساب جديد
        </v-btn>
      </v-col>
    </v-row>
  </VeeForm>
</template>

<script setup>
import { Form as VeeForm, Field as VeeField } from 'vee-validate'
import { useRegisterSchema } from '@/composables/useZod'

const schema = useRegisterSchema()

const handleRegister = async (values) => {
  console.log('Registration data:', values)
  // منطق التسجيل هنا
}
</script>
```

### 3. نموذج ديناميكي متقدم

```vue
<template>
  <VeeForm @submit="handleSubmit" :validation-schema="dynamicSchema" v-slot="{ errors, meta }">
    <div v-for="(field, index) in formFields" :key="field.name">
      <VeeField :name="field.name" v-slot="{ field: veeField, errors: fieldErrors }">
        <v-text-field
          v-if="field.type === 'text'"
          v-bind="veeField"
          :error-messages="fieldErrors"
          :label="field.label"
          variant="outlined"
          class="mb-4"
        />
        
        <v-text-field
          v-else-if="field.type === 'email'"
          v-bind="veeField"
          :error-messages="fieldErrors"
          :label="field.label"
          type="email"
          variant="outlined"
          class="mb-4"
        />
        
        <v-text-field
          v-else-if="field.type === 'number'"
          v-bind="veeField"
          :error-messages="fieldErrors"
          :label="field.label"
          type="number"
          variant="outlined"
          class="mb-4"
        />
      </VeeField>
    </div>
    
    <v-btn type="submit" color="primary" :disabled="!meta.valid">
      إرسال
    </v-btn>
  </VeeForm>
</template>

<script setup>
import { computed } from 'vue'
import { Form as VeeForm, Field as VeeField } from 'vee-validate'
import { useCustomSchema, useZodRequiredString, useZodEmail, useZodNumber } from '@/composables/useZod'

const formFields = [
  { name: 'name', label: 'الاسم', type: 'text' },
  { name: 'email', label: 'البريد الإلكتروني', type: 'email' },
  { name: 'age', label: 'العمر', type: 'number' }
]

const dynamicSchema = computed(() => {
  const schemaObject = {}
  
  formFields.forEach(field => {
    switch (field.type) {
      case 'text':
        schemaObject[field.name] = useZodRequiredString(`${field.label} مطلوب`)
        break
      case 'email':
        schemaObject[field.name] = useZodEmail()
        break
      case 'number':
        schemaObject[field.name] = useZodNumber({ min: 1, int: true })
        break
    }
  })
  
  return useCustomSchema(schemaObject)
})

const handleSubmit = (values) => {
  console.log('Dynamic form data:', values)
}
</script>
```

## 🛡️ أمان وحماية البيانات

### 1. التحقق من البيانات على الخادم أيضاً

```typescript
// server/api/login.post.ts
import { z } from 'zod'

const loginSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(6)
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // التحقق من البيانات
  const validation = loginSchema.safeParse(body)
  
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid data'
    })
  }
  
  // منطق تسجيل الدخول
  return { success: true }
})
```

### 2. تنظيف البيانات (Data Sanitization)

```typescript
// في composables/useZod.ts
export const useSanitizedString = (message?: string) => {
    const zod = useZod()
    return zod.string()
        .trim() // إزالة المسافات
        .transform(val => val.replace(/[<>]/g, '')) // إزالة HTML tags خطيرة
        .min(1, { message: message ?? 'This field is required' })
}
```

## ⚡ نصائح لتحسين الأداء

### 1. استخدام Lazy Loading للـ Schemas الكبيرة

```typescript
// للنماذج الكبيرة جداً
export const useLargeFormSchema = () => {
    return computed(() => {
        // يتم تحميل Schema فقط عند الحاجة
        const zod = useZod()
        return useZodSchema(zod.object({
            // ... fields كثيرة
        }))
    })
}
```

### 2. Memoization للـ Schemas المتكررة

```typescript
// استخدام computed للـ schemas المعقدة
const memoizedSchema = computed(() => useLoginSchema())
```

## 🧪 اختبار النماذج

### 1. اختبار الـ Composables

```typescript
// tests/composables/useZod.test.ts
import { describe, it, expect } from 'vitest'
import { useZodEmail, useValidateData } from '@/composables/useZod'

describe('useZod', () => {
  it('should validate email correctly', async () => {
    const emailValidator = useZodEmail()
    
    const validResult = await useValidateData(emailValidator, 'test@example.com')
    expect(validResult.success).toBe(true)
    
    const invalidResult = await useValidateData(emailValidator, 'invalid-email')
    expect(invalidResult.success).toBe(false)
  })
})
```

## 🌐 الدعم متعدد اللغات

### 1. رسائل الخطأ متعددة اللغات

```typescript
// composables/useZodI18n.ts
export const useZodI18nString = (key: string) => {
    const { $t } = useNuxtApp()
    return useZodRequiredString($t(key))
}

export const useZodI18nEmail = (key?: string) => {
    const { $t } = useNuxtApp()
    return useZodEmail(key ? $t(key) : undefined)
}
```

### 2. استخدام الرسائل متعددة اللغات

```vue
<script setup>
// استخدام رسائل متعددة اللغات
const schema = useCustomSchema({
    email: useZodI18nEmail('validation.invalidEmail'),
    password: useZodI18nString('validation.passwordRequired')
})
</script>
```

## 📝 خلاصة أفضل الممارسات

### ✅ افعل

1. **استخدم الـ Composables الجاهزة** بدلاً من إنشاء validators جديدة
2. **اجمع الـ fields المترابطة** في schema واحد
3. **استخدم التحقق على الخادم أيضاً** للأمان
4. **اختبر جميع الـ schemas** بانتظام
5. **استخدم رسائل خطأ واضحة ومفيدة**

### ❌ لا تفعل

1. **لا تكرر نفس الـ validation logic** في أماكن متعددة
2. **لا تتجاهل التحقق من البيانات على الخادم**
3. **لا تستخدم regex معقدة** بدون تفسير
4. **لا تهمل اختبار حالات الخطأ**
5. **لا تضع جميع الـ validations في مكان واحد**

## 🔗 مراجع مفيدة

- [Zod Documentation](https://zod.dev/)
- [VeeValidate Documentation](https://vee-validate.logaretm.com/v4/)
- [Nuxt 3 Documentation](https://nuxt.com/docs)

---

**ملاحظة**: هذا النظام مصمم ليكون مرناً وقابلاً للتوسع. يمكنك إضافة validators جديدة أو تعديل الموجودة حسب احتياجات مشروعك. 