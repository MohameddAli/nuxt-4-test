# Global Snackbar System

A comprehensive notification system for Nuxt 3 + Vuetify applications that provides consistent, accessible, and beautiful notifications throughout your app.

## 🚀 Features

- **Type-safe**: Full TypeScript support with proper interfaces
- **Vuetify Integration**: Seamlessly integrates with Vuetify's design system
- **Multiple Types**: Success, Error, Warning, and Info notifications
- **Customizable**: Full control over timeouts, positions, icons, and actions
- **RTL Support**: Works perfectly with Arabic and other RTL languages
- **Global State**: One snackbar instance manages all notifications
- **HTTP Integration**: Automatic handling of API responses and errors
- **Action Buttons**: Support for custom action buttons

## 📦 Installation & Setup

### 1. Files Included

- `composables/useSnackbar.ts` - The main composable
- `components/GlobalSnackbar.vue` - The display component
- Integration in `app.vue`

### 2. Setup Process

The system is already integrated into your app! The `GlobalSnackbar` component is included in `app.vue`, making it available throughout your entire application.

## 🎯 Basic Usage

### Simple Notifications

```vue
<script setup>
import { useSnackbar } from '@/composables/useSnackbar'

const { showSuccess, showError, showWarning, showInfo } = useSnackbar()

// Simple success message
showSuccess('تم حفظ البيانات بنجاح')

// Simple error message
showError('حدث خطأ أثناء حفظ البيانات')

// Warning message
showWarning('تحذير: تأكد من صحة البيانات')

// Info message
showInfo('معلومة: يمكنك حفظ التغييرات لاحقاً')
</script>
```

### Advanced Notifications

```vue
<script setup>
import { useSnackbar } from '@/composables/useSnackbar'

const { showSnackbar } = useSnackbar()

// Custom notification with options
showSnackbar({
  message: 'رسالة مخصصة',
  type: 'success',
  timeout: 10000, // 10 seconds
  position: 'top',
  icon: 'mdi-check-circle',
  closable: true
})

// Notification with action buttons
showSnackbar({
  message: 'هل تريد حفظ التغييرات؟',
  type: 'warning',
  timeout: 0, // No auto-hide
  actions: [
    {
      label: 'حفظ',
      color: 'primary',
      handler: () => {
        // Handle save action
        console.log('Saving...')
      }
    },
    {
      label: 'إلغاء',
      color: 'error',
      handler: () => {
        // Handle cancel action
        console.log('Cancelled')
      }
    }
  ]
})
</script>
```

## 🌐 HTTP Integration

### Automatic Response Handling

```vue
<script setup>
import { useSnackbar } from '@/composables/useSnackbar'

const { showFromResponse, showFromError } = useSnackbar()

const handleApiCall = async () => {
  try {
    const response = await $fetch('/api/users', {
      method: 'POST',
      body: userData
    })
    
    // Automatically shows success message from response
    showFromResponse(response, 'تم إنشاء المستخدم بنجاح')
    
  } catch (error) {
    // Automatically shows error message from backend
    showFromError(error)
  }
}
</script>
```

### Manual Error Handling

```vue
<script setup>
import { useSnackbar } from '@/composables/useSnackbar'

const { showError } = useSnackbar()

const handleLogin = async (credentials) => {
  try {
    await authStore.login(credentials)
    // Success handling...
  } catch (error) {
    // Extract error message from different possible sources
    const message = error.response?.data?.message || 
                   error.message || 
                   'حدث خطأ غير متوقع'
    
    showError(message)
  }
}
</script>
```

## ⚙️ Configuration Options

### SnackbarOptions Interface

```typescript
interface SnackbarOptions {
  message: string                    // Required: The notification message
  type?: 'success' | 'error' | 'warning' | 'info'  // Default: 'info'
  timeout?: number                   // Default: 5000 (milliseconds), 0 = no auto-hide
  closable?: boolean                 // Default: true
  position?: 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'  // Default: 'bottom'
  icon?: string                      // Auto-selected based on type if not provided
  actions?: SnackbarAction[]         // Custom action buttons
}

interface SnackbarAction {
  label: string                      // Button text
  color?: string                     // Button color
  handler: () => void               // Click handler function
}
```

### Default Timeouts

- **Success**: 3 seconds
- **Error**: 6 seconds  
- **Warning**: 4 seconds
- **Info**: 4 seconds

### Default Icons

- **Success**: `mdi-check-circle`
- **Error**: `mdi-alert-circle`
- **Warning**: `mdi-alert`
- **Info**: `mdi-information`

## 📍 Position Options

Available positions for the snackbar:

- `'top'` - Top center
- `'bottom'` - Bottom center (default)
- `'top-left'` - Top left corner
- `'top-right'` - Top right corner  
- `'bottom-left'` - Bottom left corner
- `'bottom-right'` - Bottom right corner

## 🎨 Styling & Theming

The snackbar automatically adapts to your Vuetify theme:

- **Colors**: Uses theme colors (success, error, warning, info)
- **RTL Support**: Automatically adjusts for Arabic text direction
- **Responsive**: Works on all screen sizes
- **High Z-Index**: Always appears above other content (z-index: 9999)

## 📱 Real-World Examples

### Form Validation

```vue
<template>
  <v-form @submit.prevent="handleSubmit">
    <!-- form fields -->
    <v-btn type="submit" :loading="loading">Submit</v-btn>
  </v-form>
</template>

<script setup>
import { useSnackbar } from '@/composables/useSnackbar'

const { showSuccess, showError } = useSnackbar()
const loading = ref(false)

const handleSubmit = async (formData) => {
  loading.value = true
  
  try {
    await $fetch('/api/forms', {
      method: 'POST',
      body: formData
    })
    
    showSuccess('تم إرسال النموذج بنجاح')
    
  } catch (error) {
    if (error.status === 422) {
      showError('يرجى التحقق من البيانات المدخلة')
    } else {
      showError('حدث خطأ أثناء إرسال النموذج')
    }
  } finally {
    loading.value = false
  }
}
</script>
```

### File Upload

```vue
<script setup>
import { useSnackbar } from '@/composables/useSnackbar'

const { showSuccess, showError, showInfo } = useSnackbar()

const handleFileUpload = async (file) => {
  showInfo('جاري رفع الملف...')
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    await $fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    showSuccess('تم رفع الملف بنجاح')
    
  } catch (error) {
    showError('فشل في رفع الملف')
  }
}
</script>
```

### Confirmation Actions

```vue
<script setup>
import { useSnackbar } from '@/composables/useSnackbar'

const { showSnackbar } = useSnackbar()

const handleDelete = (item) => {
  showSnackbar({
    message: `هل أنت متأكد من حذف "${item.name}"؟`,
    type: 'warning',
    timeout: 0, // Don't auto-hide
    actions: [
      {
        label: 'حذف',
        color: 'error',
        handler: async () => {
          try {
            await $fetch(`/api/items/${item.id}`, { method: 'DELETE' })
            showSuccess('تم الحذف بنجاح')
          } catch (error) {
            showError('فشل في الحذف')
          }
        }
      },
      {
        label: 'إلغاء',
        color: 'grey',
        handler: () => {
          // Just closes the snackbar
        }
      }
    ]
  })
}
</script>
```

## 🔧 Advanced Usage

### Programmatic Control

```vue
<script setup>
import { useSnackbar } from '@/composables/useSnackbar'

const { 
  snackbarState, 
  hideSnackbar, 
  clearActions 
} = useSnackbar()

// Access current state
console.log('Is showing:', snackbarState.show)
console.log('Current message:', snackbarState.message)

// Hide programmatically
hideSnackbar()

// Clear all actions
clearActions()
</script>
```

### Custom Composable Wrapper

```typescript
// composables/useNotifications.ts
export const useNotifications = () => {
  const { showSuccess, showError } = useSnackbar()
  
  const notifySuccess = (key: string, params?: any) => {
    const { $t } = useNuxtApp()
    showSuccess($t(key, params))
  }
  
  const notifyError = (key: string, params?: any) => {
    const { $t } = useNuxtApp()
    showError($t(key, params))
  }
  
  return {
    notifySuccess,
    notifyError
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Snackbar not showing**: Make sure `GlobalSnackbar` is included in your `app.vue`

2. **Messages not in Arabic**: Check that your i18n is properly configured

3. **Styling issues**: Ensure Vuetify theme is properly set up

4. **TypeScript errors**: Make sure you're importing the correct types

### Performance Tips

- The snackbar uses a single global instance, so it's very lightweight
- Messages are queued automatically - you don't need to worry about overlapping
- Use appropriate timeouts to avoid overwhelming users

## 🤝 Contributing

Feel free to extend this system by:

- Adding new notification types
- Implementing queuing for multiple simultaneous notifications  
- Adding sound notifications
- Creating preset notification templates

## 📄 License

This snackbar system is part of your Nuxt application and follows the same licensing terms. 