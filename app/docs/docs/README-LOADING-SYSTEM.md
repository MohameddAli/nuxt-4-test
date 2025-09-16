# Global Loading System

A comprehensive global loading system for Nuxt 3 applications that provides consistent loading states across navigation, API calls, and custom operations.

## 🚀 Features

- **Automatic Navigation Loading**: Shows loading during page transitions
- **Manual Loading Control**: Start/stop loading for custom operations  
- **API Integration**: Easy integration with API calls
- **Multiple Loading Types**: Navigation, API, and manual loading types
- **Loading Stack Management**: Handle multiple concurrent loading operations
- **TypeScript Support**: Full type safety with proper interfaces
- **Auto-cleanup**: Prevents memory leaks with automatic cleanup
- **Customizable Text**: Dynamic loading messages based on context
- **Professional UI**: Beautiful loading overlay with text

## 📦 Installation & Setup

### Files Created

- `stores/loading.ts` - Pinia store for loading state management
- `composables/useLoading.ts` - Composable for easy loading control
- `plugins/loading.client.ts` - Plugin for automatic navigation loading
- `components/LoadingOverlay.vue` - Updated with text support
- `app.vue` - Updated to use global loading

### Setup Steps

1. The system is automatically integrated into your app
2. Navigation loading works out of the box
3. Use the composable for custom loading operations

## 🎯 Basic Usage

### Automatic Navigation Loading

Navigation loading is handled automatically:

```vue
<!-- No code needed - automatic -->
<!-- When user clicks sidebar links or navigates, loading shows automatically -->
```

### Manual Loading Control

```vue
<script setup>
import { useLoading } from '@/composables/useLoading'

const { startLoading, stopLoading, withLoading } = useLoading()

// Basic loading
const handleOperation = async () => {
  const loading = startLoading({ 
    text: 'Processing...',
    type: 'manual'
  })
  
  try {
    await someAsyncOperation()
  } finally {
    loading.stop()
  }
}

// Using withLoading wrapper
const handleWithWrapper = async () => {
  await withLoading(
    () => someAsyncOperation(),
    { text: 'Saving data...', type: 'api' }
  )
}
</script>
```

### API Integration

```vue
<script setup>
import { useLoading } from '@/composables/useLoading'

const { startApiLoading, stopApiLoading, withLoading } = useLoading()

// Method 1: Manual API loading
const fetchData = async () => {
  startApiLoading('Loading users...')
  try {
    const response = await $fetch('/api/users')
    return response
  } finally {
    stopApiLoading()
  }
}

// Method 2: Using withLoading
const saveUser = async (userData) => {
  return withLoading(
    () => $fetch('/api/users', { method: 'POST', body: userData }),
    { text: 'Saving user...', type: 'api' }
  )
}
</script>
```

## 🔧 Advanced Usage

### Loading State Monitoring

```vue
<template>
  <div>
    <v-btn :disabled="isLoading" @click="handleAction">
      {{ isLoading ? 'Processing...' : 'Submit' }}
    </v-btn>
    
    <v-chip v-if="loadingCount > 0" color="info">
      {{ loadingCount }} operations running
    </v-chip>
  </div>
</template>

<script setup>
import { useLoading } from '@/composables/useLoading'

const { 
  isLoading, 
  loadingCount, 
  isNavigationLoading, 
  isApiLoading 
} = useLoading()

const handleAction = async () => {
  // Your async operation
}
</script>
```

### Component Auto-Cleanup

```vue
<script setup>
import { useAutoLoading } from '@/composables/useLoading'

// Automatically cleans up on component unmount
const { startLoading, activeLoadingsCount } = useAutoLoading({
  type: 'manual'
})

const handleLongOperation = () => {
  const loading = startLoading({ text: 'Processing...' })
  // Loading will be automatically stopped when component unmounts
}
</script>
```

### Function Wrapper

```vue
<script setup>
import { useLoading } from '@/composables/useLoading'

const { createLoadingWrapper } = useLoading()

// Wrap async functions with loading
const saveDataWithLoading = createLoadingWrapper(
  async (data) => {
    return await $fetch('/api/save', { method: 'POST', body: data })
  },
  { text: 'Saving...', type: 'api' }
)

// Use the wrapped function
const handleSave = async () => {
  try {
    await saveDataWithLoading(formData)
    // Success handling
  } catch (error) {
    // Error handling
  }
}
</script>
```

## 🏪 Store Integration

### In Pinia Stores

```typescript
// stores/users.ts
import { useLoading } from '@/composables/useLoading'

export const useUsersStore = defineStore('users', {
  actions: {
    async fetchUsers() {
      const { withLoading } = useLoading()
      
      await withLoading(
        async () => {
          const { get } = useApi()
          const { data } = await get<User[]>('/users', { server: false })
          if (data.value) {
            this.users = data.value
          }
        },
        { text: 'Loading users...', type: 'api' }
      )
    },

    async createUser(userData: Partial<User>) {
      const { withLoading } = useLoading()
      
      return withLoading(
        async () => {
          const { post } = useApi()
          const response = await post<User>('/users/create', userData)
          await this.fetchUsers()
          return response
        },
        { text: 'Creating user...', type: 'api' }
      )
    }
  }
})
```

### Global $loading Provider

The plugin provides global access:

```vue
<script setup>
const { $loading } = useNuxtApp()

const handleOperation = async () => {
  const id = $loading.start('Processing...')
  try {
    await someOperation()
  } finally {
    $loading.stop(id)
  }
}
</script>
```

## 🎨 Customization

### Custom Loading Text

The system provides contextual loading messages:

```typescript
// Navigation loading text is automatic:
// '/dashboard' → 'Loading dashboard...'
// '/users' → 'Loading users...'
// '/groups' → 'Loading groups...'

// Custom text for operations
const { startLoading } = useLoading()

startLoading({ 
  text: 'Uploading files...', 
  type: 'manual' 
})
```

### Loading Types

```typescript
// Different loading types for better UX
startLoading({ type: 'navigation' }) // For route changes
startLoading({ type: 'api' })        // For API calls  
startLoading({ type: 'manual' })     // For custom operations
```

### Updating Loading Text

```typescript
const { startLoading } = useLoading()

const loading = startLoading({ text: 'Starting...' })

// Update text during operation
loading.updateText('Processing step 1...')
setTimeout(() => {
  loading.updateText('Processing step 2...')
}, 2000)

// Stop when done
loading.stop()
```

## 📱 Real-World Examples

### Form Submission

```vue
<template>
  <v-form @submit.prevent="handleSubmit">
    <v-text-field v-model="name" label="Name" />
    <v-btn 
      type="submit" 
      :loading="isApiLoading"
      :disabled="isLoading"
    >
      {{ isApiLoading ? 'Saving...' : 'Save' }}
    </v-btn>
  </v-form>
</template>

<script setup>
import { useLoading } from '@/composables/useLoading'

const { withLoading, isApiLoading, isLoading } = useLoading()
const name = ref('')

const handleSubmit = async () => {
  await withLoading(
    async () => {
      await $fetch('/api/users', {
        method: 'POST',
        body: { name: name.value }
      })
      // Reset form
      name.value = ''
    },
    { text: 'Creating user...', type: 'api' }
  )
}
</script>
```

### File Upload with Progress

```vue
<script setup>
import { useLoading } from '@/composables/useLoading'

const { startLoading } = useLoading()

const handleFileUpload = async (file) => {
  const loading = startLoading({ 
    text: 'Preparing upload...', 
    type: 'manual' 
  })

  try {
    loading.updateText('Uploading file...')
    
    const formData = new FormData()
    formData.append('file', file)
    
    await $fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    loading.updateText('Processing file...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
  } finally {
    loading.stop()
  }
}
</script>
```

### Multiple Concurrent Operations

```vue
<script setup>
import { useLoading } from '@/composables/useLoading'

const { startLoading, loadingCount } = useLoading()

const handleMultipleOperations = async () => {
  // Start multiple loading operations
  const loading1 = startLoading({ 
    text: 'Operation 1...', 
    id: 'op1' 
  })
  
  const loading2 = startLoading({ 
    text: 'Operation 2...', 
    id: 'op2' 
  })

  try {
    // Run operations in parallel
    await Promise.all([
      operation1().finally(() => loading1.stop()),
      operation2().finally(() => loading2.stop())
    ])
  } catch (error) {
    // Cleanup on error
    loading1.stop()
    loading2.stop()
  }
}
</script>
```

## ⚙️ Configuration

### Store State

```typescript
interface LoadingState {
  isLoading: boolean          // Any loading active
  loadingText: string         // Current loading message
  loadingType: 'navigation' | 'api' | 'manual'  // Loading type
  loadingStack: string[]      // Active loading operations
}
```

### Available Getters

```typescript
// Store getters
hasActiveLoading      // boolean - Any loading active
currentLoadingText    // string - Current text
isNavigationLoading   // boolean - Navigation loading active
isApiLoading          // boolean - API loading active  
loadingCount          // number - Count of active operations
```

### Available Actions

```typescript
// Store actions
startLoading(options)           // Start loading
stopLoading(id?)               // Stop loading
startNavigationLoading(text)   // Start navigation loading
stopNavigationLoading()        // Stop navigation loading
startApiLoading(text)          // Start API loading
stopApiLoading()               // Stop API loading
withLoading(operation, options) // Execute with loading
clearAllLoading()              // Clear all loading
updateLoadingText(text)        // Update current text
```

## 🐛 Troubleshooting

### Common Issues

1. **Loading not showing**: Check that `LoadingOverlay` is in `app.vue`
2. **Navigation loading not working**: Ensure plugin is loaded (client-side)
3. **Multiple loadings**: Use unique IDs or the loading stack system
4. **Loading stuck**: Add timeout protection in your operations

### Debug Loading State

```vue
<template>
  <div>
    <pre>{{ loadingDebug }}</pre>
  </div>
</template>

<script setup>
import { useLoadingStore } from '@/stores/loading'

const loadingStore = useLoadingStore()

const loadingDebug = computed(() => ({
  isLoading: loadingStore.isLoading,
  loadingText: loadingStore.loadingText,
  loadingType: loadingStore.loadingType,
  stackCount: loadingStore.loadingStack.length,
  stack: loadingStore.loadingStack
}))
</script>
```

### Performance Tips

- Use specific loading types for better UX
- Clean up loading operations properly
- Use `withLoading` for automatic cleanup
- Avoid infinite loading with timeouts

## 🚀 Best Practices

### ✅ Do

- Use `withLoading` for automatic cleanup
- Provide meaningful loading text
- Use appropriate loading types
- Handle errors with proper cleanup
- Use auto-cleanup composable in components

### ❌ Don't

- Forget to stop loading operations
- Use generic loading text for everything
- Start loading without proper cleanup
- Ignore loading states in UI
- Block UI unnecessarily long

## 🔮 Future Enhancements

Potential improvements to consider:

- Progress bar support for file uploads
- Loading animation variations
- Sound effects for loading states
- Loading history and analytics
- Custom loading overlay themes

---

The global loading system provides a professional, consistent loading experience across your entire Nuxt 3 application with minimal setup and maximum flexibility. 