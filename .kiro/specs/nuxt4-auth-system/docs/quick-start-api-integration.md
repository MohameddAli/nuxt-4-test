# Quick Start: API Integration

## 🚀 5-Minute API Setup

Get your API calls working with authentication, error handling, and network monitoring in just 5 minutes!

## Step 1: Basic API Usage

### Authenticated API Calls

```typescript
// Automatic authentication headers included
const { data, error, pending } = await $api.get("/api/users");
const { data } = await $api.post("/api/users", {
  name: "John",
  email: "john@example.com",
});
const { data } = await $api.put("/api/users/1", { name: "Jane" });
const { data } = await $api.patch("/api/users/1", {
  email: "jane@example.com",
});
const { data } = await $api.delete("/api/users/1");
```

### Public API Calls (No Authentication)

```typescript
// No authentication headers - for public endpoints
const { data } = await $api.publicGet("/api/public/stats");
const { data } = await $api.publicPost("/api/contact", { message: "Hello" });

// Login/register calls
const { data } = await $api.publicPost("/auth/login", { username, password });
const { data } = await $api.publicPost("/auth/register", {
  name,
  email,
  password,
});
```

## Step 2: Error Handling

### Automatic Error Handling

```typescript
// Errors are automatically handled and displayed to users
try {
  const { data } = await $api.get("/api/users");
  // Success - data is available
} catch (error) {
  // Error is already shown to user via snackbar
  // Handle specific error cases if needed
  if (error.statusCode === 403) {
    // Handle permission denied
    navigateTo("/unauthorized");
  }
}
```

### Custom Error Handling

```typescript
// Disable automatic error display for custom handling
const { data, error } = await $api.get("/api/users", {
  showErrorSnackbar: false,
});

if (error.value) {
  // Handle error manually
  const errorMessage = error.value.data?.message || "Something went wrong";
  console.error("API Error:", errorMessage);

  // Show custom error UI
  showCustomErrorDialog(errorMessage);
}
```

## Step 3: Network Status Monitoring

### Automatic Network Notifications

```typescript
// Network status is automatically monitored
// Users see Arabic/English notifications for:
// - "انقطع الاتصال بالإنترنت" / "Connection lost"
// - "تم استعادة الاتصال" / "Connection restored"

// Access network status in components
const { isOnline, connectionType } = useNetworkStatus()

// Show offline indicator
<template>
  <v-alert v-if="!isOnline" type="warning" class="mb-4">
    {{ $t('network.offline') }}
  </v-alert>
</template>
```

### Manual Network Checks

```typescript
// Check network status before important operations
const performCriticalOperation = async () => {
  const { isOnline } = useNetworkStatus();

  if (!isOnline) {
    showError($t("network.offline"));
    return;
  }

  // Proceed with operation
  const { data } = await $api.post("/api/critical-operation");
};
```

## Step 4: Token Refresh Integration

### Automatic Token Refresh (Refresh Mode)

```typescript
// Token refresh happens automatically on 401 errors
// No additional code needed - just handle final failure

const fetchUserData = async () => {
  try {
    // This call will automatically refresh tokens if needed
    const { data } = await $api.get("/api/user/profile");
    return data;
  } catch (error) {
    if (error.statusCode === 401) {
      // Token refresh failed - user needs to re-login
      navigateTo("/auth/login");
    }
  }
};
```

### Manual Token Refresh

```typescript
// Force token refresh before important operations
const { refreshTokens } = useTokenStorage();

const performSecureOperation = async () => {
  try {
    // Refresh tokens first
    await refreshTokens();

    // Then perform operation
    const { data } = await $api.post("/api/secure-operation");
    return data;
  } catch (error) {
    if (error.message.includes("refresh")) {
      // Refresh failed - redirect to login
      navigateTo("/auth/login");
    }
  }
};
```

## Step 5: Advanced API Patterns

### Loading States

```vue
<template>
  <div>
    <v-progress-linear v-if="pending" indeterminate />

    <div v-if="data">
      <!-- Display data -->
      <UserCard v-for="user in data.users" :key="user.id" :user="user" />
    </div>

    <v-alert v-if="error" type="error">
      {{ error.data?.message || $t("errors.unknown") }}
    </v-alert>
  </div>
</template>

<script setup>
// Reactive API call with loading states
const { data, error, pending, refresh } = await $api.get("/api/users");

// Refresh data
const refreshUsers = () => refresh();
</script>
```

### Pagination

```typescript
// Handle paginated API responses
const usePaginatedUsers = () => {
  const page = ref(1);
  const limit = ref(10);
  const users = ref([]);
  const total = ref(0);
  const loading = ref(false);

  const fetchUsers = async () => {
    loading.value = true;
    try {
      const { data } = await $api.get("/api/users", {
        query: {
          page: page.value,
          limit: limit.value,
        },
      });

      users.value = data.users;
      total.value = data.total;
    } catch (error) {
      // Error automatically handled
    } finally {
      loading.value = false;
    }
  };

  const nextPage = () => {
    if (page.value * limit.value < total.value) {
      page.value++;
      fetchUsers();
    }
  };

  const prevPage = () => {
    if (page.value > 1) {
      page.value--;
      fetchUsers();
    }
  };

  return {
    users,
    total,
    loading,
    page,
    limit,
    fetchUsers,
    nextPage,
    prevPage,
  };
};
```

### File Upload

```typescript
// Upload files with progress tracking
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const { data } = await $api.post("/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Upload progress: ${progress}%`);
      },
    });

    return data;
  } catch (error) {
    // Error automatically handled
    throw error;
  }
};
```

## 🔧 Common Patterns

### API Composables

```typescript
// composables/useUsersApi.ts
export const useUsersApi = () => {
  const { $api } = useNuxtApp();

  const getUsers = async (params = {}) => {
    return await $api.get("/api/users", { query: params });
  };

  const getUser = async (id: string) => {
    return await $api.get(`/api/users/${id}`);
  };

  const createUser = async (userData: CreateUserData) => {
    return await $api.post("/api/users", userData);
  };

  const updateUser = async (id: string, userData: UpdateUserData) => {
    return await $api.put(`/api/users/${id}`, userData);
  };

  const deleteUser = async (id: string) => {
    return await $api.delete(`/api/users/${id}`);
  };

  return {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
  };
};
```

### Cached API Calls

```typescript
// Cache API responses to avoid repeated calls
const useCachedApi = () => {
  const cache = new Map();

  const getCached = async (url: string, options = {}) => {
    const cacheKey = `${url}${JSON.stringify(options)}`;

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const { data } = await $api.get(url, options);
    cache.set(cacheKey, data);

    // Clear cache after 5 minutes
    setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000);

    return data;
  };

  const clearCache = () => cache.clear();

  return { getCached, clearCache };
};
```

### Retry Logic

```typescript
// Retry failed requests with exponential backoff
const useRetryableApi = () => {
  const retryRequest = async (
    requestFn: () => Promise<any>,
    maxRetries = 3,
    baseDelay = 1000
  ) => {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;

        // Don't retry on authentication/authorization errors
        if (error.statusCode === 401 || error.statusCode === 403) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  };

  return { retryRequest };
};
```

### Batch Requests

```typescript
// Batch multiple API requests
const useBatchApi = () => {
  const batchRequests = async (requests: Array<() => Promise<any>>) => {
    try {
      const results = await Promise.allSettled(
        requests.map((request) => request())
      );

      const successful = [];
      const failed = [];

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          successful.push({ index, data: result.value });
        } else {
          failed.push({ index, error: result.reason });
        }
      });

      return { successful, failed };
    } catch (error) {
      throw error;
    }
  };

  return { batchRequests };
};
```

## 🛡️ Security Best Practices

### 1. Input Validation

```typescript
// Validate data before sending to API
const createUser = async (userData: any) => {
  // Client-side validation (UX only)
  if (!userData.email || !userData.name) {
    throw new Error("Email and name are required");
  }

  // Server will validate again (security)
  return await $api.post("/api/users", userData);
};
```

### 2. Sensitive Data Handling

```typescript
// Don't log sensitive data
const login = async (credentials: LoginCredentials) => {
  // ❌ DON'T DO THIS
  console.log("Login attempt:", credentials);

  // ✅ DO THIS
  console.log("Login attempt for user:", credentials.username);

  return await $api.publicPost("/auth/login", credentials);
};
```

### 3. Rate Limiting Awareness

```typescript
// Handle rate limiting gracefully
const handleRateLimit = (error: any) => {
  if (error.statusCode === 429) {
    const retryAfter = error.headers?.["retry-after"] || 60;
    showError(`Too many requests. Please wait ${retryAfter} seconds.`);

    // Disable UI temporarily
    setTimeout(() => {
      // Re-enable UI
    }, retryAfter * 1000);
  }
};
```

## 🚨 Troubleshooting

### API Not Working

```typescript
// Debug API configuration
const debugApi = () => {
  const config = useRuntimeConfig();
  const { getAccessToken } = useTokenStorage();

  console.log("API Base URL:", config.public.apiBase);
  console.log("Has Access Token:", !!getAccessToken());
  console.log("Network Status:", useNetworkStatus().isOnline);
};
```

### Authentication Headers Missing

```typescript
// Check if auth headers are being sent
const debugAuthHeaders = async () => {
  const headers = getAuthHeaders();
  console.log("Auth headers:", headers);

  // Test authenticated endpoint
  try {
    await $api.get("/api/test-auth");
    console.log("Authentication working");
  } catch (error) {
    console.error("Authentication failed:", error);
  }
};
```

### Network Issues

```typescript
// Test network connectivity
const testConnectivity = async () => {
  try {
    // Test public endpoint
    await $api.publicGet("/api/health");
    console.log("Network connectivity: OK");
  } catch (error) {
    console.error("Network connectivity: FAILED", error);
  }
};
```

## 📝 Copy-Paste Examples

### Complete CRUD Operations

```typescript
// composables/useResourceCRUD.ts
export const useResourceCRUD = (resourceName: string) => {
  const { $api } = useNuxtApp();
  const baseUrl = `/api/${resourceName}`;

  // List resources with pagination
  const list = async (params = {}) => {
    return await $api.get(baseUrl, { query: params });
  };

  // Get single resource
  const get = async (id: string) => {
    return await $api.get(`${baseUrl}/${id}`);
  };

  // Create new resource
  const create = async (data: any) => {
    return await $api.post(baseUrl, data);
  };

  // Update existing resource
  const update = async (id: string, data: any) => {
    return await $api.put(`${baseUrl}/${id}`, data);
  };

  // Partially update resource
  const patch = async (id: string, data: any) => {
    return await $api.patch(`${baseUrl}/${id}`, data);
  };

  // Delete resource
  const remove = async (id: string) => {
    return await $api.delete(`${baseUrl}/${id}`);
  };

  // Bulk operations
  const bulkCreate = async (items: any[]) => {
    return await $api.post(`${baseUrl}/bulk`, { items });
  };

  const bulkUpdate = async (updates: Array<{ id: string; data: any }>) => {
    return await $api.put(`${baseUrl}/bulk`, { updates });
  };

  const bulkDelete = async (ids: string[]) => {
    return await $api.delete(`${baseUrl}/bulk`, { data: { ids } });
  };

  return {
    list,
    get,
    create,
    update,
    patch,
    remove,
    bulkCreate,
    bulkUpdate,
    bulkDelete,
  };
};

// Usage
const usersCRUD = useResourceCRUD("users");
const { data: users } = await usersCRUD.list({ page: 1, limit: 10 });
```

### API Error Handler

```typescript
// composables/useApiErrorHandler.ts
export const useApiErrorHandler = () => {
  const { $i18n } = useNuxtApp();
  const { showError } = useSnackbar();

  const handleError = (error: any, context?: string) => {
    let message = "";

    // Prioritize backend error messages
    if (error.data?.message) {
      message = error.data.message;
    } else {
      // Fallback to status-based messages
      switch (error.statusCode) {
        case 400:
          message = $i18n.t("errors.badRequest");
          break;
        case 401:
          message = $i18n.t("errors.unauthorized");
          break;
        case 403:
          message = $i18n.t("errors.forbidden");
          break;
        case 404:
          message = $i18n.t("errors.notFound");
          break;
        case 422:
          message = $i18n.t("errors.validation");
          break;
        case 500:
          message = $i18n.t("errors.serverError");
          break;
        default:
          message = $i18n.t("errors.unknown");
      }
    }

    // Add context if provided
    if (context) {
      message = `${context}: ${message}`;
    }

    // Show error to user
    showError(message);

    // Log for debugging
    console.error("API Error:", {
      statusCode: error.statusCode,
      message: error.data?.message,
      context,
      url: error.url,
    });
  };

  return { handleError };
};
```

### Real-time API Updates

```typescript
// composables/useRealtimeApi.ts
export const useRealtimeApi = (endpoint: string) => {
  const data = ref(null);
  const error = ref(null);
  const loading = ref(false);

  // Initial fetch
  const fetch = async () => {
    loading.value = true;
    try {
      const response = await $api.get(endpoint);
      data.value = response.data;
      error.value = null;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  // Polling for updates
  const startPolling = (interval = 30000) => {
    const pollInterval = setInterval(fetch, interval);

    onUnmounted(() => {
      clearInterval(pollInterval);
    });

    return () => clearInterval(pollInterval);
  };

  // Manual refresh
  const refresh = () => fetch();

  // Initial load
  onMounted(fetch);

  return {
    data: readonly(data),
    error: readonly(error),
    loading: readonly(loading),
    refresh,
    startPolling,
  };
};
```

---

**Next Steps:**

- [UI Components Quick Start](./quick-start-ui-components.md)
- [Error Handling Quick Start](./quick-start-error-handling.md)
- [Testing Quick Start](./quick-start-testing.md)
