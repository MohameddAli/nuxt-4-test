<template>
  <NuxtLayout>
    <div class="error-page" :class="{ 'dark-theme': isDark }">
      <!-- خلفية متحركة -->
      <div class="animated-background">
        <div class="floating-shapes">
          <div class="shape shape-1" :class="{ 'dark-shape': isDark }"></div>
          <div class="shape shape-2" :class="{ 'dark-shape': isDark }"></div>
          <div class="shape shape-3" :class="{ 'dark-shape': isDark }"></div>
        </div>
      </div>

      <v-container class="fill-height error-container">
        <v-row justify="center" align="center" class="error-row">
          <v-col cols="12" sm="10" md="8" lg="6" xl="5">
            <v-card class="error-card glass-effect" elevation="0">
              <v-card-text class="error-content">
                <!-- قسم الأيقونة والعنوان -->
                <div class="error-header text-center mb-8">
                  <div class="error-icon-container mb-6">
                    <v-avatar
                      :size="120"
                      :color="errorIconBg"
                      class="error-icon-avatar"
                    >
                <v-icon
                  :icon="errorIcon"
                        size="60"
                        :color="errorIconColor"
                        class="error-icon"
                      />
                    </v-avatar>
                  </div>

                  <div class="error-title-section">
                    <h1 class="error-title text-h3 font-weight-bold mb-2">
                  {{ errorTitle }}
                </h1>
                    <v-chip
                      :color="errorBadgeColor"
                      variant="flat"
                      size="small"
                      class="error-badge"
                    >
                      <v-icon start size="16">{{ errorBadgeIcon }}</v-icon>
                      {{ errorTypeText }}
                    </v-chip>
                  </div>
                </div>
                
                <!-- رسالة الخطأ -->
                <div class="error-message-section mb-8">
                  <p class="error-message text-body-1 mb-4">
                  {{ errorMessage }}
                </p>
                
                  <!-- اقتراحات للمستخدم -->
                  <div v-if="showSuggestions" class="error-suggestions mt-6">
                    <h4 class="text-h6 mb-3">{{ t('errors.suggestions.title') }}</h4>
                    <v-list density="compact" class="suggestion-list">
                      <v-list-item v-for="suggestion in suggestions" :key="suggestion.key" class="suggestion-item">
                        <template #prepend>
                          <v-icon size="18" color="primary">{{ suggestion.icon }}</v-icon>
                        </template>
                        <v-list-item-title class="text-body-2">
                          {{ t(`errors.suggestions.${suggestion.key}`) }}
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </div>
                </div>

                <!-- تفاصيل تقنية قابلة للطي -->
                <div v-if="isDev && error?.stack" class="technical-details mb-6">
                  <v-expansion-panels variant="accordion" class="technical-panels">
                    <v-expansion-panel>
                      <v-expansion-panel-title class="technical-title">
                        <v-icon start icon="mdi-code-braces"></v-icon>
                        {{ t('errors.technicalDetails') }}
                      </v-expansion-panel-title>
                      <v-expansion-panel-text>
                        <div class="technical-info mb-4">
                          <v-row dense>
                            <v-col cols="6" sm="3">
                              <div class="info-item">
                                <div class="info-label text-caption text-medium-emphasis">{{ t('errors.errorCode') }}</div>
                                <div class="info-value text-body-2 font-mono">{{ error.statusCode || 'Unknown' }}</div>
                              </div>
                            </v-col>
                            <v-col cols="6" sm="3">
                              <div class="info-item">
                                <div class="info-label text-caption text-medium-emphasis">{{ t('errors.timestamp') }}</div>
                                <div class="info-value text-body-2">{{ currentTime }}</div>
                              </div>
                            </v-col>
                            <v-col cols="6" sm="3">
                              <div class="info-item">
                                <div class="info-label text-caption text-medium-emphasis">{{ t('errors.method') }}</div>
                                <div class="info-value text-body-2">{{ requestMethod }}</div>
                              </div>
                            </v-col>
                            <v-col cols="6" sm="3">
                              <div class="info-item">
                                <div class="info-label text-caption text-medium-emphasis">{{ t('errors.url') }}</div>
                                <div class="info-value text-body-2 font-mono text-truncate">{{ currentUrl }}</div>
                              </div>
                            </v-col>
                          </v-row>
                        </div>
                        <pre class="error-stack">{{ error.stack }}</pre>
                      </v-expansion-panel-text>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </div>
                
                <!-- أزرار الإجراءات -->
                <div class="error-actions">
                  <v-row dense justify="center">
                    <v-col cols="12" sm="auto">
                  <v-btn
                    color="primary"
                    size="large"
                        variant="flat"
                    @click="handleRetry"
                    :loading="isRetrying"
                        class="action-btn"
                        block
                  >
                        <v-icon start icon="mdi-refresh"></v-icon>
                        {{ t('errors.action.retry') }}
                  </v-btn>
                    </v-col>
                  
                    <v-col cols="12" sm="auto">
                  <v-btn
                        color="secondary"
                        size="large"
                    variant="outlined"
                    @click="goBack"
                        class="action-btn"
                        block
                  >
                        <v-icon start icon="mdi-arrow-left"></v-icon>
                        {{ t('errors.action.goBack') }}
                  </v-btn>
                    </v-col>
                  
                    <v-col cols="12" sm="auto">
                  <v-btn
                        color="primary"
                        size="large"
                    variant="text"
                    @click="goHome"
                        class="action-btn"
                        block
                      >
                        <v-icon start icon="mdi-home"></v-icon>
                        {{ t('errors.action.goHome') }}
                      </v-btn>
                    </v-col>
                  </v-row>

                  <!-- زر إضافي للتقرير في وضع التطوير -->
                  <v-row dense justify="center" v-if="isDev">
                    <v-col cols="12" sm="auto">
                      <v-btn
                        color="warning"
                        size="small"
                        variant="text"
                        @click="reportError"
                        class="report-btn"
                        block
                      >
                        <v-icon start icon="mdi-bug"></v-icon>
                        {{ t('errors.action.report') }}
                      </v-btn>
                    </v-col>
                  </v-row>
                </div>

                <!-- قسم المساعدة -->
                <div class="help-section mt-8 pt-6 border-t">
                  <div class="help-content text-center">
                    <h4 class="text-h6 mb-2">{{ t('errors.help.title') }}</h4>
                    <p class="text-body-2 text-medium-emphasis mb-4">
                      {{ t('errors.help.description') }}
                    </p>
                                        <div class="help-contact">
                      <v-btn
                        :href="`mailto:${supportEmail}`"
                        variant="text"
                        size="small"
                        class="help-btn"
                      >
                        <v-icon start icon="mdi-email"></v-icon>
                        {{ supportEmail }}
                      </v-btn>
                      <v-btn
                        :href="`tel:${t('errors.help.supportPhone')}`"
                        variant="text"
                        size="small"
                        class="help-btn"
                      >
                        <v-icon start icon="mdi-phone"></v-icon>
                        {{ t('errors.help.supportPhone') }}
                      </v-btn>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- إحصائيات سريعة أو معلومات إضافية -->
        <v-row justify="center" class="mt-8">
          <v-col cols="12" sm="8" md="6">
            <div class="error-footer text-center">
              <p class="text-caption text-medium-emphasis">
                {{ footerMessage }}
              </p>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </NuxtLayout>
</template>

<!--
  Error Page Component - صفحة الخطأ الاحترافية

  راجع ملف ERROR_PAGE_README.md للتفاصيل الكاملة
-->

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useSnackbar } from '~/composables/useSnackbar'
import { useAuthStore } from '~/stores/auth'
import { useI18n } from 'vue-i18n'

// الحصول على الخطأ الحالي
const error = useError()
const { showError } = useSnackbar()
const authStore = useAuthStore()
const { t } = useI18n()

// Utils
const isDev = process.env.NODE_ENV === 'development'
const isRetrying = ref(false)
const isDark = ref(false)

// مراقبة الوضع المظلم
onMounted(() => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDark.value = prefersDark

  // مراقبة تغييرات الوضع المظلم
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    isDark.value = e.matches
  })
})

// معالجة أخطاء المصادقة والصلاحيات في Snackbar
onMounted(() => {
  if (error.value) {
    // 401 - انتهاء الجلسة
    if (error.value.statusCode === 401) {
      authStore.clearAuth()
      showError(t('errors.message.unauthorized'), {
        timeout: 5000
      })
      clearError()
      navigateTo('/login')
      return
    }
    
    // 403 - عدم وجود صلاحية  
    if (error.value.statusCode === 403) {
      const errorData = error.value.data as { message?: string } | undefined
      const message = errorData?.message || 
                     error.value.statusMessage ||
                     t('errors.message.forbidden')
      
      showError(message, { timeout: 5000 })
      clearError()
      navigateTo('/')
      return
    }
  }
})

// تحديد نوع الخطأ بناءً على statusCode
const errorType = computed(() => {
  const statusCode = error.value?.statusCode || 500
  
  if (statusCode === 404) return 'notFound'
  if (statusCode === 401) return 'unauthorized'
  if (statusCode === 403) return 'forbidden'
  if (statusCode === 408) return 'timeout'
  if (statusCode === 503) return 'maintenance'
  if (statusCode >= 500) return 'server'
  if (statusCode >= 400) return 'client'
  
  return 'unexpected'
})

// تحديد الأيقونة واللون والخلفية بناءً على نوع الخطأ
const errorIcon = computed(() => {
  const icons = {
    notFound: 'mdi-file-search-outline',
    unauthorized: 'mdi-shield-alert',
    forbidden: 'mdi-shield-off',
    timeout: 'mdi-clock-alert',
    maintenance: 'mdi-wrench-clock',
    server: 'mdi-server-network-off',
    client: 'mdi-alert-circle-outline',
    unexpected: 'mdi-alert-octagon'
  }
  return icons[errorType.value]
})

const errorIconColor = computed(() => {
  const colors = {
    notFound: isDark.value ? '#ffb74d' : '#f57c00',
    unauthorized: isDark.value ? '#f48fb1' : '#e91e63',
    forbidden: isDark.value ? '#ce93d8' : '#9c27b0',
    timeout: isDark.value ? '#90caf9' : '#2196f3',
    maintenance: isDark.value ? '#81c784' : '#4caf50',
    server: isDark.value ? '#ef5350' : '#f44336',
    client: isDark.value ? '#ffb74d' : '#ff9800',
    unexpected: isDark.value ? '#f48fb1' : '#e91e63'
  }
  return colors[errorType.value]
})

const errorIconBg = computed(() => {
  const backgrounds = {
    notFound: isDark.value ? '#424242' : '#fff3e0',
    unauthorized: isDark.value ? '#424242' : '#fce4ec',
    forbidden: isDark.value ? '#424242' : '#f3e5f5',
    timeout: isDark.value ? '#424242' : '#e3f2fd',
    maintenance: isDark.value ? '#424242' : '#e8f5e8',
    server: isDark.value ? '#424242' : '#ffebee',
    client: isDark.value ? '#424242' : '#fff3e0',
    unexpected: isDark.value ? '#424242' : '#fce4ec'
  }
  return backgrounds[errorType.value]
})

const errorBadgeColor = computed(() => {
  const colors = {
    notFound: 'warning',
    unauthorized: 'error',
    forbidden: 'purple',
    timeout: 'info',
    maintenance: 'success',
    server: 'error',
    client: 'warning',
    unexpected: 'error'
  }
  return colors[errorType.value]
})

const errorBadgeIcon = computed(() => {
  const icons = {
    notFound: 'mdi-map-marker-question',
    unauthorized: 'mdi-shield-alert',
    forbidden: 'mdi-shield-off',
    timeout: 'mdi-clock-alert',
    maintenance: 'mdi-wrench-clock',
    server: 'mdi-server-off',
    client: 'mdi-alert-circle',
    unexpected: 'mdi-alert-octagon'
  }
  return icons[errorType.value]
})

// تحديد العنوان والرسالة بناءً على نوع الخطأ
const errorTitle = computed(() => {
  return t(`errors.title.${errorType.value}`)
})

const errorMessage = computed(() => {
  // إذا كان هناك رسالة مخصصة، استخدمها
  if (error.value?.message) {
    return error.value.message
  }
  
  // استخدام رسالة من data إذا كانت متاحة
  const errorData = error.value?.data as { message?: string } | undefined
  if (errorData?.message) {
    return errorData.message
  }
  
  return t(`errors.message.${errorType.value}`)
})

const errorTypeText = computed(() => {
  const statusCode = error.value?.statusCode || 500
  return `${statusCode} - ${t(`errors.title.${errorType.value}`)}`
})

// معلومات تقنية إضافية
const currentTime = computed(() => {
  return new Date().toLocaleString()
})

const currentUrl = computed(() => {
  if (process.client) {
    return window.location.href
  }
  return (error.value as any)?.url || 'Unknown'
})

const requestMethod = computed(() => {
  return (error.value as any)?.method || 'GET'
})

// اقتراحات للمستخدم
const showSuggestions = computed(() => {
  return suggestions.value.length > 0
})

const suggestions = computed(() => {
  const suggestionMap: Record<string, Array<{ key: string; icon: string }>> = {
    notFound: [
      { key: 'checkUrl', icon: 'mdi-link-variant' },
      { key: 'refresh', icon: 'mdi-refresh' }
    ],
    unauthorized: [
      { key: 'refresh', icon: 'mdi-refresh' },
      { key: 'contactUs', icon: 'mdi-email' }
    ],
    forbidden: [
      { key: 'contactUs', icon: 'mdi-email' }
    ],
    timeout: [
      { key: 'refresh', icon: 'mdi-refresh' },
      { key: 'tryLater', icon: 'mdi-clock' }
    ],
    maintenance: [
      { key: 'tryLater', icon: 'mdi-clock' }
    ],
    server: [
      { key: 'refresh', icon: 'mdi-refresh' },
      { key: 'tryLater', icon: 'mdi-clock' },
      { key: 'contactUs', icon: 'mdi-email' }
    ],
    client: [
      { key: 'refresh', icon: 'mdi-refresh' },
      { key: 'clearCache', icon: 'mdi-broom' },
      { key: 'contactUs', icon: 'mdi-email' }
    ],
    unexpected: [
      { key: 'refresh', icon: 'mdi-refresh' },
      { key: 'contactUs', icon: 'mdi-email' }
    ]
  }

  return suggestionMap[errorType.value] || []
})

// رسالة التذييل
const footerMessage = computed(() => {
  const messages = {
    notFound: 'This page may have been moved or deleted.',
    unauthorized: 'Please check your login credentials.',
    forbidden: 'You may need additional permissions.',
    timeout: 'The server took too long to respond.',
    maintenance: 'We\'ll be back soon with improvements.',
    server: 'Our team has been notified of this issue.',
    client: 'Please verify your request and try again.',
    unexpected: 'This error has been logged for review.'
  }

  return messages[errorType.value] || 'An error occurred while processing your request.'
})

// معالجة عنوان البريد الإلكتروني
const supportEmail = computed(() => {
  const email = t('errors.help.supportEmail')
  return email.replace('&#64;', '@') // تحويل كيان HTML إلى رمز @
})

// إعادة المحاولة
const handleRetry = async () => {
  isRetrying.value = true
  
  try {
    // مسح الخطأ وإعادة تحميل الصفحة الحالية
    await clearError({ redirect: useRoute().path })
    
  } catch (newError) {
    console.error('Retry failed:', newError)
    showError(t('errors.action.retry'), { timeout: 3000 })
  } finally {
    isRetrying.value = false
  }
}

// العودة للصفحة السابقة
const goBack = () => {
  if (process.client) {
    if (window.history.length > 1) {
    window.history.back()
    } else {
      navigateTo('/')
    }
  }
}

// الذهاب للصفحة الرئيسية
const goHome = () => {
  clearError({ redirect: '/' })
}

// تقرير الخطأ
const reportError = () => {
  const errorDetails = {
    statusCode: error.value?.statusCode,
    message: error.value?.message,
    url: currentUrl.value,
    timestamp: currentTime.value,
    userAgent: process.client ? navigator.userAgent : 'Unknown',
    stack: error.value?.stack
  }

  const subject = `Error Report: ${error.value?.statusCode} - ${t(`errors.title.${errorType.value}`)}`
  const body = `
Error Details:
${JSON.stringify(errorDetails, null, 2)}

Please describe what you were doing when this error occurred:
[Your description here]
  `.trim()

  const mailto = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  if (process.client) {
    window.open(mailto)
  }
}

// نسخ تفاصيل الخطأ
const copyErrorDetails = async () => {
  if (process.client) {
    const errorDetails = {
      statusCode: error.value?.statusCode,
      message: error.value?.message,
      url: currentUrl.value,
      timestamp: currentTime.value,
      stack: error.value?.stack
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      showError('Error details copied to clipboard', { timeout: 2000 })
    } catch (err) {
      console.error('Failed to copy error details:', err)
    }
  }
}
</script>

<style scoped>
/* المتغيرات المخصصة لصفحة الخطأ */
.error-page {
  --error-bg-light: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --error-bg-dark: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  --error-card-bg-light: rgba(255, 255, 255, 0.95);
  --error-card-bg-dark: rgba(30, 30, 30, 0.95);
  --error-card-border-light: rgba(255, 255, 255, 0.2);
  --error-card-border-dark: rgba(255, 255, 255, 0.1);
  --error-text-light: rgba(0, 0, 0, 0.87);
  --error-text-dark: rgba(255, 255, 255, 0.87);
  --error-text-secondary-light: rgba(0, 0, 0, 0.6);
  --error-text-secondary-dark: rgba(255, 255, 255, 0.6);
  --error-surface-light: rgba(0, 0, 0, 0.05);
  --error-surface-dark: rgba(255, 255, 255, 0.05);
  --error-surface-hover-light: rgba(0, 0, 0, 0.1);
  --error-surface-hover-dark: rgba(255, 255, 255, 0.1);
  --error-border-light: rgba(0, 0, 0, 0.1);
  --error-border-dark: rgba(255, 255, 255, 0.1);

  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  transition: background 0.3s ease;
  background: var(--error-bg-light);
  color: var(--error-text-light);
}

.error-page.dark-theme {
  background: var(--error-bg-dark);
  color: var(--error-text-dark);
}

/* خلفية متحركة */
.animated-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.3);
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.25);
  bottom: 20%;
  left: 70%;
  animation-delay: 4s;
}

.dark-shape {
  background: rgba(255, 255, 255, 0.05) !important;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(120deg);
  }
  66% {
    transform: translateY(10px) rotate(240deg);
  }
}

/* البطاقة الرئيسية */
.error-container {
  position: relative;
  z-index: 1;
  padding: 2rem 1rem;
}

.error-card {
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  border: 1px solid var(--error-card-border-light);
  background: var(--error-card-bg-light);
}

.error-page.dark-theme .error-card {
  border-color: var(--error-card-border-dark);
  background: var(--error-card-bg-dark);
}

.error-content {
  padding: 3rem 2rem;
}

/* قسم الأيقونة والعنوان */
.error-header {
  text-align: center;
  margin-bottom: 2rem;
}

.error-icon-container {
  margin-bottom: 2rem;
}

.error-icon-avatar {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 4px solid rgba(255, 255, 255, 0.2);
}

.error-icon {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.error-title-section {
  margin-bottom: 2rem;
}

.error-title {
  color: var(--error-text-light);
  margin-bottom: 1rem;
  line-height: 1.2;
}

.error-page.dark-theme .error-title {
  color: var(--error-text-dark);
}

.error-badge {
  margin-top: 0.5rem;
}

/* رسالة الخطأ */
.error-message-section {
  margin-bottom: 2rem;
}

.error-message {
  color: var(--error-text-light);
  line-height: 1.6;
  font-size: 1.1rem;
}

.error-page.dark-theme .error-message {
  color: var(--error-text-dark);
}

/* اقتراحات للمستخدم */
.error-suggestions {
  margin-top: 2rem;
}

.suggestion-list {
  background: var(--error-surface-light);
  border-radius: 12px;
  padding: 1rem;
}

.error-page.dark-theme .suggestion-list {
  background: var(--error-surface-dark);
}

.suggestion-item {
  padding: 0.5rem 0;
}

.suggestion-item:not(:last-child) {
  border-bottom: 1px solid var(--error-border-light);
}

.error-page.dark-theme .suggestion-item:not(:last-child) {
  border-bottom-color: var(--error-border-dark);
}

/* التفاصيل التقنية */
.technical-details {
  margin-bottom: 2rem;
}

.technical-panels {
  border-radius: 12px;
  overflow: hidden;
}

.technical-title {
  font-weight: 600;
}

.technical-info {
  background: var(--error-surface-light);
  margin-bottom: 1rem;
  border-radius: 8px;
  padding: 1rem;
}

.error-page.dark-theme .technical-info {
  background: var(--error-surface-dark);
}

.info-item {
  padding: 0.5rem 0;
}

.info-label {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  color: var(--error-text-secondary-light);
}

.error-page.dark-theme .info-label {
  color: var(--error-text-secondary-dark);
}

.info-value {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.9rem;
  background: var(--error-surface-hover-light);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  word-break: break-all;
  color: var(--error-text-light);
}

.error-page.dark-theme .info-value {
  background: var(--error-surface-hover-dark);
  color: var(--error-text-dark);
}

.error-stack {
  font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--error-text-light);
  background: var(--error-surface-light);
  padding: 1rem;
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--error-border-light);
}

.error-page.dark-theme .error-stack {
  color: var(--error-text-dark);
  background: var(--error-surface-dark);
  border-color: var(--error-border-dark);
}

/* أزرار الإجراءات */
.error-actions {
  margin-bottom: 2rem;
}

.action-btn {
  min-height: 48px;
  font-weight: 600;
  border-radius: 12px;
  text-transform: none;
  font-size: 1rem;
}

.report-btn {
  margin-top: 1rem;
}

/* قسم المساعدة */
.help-section {
  border-top: 1px solid var(--error-border-light);
  margin-top: 2rem;
  padding-top: 2rem;
}

.error-page.dark-theme .help-section {
  border-top-color: var(--error-border-dark);
}

.help-content {
  text-align: center;
}

.help-contact {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.help-btn {
  text-transform: none;
  font-size: 0.9rem;
}

/* التذييل */
.error-footer {
  text-align: center;
  padding: 1rem 0;
  color: var(--error-text-secondary-light);
}

.error-page.dark-theme .error-footer {
  color: var(--error-text-secondary-dark);
}

/* التصميم المتجاوب */
@media (max-width: 960px) {
  .error-content {
    padding: 2rem 1.5rem;
  }

  .error-icon-avatar {
    width: 100px !important;
    height: 100px !important;
  }

  .error-icon {
    font-size: 2rem !important;
  }
}

@media (max-width: 600px) {
  .error-container {
    padding: 1rem 0.5rem;
  }

  .error-content {
    padding: 1.5rem 1rem;
  }

  .error-title {
    font-size: 1.75rem !important;
  }

  .error-message {
    font-size: 1rem;
  }

  .action-btn {
    margin-bottom: 0.5rem;
  }

  .help-contact {
    flex-direction: column;
    align-items: center;
  }
  
  .help-btn {
    width: 100%;
    max-width: 300px;
  }
}

/* تأثيرات التمرير والتفاعل */
.error-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.15);
}

.action-btn:hover {
  transform: translateY(-1px);
}

.help-btn:hover {
  transform: translateY(-1px);
}

/* دعم الطباعة */
@media print {
  .animated-background,
  .error-actions,
  .help-section {
    display: none !important;
  }

  .error-card {
    box-shadow: none !important;
    background: white !important;
  }
}

/* دعم الوضع عالي التباين */
@media (prefers-contrast: high) {
  .error-card {
    border: 2px solid currentColor;
  }

  .action-btn {
    border: 2px solid currentColor;
  }
}

/* دعم الوضع مظلم عالي التباين */
@media (prefers-contrast: high) and (prefers-color-scheme: dark) {
  .error-card {
    border-color: white;
  }
}
</style> 