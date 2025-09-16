/**
 * Composable للدوال المساعدة والتنسيق
 * يوفر واجهة reactive للدوال المساعدة
 */

import { 
  formatDate, 
  formatDateTime, 
  formatNumber, 
  formatFileSize,
  formatPhone,
  getStatusColor, 
  getStatusText,
  truncateText,
  isValidEmail,
  isValidSaudiPhone,
  slugify,
  copyToClipboard,
  generateId,
  searchInArray
} from '../../shared/utils/helpers'

export const useUtils = () => {
  return {
    // تنسيق التواريخ
    formatDate,
    formatDateTime,
    
    // تنسيق الأرقام والأحجام
    formatNumber,
    formatFileSize,
    formatPhone,
    
    // إدارة الحالات
    getStatusColor,
    getStatusText,
    
    // تنسيق النصوص
    truncateText,
    slugify,
    
    // التحقق من صحة البيانات
    isValidEmail,
    isValidSaudiPhone,
    
    // أدوات عامة
    copyToClipboard,
    generateId,
    searchInArray
  }
}

/**
 * Composable مخصص للحالات
 * يوفر إدارة شاملة لحالات العناصر
 */
export const useStatus = () => {
  const { getStatusColor, getStatusText } = useUtils()
  
  /**
   * الحصول على معلومات الحالة كاملة
   * @param status - الحالة
   * @returns كائن يحتوي على اللون والنص والأيقونة
   */
  const getStatusInfo = (status: string) => {
    const color = getStatusColor(status)
    const text = getStatusText(status)
    const icon = getStatusIcon(status)
    
    return { color, text, icon, status }
  }
  
  /**
   * الحصول على أيقونة الحالة
   * @param status - الحالة
   * @returns اسم الأيقونة
   */
  const getStatusIcon = (status: string): string => {
    const statusIcons: Record<string, string> = {
      'active': 'mdi-check-circle',
      'inactive': 'mdi-circle-outline',
      'pending': 'mdi-clock-outline',
      'approved': 'mdi-check-circle',
      'rejected': 'mdi-close-circle',
      'cancelled': 'mdi-cancel',
      'draft': 'mdi-pencil-outline',
      'published': 'mdi-publish',
      'new': 'mdi-new-box',
      'processing': 'mdi-cog-outline',
      'completed': 'mdi-check',
      'failed': 'mdi-alert-circle',
      'uploading': 'mdi-upload',
      'uploaded': 'mdi-check-circle',
      'error': 'mdi-alert-circle',
      'success': 'mdi-check-circle',
      'confirmed': 'mdi-check-decagram',
      'declined': 'mdi-close-circle',
      'refunded': 'mdi-cash-refund'
    }
    
    return statusIcons[status?.toLowerCase()] || 'mdi-help-circle'
  }
  
  /**
   * قائمة جميع الحالات المتاحة
   */
  const availableStatuses = [
    { value: 'active', text: 'نشط', color: 'success' },
    { value: 'inactive', text: 'غير نشط', color: 'grey' },
    { value: 'pending', text: 'قيد الانتظار', color: 'warning' },
    { value: 'approved', text: 'موافق عليه', color: 'success' },
    { value: 'rejected', text: 'مرفوض', color: 'error' },
    { value: 'cancelled', text: 'ملغي', color: 'error' }
  ]
  
  return {
    getStatusInfo,
    getStatusIcon,
    getStatusColor,
    getStatusText,
    availableStatuses
  }
}

/**
 * Composable للتواريخ والأوقات
 */
export const useDateUtils = () => {
  const { formatDate, formatDateTime } = useUtils()
  
  /**
   * الحصول على التاريخ الحالي
   */
  const now = () => new Date()
  
  /**
   * الحصول على بداية اليوم
   */
  const startOfDay = (date?: Date) => {
    const d = date || new Date()
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
  }
  
  /**
   * الحصول على نهاية اليوم
   */
  const endOfDay = (date?: Date) => {
    const d = date || new Date()
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
  }
  
  /**
   * إضافة أيام لتاريخ
   */
  const addDays = (date: Date, days: number) => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }
  
  /**
   * حساب الفرق بين تاريخين بالأيام
   */
  const daysDifference = (date1: Date, date2: Date) => {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime())
    return Math.ceil(timeDiff / (1000 * 3600 * 24))
  }
  
  /**
   * التحقق من كون التاريخ اليوم
   */
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }
  
  /**
   * تنسيق التاريخ النسبي (منذ ساعة، قبل يومين، إلخ)
   */
  const formatRelative = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'الآن'
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`
    if (diffInSeconds < 2592000) return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`
    
    return formatDate(date)
  }
  
  return {
    formatDate,
    formatDateTime,
    formatRelative,
    now,
    startOfDay,
    endOfDay,
    addDays,
    daysDifference,
    isToday
  }
}

/**
 * Composable للبحث والتصفية
 */
export const useSearch = <T = any>() => {
  const items = ref<T[]>([])
  const searchTerm = ref('')
  const searchFields = ref<string[]>([])
  
  /**
   * النتائج المفلترة
   */
  const filteredItems = computed(() => {
    if (!searchTerm.value.trim()) return items.value
    return searchInArray(items.value, searchTerm.value, searchFields.value)
  })
  
  /**
   * تعيين البيانات
   */
  const setItems = (newItems: T[]) => {
    items.value = newItems
  }
  
  /**
   * تعيين حقول البحث
   */
  const setSearchFields = (fields: string[]) => {
    searchFields.value = fields
  }
  
  /**
   * تعيين مصطلح البحث
   */
  const setSearchTerm = (term: string) => {
    searchTerm.value = term
  }
  
  /**
   * مسح البحث
   */
  const clearSearch = () => {
    searchTerm.value = ''
  }
  
  return {
    items: readonly(items),
    searchTerm,
    searchFields,
    filteredItems,
    setItems,
    setSearchFields,
    setSearchTerm,
    clearSearch
  }
}