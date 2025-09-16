<template>
  <div class="dashboard-page">
    <!-- Welcome Section -->
    <div class="welcome-section mb-6">
      <div class="d-flex align-center justify-space-between flex-wrap">
        <div>
          <h1 class="welcome-title text-h4 font-weight-bold mb-2">
            Good Morning, Robin 👋
          </h1>
          <div class="welcome-tabs d-flex align-center mt-3">
            <v-btn
              v-for="tab in welcomeTabs"
              :key="tab.value"
              :variant="activeTab === tab.value ? 'flat' : 'text'"
              :color="activeTab === tab.value ? 'primary' : 'default'"
              size="small"
              class="mr-2 tab-btn"
              @click="activeTab = tab.value"
            >
              {{ tab.label }}
            </v-btn>
          </div>
        </div>
        <div class="welcome-actions d-flex align-center">
          <v-chip
            color="surface-variant"
            variant="flat"
            size="small"
            class="mr-4"
          >
            May 1st - Aug 23rd
          </v-chip>
          <v-btn
            color="primary"
            variant="elevated"
            prepend-icon="mdi-download"
            class="welcome-btn"
            rounded
          >
            {{ $t('common.download') }}
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Wallet Cards Section -->
    <div class="wallet-section mb-8">
      <div class="d-flex align-center justify-space-between mb-4">
         <h2 class="text-h6 font-weight-bold">{{ $t('pages.overview.myWallet') }}</h2>
        <div class="wallet-types d-flex align-center">
          <v-chip
            v-for="wallet in walletTypes"
            :key="wallet.type"
            :color="wallet.color"
            variant="tonal"
            size="small"
            class="mr-2"
          >
            <v-icon start :icon="wallet.icon" size="16" />
            {{ wallet.label }}
          </v-chip>
        </div>
      </div>

      <v-row>
        <v-col
          v-for="wallet in walletCards"
          :key="wallet.type"
          cols="12"
          md="4"
        >
          <v-card
            class="wallet-card h-100"
            variant="elevated"
            :class="wallet.class"
          >
            <v-card-text class="pa-6">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="wallet-icon">
                  <v-icon
                    :icon="wallet.icon"
                    size="24"
                    :color="wallet.iconColor"
                  />
                </div>
                <v-chip
                  :color="wallet.trendColor"
                  variant="tonal"
                  size="small"
                  :prepend-icon="wallet.trendIcon"
                >
                  {{ wallet.trend }}
                </v-chip>
              </div>
              <h3 class="text-h5 font-weight-bold mb-1">
                {{ wallet.balance }}
              </h3>
              <p class="text-body-2 text-medium-emphasis mb-3">
                {{ wallet.type }}
              </p>
              <div class="wallet-progress">
                <div class="d-flex justify-space-between text-caption mb-1">
                  <span>{{ wallet.progressLabel }}</span>
                  <span>{{ wallet.progressValue }}%</span>
                </div>
                <v-progress-linear
                  :model-value="wallet.progressValue"
                  :color="wallet.progressColor"
                  height="6"
                  rounded
                />
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Main Content Row -->
    <v-row>
      <!-- Crypto Analytics Chart -->
      <v-col cols="12" lg="8">
        <v-card class="analytics-card" elevation="2">
          <v-card-title class="d-flex align-center justify-space-between">
            <h3>{{ $t('pages.overview.cryptoAnalytics') }}</h3>
            <div class="chart-controls">
              <v-btn-toggle
                v-model="chartPeriod"
                variant="outlined"
                density="compact"
                mandatory
              >
                <v-btn value="monthly">{{ $t('common.monthly') }}</v-btn>
                <v-btn value="weekly">{{ $t('common.weekly') }}</v-btn>
                <v-btn value="daily">{{ $t('common.daily') }}</v-btn>
              </v-btn-toggle>
            </div>
          </v-card-title>
          <v-card-text>
            <div class="chart-container">
              <!-- Mock Chart -->
              <div class="mock-chart">
                <svg viewBox="0 0 800 300" class="chart-svg">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style="stop-color:#1976D2;stop-opacity:0.3" />
                      <stop offset="100%" style="stop-color:#1976D2;stop-opacity:0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 50 250 Q 150 200 250 180 T 450 160 T 650 140 T 750 120"
                    stroke="#1976D2"
                    stroke-width="3"
                    fill="none"
                  />
                  <path
                    d="M 50 250 Q 150 200 250 180 T 450 160 T 650 140 T 750 120 L 750 280 L 50 280 Z"
                    fill="url(#chartGradient)"
                  />
                  <!-- Data points -->
                  <circle cx="50" cy="250" r="4" fill="#1976D2" />
                  <circle cx="250" cy="180" r="4" fill="#1976D2" />
                  <circle cx="450" cy="160" r="4" fill="#1976D2" />
                  <circle cx="650" cy="140" r="4" fill="#1976D2" />
                  <circle cx="750" cy="120" r="4" fill="#1976D2" />
                </svg>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Wallet Summary -->
      <v-col cols="12" lg="4">
        <v-card class="wallet-card" elevation="2">
          <v-card-title>
            <h3>{{ $t('pages.overview.myWallet') }}</h3>
          </v-card-title>
          <v-card-text>
            <div class="wallet-items">
              <div class="wallet-item mb-4">
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-avatar color="primary" size="32" class="mr-3">
                      <v-icon size="18" color="white">mdi-wallet</v-icon>
                    </v-avatar>
                    <div>
                      <p class="text-body-2 font-weight-medium mb-0">
                        {{ $t('pages.overview.personalWallet') }}
                      </p>
                      <p class="text-caption text-medium-emphasis mb-0">BTC (10%)</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-body-2 font-weight-bold mb-0">$27,218</p>
                    <p class="text-caption text-success mb-0">+2.5%</p>
                  </div>
                </div>
              </div>

              <div class="wallet-item mb-4">
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-avatar color="orange" size="32" class="mr-3">
                      <v-icon size="18" color="white">mdi-domain</v-icon>
                    </v-avatar>
                    <div>
                      <p class="text-body-2 font-weight-medium mb-0">
                        {{ $t('pages.overview.corporateWallet') }}
                      </p>
                      <p class="text-caption text-medium-emphasis mb-0">ETH (15%)</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-body-2 font-weight-bold mb-0">$1,847</p>
                    <p class="text-caption text-error mb-0">-1.2%</p>
                  </div>
                </div>
              </div>

              <div class="wallet-item">
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-avatar color="green" size="32" class="mr-3">
                      <v-icon size="18" color="white">mdi-trending-up</v-icon>
                    </v-avatar>
                    <div>
                      <p class="text-body-2 font-weight-medium mb-0">
                        {{ $t('pages.overview.investmentWallet') }}
                      </p>
                      <p class="text-caption text-medium-emphasis mb-0">Mixed (75%)</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-body-2 font-weight-bold mb-0">$45,892</p>
                    <p class="text-caption text-success mb-0">+8.3%</p>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Transactions Table -->
    <v-row class="mt-6">
      <v-col cols="12" lg="8">
        <ReusableTable
          class="transactions-card"
          :title="$t('pages.overview.transactions')"
          :items="transactions"
          :columns="transactionColumns"
          row-key="id"
          :page="currentPage"
          :length="totalPages"
          :total-visible="5"
          @update:page="(p) => (currentPage = p)"
        >
          <template #actions>
            <v-btn variant="text" size="small" color="primary">{{ $t('common.showAll') }}</v-btn>
          </template>

          <template #cell-name="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="32" class="mr-3">
                <v-img :src="item.avatar" :alt="item.name" />
              </v-avatar>
              <span class="text-body-2 font-weight-medium">{{ item.name }}</span>
            </div>
          </template>

          <template #cell-coin="{ item }">
            <div class="d-flex align-center">
              <v-avatar :color="item.coinColor" size="24" class="mr-2">
                <v-icon color="white" size="12">{{ item.coinIcon }}</v-icon>
              </v-avatar>
              <span class="text-body-2">{{ item.coin }}</span>
            </div>
          </template>

          <template #cell-process="{ item }">
            <v-chip :color="item.processColor" variant="tonal" size="small">
              {{ item.process }}
            </v-chip>
          </template>

          <template #cell-amount="{ item }">
            <span class="text-body-2 font-weight-bold">{{ item.amount }}</span>
          </template>
        </ReusableTable>
      </v-col>

      <!-- My Wallet Summary -->
      <v-col cols="12" lg="4">
        <v-card class="wallet-summary-card" elevation="2">
          <v-card-title class="pa-6">
            <span class="text-h6 font-weight-bold">My Wallet</span>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <div class="wallet-summary-item mb-4">
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="d-flex align-center">
                  <v-avatar color="orange" size="24" class="mr-2">
                    <v-icon color="white" size="12">mdi-bitcoin</v-icon>
                  </v-avatar>
                  <span class="text-body-2 font-weight-medium">BTC (10.5%)</span>
                </div>
                <span class="text-body-2 font-weight-bold">27,218</span>
              </div>
              <v-progress-linear
                model-value="75"
                color="orange"
                height="4"
                rounded
              />
            </div>

            <div class="wallet-summary-item mb-4">
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="d-flex align-center">
                  <v-avatar color="blue" size="24" class="mr-2">
                    <v-icon color="white" size="12">mdi-ethereum</v-icon>
                  </v-avatar>
                  <span class="text-body-2 font-weight-medium">ETH (8.2%)</span>
                </div>
                <span class="text-body-2 font-weight-bold">4,367</span>
              </div>
              <v-progress-linear
                model-value="60"
                color="blue"
                height="4"
                rounded
              />
            </div>

            <div class="wallet-summary-item mb-4">
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="d-flex align-center">
                  <v-avatar color="green" size="24" class="mr-2">
                    <v-icon color="white" size="12">mdi-currency-usd</v-icon>
                  </v-avatar>
                  <span class="text-body-2 font-weight-medium">ADA (5.1%)</span>
                </div>
                <span class="text-body-2 font-weight-bold">$107,954.24</span>
              </div>
              <v-progress-linear
                model-value="85"
                color="green"
                height="4"
                rounded
              />
            </div>

            <div class="wallet-summary-item">
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="d-flex align-center">
                  <v-avatar color="purple" size="24" class="mr-2">
                    <v-icon color="white" size="12">mdi-circle-outline</v-icon>
                  </v-avatar>
                  <span class="text-body-2 font-weight-medium">DOT (3.1%)</span>
                </div>
                <span class="text-body-2 font-weight-bold">$19,847.26</span>
              </div>
              <v-progress-linear
                model-value="45"
                color="purple"
                height="4"
                rounded
              />
            </div>

            <v-divider class="my-4" />

              <div class="wallet-total d-flex align-center justify-space-between">
              <span class="text-body-1 font-weight-medium">{{ $t('common.totalBalance') }}</span>
              <span class="text-h6 font-weight-bold text-primary">$264.9k</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import ReusableTable from "~/components/ReusableTable.vue";
// Page meta
definePageMeta({
  title: 'pages.overview.title',
  subtitle: 'pages.overview.subtitle'
})

// Composables
// const { t } = useI18n()

// State
const chartPeriod = ref('monthly')
// State
const activeTab = ref('monthly')
const currentPage = ref(1)
const totalPages = ref(3)
// Reusable table columns for transactions
const { t } = useI18n()
const transactionColumns = computed(() => ([
  { key: 'id', title: t('table.id'), width: 120 },
  { key: 'name', title: t('table.name'), width: 220 },
  { key: 'coin', title: t('table.coin'), width: 160 },
  { key: 'date', title: t('table.date'), width: 140 },
  { key: 'process', title: t('table.process'), width: 140 },
  { key: 'amount', title: t('table.amount'), align: 'end' },
]))

// Welcome tabs
const welcomeTabs = ref([
  { label: 'Monthly', value: 'monthly' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Daily', value: 'daily' }
])

// Wallet types
const walletTypes = ref([
  {
    type: 'personal',
    label: 'Personal Wallet',
    icon: 'mdi-account-outline',
    color: 'primary'
  },
  {
    type: 'corporate',
    label: 'Corporate Wallet',
    icon: 'mdi-office-building-outline',
    color: 'secondary'
  },
  {
    type: 'investment',
    label: 'Investment Wallet',
    icon: 'mdi-trending-up',
    color: 'success'
  }
])

// Wallet cards data
const walletCards = ref([
  {
    type: 'BTC (10.5%)',
    balance: '$27,218',
    icon: 'mdi-bitcoin',
    iconColor: 'orange',
    trend: '+2.5%',
    trendColor: 'success',
    trendIcon: 'mdi-trending-up',
    progressLabel: 'Progress',
    progressValue: 75,
    progressColor: 'orange',
    class: 'btc-card'
  },
  {
    type: 'ETH (8.2%)',
    balance: '$1,847',
    icon: 'mdi-ethereum',
    iconColor: 'blue',
    trend: '-1.2%',
    trendColor: 'error',
    trendIcon: 'mdi-trending-down',
    progressLabel: 'Progress',
    progressValue: 60,
    progressColor: 'blue',
    class: 'eth-card'
  },
  {
    type: 'ADA (5.1%)',
    balance: '$0.47',
    icon: 'mdi-currency-usd',
    iconColor: 'green',
    trend: '+5.8%',
    trendColor: 'success',
    trendIcon: 'mdi-trending-up',
    progressLabel: 'Progress',
    progressValue: 85,
    progressColor: 'green',
    class: 'ada-card'
  }
])

// Computed
// removed unused currentDate

// Transactions data
const transactions = ref([
  {
    id: '#1234',
    name: 'Amy Tender',
    avatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
    coin: 'BTC',
    coinIcon: 'mdi-bitcoin',
    coinColor: 'orange',
    date: 'May 5th',
    process: 'Buy',
    processColor: 'success',
    amount: '3,000 BTC'
  },
  {
    id: '#1235',
    name: 'John Smith',
    avatar: 'https://cdn.vuetifyjs.com/images/lists/2.jpg',
    coin: 'ETH',
    coinIcon: 'mdi-ethereum',
    coinColor: 'blue',
    date: 'May 4th',
    process: 'Sell',
    processColor: 'error',
    amount: '2,500 ETH'
  },
  {
    id: '#1236',
    name: 'Mason Stone',
    avatar: 'https://cdn.vuetifyjs.com/images/lists/3.jpg',
    coin: 'ADA',
    coinIcon: 'mdi-currency-usd',
    coinColor: 'green',
    date: 'May 3rd',
    process: 'Buy',
    processColor: 'success',
    amount: '1,800 ADA'
  },
  {
    id: '#1237',
    name: 'Sarah Johnson',
    avatar: 'https://cdn.vuetifyjs.com/images/lists/4.jpg',
    coin: 'DOT',
    coinIcon: 'mdi-circle-outline',
    coinColor: 'purple',
    date: 'Jul 28th',
    process: 'Sell',
    processColor: 'error',
    amount: '142,000 DOT'
  },
  {
    id: '#1238',
    name: 'Mike Wilson',
    avatar: 'https://cdn.vuetifyjs.com/images/lists/5.jpg',
    coin: 'BTC',
    coinIcon: 'mdi-bitcoin',
    coinColor: 'orange',
    date: 'Jul 27th',
    process: 'Buy',
    processColor: 'success',
    amount: '5,000 BTC'
  }
])
</script>

<style scoped>
.dashboard-page {
  padding: 24px;
  background-color: rgb(var(--v-theme-background));
  min-height: 100vh;
}

.welcome-section {
  margin-bottom: 32px;
}

.welcome-title {
  color: rgb(var(--v-theme-on-surface));
  margin-bottom: 16px;
}

.welcome-tabs {
  gap: 8px;
}

.tab-btn {
  border-radius: 20px;
  text-transform: none;
  font-weight: 500;
  padding: 8px 16px;
}

.welcome-btn {
  border-radius: 24px;
  text-transform: none;
  font-weight: 600;
  padding: 12px 24px;
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
}

.wallet-section {
  margin-bottom: 32px;
}

.wallet-card {
  border-radius: 16px;
  transition: all 0.3s ease;
  border: 1px solid rgba(var(--v-border-color), 0.08);
}

.wallet-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.wallet-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-surface-variant), 0.3);
}

.wallet-progress {
  margin-top: 16px;
}

.btc-card {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.05), rgba(255, 152, 0, 0.02));
  border-left: 4px solid #ff9800;
}

.eth-card {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.05), rgba(33, 150, 243, 0.02));
  border-left: 4px solid #2196f3;
}

.ada-card {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.05), rgba(76, 175, 80, 0.02));
  border-left: 4px solid #4caf50;
}

.transactions-card {
  border-radius: 16px;
  border: 1px solid rgba(var(--v-border-color), 0.08);
}

.transactions-table {
  border-radius: 0;
}

.transactions-table thead th {
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  font-weight: 600;
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface-variant));
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
}

.transaction-row {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.06);
  transition: background-color 0.2s ease;
}

.transaction-row:hover {
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
}

.transaction-row:last-child {
  border-bottom: none;
}

.table-pagination {
  border-top: 1px solid rgba(var(--v-border-color), 0.06);
}

.wallet-summary-card {
  border-radius: 16px;
  border: 1px solid rgba(var(--v-border-color), 0.08);
}

.wallet-summary-item {
  padding: 12px 0;
}

.wallet-total {
  padding: 16px 0;
  background: rgba(var(--v-theme-primary), 0.05);
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
}

.chart-card {
  border-radius: 16px;
  border: 1px solid rgba(var(--v-border-color), 0.08);
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05), rgba(var(--v-theme-secondary), 0.05));
  border-radius: 12px;
  margin: 16px 0;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .dashboard-page {
    padding: 16px;
  }

  .welcome-section {
    margin-bottom: 24px;
  }

  .wallet-section {
    margin-bottom: 24px;
  }
}

@media (max-width: 600px) {
  .dashboard-page {
    padding: 12px;
  }

  .welcome-title {
    font-size: 1.5rem !important;
  }

  .welcome-tabs {
    flex-wrap: wrap;
    margin-top: 12px;
  }

  .tab-btn {
    margin-bottom: 8px;
  }
}

/* Theme-specific adjustments removed */

/* Animation for cards */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.wallet-card,
.transactions-card,
.wallet-summary-card {
  animation: fadeInUp 0.6s ease-out;
}

.wallet-card:nth-child(1) { animation-delay: 0.1s; }
.wallet-card:nth-child(2) { animation-delay: 0.2s; }
.wallet-card:nth-child(3) { animation-delay: 0.3s; }
.overview-page {
  max-width: 100%;
}

.welcome-section {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.1) 0%, rgba(var(--v-theme-secondary), 0.05) 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.welcome-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stats-card {
  transition: all 0.3s ease;
  border-radius: 16px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(var(--v-theme-primary), 0.15);
}

.analytics-card,
.wallet-card {
  border-radius: 16px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.chart-container {
  height: 300px;
  position: relative;
}

.mock-chart {
  width: 100%;
  height: 100%;
}

.chart-svg {
  width: 100%;
  height: 100%;
}

.wallet-item {
  padding: 12px;
  border-radius: 12px;
  transition: background-color 0.2s ease;
}

.wallet-item:hover {
  background: rgba(var(--v-theme-primary), 0.05);
}

.transactions-table {
  border-radius: 12px;
}

.transactions-table :deep(.v-data-table__wrapper) {
  border-radius: 12px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .welcome-section {
    padding: 16px;
  }

  .welcome-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    margin-top: 16px;
  }

  .chart-controls {
    margin-top: 12px;
  }
}

@media (max-width: 960px) {
  .chart-container {
    height: 250px;
  }
}

/* Animation for cards */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stats-card,
.analytics-card,
.wallet-card {
  animation: fadeInUp 0.6s ease-out;
}

/* Theme-specific adjustments removed */
</style>
