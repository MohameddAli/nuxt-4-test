<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    location="bottom start"
    offset="4"
    min-width="350"
  >
    <template #activator="{ props: menuProps }">
      <v-text-field
        v-bind="menuProps"
        :model-value="formattedDateRange"
        :label="placeholder"
        :placeholder="placeholder"
        :variant="variant"
        :density="density"
        :disabled="disabled"
        readonly
        clearable
        @click:clear="clearDateRange"
      >
        <template #prepend-inner>
          <v-icon icon="mdi-calendar-range" />
        </template>
        <template #append-inner>
          <v-icon icon="mdi-chevron-down" />
        </template>
      </v-text-field>
    </template>

    <v-card elevation="8" rounded="lg" min-width="400">
      <!-- رأس التقويم | Calendar Header -->
      <v-card-title class="d-flex align-center bg-primary text-white pa-3">
        <v-icon icon="mdi-calendar-range" class="me-2" />
        {{ $t('charts.select_date_range') }}
        <v-spacer />
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          color="white"
          @click="menu = false"
        />
      </v-card-title>

      <!-- النطاقات المحددة مسبقاً | Preset Ranges -->
      <v-card-text v-if="presetRanges && presetRanges.length > 0" class="pa-3 border-b">
        <v-chip-group
          v-model="selectedPreset"
          color="primary"
          variant="outlined"
          @update:model-value="handlePresetChange"
        >
          <v-chip
            v-for="(preset, index) in presetRanges"
            :key="index"
            :value="index"
            size="small"
            filter
          >
            <v-icon :icon="preset.icon || 'mdi-calendar'" class="me-1" />
            {{ preset.label }}
          </v-chip>
        </v-chip-group>
      </v-card-text>

      <!-- التقويمات | Calendars -->
      <v-card-text class="pa-3">
        <v-row dense>
          <!-- تقويم البداية | Start Calendar -->
          <v-col cols="12" md="6">
            <div class="text-subtitle-2 mb-2 text-center">
              {{ $t('charts.start_date') }}
            </div>
            <v-date-picker
              v-model="localStartDate"
              :max="maxStartDate"
              :min="minDate"
              color="primary"
              elevation="0"
              @update:model-value="handleStartDateChange"
            />
          </v-col>

          <!-- تقويم النهاية | End Calendar -->
          <v-col cols="12" md="6">
            <div class="text-subtitle-2 mb-2 text-center">
              {{ $t('charts.end_date') }}
            </div>
            <v-date-picker
              v-model="localEndDate"
              :max="maxDate"
              :min="minEndDate"
              color="primary"
              elevation="0"
              @update:model-value="handleEndDateChange"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <!-- تذييل الإجراءات | Actions Footer -->
      <v-card-actions class="pa-3 border-t">
        <v-btn
          variant="outlined"
          @click="clearDateRange"
        >
          <v-icon icon="mdi-close" class="me-1" />
          {{ $t('common.clear') }}
        </v-btn>
        
        <v-btn
          variant="outlined"
          @click="setToday"
        >
          <v-icon icon="mdi-calendar-today" class="me-1" />
          {{ $t('charts.today') }}
        </v-btn>

        <v-spacer />

        <v-btn
          variant="outlined"
          @click="menu = false"
        >
          {{ $t('common.cancel') }}
        </v-btn>
        
        <v-btn
          color="primary"
          variant="elevated"
          :disabled="!isValidRange"
          @click="applyDateRange"
        >
          <v-icon icon="mdi-check" class="me-1" />
          {{ $t('common.apply') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from '#app'

interface PresetRange {
  label: string
  range: [Date, Date]
  icon?: string
}

interface Props {
  modelValue?: [Date, Date] | null
  placeholder?: string
  variant?: 'filled' | 'outlined' | 'plain' | 'underlined' | 'solo' | 'solo-inverted' | 'solo-filled'
  density?: 'default' | 'comfortable' | 'compact'
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  presetRanges?: PresetRange[]
  format?: string
  clearable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select date range',
  variant: 'outlined',
  density: 'default',
  disabled: false,
  format: 'DD/MM/YYYY',
  clearable: true
})

interface Emits {
  'update:modelValue': [dateRange: [Date, Date] | null]
  'change': [dateRange: [Date, Date] | null]
}

const emit = defineEmits<Emits>()

// التدويل | Internationalization
const { t } = useI18n()

// المتغيرات التفاعلية | Reactive Variables
const menu = ref(false)
const localStartDate = ref<Date | null>(null)
const localEndDate = ref<Date | null>(null)
const selectedPreset = ref<number | null>(null)

// تهيئة القيم | Initialize Values
if (props.modelValue) {
  localStartDate.value = props.modelValue[0]
  localEndDate.value = props.modelValue[1]
}

// الحاسبات | Computed Properties
const formattedDateRange = computed(() => {
  if (!localStartDate.value || !localEndDate.value) {
    return ''
  }
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-EG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
  
  return `${formatDate(localStartDate.value)} - ${formatDate(localEndDate.value)}`
})

const isValidRange = computed(() => {
  return localStartDate.value && 
         localEndDate.value && 
         localStartDate.value <= localEndDate.value
})

const minEndDate = computed(() => {
  return localStartDate.value || props.minDate
})

const maxStartDate = computed(() => {
  return localEndDate.value || props.maxDate
})

// الوظائف | Functions
const handleStartDateChange = (date: Date | null) => {
  localStartDate.value = date
  selectedPreset.value = null
  
  // إذا كان تاريخ النهاية أقل من تاريخ البداية، قم بإعادة تعيينه
  if (localEndDate.value && date && localEndDate.value < date) {
    localEndDate.value = null
  }
}

const handleEndDateChange = (date: Date | null) => {
  localEndDate.value = date
  selectedPreset.value = null
  
  // إذا كان تاريخ البداية أكبر من تاريخ النهاية، قم بإعادة تعيينه
  if (localStartDate.value && date && localStartDate.value > date) {
    localStartDate.value = null
  }
}

const handlePresetChange = (presetIndex: number | null) => {
  if (presetIndex !== null && props.presetRanges && props.presetRanges[presetIndex]) {
    const preset = props.presetRanges[presetIndex]
    localStartDate.value = preset.range[0]
    localEndDate.value = preset.range[1]
  }
}

const clearDateRange = () => {
  localStartDate.value = null
  localEndDate.value = null
  selectedPreset.value = null
  emit('update:modelValue', null)
  emit('change', null)
}

const setToday = () => {
  const today = new Date()
  localStartDate.value = today
  localEndDate.value = today
  selectedPreset.value = null
}

const applyDateRange = () => {
  if (isValidRange.value) {
    const dateRange: [Date, Date] = [localStartDate.value!, localEndDate.value!]
    emit('update:modelValue', dateRange)
    emit('change', dateRange)
    menu.value = false
  }
}

// النطاقات الافتراضية | Default Ranges
const getDefaultPresetRanges = (): PresetRange[] => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const lastWeek = new Date(today)
  lastWeek.setDate(lastWeek.getDate() - 7)
  
  const lastMonth = new Date(today)
  lastMonth.setMonth(lastMonth.getMonth() - 1)
  
  const lastYear = new Date(today)
  lastYear.setFullYear(lastYear.getFullYear() - 1)

  return [
    {
      label: t('charts.today'),
      range: [today, today],
      icon: 'mdi-calendar-today'
    },
    {
      label: t('charts.yesterday'),
      range: [yesterday, yesterday],
      icon: 'mdi-calendar-minus'
    },
    {
      label: t('charts.last_7_days'),
      range: [lastWeek, today],
      icon: 'mdi-calendar-week'
    },
    {
      label: t('charts.last_30_days'),
      range: [lastMonth, today],
      icon: 'mdi-calendar-month'
    },
    {
      label: t('charts.last_year'),
      range: [lastYear, today],
      icon: 'mdi-calendar'
    }
  ]
}

// استخدام النطاقات المحددة مسبقاً أو الافتراضية
const effectivePresetRanges = computed(() => {
  return props.presetRanges || getDefaultPresetRanges()
})

// مراقبة التغييرات | Watchers
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      localStartDate.value = newValue[0]
      localEndDate.value = newValue[1]
    } else {
      localStartDate.value = null
      localEndDate.value = null
    }
  }
)

// API عامة | Public API
const getSelectedRange = () => {
  if (isValidRange.value) {
    return [localStartDate.value!, localEndDate.value!] as [Date, Date]
  }
  return null
}

const setDateRange = (startDate: Date, endDate: Date) => {
  localStartDate.value = startDate
  localEndDate.value = endDate
  selectedPreset.value = null
}

// تصدير الوظائف | Expose Functions
defineExpose({
  getSelectedRange,
  setDateRange,
  clearDateRange,
  setToday,
  applyDateRange
})
</script>

<!-- DateRangePicker مع Vuetify 3 نظيف وحديث | DateRangePicker with clean and modern Vuetify 3 -->