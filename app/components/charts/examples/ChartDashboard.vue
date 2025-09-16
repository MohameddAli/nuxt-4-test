<template>
  <div class="chart-dashboard">
    <!-- Header Section -->
    <v-card class="mb-6" elevation="2" rounded="lg">
      <v-card-title class="d-flex align-center bg-gradient-primary text-white pa-4">
        <v-icon icon="mdi-chart-line" class="me-3" />
        <div class="flex-grow-1">
          <h2 class="text-h5 font-weight-bold">Analytics Dashboard</h2>
          <p class="text-body-2 opacity-75 mb-0">Comprehensive data visualization</p>
        </div>
        <v-btn
          icon="mdi-refresh"
          variant="text"
          color="white"
          :loading="refreshing"
          @click="refreshAllCharts"
        />
      </v-card-title>
    </v-card>

    <!-- Chart Grid -->
    <v-row>
      <!-- Main Crypto Analytics Chart -->
      <v-col cols="12" lg="8">
        <CryptoAnalyticsExact
          :height="400"
          :loading="cryptoLoading"
          @download="handleCryptoDownload"
          @period-change="handleCryptoPeriodChange"
        />
      </v-col>

      <!-- Quick Stats -->
      <v-col cols="12" lg="4">
        <v-card class="h-100" elevation="2" rounded="lg">
          <v-card-title class="pa-4">
            <h3 class="text-h6 font-weight-medium">Quick Stats</h3>
          </v-card-title>
          <v-card-text class="pa-4">
            <div class="d-flex flex-column ga-4">
              <div class="stat-item">
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-avatar color="success" size="32" class="me-3">
                      <v-icon icon="mdi-trending-up" color="white" />
                    </v-avatar>
                    <div>
                      <p class="text-body-2 font-weight-medium mb-0">Total Volume</p>
                      <p class="text-caption text-medium-emphasis mb-0">Last 30 days</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-h6 font-weight-bold text-success mb-0">$2.4M</p>
                    <p class="text-caption text-success mb-0">+12.5%</p>
                  </div>
                </div>
              </div>

              <div class="stat-item">
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-avatar color="primary" size="32" class="me-3">
                      <v-icon icon="mdi-wallet" color="white" />
                    </v-avatar>
                    <div>
                      <p class="text-body-2 font-weight-medium mb-0">Active Wallets</p>
                      <p class="text-caption text-medium-emphasis mb-0">Currently active</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-h6 font-weight-bold text-primary mb-0">1,847</p>
                    <p class="text-caption text-primary mb-0">+8.3%</p>
                  </div>
                </div>
              </div>

              <div class="stat-item">
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-avatar color="warning" size="32" class="me-3">
                      <v-icon icon="mdi-currency-usd" color="white" />
                    </v-avatar>
                    <div>
                      <p class="text-body-2 font-weight-medium mb-0">Avg Transaction</p>
                      <p class="text-caption text-medium-emphasis mb-0">Per transaction</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-h6 font-weight-bold text-warning mb-0">$1,250</p>
                    <p class="text-caption text-warning mb-0">+5.2%</p>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Additional Charts Row -->
    <v-row class="mt-6">
      <!-- Line Chart -->
      <v-col cols="12" md="6">
        <v-card elevation="2" rounded="lg">
          <v-card-title class="d-flex align-center justify-space-between pa-4">
            <h3 class="text-h6 font-weight-medium">Revenue Trend</h3>
            <v-btn-toggle
              v-model="lineChartPeriod"
              variant="outlined"
              density="compact"
              mandatory
            >
              <v-btn value="7d" size="small">7D</v-btn>
              <v-btn value="30d" size="small">30D</v-btn>
              <v-btn value="90d" size="small">90D</v-btn>
            </v-btn-toggle>
          </v-card-title>
          <v-card-text class="pa-4">
            <BaseChart
              :data="lineChartData"
              :options="lineChartOptions"
              :type="'line'"
              :height="250"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Pie Chart -->
      <v-col cols="12" md="6">
        <v-card elevation="2" rounded="lg">
          <v-card-title class="d-flex align-center justify-space-between pa-4">
            <h3 class="text-h6 font-weight-medium">Asset Distribution</h3>
            <v-btn
              icon="mdi-download"
              variant="text"
              size="small"
              @click="exportPieChart"
            />
          </v-card-title>
          <v-card-text class="pa-4">
            <BaseChart
              :data="pieChartData"
              :options="pieChartOptions"
              :type="'doughnut'"
              :height="250"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Advanced Analytics Row -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card elevation="2" rounded="lg">
          <v-card-title class="d-flex align-center justify-space-between pa-4">
            <h3 class="text-h6 font-weight-medium">Advanced Analytics</h3>
            <div class="d-flex align-center ga-2">
              <v-select
                v-model="selectedMetric"
                :items="metricOptions"
                variant="outlined"
                density="compact"
                hide-details
                style="width: 150px"
              />
              <v-btn
                icon="mdi-cog"
                variant="text"
                size="small"
                @click="openSettings"
              />
            </div>
          </v-card-title>
          <v-card-text class="pa-4">
            <BaseChart
              :data="advancedChartData"
              :options="advancedChartOptions"
              :type="'bar'"
              :height="300"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import CryptoAnalyticsExact from './CryptoAnalyticsExact.vue'
import BaseChart from '../base/BaseChart.vue'

// State
const refreshing = ref(false)
const cryptoLoading = ref(false)
const lineChartPeriod = ref('30d')
const selectedMetric = ref('volume')

// Chart Data
const lineChartData = computed(() => ({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Revenue',
      data: [12000, 19000, 15000, 25000, 22000, 30000],
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      tension: 0.4,
      fill: true
    }
  ]
}))

const lineChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#f3f4f6'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
}))

const pieChartData = computed(() => ({
  labels: ['BTC', 'ETH', 'ADA', 'DOT', 'Other'],
  datasets: [
    {
      data: [35, 25, 20, 15, 5],
      backgroundColor: [
        '#ff9800',
        '#2196f3',
        '#4caf50',
        '#9c27b0',
        '#607d8b'
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }
  ]
}))

const pieChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const
    }
  }
}))

const advancedChartData = computed(() => ({
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  datasets: [
    {
      label: 'Personal',
      data: [45000, 52000, 48000, 61000],
      backgroundColor: '#E5E7EB'
    },
    {
      label: 'Corporate',
      data: [38000, 45000, 42000, 55000],
      backgroundColor: '#9CA3AF'
    },
    {
      label: 'Investment',
      data: [22000, 28000, 25000, 32000],
      backgroundColor: '#6B7280'
    }
  ]
}))

const advancedChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      stacked: true,
      grid: {
        display: false
      }
    },
    y: {
      stacked: true,
      beginAtZero: true,
      grid: {
        color: '#f3f4f6'
      }
    }
  },
  plugins: {
    legend: {
      position: 'top' as const
    }
  }
}))

const metricOptions = [
  { title: 'Volume', value: 'volume' },
  { title: 'Transactions', value: 'transactions' },
  { title: 'Users', value: 'users' },
  { title: 'Revenue', value: 'revenue' }
]

// Methods
const handleCryptoDownload = (period: string) => {
  console.log('Crypto download:', period)
}

const handleCryptoPeriodChange = (period: string) => {
  console.log('Crypto period change:', period)
  cryptoLoading.value = true
  setTimeout(() => {
    cryptoLoading.value = false
  }, 1000)
}

const refreshAllCharts = async () => {
  refreshing.value = true
  await new Promise(resolve => setTimeout(resolve, 2000))
  refreshing.value = false
}

const exportPieChart = () => {
  console.log('Exporting pie chart')
}

const openSettings = () => {
  console.log('Opening settings')
}

// Lifecycle
onMounted(() => {
  // Initialize dashboard
})
</script>

<style scoped>
.chart-dashboard {
  padding: 24px;
}

.stat-item {
  padding: 16px;
  border-radius: 8px;
  background: rgba(var(--v-theme-surface-variant), 0.1);
  transition: all 0.2s ease;
}

.stat-item:hover {
  background: rgba(var(--v-theme-surface-variant), 0.2);
  transform: translateY(-1px);
}

.bg-gradient-primary {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%);
}
</style>
