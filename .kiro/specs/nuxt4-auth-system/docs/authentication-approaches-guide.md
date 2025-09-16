# Authentication Approaches Guide

## Overview

The enhanced Nuxt 4 authentication system provides two distinct approaches for managing authentication state and logic. Both approaches offer identical functionality but differ in their state management strategy and architectural patterns.

## 🏪 Pinia Store Approach vs 🎯 Composable-Only Approach

### Quick Comparison

| Feature              | Pinia Store             | Composable-Only                   |
| -------------------- | ----------------------- | --------------------------------- |
| **State Management** | Pinia store             | Nuxt useState                     |
| **Dependencies**     | Requires Pinia          | Zero dependencies                 |
| **SSR Support**      | Full support            | Full support                      |
| **DevTools**         | Pinia DevTools          | Vue DevTools                      |
| **Bundle Size**      | Larger (includes Pinia) | Smaller                           |
| **Learning Curve**   | Familiar to Pinia users | Familiar to Composition API users |
| **Migration Effort** | Minimal (existing code) | Moderate                          |

## 🏪 Pinia Store Approach

### When to Use

- **Existing Pinia Projects**: Your project already uses Pinia for state management
- **Complex State Management**: You need centralized state management across multiple stores
- **Team Familiarity**: Your team is already familiar with Pinia patterns
- **DevTools Integration**: You want rich debugging capabilities with Pinia DevTools
- **Large Applications**: You're building a large application with complex state interactions

### Advantages

✅ **Centralized State Management**: All authentication state in one place
✅ **Rich DevTools**: Excellent debugging and time-travel capabilities
✅ **Familiar Patterns**: Standard Pinia store patterns
✅ **Easy Testing**: Well-established testing patterns for Pinia stores
✅ **Plugin Ecosystem**: Access to Pinia plugins and extensions

### Disadvantages

❌ **Additional Dependency**: Requires Pinia installation and setup
❌ **Larger Bundle**: Includes Pinia in your bundle
❌ **Learning Curve**: Need to understand Pinia concepts

### Implementation

```typescript
// stores/auth.ts - Enhanced Pinia Store
import { useAuthStore } from "~/stores/auth";

export default defineNuxtPlugin(() => {
  // Auto-initialize auth store
  const authStore = useAuthStore();
  authStore.initAuth();
});
```

```vue
<!-- Usage in Components -->
<template>
  <div>
    <div v-if="authStore.isAuthenticated">
      Welcome, {{ authStore.currentUser?.name }}!
    </div>
    <button v-if="authStore.hasPermission('users.create')" @click="createUser">
      Create User
    </button>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore();

const createUser = () => {
  // Create user logic
};
</script>
```

### Migration from Existing Code

**Zero Migration Required!** The enhanced Pinia store maintains 100% backward compatibility:

```typescript
// Existing code continues to work unchanged
const authStore = useAuthStore();
const isAuthenticated = authStore.isAuthenticated;
const user = authStore.currentUser;
await authStore.login(username, password);
```

## 🎯 Composable-Only Approach

### When to Use

- **Lightweight Projects**: You want minimal dependencies and smaller bundle size
- **Composition API Focus**: Your team prefers pure Composition API patterns
- **Micro-frontends**: You're building micro-frontends or component libraries
- **Performance Critical**: You need the smallest possible bundle size
- **Simple State Needs**: Authentication is your only complex state management need

### Advantages

✅ **Zero Dependencies**: No additional libraries required
✅ **Smaller Bundle**: Minimal impact on bundle size
✅ **Pure Composition API**: Clean, modern Vue 3 patterns
✅ **SSR Optimized**: Built specifically for Nuxt's SSR capabilities
✅ **Easy to Understand**: Straightforward reactive state management

### Disadvantages

❌ **No DevTools**: Limited debugging capabilities compared to Pinia
❌ **Manual State Management**: Need to manage state synchronization manually
❌ **Less Ecosystem**: Fewer plugins and extensions available

### Implementation

```typescript
// composables/useAuthComposable.ts - Standalone Composable
const auth = useAuthComposable();
```

```vue
<!-- Usage in Components -->
<template>
  <div>
    <div v-if="auth.isAuthenticated.value">
      Welcome, {{ auth.currentUser.value?.name }}!
    </div>
    <button v-if="auth.hasPermission('users.create')" @click="createUser">
      Create User
    </button>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthComposable();

const createUser = () => {
  // Create user logic
};
</script>
```

### Migration to Composable-Only

**Step-by-Step Migration Guide:**

1. **Replace Store Imports**:

```typescript
// Before (Pinia)
import { useAuthStore } from "~/stores/auth";
const authStore = useAuthStore();

// After (Composable)
import { useAuthComposable } from "~/composables/useAuthComposable";
const auth = useAuthComposable();
```

2. **Update Reactive References**:

```typescript
// Before (Pinia)
const isAuthenticated = authStore.isAuthenticated;
const user = authStore.currentUser;

// After (Composable)
const isAuthenticated = auth.isAuthenticated.value;
const user = auth.currentUser.value;
```

3. **Update Method Calls**:

```typescript
// Before (Pinia)
await authStore.login(username, password);
authStore.logout();

// After (Composable)
await auth.login(username, password);
auth.logout();
```

## 🔄 API Compatibility

Both approaches provide **identical APIs** for core functionality:

### Authentication Methods

```typescript
// Both approaches support the same methods
await login(username: string, password: string)
await logout()
await refreshUser()
await validateToken()
await updateProfile(data: Partial<User>)
```

### Permission Checking

```typescript
// Both approaches support identical permission checking
hasPermission(permission: string): boolean
hasRole(role: string): boolean
hasAllPermissions(permissions: string[]): boolean
hasAnyPermission(permissions: string[]): boolean
canAccess(config: AccessConfig): boolean
```

### State Properties

```typescript
// Both approaches provide the same reactive state
isAuthenticated: boolean;
currentUser: User | null;
loading: boolean;
error: string | null;
sessionInfo: SessionInfo;
```

## 🚀 Performance Comparison

### Bundle Size Impact

| Approach            | Additional Bundle Size | Runtime Memory          |
| ------------------- | ---------------------- | ----------------------- |
| **Pinia Store**     | ~15KB (Pinia + store)  | Higher (store overhead) |
| **Composable-Only** | ~5KB (composable only) | Lower (direct state)    |

### Runtime Performance

Both approaches offer similar runtime performance:

- **State Updates**: Comparable reactive update performance
- **Memory Usage**: Composable approach uses slightly less memory
- **SSR Performance**: Both optimized for Nuxt SSR

## 🛠 Development Experience

### Debugging

**Pinia Store Approach:**

- Rich Pinia DevTools integration
- Time-travel debugging
- State inspection and modification
- Action tracking and replay

**Composable-Only Approach:**

- Standard Vue DevTools integration
- Reactive state inspection
- Manual debugging with console logs
- Simpler debugging flow

### Testing

**Pinia Store Approach:**

```typescript
// Testing with Pinia
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "~/stores/auth";

beforeEach(() => {
  setActivePinia(createPinia());
});

test("should authenticate user", async () => {
  const authStore = useAuthStore();
  await authStore.login("username", "password");
  expect(authStore.isAuthenticated).toBe(true);
});
```

**Composable-Only Approach:**

```typescript
// Testing with composables
import { useAuthComposable } from "~/composables/useAuthComposable";

test("should authenticate user", async () => {
  const auth = useAuthComposable();
  await auth.login("username", "password");
  expect(auth.isAuthenticated.value).toBe(true);
});
```

## 📋 Migration Checklist

### From Existing Pinia Store to Enhanced Pinia Store

- [ ] Update imports to include new types
- [ ] Test existing functionality (should work unchanged)
- [ ] Optionally use new enhanced features
- [ ] Update tests if using new features

### From Pinia Store to Composable-Only

- [ ] Install no additional dependencies (remove Pinia if not used elsewhere)
- [ ] Replace `useAuthStore()` with `useAuthComposable()`
- [ ] Update reactive references (add `.value` where needed)
- [ ] Update component templates if necessary
- [ ] Update tests to use composable pattern
- [ ] Remove Pinia configuration if not used elsewhere

### From Composable-Only to Pinia Store

- [ ] Install and configure Pinia
- [ ] Replace `useAuthComposable()` with `useAuthStore()`
- [ ] Remove `.value` from reactive references
- [ ] Update component templates if necessary
- [ ] Update tests to use Pinia patterns
- [ ] Configure Pinia DevTools

## 🎯 Recommendations

### Choose Pinia Store If:

- You already use Pinia in your project
- You need rich debugging capabilities
- You have complex state management requirements
- Your team is familiar with Pinia patterns
- You're building a large, complex application

### Choose Composable-Only If:

- You want minimal dependencies
- Bundle size is a critical concern
- You prefer pure Composition API patterns
- You're building a simple to medium complexity app
- You want the most lightweight solution

## 🔧 Advanced Usage Examples

### Pinia Store with Auto-Refresh

```typescript
// plugins/auth.client.ts
export default defineNuxtPlugin(() => {
  const authStore = useAuthStore();

  // Auto-refresh token every 5 minutes
  setInterval(() => {
    if (authStore.shouldRefreshToken()) {
      authStore.autoRefreshToken();
    }
  }, 5 * 60 * 1000);
});
```

### Composable with Custom Hooks

```typescript
// composables/useAuthWithHooks.ts
export const useAuthWithHooks = () => {
  const auth = useAuthComposable();

  // Custom hook for login with analytics
  const loginWithAnalytics = async (username: string, password: string) => {
    try {
      const result = await auth.login(username, password);
      // Track successful login
      $gtag("event", "login", { method: "credentials" });
      return result;
    } catch (error) {
      // Track failed login
      $gtag("event", "login_failed", { method: "credentials" });
      throw error;
    }
  };

  return {
    ...auth,
    loginWithAnalytics,
  };
};
```

## 🔍 Troubleshooting

### Common Issues

**Pinia Store Issues:**

- **Store not initialized**: Ensure Pinia is properly configured in `nuxt.config.ts`
- **SSR hydration mismatch**: Use `initAuth()` in a client-side plugin
- **DevTools not working**: Install Vue DevTools browser extension

**Composable-Only Issues:**

- **State not persisting**: Ensure `useState` key is unique and consistent
- **SSR hydration issues**: Use proper client-side checks with `import.meta.client`
- **Memory leaks**: Properly cleanup watchers and intervals

### Performance Optimization

**Both Approaches:**

- Use `readonly()` for state that shouldn't be mutated directly
- Implement proper cleanup in `onUnmounted()`
- Use computed properties for derived state
- Avoid unnecessary reactive references

## 📚 Additional Resources

- [Pinia Documentation](https://pinia.vuejs.org/)
- [Nuxt Composables Guide](https://nuxt.com/docs/guide/directory-structure/composables)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Nuxt State Management](https://nuxt.com/docs/getting-started/state-management)

---

**Next Steps:**

- Choose your preferred approach based on your project needs
- Follow the implementation guide for your chosen approach
- Test thoroughly in your development environment
- Consider performance implications for your specific use case
