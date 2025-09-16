<template>
  <div class="export-options-form">
    <!-- Format Selection -->
    <div class="mb-4">
      <label class="text-subtitle-2 mb-2 d-block">{{ $t('export.format') }}</label>
      <v-btn-toggle
        v-model="selectedFormat"
        mandatory
        color="primary"
        variant="outlined"
        density="compact"
        class="w-100"
      >
        <v-btn
          v-for="format in formats"
          :key="format"
          :value="format"
          size="small"
          class="flex-grow-1"
        >
          <v-icon start size="16">{{ getFormatIcon(format) }}</v-icon>
          {{ $t(`export.${format}`) }}
        </v-btn>
      </v-btn-toggle>
    </div>

    <!-- Filename -->
    <div class="mb-4">
      <v-text-field
        v-model="exportOptions.filename"
        :label="$t('export.filename')"
        variant="outlined"
        density="compact"
        :suffix="getFileExtension(selectedFormat)"
        hide-details
        required
      />
    </div>

    <!-- Data Selection -->
    <div class="mb-4">
      <label class="text-subtitle-2 mb-2 d-block">{{ $t('export.dataSelection') }}</label>
      <v-radio-group
        v-model="exportOptions.dataSelection"
        density="compact"
        hide-details
      >
        <v-radio
          value="all"
          :label="$t('export.allData')"
          color="primary"
          density="compact"
        />
        <v-radio
          value="current"
          :label="$t('export.currentPage')"
          color="primary"
          density="compact"
        />
        <v-radio
          value="selected"
          :label="$t('export.selectedRows')"
          color="primary"
          density="compact"
          :disabled="!hasSelectedData"
        />
      </v-radio-group>
    </div>

    <!-- Quick Column Selection -->
    <div class="mb-4">
      <div class="d-flex align-center justify-space-between mb-2">
        <label class="text-subtitle-2">{{ $t('export.columns') }}</label>
        <div>
          <v-btn
            variant="text"
            size="x-small"
            @click="selectAllColumns"
          >
            {{ $t('export.selectAll') }}
          </v-btn>
          <v-btn
            variant="text"
            size="x-small"
            @click="clearAllColumns"
          >
            {{ $t('export.clearAll') }}
          </v-btn>
        </div>
      </div>

      <div class="columns-preview">
        <v-chip
          v-for="column in selectedColumns"
          :key="column.key"
          size="small"
          closable
          @click:close="removeColumn(column.key)"
          class="ma-1"
        >
          {{ column.title }}
        </v-chip>
        
        <v-chip
          v-if="unselectedColumns.length > 0"
          size="small"
          variant="outlined"
          @click="showAllColumns = !showAllColumns"
          class="ma-1"
        >
          +{{ unselectedColumns.length }} more
        </v-chip>
      </div>

      <!-- Expandable column list -->
      <v-expand-transition>
        <div v-if="showAllColumns" class="mt-2">
          <v-card variant="outlined" max-height="120" class="overflow-y-auto">
            <v-list density="compact">
              <v-list-item
                v-for="column in columns"
                :key="column.key"
                class="px-2"
                density="compact"
              >
                <template v-slot:prepend>
                  <v-checkbox
                    :model-value="isColumnSelected(column.key)"
                    @update:model-value="toggleColumn(column.key, $event)"
                    color="primary"
                    hide-details
                    density="compact"
                  />
                </template>
                
                <v-list-item-title class="text-body-2">
                  {{ column.title }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </div>
      </v-expand-transition>
    </div>

    <!-- Options -->
    <div class="mb-4">
      <v-switch
        v-model="exportOptions.includeHeaders"
        :label="$t('export.includeHeaders')"
        color="primary"
        hide-details
        density="compact"
      />
    </div>

    <!-- Format-specific options -->
    <div v-if="selectedFormat === 'pdf'" class="mb-4">
      <v-select
        v-model="exportOptions.pageOrientation"
        :items="orientationOptions"
        :label="$t('export.orientation')"
        variant="outlined"
        density="compact"
        hide-details
      />
    </div>

    <div v-if="selectedFormat === 'excel'" class="mb-4">
      <v-text-field
        v-model="excelOptions.sheetName"
        :label="$t('export.sheetName')"
        variant="outlined"
        density="compact"
        hide-details
      />
    </div>

    <!-- Data summary -->
    <div class="mb-4">
      <v-card variant="tonal" color="primary">
        <v-card-text class="pa-3">
          <div class="text-caption">
            <div>{{ $t('export.totalRows') }}: {{ data.length }}</div>
            <div>{{ $t('export.selectedColumns') }}: {{ exportOptions.selectedColumns.length }}</div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Action buttons -->
    <div class="d-flex gap-2">
      <v-btn
        variant="text"
        size="small"
        @click="$emit('cancel')"
        :disabled="disabled"
        block
      >
        {{ $t('common.cancel') }}
      </v-btn>
      <v-btn
        color="primary"
        size="small"
        :disabled="!canExport || disabled"
        @click="handleExport"
        block
      >
        <v-icon start size="16">mdi-download</v-icon>
        {{ $t('export.export') }}
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { ExportColumn, ExportOptions, ExcelExportOptions } from '@/composables/useExport'

// Props
interface Props {
  data: any[]
  columns: ExportColumn[]
  defaultFilename: string
  formats: ('pdf' | 'excel')[]
  hasSelectedData?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  formats: () => ['pdf', 'excel'],
  hasSelectedData: false,
  disabled: false
})

// Events
const emit = defineEmits<{
  'export': [options: ExportOptions]
  'cancel': []
}>()

// Local state
const selectedFormat = ref<'pdf' | 'excel'>('pdf')
const showAllColumns = ref(false)

const exportOptions = ref<ExportOptions>({
  format: 'pdf',
  filename: '',
  selectedColumns: [],
  dataSelection: 'all',
  includeHeaders: true,
  pageOrientation: 'portrait',
  pageSize: 'A4'
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

const selectedColumns = computed(() => {
  return props.columns.filter(col => 
    exportOptions.value.selectedColumns.includes(col.key)
  )
})

const unselectedColumns = computed(() => {
  return props.columns.filter(col => 
    !exportOptions.value.selectedColumns.includes(col.key)
  )
})

const canExport = computed(() => {
  return exportOptions.value.filename.trim() !== '' &&
         exportOptions.value.selectedColumns.length > 0 &&
         props.data.length > 0
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

const isColumnSelected = (columnKey: string): boolean => {
  return exportOptions.value.selectedColumns.includes(columnKey)
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

const removeColumn = (columnKey: string) => {
  toggleColumn(columnKey, false)
}

const selectAllColumns = () => {
  exportOptions.value.selectedColumns = props.columns.map(col => col.key)
}

const clearAllColumns = () => {
  exportOptions.value.selectedColumns = []
}

const initializeOptions = () => {
  // Set default filename
  exportOptions.value.filename = props.defaultFilename
  
  // Select all columns by default
  if (exportOptions.value.selectedColumns.length === 0) {
    selectAllColumns()
  }
  
  // Set format
  exportOptions.value.format = selectedFormat.value
}

const handleExport = () => {
  if (!canExport.value) return
  
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

// Watchers
watch(selectedFormat, (newFormat) => {
  exportOptions.value.format = newFormat
  
  // Update filename extension
  const baseName = exportOptions.value.filename.replace(/\.(pdf|xlsx)$/, '')
  exportOptions.value.filename = baseName + getFileExtension(newFormat)
})

watch(() => props.defaultFilename, (newFilename) => {
  if (newFilename) {
    exportOptions.value.filename = newFilename
  }
})

// Initialize
nextTick(() => {
  initializeOptions()
  if (props.formats.length > 0) {
    selectedFormat.value = props.formats[0]
  }
})
</script>

<style scoped>
.export-options-form {
  min-width: 280px;
}

.columns-preview {
  min-height: 32px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  padding: 4px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.columns-preview:empty::before {
  content: 'No columns selected';
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 0.875rem;
  padding: 4px 8px;
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-on-surface), 0.2);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-on-surface), 0.3);
}
</style> 