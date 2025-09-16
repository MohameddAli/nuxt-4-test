<template>
  <v-card elevation="2" rounded="lg" class="crypto-analytics-card">
    <!-- شريط التحكم العلوي | Top Control Bar -->
    <v-card-text class="pa-4 pb-2">
      <v-row align="center" dense>
        <!-- أزرار الفترة الزمنية | Period Buttons -->
        <v-col cols="auto">
          <v-btn-toggle
            v-model="selectedPeriod"
            mandatory
            variant="outlined"
            density="compact"
            divided
          >
            <v-btn 
              value="weekly"
              size="small"
              class="text-none"
            >
              Weekly
            </v-btn>
            <v-btn 
              value="monthly"
              size="small"
              class="text-none"
            >
              Monthly
            </v-btn>
            <v-btn 
              value="yearly"
              size="small"
              class="text-none"
            >
              Yearly
            </v-btn>
          </v-btn-toggle>
        </v-col>

        <v-spacer />

        <!-- نطاق التاريخ | Date Range -->
        <v-col cols="auto">
          <v-chip
            variant="outlined"
            size="small"
            class="me-2"
          >
            {{ formatDateRange(dateRange) }}
          </v-chip>
        </v-col>

        <!-- زر التحميل | Download Button -->
        <v-col cols="auto">
          <v-btn
            color="primary"
            variant="elevated"
            size="small"
            class="text-none"
            @click="handleDownload"
          >
            <v-icon icon="mdi-download" class="me-1" />
            Download
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- محتوى المخطط | Chart Content -->
    <v-card-text class="pa-4 pt-2">
      <!-- العنوان والمؤشرات | Title and Legend -->
      <v-row align="center" class="mb-4">
        <v-col cols="auto">
          <h3 class="text-h6 font-weight-medium text-grey-darken-2">
            Crypto Analytics
          </h3>
        </v-col>
        
        <v-spacer />
        
        <!-- المؤشرات | Legend -->
        <v-col cols="auto">
          <div class="d-flex align-center ga-4">
            <div 
              v-for="(dataset, index) in legendItems" 
              :key="index"
              class="d-flex align-center ga-1"
            >
              <div
                class="legend-indicator"
                :style="{ backgroundColor: dataset.color }"
              />
              <span class="text-caption text-grey-darken-1">
                {{ dataset.label }}
              </span>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- المخطط | Chart -->
      <div class="chart-wrapper" :style="{ height: `${chartHeight}px` }">
        <BaseChart
          ref="chartRef"
          :data="chartData"
          :options="chartOptions"
          :type="'bar'"
          :height="chartHeight"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import BaseChart from '../base/BaseChart.vue'

interface Props {
  height?: number
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  loading: false
})

interface Emits {
  download: [period: string]
  periodChange: [period: string]
}

const emit = defineEmits<Emits>()

// المتغيرات التفاعلية | Reactive Variables
const chartRef = ref()
const selectedPeriod = ref('monthly')
const dateRange = ref([new Date('2024-06-11'), new Date('2024-06-22')])

// الألوان الدقيقة من الصورة | Exact colors from image
const colors = {
  personal: '#E5E7EB',     // Light gray for Personal Wallet
  corporate: '#9CA3AF',    // Medium gray for Corporate Wallet  
  investment: '#6B7280'    // Dark gray for Investment Wallet
}

// بيانات المخطط | Chart Data
const chartData = computed(() => ({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Personal Wallet',
      data: [5000, 9500, 5000, 4000, 6000, 8000, 12000, 15000, 18000, 5000, 12000, 7000],
      backgroundColor: colors.personal,
      borderWidth: 0,
      barThickness: 24
    },
    {
      label: 'Corporate Wallet', 
      data: [4000, 9000, 10000, 8000, 10000, 2000, 2000, 7000, 7000, 18000, 15000, 10000],
      backgroundColor: colors.corporate,
      borderWidth: 0,
      barThickness: 24
    },
    {
      label: 'Investment Wallet',
      data: [1000, 5000, 4000, 7000, 6000, 8000, 12000, 8000, 0, 2000, 0, 10000],
      backgroundColor: colors.investment,
      borderWidth: 0,
      barThickness: 24
    }
  ]
}))

// عناصر المؤشرات | Legend Items
const legendItems = computed(() => [
  {
    label: 'Personal Wallet',
    color: colors.personal
  },
  {
    label: 'Corporate Wallet', 
    color: colors.corporate
  },
  {
    label: 'Investment Wallet',
    color: colors.investment
  }
])

// ارتفاع المخطط | Chart Height
const chartHeight = computed(() => props.height)

// خيارات المخطط | Chart Options
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      stacked: true,
      grid: {
        display: false
      },
      ticks: {
        color: '#9CA3AF',
        font: {
          size: 12
        }
      }
    },
    y: {
      stacked: true,
      beginAtZero: true,
      max: 30000,
      grid: {
        color: '#F3F4F6',
        drawBorder: false
      },
      ticks: {
        stepSize: 5000,
        color: '#9CA3AF',
        font: {
          size: 12
        },
        callback: function(value: any) {
          return (value / 1000) + 'K'
        }
      }
    }
  },
  plugins: {
    legend: {
      display: false // نستخدم legend مخصص
    },
    tooltip: {
      backgroundColor: '#1F2937',
      titleColor: '#F9FAFB',
      bodyColor: '#F9FAFB',
      borderColor: '#374151',
      borderWidth: 1,
      cornerRadius: 6,
      callbacks: {
        label: function(context: any) {
          return `${context.dataset.label}: ${(context.parsed.y / 1000).toFixed(1)}K`
        }
      }
    }
  },
  interaction: {
    mode: 'index' as const,
    intersect: false
  },
  elements: {
    bar: {
      borderRadius: 0
    }
  }
}))

// الوظائف | Functions
const formatDateRange = (range: Date[]) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit', 
      year: 'numeric'
    })
  }
  
  return `${formatDate(range[0])} - ${formatDate(range[1])}`
}

const handleDownload = () => {
  emit('download', selectedPeriod.value)
}

const handlePeriodChange = () => {
  emit('periodChange', selectedPeriod.value)
}

// مراقبة تغيير الفترة | Watch period change
watch(() => selectedPeriod.value, handlePeriodChange)

// API عامة | Public API
const exportChart = (format: string = 'png') => {
  if (chartRef.value) {
    return chartRef.value.exportChart(format)
  }
}

const refreshData = () => {
  // تحديث البيانات | Refresh data
}

// تصدير الوظائف | Expose functions
defineExpose({
  exportChart,
  refreshData
})

onMounted(() => {
  // تهيئة المخطط | Initialize chart
})
</script>

<style scoped>
.crypto-analytics-card {
  background: #FFFFFF;
}

.legend-indicator {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.chart-wrapper {
  position: relative;
  width: 100%;
}

/* تحسين أزرار الفترة | Period buttons styling */
:deep(.v-btn-toggle) {
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  overflow: hidden;
}

:deep(.v-btn-toggle .v-btn) {
  border: none !important;
  border-radius: 0 !important;
  color: #6B7280;
  font-weight: 500;
}

:deep(.v-btn-toggle .v-btn--active) {
  background-color: #F3F4F6 !important;
  color: #374151 !important;
}

/* تحسين شريحة التاريخ | Date chip styling */
:deep(.v-chip--variant-outlined) {
  border-color: #E5E7EB;
  color: #6B7280;
}
</style>
