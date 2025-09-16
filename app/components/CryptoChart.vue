<template>
  <v-card class="crypto-chart-card" elevation="0" rounded="xl">
    <v-card-title class="chart-header pa-6 pb-4">
      <div class="d-flex align-center justify-space-between w-100">
        <div>
          <h3 class="text-h6 font-weight-bold mb-1">Crypto Analytics</h3>
          <p class="text-body-2 text-medium-emphasis mb-0">Portfolio performance overview</p>
        </div>
        <div class="chart-controls">
          <v-btn-toggle
            v-model="selectedPeriod"
            variant="outlined"
            density="compact"
            mandatory
            rounded="xl"
            class="chart-period-toggle"
          >
            <v-btn 
              v-for="period in timePeriods" 
              :key="period.value"
              :value="period.value"
              size="small"
              class="period-btn"
            >
              {{ period.label }}
            </v-btn>
          </v-btn-toggle>
        </div>
      </div>
    </v-card-title>

    <v-card-text class="pa-6 pt-2">
      <!-- Chart Value Display -->
      <div class="chart-value-section mb-6">
        <div class="d-flex align-center mb-2">
          <h2 class="text-h4 font-weight-bold text-primary mr-3">
            ${{ formatCurrency(currentValue) }}
          </h2>
          <v-chip
            :color="trendColor"
            variant="tonal"
            size="small"
            :prepend-icon="trendIcon"
            class="trend-chip"
          >
            {{ trendPercentage }}%
          </v-chip>
        </div>
        <p class="text-body-2 text-medium-emphasis">
          {{ getPeriodDescription() }}
        </p>
      </div>

      <!-- Chart Container -->
      <div class="chart-container" ref="chartContainer">
        <canvas ref="chartCanvas" :height="chartHeight"></canvas>
      </div>

      <!-- Chart Legend -->
      <div class="chart-legend mt-4">
        <div class="d-flex align-center justify-center flex-wrap">
          <div 
            v-for="legend in chartLegends" 
            :key="legend.label"
            class="legend-item d-flex align-center mr-6 mb-2"
          >
            <div 
              class="legend-color mr-2"
              :style="{ backgroundColor: legend.color }"
            ></div>
            <span class="text-caption text-medium-emphasis">{{ legend.label }}</span>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Props
interface Props {
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 300
})

// Refs
const chartCanvas = ref<HTMLCanvasElement>()
const chartContainer = ref<HTMLElement>()
const chart = ref<ChartJS | null>(null)

// State
const selectedPeriod = ref('monthly')
const currentValue = ref(47832.45)
const trendPercentage = ref(12.5)

// Time periods
const timePeriods = ref([
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' }
])

// Chart data for different periods
const chartDataSets = {
  daily: {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    data: [45200, 46800, 45900, 47200, 48100, 47800, 47832],
    trend: 5.8
  },
  weekly: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data: [44500, 45200, 46100, 47200, 46800, 47500, 47832],
    trend: 7.5
  },
  monthly: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    data: [38000, 39500, 41200, 43800, 45200, 44800, 46200, 47100, 46800, 47500, 47200, 47832],
    trend: 12.5
  },
  yearly: {
    labels: ['2020', '2021', '2022', '2023', '2024'],
    data: [28000, 35000, 42000, 45000, 47832],
    trend: 70.8
  }
}

// Computed
const chartHeight = computed(() => props.height)

const trendColor = computed(() => {
  return trendPercentage.value >= 0 ? 'success' : 'error'
})

const trendIcon = computed(() => {
  return trendPercentage.value >= 0 ? 'mdi-trending-up' : 'mdi-trending-down'
})

const chartLegends = computed(() => [
  { label: 'Portfolio Value', color: '#1976D2' },
  { label: 'Trend Line', color: '#4CAF50' }
])

// Methods
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

const getPeriodDescription = (): string => {
  const descriptions = {
    daily: 'Last 24 hours performance',
    weekly: 'Last 7 days performance',
    monthly: 'Last 12 months performance',
    yearly: 'Last 5 years performance'
  }
  return descriptions[selectedPeriod.value as keyof typeof descriptions]
}

const createChart = () => {
  if (!chartCanvas.value) return

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  // Destroy existing chart
  if (chart.value) {
    chart.value.destroy()
  }

  const currentData = chartDataSets[selectedPeriod.value as keyof typeof chartDataSets]
  
  chart.value = new ChartJS(ctx, {
    type: 'line',
    data: {
      labels: currentData.labels,
      datasets: [
        {
          label: 'Portfolio Value',
          data: currentData.data,
          borderColor: '#1976D2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#1976D2',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: '#1976D2',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#1976D2',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            title: (context) => {
              return `${context[0].label}`
            },
            label: (context) => {
              return `$${formatCurrency(context.parsed.y)}`
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          border: {
            display: false
          },
          ticks: {
            color: '#9E9E9E',
            font: {
              size: 12,
              weight: '500'
            }
          }
        },
        y: {
          grid: {
            color: 'rgba(158, 158, 158, 0.1)',
            drawBorder: false
          },
          border: {
            display: false
          },
          ticks: {
            color: '#9E9E9E',
            font: {
              size: 12,
              weight: '500'
            },
            callback: function(value) {
              return '$' + (value as number / 1000).toFixed(0) + 'k'
            }
          }
        }
      },
      elements: {
        point: {
          hoverRadius: 8
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
      }
    }
  })
}

const updateChart = () => {
  const currentData = chartDataSets[selectedPeriod.value as keyof typeof chartDataSets]
  trendPercentage.value = currentData.trend
  
  nextTick(() => {
    createChart()
  })
}

// Watchers
watch(selectedPeriod, updateChart)

// Lifecycle
onMounted(() => {
  nextTick(() => {
    createChart()
  })
})

onUnmounted(() => {
  if (chart.value) {
    chart.value.destroy()
  }
})
</script>

<style scoped>
.crypto-chart-card {
  border: 1px solid rgba(var(--v-border-color), 0.08);
  background: rgb(var(--v-theme-surface));
  transition: all 0.3s ease;
}

.crypto-chart-card:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.chart-header {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.06);
}

.chart-period-toggle {
  border: 1px solid rgba(var(--v-border-color), 0.12);
  border-radius: 24px !important;
  overflow: hidden;
}

.period-btn {
  text-transform: none;
  font-weight: 500;
  font-size: 0.875rem;
  border-radius: 20px !important;
  margin: 2px;
}

.chart-value-section {
  padding: 16px 0;
}

.trend-chip {
  font-weight: 600;
  font-size: 0.75rem;
}

.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.02), rgba(var(--v-theme-secondary), 0.01));
  border-radius: 12px;
  padding: 16px;
}

.chart-legend {
  padding-top: 16px;
  border-top: 1px solid rgba(var(--v-border-color), 0.06);
}

.legend-item {
  align-items: center;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

/* Theme-specific adjustments removed */

/* Responsive design */
@media (max-width: 960px) {
  .chart-header {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  .chart-controls {
    margin-top: 16px;
    width: 100%;
  }
  
  .chart-period-toggle {
    width: 100%;
  }
  
  .period-btn {
    flex: 1;
  }
}

@media (max-width: 600px) {
  .chart-container {
    height: 250px;
    padding: 12px;
  }
  
  .legend-item {
    margin-right: 16px !important;
    margin-bottom: 8px;
  }
}
</style>