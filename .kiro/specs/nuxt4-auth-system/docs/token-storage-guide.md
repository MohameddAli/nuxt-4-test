# Token Storage Management Guide

## Overview

The Enhanced Nuxt 4 Authentication System provides a flexible and secure token storage management system that supports three different authentication modes. This guide explains how to use the `useTokenStorage` composable and configure different storage strategies based on your security requirements.

## Table of Contents

- [Authentication Modes](#authentication-modes)
- [Security Principles](#security-principles)
- [Basic Usage](#basic-usage)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Examples by Mode](#examples-by-mode)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Authentication Modes

The system supports three distinct authentication modes, each with different security characteristics and use cases:

### 1. Access Mode (`access`)

- **Storage**: Access tokens in memory only
- **Persistence**: No token persistence (lost on page refresh)
- **Security**: Highest security for access tokens
- **Use Case**: High-security applications, development/testing
- **Trade-off**: Users must re-login after page refresh

### 2. Refresh Mode (`refresh`)

- **Storage**: Access tokens in memory + refresh tokens in localStorage
- **Persistence**: Refresh tokens survive page refresh
- **Security**: Balanced security with user convenience
- **Use Case**: Most production applications
- **Trade-off**: Refresh tokens in localStorage (encrypted recommended)

### 3. Cookie Mode (`cookie`)

- **Storage**: All tokens managed by httpOnly cookies
- **Persistence**: Server-managed token storage
- **Security**: Highest overall security (XSS protection)
- **Use Case**: Enterprise applications with strict security requirements
- **Trade-off**: Requires server-side cookie management

## Security Principles

### Core Security Rules

1. **Access tokens are NEVER persisted to localStorage**

   - Always stored in memory only
   - Automatically cleared on page refresh in access mode
   - Provides protection against XSS attacks

2. **Refresh tokens are stored in localStorage only when needed**

   - Only in refresh mode
   - Should be encrypted in production
   - Automatically cleaned up on logout

3. **Cookie mode relies on httpOnly cookies**

   - No client-side token storage
   - Server manages all token operations
   - Best protection against XSS and CSRF

4. **All operations are SSR-safe**
   - Client-side only operations
   - Graceful fallbacks for server-side rendering
   - No hydration mismatches

## Basic Usage

### Import and Initialize

```typescript
// In your component or composable
import { useTokenStorage } from "~/composables/useTokenStorage";

export default defineComponent({
  setup() {
    const tokenStorage = useTokenStorage();

    // Initialize on component mount
    onMounted(() => {
      tokenStorage.initializeTokenStorage();
    });

    return {
      tokenStorage,
    };
  },
});
```

### Basic Token Operations

```typescript
const tokenStorage = useTokenStorage();

// Set tokens after successful login
const handleLogin = async (loginResponse) => {
  const { accessToken, refreshToken, expiresIn } = loginResponse.data;

  // Set tokens based on current auth mode
  tokenStorage.setTokens({
    accessToken,
    refreshToken,
    expiresIn,
  });
};

// Get current access token
const getAuthHeader = () => {
  const token = tokenStorage.getAccessToken();
  return token ? `Bearer ${token}` : null;
};

// Check token status
const checkTokenStatus = () => {
  const validation = tokenStorage.validateTokenSetup();

  if (!validation.isValid) {
    console.log("Token is invalid or expired");
    // Handle re-authentication
  }

  if (validation.needsRefresh) {
    console.log("Token needs refresh");
    // Trigger token refresh
  }
};

// Clear all tokens on logout
const handleLogout = () => {
  tokenStorage.clearAllTokens();
};
```

## Configuration

### Environment Variables

Configure the authentication mode and related settings using environment variables:

```bash
# .env file

# Authentication mode (access, refresh, cookie)
NUXT_PUBLIC_AUTH_MODE=refresh

# Token refresh threshold (minutes before expiry)
NUXT_PUBLIC_AUTH_REFRESH_THRESHOLD=5

# Maximum retry attempts for failed requests
NUXT_PUBLIC_AUTH_MAX_RETRIES=3

# Session timeout (minutes of inactivity)
NUXT_PUBLIC_AUTH_SESSION_TIMEOUT=60

# Storage keys (optional customization)
NUXT_PUBLIC_AUTH_TOKEN_STORAGE_KEY=auth_token
NUXT_PUBLIC_AUTH_REFRESH_STORAGE_KEY=auth_refresh_token
NUXT_PUBLIC_AUTH_USER_STORAGE_KEY=auth_user

# Feature flags
NUXT_PUBLIC_AUTH_ENABLE_AUTO_REFRESH=true
NUXT_PUBLIC_AUTH_ENABLE_SESSION_TIMEOUT=true
```

### Runtime Configuration

The system automatically reads configuration from `nuxt.config.ts`:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      authMode: process.env.NUXT_PUBLIC_AUTH_MODE || "access",
      authRefreshThreshold: parseInt(
        process.env.NUXT_PUBLIC_AUTH_REFRESH_THRESHOLD || "5"
      ),
      authMaxRetries: parseInt(process.env.NUXT_PUBLIC_AUTH_MAX_RETRIES || "3"),
      authSessionTimeout: parseInt(
        process.env.NUXT_PUBLIC_AUTH_SESSION_TIMEOUT || "60"
      ),
      // ... other config options
    },
  },
});
```

## API Reference

### Core Methods

#### `getAccessToken(): string | null`

Returns the current access token from memory storage.

```typescript
const token = tokenStorage.getAccessToken();
if (token) {
  // Use token for API requests
  headers.Authorization = `Bearer ${token}`;
}
```

#### `setAccessToken(token: string, expiresIn?: number): void`

Stores access token in memory with optional expiration time.

```typescript
// Set token with expiration (in seconds)
tokenStorage.setAccessToken("your-access-token", 3600);

// Set token with default expiration
tokenStorage.setAccessToken("your-access-token");
```

#### `getRefreshToken(): string | null`

Returns refresh token from localStorage (refresh mode only).

```typescript
const refreshToken = tokenStorage.getRefreshToken();
if (refreshToken && tokenStorage.shouldRefreshToken()) {
  // Perform token refresh
  await refreshAccessToken(refreshToken);
}
```

#### `setTokens(tokens: AuthTokens): void`

Sets both access and refresh tokens based on current auth mode.

```typescript
// After successful login
tokenStorage.setTokens({
  accessToken: "your-access-token",
  refreshToken: "your-refresh-token", // Only used in refresh mode
  expiresIn: 3600, // seconds
});
```

### Validation Methods

#### `isTokenExpired(): boolean`

Checks if the current access token is expired.

```typescript
if (tokenStorage.isTokenExpired()) {
  // Token is expired, need to refresh or re-login
  await handleTokenExpiry();
}
```

#### `shouldRefreshToken(): boolean`

Checks if token should be refreshed based on threshold.

```typescript
if (tokenStorage.shouldRefreshToken()) {
  // Token is close to expiry, refresh proactively
  await refreshToken();
}
```

#### `validateTokenSetup(): TokenValidationResult`

Comprehensive validation of current token setup.

```typescript
const validation = tokenStorage.validateTokenSetup();

console.log({
  isValid: validation.isValid,
  hasAccessToken: validation.hasAccessToken,
  hasRefreshToken: validation.hasRefreshToken,
  isExpired: validation.isExpired,
  needsRefresh: validation.needsRefresh,
  mode: validation.mode,
});
```

### Utility Methods

#### `getAuthMode(): AuthMode`

Returns the current authentication mode.

```typescript
const mode = tokenStorage.getAuthMode();
console.log(`Current auth mode: ${mode}`);
```

#### `getStorageInfo(): StorageInfo`

Returns detailed storage information for debugging.

```typescript
const info = tokenStorage.getStorageInfo();
console.log("Storage info:", info);
```

## Examples by Mode

### Access Mode Example

```typescript
// .env
NUXT_PUBLIC_AUTH_MODE = access;

// Usage
const tokenStorage = useTokenStorage();

// Login flow
const login = async (credentials) => {
  const response = await $fetch("/api/auth/login", {
    method: "POST",
    body: credentials,
  });

  // Store access token in memory only
  tokenStorage.setAccessToken(response.data.token, response.data.expiresIn);

  // Note: User will need to re-login after page refresh
};

// API request
const makeApiRequest = async () => {
  const token = tokenStorage.getAccessToken();

  if (!token) {
    // Redirect to login - no token available
    await navigateTo("/login");
    return;
  }

  return await $fetch("/api/protected-endpoint", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
```

### Refresh Mode Example

```typescript
// .env
NUXT_PUBLIC_AUTH_MODE = refresh;
NUXT_PUBLIC_AUTH_REFRESH_THRESHOLD = 5;

// Usage
const tokenStorage = useTokenStorage();

// Login flow
const login = async (credentials) => {
  const response = await $fetch("/api/auth/login", {
    method: "POST",
    body: credentials,
  });

  // Store both tokens
  tokenStorage.setTokens({
    accessToken: response.data.token,
    refreshToken: response.data.refreshToken,
    expiresIn: response.data.expiresIn,
  });
};

// API request with auto-refresh
const makeApiRequest = async () => {
  // Check if token needs refresh
  if (tokenStorage.shouldRefreshToken()) {
    await refreshTokenIfNeeded();
  }

  const token = tokenStorage.getAccessToken();

  if (!token) {
    await navigateTo("/login");
    return;
  }

  return await $fetch("/api/protected-endpoint", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Token refresh logic
const refreshTokenIfNeeded = async () => {
  const refreshToken = tokenStorage.getRefreshToken();

  if (!refreshToken) {
    await navigateTo("/login");
    return;
  }

  try {
    const response = await $fetch("/api/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    });

    // Update tokens
    tokenStorage.setTokens({
      accessToken: response.data.token,
      refreshToken: response.data.refreshToken,
      expiresIn: response.data.expiresIn,
    });
  } catch (error) {
    // Refresh failed, redirect to login
    tokenStorage.clearAllTokens();
    await navigateTo("/login");
  }
};
```

### Cookie Mode Example

```typescript
// .env
NUXT_PUBLIC_AUTH_MODE = cookie;

// Usage
const tokenStorage = useTokenStorage();

// Login flow (cookies managed by server)
const login = async (credentials) => {
  const response = await $fetch("/api/auth/login", {
    method: "POST",
    body: credentials,
    credentials: "include", // Important: include cookies
  });

  // No client-side token storage needed
  // Server sets httpOnly cookies automatically
};

// API request (cookies sent automatically)
const makeApiRequest = async () => {
  return await $fetch("/api/protected-endpoint", {
    credentials: "include", // Important: include cookies
  });
};

// Logout (clear server-side cookies)
const logout = async () => {
  await $fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  // Clear any client-side data
  tokenStorage.clearAllTokens();
};
```

## Best Practices

### Security Best Practices

1. **Choose the Right Mode**

   ```typescript
   // Development/Testing
   NUXT_PUBLIC_AUTH_MODE = access;

   // Production (balanced)
   NUXT_PUBLIC_AUTH_MODE = refresh;

   // High Security Production
   NUXT_PUBLIC_AUTH_MODE = cookie;
   ```

2. **Implement Proper Token Refresh**

   ```typescript
   // Always check token status before API calls
   const makeSecureRequest = async (endpoint: string) => {
     if (tokenStorage.shouldRefreshToken()) {
       await refreshToken();
     }

     const token = tokenStorage.getAccessToken();
     if (!token) {
       throw new Error("No valid token available");
     }

     return await $fetch(endpoint, {
       headers: { Authorization: `Bearer ${token}` },
     });
   };
   ```

3. **Handle Token Expiry Gracefully**
   ```typescript
   // Global error handler for token expiry
   const handleApiError = (error: any) => {
     if (error.status === 401) {
       tokenStorage.clearAllTokens();
       navigateTo("/login");
     }
   };
   ```

### Performance Best Practices

1. **Initialize Once**

   ```typescript
   // In app.vue or main layout
   onMounted(() => {
     const tokenStorage = useTokenStorage();
     tokenStorage.initializeTokenStorage();
   });
   ```

2. **Cache Token Validation**

   ```typescript
   const tokenValidation = ref(null);

   const getTokenValidation = () => {
     if (!tokenValidation.value) {
       tokenValidation.value = tokenStorage.validateTokenSetup();
     }
     return tokenValidation.value;
   };
   ```

3. **Use Reactive Token Status**
   ```typescript
   const isAuthenticated = computed(() => {
     const validation = tokenStorage.validateTokenSetup();
     return validation.isValid && !validation.isExpired;
   });
   ```

### Development Best Practices

1. **Debug Token Storage**

   ```typescript
   // Add to your dev tools
   if (process.dev) {
     const debugTokenStorage = () => {
       const info = tokenStorage.getStorageInfo();
       console.table(info);
     };

     // Make available globally
     window.debugTokenStorage = debugTokenStorage;
   }
   ```

2. **Environment-Specific Configuration**

   ```typescript
   // nuxt.config.ts
   const authMode =
     process.env.NODE_ENV === "development" ? "access" : "refresh";

   export default defineNuxtConfig({
     runtimeConfig: {
       public: {
         authMode,
         // ... other config
       },
     },
   });
   ```

## Troubleshooting

### Common Issues

#### 1. Tokens Not Persisting

**Problem**: Tokens are lost on page refresh
**Solution**: Check your auth mode configuration

```typescript
// Check current mode
const mode = tokenStorage.getAuthMode();
console.log("Current auth mode:", mode);

// If mode is 'access', tokens won't persist
// Change to 'refresh' mode for persistence
```

#### 2. Refresh Token Not Working

**Problem**: Refresh token is null or undefined
**Solution**: Ensure you're in refresh mode and tokens are set correctly

```typescript
// Check refresh token availability
const refreshToken = tokenStorage.getRefreshToken();
const mode = tokenStorage.getAuthMode();

if (!refreshToken && mode === "refresh") {
  console.error("Refresh token missing in refresh mode");
  // Re-authenticate user
}
```

#### 3. SSR Hydration Issues

**Problem**: Different token state on server vs client
**Solution**: Use client-side guards and proper initialization

```typescript
// Always check client-side
if (process.client) {
  const token = tokenStorage.getAccessToken();
  // Use token
}

// Or use onMounted for client-only operations
onMounted(() => {
  tokenStorage.initializeTokenStorage();
});
```

#### 4. Token Expiry Not Working

**Problem**: Expired tokens not being detected
**Solution**: Ensure proper expiration time setting

```typescript
// When setting tokens, always include expiration
tokenStorage.setTokens({
  accessToken: "your-token",
  expiresIn: 3600, // Important: set expiration time
});

// Check expiry status
const isExpired = tokenStorage.isTokenExpired();
const timeLeft = tokenStorage.getTimeUntilExpiry();
console.log(`Token expired: ${isExpired}, Time left: ${timeLeft}s`);
```

### Debug Commands

```typescript
// Get comprehensive storage information
const debugInfo = tokenStorage.getStorageInfo();
console.log("Storage Debug Info:", debugInfo);

// Validate current setup
const validation = tokenStorage.validateTokenSetup();
console.log("Token Validation:", validation);

// Check specific token status
console.log({
  hasAccess: !!tokenStorage.getAccessToken(),
  hasRefresh: !!tokenStorage.getRefreshToken(),
  isExpired: tokenStorage.isTokenExpired(),
  needsRefresh: tokenStorage.shouldRefreshToken(),
  timeLeft: tokenStorage.getTimeUntilExpiry(),
});
```

### Performance Monitoring

```typescript
// Monitor token operations
const originalSetTokens = tokenStorage.setTokens;
tokenStorage.setTokens = (tokens) => {
  console.time("setTokens");
  originalSetTokens(tokens);
  console.timeEnd("setTokens");
};

// Monitor storage size
setInterval(() => {
  const info = tokenStorage.getStorageInfo();
  if (info.memoryTokens > 10) {
    console.warn("High memory token usage:", info.memoryTokens);
  }
}, 30000); // Check every 30 seconds
```

## Migration Guide

### From Basic Token Storage

If you're migrating from a basic token storage system:

```typescript
// Old way
localStorage.setItem("token", accessToken);
const token = localStorage.getItem("token");

// New way
const tokenStorage = useTokenStorage();
tokenStorage.setAccessToken(accessToken, expiresIn);
const token = tokenStorage.getAccessToken();
```

### From Other Auth Libraries

```typescript
// Adapt existing auth flow
const migrateFromOldAuth = (oldAuthData) => {
  const tokenStorage = useTokenStorage();

  tokenStorage.setTokens({
    accessToken: oldAuthData.accessToken,
    refreshToken: oldAuthData.refreshToken,
    expiresIn: oldAuthData.expiresIn,
  });
};
```

## Conclusion

The Enhanced Token Storage Management System provides a secure, flexible, and developer-friendly way to handle authentication tokens in your Nuxt 4 application. By choosing the appropriate authentication mode and following the best practices outlined in this guide, you can build a robust authentication system that meets your security requirements while providing a great user experience.

For additional support or questions, refer to the main authentication system documentation or check the troubleshooting section above.
