<template>
  <v-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
    scrollable
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-download</v-icon>
        {{ $t('export.dialogTitle') }}
        <v-spacer />
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="closeDialog"
        />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <v-form ref="form" @submit.prevent="handleExport">
          <!-- Export Format Selection -->
          <div class="mb-6">
            <h3 class="text-h6 mb-3">{{ $t('export.format') }}</h3>
            <v-chip-group
              v-model="selectedFormat"
              mandatory
              color="primary"
              variant="outlined"
            >
              <v-chip
                v-for="format in formats"
                :key="format"
                :value="format"
                class="ma-1"
              >
                <v-icon start>{{ getFormatIcon(format) }}</v-icon>
                {{ $t(`export.${format}`) }}
              </v-chip>
            </v-chip-group>
          </div>

          <!-- Filename -->
          <div class="mb-6">
            <v-text-field
              v-model="exportOptions.filename"
              :label="$t('export.filename')"
              :rules="filenameRules"
              variant="outlined"
              density="comfortable"
              :suffix="getFileExtension(selectedFormat)"
              required
            />
          </div>

          <!-- Data Selection -->
          <div class="mb-6">
            <h3 class="text-h6 mb-3">{{ $t('export.dataSelection') }}</h3>
            <v-radio-group
              v-model="exportOptions.dataSelection"
              density="compact"
            >
              <v-radio
                value="all"
                :label="$t('export.allData')"
                color="primary"
              />
              <v-radio
                value="current"
                :label="$t('export.currentPage')"
                color="primary"
              />
              <v-radio
                value="selected"
                :label="$t('export.selectedRows')"
                color="primary"
                :disabled="!hasSelectedData"
              />
            </v-radio-group>
          </div>

          <!-- Column Selection -->
          <div class="mb-6">
            <div class="d-flex align-center justify-space-between mb-3">
              <h3 class="text-h6">{{ $t('export.columns') }}</h3>
              <div>
                <v-btn
                  variant="text"
                  size="small"
                  @click="selectAllColumns"
                >
                  {{ $t('export.selectAll') }}
                </v-btn>
                <v-btn
                  variant="text"
                  size="small"
                  @click="clearAllColumns"
                >
                  {{ $t('export.clearAll') }}
                </v-btn>
              </div>
            </div>

            <v-card variant="outlined" max-height="200" class="overflow-y-auto">
              <v-list density="compact">
                <v-list-item
                  v-for="column in columns"
                  :key="column.key"
                  class="px-3"
                >
                  <template v-slot:prepend>
                    <v-checkbox
                      :model-value="exportOptions.selectedColumns.includes(column.key)"
                      @update:model-value="toggleColumn(column.key, $event)"
                      color="primary"
                      hide-details
                      density="compact"
                    />
                  </template>
                  
                  <v-list-item-title>{{ column.title }}</v-list-item-title>
                  
                  <template v-slot:append>
                    <v-chip
                      size="x-small"
                      variant="outlined"
                      :color="getTypeColor(column.type)"
                    >
                      {{ column.type }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </div>

          <!-- Export Options -->
          <div class="mb-6">
            <h3 class="text-h6 mb-3">{{ $t('export.options') }}</h3>
            
            <!-- Common Options -->
            <v-switch
              v-model="exportOptions.includeHeaders"
              :label="$t('export.includeHeaders')"
              color="primary"
              hide-details
              density="compact"
              class="mb-2"
            />

            <!-- PDF Specific Options -->
            <template v-if="selectedFormat === 'pdf'">
              <v-row class="mt-4">
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="exportOptions.pageOrientation"
                    :items="orientationOptions"
                    :label="$t('export.orientation')"
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="exportOptions.pageSize"
                    :items="pageSizeOptions"
                    :label="$t('export.pageSize')"
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                </v-col>
              </v-row>

              <v-text-field
                v-model="exportOptions.title"
                :label="$t('export.documentTitle')"
                variant="outlined"
                density="compact"
                hide-details
                class="mt-3"
              />

              <v-text-field
                v-model="exportOptions.subtitle"
                :label="$t('export.documentSubtitle')"
                variant="outlined"
                density="compact"
                hide-details
                class="mt-3"
              />
            </template>

            <!-- Excel Specific Options -->
            <template v-if="selectedFormat === 'excel'">
              <v-text-field
                v-model="excelOptions.sheetName"
                :label="$t('export.sheetName')"
                variant="outlined"
                density="compact"
                hide-details
                class="mt-3"
              />

              <v-switch
                v-model="excelOptions.includeFilters"
                :label="$t('export.includeFilters')"
                color="primary"
                hide-details
                density="compact"
                class="mt-3"
              />

              <v-switch
                v-model="excelOptions.freezeHeader"
                :label="$t('export.freezeHeader')"
                color="primary"
                hide-details
                density="compact"
              />
            </template>
          </div>

          <!-- Data Preview -->
          <div class="mb-4">
            <h3 class="text-h6 mb-3">{{ $t('export.preview') }}</h3>
            <v-card variant="outlined">
              <v-card-text class="pa-3">
                <div class="text-body-2 text-grey-600">
                  <div>{{ $t('export.totalRows') }}: {{ data.length }}</div>
                  <div>{{ $t('export.selectedColumns') }}: {{ exportOptions.selectedColumns.length }}</div>
                  <div>{{ $t('export.estimatedSize') }}: {{ estimatedFileSize }}</div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="text"
          @click="closeDialog"
          :disabled="isLoading"
        >
          {{ $t('common.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          :disabled="!canExport"
          :loading="isLoading"
          @click="handleExport"
        >
          <v-icon start>mdi-download</v-icon>
          {{ $t('export.exportButton') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { ExportColumn, ExportOptions, ExcelExportOptions } from '@/composables/useExport'

// Props
interface Props {
  modelValue: boolean
  data: any[]
  columns: ExportColumn[]
  defaultFilename: string
  formats: ('pdf' | 'excel')[]
  hasSelectedData?: boolean
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  formats: () => ['pdf', 'excel'],
  hasSelectedData: false,
  isLoading: false
})

// Events
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'export': [options: ExportOptions]
}>()

// Local state
const form = ref()
const selectedFormat = ref<'pdf' | 'excel'>('pdf')

const exportOptions = ref<ExportOptions>({
  format: 'pdf',
  filename: '',
  selectedColumns: [],
  dataSelection: 'all',
  includeHeaders: true,
  pageOrientation: 'portrait',
  pageSize: 'A4',
  title: '',
  subtitle: ''
})

const excelOptions = ref<ExcelExportOptions>({
  ...exportOptions.value,
  sheetName: 'Export',
  includeFilters: false,
  freezeHeader: true,
  columnWidths: 'auto'
})

// Computed
const orientationOptions = computed(() => [
  { title: 'Portrait', value: 'portrait' },
  { title: 'Landscape', value: 'landscape' }
])

const pageSizeOptions = computed(() => [
  { title: 'A4', value: 'A4' },
  { title: 'A3', value: 'A3' },
  { title: 'Letter', value: 'Letter' }
])

const filenameRules = computed(() => [
  (v: string) => !!v || 'Filename is required',
  (v: string) => v.length <= 100 || 'Filename must be less than 100 characters',
  (v: string) => /^[a-zA-Z0-9_\-\s]+$/.test(v) || 'Filename contains invalid characters'
])

const canExport = computed(() => {
  return exportOptions.value.filename.trim() !== '' &&
         exportOptions.value.selectedColumns.length > 0 &&
         props.data.length > 0
})

const estimatedFileSize = computed(() => {
  const rowCount = props.data.length
  const columnCount = exportOptions.value.selectedColumns.length
  const avgCellSize = 20 // bytes
  
  let estimatedBytes = rowCount * columnCount * avgCellSize
  
  if (selectedFormat.value === 'excel') {
    estimatedBytes *= 1.5 // Excel overhead
  } else {
    estimatedBytes *= 2 // PDF overhead
  }
  
  if (estimatedBytes < 1024) {
    return `${Math.round(estimatedBytes)} B`
  } else if (estimatedBytes < 1024 * 1024) {
    return `${Math.round(estimatedBytes / 1024)} KB`
  } else {
    return `${Math.round(estimatedBytes / (1024 * 1024))} MB`
  }
})

// Methods
const getFormatIcon = (format: string): string => {
  const icons = {
    pdf: 'mdi-file-pdf-box',
    excel: 'mdi-file-excel-box'
  }
  return icons[format as keyof typeof icons] || 'mdi-file'
}

const getFileExtension = (format: string): string => {
  const extensions = {
    pdf: '.pdf',
    excel: '.xlsx'
  }
  return extensions[format as keyof typeof extensions] || ''
}

const getTypeColor = (type: string): string => {
  const colors = {
    string: 'blue',
    number: 'green',
    date: 'orange',
    boolean: 'purple'
  }
  return colors[type as keyof typeof colors] || 'grey'
}

const toggleColumn = (columnKey: string, selected: boolean) => {
  if (selected) {
    if (!exportOptions.value.selectedColumns.includes(columnKey)) {
      exportOptions.value.selectedColumns.push(columnKey)
    }
  } else {
    const index = exportOptions.value.selectedColumns.indexOf(columnKey)
    if (index > -1) {
      exportOptions.value.selectedColumns.splice(index, 1)
    }
  }
}

const selectAllColumns = () => {
  exportOptions.value.selectedColumns = props.columns.map(col => col.key)
}

const clearAllColumns = () => {
  exportOptions.value.selectedColumns = []
}

const initializeOptions = () => {
  // Set default filename
  if (!exportOptions.value.filename) {
    exportOptions.value.filename = props.defaultFilename
  }
  
  // Select all columns by default
  if (exportOptions.value.selectedColumns.length === 0) {
    selectAllColumns()
  }
  
  // Set format
  exportOptions.value.format = selectedFormat.value
}

const handleExport = async () => {
  if (!form.value?.validate()) return
  
  const options = {
    ...exportOptions.value,
    format: selectedFormat.value
  }
  
  // Add Excel-specific options if needed
  if (selectedFormat.value === 'excel') {
    Object.assign(options, excelOptions.value)
  }
  
  emit('export', options)
}

const closeDialog = () => {
  emit('update:modelValue', false)
}

// Watchers
watch(selectedFormat, (newFormat) => {
  exportOptions.value.format = newFormat
  
  // Update filename extension
  const baseName = exportOptions.value.filename.replace(/\.(pdf|xlsx)$/, '')
  exportOptions.value.filename = baseName + getFileExtension(newFormat)
})

watch(() => props.modelValue, (show) => {
  if (show) {
    nextTick(() => {
      initializeOptions()
      // Set first available format as default
      if (props.formats.length > 0) {
        selectedFormat.value = props.formats[0]
      }
    })
  }
})

watch(() => props.defaultFilename, (newFilename) => {
  if (newFilename && !exportOptions.value.filename) {
    exportOptions.value.filename = newFilename
  }
})
</script>

<style scoped>
.v-dialog > .v-overlay__content {
  overflow: visible;
}

.v-chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.v-list {
  max-height: 200px;
}

/* Custom scrollbar for column list */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style> 