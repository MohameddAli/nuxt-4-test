<template>
  <!-- زر التصدير الرئيسي | Main Export Button -->
  <v-menu
    v-if="variant === 'menu'"
    v-model="exportMenu"
    location="bottom end"
    offset="4"
  >
    <template #activator="{ props: menuProps }">
      <v-btn
        v-bind="menuProps"
        :variant="buttonVariant"
        :color="color"
        :size="size"
        :disabled="disabled || isExporting"
        :loading="isExporting"
      >
        <v-icon icon="mdi-download" class="me-1" />
        {{ $t('charts.export') }}
        <v-icon icon="mdi-chevron-down" class="ms-1" />
      </v-btn>
    </template>

    <v-card elevation="8" rounded="lg" min-width="200">
      <v-card-title class="text-subtitle-2 pa-3 border-b">
        <v-icon icon="mdi-download" class="me-2" />
        {{ $t('charts.export_options') }}
      </v-card-title>
      <v-list density="compact">
        <v-list-item
          v-for="format in availableFormats"
          :key="format.value"
          :disabled="isExporting"
          @click="handleExport(format.value)"
        >
          <template #prepend>
            <v-icon :icon="format.icon" :color="format.color" />
          </template>
          <v-list-item-title>{{ format.label }}</v-list-item-title>
          <v-list-item-subtitle>{{ format.description }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>

  <!-- أزرار منفصلة | Separate Buttons -->
  <v-btn-group
    v-else-if="variant === 'buttons'"
    :variant="buttonVariant"
    :color="color"
    :size="size"
    :divided="true"
  >
    <v-btn
      v-for="format in availableFormats"
      :key="format.value"
      :disabled="disabled || isExporting"
      :loading="isExporting && currentExportFormat === format.value"
      @click="handleExport(format.value)"
    >
      <v-icon :icon="format.icon" class="me-1" />
      {{ format.label }}
    </v-btn>
  </v-btn-group>

  <!-- زر واحد | Single Button -->
  <v-btn
    v-else-if="variant === 'button'"
    :variant="buttonVariant"
    :color="color"
    :size="size"
    :disabled="disabled || isExporting"
    :loading="isExporting"
    @click="handleExport(defaultFormat)"
  >
    <v-icon icon="mdi-download" class="me-1" />
    {{ $t('charts.export') }}
  </v-btn>

  <!-- حوار التصدير المتقدم | Advanced Export Dialog -->
  <v-dialog
    v-else-if="variant === 'dialog'"
    v-model="exportDialog"
    max-width="500"
    persistent
  >
    <template #activator="{ props: dialogProps }">
      <v-btn
        v-bind="dialogProps"
        :variant="buttonVariant"
        :color="color"
        :size="size"
        :disabled="disabled"
      >
        <v-icon icon="mdi-download" class="me-1" />
        {{ $t('charts.export') }}
      </v-btn>
    </template>

    <v-card rounded="lg">
      <v-card-title class="d-flex align-center bg-primary text-white pa-4">
        <v-icon icon="mdi-download" class="me-2" />
        {{ $t('charts.export_chart') }}
        <v-spacer />
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          color="white"
          @click="exportDialog = false"
        />
      </v-card-title>

      <v-card-text class="pa-4">
        <v-form ref="exportForm">
          <!-- اسم الملف | Filename -->
          <v-text-field
            v-model="exportOptions.filename"
            :label="$t('charts.filename')"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-file"
            class="mb-3"
          />

          <!-- تنسيق التصدير | Export Format -->
          <v-select
            v-model="exportOptions.format"
            :label="$t('charts.format')"
            :items="availableFormats"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-file-document"
            class="mb-3"
          />

          <!-- جودة التصدير (للصور) | Export Quality (for images) -->
          <v-slider
            v-if="['png', 'jpg'].includes(exportOptions.format)"
            v-model="exportOptions.quality"
            :label="$t('charts.quality')"
            :min="0.1"
            :max="1"
            :step="0.1"
            thumb-label
            color="primary"
            prepend-icon="mdi-quality-high"
            class="mb-3"
          />

          <!-- خيارات إضافية | Additional Options -->
          <v-row dense>
            <v-col cols="6">
              <v-switch
                v-model="exportOptions.includeTitle"
                :label="$t('charts.include_title')"
                color="primary"
                inset
              />
            </v-col>
            <v-col cols="6">
              <v-switch
                v-model="exportOptions.includeLegend"
                :label="$t('charts.include_legend')"
                color="primary"
                inset
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn
          variant="outlined"
          @click="exportDialog = false"
        >
          {{ $t('common.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="isExporting"
          @click="handleAdvancedExport"
        >
          <v-icon icon="mdi-download" class="me-1" />
          {{ $t('charts.export') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- شريط التقدم | Progress Bar -->
  <v-snackbar
    v-model="showProgress"
    :timeout="-1"
    color="primary"
    variant="elevated"
    location="bottom"
  >
    <div class="d-flex align-center">
      <v-progress-circular
        indeterminate
        size="20"
        width="2"
        color="white"
        class="me-3"
      />
      <span>{{ progressText }}</span>
    </div>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '#app'

interface ExportOptions {
  filename: string
  format: string
  quality: number
  includeTitle: boolean
  includeLegend: boolean
  includeMetadata: boolean
}

interface Props {
  chartRef?: any
  variant?: 'menu' | 'buttons' | 'button' | 'dialog'
  buttonVariant?: 'flat' | 'text' | 'elevated' | 'tonal' | 'outlined' | 'plain'
  color?: string
  size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large'
  formats?: string[]
  filename?: string
  title?: string
  disabled?: boolean
  defaultFormat?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'menu',
  buttonVariant: 'elevated',
  color: 'primary',
  size: 'default',
  formats: () => ['png', 'jpg', 'pdf', 'csv'],
  filename: 'chart',
  defaultFormat: 'png'
})

interface Emits {
  'export-start': []
  'export-complete': [result: any]
  'export-error': [error: any]
}

const emit = defineEmits<Emits>()

// التدويل | Internationalization
const { t } = useI18n()

// المتغيرات التفاعلية | Reactive Variables
const exportMenu = ref(false)
const exportDialog = ref(false)
const isExporting = ref(false)
const showProgress = ref(false)
const progressText = ref('')
const currentExportFormat = ref('')

// خيارات التصدير | Export Options
const exportOptions = ref<ExportOptions>({
  filename: props.filename,
  format: props.defaultFormat,
  quality: 1.0,
  includeTitle: true,
  includeLegend: true,
  includeMetadata: false
})

// التنسيقات المتاحة | Available Formats
const formatDefinitions = {
  png: {
    label: 'PNG',
    description: t('charts.png_description'),
    icon: 'mdi-file-image',
    color: 'blue',
    mimeType: 'image/png'
  },
  jpg: {
    label: 'JPG',
    description: t('charts.jpg_description'),
    icon: 'mdi-file-image',
    color: 'orange',
    mimeType: 'image/jpeg'
  },
  pdf: {
    label: 'PDF',
    description: t('charts.pdf_description'),
    icon: 'mdi-file-pdf-box',
    color: 'red',
    mimeType: 'application/pdf'
  },
  csv: {
    label: 'CSV',
    description: t('charts.csv_description'),
    icon: 'mdi-file-delimited',
    color: 'green',
    mimeType: 'text/csv'
  },
  svg: {
    label: 'SVG',
    description: t('charts.svg_description'),
    icon: 'mdi-svg',
    color: 'purple',
    mimeType: 'image/svg+xml'
  }
}

const availableFormats = computed(() => {
  return props.formats.map(format => ({
    value: format,
    ...formatDefinitions[format as keyof typeof formatDefinitions]
  }))
})

// الوظائف | Functions
const handleExport = async (format: string) => {
  currentExportFormat.value = format
  await performExport({
    ...exportOptions.value,
    format
  })
}

const handleAdvancedExport = async () => {
  await performExport(exportOptions.value)
  exportDialog.value = false
}

const performExport = async (options: ExportOptions) => {
  if (!props.chartRef) {
    console.error('Chart reference is required for export')
    return
  }

  isExporting.value = true
  showProgress.value = true
  progressText.value = t('charts.preparing_export')
  
  try {
    emit('export-start')

    // محاكاة عملية التصدير | Simulate export process
    await new Promise(resolve => setTimeout(resolve, 1000))

    let result: any = null

    switch (options.format) {
      case 'png':
      case 'jpg':
        result = await exportAsImage(options)
        break
      case 'pdf':
        result = await exportAsPDF(options)
        break
      case 'csv':
        result = await exportAsCSV(options)
        break
      case 'svg':
        result = await exportAsSVG(options)
        break
    }

    emit('export-complete', result)
    showSuccessMessage(options.format)

  } catch (error) {
    console.error('Export error:', error)
    emit('export-error', error)
    showErrorMessage()
  } finally {
    isExporting.value = false
    showProgress.value = false
    currentExportFormat.value = ''
    exportMenu.value = false
  }
}

const exportAsImage = async (options: ExportOptions) => {
  progressText.value = t('charts.generating_image')
  
  // الحصول على canvas من المخطط
  const chart = props.chartRef?.getChart?.() || props.chartRef?.chart
  if (!chart || !chart.canvas) {
    throw new Error('Chart canvas not found')
  }

  // تحويل إلى صورة
  const imageData = chart.canvas.toDataURL(
    formatDefinitions[options.format as keyof typeof formatDefinitions].mimeType,
    options.quality
  )

  // تحميل الصورة
  downloadFile(imageData, `${options.filename}.${options.format}`)
  
  return { format: options.format, data: imageData }
}

const exportAsPDF = async (options: ExportOptions) => {
  progressText.value = t('charts.generating_pdf')
  
  // استخدام jsPDF (يحتاج تثبيت)
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF()

  // إضافة العنوان
  if (options.includeTitle && props.title) {
    pdf.setFontSize(16)
    pdf.text(props.title, 20, 20)
  }

  // إضافة المخطط كصورة
  const chart = props.chartRef?.getChart?.() || props.chartRef?.chart
  if (chart && chart.canvas) {
    const imageData = chart.canvas.toDataURL('image/png', 1.0)
    pdf.addImage(imageData, 'PNG', 20, 40, 170, 100)
  }

  // إضافة metadata
  if (options.includeMetadata) {
    pdf.setFontSize(10)
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, 150)
  }

  // حفظ وتحميل PDF
  pdf.save(`${options.filename}.pdf`)
  
  return { format: 'pdf', pdf }
}

const exportAsCSV = async (options: ExportOptions) => {
  progressText.value = t('charts.generating_csv')
  
  // الحصول على بيانات المخطط
  const chart = props.chartRef?.getChart?.() || props.chartRef?.chart
  if (!chart || !chart.data) {
    throw new Error('Chart data not found')
  }

  const data = chart.data
  let csvContent = ''

  // إضافة العنوان
  if (options.includeTitle && props.title) {
    csvContent += `"${props.title}"\n\n`
  }

  // إضافة headers
  csvContent += 'Label'
  data.datasets.forEach((dataset: any) => {
    csvContent += `,"${dataset.label}"`
  })
  csvContent += '\n'

  // إضافة البيانات
  data.labels.forEach((label: string, index: number) => {
    csvContent += `"${label}"`
    data.datasets.forEach((dataset: any) => {
      csvContent += `,${dataset.data[index] || 0}`
    })
    csvContent += '\n'
  })

  // تحميل CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  downloadFile(url, `${options.filename}.csv`)
  
  return { format: 'csv', data: csvContent }
}

const exportAsSVG = async (options: ExportOptions) => {
  progressText.value = t('charts.generating_svg')
  
  // Note: Chart.js doesn't natively support SVG export
  // This would require a specialized library or custom implementation
  throw new Error('SVG export not yet implemented')
}

const downloadFile = (dataUrl: string, filename: string) => {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const showSuccessMessage = (format: string) => {
  // يمكن إضافة snackbar للنجاح هنا
  console.log(`Export as ${format} completed successfully`)
}

const showErrorMessage = () => {
  // يمكن إضافة snackbar للخطأ هنا
  console.error('Export failed')
}

// API عامة | Public API
const exportChart = (format?: string, options?: Partial<ExportOptions>) => {
  const exportFormat = format || props.defaultFormat
  const exportOpts = { ...exportOptions.value, ...options, format: exportFormat }
  return performExport(exportOpts)
}

// تصدير الوظائف | Expose Functions
defineExpose({
  exportChart,
  exportAsImage,
  exportAsPDF,
  exportAsCSV
})
</script>

<!-- ChartExporter مع Vuetify 3 نظيف وحديث | ChartExporter with clean and modern Vuetify 3 -->