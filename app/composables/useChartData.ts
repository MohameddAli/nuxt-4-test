import { ref, computed, readonly, onMounted, onUnmounted } from 'vue'

/**
 * Composable for managing chart data
 * يدير بيانات المخططات مع التحميل والتحديث والتصفية
 */
export const useChartData = <T = any>(
  apiEndpoint?: string,
  options: {
    autoRefresh?: boolean
    refreshInterval?: number
    defaultParams?: Record<string, any>
    transform?: (data: any) => T
  } = {}
) => {
  const {
    autoRefresh = false,
    refreshInterval = 30000,
    defaultParams = {},
    transform
  } = options

  // الحالة التفاعلية | Reactive State
  const chartData = ref<T | null>(null)
  const rawData = ref<any>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)
  const refreshTimer = ref<NodeJS.Timeout | null>(null)

  // معاملات الطلب الحالية | Current Request Parameters
  const currentParams = ref({ ...defaultParams })

  // جلب البيانات | Fetch Data
  const fetchData = async (params: Record<string, any> = {}) => {
    if (!apiEndpoint) {
      console.warn('No API endpoint provided for useChartData')
      return
    }

    loading.value = true
    error.value = null

    try {
      const mergedParams = { ...currentParams.value, ...params }
      
      const response = await $fetch(apiEndpoint, {
        method: 'GET',
        params: mergedParams
      })

      rawData.value = response.data || response
      
      // تطبيق التحويل إذا كان متوفراً | Apply transformation if available
      if (transform && typeof transform === 'function') {
        chartData.value = transform(rawData.value)
      } else {
        chartData.value = rawData.value
      }

      lastUpdated.value = new Date()
      currentParams.value = mergedParams

    } catch (err: any) {
      console.error('Error fetching chart data:', err)
      error.value = err.message || 'Failed to fetch data'
      chartData.value = null
    } finally {
      loading.value = false
    }
  }

  // تحديث البيانات | Refresh Data
  const refreshData = async (params?: Record<string, any>) => {
    await fetchData(params || currentParams.value)
  }

  // تصفية البيانات | Filter Data
  const filterData = (filterFn: (item: any) => boolean) => {
    if (!rawData.value || !Array.isArray(rawData.value)) {
      console.warn('No data to filter or data is not an array')
      return
    }

    try {
      const filtered = rawData.value.filter(filterFn)
      
      if (transform && typeof transform === 'function') {
        chartData.value = transform(filtered)
      } else {
        chartData.value = filtered as T
      }
    } catch (err) {
      console.error('Error filtering data:', err)
    }
  }

  // تحويل البيانات | Transform Data
  const transformData = (transformFn: (data: any) => T) => {
    if (!rawData.value) {
      console.warn('No data to transform')
      return
    }

    try {
      chartData.value = transformFn(rawData.value)
    } catch (err) {
      console.error('Error transforming data:', err)
    }
  }

  // إعداد التحديث التلقائي | Setup Auto Refresh
  const setupAutoRefresh = () => {
    if (autoRefresh && refreshInterval > 0) {
      refreshTimer.value = setInterval(() => {
        if (!loading.value) {
          refreshData()
        }
      }, refreshInterval)
    }
  }

  // إيقاف التحديث التلقائي | Clear Auto Refresh
  const clearAutoRefresh = () => {
    if (refreshTimer.value) {
      clearInterval(refreshTimer.value)
      refreshTimer.value = null
    }
  }

  // إعادة تعيين البيانات | Reset Data
  const resetData = () => {
    chartData.value = null
    rawData.value = null
    error.value = null
    lastUpdated.value = null
    currentParams.value = { ...defaultParams }
  }

  // تحديث المعاملات | Update Parameters
  const updateParams = (newParams: Record<string, any>, shouldRefetch = true) => {
    currentParams.value = { ...currentParams.value, ...newParams }
    
    if (shouldRefetch) {
      fetchData()
    }
  }

  // دوال مساعدة للفترات الزمنية | Helper Functions for Time Periods
  const setPeriod = (period: string) => {
    updateParams({ period })
  }

  const setDateRange = (startDate: Date, endDate: Date) => {
    updateParams({
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    })
  }

  // الحاسبات | Computed Properties
  const hasData = computed(() => {
    return !!chartData.value && 
           (Array.isArray(chartData.value) ? chartData.value.length > 0 : true)
  })

  const isStale = computed(() => {
    if (!lastUpdated.value) return false
    const now = new Date()
    const diff = now.getTime() - lastUpdated.value.getTime()
    return diff > (refreshInterval * 2) // اعتبار البيانات قديمة بعد ضعف المدة
  })

  const dataAge = computed(() => {
    if (!lastUpdated.value) return null
    const now = new Date()
    const diff = now.getTime() - lastUpdated.value.getTime()
    return Math.floor(diff / 1000) // بالثواني
  })

  // دورة الحياة | Lifecycle
  onMounted(() => {
    setupAutoRefresh()
  })

  onUnmounted(() => {
    clearAutoRefresh()
  })

  // إرجاع الواجهة العامة | Return Public Interface
  return {
    // البيانات | Data
    chartData: readonly(chartData),
    rawData: readonly(rawData),
    loading: readonly(loading),
    error: readonly(error),
    lastUpdated: readonly(lastUpdated),
    currentParams: readonly(currentParams),

    // الحاسبات | Computed
    hasData,
    isStale,
    dataAge,

    // الوظائف | Functions
    fetchData,
    refreshData,
    filterData,
    transformData,
    resetData,
    updateParams,
    setPeriod,
    setDateRange,
    setupAutoRefresh,
    clearAutoRefresh
  }
}

// دالة مساعدة لإنشاء محول بيانات Chart.js | Helper for Chart.js data transformer
export const createChartTransformer = (config: {
  labelKey: string
  datasets: Array<{
    key: string
    label: string
    backgroundColor?: string
    borderColor?: string
    [key: string]: any
  }>
}) => {
  return (data: any[]) => {
    if (!Array.isArray(data)) {
      console.warn('Data must be an array for chart transformation')
      return null
    }

    const labels = data.map(item => item[config.labelKey])
    const datasets = config.datasets.map(datasetConfig => ({
      label: datasetConfig.label,
      data: data.map(item => item[datasetConfig.key] || 0),
      backgroundColor: datasetConfig.backgroundColor,
      borderColor: datasetConfig.borderColor,
      ...datasetConfig
    }))

    return {
      labels,
      datasets
    }
  }
}

// دالة مساعدة لإنشاء مصفيات شائعة | Helper for common filters
export const createCommonFilters = () => {
  return {
    // تصفية حسب النطاق الزمني | Filter by date range
    dateRange: (startDate: Date, endDate: Date, dateKey = 'date') => {
      return (item: any) => {
        const itemDate = new Date(item[dateKey])
        return itemDate >= startDate && itemDate <= endDate
      }
    },

    // تصفية حسب القيم غير الصفرية | Filter non-zero values
    nonZero: (key: string) => {
      return (item: any) => {
        const value = item[key]
        return value !== null && value !== undefined && value !== 0
      }
    },

    // تصفية حسب القيم فوق عتبة معينة | Filter above threshold
    above: (key: string, threshold: number) => {
      return (item: any) => {
        const value = Number(item[key])
        return !isNaN(value) && value > threshold
      }
    },

    // تصفية حسب القيم تحت عتبة معينة | Filter below threshold
    below: (key: string, threshold: number) => {
      return (item: any) => {
        const value = Number(item[key])
        return !isNaN(value) && value < threshold
      }
    },

    // تصفية حسب النمط النصي | Filter by text pattern
    textMatch: (key: string, pattern: string, caseSensitive = false) => {
      const regex = new RegExp(pattern, caseSensitive ? 'g' : 'gi')
      return (item: any) => {
        const value = String(item[key] || '')
        return regex.test(value)
      }
    },

    // تصفية حسب قائمة قيم | Filter by value list
    inList: (key: string, values: any[]) => {
      return (item: any) => {
        return values.includes(item[key])
      }
    }
  }
}

// نوع للبيانات المحولة | Type for transformed data
export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
  [key: string]: any
}

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

// نوع لخيارات المصفي | Type for filter options
export interface FilterOptions {
  dateRange?: {
    start: Date
    end: Date
    key?: string
  }
  valueFilters?: Array<{
    key: string
    operator: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte'
    value: any
  }>
  textFilters?: Array<{
    key: string
    pattern: string
    caseSensitive?: boolean
  }>
  customFilters?: Array<(item: any) => boolean>
}

// دالة مساعدة لتطبيق مصفيات متعددة | Helper for applying multiple filters
export const applyFilters = (data: any[], filters: FilterOptions): any[] => {
  if (!Array.isArray(data)) return []

  return data.filter(item => {
    // فلترة النطاق الزمني | Date range filter
    if (filters.dateRange) {
      const { start, end, key = 'date' } = filters.dateRange
      const itemDate = new Date(item[key])
      if (itemDate < start || itemDate > end) return false
    }

    // فلترة القيم | Value filters
    if (filters.valueFilters) {
      for (const filter of filters.valueFilters) {
        const itemValue = Number(item[filter.key])
        const filterValue = Number(filter.value)
        
        switch (filter.operator) {
          case 'gt': if (!(itemValue > filterValue)) return false; break
          case 'lt': if (!(itemValue < filterValue)) return false; break
          case 'eq': if (!(itemValue === filterValue)) return false; break
          case 'ne': if (!(itemValue !== filterValue)) return false; break
          case 'gte': if (!(itemValue >= filterValue)) return false; break
          case 'lte': if (!(itemValue <= filterValue)) return false; break
        }
      }
    }

    // فلترة النصوص | Text filters
    if (filters.textFilters) {
      for (const filter of filters.textFilters) {
        const itemValue = String(item[filter.key] || '')
        const regex = new RegExp(filter.pattern, filter.caseSensitive ? 'g' : 'gi')
        if (!regex.test(itemValue)) return false
      }
    }

    // مصفيات مخصصة | Custom filters
    if (filters.customFilters) {
      for (const customFilter of filters.customFilters) {
        if (!customFilter(item)) return false
      }
    }

    return true
  })
}
