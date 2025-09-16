<template>
  <div
    ref="chartContainer"
    class="position-relative w-100 rounded-lg overflow-hidden"
    :class="{
      'opacity-80': loading,
      'border border-error': error
    }"
    :style="{
      height: `${height}px`,
      minHeight: `${minHeight}px`,
      backgroundColor: 'rgb(var(--v-theme-background))'
    }"
  >
    <!-- حالة التحميل | Loading State -->
    <v-overlay
      v-if="loading"
      :model-value="true"
      contained
      class="d-flex flex-column align-center justify-center"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      />
      <v-card-text class="text-center mt-4">
        <p class="text-body-1 text-medium-emphasis">
          {{ loadingText || $t('charts.loading') }}
        </p>
      </v-card-text>
    </v-overlay>

    <!-- حالة الخطأ | Error State -->
    <v-overlay
      v-else-if="error"
      :model-value="true"
      contained
      class="d-flex flex-column align-center justify-center"
    >
      <v-avatar color="error" size="64" class="mb-4">
        <v-icon icon="mdi-alert-circle" size="32" />
      </v-avatar>
      <v-card-text class="text-center">
        <p class="text-body-1 text-error mb-4">
          {{ error }}
        </p>
        <v-btn
          v-if="showRetry"
          variant="outlined"
          color="error"
          prepend-icon="mdi-refresh"
          @click="$emit('retry')"
        >
          {{ $t('common.retry') }}
        </v-btn>
      </v-card-text>
    </v-overlay>

    <!-- حالة عدم وجود بيانات | No Data State -->
    <v-overlay
      v-else-if="!hasData"
      :model-value="true"
      contained
      class="d-flex flex-column align-center justify-center"
    >
      <v-avatar color="grey-lighten-2" size="64" class="mb-4">
        <v-icon icon="mdi-chart-line" size="32" color="grey-darken-2" />
      </v-avatar>
      <v-card-text class="text-center">
        <p class="text-body-1 text-medium-emphasis mb-4">
          {{ noDataText || $t('charts.no_data') }}
        </p>
        <v-btn
          v-if="showRefresh"
          variant="outlined"
          color="primary"
          prepend-icon="mdi-refresh"
          @click="$emit('refresh')"
        >
          {{ $t('common.refresh') }}
        </v-btn>
      </v-card-text>
    </v-overlay>

    <!-- المخطط الفعلي | Actual Chart -->
    <canvas
      v-else
      ref="chartCanvas"
      :id="chartId"
      :class="canvasClass"
      :style="canvasStyle"
    />

    <!-- تلميح تفاعلي | Interactive Tooltip -->
    <v-menu
      v-if="showTooltip && tooltipData"
      :model-value="!!tooltipData"
      :style="tooltipStyle"
      location="top"
      origin="bottom"
      offset="8"
      close-on-content-click="false"
      no-click-animation
    >
      <v-card
        elevation="4"
        rounded="lg"
        class="pa-3"
        max-width="200"
      >
        <v-card-title class="text-subtitle-2 pa-0 pb-2 text-high-emphasis">
          {{ tooltipData.title }}
        </v-card-title>
        <v-card-text class="pa-0">
          <div
            v-for="(item, index) in tooltipData.items"
            :key="index"
            class="d-flex align-center ga-2 mb-1"
          >
            <v-avatar
              :color="item.color"
              size="12"
            />
            <span class="text-caption text-medium-emphasis">{{ item.label }}:</span>
            <span class="text-caption font-weight-bold text-high-emphasis">{{ item.value }}</span>
          </div>
        </v-card-text>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'

// تسجيل جميع مكونات Chart.js
Chart.register(...registerables)

interface Props {
  // البيانات الأساسية | Basic Data
  data?: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      backgroundColor?: string | string[]
      borderColor?: string | string[]
      [key: string]: any
    }>
  }
  type?: 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'radar' | 'scatter'
  options?: Record<string, any>
  
  // خيارات العرض | Display Options
  height?: number
  minHeight?: number
  width?: number | string
  responsive?: boolean
  maintainAspectRatio?: boolean
  
  // حالات المكون | Component States
  loading?: boolean
  loadingText?: string
  error?: string | null
  showRetry?: boolean
  noDataText?: string
  showRefresh?: boolean
  
  // خيارات التفاعل | Interaction Options
  showTooltip?: boolean
  enableZoom?: boolean
  enablePan?: boolean
  clickable?: boolean
  
  // خيارات التخصيص | Customization Options
  theme?: 'light' | 'dark' | 'auto'
  colors?: string[]
  animation?: boolean | Record<string, any>
  
  // خيارات متقدمة | Advanced Options
  plugins?: any[]
  chartId?: string
  canvasClass?: string
  canvasStyle?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  type: 'bar',
  height: 400,
  minHeight: 200,
  width: '100%',
  responsive: true,
  maintainAspectRatio: false,
  showRetry: true,
  showRefresh: true,
  showTooltip: true,
  enableZoom: false,
  enablePan: false,
  clickable: true,
  theme: 'auto',
  animation: true,
  chartId: `chart-${Math.random().toString(36).substr(2, 9)}`
})

interface Emits {
  retry: []
  refresh: []
  chartClick: [event: any, elements: any[]]
  chartHover: [event: any, elements: any[]]
  datasetClick: [datasetIndex: number, elementIndex: number, element: any]
  beforeRender: [chart: Chart]
  afterRender: [chart: Chart]
  resize: [chart: Chart, size: { width: number; height: number }]
}

const emit = defineEmits<Emits>()

// المراجع والمتغيرات التفاعلية | Refs and Reactive Variables
const chartContainer = ref<HTMLDivElement>()
const chartCanvas = ref<HTMLCanvasElement>()
const chartInstance = ref<Chart | null>(null)
const tooltipData = ref<any>(null)
const tooltipStyle = ref<Record<string, string>>({})

// الحاسبات | Computed Properties
const hasData = computed(() => {
  return props.data && 
         props.data.datasets && 
         props.data.datasets.length > 0 &&
         props.data.datasets.some(dataset => dataset.data && dataset.data.length > 0)
})

const chartOptions = computed(() => {
  const baseOptions = {
    responsive: props.responsive,
    maintainAspectRatio: props.maintainAspectRatio,
    animation: props.animation,
    plugins: {
      legend: {
        display: false // نستخدم Legend مخصص
      },
      tooltip: {
        enabled: !props.showTooltip, // نستخدم tooltip مخصص
        external: props.showTooltip ? customTooltip : undefined
      }
    },
    onClick: props.clickable ? handleChartClick : undefined,
    onHover: handleChartHover,
    onResize: handleChartResize,
    ...(props.options || {})
  }

  // إضافة ألوان مخصصة إذا تم توفيرها
  if (props.colors && props.data?.datasets) {
    baseOptions.datasets = props.data.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: props.colors![index % props.colors!.length],
      borderColor: props.colors![index % props.colors!.length]
    }))
  }

  return baseOptions
})

const defaultColors = computed(() => {
  return [
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
})

// الوظائف | Functions
const createChart = async () => {
  if (!chartCanvas.value || !hasData.value) return

  await nextTick()

  try {
    // تدمير المخطط الحالي إذا كان موجوداً
    if (chartInstance.value) {
      chartInstance.value.destroy()
    }

    // إنشاء مخطط جديد
    chartInstance.value = new Chart(chartCanvas.value, {
      type: props.type,
      data: {
        ...props.data,
        datasets: props.data!.datasets.map((dataset, index) => ({
          ...dataset,
          backgroundColor: dataset.backgroundColor || 
                         props.colors?.[index] || 
                         defaultColors.value[index % defaultColors.value.length],
          borderColor: dataset.borderColor || 
                      props.colors?.[index] || 
                      defaultColors.value[index % defaultColors.value.length]
        }))
      },
      options: chartOptions.value,
      plugins: props.plugins || []
    })

    emit('afterRender', chartInstance.value)
  } catch (error) {
    console.error('Error creating chart:', error)
    emit('retry')
  }
}

const updateChart = () => {
  if (!chartInstance.value || !hasData.value) {
    createChart()
    return
  }

  try {
    // تحديث البيانات
    chartInstance.value.data = {
      ...props.data,
      datasets: props.data!.datasets.map((dataset, index) => ({
        ...dataset,
        backgroundColor: dataset.backgroundColor || 
                        props.colors?.[index] || 
                        defaultColors.value[index % defaultColors.value.length],
        borderColor: dataset.borderColor || 
                    props.colors?.[index] || 
                    defaultColors.value[index % defaultColors.value.length]
      }))
    }

    // تحديث الخيارات
    chartInstance.value.options = chartOptions.value

    // إعادة رسم المخطط
    chartInstance.value.update()

    emit('afterRender', chartInstance.value)
  } catch (error) {
    console.error('Error updating chart:', error)
    createChart() // إعادة إنشاء المخطط عند الخطأ
  }
}

const destroyChart = () => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
    chartInstance.value = null
  }
}

// معالجات الأحداث | Event Handlers
const handleChartClick = (event: any, elements: any[]) => {
  emit('chartClick', event, elements)
  
  if (elements.length > 0) {
    const element = elements[0]
    emit('datasetClick', element.datasetIndex, element.index, element)
  }
}

const handleChartHover = (event: any, elements: any[]) => {
  emit('chartHover', event, elements)
}

const handleChartResize = (chart: Chart, size: { width: number; height: number }) => {
  emit('resize', chart, size)
}

const customTooltip = (context: any) => {
  const { tooltip } = context
  
  if (!tooltip || tooltip.opacity === 0) {
    tooltipData.value = null
    return
  }

  // إعداد بيانات التلميح
  tooltipData.value = {
    title: tooltip.title?.[0] || '',
    items: tooltip.dataPoints?.map((point: any) => ({
      label: point.dataset.label,
      value: point.formattedValue,
      color: point.dataset.backgroundColor
    })) || []
  }

  // إعداد موضع التلميح
  const chart = context.chart
  const canvas = chart.canvas
  const rect = canvas.getBoundingClientRect()
  
  tooltipStyle.value = {
    position: 'absolute',
    left: `${tooltip.caretX}px`,
    top: `${tooltip.caretY}px`,
    transform: 'translate(-50%, -100%)',
    pointerEvents: 'none',
    zIndex: '1000'
  }
}

// API عامة | Public API
const exportChart = (format: 'png' | 'jpg' | 'pdf' = 'png') => {
  if (!chartInstance.value) return null
  
  return chartInstance.value.toBase64Image('image/' + format, 1.0)
}

const getChart = () => chartInstance.value

const resetZoom = () => {
  if (chartInstance.value) {
    chartInstance.value.resetZoom()
  }
}

// تصدير الوظائف للمكون الأب | Expose functions to parent
defineExpose({
  chart: chartInstance,
  createChart,
  updateChart,
  destroyChart,
  exportChart,
  getChart,
  resetZoom
})

// مراقبة التغييرات | Watchers
watch(
  () => props.data,
  () => {
    if (hasData.value) {
      updateChart()
    } else {
      destroyChart()
    }
  },
  { deep: true }
)

watch(
  () => props.options,
  () => {
    if (chartInstance.value) {
      updateChart()
    }
  },
  { deep: true }
)

watch(
  () => props.type,
  () => {
    destroyChart()
    if (hasData.value) {
      createChart()
    }
  }
)

// دورة الحياة | Lifecycle
onMounted(() => {
  if (hasData.value) {
    createChart()
  }
})

onUnmounted(() => {
  destroyChart()
})
</script>

<!-- BaseChart مع Vuetify 3 نظيف وحديث | BaseChart with clean and modern Vuetify 3 -->
