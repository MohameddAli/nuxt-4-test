<template>
  <v-container fluid class="login-container">
    <v-row justify="center" align="center" class="min-h-screen">
      <v-col cols="12" sm="10" md="8" lg="5" xl="4">
        <v-card class="login-card" elevation="24" rounded="xl">
          <!-- Header with gradient -->
          <v-card-item class="login-header">
            <v-card-title class="text-center">
              <v-avatar size="80" class="mb-4 login-avatar">
                <v-icon size="40" color="white">mdi-shield-account-outline</v-icon>
              </v-avatar>
              <div class="text-h4 font-weight-bold text-white mb-2">تسجيل الدخول</div>
              <div class="text-subtitle-1 text-white opacity-90">مرحباً بعودتك إلى منصتنا</div>
            </v-card-title>
          </v-card-item>

          <!-- Login Form -->
          <v-card-text class="pa-8">
            <v-form @submit.prevent="handleLogin" ref="loginForm">
              <v-text-field
                v-model="credentials.username"
                label="اسم المستخدم"
                prepend-inner-icon="mdi-account-outline"
                variant="outlined"
                :rules="[rules.required]"
                :disabled="loading"
                class="mb-4"
                autocomplete="username"
                color="primary"
                bg-color="surface"
                rounded="lg"
                hide-details="auto"
                clearable
              />

              <v-text-field
                v-model="credentials.password"
                label="كلمة المرور"
                prepend-inner-icon="mdi-lock-outline"
                variant="outlined"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                @click:append-inner="showPassword = !showPassword"
                :rules="[rules.required]"
                :disabled="loading"
                class="mb-6"
                autocomplete="current-password"
                color="primary"
                bg-color="surface"
                rounded="lg"
                hide-details="auto"
                clearable
              />

              <!-- Error Alert -->
              <v-expand-transition>
                <v-alert
                  v-if="error"
                  type="error"
                  variant="tonal"
                  class="mb-6"
                  closable
                  @click:close="error = ''"
                  rounded="lg"
                  border="start"
                  border-color="error"
                >
                  <template #prepend>
                    <v-icon>mdi-alert-circle-outline</v-icon>
                  </template>
                  {{ error }}
                </v-alert>
              </v-expand-transition>

              <!-- Login Button -->
              <v-btn
                type="submit"
                block
                size="x-large"
                color="primary"
                :loading="loading"
                :disabled="!isFormValid"
                class="mb-6 login-btn"
                rounded="xl"
                elevation="4"
              >
                <template #prepend>
                  <v-icon>mdi-login</v-icon>
                </template>
                تسجيل الدخول
              </v-btn>
            </v-form>

            <!-- Divider -->
            <v-divider class="mb-6">
              <template #default>
                <v-chip
                  color="surface-variant"
                  size="small"
                  variant="elevated"
                  rounded="xl"
                >
                  أو
                </v-chip>
              </template>
            </v-divider>

            <!-- Register Link -->
            <div class="text-center">
              <p class="text-body-2 mb-4 text-medium-emphasis">ليس لديك حساب؟</p>
              <v-btn
                variant="outlined"
                color="secondary"
                @click="$router.push('/auth/register')"
                block
                size="large"
                rounded="xl"
                class="register-link-btn"
              >
                <template #prepend>
                  <v-icon>mdi-account-plus-outline</v-icon>
                </template>
                إنشاء حساب جديد
              </v-btn>
            </div>
          </v-card-text>

          <!-- Test Credentials Info -->
          <v-card-actions class="pa-6 pt-0">
            <v-alert type="info" variant="tonal" class="w-100" rounded="lg" border="start">
              <template #prepend>
                <v-icon>mdi-information-outline</v-icon>
              </template>
              <div class="text-center">
                <div class="text-subtitle-2 font-weight-bold mb-2">بيانات الاختبار</div>
                <div class="d-flex justify-center flex-wrap gap-2">
                  <v-chip size="small" color="primary" variant="flat" class="ma-1">
                    <v-icon start size="small">mdi-account</v-icon>
                    test
                  </v-chip>
                  <v-chip size="small" color="secondary" variant="flat" class="ma-1">
                    <v-icon start size="small">mdi-lock</v-icon>
                    test
                  </v-chip>
                </div>
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
const authStore = useAuthStore()
const { showSuccess, showError } = useSnackbar()

// Form state
const loginForm = ref()
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const credentials = ref({
  username: '',
  password: ''
})

// Form validation rules
const rules = {
  required: (value: string) => !!value || 'هذا الحقل مطلوب'
}

// Computed properties
const isFormValid = computed(() => {
  return credentials.value.username && credentials.value.password
})

// Methods
const handleLogin = async () => {
  try {
    // Validate form
    const { valid } = await loginForm.value.validate()
    if (!valid) return

    loading.value = true
    error.value = ''

    // Check for test credentials
    const { username, password } = credentials.value

    if (username === 'test' && password === 'test') {
      // Simulate successful login with test credentials
      // Create mock user data
      const mockUser = {
        id: 1,
        username: 'test',
        email: 'test@example.com',
        name: 'Test User',
        permissions: ['dashboard.view', 'users.view', 'users.create', 'users.edit'],
        roles: ['user']
      }

      // Set auth data
      authStore.token = 'mock-jwt-token-test-user'
      authStore.user = mockUser

      // Store in localStorage
      if (process.client) {
        localStorage.setItem('auth_token', 'mock-jwt-token-test-user')
        localStorage.setItem('auth_user', JSON.stringify(mockUser))
      }

      showSuccess('تم تسجيل الدخول بنجاح!')

      // Redirect to intended page or dashboard
      let redirectUrl = '/dashboard'
      if (process.client) {
        const storedRedirect = localStorage.getItem('auth_redirect_url')
        if (storedRedirect) {
          redirectUrl = storedRedirect
          localStorage.removeItem('auth_redirect_url')
        }
      }

      await router.push(redirectUrl)
    } else {
      // Invalid credentials
      error.value = 'اسم المستخدم أو كلمة المرور غير صحيحة'
    }
  } catch (err: any) {
    console.error('Login error:', err)
    error.value = err.message || 'حدث خطأ أثناء تسجيل الدخول'
  } finally {
    loading.value = false
  }
}

// Auto-fill test credentials on component mount
onMounted(() => {
  credentials.value = {
    username: 'test',
    password: 'test'
  }
})
</script>

<style scoped>
.login-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%);
  min-height: 100vh;
  padding: 0;
}

.min-h-screen {
  min-height: 100vh;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
}

.login-header {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%);
  padding: 2rem 1.5rem;
  position: relative;
  overflow: hidden;
}

.login-header::before {
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

.login-avatar {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.login-btn {
  height: 56px !important;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(25, 118, 210, 0.4);
}

.register-link-btn {
  height: 48px !important;
  text-transform: none;
  border: 2px solid rgb(var(--v-theme-primary));
  transition: all 0.3s ease;
}

.register-link-btn:hover {
  background: rgba(var(--v-theme-primary), 0.1);
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

/* Responsive Design */
@media (max-width: 960px) {
  .login-header {
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
  .login-container {
    padding: 1rem;
  }

  .login-header {
    padding: 1rem;
  }

  :deep(.v-card-text) {
    padding: 1rem !important;
  }

  :deep(.v-card-actions) {
    padding: 1rem !important;
    padding-top: 0 !important;
  }

  .login-card {
    margin: 0;
  }
}

/* RTL Support */
[dir="rtl"] .login-card {
  direction: rtl;
}

/* Animations */
@keyframes shimmer {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
  100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
}

.login-card {
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
.v-theme--dark .login-card {
  background: rgba(18, 18, 18, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.v-theme--dark .login-header {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%);
}
</style>
