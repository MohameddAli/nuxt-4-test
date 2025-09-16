# Global Token Expiry & Auto-Logout System

This document explains how our application handles token expiration (401 status codes) globally with Arabic notifications and automatic logout functionality.

## Overview

When a user's session expires (JWT token becomes invalid), the system:
1. ✅ **Detects 401 status codes** from any API call
2. ✅ **Shows Arabic notification**: "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى"
3. ✅ **Clears all user data** from localStorage and Pinia store
4. ✅ **Redirects to login page** automatically
5. ✅ **Works globally** across all API calls without manual handling

## Implementation

### 1. Global Error Handler

Located in `composables/useApi.ts`:

```typescript
const handleApiError = async (error: any) => {
  console.error('API Error:', error)
  
  // Handle 401 - Token expired
  if (error?.status === 401 || error?.statusCode === 401) {
    if (process.client) {
      const authStore = useAuthStore()
      authStore.clearAuth()
      
      // Show Arabic notification for token expiry
      const { showError } = useSnackbar()
      showError('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى', {
        timeout: 5000
      })
      
      // Navigate to login
      await navigateTo('/login')
    }
    return
  }
  
  // Handle other errors
  const { showFromError } = useSnackbar()
  showFromError(error)
}
```

### 2. Integration with API Calls

#### useFetch (GET requests)
```typescript
const { data, pending, error, refresh } = await useFetch<T>(endpoint, {
  baseURL: config.public.apiBaseUrl,
  headers: getAuthHeaders(),
  onResponseError({ response }) {
    handleApiError(response) // ✅ Automatic 401 handling
  }
})
```

#### $fetch (POST/PUT/DELETE requests)
```typescript
try {
  return await $fetch<T>(endpoint, {
    baseURL: config.public.apiBaseUrl,
    method: 'POST',
    headers: getAuthHeaders(),
    body
  })
} catch (error) {
  await handleApiError(error) // ✅ Automatic 401 handling
  throw error
}
```

### 3. Auth Store Integration

The `clearAuth()` method in `stores/auth.ts`:

```typescript
clearAuth() {
  this.token = null
  this.user = null
  this.error = null
  if (process.client) {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }
}
```

## Features

### ✅ Arabic Notification Message
- **Text**: "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى"
- **Translation**: "Session has expired, please log in again"
- **Duration**: 5 seconds
- **Type**: Error notification (red background)

### ✅ Complete Session Cleanup
- Removes `auth_token` from localStorage
- Removes `auth_user` from localStorage  
- Clears Pinia auth store state
- Resets any error states

### ✅ Automatic Redirection
- Navigates to `/login` page
- Works from any page in the application
- No manual intervention required

### ✅ Client-Side Only
- Only executes on client-side (`process.client` check)
- Prevents SSR issues
- Safe for universal applications

## Usage Examples

### Automatic Handling (Recommended)

Most API calls automatically handle token expiry:

```typescript
// This will automatically handle 401 errors
const { post } = useApi()

try {
  const result = await post('/users/create', userData)
  // Success logic only - no need to handle 401
} catch (error) {
  // 401 is already handled globally
  // Only handle other specific errors if needed
}
```

### Manual Check (Optional)

You can also check authentication status manually:

```typescript
const authStore = useAuthStore()

if (!authStore.isAuthenticated) {
  await navigateTo('/login')
}
```

## Multiple Tab Support

The auth plugin also handles storage events for multi-tab support:

```typescript
// plugins/auth.ts
window.addEventListener('storage', (event) => {
  if (event.key === 'auth_token' && !event.newValue) {
    authStore.clearAuth()
    navigateTo('/login')
  }
})
```

When a user logs out in one tab, all other tabs automatically:
- Clear their auth state
- Redirect to login
- Show the session expired message

## Customization

### Change Notification Message

Edit the message in `composables/useApi.ts`:

```typescript
// Current Arabic message
showError('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى', {
  timeout: 5000
})

// Custom message options
showError('Your session has expired. Please log in again.', {
  timeout: 3000,
  position: 'top'
})
```

### Change Redirect Target

Modify the navigation in the error handler:

```typescript
// Current redirect
await navigateTo('/login')

// Custom redirect with locale
const { $i18n } = useNuxtApp()
await navigateTo(`/${$i18n.locale.value}/login`)

// Redirect with return URL
await navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
```

### Custom Error Handling

Add additional logic before or after the standard handling:

```typescript
const handleApiError = async (error: any) => {
  // Custom logging
  console.error('API Error:', error)
  
  if (error?.status === 401) {
    // Custom analytics
    trackEvent('session_expired', { route: useRoute().path })
    
    // Standard handling
    if (process.client) {
      const authStore = useAuthStore()
      authStore.clearAuth()
      
      showError('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى')
      await navigateTo('/login')
    }
    return
  }
  
  // Handle other errors...
}
```

## Testing

### Simulate Token Expiry

You can test the system by:

1. **Invalid token**: Manually edit localStorage token
```javascript
localStorage.setItem('auth_token', 'invalid-token')
```

2. **Server response**: Have your backend return 401 for specific requests

3. **Manual trigger**: Call the error handler directly
```typescript
const { handleApiError } = useApi()
await handleApiError({ status: 401 })
```

### Test Checklist

- [ ] 401 response shows Arabic notification
- [ ] User is redirected to login page
- [ ] localStorage is cleared
- [ ] Pinia store is reset
- [ ] Multi-tab logout works
- [ ] SSR doesn't break (client-side only)

## Common Scenarios

### 1. Form Submission with Expired Token
```typescript
const handleSubmit = async (formData) => {
  const { post } = useApi()
  
  try {
    // If token expired, user will be redirected automatically
    await post('/users/create', formData)
    showSuccess('User created successfully')
  } catch (error) {
    // Only non-401 errors reach here
    console.error('Form submission failed:', error)
  }
}
```

### 2. Data Fetching with Expired Token
```typescript
const { data, error } = await useFetchData<User[]>('/users')

// If token expired during fetch:
// - User sees Arabic notification
// - User is redirected to login
// - Component can handle the error state normally
```

### 3. Background API Calls
```typescript
// Even background calls are protected
setInterval(async () => {
  try {
    const { get } = useApi()
    await get('/health-check')
  } catch (error) {
    // 401 handling is automatic
  }
}, 30000)
```

## Troubleshooting

### Issue: 401 handling not working
**Solutions:**
- Check that error has `status` or `statusCode` property
- Ensure `useAuthStore` is properly imported
- Verify `process.client` check is working

### Issue: Notification not showing
**Solutions:**
- Ensure `useSnackbar` composable is available
- Check that `GlobalSnackbar` component is in app layout
- Verify snackbar state management

### Issue: Redirect not working
**Solutions:**
- Check `navigateTo` import and usage
- Ensure route exists (`/login`)
- Verify no navigation guards blocking redirect

### Issue: Multiple redirects
**Solutions:**
- Check for recursive API calls after logout
- Ensure auth middleware doesn't conflict
- Add guards to prevent multiple redirects

## Best Practices

### ✅ Do
- Trust the global handler for 401 errors
- Focus on success path logic in components
- Test with real expired tokens
- Use meaningful Arabic error messages

### ❌ Don't
- Manually handle 401 errors in individual components
- Skip the global error handler for API calls
- Forget to test multi-tab scenarios
- Hardcode error messages instead of using the composable

## Integration with Middleware

The auth middleware (`middleware/auth.ts`) works alongside this system:

```typescript
export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  
  // Skip auth check for login page
  if (to.path === '/login') return
  
  // Server-side check
  if (process.server) return
  
  // Client-side check
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})
```

This provides protection at the route level, while the API error handler provides protection at the request level.

## Next Steps

1. ✅ Global 401 handling implemented
2. ✅ Arabic session expiry notifications  
3. ✅ Multi-tab support active
4. 📝 Test all API endpoints with expired tokens
5. 📝 Add return URL functionality after login
6. 📝 Consider refresh token implementation

For data fetching usage, see [README-DATA-FETCHING.md](./README-DATA-FETCHING.md)
