/**
 * مكتبة الدوال المساعدة المشتركة
 * تحتوي على جميع الدوال المكررة في المشروع
 */

/**
 * تنسيق التاريخ
 * @param date - التاريخ كـ string أو Date أو number
 * @returns التاريخ منسق
 */
export const formatDate = (date: string | Date | number): string => {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(dateObj)
  } catch (error) {
    console.warn('Invalid date format:', date)
    return String(date)
  }
}

/**
 * تنسيق التاريخ والوقت
 * @param date - التاريخ
 * @returns التاريخ والوقت منسق
 */
export const formatDateTime = (date: string | Date | number): string => {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj)
  } catch (error) {
    console.warn('Invalid date format:', date)
    return String(date)
  }
}

/**
 * الحصول على لون الحالة
 * @param status - حالة العنصر
 * @returns لون Vuetify المناسب
 */
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    // حالات عامة
    'active': 'success',
    'inactive': 'grey',
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'error',
    'cancelled': 'error',
    'draft': 'info',
    'published': 'success',
    
    // حالات الطلبات
    'new': 'primary',
    'processing': 'warning',
    'completed': 'success',
    'failed': 'error',
    
    // حالات الملفات
    'uploading': 'warning',
    'uploaded': 'success',
    'error': 'error',
    
    // حالات المعاملات
    'success': 'success',
    'confirmed': 'success',
    'declined': 'error',
    'refunded': 'info'
  }
  
  return statusColors[status?.toLowerCase()] || 'grey'
}

/**
 * ترجمة الحالة للعربية
 * @param status - حالة العنصر بالإنجليزية
 * @returns الحالة بالعربية
 */
export const getStatusText = (status: string): string => {
  const statusTexts: Record<string, string> = {
    'active': 'نشط',
    'inactive': 'غير نشط',
    'pending': 'قيد الانتظار',
    'approved': 'موافق عليه',
    'rejected': 'مرفوض',
    'cancelled': 'ملغي',
    'draft': 'مسودة',
    'published': 'منشور',
    'new': 'جديد',
    'processing': 'قيد المعالجة',
    'completed': 'مكتمل',
    'failed': 'فشل',
    'uploading': 'جارِ الرفع',
    'uploaded': 'تم الرفع',
    'error': 'خطأ',
    'success': 'نجح',
    'confirmed': 'مؤكد',
    'declined': 'مرفوض',
    'refunded': 'مسترد'
  }
  
  return statusTexts[status?.toLowerCase()] || status
}

/**
 * تنسيق الأرقام
 * @param number - الرقم
 * @param currency - العملة (اختياري)
 * @returns الرقم منسق
 */
export const formatNumber = (number: number | string, currency?: string): string => {
  if (number === null || number === undefined) return ''
  
  const numValue = typeof number === 'string' ? parseFloat(number) : number
  
  if (isNaN(numValue)) return String(number)
  
  const formatter = new Intl.NumberFormat('ar-SA', {
    style: currency ? 'currency' : 'decimal',
    currency: currency || 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
  
  return formatter.format(numValue)
}

/**
 * تنسيق حجم الملف
 * @param bytes - حجم الملف بالبايت
 * @returns حجم الملف منسق
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * قص النص
 * @param text - النص
 * @param length - الطول المسموح
 * @returns النص مقصوص
 */
export const truncateText = (text: string, length: number = 50): string => {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

/**
 * تنسيق رقم الهاتف
 * @param phone - رقم الهاتف
 * @returns رقم الهاتف منسق
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return ''
  
  // إزالة جميع الأحرف غير الرقمية
  const cleaned = phone.replace(/\D/g, '')
  
  // تنسيق للأرقام السعودية
  if (cleaned.startsWith('966')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`
  } else if (cleaned.startsWith('05') && cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  }
  
  return phone
}

/**
 * التحقق من صحة البريد الإلكتروني
 * @param email - البريد الإلكتروني
 * @returns true إذا كان صحيح
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * التحقق من صحة رقم الهاتف السعودي
 * @param phone - رقم الهاتف
 * @returns true إذا كان صحيح
 */
export const isValidSaudiPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '')
  return /^(966|0)?5[0-9]{8}$/.test(cleaned)
}

/**
 * تحويل النص إلى slug
 * @param text - النص
 * @returns slug
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

/**
 * تأخير تنفيذ الدالة
 * @param ms - المدة بالميللي ثانية
 * @returns Promise
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * نسخ النص إلى الحافظة
 * @param text - النص المراد نسخه
 * @returns Promise<boolean>
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // fallback للمتصفحات القديمة
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const result = document.execCommand('copy')
      document.body.removeChild(textArea)
      return result
    }
  } catch (error) {
    console.error('Failed to copy text:', error)
    return false
  }
}

/**
 * إنشاء معرف عشوائي
 * @param length - طول المعرف
 * @returns معرف عشوائي
 */
export const generateId = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * دمج عدة كائنات بعمق
 * @param target - الكائن الهدف
 * @param sources - الكائنات المصدر
 * @returns الكائن المدموج
 */
export const deepMerge = (target: any, ...sources: any[]): any => {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        deepMerge(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return deepMerge(target, ...sources)
}

/**
 * التحقق من كون الشيء كائن
 * @param item - العنصر للتحقق منه
 * @returns true إذا كان كائن
 */
const isObject = (item: any): boolean => {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * البحث في مصفوفة من الكائنات
 * @param items - المصفوفة
 * @param searchTerm - مصطلح البحث
 * @param searchFields - الحقول للبحث فيها
 * @returns النتائج
 */
export const searchInArray = <T>(
  items: T[], 
  searchTerm: string, 
  searchFields: string[]
): T[] => {
  if (!searchTerm.trim()) return items
  
  const term = searchTerm.toLowerCase()
  
  return items.filter(item => {
    return searchFields.some(field => {
      const value = getNestedValue(item, field)
      return String(value).toLowerCase().includes(term)
    })
  })
}

/**
 * الحصول على قيمة متداخلة من كائن
 * @param obj - الكائن
 * @param path - المسار (مثل: 'user.profile.name')
 * @returns القيمة
 */
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}