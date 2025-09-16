<template>
  <div class="d-none d-md-flex align-center">
    <v-menu
      v-model="isOpen"
      :close-on-content-click="false"
      :location="menuLocation"
      :offset="[0, 8]"
      transition="scale-transition"
    >
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          variant="tonal"
          density="comfortable"
          class="date-range-btn"
          :prepend-icon="iconLeft"
          :append-icon="iconRight"
          :aria-label="t('dateRange.openPicker')"
        >
          <span class="text-caption text-medium-emphasis">{{ displayText }}</span>
        </v-btn>
      </template>

      <v-card class="date-range-card" elevation="6">
        <v-card-text class="pa-3">
          <div class="d-flex flex-column gap-2">
            <v-locale-provider :rtl="isArabic">
              <v-date-picker
                v-model="pickerRange"
                :locale="currentLocale"
                color="primary"
                multiple="range"
                show-adjacent-months
              />
            </v-locale-provider>
            <div class="d-flex align-center justify-space-between mt-2">
              <v-btn variant="text" size="small" color="error" @click="handleClear">
                {{ t('common.clear') }}
              </v-btn>
              <div class="d-flex align-center gap-2">
                <v-btn variant="text" size="small" @click="isOpen = false">{{ t('common.cancel') }}</v-btn>
                <v-btn color="primary" size="small" @click="handleApply">{{ t('common.apply') }}</v-btn>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-menu>
  </div>
  
</template>

<script setup lang="ts">
import { useAppStore } from '~/stores/app'
const { t, locale } = useI18n()
const appStore = useAppStore()

const isOpen = ref(false)

const isArabic = computed(() => locale.value === 'ar')
const currentLocale = computed(() => (isArabic.value ? 'ar-EG' : 'en-US'))
const menuLocation = computed(() => (isArabic.value ? 'bottom start' : 'bottom end'))

const iconLeft = computed(() => (isArabic.value ? 'mdi-calendar' : 'mdi-calendar'))
const iconRight = computed(() => 'mdi-chevron-down')

// Bind to store
const pickerRange = ref<[string, string] | string[] | null>(null)

const displayText = computed(() => appStore.formattedDateRange || t('dateRange.selectRange'))

watch(
  () => appStore.dateRange,
  (val) => {
    if (val.start && val.end) {
      pickerRange.value = [val.start, val.end]
    } else {
      pickerRange.value = null
    }
  },
  { immediate: true, deep: true }
)

const handleApply = () => {
  if (Array.isArray(pickerRange.value) && pickerRange.value.length >= 2) {
    const [start, end] = pickerRange.value as string[]
    appStore.setDateRange({ start, end })
  }
  isOpen.value = false
}

const handleClear = () => {
  appStore.clearDateRange()
}

onMounted(() => {
  // ensure initialized defaults
  appStore.initializeApp()
})
</script>

<style scoped>
.date-range-btn {
  border-radius: 8px;
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  text-transform: none;
}

.date-range-card {
  min-width: 328px;
  border-radius: 12px;
  overflow: hidden;
}
</style>


