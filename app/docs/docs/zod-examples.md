# أمثلة عملية لاستخدام Zod مع VeeValidate

## 🚀 الاستخدام السريع

### 1. نموذج تسجيل دخول بسيط

```vue
<template>
  <VeeForm @submit="handleLogin" :validation-schema="schema">
    <VeeField name="username" v-slot="{ field, errors }">
      <v-text-field
        v-bind="field"
        :error-messages="errors"
        label="اسم المستخدم"
      />
    </VeeField>
    
    <VeeField name="password" v-slot="{ field, errors }">
      <v-text-field
        v-bind="field"
        :error-messages="errors"
        label="كلمة المرور"
        type="password"
      />
    </VeeField>
    
    <v-btn type="submit">تسجيل الدخول</v-btn>
  </VeeForm>
</template>

<script setup>
import { useLoginSchema } from '@/composables/useZod'

const schema = useLoginSchema()

const handleLogin = (values) => {
  console.log('Login data:', values)
  // منطق تسجيل الدخول
}
</script>
```

### 2. نموذج مخصص بـ validators متعددة

```vue
<script setup>
import {
  useCustomSchema,
  useZodRequiredString,
  useZodEmail,
  useZodNumber,
  useZodPhoneNumber
} from '@/composables/useZod'

const schema = useCustomSchema({
  fullName: useZodRequiredString('الاسم مطلوب')
    .min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  
  email: useZodEmail('البريد الإلكتروني غير صحيح'),
  
  age: useZodNumber({
    min: 18,
    max: 100,
    int: true,
    message: 'العمر يجب أن يكون بين 18 و 100'
  }),
  
  phone: useZodPhoneNumber('رقم الهاتف غير صحيح'),
  
  salary: useZodNumber({
    min: 0,
    positive: true,
    message: 'الراتب يجب أن يكون رقم موجب'
  })
})
</script>
```

## 💪 أمثلة متقدمة

### 1. نموذج بـ conditional validation

```vue
<script setup>
import { computed, ref } from 'vue'
import { useZod, useZodSchema } from '@/composables/useZod'

const userType = ref('individual')

const schema = computed(() => {
  const zod = useZod()
  
  const baseSchema = {
    name: zod.string().min(1, 'الاسم مطلوب'),
    email: zod.string().email('البريد الإلكتروني غير صحيح'),
    userType: zod.enum(['individual', 'business'])
  }
  
  // إضافة حقول مشروطة حسب نوع المستخدم
  if (userType.value === 'business') {
    baseSchema.companyName = zod.string().min(1, 'اسم الشركة مطلوب')
    baseSchema.taxId = zod.string().min(1, 'الرقم الضريبي مطلوب')
  } else {
    baseSchema.birthDate = zod.date().optional()
    baseSchema.nationalId = zod.string().min(1, 'رقم الهوية مطلوب')
  }
  
  return useZodSchema(zod.object(baseSchema))
})
</script>
```

### 2. نموذج مع array fields

```vue
<script setup>
import { ref } from 'vue'
import {
  useZod,
  useZodSchema,
  useArraySchema,
  useZodRequiredString,
  useZodNumber
} from '@/composables/useZod'

const zod = useZod()

// Schema للعنصر الواحد
const itemSchema = zod.object({
  name: useZodRequiredString('اسم المنتج مطلوب'),
  quantity: useZodNumber({ min: 1, int: true }),
  price: useZodNumber({ min: 0, positive: true })
})

// Schema للنموذج الكامل
const orderSchema = useZodSchema(zod.object({
  customerName: useZodRequiredString('اسم العميل مطلوب'),
  items: useArraySchema(itemSchema).min(1, 'يجب إضافة منتج واحد على الأقل'),
  totalAmount: useZodNumber({ min: 0, positive: true })
}))

const orderData = ref({
  customerName: '',
  items: [{ name: '', quantity: 1, price: 0 }],
  totalAmount: 0
})

const addItem = () => {
  orderData.value.items.push({ name: '', quantity: 1, price: 0 })
}

const removeItem = (index) => {
  orderData.value.items.splice(index, 1)
}
</script>
```

### 3. Validation مع custom rules

```vue
<script setup>
import { useZod, useZodSchema } from '@/composables/useZod'

const zod = useZod()

const schema = useZodSchema(zod.object({
  username: zod.string()
    .min(1, 'اسم المستخدم مطلوب')
    .min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
    .regex(/^[a-zA-Z0-9_]+$/, 'اسم المستخدم يمكن أن يحتوي على أحرف وأرقام و _ فقط')
    .refine(
      async (username) => {
        // التحقق من توفر اسم المستخدم (محاكاة API call)
        const response = await fetch(`/api/check-username/${username}`)
        return response.ok
      },
      { message: 'اسم المستخدم غير متوفر' }
    ),
  
  password: zod.string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .regex(/(?=.*[a-z])/, 'كلمة المرور يجب أن تحتوي على حرف صغير')
    .regex(/(?=.*[A-Z])/, 'كلمة المرور يجب أن تحتوي على حرف كبير')
    .regex(/(?=.*\d)/, 'كلمة المرور يجب أن تحتوي على رقم'),
  
  confirmPassword: zod.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"]
}))
</script>
```

## 🔒 أمان البيانات

### 1. Server-side validation

```typescript
// server/api/users.post.ts
import { z } from 'zod'

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(18).max(120)
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // التحقق من البيانات
  const validation = createUserSchema.safeParse(body)
  
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'بيانات غير صحيحة',
      data: validation.error.issues
    })
  }
  
  // استخدام البيانات المتحقق منها
  const userData = validation.data
  
  // حفظ المستخدم في قاعدة البيانات
  return { success: true, user: userData }
})
```

### 2. Data sanitization

```typescript
// في composables/useZod.ts
export const useSanitizedInput = (message?: string) => {
  const zod = useZod()
  return zod.string()
    .trim() // إزالة المسافات
    .transform(val => 
      val
        .replace(/[<>]/g, '') // إزالة HTML tags خطيرة
        .replace(/['"]/g, '') // إزالة علامات الاقتباس
    )
    .min(1, { message: message ?? 'هذا الحقل مطلوب' })
}
```

## 🌐 التدويل (i18n)

### 1. رسائل خطأ متعددة اللغات

```typescript
// composables/useZodI18n.ts
export const useZodI18n = () => {
  const { $t } = useNuxtApp()
  const zod = useZod()
  
  return {
    requiredString: (key: string) => 
      zod.string().min(1, { message: $t(key) }),
    
    email: (key?: string) => 
      zod.string()
        .min(1, { message: $t('validation.emailRequired') })
        .email({ message: $t(key || 'validation.emailInvalid') }),
    
    minLength: (min: number, key: string) =>
      zod.string().min(min, { message: $t(key, { min }) })
  }
}
```

### 2. استخدام الترجمة في النماذج

```vue
<script setup>
import { useZodI18n } from '@/composables/useZodI18n'

const zodI18n = useZodI18n()

const schema = useCustomSchema({
  name: zodI18n.requiredString('validation.nameRequired'),
  email: zodI18n.email(),
  password: zodI18n.minLength(8, 'validation.passwordMinLength')
})
</script>
```

## 🧪 اختبار النماذج

### 1. اختبار unit للـ validators

```typescript
// tests/composables/useZod.test.ts
import { describe, it, expect } from 'vitest'
import { useZodEmail, useValidateData } from '@/composables/useZod'

describe('useZodEmail', () => {
  it('should validate correct email', async () => {
    const emailValidator = useZodEmail()
    const result = await useValidateData(emailValidator, 'test@example.com')
    
    expect(result.success).toBe(true)
    expect(result.data).toBe('test@example.com')
  })
  
  it('should reject invalid email', async () => {
    const emailValidator = useZodEmail()
    const result = await useValidateData(emailValidator, 'invalid-email')
    
    expect(result.success).toBe(false)
    expect(result.errors).toBeDefined()
  })
})
```

### 2. اختبار integration للنماذج

```vue
<!-- tests/components/LoginForm.test.vue -->
<script setup>
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import LoginForm from '@/pages/login.vue'

describe('LoginForm', () => {
  it('should show validation errors for empty fields', async () => {
    const wrapper = mount(LoginForm)
    
    // محاولة إرسال النموذج بدون بيانات
    await wrapper.find('form').trigger('submit')
    
    // التحقق من ظهور رسائل الخطأ
    expect(wrapper.text()).toContain('Username is required')
    expect(wrapper.text()).toContain('Password is required')
  })
  
  it('should submit form with valid data', async () => {
    const wrapper = mount(LoginForm)
    
    // ملء النموذج ببيانات صحيحة
    await wrapper.find('[name="username"]').setValue('testuser')
    await wrapper.find('[name="password"]').setValue('password123')
    
    // إرسال النموذج
    await wrapper.find('form').trigger('submit')
    
    // التحقق من عدم وجود أخطاء
    expect(wrapper.text()).not.toContain('required')
  })
})
</script>
```

## 🎯 نصائح الأداء

### 1. Lazy validation

```vue
<script setup>
import { computed, ref } from 'vue'

const enableValidation = ref(false)

const schema = computed(() => {
  // تفعيل الـ validation فقط عند الحاجة
  if (!enableValidation.value) return null
  
  return useLoginSchema()
})

// تفعيل الـ validation عند أول محاولة إرسال
const handleSubmit = (values) => {
  enableValidation.value = true
  // باقي منطق الإرسال
}
</script>
```

### 2. Schema memoization

```vue
<script setup>
import { computed } from 'vue'

// استخدام computed لتجنب إعادة إنشاء الـ schema
const loginSchema = computed(() => useLoginSchema())

// للـ schemas المعقدة
const complexSchema = computed(() => {
  return useCustomSchema({
    // حقول كثيرة...
  })
})
</script>
```

## 📱 Responsive forms

### 1. نموذج متجاوب

```vue
<template>
  <VeeForm @submit="handleSubmit" :validation-schema="schema">
    <v-row>
      <!-- على الشاشات الكبيرة: نصف العرض، على الصغيرة: العرض كاملاً -->
      <v-col cols="12" md="6">
        <VeeField name="firstName" v-slot="{ field, errors }">
          <v-text-field
            v-bind="field"
            :error-messages="errors"
            label="الاسم الأول"
            variant="outlined"
          />
        </VeeField>
      </v-col>
      
      <v-col cols="12" md="6">
        <VeeField name="lastName" v-slot="{ field, errors }">
          <v-text-field
            v-bind="field"
            :error-messages="errors"
            label="الاسم الأخير"
            variant="outlined"
          />
        </VeeField>
      </v-col>
      
      <!-- البريد الإلكتروني: العرض كاملاً دائماً -->
      <v-col cols="12">
        <VeeField name="email" v-slot="{ field, errors }">
          <v-text-field
            v-bind="field"
            :error-messages="errors"
            label="البريد الإلكتروني"
            type="email"
            variant="outlined"
          />
        </VeeField>
      </v-col>
    </v-row>
  </VeeForm>
</template>
```

## 🔄 إدارة الحالة مع Pinia

### 1. Store للنماذج

```typescript
// stores/forms.ts
import { defineStore } from 'pinia'

export const useFormsStore = defineStore('forms', () => {
  const formData = ref({})
  const formErrors = ref({})
  
  const saveFormData = (formName: string, data: any) => {
    formData.value[formName] = data
  }
  
  const getFormData = (formName: string) => {
    return formData.value[formName] || {}
  }
  
  const clearFormData = (formName: string) => {
    delete formData.value[formName]
    delete formErrors.value[formName]
  }
  
  return {
    formData: readonly(formData),
    saveFormData,
    getFormData,
    clearFormData
  }
})
```

### 2. استخدام Store في النماذج

```vue
<script setup>
import { useFormsStore } from '@/stores/forms'

const formsStore = useFormsStore()

// استرجاع البيانات المحفوظة
const initialData = formsStore.getFormData('userProfile')

const handleSubmit = (values) => {
  // حفظ البيانات في Store
  formsStore.saveFormData('userProfile', values)
  
  // إرسال البيانات
  submitToAPI(values)
}

// تنظيف البيانات عند مغادرة الصفحة
onUnmounted(() => {
  formsStore.clearFormData('userProfile')
})
</script>
```

---

هذه الأمثلة تغطي معظم الاستخدامات العملية لـ Zod مع VeeValidate في مشاريع Nuxt 3 الحقيقية. 