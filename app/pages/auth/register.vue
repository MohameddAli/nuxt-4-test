<template>
  <v-container fluid class="register-container">
    <v-row justify="center" align="center" class="min-h-screen">
      <v-col cols="12" sm="10" md="8" lg="6" xl="4">
        <v-card class="register-card" elevation="12" rounded="xl">
          <!-- Header with gradient -->
          <v-card-item class="register-header">
            <v-card-title class="text-center">
              <v-avatar size="64" class="mb-4 register-avatar">
                <v-icon size="32" color="white">mdi-account-plus</v-icon>
              </v-avatar>
              <div class="text-h4 font-weight-bold text-white mb-2">إنشاء حساب جديد</div>
              <div class="text-body-1 text-white opacity-90">انضم إلينا اليوم!</div>
            </v-card-title>
          </v-card-item>

          <!-- Register Form -->
          <v-card-text class="pa-8">
            <v-form @submit.prevent="handleRegister" ref="registerForm">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.name"
                    label="الاسم الكامل"
                    prepend-inner-icon="mdi-account-circle-outline"
                    variant="outlined"
                    :rules="[rules.required]"
                    :disabled="loading"
                    color="secondary"
                    bg-color="surface"
                    rounded="lg"
                    class="mb-3"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.username"
                    label="اسم المستخدم"
                    prepend-inner-icon="mdi-at"
                    variant="outlined"
                    :rules="[rules.required, rules.username]"
                    :disabled="loading"
                    autocomplete="username"
                    color="secondary"
                    bg-color="surface"
                    rounded="lg"
                    class="mb-3"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.email"
                    label="البريد الإلكتروني"
                    prepend-inner-icon="mdi-email-outline"
                    variant="outlined"
                    type="email"
                    :rules="[rules.required, rules.email]"
                    :disabled="loading"
                    autocomplete="email"
                    color="secondary"
                    bg-color="surface"
                    rounded="lg"
                    class="mb-3"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.password"
                    label="كلمة المرور"
                    prepend-inner-icon="mdi-lock-outline"
                    variant="outlined"
                    :type="showPassword ? 'text' : 'password'"
                    :append-inner-icon="showPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                    @click:append-inner="showPassword = !showPassword"
                    :rules="[rules.required, rules.minLength]"
                    :disabled="loading"
                    autocomplete="new-password"
                    color="secondary"
                    bg-color="surface"
                    rounded="lg"
                    class="mb-3"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.confirmPassword"
                    label="تأكيد كلمة المرور"
                    prepend-inner-icon="mdi-lock-check-outline"
                    variant="outlined"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    :append-inner-icon="showConfirmPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                    @click:append-inner="showConfirmPassword = !showConfirmPassword"
                    :rules="[rules.required, rules.passwordMatch]"
                    :disabled="loading"
                    autocomplete="new-password"
                    color="secondary"
                    bg-color="surface"
                    rounded="lg"
                    class="mb-3"
                  />
                </v-col>
              </v-row>

              <!-- Terms and Conditions -->
              <v-row>
                <v-col cols="12">
                  <v-checkbox
                    v-model="formData.acceptTerms"
                    :rules="[rules.mustAccept]"
                    :disabled="loading"
                    color="secondary"
                    class="mb-4"
                  >
                    <template v-slot:label>
                      <div class="text-body-2">
                        أوافق على
                        <v-btn variant="text" size="small" class="pa-0 text-decoration-underline" color="secondary">
                          الشروط والأحكام
                        </v-btn>
                        و
                        <v-btn variant="text" size="small" class="pa-0 text-decoration-underline" color="secondary">
                          سياسة الخصوصية
                        </v-btn>
                      </div>
                    </template>
                  </v-checkbox>
                </v-col>
              </v-row>

              <!-- Error Alert -->
              <v-alert
                v-if="error"
                type="error"
                variant="tonal"
                class="mb-6"
                closable
                @click:close="error = ''"
                rounded="lg"
              >
                <template #prepend>
                  <v-icon>mdi-alert-circle</v-icon>
                </template>
                {{ error }}
              </v-alert>

              <!-- Success Alert -->
              <v-alert
                v-if="success"
                type="success"
                variant="tonal"
                class="mb-6"
                rounded="lg"
              >
                <template #prepend>
                  <v-icon>mdi-check-circle</v-icon>
                </template>
                {{ success }}
              </v-alert>

              <!-- Register Button -->
              <v-btn
                type="submit"
                block
                size="x-large"
                color="secondary"
                :loading="loading"
                :disabled="!isFormValid"
                class="mb-6 register-btn"
                rounded="xl"
                elevation="4"
              >
                <template #prepend>
                  <v-icon>mdi-account-plus</v-icon>
                </template>
                إنشاء الحساب
              </v-btn>
            </v-form>

            <!-- Divider -->
            <div class="d-flex align-center mb-6">
              <v-divider class="flex-grow-1" />
              <span class="px-4 text-body-2 text-medium-emphasis">أو</span>
              <v-divider class="flex-grow-1" />
            </div>

            <!-- Login Link -->
            <div class="text-center">
              <p class="text-body-2 mb-4 text-medium-emphasis">لديك حساب بالفعل؟</p>
              <v-btn
                variant="outlined"
                color="secondary"
                @click="$router.push('/auth/login')"
                block
                rounded="xl"
                class="login-link-btn"
              >
                <template #prepend>
                  <v-icon>mdi-login-variant</v-icon>
                </template>
                تسجيل الدخول
              </v-btn>
            </div>
          </v-card-text>

          <!-- Note -->
          <v-card-actions class="pa-6 pt-0">
            <v-alert type="warning" variant="tonal" class="w-100" rounded="lg">
              <template #prepend>
                <v-icon>mdi-information-outline</v-icon>
              </template>
              <div class="text-center">
                <strong>ملاحظة:</strong> هذه صفحة تجريبية - لا يتم حفظ البيانات فعلياً
              </div>
            </v-alert>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
// Page configuration
definePageMeta({
  layout: 'empty',
  middleware: ['guest'] // Only for non-authenticated users
})

// Composables and stores
const router = useRouter()
const { showSuccess, showError } = useSnackbar()

// Form state
const registerForm = ref()
const loading = ref(false)
const error = ref('')
const success = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const showTerms = ref(false)
const showPrivacy = ref(false)

const formData = ref({
  name: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

// Form validation rules
const rules = {
  required: (value: string) => !!value || 'هذا الحقل مطلوب',
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'يجب إدخال بريد إلكتروني صالح'
  },
  username: (value: string) => {
    const pattern = /^[a-zA-Z0-9_]{3,20}$/
    return pattern.test(value) || 'اسم المستخدم يجب أن يكون 3-20 حرف (أحرف وأرقام فقط)'
  },
  minLength: (value: string) =>
    value.length >= 6 || 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
  passwordMatch: (value: string) =>
    value === formData.value.password || 'كلمتا المرور غير متطابقتين',
  mustAccept: (value: boolean) =>
    value === true || 'يجب الموافقة على الشروط والأحكام'
}

// Computed properties
const isFormValid = computed(() => {
  return (
    formData.value.name &&
    formData.value.username &&
    formData.value.email &&
    formData.value.password &&
    formData.value.confirmPassword &&
    formData.value.acceptTerms &&
    formData.value.password === formData.value.confirmPassword &&
    formData.value.password.length >= 6
  )
})

// Methods
const handleRegister = async () => {
  try {
    // Validate form
    const { valid } = await registerForm.value.validate()
    if (!valid) return

    loading.value = true
    error.value = ''
    success.value = ''

    // Simulate registration process
    await new Promise(resolve => setTimeout(resolve, 2000))

    // For demo purposes, just show success message
    success.value = 'تم إنشاء الحساب بنجاح! سيتم توجيهك لصفحة تسجيل الدخول...'

    // Redirect to login after 3 seconds
    setTimeout(async () => {
      await router.push('/auth/login')
      showSuccess('يمكنك الآن تسجيل الدخول باستخدام الحساب الجديد')
    }, 3000)

  } catch (err: any) {
    console.error('Registration error:', err)
    error.value = err.message || 'حدث خطأ أثناء إنشاء الحساب'
  } finally {
    loading.value = false
  }
}

// Clear passwords when component unmounts for security
onBeforeUnmount(() => {
  formData.value.password = ''
  formData.value.confirmPassword = ''
})
</script>

<style scoped>
.register-container {
  background: linear-gradient(135deg, #7b1fa2 0%, #9c27b0 50%, #7b1fa2 100%);
  min-height: 100vh;
  padding: 0;
}

.min-h-screen {
  min-height: 100vh;
}

.register-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.register-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
}

.register-header {
  background: linear-gradient(135deg, #7b1fa2 0%, #9c27b0 50%, #6a1b9a 100%);
  padding: 2rem 1.5rem;
  position: relative;
  overflow: hidden;
}

.register-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: rotate(45deg);
  animation: shimmer 3s ease-in-out infinite;
}

.register-avatar {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.register-btn {
  height: 56px !important;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%);
  transition: all 0.3s ease;
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(123, 31, 162, 0.4);
}

.login-link-btn {
  height: 48px !important;
  text-transform: none;
  border: 2px solid rgb(var(--v-theme-secondary));
  transition: all 0.3s ease;
}

.login-link-btn:hover {
  background: rgba(var(--v-theme-secondary), 0.1);
  transform: translateY(-1px);
}

:deep(.v-field--variant-outlined .v-field__outline) {
  --v-field-border-width: 2px;
}

:deep(.v-field--focused .v-field__outline) {
  --v-field-border-width: 3px;
}

:deep(.v-text-field .v-field) {
  transition: all 0.3s ease;
}

:deep(.v-text-field:hover .v-field) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.v-alert) {
  border-radius: 12px !important;
}

:deep(.v-checkbox .v-selection-control__wrapper) {
  margin-left: 8px;
}

/* Responsive Design */
@media (max-width: 960px) {
  .register-header {
    padding: 1.5rem 1rem;
  }

  :deep(.v-card-text) {
    padding: 1.5rem !important;
  }

  :deep(.v-card-actions) {
    padding: 1.5rem !important;
    padding-top: 0 !important;
  }
}

@media (max-width: 600px) {
  .register-container {
    padding: 1rem;
  }

  .register-header {
    padding: 1rem;
  }

  :deep(.v-card-text) {
    padding: 1rem !important;
  }

  :deep(.v-card-actions) {
    padding: 1rem !important;
    padding-top: 0 !important;
  }

  .register-card {
    margin: 0;
  }
}

/* RTL Support */
[dir="rtl"] .register-card {
  direction: rtl;
}

[dir="rtl"] :deep(.v-checkbox .v-selection-control__wrapper) {
  margin-right: 8px;
  margin-left: 0;
}

/* Animations */
@keyframes shimmer {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
  100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
}

.register-card {
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dark theme support */
.v-theme--dark .register-card {
  background: rgba(18, 18, 18, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.v-theme--dark .register-header {
  background: linear-gradient(135deg, #7b1fa2 0%, #9c27b0 50%, #6a1b9a 100%);
}
</style>
