<template>
  <v-form>
    <!-- إعدادات العرض | Display Settings -->
    <v-card variant="outlined" class="mb-4">
      <v-card-title class="text-subtitle-1 pa-3">
        <v-icon icon="mdi-palette" class="me-2" />
        {{ $t('charts.display_settings') }}
      </v-card-title>
      <v-card-text class="pa-3">
        <v-row dense>
          <!-- الثيم | Theme -->
          <v-col cols="12">
            <v-select
              v-model="localSettings.theme"
              :label="$t('charts.theme')"
              :items="themeOptions"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-theme-light-dark"
            />
          </v-col>
          
          <!-- الألوان | Colors -->
          <v-col cols="12">
            <v-combobox
              v-model="localSettings.colors"
              :label="$t('charts.color_palette')"
              :items="colorPalettes"
              item-title="name"
              item-value="colors"
              variant="outlined"
              density="compact"
              multiple
              chips
              prepend-inner-icon="mdi-palette"
            >
              <template #chip="{ props, item }">
                <v-chip
                  v-bind="props"
                  :color="item.raw"
                  size="small"
                />
              </template>
            </v-combobox>
          </v-col>
          
          <!-- الرسوم المتحركة | Animation -->
          <v-col cols="12">
            <v-switch
              v-model="localSettings.animation"
              :label="$t('charts.enable_animation')"
              color="primary"
              inset
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- إعدادات المخطط | Chart Settings -->
    <v-card variant="outlined" class="mb-4">
      <v-card-title class="text-subtitle-1 pa-3">
        <v-icon icon="mdi-chart-line" class="me-2" />
        {{ $t('charts.chart_settings') }}
      </v-card-title>
      <v-card-text class="pa-3">
        <v-row dense>
          <!-- نوع المخطط | Chart Type -->
          <v-col cols="12">
            <v-select
              v-model="localSettings.chartType"
              :label="$t('charts.chart_type')"
              :items="chartTypes"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-chart-arc"
            />
          </v-col>
          
          <!-- الارتفاع | Height -->
          <v-col cols="12">
            <v-slider
              v-model="localSettings.height"
              :label="$t('charts.height')"
              :min="200"
              :max="800"
              :step="50"
              thumb-label
              color="primary"
              prepend-icon="mdi-arrow-expand-vertical"
            >
              <template #append>
                <v-text-field
                  v-model="localSettings.height"
                  type="number"
                  variant="outlined"
                  density="compact"
                  style="width: 70px"
                  hide-details
                />
              </template>
            </v-slider>
          </v-col>
          
          <!-- الاستجابة | Responsive -->
          <v-col cols="12">
            <v-switch
              v-model="localSettings.responsive"
              :label="$t('charts.responsive')"
              color="primary"
              inset
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- إعدادات التفاعل | Interaction Settings -->
    <v-card variant="outlined" class="mb-4">
      <v-card-title class="text-subtitle-1 pa-3">
        <v-icon icon="mdi-cursor-default-click" class="me-2" />
        {{ $t('charts.interaction_settings') }}
      </v-card-title>
      <v-card-text class="pa-3">
        <v-row dense>
          <!-- التكبير/التصغير | Zoom -->
          <v-col cols="6">
            <v-switch
              v-model="localSettings.enableZoom"
              :label="$t('charts.enable_zoom')"
              color="primary"
              inset
            />
          </v-col>
          
          <!-- السحب | Pan -->
          <v-col cols="6">
            <v-switch
              v-model="localSettings.enablePan"
              :label="$t('charts.enable_pan')"
              color="primary"
              inset
            />
          </v-col>
          
          <!-- التلميحات | Tooltips -->
          <v-col cols="6">
            <v-switch
              v-model="localSettings.showTooltip"
              :label="$t('charts.show_tooltips')"
              color="primary"
              inset
            />
          </v-col>
          
          <!-- المؤشرات | Legend -->
          <v-col cols="6">
            <v-switch
              v-model="localSettings.showLegend"
              :label="$t('charts.show_legend')"
              color="primary"
              inset
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- إعدادات التصدير | Export Settings -->
    <v-card variant="outlined">
      <v-card-title class="text-subtitle-1 pa-3">
        <v-icon icon="mdi-download" class="me-2" />
        {{ $t('charts.export_settings') }}
      </v-card-title>
      <v-card-text class="pa-3">
        <v-row dense>
          <!-- جودة التصدير | Export Quality -->
          <v-col cols="12">
            <v-slider
              v-model="localSettings.exportQuality"
              :label="$t('charts.export_quality')"
              :min="0.1"
              :max="1"
              :step="0.1"
              thumb-label
              color="primary"
              prepend-icon="mdi-quality-high"
            />
          </v-col>
          
          <!-- التنسيقات المدعومة | Supported Formats -->
          <v-col cols="12">
            <v-chip-group
              v-model="localSettings.exportFormats"
              multiple
              color="primary"
            >
              <v-chip
                v-for="format in availableFormats"
                :key="format.value"
                :value="format.value"
                filter
                variant="outlined"
              >
                <v-icon :icon="format.icon" class="me-1" />
                {{ format.label }}
              </v-chip>
            </v-chip-group>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from '#app'

interface ChartSettings {
  theme?: 'light' | 'dark' | 'auto'
  colors?: string[]
  animation?: boolean
  chartType?: string
  height?: number
  responsive?: boolean
  enableZoom?: boolean
  enablePan?: boolean
  showTooltip?: boolean
  showLegend?: boolean
  exportQuality?: number
  exportFormats?: string[]
}

interface Props {
  modelValue?: ChartSettings
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({})
})

interface Emits {
  'update:modelValue': [settings: ChartSettings]
}

const emit = defineEmits<Emits>()

// التدويل | Internationalization
const { t } = useI18n()

// الإعدادات المحلية | Local Settings
const localSettings = ref<ChartSettings>({
  theme: 'auto',
  colors: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b'],
  animation: true,
  chartType: 'bar',
  height: 400,
  responsive: true,
  enableZoom: false,
  enablePan: false,
  showTooltip: true,
  showLegend: true,
  exportQuality: 1.0,
  exportFormats: ['png', 'jpg', 'pdf'],
  ...props.modelValue
})

// خيارات الثيم | Theme Options
const themeOptions = computed(() => [
  { label: t('charts.theme_auto'), value: 'auto' },
  { label: t('charts.theme_light'), value: 'light' },
  { label: t('charts.theme_dark'), value: 'dark' }
])

// أنواع المخططات | Chart Types
const chartTypes = computed(() => [
  { label: t('charts.bar_chart'), value: 'bar' },
  { label: t('charts.line_chart'), value: 'line' },
  { label: t('charts.pie_chart'), value: 'pie' },
  { label: t('charts.doughnut_chart'), value: 'doughnut' },
  { label: t('charts.area_chart'), value: 'area' },
  { label: t('charts.radar_chart'), value: 'radar' },
  { label: t('charts.scatter_chart'), value: 'scatter' }
])

// لوحات الألوان | Color Palettes
const colorPalettes = computed(() => [
  {
    name: t('charts.palette_primary'),
    colors: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
  },
  {
    name: t('charts.palette_pastel'),
    colors: ['#fecaca', '#fed7d7', '#fef3c7', '#d1fae5', '#dbeafe']
  },
  {
    name: t('charts.palette_vibrant'),
    colors: ['#dc2626', '#ea580c', '#d97706', '#65a30d', '#059669']
  },
  {
    name: t('charts.palette_monochrome'),
    colors: ['#374151', '#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6']
  }
])

// التنسيقات المتاحة | Available Formats
const availableFormats = computed(() => [
  { label: 'PNG', value: 'png', icon: 'mdi-file-image' },
  { label: 'JPG', value: 'jpg', icon: 'mdi-file-image' },
  { label: 'PDF', value: 'pdf', icon: 'mdi-file-pdf-box' },
  { label: 'CSV', value: 'csv', icon: 'mdi-file-delimited' },
  { label: 'SVG', value: 'svg', icon: 'mdi-svg' }
])

// مراقبة التغييرات | Watch for Changes
watch(
  localSettings,
  (newSettings) => {
    emit('update:modelValue', newSettings)
  },
  { deep: true }
)

// مراقبة الإعدادات الخارجية | Watch External Settings
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      localSettings.value = { ...localSettings.value, ...newValue }
    }
  },
  { deep: true }
)

// وظائف مساعدة | Helper Functions
const resetToDefaults = () => {
  localSettings.value = {
    theme: 'auto',
    colors: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b'],
    animation: true,
    chartType: 'bar',
    height: 400,
    responsive: true,
    enableZoom: false,
    enablePan: false,
    showTooltip: true,
    showLegend: true,
    exportQuality: 1.0,
    exportFormats: ['png', 'jpg', 'pdf']
  }
}

const exportSettings = () => {
  return JSON.stringify(localSettings.value, null, 2)
}

const importSettings = (settingsJson: string) => {
  try {
    const importedSettings = JSON.parse(settingsJson)
    localSettings.value = { ...localSettings.value, ...importedSettings }
  } catch (error) {
    console.error('Invalid settings JSON:', error)
  }
}

// تصدير الوظائف | Expose Functions
defineExpose({
  resetToDefaults,
  exportSettings,
  importSettings,
  settings: localSettings
})
</script>

<!-- ChartSettings مع Vuetify 3 نظيف وحديث | ChartSettings with clean and modern Vuetify 3 -->
