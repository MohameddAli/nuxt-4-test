<template>
  <div class="crypto-analytics">
    <ChartContainer
      :title="$t('charts.crypto_analytics')"
      subtitle="Moamalat Analytics"
      icon="mdi-bitcoin"
      icon-color="orange"
      :data="chartData"
      chart-type="bar"
      :height="400"
      :loading="loading"
      :error="error"
      :show-period-selector="true"
      :show-date-picker="true"
      :show-export="true"
      :show-legend="true"
      :show-refresh="true"
      :default-period="'monthly'"
      :available-periods="['weekly', 'monthly', 'yearly']"
      :export-formats="['png', 'jpg', 'pdf', 'csv']"
      :export-filename="'crypto-analytics'"
      :colors="cryptoColors"
      @period-change="handlePeriodChange"
      @date-range-change="handleDateRangeChange"
      @refresh="handleRefresh"
      @export="handleExport"
    >
      <!-- إجراءات إضافية في الرأس | Additional Header Actions -->
      <template #header-actions>
        <v-btn
          icon="mdi-chart-line-variant"
          variant="text"
          size="small"
          @click="toggleChartType"
        />
        <v-btn
          icon="mdi-filter-variant"
          variant="text"
          size="small"
          @click="showFilters = !showFilters"
        />
      </template>
      
      <!-- مرشحات إضافية | Additional Filters -->
      <template #filters>
        <v-expand-transition>
          <div v-if="showFilters" class="crypto-filters">
            <v-select
              v-model="selectedWalletTypes"
              :items="walletTypeOptions"
              :label="$t('charts.wallet_types')"
              multiple
              chips
              variant="outlined"
              density="compact"
              @update:model-value="handleWalletTypeChange"
            />
          </div>
        </v-expand-transition>
      </template>
      
      <!-- معلومات إضافية في التذييل | Additional Footer Info -->
      <template #footer>
        <div class="crypto-summary">
          <v-row>
            <v-col cols="12" md="4">
              <v-card variant="tonal" color="primary">
                <v-card-text>
                  <div class="text-h4 text-primary">{{ formatCurrency(totalVolume) }}</div>
                  <div class="text-subtitle-2">{{ $t('charts.total_volume') }}</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card variant="tonal" color="success">
                <v-card-text>
                  <div class="text-h4 text-success">+{{ growthPercentage }}%</div>
                  <div class="text-subtitle-2">{{ $t('charts.growth_rate') }}</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card variant="tonal" color="info">
                <v-card-text>
                  <div class="text-h4 text-info">{{ activeWallets }}</div>
                  <div class="text-subtitle-2">{{ $t('charts.active_wallets') }}</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          
          <!-- معلومات التحديث | Update Information -->
          <v-alert
            v-if="lastUpdated"
            type="info"
            variant="tonal"
            class="mt-4"
            icon="mdi-clock-outline"
          >
            {{ $t('charts.last_updated') }}: {{ formatDate(lastUpdated) }}
          </v-alert>
        </div>
      </template>
    </ChartContainer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from '#app'

// استيراد المكونات
import ChartContainer from '../base/ChartContainer.vue'

interface CryptoData {
  month: string
  personalWallet: number
  corporateWallet: number
  investmentWallet: number
}

interface Props {
  // خيارات البيانات | Data Options
  apiUrl?: string
  autoRefresh?: boolean
  refreshInterval?: number
  
  // خيارات العرض | Display Options
  showSummary?: boolean
  showFilters?: boolean
  
  // خيارات التخصيص | Customization Options
  colors?: string[]
  currency?: string
}

const props = withDefaults(defineProps<Props>(), {
  autoRefresh: true,
  refreshInterval: 30000, // 30 seconds
  showSummary: true,
  showFilters: true,
  currency: 'USD'
})

interface Emits {
  'data-loaded': [data: CryptoData[]]
  'period-changed': [period: string]
  'filters-changed': [filters: any]
}

const emit = defineEmits<Emits>()

// التدويل | Internationalization
const { t } = useI18n()

// المتغيرات التفاعلية | Reactive Variables
const loading = ref(false)
const error = ref<string | null>(null)
const showFilters = ref(false)
const currentPeriod = ref('monthly')
const currentChartType = ref('bar')
const selectedWalletTypes = ref(['personal', 'corporate', 'investment'])
const lastUpdated = ref<Date | null>(null)
const refreshTimer = ref<NodeJS.Timeout | null>(null)

// بيانات وهمية للعرض | Mock Data for Demo
const rawData = ref<CryptoData[]>([
  {
    month: 'Jan',
    personalWallet: 5000,
    corporateWallet: 8000,
    investmentWallet: 2000
  },
  {
    month: 'Feb',
    personalWallet: 9000,
    corporateWallet: 15000,
    investmentWallet: 3000
  },
  {
    month: 'Mar',
    personalWallet: 7000,
    corporateWallet: 12000,
    investmentWallet: 4000
  },
  {
    month: 'Apr',
    personalWallet: 4000,
    corporateWallet: 8000,
    investmentWallet: 7000
  },
  {
    month: 'May',
    personalWallet: 16000,
    corporateWallet: 6000,
    investmentWallet: 9000
  },
  {
    month: 'Jun',
    personalWallet: 8000,
    corporateWallet: 10000,
    investmentWallet: 6000
  },
  {
    month: 'Jul',
    personalWallet: 12000,
    corporateWallet: 14000,
    investmentWallet: 8000
  },
  {
    month: 'Aug',
    personalWallet: 15000,
    corporateWallet: 8000,
    investmentWallet: 12000
  },
  {
    month: 'Sep',
    personalWallet: 17000,
    corporateWallet: 7000,
    investmentWallet: 10000
  },
  {
    month: 'Oct',
    personalWallet: 5000,
    corporateWallet: 16000,
    investmentWallet: 4000
  },
  {
    month: 'Nov',
    personalWallet: 12000,
    corporateWallet: 11000,
    investmentWallet: 15000
  },
  {
    month: 'Dec',
    personalWallet: 7000,
    corporateWallet: 9000,
    investmentWallet: 11000
  }
])

// الألوان المخصصة | Custom Colors
const cryptoColors = computed(() => {
  return props.colors || [
    '#4f46e5', // Indigo - Personal Wallet
    '#06b6d4', // Cyan - Corporate Wallet
    '#10b981'  // Emerald - Investment Wallet
  ]
})

// خيارات أنواع المحافظ | Wallet Type Options
const walletTypeOptions = computed(() => [
  {
    title: t('wallet_types.personal'),
    value: 'personal'
  },
  {
    title: t('wallet_types.corporate'),
    value: 'corporate'
  },
  {
    title: t('wallet_types.investment'),
    value: 'investment'
  }
])

// بيانات المخطط المعالجة | Processed Chart Data
const chartData = computed(() => {
  const filteredData = rawData.value
  const labels = filteredData.map(item => item.month)
  
  const datasets = []
  
  if (selectedWalletTypes.value.includes('personal')) {
    datasets.push({
      label: t('wallet_types.personal'),
      data: filteredData.map(item => item.personalWallet),
      backgroundColor: cryptoColors.value[0],
      borderColor: cryptoColors.value[0],
      borderWidth: 2
    })
  }
  
  if (selectedWalletTypes.value.includes('corporate')) {
    datasets.push({
      label: t('wallet_types.corporate'),
      data: filteredData.map(item => item.corporateWallet),
      backgroundColor: cryptoColors.value[1],
      borderColor: cryptoColors.value[1],
      borderWidth: 2
    })
  }
  
  if (selectedWalletTypes.value.includes('investment')) {
    datasets.push({
      label: t('wallet_types.investment'),
      data: filteredData.map(item => item.investmentWallet),
      backgroundColor: cryptoColors.value[2],
      borderColor: cryptoColors.value[2],
      borderWidth: 2
    })
  }
  
  return {
    labels,
    datasets
  }
})

// الإحصائيات المحسوبة | Computed Statistics
const totalVolume = computed(() => {
  return rawData.value.reduce((total, item) => {
    let sum = 0
    if (selectedWalletTypes.value.includes('personal')) sum += item.personalWallet
    if (selectedWalletTypes.value.includes('corporate')) sum += item.corporateWallet
    if (selectedWalletTypes.value.includes('investment')) sum += item.investmentWallet
    return total + sum
  }, 0)
})

const growthPercentage = computed(() => {
  if (rawData.value.length < 2) return 0
  
  const currentMonth = rawData.value[rawData.value.length - 1]
  const previousMonth = rawData.value[rawData.value.length - 2]
  
  const currentTotal = getCurrentMonthTotal(currentMonth)
  const previousTotal = getCurrentMonthTotal(previousMonth)
  
  if (previousTotal === 0) return 0
  
  const growth = ((currentTotal - previousTotal) / previousTotal) * 100
  return Math.round(growth * 10) / 10
})

const activeWallets = computed(() => {
  return selectedWalletTypes.value.length
})

// الوظائف المساعدة | Helper Functions
const getCurrentMonthTotal = (monthData: CryptoData): number => {
  let total = 0
  if (selectedWalletTypes.value.includes('personal')) total += monthData.personalWallet
  if (selectedWalletTypes.value.includes('corporate')) total += monthData.corporateWallet
  if (selectedWalletTypes.value.includes('investment')) total += monthData.investmentWallet
  return total
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: props.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// معالجات الأحداث | Event Handlers
const handlePeriodChange = async (period: string) => {
  currentPeriod.value = period
  loading.value = true
  error.value = null
  
  try {
    // محاكاة تحميل بيانات جديدة
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // تغيير البيانات حسب الفترة
    generateDataForPeriod(period)
    
    lastUpdated.value = new Date()
    emit('period-changed', period)
    
  } catch (err) {
    error.value = 'Failed to load data for selected period'
    console.error('Period change error:', err)
  } finally {
    loading.value = false
  }
}

const handleDateRangeChange = async (dateRange: [Date, Date]) => {
  loading.value = true
  error.value = null
  
  try {
    // محاكاة تحميل بيانات لنطاق زمني محدد
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    lastUpdated.value = new Date()
    
  } catch (err) {
    error.value = 'Failed to load data for selected date range'
    console.error('Date range change error:', err)
  } finally {
    loading.value = false
  }
}

const handleWalletTypeChange = (types: string[]) => {
  selectedWalletTypes.value = types
  emit('filters-changed', { walletTypes: types })
}

const handleRefresh = async () => {
  loading.value = true
  error.value = null
  
  try {
    // محاكاة إعادة تحميل البيانات
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // تحديث البيانات بقيم عشوائية جديدة
    generateRandomData()
    
    lastUpdated.value = new Date()
    emit('data-loaded', rawData.value)
    
  } catch (err) {
    error.value = 'Failed to refresh data'
    console.error('Refresh error:', err)
  } finally {
    loading.value = false
  }
}

const handleExport = (format: string) => {
  console.log(`Exporting crypto analytics as ${format}`)
}

const toggleChartType = () => {
  currentChartType.value = currentChartType.value === 'bar' ? 'line' : 'bar'
}

// وظائف البيانات | Data Functions
const generateDataForPeriod = (period: string) => {
  const baseData = [
    { month: 'Jan', personalWallet: 5000, corporateWallet: 8000, investmentWallet: 2000 },
    { month: 'Feb', personalWallet: 9000, corporateWallet: 15000, investmentWallet: 3000 },
    { month: 'Mar', personalWallet: 7000, corporateWallet: 12000, investmentWallet: 4000 },
    { month: 'Apr', personalWallet: 4000, corporateWallet: 8000, investmentWallet: 7000 },
    { month: 'May', personalWallet: 16000, corporateWallet: 6000, investmentWallet: 9000 },
    { month: 'Jun', personalWallet: 8000, corporateWallet: 10000, investmentWallet: 6000 },
    { month: 'Jul', personalWallet: 12000, corporateWallet: 14000, investmentWallet: 8000 },
    { month: 'Aug', personalWallet: 15000, corporateWallet: 8000, investmentWallet: 12000 },
    { month: 'Sep', personalWallet: 17000, corporateWallet: 7000, investmentWallet: 10000 },
    { month: 'Oct', personalWallet: 5000, corporateWallet: 16000, investmentWallet: 4000 },
    { month: 'Nov', personalWallet: 12000, corporateWallet: 11000, investmentWallet: 15000 },
    { month: 'Dec', personalWallet: 7000, corporateWallet: 9000, investmentWallet: 11000 }
  ]
  
  // تعديل البيانات حسب الفترة
  const multiplier = period === 'yearly' ? 2.5 : period === 'weekly' ? 0.3 : 1
  
  rawData.value = baseData.map(item => ({
    ...item,
    personalWallet: Math.round(item.personalWallet * multiplier * (0.8 + Math.random() * 0.4)),
    corporateWallet: Math.round(item.corporateWallet * multiplier * (0.8 + Math.random() * 0.4)),
    investmentWallet: Math.round(item.investmentWallet * multiplier * (0.8 + Math.random() * 0.4))
  }))
}

const generateRandomData = () => {
  rawData.value = rawData.value.map(item => ({
    ...item,
    personalWallet: Math.round(item.personalWallet * (0.9 + Math.random() * 0.2)),
    corporateWallet: Math.round(item.corporateWallet * (0.9 + Math.random() * 0.2)),
    investmentWallet: Math.round(item.investmentWallet * (0.9 + Math.random() * 0.2))
  }))
}

// إعداد التحديث التلقائي | Auto Refresh Setup
const setupAutoRefresh = () => {
  if (props.autoRefresh && props.refreshInterval > 0) {
    refreshTimer.value = setInterval(() => {
      if (!loading.value) {
        handleRefresh()
      }
    }, props.refreshInterval)
  }
}

const clearAutoRefresh = () => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
    refreshTimer.value = null
  }
}

// API عامة | Public API
const refresh = () => handleRefresh()
const changeWalletTypes = (types: string[]) => handleWalletTypeChange(types)
const changePeriod = (period: string) => handlePeriodChange(period)
const exportData = (format: string) => handleExport(format)

// تصدير للمكون الأب | Expose to parent
defineExpose({
  refresh,
  changeWalletTypes,
  changePeriod,
  exportData,
  rawData: computed(() => rawData.value),
  chartData,
  totalVolume,
  growthPercentage
})

// دورة الحياة | Lifecycle
onMounted(() => {
  lastUpdated.value = new Date()
  emit('data-loaded', rawData.value)
  setupAutoRefresh()
})

onUnmounted(() => {
  clearAutoRefresh()
})
</script>

<style scoped>
.crypto-analytics {
  width: 100%;
}

.crypto-filters {
  padding: 16px;
  background: rgb(var(--v-theme-surface));
  border-radius: 8px;
  margin-top: 8px;
}

.crypto-summary {
  margin-top: 16px;
}

.crypto-summary .v-card {
  height: 100%;
}

.crypto-summary .text-h4 {
  font-weight: 700;
  margin-bottom: 4px;
}

.crypto-summary .text-subtitle-2 {
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* استجابة الهاتف | Mobile Responsive */
@media (max-width: 768px) {
  .crypto-filters {
    padding: 12px;
  }
  
  .crypto-summary .text-h4 {
    font-size: 1.5rem;
  }
}
</style>
