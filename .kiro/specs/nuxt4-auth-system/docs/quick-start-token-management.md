# Quick Start: Token Management

## 🚀 5-Minute Setup

Get token management working in your Nuxt 4 app in just 5 minutes!

## Step 1: Configure Authentication Mode

Choose your authentication mode based on your security needs:

```bash
# .env file
NUXT_PUBLIC_AUTH_MODE=refresh  # Recommended for most apps
```

**Mode Options:**

- `access` - Highest security (tokens in memory only)
- `refresh` - Balanced security + UX (recommended)
- `cookie` - Enterprise security (server-managed)

## Step 2: Basic Token Usage

### Get Current Tokens

```typescript
// In any component or composable
const { getAccessToken, getRefreshToken, isTokenExpired } = useTokenStorage();

// Check if user has valid token
if (getAccessToken() && !isTokenExpired()) {
  console.log("User is authenticated");
} else {
  console.log("User needs to login");
}
```

### Store Tokens After Login

```typescript
// After successful login API call
const { setAccessToken, setRefreshToken } = useTokenStorage();

// Store tokens (automatically handles mode-specific storage)
setAccessToken(loginResponse.accessToken);
if (loginResponse.refreshToken) {
  setRefreshToken(loginResponse.refreshToken);
}
```

### Clear Tokens on Logout

```typescript
// Clear all tokens
const { clear } = useTokenStorage();

const logout = () => {
  clear(); // Removes all tokens from memory and localStorage
  navigateTo("/auth/login");
};
```

## Step 3: Automatic API Integration

The token storage automatically integrates with your API calls:

```typescript
// API calls automatically include auth headers
const { data } = await $api.get("/api/protected-endpoint");

// Public endpoints don't include auth headers
const { data } = await $api.publicGet("/api/public-data");
```

## Step 4: Handle Token Expiry

### Automatic Refresh (Refresh Mode Only)

```typescript
// Token refresh happens automatically on 401 errors
// No additional code needed - just handle the final failure

const { data, error } = await $api.get("/api/users");
if (error.value?.statusCode === 401) {
  // Token refresh failed, user needs to re-login
  await navigateTo("/auth/login");
}
```

### Manual Token Validation

```typescript
// Check token expiry before important operations
const { isTokenExpired, getAccessToken } = useTokenStorage();

const performSensitiveOperation = async () => {
  if (!getAccessToken() || isTokenExpired()) {
    // Redirect to login
    await navigateTo("/auth/login");
    return;
  }

  // Proceed with operation
  const { data } = await $api.post("/api/sensitive-operation");
};
```

## Step 5: Mode-Specific Examples

### Access Mode (High Security)

```typescript
// .env
NUXT_PUBLIC_AUTH_MODE = access;

// Usage - tokens lost on page refresh
const login = async (credentials) => {
  const { data } = await $api.publicPost("/auth/login", credentials);

  const { setAccessToken } = useTokenStorage();
  setAccessToken(data.accessToken);

  // Note: User will need to re-login after page refresh
  await navigateTo("/dashboard");
};
```

### Refresh Mode (Recommended)

```typescript
// .env
NUXT_PUBLIC_AUTH_MODE = refresh;

// Usage - seamless experience with auto-refresh
const login = async (credentials) => {
  const { data } = await $api.publicPost("/auth/login", credentials);

  const { setAccessToken, setRefreshToken } = useTokenStorage();
  setAccessToken(data.accessToken);
  setRefreshToken(data.refreshToken); // Stored in localStorage

  // Automatic token refresh on expiry
  await navigateTo("/dashboard");
};
```

### Cookie Mode (Enterprise)

```typescript
// .env
NUXT_PUBLIC_AUTH_MODE = cookie;

// Usage - server manages all tokens via httpOnly cookies
const login = async (credentials) => {
  // Server sets httpOnly cookies automatically
  const { data } = await $api.publicPost("/auth/login", credentials);

  // No client-side token management needed
  await navigateTo("/dashboard");
};
```

## 🔧 Common Patterns

### Check Authentication Status

```typescript
// In components
<template>
  <div v-if="hasValidToken">
    <p>Welcome back!</p>
  </div>
  <div v-else>
    <NuxtLink to="/auth/login">Please login</NuxtLink>
  </div>
</template>

<script setup>
const { getAccessToken, isTokenExpired } = useTokenStorage()

const hasValidToken = computed(() => {
  const token = getAccessToken()
  return token && !isTokenExpired()
})
</script>
```

### Token Expiry Countdown

```typescript
// Show time until token expires
const { getTokenExpiryTime } = useTokenStorage();

const timeUntilExpiry = ref("");

const updateCountdown = () => {
  const expiryTime = getTokenExpiryTime();
  if (!expiryTime) return;

  const now = Date.now();
  const timeLeft = expiryTime - now;

  if (timeLeft <= 0) {
    timeUntilExpiry.value = "Expired";
  } else {
    const minutes = Math.floor(timeLeft / 60000);
    timeUntilExpiry.value = `${minutes} minutes`;
  }
};

// Update every minute
setInterval(updateCountdown, 60000);
onMounted(updateCountdown);
```

### Multi-Tab Synchronization

```typescript
// Automatically sync logout across tabs
const { clear } = useTokenStorage();

// Listen for storage changes (logout in other tabs)
if (process.client) {
  window.addEventListener("storage", (e) => {
    if (e.key === "auth.refreshToken" && !e.newValue) {
      // Refresh token was cleared in another tab
      clear();
      navigateTo("/auth/login");
    }
  });
}
```

## 🛡️ Security Best Practices

### 1. Never Log Tokens

```typescript
// ❌ DON'T DO THIS
console.log("Token:", getAccessToken());

// ✅ DO THIS
console.log("Has token:", !!getAccessToken());
```

### 2. Clear Tokens on Errors

```typescript
// Clear tokens on authentication errors
const handleAuthError = (error) => {
  if (error.statusCode === 401) {
    const { clear } = useTokenStorage();
    clear();
    navigateTo("/auth/login");
  }
};
```

### 3. Validate Before Storage

```typescript
// Validate token format before storing
const storeToken = (token) => {
  if (!token || typeof token !== "string" || token.length < 10) {
    throw new Error("Invalid token format");
  }

  const { setAccessToken } = useTokenStorage();
  setAccessToken(token);
};
```

## 🚨 Troubleshooting

### Token Not Found

```typescript
// Debug token storage
const { getAccessToken, getAuthMode } = useTokenStorage();

console.log("Auth mode:", getAuthMode());
console.log("Has access token:", !!getAccessToken());

// Check localStorage (refresh mode only)
if (process.client && getAuthMode() === "refresh") {
  console.log(
    "Refresh token in localStorage:",
    !!localStorage.getItem("auth.refreshToken")
  );
}
```

### Token Expiry Issues

```typescript
// Debug token expiry
const { isTokenExpired, getTokenExpiryTime } = useTokenStorage();

console.log("Token expired:", isTokenExpired());
console.log("Expiry time:", new Date(getTokenExpiryTime() || 0));
console.log("Current time:", new Date());
```

### Mode Configuration Issues

```typescript
// Verify mode configuration
const { getAuthMode } = useTokenStorage();
const config = useRuntimeConfig();

console.log("Configured mode:", config.public.authMode);
console.log("Active mode:", getAuthMode());
```

## 📝 Copy-Paste Examples

### Complete Login Flow

```typescript
// composables/useLogin.ts
export const useLogin = () => {
  const { setAccessToken, setRefreshToken } = useTokenStorage();
  const { $api } = useNuxtApp();

  const login = async (username: string, password: string) => {
    try {
      const { data } = await $api.publicPost("/auth/login", {
        username,
        password,
      });

      // Store tokens
      setAccessToken(data.accessToken);
      if (data.refreshToken) {
        setRefreshToken(data.refreshToken);
      }

      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.data?.message || "Login failed" };
    }
  };

  return { login };
};
```

### Complete Logout Flow

```typescript
// composables/useLogout.ts
export const useLogout = () => {
  const { clear } = useTokenStorage();
  const { $api } = useNuxtApp();

  const logout = async () => {
    try {
      // Call logout endpoint (optional)
      await $api.post("/auth/logout");
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn("Logout API call failed:", error);
    } finally {
      // Always clear local tokens
      clear();
      await navigateTo("/auth/login");
    }
  };

  return { logout };
};
```

### Token Refresh Handler

```typescript
// composables/useTokenRefresh.ts
export const useTokenRefresh = () => {
  const { getRefreshToken, setAccessToken, clear } = useTokenStorage();
  const { $api } = useNuxtApp();

  const refreshTokens = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const { data } = await $api.publicPost("/auth/refresh", {
        refreshToken,
      });

      setAccessToken(data.accessToken);
      return data.accessToken;
    } catch (error) {
      // Refresh failed, clear all tokens
      clear();
      throw error;
    }
  };

  return { refreshTokens };
};
```

---

**Next Steps:**

- [RBAC Quick Start](./quick-start-rbac.md)
- [API Integration Quick Start](./quick-start-api-integration.md)
- [UI Components Quick Start](./quick-start-ui-components.md)
