/**
 * Composable للتعامل مع الصفحات غير المصرح بها
 * يوفر وظائف مشتركة للتعامل مع حالات عدم التصريح
 */


export const useUnauthorized = () => {
  const router = useRouter()
  const { showInfo, showError } = useSnackbar()
  const authStore = useAuthStore()

  /**
   * إنشاء مؤقت للعد التنازلي
   * @param seconds عدد الثواني
   * @param callback الدالة التي تستدعى عند انتهاء العد
   */
  const createCountdown = (seconds: number, callback: () => void) => {
    const countdown = ref(seconds)
    const isActive = ref(true)
    let timer: NodeJS.Timeout | null = null

    const start = () => {
      if (timer) clearInterval(timer)
      
      timer = setInterval(() => {
        if (!isActive.value) return
        
        countdown.value--
        
        if (countdown.value <= 0) {
          stop()
          callback()
        }
      }, 1000)
    }

    const stop = () => {
      isActive.value = false
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    }

    const reset = (newSeconds?: number) => {
      stop()
      countdown.value = newSeconds || seconds
      isActive.value = true
    }

    // بدء العد التنازلي تلقائياً
    start()

    // تنظيف عند إلغاء التركيب
    onBeforeUnmount(() => {
      stop()
    })

    return {
      countdown: readonly(countdown),
      isActive: readonly(isActive),
      start,
      stop,
      reset
    }
  }

  /**
   * التوجيه الآمن لصفحة تسجيل الدخول
   */
  const redirectToLogin = async (saveCurrentPath = true) => {
    try {
      // حفظ المسار الحالي للعودة إليه بعد تسجيل الدخول
      if (saveCurrentPath && process.client) {
        const currentPath = router.currentRoute.value.fullPath
        if (currentPath !== '/login' && currentPath !== '/unauthorized') {
          localStorage.setItem('auth_redirect_url', currentPath)
        }
      }

      showInfo('جاري التوجيه إلى صفحة تسجيل الدخول...')
      await router.push('/login')
    } catch (error) {
      console.error('Redirect to login failed:', error)
      showError('حدث خطأ أثناء التوجيه')
    }
  }

  /**
   * التوجيه لصفحة غير المصرح بها
   */
  const redirectToUnauthorized = async (reason?: string) => {
    try {
      const query: Record<string, string> = {}
      if (reason) {
        query.reason = reason
      }

      await router.push({
        path: '/unauthorized',
        query
      })
    } catch (error) {
      console.error('Redirect to unauthorized failed:', error)
    }
  }

  /**
   * التوجيه للصفحة الرئيسية
   */
  const redirectToHome = async () => {
    try {
      await router.push('/')
    } catch (error) {
      console.error('Redirect to home failed:', error)
      showError('حدث خطأ أثناء التوجيه')
    }
  }

  /**
   * التوجيه للوحة التحكم (للمستخدمين المصادق عليهم)
   */
  const redirectToDashboard = async () => {
    try {
      if (!authStore.isAuthenticated) {
        await redirectToLogin(false)
        return
      }

      await router.push('/dashboard')
    } catch (error) {
      console.error('Redirect to dashboard failed:', error)
      showError('حدث خطأ أثناء التوجيه')
    }
  }

  /**
   * التحقق من المصادقة وإعادة التوجيه المناسب
   */
  const checkAuthAndRedirect = async () => {
    if (authStore.isAuthenticated) {
      await redirectToDashboard()
    } else {
      await redirectToLogin()
    }
  }

  /**
   * الحصول على سبب عدم التصريح من معاملات URL
   */
  const getUnauthorizedReason = () => {
    const route = useRoute()
    const reason = route.query.reason as string
    
    const reasonMap: Record<string, string> = {
      'not_logged_in': 'لم تقم بتسجيل الدخول',
      'session_expired': 'انتهت صلاحية جلستك',
      'insufficient_permissions': 'لا تملك الصلاحيات الكافية',
      'account_deactivated': 'تم إلغاء تفعيل حسابك',
      'invalid_token': 'رمز المصادقة غير صالح'
    }

    return reason ? reasonMap[reason] || reason : null
  }

  /**
   * إنشاء رسالة مخصصة للخطأ
   */
  const createUnauthorizedMessage = (error?: any) => {
    if (error?.data?.message) {
      return error.data.message
    }

    if (error?.statusCode === 401) {
      return 'يجب عليك تسجيل الدخول للوصول إلى هذا المحتوى'
    }

    if (error?.statusCode === 403) {
      return 'ليس لديك صلاحية للوصول إلى هذا المورد'
    }

    return 'غير مصرح بالوصول إلى هذه الصفحة'
  }

  /**
   * معالجة أخطاء عدم التصريح
   */
  const handleUnauthorizedError = async (error: any) => {
    const message = createUnauthorizedMessage(error)
    
    // عرض رسالة الخطأ
    showError(message)

    // تحديد نوع إعادة التوجيه
    if (error?.statusCode === 401) {
      // مشكلة في المصادقة - توجيه لتسجيل الدخول
      setTimeout(() => redirectToLogin(), 2000)
    } else if (error?.statusCode === 403) {
      // مشكلة في الصلاحيات - توجيه لصفحة غير المصرح بها
      setTimeout(() => redirectToUnauthorized('insufficient_permissions'), 2000)
    } else {
      // خطأ عام - توجيه لصفحة غير المصرح بها
      setTimeout(() => redirectToUnauthorized(), 2000)
    }
  }

  return {
    // وظائف التوجيه
    redirectToLogin,
    redirectToUnauthorized,
    redirectToHome,
    redirectToDashboard,
    checkAuthAndRedirect,

    // معالجة الأخطاء
    handleUnauthorizedError,
    createUnauthorizedMessage,
    getUnauthorizedReason,

    // المؤقتات
    createCountdown
  }
}