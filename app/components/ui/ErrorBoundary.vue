<template>
  <div>
    <!-- عرض المحتوى العادي إذا لم يكن هناك خطأ -->
    <div v-if="!hasError">
      <slot />
    </div>
    
    <!-- عرض واجهة الخطأ إذا حدث خطأ -->
    <div v-else class="error-boundary">
      <v-alert
        type="error"
        variant="tonal"
        class="ma-4"
        closable
        @click:close="clearError"
      >
        <template v-slot:prepend>
          <v-icon icon="mdi-alert-circle" size="24" />
        </template>
        
        <div class="error-content">
          <div class="text-h6 mb-2">
            {{ $t('errors.unexpected') }}
          </div>
          
          <div class="text-body-2 mb-4 text-medium-emphasis">
            {{ error?.message || $t('errors.unknown') }}
          </div>
          
          <!-- تفاصيل إضافية في وضع التطوير -->
          <div v-if="isDev && showDetails" class="error-details mb-4">
            <v-expansion-panels variant="accordion">
              <v-expansion-panel>
                <v-expansion-panel-title>
                  {{ $t('errors.details') }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <pre class="error-stack">{{ error?.stack }}</pre>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
          
          <!-- أزرار الإجراءات -->
          <div class="d-flex gap-2 flex-wrap">
            <v-btn
              color="primary"
              @click="retry"
              :loading="isRetrying"
            >
              <v-icon start icon="mdi-refresh" />
              {{ $t('common.retry') }}
            </v-btn>
            
            <v-btn
              variant="outlined"
              @click="goBack"
            >
              <v-icon start icon="mdi-arrow-left" />
              {{ $t('common.goBack') }}
            </v-btn>
            
            <v-btn
              variant="text"
              @click="goHome"
            >
              <v-icon start icon="mdi-home" />
              {{ $t('common.home') }}
            </v-btn>
          </div>
        </div>
      </v-alert>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref, onErrorCaptured } from 'vue'

// Props
interface Props {
  retryCount?: number // عدد مرات إعادة المحاولة
  showDetails?: boolean // إظهار تفاصيل الخطأ
  autoHide?: boolean // إخفاء تلقائي بعد فترة
}

const props = withDefaults(defineProps<Props>(), {
  retryCount: 2,
  showDetails: true,
  autoHide: false
})

// Emits
const emit = defineEmits<{
  error: [error: Error]
  retry: []
  clear: []
}>()

// State
const hasError = ref(false)
const error = ref<Error | null>(null)
const isRetrying = ref(false)
const retryAttempts = ref(0)

// Utils
const isDev = process.env.NODE_ENV === 'development'

// التقاط الأخطاء
onErrorCaptured((err: Error, instance, info) => {
  hasError.value = true
  error.value = err
  
  // إرسال الحدث للـ parent
  emit('error', err)
  
  // تسجيل الخطأ في وضع التطوير
  if (isDev) {
    console.error('ErrorBoundary caught error:', {
      error: err,
      component: instance?.$options?.name || 'Unknown',
      info
    })
  }

  // إخفاء تلقائي بعد فترة
  if (props.autoHide) {
    setTimeout(() => {
      clearError()
    }, 10000) // 10 ثوانِ
  }
  
  // منع انتشار الخطأ
  return false
})

// إعادة المحاولة
const retry = async () => {
  if (retryAttempts.value >= props.retryCount) {
    // إذا تجاوز عدد المحاولات، اذهب للصفحة الرئيسية
    goHome()
    return
  }
  
  isRetrying.value = true
  retryAttempts.value++
  
  try {
    // إعادة تعيين الحالة
    hasError.value = false
    error.value = null
    
    // إرسال حدث إعادة المحاولة
    emit('retry')
    
    // انتظار قليل لإعادة التحميل
    await new Promise(resolve => setTimeout(resolve, 300))
    
  } catch (newError) {
    // إذا فشلت إعادة المحاولة، اعرض الخطأ مرة أخرى
    hasError.value = true
    error.value = newError as Error
  } finally {
    isRetrying.value = false
  }
}

// مسح الخطأ
const clearError = () => {
  hasError.value = false
  error.value = null
  retryAttempts.value = 0
  emit('clear')
}

// العودة للصفحة السابقة
const goBack = () => {
  if (process.client) {
    window.history.back()
  }
}

// الذهاب للصفحة الرئيسية
const goHome = () => {
  navigateTo('/')
}

// Expose methods for parent components
defineExpose({
  retry,
  clearError,
  hasError: readonly(hasError),
  error: readonly(error)
})
</script>

<style scoped>
.error-boundary {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-content {
  width: 100%;
}

.error-details {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 12px;
}

.error-stack {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
  color: #d32f2f;
  background: rgba(211, 47, 47, 0.1);
  padding: 8px;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
}

/* RTL Support */
:deep(.v-alert__content) {
  direction: inherit;
}

/* Responsive design */
@media (max-width: 600px) {
  .d-flex.gap-2 {
    flex-direction: column;
  }
  
  .d-flex.gap-2 .v-btn {
    width: 100%;
  }
}
</style> 