<template>
  <v-card
    variant="outlined"
    class="legend-card"
  >
    <!-- العنوان إذا كان متوفراً | Title if available -->
    <v-card-title v-if="title" class="text-subtitle-2 pa-3 pb-2">
      <v-icon v-if="titleIcon" :icon="titleIcon" class="me-2" />
      {{ title }}
    </v-card-title>

    <!-- محتوى المؤشرات | Legend Content -->
    <v-card-text class="pa-3">
      <v-row 
        :class="{
          'flex-column': position === 'left' || position === 'right',
          'justify-center': align === 'center',
          'justify-start': align === 'start',
          'justify-end': align === 'end'
        }"
        dense
      >
        <v-col
          v-for="(dataset, index) in datasets"
          :key="index"
          :cols="(position === 'left' || position === 'right') ? 12 : 'auto'"
          class="pa-1"
        >
          <v-chip
            :class="{
              'opacity-50': dataset.hidden
            }"
            :style="{
              '--v-chip-color': getDatasetColor(dataset, index)
            }"
            :variant="dataset.hidden ? 'outlined' : 'elevated'"
            size="small"
            :clickable="interactive"
            @click="handleItemClick(index)"
            @mouseenter="handleItemHover(index, true)"
            @mouseleave="handleItemHover(index, false)"
          >
            <!-- لون المؤشر | Color Indicator -->
            <v-avatar
              :color="getDatasetColor(dataset, index)"
              size="12"
              class="me-2"
            />
            
            <!-- عنوان البيانات | Dataset Label -->
            <span 
              class="text-caption font-weight-medium"
              :class="{ 'text-decoration-line-through': dataset.hidden }"
            >
              {{ dataset.label }}
            </span>
            
            <!-- إحصائيات إضافية | Additional Stats -->
            <template v-if="showStats">
              <v-divider vertical class="mx-2" />
              <span class="text-caption text-primary font-weight-bold">
                {{ formatValue(calculateSum(dataset.data)) }}
              </span>
              <span v-if="showPercentage" class="text-caption text-medium-emphasis ms-1">
                ({{ calculatePercentage(dataset.data) }}%)
              </span>
            </template>
            
            <!-- أيقونة الحالة | Status Icon -->
            <v-icon
              v-if="interactive"
              :icon="dataset.hidden ? 'mdi-eye-off' : 'mdi-eye'"
              size="14"
              class="ms-1"
              :class="{ 'opacity-50': dataset.hidden }"
            />
          </v-chip>
        </v-col>
      </v-row>
    </v-card-text>
    
    <!-- إجراءات إضافية | Additional Actions -->
    <v-card-actions v-if="showActions" class="pa-3 pt-0">
      <v-spacer />
      <v-btn
        variant="text"
        size="small"
        color="primary"
        @click="showAll"
      >
        <v-icon icon="mdi-eye" class="me-1" />
        {{ $t('charts.show_all') }}
      </v-btn>
      <v-btn
        variant="text"
        size="small"
        color="error"
        @click="hideAll"
      >
        <v-icon icon="mdi-eye-off" class="me-1" />
        {{ $t('charts.hide_all') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from '#app'

interface Dataset {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
  hidden?: boolean
  [key: string]: any
}

interface Props {
  datasets: Dataset[]
  title?: string
  titleIcon?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  interactive?: boolean
  showStats?: boolean
  showPercentage?: boolean
  showActions?: boolean
  colors?: string[]
  valueFormatter?: (value: number) => string
}

const props = withDefaults(defineProps<Props>(), {
  position: 'bottom',
  align: 'center',
  interactive: true,
  showStats: false,
  showPercentage: false,
  showActions: false
})

interface Emits {
  'legend-click': [datasetIndex: number]
  'legend-hover': [datasetIndex: number, isHovering: boolean]
  'show-all': []
  'hide-all': []
}

const emit = defineEmits<Emits>()

// التدويل | Internationalization
const { t } = useI18n()

// الألوان الافتراضية | Default Colors
const defaultColors = [
  '#4f46e5', // Indigo
  '#06b6d4', // Cyan  
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#f97316', // Orange
  '#84cc16', // Lime
  '#ec4899', // Pink
  '#14b8a6'  // Teal
]

// الحاسبات | Computed Properties
const totalSum = computed(() => {
  return props.datasets.reduce((total, dataset) => {
    if (!dataset.hidden) {
      return total + calculateSum(dataset.data)
    }
    return total
  }, 0)
})

// الوظائف | Functions
const getDatasetColor = (dataset: Dataset, index: number): string => {
  // أولوية اللون: backgroundColor ثم borderColor ثم الألوان المخصصة ثم الافتراضية
  if (dataset.backgroundColor && typeof dataset.backgroundColor === 'string') {
    return dataset.backgroundColor
  }
  
  if (dataset.borderColor && typeof dataset.borderColor === 'string') {
    return dataset.borderColor
  }
  
  if (props.colors && props.colors[index]) {
    return props.colors[index]
  }
  
  return defaultColors[index % defaultColors.length]
}

const calculateSum = (data: number[]): number => {
  return data.reduce((sum, value) => sum + (value || 0), 0)
}

const calculatePercentage = (data: number[]): string => {
  const sum = calculateSum(data)
  const percentage = totalSum.value > 0 ? (sum / totalSum.value) * 100 : 0
  return percentage.toFixed(1)
}

const formatValue = (value: number): string => {
  if (props.valueFormatter) {
    return props.valueFormatter(value)
  }
  
  // تنسيق افتراضي للأرقام
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K'
  }
  
  return value.toLocaleString()
}

// معالجات الأحداث | Event Handlers
const handleItemClick = (datasetIndex: number) => {
  if (!props.interactive) return
  
  emit('legend-click', datasetIndex)
}

const handleItemHover = (datasetIndex: number, isHovering: boolean) => {
  if (!props.interactive) return
  
  emit('legend-hover', datasetIndex, isHovering)
}

const showAll = () => {
  emit('show-all')
}

const hideAll = () => {
  emit('hide-all')
}

// API عامة | Public API
const toggleDataset = (datasetIndex: number) => {
  handleItemClick(datasetIndex)
}

const getVisibleDatasets = () => {
  return props.datasets.filter(dataset => !dataset.hidden)
}

const getHiddenDatasets = () => {
  return props.datasets.filter(dataset => dataset.hidden)
}

// تصدير للمكون الأب | Expose to parent
defineExpose({
  toggleDataset,
  getVisibleDatasets,
  getHiddenDatasets,
  showAll,
  hideAll
})
</script>

<!-- تصميم Vuetify 3 نظيف بدون CSS مخصص | Clean Vuetify 3 design without custom CSS -->
