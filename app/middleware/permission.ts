import { useAuthStore } from '~/stores/auth'

/**
 * Permission middleware - checks if user has required permissions
 * Usage: Add `middleware: ['auth', 'permission']` to page meta
 * and define `permission` or `permissions` in definePageMeta
 */
export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  // Skip if not authenticated (auth middleware should handle this first)
  if (!authStore.isAuthenticated) {
    return
  }

  // Get permission requirements from page meta
  const pageMeta = to.meta
  const requiredPermission = pageMeta.permission as string
  const requiredPermissions = pageMeta.permissions as string[]
  const permissionMode = pageMeta.permissionMode as 'all' | 'any' || 'all'

  // No permission requirements
  if (!requiredPermission && !requiredPermissions) {
    return
  }

  let hasAccess = false

  // Check single permission
  if (requiredPermission) {
    hasAccess = authStore.hasPermission(requiredPermission)
  }

  // Check multiple permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    if (permissionMode === 'all') {
      hasAccess = authStore.hasAllPermissions(requiredPermissions)
    } else {
      hasAccess = authStore.hasAnyPermission(requiredPermissions)
    }
  }

  // معالجة عدم وجود صلاحية
  if (!hasAccess) {
    // تحديد رسالة خطأ مخصصة بناءً على الصلاحية المطلوبة
    let errorMessage = 'ليس لديك صلاحية للوصول إلى هذا المورد'
    
    if (requiredPermission) {
      const permissionName = getPermissionDisplayName(requiredPermission)
      errorMessage = `تحتاج إلى صلاحية "${permissionName}" للوصول إلى هذه الصفحة`
    } else if (requiredPermissions && requiredPermissions.length > 0) {
      const permissionNames = requiredPermissions.map(getPermissionDisplayName).join('" أو "')
      if (permissionMode === 'all') {
        errorMessage = `تحتاج إلى جميع الصلاحيات التالية: "${permissionNames}"`
      } else {
        errorMessage = `تحتاج إلى إحدى الصلاحيات التالية: "${permissionNames}"`
      }
    }

    throw createError({
      statusCode: 403,
      statusMessage: 'Access Denied',
      data: {
        message: errorMessage,
        requiredPermission,
        requiredPermissions,
        userPermissions: authStore.currentUser?.permissions || []
      }
    })
  }
})

/**
 * تحويل مفتاح الصلاحية إلى اسم قابل للقراءة
 * @param permissionKey - مفتاح الصلاحية
 * @returns اسم الصلاحية بالعربية
 */
function getPermissionDisplayName(permissionKey: string): string {
  const permissionMap: Record<string, string> = {
    // صلاحيات المستخدمين
    'users.view': 'عرض المستخدمين',
    'users.create': 'إضافة مستخدمين',
    'users.edit': 'تعديل المستخدمين',
    'users.delete': 'حذف المستخدمين',
    'users.manage': 'إدارة المستخدمين',
    
    // صلاحيات المجموعات
    'groups.view': 'عرض المجموعات',
    'groups.create': 'إضافة مجموعات',
    'groups.edit': 'تعديل المجموعات',
    'groups.delete': 'حذف المجموعات',
    'groups.manage': 'إدارة المجموعات',
    
    // صلاحيات الطلبات
    'orders.view': 'عرض الطلبات',
    'orders.create': 'إضافة طلبات',
    'orders.edit': 'تعديل الطلبات',
    'orders.delete': 'حذف الطلبات',
    'orders.manage': 'إدارة الطلبات',
    
    // صلاحيات البنوك
    'banks.view': 'عرض البنوك',
    'banks.create': 'إضافة بنوك',
    'banks.edit': 'تعديل البنوك',
    'banks.delete': 'حذف البنوك',
    'banks.manage': 'إدارة البنوك',
    
    // صلاحيات التقارير
    'reports.view': 'عرض التقارير',
    'reports.export': 'تصدير التقارير',
    'reports.manage': 'إدارة التقارير',
    
    // صلاحيات النظام
    'system.settings': 'إعدادات النظام',
    'system.backup': 'نسخ احتياطية',
    'system.logs': 'سجلات النظام',
    'system.admin': 'إدارة النظام'
  }
  
  return permissionMap[permissionKey] || permissionKey
}