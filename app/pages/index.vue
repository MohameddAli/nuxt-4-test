<template>
  <div class="loading-container">
    <v-progress-circular
      indeterminate
      color="primary"
      size="64"
    />
    <p class="text-h6 mt-4">جاري التوجيه...</p>
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
</template>

<script setup>
// Redirect to login page for authentication-first approach
definePageMeta({
  middleware: 'guest' // Will redirect authenticated users to dashboard
})

const router = useRouter()
const authStore = useAuthStore()

// Redirect to login if not authenticated
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    await router.push('/auth/login')
  } else {
    // If already authenticated, go to dashboard
    await router.push('/dashboard')
  }
})
</script>


<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
</style>
