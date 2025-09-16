### AppPagination.vue

مكوّن ترقيم صفحات قابل لإعادة الاستخدام مع كامل المنطق بداخله، مبني على Vuetify `v-pagination` مع تحكم بحجم الصفحة، عرض المدى، وخيار الانتقال لرقم صفحة محدد.

Path: `app/components/pagination/AppPagination.vue`

الخصائص (Props):
- `page?: number` الصفحة الحالية. افتراضي: 1.
- `pageSize?: number` حجم الصفحة (عدد العناصر في الصفحة). افتراضي: 10.
- `totalItems?: number` إجمالي عدد العناصر. افتراضي: 0.
- `length?: number` عدد الصفحات مباشرة (بدلاً من احتسابه من `totalItems/pageSize`).
- `pageSizes?: number[]` خيارات حجم الصفحة. افتراضي: `[5,10,20,50,100]`.
- `totalVisible?: number` عدد أزرار الصفحات الظاهرة. افتراضي: 5.
- `dense?: boolean` نمط مدمج. افتراضي: false.
- `disabled?: boolean` تعطيل المكوّن. افتراضي: false.
- `showPageSize?: boolean` إظهار محدّد حجم الصفحة. افتراضي: true.
- `showGoto?: boolean` إظهار الانتقال لصفحة معيّنة. افتراضي: false.
- `showRange?: boolean` إظهار نص المدى (من-إلى من إجمالي). افتراضي: true.
- `size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large'` حجم عناصر الترقيم. افتراضي: 'small'.
- `variant?: 'outlined' | 'filled' | 'solo' | 'underlined' | 'plain' | ...` مظهر حقول الإدخال.

الأحداث (Emits):
- `update:page` عندما تتغير الصفحة.
- `update:pageSize` عندما يتغير حجم الصفحة.
- `change` حمولة مجمّعة `{ page, pageSize, totalPages }` عند أي تغيير مهم.

حساب عدد الصفحات:
- إذا تم تمرير `length` (> 0) يتم استخدامه مباشرة.
- خلاف ذلك: `totalPages = ceil(totalItems / pageSize)` بحد أدنى 1.

الاستخدام الأساسي:
```vue
<script setup lang="ts">
import AppPagination from '~/components/pagination/AppPagination.vue'

const page = ref(1)
const pageSize = ref(10)
const totalItems = ref(237)

const handleChange = (p: { page: number; pageSize: number; totalPages: number }) => {
  // تحميل بيانات الصفحة الجديدة
}
</script>

<template>
  <AppPagination
    v-model:page="page"
    v-model:pageSize="pageSize"
    :total-items="totalItems"
    :total-visible="7"
    :show-goto="true"
    @change="handleChange"
  />
</template>
```

مع جدول (مثال مبسّط):
```vue
<script setup lang="ts">
import AppPagination from '~/components/pagination/AppPagination.vue'
const items = ref<any[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const fetchPage = async () => {
  const { data } = await $fetch('/api/items', { params: { page: page.value, pageSize: pageSize.value } })
  items.value = data.items
  total.value = data.total
}

watch([page, pageSize], fetchPage, { immediate: true })
</script>

<template>
  <!-- جدولك هنا -->
  <AppPagination
    v-model:page="page"
    v-model:pageSize="pageSize"
    :total-items="total"
    :show-range="true"
    :show-goto="true"
  />
  
</template>
```

ملاحظات:
- عندما يتغير `pageSize` يحتفظ المكوّن بأول عنصر ظاهر ويعيد احتساب `page` بناءً على ذلك، لتجربة مستخدم أفضل.
- يمكن تعطيل عنصر اختيار حجم الصفحة بإخفائه (`showPageSize=false`) وتمرير `pageSize` ثابت خارجيًا إذا رغبت.
- يعتمد على مفاتيح i18n التالية تحت `pagination.*` (إن لم تكن موجودة، أضفها):
  - `itemsPerPage`, `go`, `range`, `rangeEmpty`, `inputAriaPage`, `inputAriaPageSize`.


