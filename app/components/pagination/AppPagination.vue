<template>
  <!-- حاوية الباجينيشن مع تنسيق مرن - Pagination wrapper with flexible layout -->
  <div class="d-flex align-center flex-wrap gap-2" :class="alignmentClass">
    <!-- ملخص النطاق - Range summary -->
    <div v-if="showRange" class="text-caption text-medium-emphasis">
      {{ rangeText }}
    </div>

    <!-- محدد حجم الصفحة - Page size selector -->
    <div v-if="showPageSize" class="d-flex align-center">
      <span class="text-caption me-2">{{ t('pagination.itemsPerPage') }}</span>
      <v-select
        :model-value="pageSizeValue"
        :items="pageSizes"
        :density="dense ? 'compact' : 'comfortable'"
        :variant="variant"
        hide-details
        style="max-width: 92px"
        @update:model-value="handleUpdatePageSize"
      />
    </div>

    <!-- تحكم الباجينيشن مع أزرار الانتقال السريع - Pagination control with quick navigation -->
    <div class="d-flex align-center gap-1">
      <!-- زر الانتقال لأول صفحة - First page button -->
      <v-btn
        v-if="showFirstLast"
        :disabled="disabled || pageValue <= 1"
        :size="size"
        variant="text"
        icon="mdi-page-first"
        :density="dense ? 'compact' : 'default'"
        class="pagination-nav-btn"
        @click="handleUpdatePage(1)"
      />

      <!-- عنصر الباجينيشن الأساسي - Main pagination component -->
      <v-pagination
        :model-value="pageValue"
        :length="lengthValue"
        :total-visible="totalVisible"
        :disabled="disabled || lengthValue <= 1"
        :density="dense ? 'compact' : 'default'"
        :size="size"
        @update:model-value="handleUpdatePage"
      />

      <!-- زر الانتقال لآخر صفحة - Last page button -->
      <v-btn
        v-if="showFirstLast"
        :disabled="disabled || pageValue >= lengthValue"
        :size="size"
        variant="text"
        icon="mdi-page-last"
        :density="dense ? 'compact' : 'default'"
        class="pagination-nav-btn"
        @click="handleUpdatePage(lengthValue)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// تعريف الأنواع - Type definitions
type Align = 'start' | 'center' | 'end'
type Size = 'x-small' | 'small' | 'default' | 'large' | 'x-large'
type Variant =
  | 'outlined'
  | 'filled'
  | 'solo'
  | 'underlined'
  | 'plain'
  | 'solo-filled'
  | 'solo-inverted'
  | undefined

// تعريف الخصائص مع قيم افتراضية محسنة - Enhanced props with better defaults
const props = withDefaults(
  defineProps<{
    page?: number
    pageSize?: number
    totalItems?: number
    length?: number
    pageSizes?: number[]
    totalVisible?: number
    dense?: boolean
    disabled?: boolean
    showPageSize?: boolean
    showRange?: boolean
    showFirstLast?: boolean
    align?: Align
    size?: Size
    variant?: Variant
  }>(),
  {
    page: 1,
    pageSize: 10,
    totalItems: 0,
    length: undefined,
    pageSizes: () => [5, 10, 20, 50, 100],
    totalVisible: 5,
    dense: false,
    disabled: false,
    showPageSize: true,
    showRange: true,
    showFirstLast: true,
    align: 'center',
    size: 'small',
    variant: 'outlined',
  },
)

// تعريف الأحداث - Event definitions
const emit = defineEmits<{
  (e: 'update:page', value: number): void
  (e: 'update:pageSize', value: number): void
  (e: 'change', payload: { page: number; pageSize: number; totalPages: number }): void
}>()

const { t } = useI18n()

// حالة تفاعلية - Reactive state
const currentPage = ref(props.page)
const currentPageSize = ref(props.pageSize)

// حساب مجموع الصفحات - Compute total pages
const computedTotalPages = computed(() =>
  props.length && props.length > 0
    ? props.length
    : Math.max(1, Math.ceil((props.totalItems || 0) / (currentPageSize.value || 1))),
)

// قيم محسوبة - Computed values
const pageValue = computed(() => clampPage(currentPage.value))
const pageSizeValue = computed(() => clampPageSize(currentPageSize.value))
const lengthValue = computed(() => computedTotalPages.value)

// ملخص النطاق - Range summary
const startIndex = computed(() => (pageValue.value - 1) * pageSizeValue.value + 1)
const endIndex = computed(() => Math.min(pageValue.value * pageSizeValue.value, props.totalItems ?? 0))
const rangeText = computed(() => {
  if (!props.showRange) return ''
  const total = props.totalItems ?? 0
  if (total <= 0) return t('pagination.rangeEmpty')
  return t('pagination.range', { from: startIndex.value, to: endIndex.value, total })
})

// فئات المحاذاة - Alignment classes
const alignmentClass = computed(() =>
  props.align === 'center' ? 'justify-center' : props.align === 'start' ? 'justify-start' : 'justify-end'
)

// وظائف مساعدة - Helper functions
const clampPage = (p: number) => Math.min(Math.max(1, p), computedTotalPages.value)
const clampPageSize = (s: number) => (s > 0 ? s : 10)

// إرسال التغييرات - Emit changes
const emitChange = () => {
  emit('change', { page: pageValue.value, pageSize: pageSizeValue.value, totalPages: lengthValue.value })
}

// معالجات التحديثات - Handle updates
const handleUpdatePage = (p: number) => {
  const next = clampPage(p)
  if (next === pageValue.value) return
  currentPage.value = next
  emit('update:page', next)
  emitChange()
}

const handleUpdatePageSize = (s: number) => {
  const nextSize = clampPageSize(Number(s))
  if (nextSize === pageSizeValue.value) return
  currentPageSize.value = nextSize
  currentPage.value = clampPage(1)
  emit('update:pageSize', nextSize)
  emit('update:page', currentPage.value)
  emitChange()
}
</script>

<style scoped>
/* تنسيق بسيط باستخدام Vuetify tokens - Minimal styling using Vuetify tokens */

/* تنسيق أزرار الانتقال السريع - Quick navigation buttons styling */
.pagination-nav-btn {
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.pagination-nav-btn:hover {
  background-color: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
}

/* دعم RTL لأزرار الانتقال - RTL support for navigation buttons */
[dir="rtl"] .gap-1 {
  flex-direction: row-reverse;
}
</style>
