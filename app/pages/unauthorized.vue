<template>
  <div class="unauthorized-page">
    <!-- العد التنازلي للتوجيه التلقائي -->
    <div v-if="showCountdown" class="countdown-container">
      <v-alert
        type="info"
        variant="tonal"
        closable
        @click:close="cancelAutoRedirect"
        class="countdown-alert"
      >
        <div class="d-flex align-center">
          <v-icon start icon="mdi-timer-outline" />
          <span>
            {{ $t('errors.unauthorized.autoRedirect', { seconds: countdown }) }}
          </span>
        </div>
        
        <template v-slot:append>
          <v-btn
            variant="text"
            size="small"
            @click="cancelAutoRedirect"
          >
            {{ $t('common.cancel') }}
          </v-btn>
        </template>
      </v-alert>
    </div>
    
    <!-- المحتوى الرئيسي -->
    <div class="content-container">
      <!-- معلومات إضافية -->
      <div class="info-section">
        <v-card
          variant="outlined"
          class="info-card"
        >
          <v-card-text>
            <h3 class="text-h6 mb-4 text-center">
              {{ $t('errors.unauthorized.reasons.title') }}
            </h3>
            <v-list density="compact" class="reasons-list">
              <v-list-item
                v-for="(reason, index) in reasons"
                :key="reason"
                class="px-0 reason-item"
                :class="`reason-item-${index}`"
              >
                <template v-slot:prepend>
                  <v-icon
                    :icon="getReasonIcon(reason)"
                    color="primary"
                    size="small"
                  />
                </template>
                <v-list-item-title class="text-body-2">
                  {{ $t(`errors.unauthorized.reasons.${reason}`) }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
        
        <!-- معلومات الاتصال أو المساعدة -->
        <v-card
          variant="tonal"
          color="primary"
          class="help-card"
        >
          <v-card-text>
            <div class="d-flex align-center justify-center">
              <v-icon start icon="mdi-help-circle-outline" />
              <span class="text-body-2">
                {{ $t('errors.unauthorized.needHelp') }}
              </span>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

// تحديد الـ layout وmiddleware
definePageMeta({
  layout: 'unauthorized',
  middleware: ['guest'] // فقط للزوار غير المصادق عليهم
})

// الحالة والمتغيرات - optimized
const router = useRouter()
const authStore = useAuthStore()
const countdown = ref(5)
const showCountdown = ref(true)
let timer: NodeJS.Timeout | null = null

// أسباب عدم الوصول
const reasons = [
  'notLoggedIn',
  'sessionExpired', 
  'insufficientPermissions',
  'accountDeactivated'
]

// دالة للحصول على أيقونة السبب
const getReasonIcon = (reason: string) => {
  const icons = {
    notLoggedIn: 'mdi-login-variant',
    sessionExpired: 'mdi-clock-alert',
    insufficientPermissions: 'mdi-shield-alert',
    accountDeactivated: 'mdi-account-off'
  }
  return icons[reason as keyof typeof icons] || 'mdi-circle-small'
}

// بدء العد التنازلي عند تحميل الصفحة
onMounted(() => {
  startCountdown()
})

// تنظيف المؤقت عند مغادرة الصفحة
onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})

// بدء العد التنازلي
const startCountdown = () => {
  if (timer) clearInterval(timer)
  
  timer = setInterval(() => {
    countdown.value--
    
    if (countdown.value <= 0) {
      clearInterval(timer!)
      timer = null
      redirectToLogin()
    }
  }, 1000)
}

// إلغاء التوجيه التلقائي
const cancelAutoRedirect = () => {
  showCountdown.value = false
  
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// التوجيه لصفحة تسجيل الدخول
const redirectToLogin = async () => {
  try {
    // حفظ الصفحة المطلوبة للعودة إليها بعد تسجيل الدخول
    if (process.client) {
      const savedRedirectUrl = localStorage.getItem('auth_redirect_url')
      
      // إذا لم يكن هناك رابط محفوظ، احفظ الرابط الحالي
      if (!savedRedirectUrl) {
        const referrer = document.referrer
        const currentOrigin = window.location.origin
        
        if (referrer && referrer.startsWith(currentOrigin)) {
          const referrerPath = new URL(referrer).pathname
          if (referrerPath !== '/login' && referrerPath !== '/unauthorized') {
            localStorage.setItem('auth_redirect_url', referrerPath)
          }
        }
      }
    }
    
    await router.push('/login')
  } catch (error) {
    console.error('Redirect failed:', error)
  }
}

// مراقبة تغييرات المصادقة
watch(() => authStore.isAuthenticated, (isAuth) => {
  if (isAuth) {
    // إذا تم تسجيل الدخول، وجه للوحة التحكم
    router.push('/dashboard')
  }
})
</script>

<style scoped>
.unauthorized-page {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 16px;
}

.countdown-container {
  margin-bottom: 24px;
}

.countdown-alert {
  border-radius: 12px;
  border: 1px solid rgba(25, 118, 210, 0.2);
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(66, 165, 245, 0.05) 100%);
}

.content-container {
  width: 100%;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  border-radius: 16px !important;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.reasons-list {
  background: transparent !important;
}

.reason-item {
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.reason-item {
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  animation: slideInLeft 0.6s ease-out;
}

.reason-item:nth-child(1) { animation-delay: 0.1s; }
.reason-item:nth-child(2) { animation-delay: 0.2s; }
.reason-item:nth-child(3) { animation-delay: 0.3s; }
.reason-item:nth-child(4) { animation-delay: 0.4s; }

.reason-item:hover {
  background-color: rgba(25, 118, 210, 0.08) !important;
  transform: translateX(8px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.15);
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.help-card {
  border-radius: 16px !important;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(66, 165, 245, 0.1) 100%);
  border: 1px solid rgba(25, 118, 210, 0.2);
  transition: all 0.3s ease;
}

.help-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(25, 118, 210, 0.2);
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.15) 0%, rgba(66, 165, 245, 0.15) 100%);
}

/* تحسينات إضافية للتفاعل */
.countdown-alert {
  animation: fadeInDown 0.5s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.info-card {
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

.help-card {
  animation: fadeInUp 0.6s ease-out 0.4s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* تم إزالة تحسينات الوضع المظلم */

/* تحسينات للغة العربية */
[dir="rtl"] .reason-item:hover {
  transform: translateX(-4px);
}

/* الاستجابة للشاشات الصغيرة */
@media (max-width: 600px) {
  .unauthorized-page {
    padding: 0 12px;
  }
  
  .info-card,
  .help-card {
    border-radius: 12px !important;
  }
}

/* تأثيرات الانتقال */
.info-card,
.help-card,
.reason-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* تحسين الألوان للأيقونات */
:deep(.v-icon) {
  color: rgb(var(--v-theme-primary));
}

/* تحسين النصوص */
:deep(.text-h6) {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

:deep(.text-body-2) {
  color: rgb(var(--v-theme-on-surface-variant));
}
</style>