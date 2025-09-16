# استخدام useApi البسيط والاحترافي

## نظرة عامة

هذا دليل سريع لاستخدام `useApi` في مشروعك بطريقة بسيطة وواضحة.

## 🚀 **الاستخدام الأساسي**

### في المكونات (Components)

```vue
<script setup>
// استيراد بسيط
const { get, post, put, delete: del } = useApi()

// جلب البيانات
const fetchUsers = async () => {
  try {
    const users = await get('/api/users')
    console.log(users)
  } catch (error) {
    // الأخطاء تتم معالجتها تلقائياً في useApi
    console.log('Error handled automatically')
  }
}

// إرسال بيانات
const createUser = async (userData) => {
  try {
    const newUser = await post('/api/users', userData)
    console.log('User created:', newUser)
  } catch (error) {
    // معالجة تلقائية للأخطاء
  }
}

// تحديث بيانات
const updateUser = async (id, userData) => {
  const updated = await put(`/api/users/${id}`, userData)
  return updated
}

// حذف
const deleteUser = async (id) => {
  await del(`/api/users/${id}`)
}
</script>
```

### في Composables

```typescript
// composables/useUsers.ts
export const useUsers = () => {
  const { get, post, put, delete: del } = useApi()
  
  const getUsers = () => get('/api/users')
  const createUser = (data) => post('/api/users', data)
  const updateUser = (id, data) => put(`/api/users/${id}`, data)
  const deleteUser = (id) => del(`/api/users/${id}`)
  
  return {
    getUsers,
    createUser,
    updateUser,
    deleteUser
  }
}
```

## 📝 **أمثلة عملية**

### مثال 1: صفحة المستخدمين

```vue
<template>
  <div>
    <v-btn @click="loadUsers">تحميل المستخدمين</v-btn>
    <v-list>
      <v-list-item v-for="user in users" :key="user.id">
        {{ user.name }}
      </v-list-item>
    </v-list>
  </div>
</template>

<script setup>
const { get } = useApi()
const users = ref([])

const loadUsers = async () => {
  // بسيط ومباشر - الأخطاء تتم معالجتها تلقائياً
  users.value = await get('/api/users')
}
</script>
```

### مثال 2: نموذج إنشاء

```vue
<template>
  <v-form @submit.prevent="handleSubmit">
    <v-text-field v-model="form.name" label="الاسم" />
    <v-text-field v-model="form.email" label="الإيميل" />
    <v-btn type="submit" :loading="loading">حفظ</v-btn>
  </v-form>
</template>

<script setup>
const { post } = useApi()
const { showSuccess } = useSnackbar()

const form = ref({ name: '', email: '' })
const loading = ref(false)

const handleSubmit = async () => {
  loading.value = true
  
  try {
    await post('/api/users', form.value)
    showSuccess('تم إنشاء المستخدم بنجاح')
    form.value = { name: '', email: '' }
  } catch (error) {
    // الأخطاء تتم معالجتها في useApi
  } finally {
    loading.value = false
  }
}
</script>
```

## 🔧 **المميزات التلقائية في useApi**

### ✅ **ما يتم تلقائياً:**
- إضافة Authorization header
- معالجة أخطاء 401 (انتهاء الجلسة)
- معالجة أخطاء 403 (عدم وجود صلاحية)
- معالجة أخطاء الخادم (500+)
- حفظ الصفحة المطلوبة للعودة إليها
- توجيه ذكي حسب نوع المنطقة
- عرض رسائل مناسبة للمستخدم

### ⚡ **ما تحتاج فعله:**
- استخدام `useApi()` فقط
- كتابة منطق العمل (business logic)
- معالجة أخطاء 400 (business errors) حسب الحاجة

## 🎯 **أفضل الممارسات**

### 1. **استخدم الطرق المناسبة**
```typescript
// ✅ جيد
const users = await get('/api/users')
const newUser = await post('/api/users', userData)
const updated = await put('/api/users/123', userData)
await del('/api/users/123')

// ❌ تجنب الخلط
// لا تستخدم POST للحذف أو GET لإرسال البيانات
```

### 2. **معالجة loading states**
```vue
<script setup>
const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const data = await get('/api/data')
    // استخدام البيانات
  } finally {
    loading.value = false
  }
}
</script>
```

### 3. **استخدام try/catch للمنطق المخصص فقط**
```typescript
// ✅ جيد - للمنطق المخصص
try {
  const result = await post('/api/users', data)
  router.push('/users') // منطق مخصص بعد النجاح
} catch (error) {
  // معالجة مخصصة إضافية إذا لزم الأمر
}

// ✅ أفضل - بسيط ومباشر
const result = await post('/api/users', data)
router.push('/users')
```

## 📋 **قائمة سريعة للاستخدام**

| العملية | الطريقة | المثال |
|---------|---------|---------|
| **جلب البيانات** | `get()` | `get('/api/users')` |
| **إنشاء جديد** | `post()` | `post('/api/users', data)` |
| **تحديث كامل** | `put()` | `put('/api/users/123', data)` |
| **تحديث جزئي** | `patch()` | `patch('/api/users/123', data)` |
| **حذف** | `delete()` | `delete('/api/users/123')` |

## 💡 **نصائح إضافية**

### للصفحات الحرجة
إذا كنت تعمل في منطقة حرجة (مثل `/admin` أو `/financial`)، فإن الأخطاء 401 ستوجه مباشرة لصفحة تسجيل الدخول للأمان الإضافي.

### للصفحات العادية
في المناطق العادية، ستظهر صفحة "غير مصرح بالوصول" الودودة مع معلومات مساعدة.

### تخصيص الرسائل
```typescript
// يمكنك عرض رسائل نجاح مخصصة
const { showSuccess, showError } = useSnackbar()

const saveData = async () => {
  await post('/api/data', formData)
  showSuccess('تم حفظ البيانات بنجاح!')
}
```

## ✨ **الخلاصة**

`useApi` يوفر لك:
- **بساطة في الاستخدام** - طريقة واحدة لجميع طلبات API
- **معالجة تلقائية للأخطاء** - لا حاجة للقلق بشأن 401, 403, 500
- **أمان تلقائي** - إضافة headers المطلوبة تلقائياً
- **تجربة مستخدم ممتازة** - توجيه ذكي ورسائل مناسبة

استخدم `useApi` واركز على منطق تطبيقك! 🚀