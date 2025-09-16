import { ref, readonly } from 'vue'

/**
 * Composable for chart export functionality
 * يدير وظائف تصدير المخططات بصيغ مختلفة
 */

export interface ExportOptions {
  format: 'png' | 'jpg' | 'jpeg' | 'pdf' | 'csv' | 'xlsx' | 'svg'
  filename?: string
  quality?: number
  width?: number
  height?: number
  backgroundColor?: string
  includeTitle?: boolean
  includeLegend?: boolean
  includeMetadata?: boolean
}

export interface ExportResult {
  success: boolean
  data?: string | Blob
  filename?: string
  error?: string
}

export const useChartExport = () => {
  const isExporting = ref(false)
  const exportProgress = ref(0)
  const lastExportResult = ref<ExportResult | null>(null)

  // تحديث شريط التقدم | Update Progress Bar
  const updateProgress = (progress: number) => {
    exportProgress.value = Math.min(100, Math.max(0, progress))
  }

  // توليد اسم ملف فريد | Generate Unique Filename
  const generateFilename = (format: string, customName?: string): string => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')
    const baseName = customName || 'chart-export'
    return `${baseName}-${timestamp}.${format}`
  }

  // تصدير كصورة | Export as Image
  const exportAsImage = async (
    element: HTMLElement,
    options: ExportOptions
  ): Promise<ExportResult> => {
    try {
      updateProgress(10)

      // تحميل مكتبة html2canvas ديناميكياً | Dynamically load html2canvas
      const html2canvas = (await import('html2canvas')).default

      const canvas = await html2canvas(element, {
        backgroundColor: options.backgroundColor || '#ffffff',
        scale: options.quality || 1,
        width: options.width,
        height: options.height,
        logging: false,
        useCORS: true,
        allowTaint: true
      })

      updateProgress(60)

      const format = options.format === 'jpg' ? 'jpeg' : options.format
      const dataURL = canvas.toDataURL(`image/${format}`, options.quality || 0.9)
      
      updateProgress(80)

      // تحميل الملف | Download File
      const filename = options.filename || generateFilename(options.format)
      await downloadDataURL(dataURL, filename)

      updateProgress(100)

      return {
        success: true,
        data: dataURL,
        filename
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to export as image'
      }
    }
  }

  // تصدير كـ PDF | Export as PDF
  const exportAsPDF = async (
    element: HTMLElement,
    options: ExportOptions
  ): Promise<ExportResult> => {
    try {
      updateProgress(10)

      // تحميل المكتبات ديناميكياً | Dynamically load libraries
      const [html2canvas, { jsPDF }] = await Promise.all([
        import('html2canvas').then(m => m.default),
        import('jspdf')
      ])

      const canvas = await html2canvas(element, {
        backgroundColor: options.backgroundColor || '#ffffff',
        scale: options.quality || 1,
        logging: false,
        useCORS: true
      })

      updateProgress(40)

      const imgData = canvas.toDataURL('image/png')
      const imgWidth = canvas.width
      const imgHeight = canvas.height

      // تحديد اتجاه الصفحة | Determine page orientation
      const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait'
      
      const pdf = new jsPDF({
        orientation,
        unit: 'px',
        format: [imgWidth, imgHeight]
      })

      updateProgress(70)

      // إضافة عنوان إذا طلب | Add title if requested
      if (options.includeTitle) {
        pdf.setFontSize(16)
        pdf.setTextColor(40, 40, 40)
        pdf.text('Chart Export', 20, 30)
      }

      // إضافة الصورة | Add image
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)

      updateProgress(90)

      // إضافة metadata إذا طلب | Add metadata if requested
      if (options.includeMetadata) {
        pdf.setProperties({
          title: 'Chart Export',
          creator: 'Chart System',
          creationDate: new Date()
        })
      }

      const filename = options.filename || generateFilename('pdf')
      pdf.save(filename)

      updateProgress(100)

      return {
        success: true,
        filename
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to export as PDF'
      }
    }
  }

  // تصدير بيانات المخطط كـ CSV | Export Chart Data as CSV
  const exportAsCSV = async (
    data: any,
    options: ExportOptions
  ): Promise<ExportResult> => {
    try {
      updateProgress(20)

      let csvContent = ''

      // التعامل مع بيانات Chart.js | Handle Chart.js data format
      if (data && data.labels && data.datasets) {
        const { labels, datasets } = data
        
        // رؤوس الأعمدة | Column Headers
        const headers = ['Label', ...datasets.map((d: any) => d.label || 'Dataset')]
        csvContent += headers.join(',') + '\n'

        updateProgress(50)

        // بيانات الصفوف | Row Data
        labels.forEach((label: string, index: number) => {
          const row = [
            `"${label}"`,
            ...datasets.map((dataset: any) => 
              dataset.data[index] !== undefined ? dataset.data[index] : 0
            )
          ]
          csvContent += row.join(',') + '\n'
        })
      }
      // التعامل مع بيانات عادية | Handle regular array data
      else if (Array.isArray(data) && data.length > 0) {
        const headers = Object.keys(data[0])
        csvContent += headers.map(h => `"${h}"`).join(',') + '\n'

        updateProgress(50)

        data.forEach(row => {
          const values = headers.map(header => {
            const value = row[header]
            return typeof value === 'string' ? `"${value}"` : value
          })
          csvContent += values.join(',') + '\n'
        })
      } else {
        throw new Error('Invalid data format for CSV export')
      }

      updateProgress(80)

      // إنشاء وتحميل الملف | Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const filename = options.filename || generateFilename('csv')
      await downloadBlob(blob, filename)

      updateProgress(100)

      return {
        success: true,
        data: blob,
        filename
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to export as CSV'
      }
    }
  }

  // تصدير كـ SVG | Export as SVG
  const exportAsSVG = async (
    element: HTMLElement,
    options: ExportOptions
  ): Promise<ExportResult> => {
    try {
      updateProgress(20)

      // البحث عن عنصر SVG داخل العنصر | Find SVG element within the element
      const svgElement = element.querySelector('svg')
      if (!svgElement) {
        throw new Error('No SVG element found for export')
      }

      updateProgress(50)

      // نسخ عنصر SVG | Clone SVG element
      const clonedSvg = svgElement.cloneNode(true) as SVGElement
      
      // إضافة أنماط CSS الضرورية | Add necessary CSS styles
      const styles = getComputedStyle(svgElement)
      Object.assign(clonedSvg.style, {
        backgroundColor: options.backgroundColor || 'transparent'
      })

      updateProgress(80)

      // تحويل إلى نص | Convert to text
      const serializer = new XMLSerializer()
      const svgString = serializer.serializeToString(clonedSvg)
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' })

      const filename = options.filename || generateFilename('svg')
      await downloadBlob(svgBlob, filename)

      updateProgress(100)

      return {
        success: true,
        data: svgBlob,
        filename
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to export as SVG'
      }
    }
  }

  // الدالة الرئيسية للتصدير | Main Export Function
  const exportChart = async (
    elementOrData: HTMLElement | any,
    options: ExportOptions
  ): Promise<ExportResult> => {
    if (isExporting.value) {
      return {
        success: false,
        error: 'Export already in progress'
      }
    }

    isExporting.value = true
    exportProgress.value = 0

    try {
      let result: ExportResult

      switch (options.format) {
        case 'png':
        case 'jpg':
        case 'jpeg':
          if (!(elementOrData instanceof HTMLElement)) {
            throw new Error('Element required for image export')
          }
          result = await exportAsImage(elementOrData, options)
          break

        case 'pdf':
          if (!(elementOrData instanceof HTMLElement)) {
            throw new Error('Element required for PDF export')
          }
          result = await exportAsPDF(elementOrData, options)
          break

        case 'csv':
          result = await exportAsCSV(elementOrData, options)
          break

        case 'svg':
          if (!(elementOrData instanceof HTMLElement)) {
            throw new Error('Element required for SVG export')
          }
          result = await exportAsSVG(elementOrData, options)
          break

        default:
          throw new Error(`Unsupported export format: ${options.format}`)
      }

      lastExportResult.value = result
      return result

    } catch (error: any) {
      const errorResult = {
        success: false,
        error: error.message || 'Export failed'
      }
      lastExportResult.value = errorResult
      return errorResult

    } finally {
      isExporting.value = false
      // إعادة تعيين شريط التقدم بعد ثانيتين | Reset progress after 2 seconds
      setTimeout(() => {
        exportProgress.value = 0
      }, 2000)
    }
  }

  // تصدير بيانات متعددة | Export Multiple Data
  const exportMultiple = async (
    exports: Array<{
      element: HTMLElement
      data?: any
      options: ExportOptions
    }>
  ): Promise<ExportResult[]> => {
    const results: ExportResult[] = []
    
    for (let i = 0; i < exports.length; i++) {
      const { element, data, options } = exports[i]
      const result = await exportChart(element || data, options)
      results.push(result)
      
      // فترة انتظار قصيرة بين التصديرات | Short delay between exports
      if (i < exports.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    return results
  }

  // دوال مساعدة للتحميل | Helper Functions for Download
  const downloadDataURL = async (dataURL: string, filename: string): Promise<void> => {
    const link = document.createElement('a')
    link.download = filename
    link.href = dataURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadBlob = async (blob: Blob, filename: string): Promise<void> => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = filename
    link.href = url
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // دوال مساعدة للتحقق من دعم التنسيق | Helper to Check Format Support
  const isFormatSupported = (format: string): boolean => {
    const supportedFormats = ['png', 'jpg', 'jpeg', 'pdf', 'csv', 'svg']
    return supportedFormats.includes(format.toLowerCase())
  }

  // دالة لاستخراج بيانات Chart.js | Function to extract Chart.js data
  const extractChartData = (chartInstance: any) => {
    if (!chartInstance || !chartInstance.data) {
      throw new Error('Invalid chart instance')
    }
    return chartInstance.data
  }

  // إعادة تعيين الحالة | Reset State
  const resetState = () => {
    isExporting.value = false
    exportProgress.value = 0
    lastExportResult.value = null
  }

  return {
    // الحالة | State
    isExporting: readonly(isExporting),
    exportProgress: readonly(exportProgress),
    lastExportResult: readonly(lastExportResult),

    // الوظائف | Functions
    exportChart,
    exportAsImage,
    exportAsPDF,
    exportAsCSV,
    exportAsSVG,
    exportMultiple,
    extractChartData,
    isFormatSupported,
    generateFilename,
    resetState
  }
}

// دوال مساعدة لإعدادات التصدير الشائعة | Helper for Common Export Presets
export const createExportPresets = () => {
  return {
    // إعدادات عالية الجودة | High Quality Settings
    highQuality: {
      quality: 2.0,
      backgroundColor: '#ffffff'
    },

    // إعدادات للطباعة | Print Settings
    print: {
      format: 'pdf' as const,
      quality: 2.0,
      backgroundColor: '#ffffff',
      includeTitle: true,
      includeMetadata: true
    },

    // إعدادات للويب | Web Settings
    web: {
      format: 'png' as const,
      quality: 1.0,
      backgroundColor: 'transparent'
    },

    // إعدادات للعرض التقديمي | Presentation Settings
    presentation: {
      format: 'png' as const,
      quality: 1.5,
      width: 1920,
      height: 1080,
      backgroundColor: '#ffffff'
    },

    // إعدادات للبيانات | Data Settings
    data: {
      format: 'csv' as const
    }
  }
}

// نوع لإعدادات التصدير المحددة مسبقاً | Type for Predefined Export Settings
export type ExportPreset = keyof ReturnType<typeof createExportPresets>
