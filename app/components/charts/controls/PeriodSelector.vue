<template>
  <div class="period-selector">
    <!-- عرض الأزرار | Buttons Display -->
    <div v-if="variant === 'buttons'" class="period-buttons">
      <v-btn-toggle
        v-model="selectedPeriod"
        :color="color"
        :variant="buttonVariant"
        :density="density"
        :size="size"
        mandatory
        @update:model-value="handlePeriodChange"
      >
        <v-btn
          v-for="period in availablePeriods"
          :key="period"
          :value="period"
          :disabled="isDisabled(period)"
        >
          {{ getPeriodLabel(period) }}
        </v-btn>
      </v-btn-toggle>
    </div>
    
    <!-- عرض القائمة المنسدلة | Dropdown Display -->
    <v-select
      v-else-if="variant === 'select'"
      v-model="selectedPeriod"
      :items="selectItems"
      :label="label || $t('charts.select_period')"
      :placeholder="placeholder"
      :variant="selectVariant"
      :density="density"
      :size="size"
      :color="color"
      :disabled="disabled"
      :loading="loading"
      :hide-details="hideDetails"
      :prepend-icon="prependIcon"
      :append-icon="appendIcon"
      @update:model-value="handlePeriodChange"
    />
    
    <!-- عرض التبويبات | Tabs Display -->
    <v-tabs
      v-else-if="variant === 'tabs'"
      v-model="selectedPeriodIndex"
      :color="color"
      :density="density"
      :direction="tabDirection"
      :align-tabs="tabAlign"
      @update:model-value="handleTabChange"
    >
      <v-tab
        v-for="period in availablePeriods"
        :key="period"
        :value="period"
        :disabled="isDisabled(period)"
      >
        <v-icon v-if="getPeriodIcon(period)" :icon="getPeriodIcon(period)" class="me-2" />
        {{ getPeriodLabel(period) }}
      </v-tab>
    </v-tabs>
    
    <!-- عرض البطاقات | Cards Display -->
    <div v-else-if="variant === 'cards'" class="period-cards">
      <v-card
        v-for="period in availablePeriods"
        :key="period"
        class="period-card"
        :class="{
          'period-card-selected': selectedPeriod === period,
          'period-card-disabled': isDisabled(period)
        }"
        :color="selectedPeriod === period ? color : undefined"
        :variant="selectedPeriod === period ? 'elevated' : 'outlined'"
        :disabled="isDisabled(period)"
        @click="selectPeriod(period)"
      >
        <v-card-text class="text-center">
          <v-icon 
            v-if="getPeriodIcon(period)" 
            :icon="getPeriodIcon(period)" 
            class="mb-2"
            :color="selectedPeriod === period ? 'white' : color"
            size="24"
          />
          <div class="period-card-label">
            {{ getPeriodLabel(period) }}
          </div>
          <div v-if="showDescription" class="period-card-description">
            {{ getPeriodDescription(period) }}
          </div>
        </v-card-text>
      </v-card>
    </div>
    
    <!-- معلومات إضافية | Additional Info -->
    <div v-if="showInfo && selectedPeriod" class="period-info">
      <v-chip
        :color="color"
        variant="tonal"
        size="small"
        class="mt-2"
      >
        <v-icon icon="mdi-information" size="16" class="me-1" />
        {{ getPeriodInfo(selectedPeriod) }}
      </v-chip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from '#app'

interface PeriodOption {
  value: string
  label?: string
  description?: string
  icon?: string
  disabled?: boolean
  info?: string
}

interface Props {
  // القيمة المختارة | Selected Value
  modelValue?: string
  
  // خيارات الفترات | Period Options
  periods?: string[] | PeriodOption[]
  labels?: Record<string, string>
  defaultPeriod?: string
  
  // خيارات العرض | Display Options
  variant?: 'buttons' | 'select' | 'tabs' | 'cards'
  color?: string
  size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large'
  density?: 'default' | 'compact' | 'comfortable'
  
  // خيارات الأزرار | Button Options
  buttonVariant?: 'text' | 'flat' | 'elevated' | 'tonal' | 'outlined' | 'plain'
  
  // خيارات القائمة المنسدلة | Select Options
  selectVariant?: 'filled' | 'outlined' | 'underlined' | 'solo' | 'solo-inverted' | 'solo-filled'
  label?: string
  placeholder?: string
  prependIcon?: string
  appendIcon?: string
  hideDetails?: boolean
  
  // خيارات التبويبات | Tab Options
  tabDirection?: 'horizontal' | 'vertical'
  tabAlign?: 'start' | 'center' | 'end'
  
  // خيارات إضافية | Additional Options
  showDescription?: boolean
  showInfo?: boolean
  showIcons?: boolean
  disabled?: boolean
  loading?: boolean
  disabledPeriods?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  periods: () => ['weekly', 'monthly', 'yearly'],
  variant: 'buttons',
  color: 'primary',
  size: 'default',
  density: 'default',
  buttonVariant: 'outlined',
  selectVariant: 'outlined',
  tabDirection: 'horizontal',
  tabAlign: 'center',
  showDescription: false,
  showInfo: false,
  showIcons: true,
  disabled: false,
  loading: false,
  hideDetails: true,
  disabledPeriods: () => []
})

interface Emits {
  'update:modelValue': [value: string]
  'change': [value: string, previousValue: string | undefined]
}

const emit = defineEmits<Emits>()

// التدويل | Internationalization
const { t } = useI18n()

// المتغيرات التفاعلية | Reactive Variables
const selectedPeriod = ref(props.modelValue || props.defaultPeriod || '')
const previousValue = ref<string | undefined>()

// الحاسبات | Computed Properties
const availablePeriods = computed(() => {
  return props.periods.map(period => {
    if (typeof period === 'string') {
      return period
    }
    return period.value
  })
})

const selectedPeriodIndex = computed({
  get: () => availablePeriods.value.indexOf(selectedPeriod.value),
  set: (index: number) => {
    if (index >= 0 && index < availablePeriods.value.length) {
      selectPeriod(availablePeriods.value[index])
    }
  }
})

const selectItems = computed(() => {
  return availablePeriods.value.map(period => ({
    title: getPeriodLabel(period),
    value: period,
    props: {
      disabled: isDisabled(period)
    }
  }))
})

// الألقاب الافتراضية | Default Labels
const defaultLabels = computed(() => ({
  daily: t('periods.daily'),
  weekly: t('periods.weekly'),
  monthly: t('periods.monthly'),
  quarterly: t('periods.quarterly'),
  yearly: t('periods.yearly'),
  custom: t('periods.custom')
}))

// الأيقونات الافتراضية | Default Icons
const defaultIcons = {
  daily: 'mdi-calendar-today',
  weekly: 'mdi-calendar-week',
  monthly: 'mdi-calendar-month',
  quarterly: 'mdi-calendar-range',
  yearly: 'mdi-calendar',
  custom: 'mdi-calendar-edit'
}

// الأوصاف الافتراضية | Default Descriptions
const defaultDescriptions = computed(() => ({
  daily: t('periods.daily_desc'),
  weekly: t('periods.weekly_desc'),
  monthly: t('periods.monthly_desc'),
  quarterly: t('periods.quarterly_desc'),
  yearly: t('periods.yearly_desc'),
  custom: t('periods.custom_desc')
}))

// المعلومات الافتراضية | Default Info
const defaultInfo = computed(() => ({
  daily: t('periods.daily_info'),
  weekly: t('periods.weekly_info'),
  monthly: t('periods.monthly_info'),
  quarterly: t('periods.quarterly_info'),
  yearly: t('periods.yearly_info'),
  custom: t('periods.custom_info')
}))

// الوظائف | Functions
const getPeriodOption = (period: string): PeriodOption | undefined => {
  if (typeof props.periods[0] === 'object') {
    return (props.periods as PeriodOption[]).find(p => p.value === period)
  }
  return undefined
}

const getPeriodLabel = (period: string): string => {
  const option = getPeriodOption(period)
  if (option?.label) return option.label
  
  if (props.labels && props.labels[period]) {
    return props.labels[period]
  }
  
  return defaultLabels.value[period] || period
}

const getPeriodDescription = (period: string): string => {
  const option = getPeriodOption(period)
  if (option?.description) return option.description
  
  return defaultDescriptions.value[period] || ''
}

const getPeriodIcon = (period: string): string | undefined => {
  if (!props.showIcons) return undefined
  
  const option = getPeriodOption(period)
  if (option?.icon) return option.icon
  
  return defaultIcons[period]
}

const getPeriodInfo = (period: string): string => {
  const option = getPeriodOption(period)
  if (option?.info) return option.info
  
  return defaultInfo.value[period] || ''
}

const isDisabled = (period: string): boolean => {
  if (props.disabled) return true
  
  const option = getPeriodOption(period)
  if (option?.disabled) return true
  
  return props.disabledPeriods.includes(period)
}

const selectPeriod = (period: string) => {
  if (isDisabled(period) || period === selectedPeriod.value) return
  
  previousValue.value = selectedPeriod.value
  selectedPeriod.value = period
  
  emit('update:modelValue', period)
  emit('change', period, previousValue.value)
}

const handlePeriodChange = (value: string) => {
  selectPeriod(value)
}

const handleTabChange = (index: number) => {
  if (index >= 0 && index < availablePeriods.value.length) {
    selectPeriod(availablePeriods.value[index])
  }
}

// API عامة | Public API
const setValue = (period: string) => {
  selectPeriod(period)
}

const reset = () => {
  const defaultValue = props.defaultPeriod || availablePeriods.value[0] || ''
  selectPeriod(defaultValue)
}

const getSelectedPeriod = () => selectedPeriod.value

const getPreviousValue = () => previousValue.value

// تصدير للمكون الأب | Expose to parent
defineExpose({
  setValue,
  reset,
  getSelectedPeriod,
  getPreviousValue
})

// مراقبة التغييرات | Watchers
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && newValue !== selectedPeriod.value) {
      selectedPeriod.value = newValue
    }
  }
)

// دورة الحياة | Lifecycle
onMounted(() => {
  // تعيين قيمة افتراضية إذا لم تكن محددة
  if (!selectedPeriod.value && availablePeriods.value.length > 0) {
    const defaultValue = props.defaultPeriod || availablePeriods.value[0]
    selectPeriod(defaultValue)
  }
})
</script>

<style scoped>
.period-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* عرض الأزرار | Buttons Display */
.period-buttons {
  display: flex;
  justify-content: center;
}

/* عرض البطاقات | Cards Display */
.period-cards {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.period-card {
  flex: 1;
  min-width: 120px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.period-card:hover:not(.period-card-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.period-card-selected {
  transform: translateY(-1px);
}

.period-card-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.period-card-label {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.period-card-description {
  font-size: 12px;
  opacity: 0.7;
  line-height: 1.3;
}

/* معلومات إضافية | Additional Info */
.period-info {
  display: flex;
  justify-content: center;
}

/* استجابة الهاتف | Mobile Responsive */
@media (max-width: 768px) {
  .period-cards {
    gap: 8px;
  }
  
  .period-card {
    min-width: 100px;
  }
  
  .period-card-label {
    font-size: 13px;
  }
  
  .period-card-description {
    font-size: 11px;
  }
  
  /* تحويل الأزرار إلى عمودي | Convert buttons to vertical */
  .period-buttons :deep(.v-btn-toggle) {
    flex-direction: column;
    width: 100%;
  }
  
  .period-buttons :deep(.v-btn) {
    width: 100%;
    margin-bottom: 4px;
  }
}

/* تم إزالة تنسيقات الوضع المظلم */
</style>
