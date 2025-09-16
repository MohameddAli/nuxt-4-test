<template>
  <div class="unauthorized-layout">
    <!-- Error Boundary للتعامل مع أي أخطاء -->
    <ErrorBoundary>
      <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <!-- الـ Container الرئيسي -->
        <v-container class="fill-height">
          <v-row justify="center" align="center">
            <v-col cols="12" sm="10" md="8" lg="6" xl="5">
              <!-- البطاقة الرئيسية -->
              <v-card
                class="unauthorized-card mx-auto"
                elevation="16"
                color="white"
              >
                <!-- الشريط العلوي الملون -->
                <div class="unauthorized-bar"></div>
                
                <v-card-text class="pa-8">
                  <!-- أيقونة القفل -->
                  <div class="text-center mb-6">
                    <div class="unauthorized-icon-container mx-auto">
                      <v-icon
                        icon="mdi-shield-lock-outline"
                        size="64"
                        class="unauthorized-icon"
                      />
                    </div>
                  </div>
                  
                  <!-- العنوان والرسالة -->
                  <div class="text-center mb-8">
                    <h1 class="text-h4 font-weight-bold mb-4 text-high-emphasis">
                      {{ $t('errors.unauthorized.title') }}
                    </h1>
                    <p class="text-body-1 text-medium-emphasis">
                      {{ $t('errors.unauthorized.message') }}
                    </p>
                  </div>
                  
                  <!-- المحتوى المخصص من الصفحة -->
                  <div class="mb-6">
                    <slot />
                  </div>
                  
                  <!-- أزرار الإجراءات -->
                  <div class="text-center">
                    <v-btn
                      color="primary"
                      size="large"
                      class="mb-4 action-btn"
                      block
                      @click="redirectToLogin"
                      :loading="isRedirecting"
                    >
                      <v-icon start icon="mdi-login" />
                      {{ $t('common.login') }}
                    </v-btn>
                    
                    <v-btn
                      variant="outlined"
                      size="large"
                      class="action-btn"
                      block
                      @click="goHome"
                    >
                      <v-icon start icon="mdi-home" />
                      {{ $t('common.home') }}
                    </v-btn>
                  </div>
                  
                  <!-- شعار الشركة -->
                  <div class="text-center mt-8">
                    <v-img
                      src="/logo.png"
                      alt="شعار الشركة"
                      max-width="120"
                      class="mx-auto opacity-60"
                    />
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </ErrorBoundary>
    
    <!-- Global Snackbar للرسائل -->
    <GlobalSnackbar />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useSnackbar } from '~/composables/useSnackbar'
import { useAuthStore } from '~/stores/auth'

// التأكد من إعادة توجيه المستخدمين المصادق عليهم
const router = useRouter()
const { showInfo } = useSnackbar()
const authStore = useAuthStore()
const isRedirecting = ref(false)

// فحص المصادقة عند التحميل
onMounted(() => {
  // إذا كان المستخدم مصادق عليه، وجهه للوحة التحكم
  if (authStore.isAuthenticated) {
    redirectToDashboard()
  }
})

// التوجيه لصفحة تسجيل الدخول
const redirectToLogin = async () => {
  isRedirecting.value = true
  
  try {
    // حفظ الصفحة الحالية للعودة إليها بعد تسجيل الدخول
    if (process.client) {
      const currentPath = router.currentRoute.value.fullPath
      if (currentPath !== '/login' && currentPath !== '/unauthorized') {
        localStorage.setItem('auth_redirect_url', currentPath)
      }
    }
    
    showInfo('جاري التوجيه إلى صفحة تسجيل الدخول...')
    await router.push('/login')
  } catch (error) {
    console.error('Redirect to login failed:', error)
  } finally {
    isRedirecting.value = false
  }
}

// التوجيه للصفحة الرئيسية
const goHome = async () => {
  try {
    await router.push('/')
  } catch (error) {
    console.error('Redirect to home failed:', error)
  }
}

// التوجيه للوحة التحكم (للمستخدمين المصادق عليهم)
const redirectToDashboard = async () => {
  try {
    await router.push('/dashboard')
  } catch (error) {
    console.error('Redirect to dashboard failed:', error)
  }
}

// Expose methods للاستخدام في الصفحات التي تستخدم هذا الـ layout
defineExpose({
  redirectToLogin,
  goHome
})
</script>

<style scoped>
.unauthorized-layout {
  font-family: 'Cairo', sans-serif;
  direction: inherit;
}

.min-h-screen {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.unauthorized-card {
  border-radius: 20px !important;
  overflow: hidden;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.unauthorized-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
}

.unauthorized-bar {
  height: 6px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  position: relative;
  overflow: hidden;
}

.unauthorized-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.unauthorized-icon-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin: 0 auto;
}

.unauthorized-icon-container::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  padding: 3px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: xor;
  -webkit-mask-composite: xor;
}

.unauthorized-icon {
  color: rgb(var(--v-theme-primary));
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.action-btn {
  border-radius: 12px !important;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  height: 48px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

/* تم إزالة تحسينات الوضع المظلم */

/* الاستجابة للشاشات الصغيرة */
@media (max-width: 600px) {
  .unauthorized-card .v-card-text {
    padding: 1.5rem !important;
  }
  
  .unauthorized-icon-container {
    width: 100px;
    height: 100px;
  }
  
  .unauthorized-icon {
    font-size: 48px !important;
  }
  
  .text-h4 {
    font-size: 1.5rem !important;
  }
}

/* تحسينات للغة العربية */
[dir="rtl"] .unauthorized-layout {
  text-align: right;
}

[dir="rtl"] .text-center {
  text-align: center !important;
}

/* تأثيرات الانتقال */
.unauthorized-card {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* تحسين الألوان للأزرار */
:deep(.v-btn) {
  border-radius: 12px;
  text-transform: none;
  font-weight: 600;
}

:deep(.v-btn.v-btn--variant-outlined) {
  border-width: 2px;
}

/* تحسين النصوص */
:deep(.text-h4) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* تحسين الأيقونة */
.unauthorized-icon-container {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>