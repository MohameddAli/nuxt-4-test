import { ref, computed } from 'vue'
import { useLoading } from '@/composables/useLoading'
import { useSnackbar } from '@/composables/useSnackbar'
import { useApi } from '@/composables/useApi'

export interface ExportColumn {
  key: string
  title: string
  type: 'string' | 'number' | 'date' | 'boolean'
  format?: string
  width?: number
}

export interface ExportOptions {
  format: 'pdf' | 'excel'
  filename: string
  selectedColumns: string[]
  dataSelection: 'all' | 'current' | 'selected'
  includeHeaders: boolean
  pageOrientation?: 'portrait' | 'landscape'
  pageSize?: 'A4' | 'A3' | 'Letter'
  title?: string
  subtitle?: string
}

export interface PDFExportOptions extends ExportOptions {
  margins?: { top: number; right: number; bottom: number; left: number }
  fontSize?: number
  includeTimestamp?: boolean
  logoUrl?: string
}

export interface ExcelExportOptions extends ExportOptions {
  sheetName?: string
  includeFilters?: boolean
  freezeHeader?: boolean
  columnWidths?: 'auto' | 'fixed'
}

export interface ExportJob {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  error?: string
  downloadUrl?: string
  filename: string
}

/**
 * Export Composable
 * Provides comprehensive export functionality for PDF and Excel formats
 */
export const useExport = () => {
  const { post } = useApi()
  const { withLoading } = useLoading()
  const { showSuccess, showError, showWarning } = useSnackbar()

  // State
  const isExporting = ref(false)
  const exportProgress = ref(0)
  const exportError = ref<string | null>(null)
  const currentJob = ref<ExportJob | null>(null)

  // Track active export jobs
  const activeJobs = ref<Map<string, ExportJob>>(new Map())

  /**
   * Generate a safe filename with timestamp
   */
  const generateFilename = (baseName: string, format: 'pdf' | 'excel'): string => {
    const timestamp = new Date().toISOString()
      .replace(/[:.]/g, '-')
      .substring(0, 19)
    
    const sanitizedName = baseName
      .replace(/[^a-zA-Z0-9\s-_]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50)
    
    const extension = format === 'pdf' ? 'pdf' : 'xlsx'
    return `${sanitizedName}_Export_${timestamp}.${extension}`
  }

  /**
   * Validate export data and options
   */
  const validateExportData = (data: any[], columns: ExportColumn[], options: ExportOptions): boolean => {
    if (!data || data.length === 0) {
      showWarning('No data available for export')
      return false
    }

    if (!columns || columns.length === 0) {
      showWarning('No columns specified for export')
      return false
    }

    if (!options.selectedColumns || options.selectedColumns.length === 0) {
      showWarning('Please select at least one column to export')
      return false
    }

    if (!options.filename || options.filename.trim() === '') {
      showWarning('Please provide a filename for the export')
      return false
    }

    return true
  }

  /**
   * Filter and prepare data for export
   */
  const prepareExportData = (data: any[], columns: ExportColumn[], options: ExportOptions) => {
    // Filter columns based on selection
    const selectedColumns = columns.filter(col => options.selectedColumns.includes(col.key))
    
    // Filter data based on selection type
    let exportData = data
    if (options.dataSelection === 'selected') {
      // This would be handled by the calling component to pass only selected rows
      exportData = data
    }

    // Transform data for export
    const transformedData = exportData.map(row => {
      const exportRow: any = {}
      selectedColumns.forEach(col => {
        let value = row[col.key]
        
        // Format data based on column type
        switch (col.type) {
          case 'date':
            if (value) {
              value = new Date(value).toLocaleDateString()
            }
            break
          case 'number':
            if (value !== null && value !== undefined) {
              value = Number(value)
            }
            break
          case 'boolean':
            value = value ? 'Yes' : 'No'
            break
          default:
            value = value || ''
        }
        
        exportRow[col.key] = value
      })
      return exportRow
    })

    return {
      data: transformedData,
      columns: selectedColumns
    }
  }

  /**
   * Export data using client-side generation (default)
   */
  const exportDataClient = async (data: any[], columns: ExportColumn[], options: ExportOptions) => {
    if (!validateExportData(data, columns, options)) {
      return
    }

    const prepared = prepareExportData(data, columns, options)
    
    // Generate filename if not provided
    if (!options.filename) {
      options.filename = generateFilename('Export', options.format)
    }

    try {
      if (options.format === 'excel') {
        await exportToExcelClient(prepared.data, prepared.columns, options as ExcelExportOptions)
      } else if (options.format === 'pdf') {
        await exportToPDFClient(prepared.data, prepared.columns, options as PDFExportOptions)
      }
    } catch (error: any) {
      exportError.value = error.message || 'Export failed'
      showError(`Export failed: ${exportError.value}`)
      throw error
    }
  }



  /**
   * Client-side Excel export using SheetJS
   */
  const exportToExcelClient = async (data: any[], columns: ExportColumn[], options: ExcelExportOptions) => {
    // Dynamic import to reduce bundle size
    const XLSX = await import('xlsx')
    
    exportProgress.value = 10

    // Create workbook
    const workbook = XLSX.utils.book_new()
    
    // Prepare headers
    const headers = options.includeHeaders 
      ? columns.map(col => col.title)
      : []
    
    exportProgress.value = 30

    // Prepare data rows
    const rows = data.map(row => 
      columns.map(col => row[col.key])
    )

    exportProgress.value = 50

    // Combine headers and data
    const worksheetData = options.includeHeaders 
      ? [headers, ...rows]
      : rows

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    
    exportProgress.value = 70

    // Set column widths
    if (options.columnWidths === 'auto') {
      const colWidths = columns.map(col => ({ wch: Math.max(col.title.length + 2, 15) }))
      worksheet['!cols'] = colWidths
    }

    // Add worksheet to workbook
    const sheetName = options.sheetName || 'Export'
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    exportProgress.value = 90

    // Generate file
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      compression: true
    })

    // Create blob and download
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    downloadFile(blob, options.filename)
    exportProgress.value = 100

    showSuccess('Excel export completed successfully')
  }

  /**
   * Client-side PDF export using jsPDF
   */
  const exportToPDFClient = async (data: any[], columns: ExportColumn[], options: PDFExportOptions) => {
    // Import jsPDF first
    const jsPDFModule = await import('jspdf')
    const jsPDF = jsPDFModule.default
    
    // Import and apply the autoTable plugin
    const autoTableModule = await import('jspdf-autotable')
    // Apply the plugin to jsPDF - version 5.x uses applyPlugin
    if (autoTableModule.applyPlugin) {
      autoTableModule.applyPlugin(jsPDF)
    }
    
    exportProgress.value = 10

    // Create PDF document
    const doc = new jsPDF({
      orientation: options.pageOrientation || 'portrait',
      unit: 'mm',
      format: options.pageSize || 'A4'
    })

    exportProgress.value = 30

    // Add title
    if (options.title) {
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(options.title, 20, 20)
    }

    // Add subtitle
    if (options.subtitle) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(options.subtitle, 20, options.title ? 30 : 20)
    }

    exportProgress.value = 50

    // Add timestamp if enabled
    if (options.includeTimestamp) {
      const timestamp = `Generated on: ${new Date().toLocaleString()}`
      doc.setFontSize(8)
      doc.text(timestamp, 20, doc.internal.pageSize.height - 10)
    }

    exportProgress.value = 70

    // Create table
    const tableColumns = columns.map(col => ({ 
      header: col.title, 
      dataKey: col.key 
    }))

    const tableData = data.map(row => {
      const tableRow: any = {}
      columns.forEach(col => {
        tableRow[col.key] = row[col.key] || ''
      })
      return tableRow
    })

    // Add table to PDF using autoTable function
    // Try multiple ways to call autoTable based on how the plugin is registered
    const autoTableOptions = {
      columns: tableColumns,
      body: tableData,
      startY: options.title || options.subtitle ? 40 : 20,
      margin: options.margins || { top: 20, right: 20, bottom: 20, left: 20 },
      styles: {
        cellPadding: 3,
        fontSize: options.fontSize || 10
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold' as const
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    }

    // Try the plugin method first
    if (typeof (doc as any).autoTable === 'function') {
      ;(doc as any).autoTable(autoTableOptions)
    } else {
      throw new Error('autoTable function not available. jspdf-autotable plugin may not be properly loaded.')
    }

    exportProgress.value = 90

    // Generate blob and download
    const pdfBlob = doc.output('blob')
    downloadFile(pdfBlob, options.filename)
    exportProgress.value = 100

    showSuccess('PDF export completed successfully')
  }



  /**
   * Download file from URL or Blob
   */
  const downloadFile = (urlOrBlob: string | Blob, filename: string) => {
    const link = document.createElement('a')
    
    if (typeof urlOrBlob === 'string') {
      link.href = urlOrBlob
    } else {
      link.href = URL.createObjectURL(urlOrBlob)
    }
    
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up object URL
    if (typeof urlOrBlob !== 'string') {
      setTimeout(() => URL.revokeObjectURL(link.href), 100)
    }
  }

  /**
   * Main export function with loading wrapper
   */
  const exportData = async (
    data: any[], 
    columns: ExportColumn[], 
    options: ExportOptions
  ) => {
    exportError.value = null
    exportProgress.value = 0

    await withLoading(
      async () => {
        isExporting.value = true
        
        if (!validateExportData(data, columns, options)) {
          return
        }

        const prepared = prepareExportData(data, columns, options)
        
        // Generate filename if not provided
        if (!options.filename) {
          options.filename = generateFilename('Export', options.format)
        }

        try {
          if (options.format === 'excel') {
            await exportToExcelClient(prepared.data, prepared.columns, options as ExcelExportOptions)
          } else if (options.format === 'pdf') {
            await exportToPDFClient(prepared.data, prepared.columns, options as PDFExportOptions)
          }
        } catch (error: any) {
          exportError.value = error.message || 'Export failed'
          showError(`Export failed: ${exportError.value}`)
          throw error
        }
      },
      { 
        text: `Exporting to ${options.format.toUpperCase()}...`, 
        type: 'api' 
      }
    ).finally(() => {
      isExporting.value = false
      exportProgress.value = 0
    })
  }

  /**
   * Cancel export (client-side only)
   */
  const cancelExport = async (jobId?: string) => {
    // For client-side exports, we can't cancel after they start
    // This is mainly for UI consistency
    showWarning('Client-side exports cannot be cancelled once started')
  }

  /**
   * Get export job status (client-side only)
   */
  const getJobStatus = (jobId: string): ExportJob | undefined => {
    // For client-side exports, jobs are immediate
    return undefined
  }

  // Computed properties (client-side only)
  const hasActiveJobs = computed(() => false) // No background jobs in client-side
  const activeJobsList = computed(() => []) // No background jobs in client-side

  return {
    // State
    isExporting: readonly(isExporting),
    exportProgress: readonly(exportProgress),
    exportError: readonly(exportError),
    currentJob: readonly(currentJob),
    hasActiveJobs,
    activeJobsList,

    // Methods
    exportData,
    cancelExport,
    getJobStatus,
    downloadFile,
    generateFilename,
    validateExportData,

    // Utilities
    exportToExcelClient,
    exportToPDFClient
  }
} 