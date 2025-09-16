# API Usage Guide - Enhanced Nuxt 4 Authentication System

## Overview

This comprehensive guide covers the enhanced API layer of the Nuxt 4 authentication system, including multi-mode token management, public endpoint handling, automatic retry logic, and network monitoring integration.

## Table of Contents

1. [Core API Composables](#core-api-composables)
2. [Public vs Authenticated Endpoints](#public-vs-authenticated-endpoints)
3. [Error Handling Patterns](#error-handling-patterns)
4. [Network Monitoring Integration](#network-monitoring-integration)
5. [Authentication Modes](#authentication-modes)
6. [Advanced Usage Examples](#advanced-usage-examples)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Core API Composables

### useApi() - Main API Composable

The enhanced `useApi` composable provides a unified interface for all HTTP operations with automatic authentication, error handling, and retry logic.

```typescript
// Basic usage
const api = useApi();

// GET request (authenticated)
const { data, error, pending } = await api.get("/users");

// POST request (authenticated)
const result = await api.post("/users", {
  name: "John",
  email: "john@example.com",
});

// PUT request with retry options
const updated = await api.put("/users/1", userData, { retries: 3 });

// DELETE request
await api.delete("/users/1");
```

#### Available Methods

| Method                                | Description                   | Authentication | Retry Support |
| ------------------------------------- | ----------------------------- | -------------- | ------------- |
| `get(endpoint, options)`              | GET requests with SSR support | Auto-detected  | ✅            |
| `post(endpoint, body, options)`       | POST requests                 | Auto-detected  | ✅            |
| `put(endpoint, body, options)`        | PUT requests                  | Auto-detected  | ✅            |
| `patch(endpoint, body, options)`      | PATCH requests                | Auto-detected  | ✅            |
| `delete(endpoint, options)`           | DELETE requests               | Auto-detected  | ✅            |
| `publicGet(endpoint, options)`        | Public GET requests           | ❌             | ✅            |
| `publicPost(endpoint, body, options)` | Public POST requests          | ❌             | ✅            |
| `publicPut(endpoint, body, options)`  | Public PUT requests           | ❌             | ✅            |

---

## Public vs Authenticated Endpoints

### Automatic Detection

The system automatically detects public endpoints based on predefined patterns:

```typescript
// These endpoints are automatically treated as public
const publicEndpoints = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/public/",
  "/health",
  "/version",
];
```

### Manual Public Requests

For explicit public requests, use the dedicated public methods:

```typescript
const api = useApi();

// Explicit public requests (no auth headers)
const healthCheck = await api.publicGet("/health");
const loginResult = await api.publicPost("/auth/login", credentials);
```

### Mixed Usage Example

```typescript
<script setup lang="ts">
const api = useApi()

// Public endpoint - no authentication required
const { data: publicData } = await api.publicGet('/public/announcements')

// Authenticated endpoint - requires valid token
const { data: userData } = await api.get('/user/profile')

// Auto-detected public endpoint
const loginResponse = await api.post('/auth/login', { username, password })
</script>
```

---

## Error Handling Patterns

### Comprehensive Error Categorization

The enhanced API system categorizes errors for appropriate handling:

```typescript
interface ErrorCategory {
  type: "network" | "server" | "validation" | "auth" | "permission" | "unknown";
  message: string;
  shouldShowToUser: boolean;
  shouldLog: boolean;
  canRetry: boolean;
}
```

### Error Types and Responses

| Error Type         | Status Code | User Message (Arabic)  | Auto Retry | Redirect        |
| ------------------ | ----------- | ---------------------- | ---------- | --------------- |
| **Network**        | N/A         | "تعذر الاتصال بالخادم" | ✅         | ❌              |
| **Authentication** | 401         | "انتهت صلاحية الجلسة"  | ❌         | ✅ Login        |
| **Permission**     | 403         | "ليس لديك صلاحية"      | ❌         | ✅ Unauthorized |
| **Validation**     | 400, 422    | Backend message        | ❌         | ❌              |
| **Server**         | 500+        | "خطأ في الخادم"        | ✅         | ❌              |

### Custom Error Handling

```typescript
<script setup lang="ts">
const api = useApi()

try {
  const result = await api.post('/users', userData)
  // Success handling
} catch (error) {
  // Error is already handled globally
  // Additional custom handling if needed
  if (error.status === 422) {
    // Handle validation errors specifically
    console.log('Validation failed:', error.data.errors)
  }
}
</script>
```

---

## Network Monitoring Integration

### Automatic Network Awareness

The API system integrates with network monitoring for intelligent retry behavior:

```typescript
const { isOnline, connectionQuality, addToRetryQueue } = useNetworkStatus();
const api = useApi();

// Requests automatically retry when connection is restored
const result = await api.post("/data", payload); // Auto-retries on network recovery
```

### Manual Retry Queue Management

```typescript
<script setup lang="ts">
const { addToRetryQueue, processRetryQueue } = useNetworkStatus()

// Add custom retry function
const retryUpload = () => api.post('/upload', fileData)
addToRetryQueue(retryUpload)

// Manually process queue
await processRetryQueue()
</script>
```

### Network Status Monitoring

```typescript
<script setup lang="ts">
const {
  isOnline,
  connectionQuality,
  isSlowConnection,
  testConnectionSpeed
} = useNetworkStatus()

// Reactive network status
watch(isOnline, (online) => {
  if (online) {
    console.log('Connection restored:', connectionQuality.value)
  } else {
    console.log('Connection lost')
  }
})

// Test connection speed
const { speed, quality } = await testConnectionSpeed()
</script>
```

---

## Authentication Modes

### Access Token Mode

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      authMode: "access", // Access tokens in memory only
    },
  },
});
```

**Behavior:**

- Access tokens stored in memory only
- No persistence across page refreshes
- User must re-login after browser refresh
- Most secure for sensitive applications

### Refresh Token Mode

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      authMode: "refresh", // Access + refresh tokens
    },
  },
});
```

**Behavior:**

- Access tokens in memory
- Refresh tokens in localStorage
- Automatic token refresh on expiry
- Seamless user experience

### Cookie Mode

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      authMode: "cookie", // httpOnly cookies
    },
  },
});
```

**Behavior:**

- All tokens managed by httpOnly cookies
- No client-side token storage
- Most secure for production
- Requires server-side cookie handling

---

## Advanced Usage Examples

### Enhanced Mutation Composable

```typescript
<script setup lang="ts">
const { mutate, mutateWithSuccess, loading, error } = useMutation()

// Basic mutation
const result = await mutate('post', '/users', userData)

// Mutation with success message
await mutateWithSuccess('put', '/users/1', userData, 'تم تحديث المستخدم بنجاح')

// Public mutation
await mutate('post', '/contact', contactData, {
  public: true,
  showSuccess: true,
  successMessage: 'تم إرسال الرسالة بنجاح'
})
</script>

<template>
  <div>
    <v-btn :loading="loading" @click="updateUser">
      تحديث البيانات
    </v-btn>
    <div v-if="error" class="error">
      {{ error.message }}
    </div>
  </div>
</template>
```

### Authentication API Composable

```typescript
<script setup lang="ts">
const { login, logout, register } = useAuthApi()

// Login with automatic token management
const handleLogin = async (credentials) => {
  try {
    const response = await login(credentials)
    // Tokens are automatically stored
    navigateTo('/dashboard')
  } catch (error) {
    // Error is handled automatically with Arabic messages
  }
}

// Logout with cleanup
const handleLogout = async () => {
  await logout() // Clears all tokens and shows success message
  navigateTo('/login')
}

// Registration
const handleRegister = async (userData) => {
  const response = await register(userData)
  // Handle registration response
}
</script>
```

### Public API Usage

```typescript
<script setup lang="ts">
const publicApi = usePublicApi()

// Public content (no authentication)
const { data: announcements } = await publicApi.get('/public/announcements')

// Contact form submission
const submitContact = async (formData) => {
  await publicApi.post('/contact', formData)
}

// Newsletter subscription
const subscribe = async (email) => {
  await publicApi.post('/newsletter/subscribe', { email })
}
</script>
```

### Enhanced Fetch Data

```typescript
<script setup lang="ts">
// Authenticated data fetching
const { data: users, pending, error } = await useFetchData('/users')

// Public data fetching
const { data: posts } = await useFetchData('/public/posts', {
  public: true,
  lazy: true
})

// SSR-disabled for client-only data
const { data: clientData } = await useFetchData('/user/preferences', {
  server: false
})
</script>
```

---

## Best Practices

### 1. Endpoint Organization

```typescript
// ✅ Good: Clear endpoint structure
const api = useApi();

// User management
await api.get("/users");
await api.post("/users", userData);
await api.put("/users/1", userData);
await api.delete("/users/1");

// Public endpoints
await api.publicGet("/public/posts");
await api.publicPost("/contact", contactData);
```

### 2. Error Handling

```typescript
// ✅ Good: Let global handler manage most errors
try {
  const result = await api.post("/users", userData);
  // Handle success
} catch (error) {
  // Only handle specific business logic errors
  if (error.status === 409) {
    // Handle duplicate user specifically
  }
  // Other errors are handled globally
}
```

### 3. Loading States

```typescript
<script setup lang="ts">
const { mutate, loading } = useMutation()

const saveData = async () => {
  await mutate('post', '/data', formData)
}
</script>

<template>
  <v-btn :loading="loading" @click="saveData">
    حفظ البيانات
  </v-btn>
</template>
```

### 4. Network Awareness

```typescript
<script setup lang="ts">
const { isOnline, isSlowConnection } = useNetworkStatus()

// Adjust behavior based on connection
const uploadFile = async (file) => {
  const options = {
    retries: isSlowConnection.value ? 5 : 2
  }

  if (!isOnline.value) {
    // Queue for later
    addToRetryQueue(() => api.post('/upload', file))
    return
  }

  await api.post('/upload', file, options)
}
</script>
```

### 5. Authentication Mode Handling

```typescript
<script setup lang="ts">
const { getAuthMode, shouldRefreshToken } = useTokenStorage()

// Adapt UI based on auth mode
const authMode = getAuthMode()

// Show different messages based on mode
const getSessionMessage = () => {
  switch (authMode) {
    case 'access':
      return 'ستحتاج لتسجيل الدخول مرة أخرى عند إعادة تحميل الصفحة'
    case 'refresh':
      return 'ستبقى مسجلاً للدخول حتى انتهاء صلاحية الجلسة'
    case 'cookie':
      return 'جلستك محفوظة بشكل آمن'
  }
}
</script>
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. 401 Errors on Public Endpoints

**Problem:** Getting authentication errors on login/register endpoints.

**Solution:** Ensure endpoints are in the public endpoints list or use explicit public methods:

```typescript
// ❌ Wrong: May include auth headers
await api.post("/auth/login", credentials);

// ✅ Correct: Explicit public request
await api.publicPost("/auth/login", credentials);
```

#### 2. Token Refresh Not Working

**Problem:** Automatic token refresh fails in refresh mode.

**Solution:** Check refresh endpoint and token storage:

```typescript
// Verify refresh token exists
const { getRefreshToken, getAuthMode } = useTokenStorage();
console.log("Auth mode:", getAuthMode());
console.log("Refresh token:", getRefreshToken());
```

#### 3. Network Retry Not Triggering

**Problem:** Requests don't retry after network restoration.

**Solution:** Ensure network monitoring is active:

```typescript
const { isMonitoring, startMonitoring } = useNetworkStatus();
if (!isMonitoring.value) {
  startMonitoring();
}
```

#### 4. Arabic Messages Not Showing

**Problem:** Error messages appear in English instead of Arabic.

**Solution:** Check i18n configuration and ensure Arabic locale is loaded:

```typescript
// Check current locale
const { locale } = useI18n();
console.log("Current locale:", locale.value);
```

#### 5. SSR Hydration Issues

**Problem:** Authentication state mismatch between server and client.

**Solution:** Use proper SSR-safe patterns:

```typescript
// ✅ Good: SSR-safe
const { data } = await useFetchData("/user/profile", {
  server: false, // Client-only for auth-dependent data
});

// ❌ Wrong: May cause hydration mismatch
const token = localStorage.getItem("token"); // Not available on server
```

### Debug Mode

Enable debug logging for troubleshooting:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      authDebug: true, // Enable debug logging
    },
  },
});
```

### Performance Monitoring

Monitor API performance and network status:

```typescript
<script setup lang="ts">
const { connectionHistory, testConnectionSpeed } = useNetworkStatus()

// Monitor connection quality
const monitorPerformance = async () => {
  const { speed, quality } = await testConnectionSpeed()
  console.log(`Connection: ${quality} (${speed.toFixed(2)}ms)`)
}

// View connection history
console.log('Connection events:', connectionHistory.value)
</script>
```

---

## Migration from Previous Version

### Breaking Changes

1. **Token Storage:** Access tokens are no longer persisted to localStorage by default
2. **Error Handling:** Global error handler now manages most error scenarios
3. **Public Endpoints:** Explicit public methods added for clarity

### Migration Steps

1. **Update API calls:**

```typescript
// Old
const { $fetch } = useNuxtApp();
const data = await $fetch("/api/users");

// New
const api = useApi();
const data = await api.get("/users");
```

2. **Update error handling:**

```typescript
// Old - Manual error handling
try {
  const data = await $fetch("/api/users");
} catch (error) {
  // Manual error handling
  showError(error.message);
}

// New - Automatic error handling
const data = await api.get("/users");
// Errors handled automatically with Arabic messages
```

3. **Update public endpoints:**

```typescript
// Old
const loginData = await $fetch("/auth/login", {
  method: "POST",
  body: credentials,
});

// New
const api = useApi();
const loginData = await api.publicPost("/auth/login", credentials);
```

---

## Conclusion

The enhanced API system provides a robust, secure, and user-friendly foundation for Nuxt 4 applications with comprehensive authentication, error handling, and network monitoring capabilities. The Arabic-first approach ensures excellent user experience for Arabic-speaking users while maintaining full English support.

For additional help or questions, refer to the main authentication system documentation or the specific composable documentation files.
