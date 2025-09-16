<template>
  <v-card
    :class="{
      'position-fixed top-0 left-0 w-100 h-100': isFullscreen,
      'opacity-80': loading
    }"
    :style="{
      zIndex: isFullscreen ? 9999 : 'unset'
    }"
    elevation="3"
    rounded="lg"
  >
    <!-- رأس المخطط | Chart Header -->
    <v-card-title class="d-flex align-center bg-gradient-primary text-white pa-4">
      <v-icon 
        v-if="icon" 
        :icon="icon" 
        class="me-3" 
        :color="iconColor || 'white'"
      />
      <div class="flex-grow-1">
        <h2 class="text-h6 font-weight-bold">{{ title }}</h2>
        <v-chip
          v-if="subtitle"
          variant="outlined"
          size="small"
          color="white"
          class="mt-1"
          text-color="white"
        >
          {{ subtitle }}
        </v-chip>
      </div>
      
      <!-- إجراءات الرأس | Header Actions -->
      <div class="d-flex align-center ga-1">
        <slot name="header-actions" />
        
        <!-- زر التحديث | Refresh Button -->
        <v-btn
          v-if="showRefresh"
          icon="mdi-refresh"
          variant="text"
          size="small"
          color="white"
          :loading="refreshing"
          @click="handleRefresh"
        />
        
        <!-- زر الملء الشاشة | Fullscreen Button -->
        <v-btn
          v-if="showFullscreen"
          :icon="isFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'"
          variant="text"
          size="small"
          color="white"
          @click="toggleFullscreen"
        />
        
        <!-- زر الإعدادات | Settings Button -->
        <v-btn
          v-if="showSettings"
          icon="mdi-cog"
          variant="text"
          size="small"
          color="white"
          @click="settingsDialog = true"
        />
      </div>
    </v-card-title>
    
    <!-- ضوابط المخطط | Chart Controls -->
    <v-card-text v-if="hasControls" class="bg-surface pa-4 border-b">
      <v-row align="center" dense>
        <!-- اختيار الفترة | Period Selector -->
        <v-col v-if="showPeriodSelector" cols="12" sm="auto">
          <PeriodSelector
            v-model="selectedPeriod"
            :periods="availablePeriods"
            :labels="periodLabels"
            variant="outlined"
            density="compact"
            @change="handlePeriodChange"
          />
        </v-col>
        
        <!-- اختيار التاريخ | Date Picker -->
        <v-col v-if="showDatePicker" cols="12" sm="auto">
          <DateRangePicker
            v-model="selectedDateRange"
            :placeholder="$t('charts.select_date_range')"
            :max-date="maxDate"
            :preset-ranges="presetRanges"
            format="DD/MM/YYYY"
            density="compact"
            @change="handleDateRangeChange"
          />
        </v-col>
        
        <!-- مرشحات إضافية | Additional Filters -->
        <v-col v-if="$slots.filters" cols="12" sm="auto">
          <slot name="filters" />
        </v-col>
        
        <v-spacer />
        
        <!-- تصدير المخطط | Chart Export -->
        <v-col v-if="showExport" cols="12" sm="auto">
          <ChartExporter
            :chart-ref="chartRef"
            :formats="exportFormats"
            :filename="exportFilename"
            :title="title"
            @export-start="handleExportStart"
            @export-complete="handleExportComplete"
            @export-error="handleExportError"
          />
        </v-col>
      </v-row>
    </v-card-text>
    
    <!-- المخطط الرئيسي | Main Chart -->
    <v-card-text class="pa-6 bg-background">
      <BaseChart
        ref="chartRef"
        :data="processedData"
        :type="chartType"
        :options="chartOptions"
        :height="chartHeight"
        :loading="loading"
        :error="error"
        :show-retry="showRetry"
        :no-data-text="noDataText"
        :show-refresh="showRefresh"
        :theme="theme"
        :colors="colors"
        :animation="animation"
        @retry="handleRetry"
        @refresh="handleRefresh"
        @chart-click="handleChartClick"
        @chart-hover="handleChartHover"
        @dataset-click="handleDatasetClick"
      />
    </v-card-text>
    
    <!-- مؤشرات المخطط | Chart Legend -->
    <v-card-text v-if="showLegend && processedData?.datasets" class="bg-surface border-t pa-4">
      <ChartLegend
        :datasets="processedData.datasets"
        :position="legendPosition"
        :align="legendAlign"
        :interactive="interactiveLegend"
        title="البيانات"
        title-icon="mdi-chart-line"
        @legend-click="handleLegendClick"
        @legend-hover="handleLegendHover"
      />
    </v-card-text>
    
    <!-- تذييل إضافي | Footer Content -->
    <v-card-text v-if="$slots.footer" class="bg-surface border-t pa-4">
      <slot name="footer" />
    </v-card-text>
    
    <!-- حوار الإعدادات | Settings Dialog -->
    <v-dialog v-model="settingsDialog" max-width="500" persistent>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center bg-primary text-white pa-4">
          <v-icon icon="mdi-cog" class="me-2" />
          {{ $t('charts.settings') }}
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            color="white"
            @click="settingsDialog = false"
          />
        </v-card-title>
        <v-card-text class="pa-6">
          <ChartSettings
            v-model="chartSettings"
            @update:model-value="handleSettingsChange"
          />
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn 
            variant="outlined"
            @click="settingsDialog = false"
          >
            <v-icon icon="mdi-close" class="me-1" />
            {{ $t('common.close') }}
          </v-btn>
          <v-btn 
            color="primary" 
            variant="elevated"
            @click="applySettings"
          >
            <v-icon icon="mdi-check" class="me-1" />
            {{ $t('common.apply') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from '#app'

// استيراد المكونات
import BaseChart from './BaseChart.vue'
import ChartLegend from './ChartLegend.vue'
import PeriodSelector from '../controls/PeriodSelector.vue'
import DateRangePicker from '../controls/DateRangePicker.vue'
import ChartExporter from '../controls/ChartExporter.vue'
import ChartSettings from '../controls/ChartSettings.vue'

interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    hidden?: boolean
    [key: string]: any
  }>
}

interface Props {
  // البيانات الأساسية | Basic Data
  title: string
  subtitle?: string
  icon?: string
  iconColor?: string
  data?: ChartData
  chartType?: 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'radar' | 'scatter'
  height?: number
  
  // حالات المكون | Component States
  loading?: boolean
  error?: string | null
  showRetry?: boolean
  noDataText?: string
  
  // ضوابط العرض | Display Controls
  showPeriodSelector?: boolean
  showDatePicker?: boolean
  showExport?: boolean
  showLegend?: boolean
  showRefresh?: boolean
  showFullscreen?: boolean
  showSettings?: boolean
  
  // خيارات الفترة | Period Options
  defaultPeriod?: string
  availablePeriods?: string[]
  periodLabels?: Record<string, string>
  
  // خيارات التاريخ | Date Options
  maxDate?: Date
  presetRanges?: Array<{ label: string; range: [Date, Date] }>
  
  // خيارات التصدير | Export Options
  exportFormats?: string[]
  exportFilename?: string
  
  // خيارات المؤشرات | Legend Options
  legendPosition?: 'top' | 'bottom' | 'left' | 'right'
  legendAlign?: 'start' | 'center' | 'end'
  interactiveLegend?: boolean
  
  // خيارات التخصيص | Customization Options
  theme?: 'light' | 'dark' | 'auto'
  colors?: string[]
  animation?: boolean | Record<string, any>
  options?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  chartType: 'bar',
  height: 400,
  showRetry: true,
  showPeriodSelector: false,
  showDatePicker: false,
  showExport: false,
  showLegend: true,
  showRefresh: true,
  showFullscreen: false,
  showSettings: false,
  defaultPeriod: 'monthly',
  availablePeriods: () => ['weekly', 'monthly', 'yearly'],
  exportFormats: () => ['png', 'jpg', 'pdf', 'csv'],
  legendPosition: 'bottom',
  legendAlign: 'center',
  interactiveLegend: true,
  theme: 'auto',
  animation: true
})

interface Emits {
  'period-change': [period: string]
  'date-range-change': [dateRange: [Date, Date]]
  'export': [format: string]
  'refresh': []
  'retry': []
  'chart-click': [event: any, elements: any[]]
  'chart-hover': [event: any, elements: any[]]
  'dataset-click': [datasetIndex: number, elementIndex: number, element: any]
  'legend-click': [datasetIndex: number]
  'legend-hover': [datasetIndex: number]
  'settings-change': [settings: Record<string, any>]
}

const emit = defineEmits<Emits>()

// المراجع والمتغيرات | Refs and Variables
const { t } = useI18n()
const chartRef = ref()
const selectedPeriod = ref(props.defaultPeriod)
const selectedDateRange = ref<[Date, Date] | null>(null)
const isFullscreen = ref(false)
const settingsDialog = ref(false)
const refreshing = ref(false)
const chartSettings = ref({})

// الحاسبات | Computed Properties
const hasControls = computed(() => {
  return props.showPeriodSelector || 
         props.showDatePicker || 
         props.showExport ||
         !!slots.filters
})

const chartHeight = computed(() => {
  return isFullscreen.value ? window.innerHeight - 200 : props.height
})

const periodLabels = computed(() => {
  return props.periodLabels || {
    weekly: t('periods.weekly'),
    monthly: t('periods.monthly'),
    yearly: t('periods.yearly'),
    daily: t('periods.daily'),
    quarterly: t('periods.quarterly')
  }
})

const chartOptions = computed(() => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // نستخدم مؤشر مخصص
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 6,
        displayColors: true
      }
    },
    animation: props.animation
  }

  // دمج الخيارات المخصصة
  return { ...baseOptions, ...(props.options || {}) }
})

const processedData = computed(() => {
  if (!props.data) return null
  
  return {
    ...props.data,
    datasets: props.data.datasets.map((dataset, index) => {
      // تطبيق الألوان المخصصة إذا لم تكن محددة
      if (!dataset.backgroundColor && props.colors) {
        dataset.backgroundColor = props.colors[index % props.colors.length]
        dataset.borderColor = props.colors[index % props.colors.length]
      }
      
      return dataset
    })
  }
})

// المتغيرات التفاعلية | Reactive Variables
const slots = useSlots()

// الوظائف | Functions
const handlePeriodChange = (period: string) => {
  selectedPeriod.value = period
  emit('period-change', period)
}

const handleDateRangeChange = (dateRange: [Date, Date]) => {
  selectedDateRange.value = dateRange
  emit('date-range-change', dateRange)
}

const handleRefresh = async () => {
  refreshing.value = true
  try {
    emit('refresh')
    await new Promise(resolve => setTimeout(resolve, 1000)) // محاكاة تحميل
  } finally {
    refreshing.value = false
  }
}

const handleRetry = () => {
  emit('retry')
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  
  if (isFullscreen.value) {
    document.documentElement.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}

// معالجات التصدير | Export Handlers
const handleExportStart = () => {
  console.log('Export started')
}

const handleExportComplete = (result: any) => {
  console.log('Export completed:', result)
}

const handleExportError = (error: any) => {
  console.error('Export error:', error)
}

// معالجات المخطط | Chart Handlers
const handleChartClick = (event: any, elements: any[]) => {
  emit('chart-click', event, elements)
}

const handleChartHover = (event: any, elements: any[]) => {
  emit('chart-hover', event, elements)
}

const handleDatasetClick = (datasetIndex: number, elementIndex: number, element: any) => {
  emit('dataset-click', datasetIndex, elementIndex, element)
}

// معالجات المؤشرات | Legend Handlers
const handleLegendClick = (datasetIndex: number) => {
  // تبديل إظهار/إخفاء البيانات
  if (chartRef.value && processedData.value) {
    const chart = chartRef.value.getChart()
    if (chart) {
      chart.toggleDataVisibility(datasetIndex)
      chart.update()
    }
  }
  
  emit('legend-click', datasetIndex)
}

const handleLegendHover = (datasetIndex: number) => {
  emit('legend-hover', datasetIndex)
}

// معالجات الإعدادات | Settings Handlers
const handleSettingsChange = (settings: Record<string, any>) => {
  chartSettings.value = settings
  emit('settings-change', settings)
}

const applySettings = () => {
  // تطبيق الإعدادات على المخطط
  if (chartRef.value) {
    chartRef.value.updateChart()
  }
  settingsDialog.value = false
}

// API عامة | Public API
const exportChart = (format: string = 'png') => {
  if (chartRef.value) {
    return chartRef.value.exportChart(format)
  }
  return null
}

const getChartInstance = () => {
  return chartRef.value?.getChart()
}

const updateChartData = (newData: ChartData) => {
  // تحديث بيانات المخطط من الخارج
  if (chartRef.value) {
    chartRef.value.updateChart()
  }
}

// تصدير للمكون الأب | Expose to parent
defineExpose({
  exportChart,
  getChartInstance,
  updateChartData,
  toggleFullscreen,
  refresh: handleRefresh
})

// مراقبة التغييرات | Watchers
watch(
  () => props.data,
  (newData) => {
    if (newData && chartRef.value) {
      chartRef.value.updateChart()
    }
  },
  { deep: true }
)

// دورة الحياة | Lifecycle
onMounted(() => {
  // تهيئة المكون عند التحميل
})
</script>

<!-- Vuetify 3 نظيف وحديث بدون CSS مخصص | Clean and modern Vuetify 3 without custom CSS -->
