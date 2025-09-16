# Nuxt 3 Data Fetching Guide

This guide explains how to use Nuxt 3's built-in data fetching features in our project through the unified `useApi` composable.

## Overview

We've replaced axios with Nuxt 3's native data fetching capabilities:
- **`useFetch`** for GET requests (supports SSR, caching, and reactivity)
- **`$fetch`** for other HTTP methods (POST, PUT, DELETE)
- **Global error handling** with automatic 401 token expiry management
- **Automatic token injection** for authenticated requests

## API Composable (`useApi`)

### Location
`composables/useApi.ts`

### Features
- ✅ Automatic authorization token injection
- ✅ Global 401 handling with session expiry notification
- ✅ Error management with snackbar notifications
- ✅ TypeScript support
- ✅ SSR-compatible for GET requests
- ✅ Arabic session expiry messages

## Usage Examples

### 1. GET Requests (Data Fetching)

#### Basic Usage
```typescript
// In a component or composable
const { get } = useApi()

// Fetch data with automatic SSR support
const { data, pending, error, refresh } = await get<User[]>('/users', {
  server: true,  // Enable SSR (default: true)
  lazy: false    // Immediate loading (default: false)
})

// Access reactive data
const users = data.value
```

#### In Pinia Stores
```typescript
// stores/users.ts
export const useUsersStore = defineStore('users', {
  actions: {
    async fetchUsers() {
      this.loading = true
      try {
        const { get } = useApi()
        const { data } = await get<{results: User[], count: number}>('/users', {
          server: false // Client-side only for stores
        })
        
        if (data.value) {
          this.users = data.value.results
          this.totalUsers = data.value.count
        }
      } catch (error: any) {
        this.error = error.data?.message || 'Failed to fetch users'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
```

#### Direct useFetch Alternative
```typescript
// Direct approach without the composable
const { data: users, pending, error, refresh } = await useFetch<User[]>('/users', {
  baseURL: useRuntimeConfig().public.apiBaseUrl,
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
})
```

### 2. POST Requests (Create Data)

```typescript
// In a component
const { post } = useApi()

const handleCreateUser = async (userData: CreateUserData) => {
  try {
    const newUser = await post<User>('/users/create', userData)
    
    // Show success message (handled automatically by error handler)
    console.log('User created:', newUser)
    
    // Refresh data
    await refreshUsers()
  } catch (error) {
    // Error handling is automatic via global error handler
    console.error('Creation failed:', error)
  }
}
```

### 3. PUT Requests (Update Data)

```typescript
const { put } = useApi()

const handleUpdateUser = async (userId: number, userData: UpdateUserData) => {
  try {
    const updatedUser = await put<User>(`/users/${userId}`, userData)
    return updatedUser
  } catch (error) {
    // Global error handling applies
    throw error
  }
}
```

### 4. DELETE Requests

```typescript
const { delete: del } = useApi()

const handleDeleteUser = async (userId: number) => {
  try {
    await del(`/users/${userId}`)
    console.log('User deleted successfully')
  } catch (error) {
    throw error
  }
}
```

## Best Practices

### 1. Use GET for Data Fetching
- ✅ Use `get()` from `useApi()` for initial data loading
- ✅ Supports SSR, caching, and automatic refreshing
- ✅ Perfect for page data that needs to be available on server-side

```typescript
// ✅ Good - SSR compatible
const { data: products } = await get<Product[]>('/products')

// ❌ Avoid - No SSR support
const products = await post<Product[]>('/products/list', {})
```

### 2. Handle Loading States

```typescript
<template>
  <div>
    <v-progress-linear v-if="pending" indeterminate />
    <div v-else-if="error" class="error">
      {{ error.message }}
    </div>
    <UserList v-else :users="data" />
  </div>
</template>

<script setup>
const { data, pending, error } = await useFetchData<User[]>('/users')
</script>
```

### 3. Error Handling

The global error handler automatically:
- Shows appropriate snackbar notifications
- Handles 401 token expiry with Arabic message
- Redirects to login on session expiry
- Logs errors to console

```typescript
// No need for manual error handling in most cases
try {
  const result = await post('/users/create', userData)
  // Success handling only
} catch (error) {
  // Error is already handled globally
  // Only add custom logic if needed
}
```

### 4. TypeScript Integration

```typescript
interface ApiResponse<T> {
  results: T[]
  count: number
  next?: string
  previous?: string
}

// Strongly typed API calls
const { data } = await get<ApiResponse<User>>('/users')
const users = data.value?.results || []
```

## Migration from Axios

### Old Axios Approach
```typescript
// ❌ Old way
const { $axios } = useNuxtApp()
const response = await $axios.get('/users')
const users = response.data
```

### New Nuxt 3 Approach
```typescript
// ✅ New way
const { get } = useApi()
const { data } = await get<User[]>('/users')
const users = data.value
```

## Configuration

### Runtime Config
Ensure your `nuxt.config.ts` has the API base URL configured:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'
    }
  }
})
```

### Environment Variables
```bash
# .env
NUXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api
```

## Advanced Usage

### Custom Headers
```typescript
const { post } = useApi()

// Custom headers are merged with default auth headers
const result = await $fetch('/special-endpoint', {
  baseURL: config.public.apiBaseUrl,
  method: 'POST',
  headers: {
    ...getAuthHeaders(),
    'X-Custom-Header': 'value'
  },
  body: data
})
```

### Server vs Client-side Fetching
```typescript
// SSR + Client hydration (default)
const { data } = await get('/users', { server: true })

// Client-side only (good for user-specific data)
const { data } = await get('/profile', { server: false })

// Lazy loading (doesn't block navigation)
const { data } = await get('/optional-data', { lazy: true })
```

## Troubleshooting

### Common Issues

1. **"Token not found" errors**
   - Tokens are only available on client-side
   - Use `server: false` for authenticated requests in stores

2. **SSR hydration mismatches**
   - Use `server: false` for user-specific data
   - Ensure data structure is consistent between server and client

3. **Type errors with data.value**
   - Always check `if (data.value)` before accessing properties
   - Use optional chaining: `data.value?.results`

4. **401 handling not working**
   - Ensure the error has `status` or `statusCode` property
   - Check that `useAuthStore` is properly imported

### Debug Mode
Add this to see request/response details:
```typescript
// Add to composables/useApi.ts for debugging
console.log('API Request:', { endpoint, method, headers, body })
```

## Next Steps

1. ✅ All stores updated to use new API composable
2. ✅ Global 401 handling implemented
3. ✅ Arabic session expiry notifications
4. 📝 Test all API endpoints with new implementation
5. 📝 Update any remaining axios usage in components

For session expiry handling details, see [README-TOKEN-EXPIRED-LOGOUT.md](./README-TOKEN-EXPIRED-LOGOUT.md) 