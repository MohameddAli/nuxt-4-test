# UI Components Guide

## Overview

This guide covers all authentication-related UI components built with Vuetify 3, including usage examples, customization options, and responsive design patterns.

## Table of Contents

1. [Enhanced Unauthorized Page](#enhanced-unauthorized-page)
2. [Enhanced Login Page](#enhanced-login-page)
3. [Vuetify 3 Integration](#vuetify-3-integration)
4. [Theming and Customization](#theming-and-customization)
5. [Responsive Design Patterns](#responsive-design-patterns)
6. [Accessibility Features](#accessibility-features)
7. [Animation System](#animation-system)

---

## Enhanced Unauthorized Page

### Overview

The unauthorized page (`/unauthorized`) provides a professional, user-friendly interface when users lack proper authentication or permissions.

### Features

- **Professional Design**: Clean, modern interface using Vuetify 3 components
- **Multi-language Support**: Full Arabic/English i18n integration
- **Auto-redirect**: Configurable countdown timer with cancel option
- **Reason Display**: Clear explanation of why access was denied
- **Smooth Animations**: Professional entrance and interaction animations
- **Responsive Layout**: Optimized for all screen sizes

### Component Structure

```vue
<template>
  <v-container fluid class="unauthorized-container">
    <v-row justify="center" align="center" class="min-h-screen">
      <v-col cols="12" sm="10" md="8" lg="6" xl="5">
        <v-card class="unauthorized-card" elevation="24" rounded="xl">
          <!-- Header with icon and title -->
          <v-card-item class="unauthorized-header">
            <v-avatar size="120" class="unauthorized-avatar">
              <v-icon size="60" color="white">mdi-shield-lock-outline</v-icon>
            </v-avatar>
            <v-card-title>{{ $t("errors.unauthorized.title") }}</v-card-title>
            <v-card-subtitle>{{
              $t("errors.unauthorized.subtitle")
            }}</v-card-subtitle>
          </v-card-item>

          <!-- Content with countdown and reasons -->
          <v-card-text>
            <!-- Countdown alert -->
            <v-alert v-if="showCountdown" type="info" variant="tonal">
              {{
                $t("errors.unauthorized.autoRedirect", { seconds: countdown })
              }}
            </v-alert>

            <!-- Reasons list -->
            <v-card variant="outlined" class="reasons-card">
              <v-list>
                <v-list-item v-for="reason in reasons" :key="reason">
                  <template #prepend>
                    <v-avatar :color="getReasonColor(reason)" variant="tonal">
                      <v-icon :icon="getReasonIcon(reason)" />
                    </v-avatar>
                  </template>
                  <v-list-item-title>
                    {{ $t(`errors.unauthorized.reasons.${reason}`) }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>

            <!-- Action buttons -->
            <v-btn color="primary" block @click="redirectToLogin">
              {{ $t("auth.login.title") }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
```

### Usage Examples

#### Basic Implementation

```typescript
// pages/unauthorized.vue
definePageMeta({
  layout: "empty",
  middleware: ["guest"],
});

const reasons = [
  "notLoggedIn",
  "sessionExpired",
  "insufficientPermissions",
  "accountDeactivated",
];
```

#### Customizing Reasons

```typescript
// Add custom unauthorized reasons
const customReasons = [
  "maintenanceMode",
  "accountSuspended",
  "regionRestricted",
];

const getReasonIcon = (reason: string): string => {
  const icons = {
    maintenanceMode: "mdi-wrench",
    accountSuspended: "mdi-account-cancel",
    regionRestricted: "mdi-earth-off",
  };
  return icons[reason] || "mdi-alert-circle-outline";
};
```

### Styling Classes

```css
/* Main container with gradient background */
.unauthorized-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%);
  min-height: 100vh;
}

/* Card with glassmorphism effect */
.unauthorized-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Animated header with shimmer effect */
.unauthorized-header {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%);
  position: relative;
  overflow: hidden;
}

.unauthorized-header::before {
  content: "";
  position: absolute;
  background: linear-gradient(
    45deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  animation: shimmer 3s ease-in-out infinite;
}
```

---

## Enhanced Login Page

### Overview

The login page (`/auth/login`) supports multiple authentication modes with enhanced security features and professional design.

### Authentication Modes

#### 1. Access Token Mode

- **Storage**: Memory only (no persistence)
- **Security**: High (tokens lost on refresh)
- **Use Case**: High-security applications

```typescript
// Configuration
const authMode = "access";
// Tokens stored only in memory, user must re-login on page refresh
```

#### 2. Refresh Token Mode

- **Storage**: Access token in memory, refresh token in localStorage
- **Security**: Balanced (automatic token refresh)
- **Use Case**: Standard web applications

```typescript
// Configuration
const authMode = "refresh";
// Access token in memory, refresh token persisted for auto-refresh
```

#### 3. Cookie Mode

- **Storage**: httpOnly cookies (server-managed)
- **Security**: Highest (XSS protection)
- **Use Case**: Enterprise applications

```typescript
// Configuration
const authMode = "cookie";
// All tokens managed by secure httpOnly cookies
```

### Component Structure

```vue
<template>
  <v-container fluid class="login-container">
    <v-row justify="center" align="center" class="min-h-screen">
      <v-col cols="12" sm="10" md="8" lg="5" xl="4">
        <v-card class="login-card" elevation="24" rounded="xl">
          <!-- Header with gradient and animation -->
          <v-card-item class="login-header">
            <v-avatar size="80" class="login-avatar">
              <v-icon size="40" color="white"
                >mdi-shield-account-outline</v-icon
              >
            </v-avatar>
            <v-card-title class="text-h4">{{
              $t("auth.login.title")
            }}</v-card-title>
            <v-card-subtitle>{{ $t("auth.login.subtitle") }}</v-card-subtitle>
          </v-card-item>

          <!-- Login form -->
          <v-card-text>
            <v-form @submit.prevent="handleLogin" ref="loginForm">
              <!-- Username field -->
              <v-text-field
                v-model="credentials.username"
                :label="$t('auth.login.username')"
                prepend-inner-icon="mdi-account-outline"
                variant="outlined"
                :rules="[rules.username]"
                :disabled="loading || isLocked"
                rounded="lg"
              />

              <!-- Password field -->
              <v-text-field
                v-model="credentials.password"
                :label="$t('auth.login.password')"
                prepend-inner-icon="mdi-lock-outline"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="
                  showPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
                "
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                :rules="[rules.password]"
                :disabled="loading || isLocked"
                rounded="lg"
              />

              <!-- Error alert -->
              <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
                {{ error }}
              </v-alert>

              <!-- Login button -->
              <v-btn
                type="submit"
                block
                size="x-large"
                color="primary"
                :loading="loading"
                :disabled="!isFormValid"
                rounded="xl"
              >
                {{ $t("auth.login.button") }}
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
```

### Enhanced Features

#### Account Lockout Protection

```typescript
// Configuration
const maxLoginAttempts = 5;
const lockoutDuration = 15; // minutes

// Implementation
const handleLoginError = (err: any): void => {
  loginAttempts.value++;

  if (loginAttempts.value >= maxLoginAttempts) {
    lockAccount();
    error.value = $i18n.t("auth.login.accountLocked", {
      minutes: lockoutDuration,
    });
  }
};

const lockAccount = (): void => {
  isLocked.value = true;
  setTimeout(() => {
    isLocked.value = false;
    loginAttempts.value = 0;
  }, lockoutDuration * 60 * 1000);
};
```

#### Mode-Specific Login Handling

```typescript
const performLogin = async (
  username: string,
  password: string
): Promise<void> => {
  switch (authMode.value) {
    case "access":
      await loginWithAccessToken(username, password);
      break;
    case "refresh":
      await loginWithRefreshToken(username, password);
      break;
    case "cookie":
      await loginWithCookies(username, password);
      break;
  }
};
```

### Styling Classes

```css
/* Container with animated gradient */
.login-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%);
  min-height: 100vh;
}

/* Card with glassmorphism and hover effects */
.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

/* Animated header with shimmer effect */
.login-header {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%);
  position: relative;
  overflow: hidden;
}

/* Enhanced button styling */
.login-btn {
  height: 56px;
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(25, 118, 210, 0.4);
}
```

---

## Vuetify 3 Integration

### Component Usage

#### Cards and Layout

```vue
<!-- Professional card with elevation and rounded corners -->
<v-card elevation="24" rounded="xl" class="custom-card">
  <v-card-item class="header-section">
    <!-- Header content -->
  </v-card-item>
  <v-card-text class="content-section">
    <!-- Main content -->
  </v-card-text>
  <v-card-actions class="action-section">
    <!-- Action buttons -->
  </v-card-actions>
</v-card>
```

#### Form Components

```vue
<!-- Enhanced text fields with validation -->
<v-text-field
  variant="outlined"
  rounded="lg"
  color="primary"
  bg-color="surface"
  hide-details="auto"
  clearable
  :rules="validationRules"
/>

<!-- Professional buttons with animations -->
<v-btn
  variant="elevated"
  size="x-large"
  rounded="xl"
  block
  :loading="isLoading"
  class="enhanced-btn"
>
  Button Text
</v-btn>
```

#### Alerts and Feedback

```vue
<!-- Tonal alerts with borders -->
<v-alert
  type="error"
  variant="tonal"
  rounded="lg"
  border="start"
  border-color="error"
  closable
>
  <template #prepend>
    <v-icon>mdi-alert-circle-outline</v-icon>
  </template>
  Alert message
</v-alert>
```

#### Lists and Items

```vue
<!-- Enhanced list items with avatars -->
<v-list density="comfortable">
  <v-list-item rounded="lg" class="custom-list-item">
    <template #prepend>
      <v-avatar size="40" color="primary" variant="tonal">
        <v-icon size="20">mdi-icon-name</v-icon>
      </v-avatar>
    </template>
    <v-list-item-title class="font-weight-medium">
      Item Title
    </v-list-item-title>
  </v-list-item>
</v-list>
```

### Theme Integration

#### Using Theme Colors

```css
/* Access theme colors in CSS */
.custom-element {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.1);
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
}

/* Dark theme support */
.v-theme--dark .custom-element {
  background: rgba(var(--v-theme-primary), 0.15);
}
```

#### Dynamic Color Usage

```typescript
// Access theme colors in JavaScript
const theme = useTheme();
const primaryColor = theme.current.value.colors.primary;

// Use in computed styles
const dynamicStyles = computed(() => ({
  backgroundColor: `rgba(${hexToRgb(primaryColor)}, 0.1)`,
  borderColor: primaryColor,
}));
```

---

## Theming and Customization

### Color Schemes

#### Primary Colors

- **Primary**: `#1976d2` (Material Blue)
- **Secondary**: `#424242` (Material Grey)
- **Success**: `#4caf50` (Material Green)
- **Warning**: `#ff9800` (Material Orange)
- **Error**: `#f44336` (Material Red)

#### Custom Color Variants

```css
/* Custom color utilities */
.color-primary-light {
  color: rgba(var(--v-theme-primary), 0.7);
}
.color-primary-dark {
  color: rgba(var(--v-theme-primary), 1.2);
}
.bg-primary-subtle {
  background: rgba(var(--v-theme-primary), 0.05);
}
.border-primary-soft {
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
}
```

### Typography

#### Font Weights and Sizes

```css
/* Enhanced typography classes */
.text-display {
  font-size: 3.5rem;
  font-weight: 300;
}
.text-headline {
  font-size: 2.5rem;
  font-weight: 400;
}
.text-title {
  font-size: 1.5rem;
  font-weight: 500;
}
.text-subtitle {
  font-size: 1.25rem;
  font-weight: 400;
}
.text-body-large {
  font-size: 1.125rem;
  line-height: 1.6;
}
.text-body-medium {
  font-size: 1rem;
  line-height: 1.5;
}
.text-caption {
  font-size: 0.875rem;
  font-weight: 400;
}
```

#### Letter Spacing and Line Height

```css
/* Professional typography adjustments */
.text-h4 {
  letter-spacing: -0.5px;
}
.text-h6 {
  letter-spacing: -0.25px;
}
.text-body-1 {
  line-height: 1.6;
}
.text-button {
  letter-spacing: 0.5px;
  text-transform: none;
}
```

### Custom Component Styling

#### Enhanced Cards

```css
.enhanced-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.enhanced-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}
```

#### Professional Buttons

```css
.enhanced-btn {
  height: 56px;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.enhanced-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(var(--v-theme-primary), 0.4);
}
```

---

## Responsive Design Patterns

### Breakpoint System

#### Vuetify 3 Breakpoints

- **xs**: 0-599px (Mobile)
- **sm**: 600-959px (Tablet)
- **md**: 960-1279px (Desktop)
- **lg**: 1280-1919px (Large Desktop)
- **xl**: 1920px+ (Extra Large)

#### Responsive Grid Usage

```vue
<v-container fluid>
  <v-row justify="center" align="center">
    <!-- Mobile: full width, Tablet: 10/12, Desktop: 8/12, Large: 6/12 -->
    <v-col cols="12" sm="10" md="8" lg="6" xl="5">
      <v-card>
        <!-- Content -->
      </v-card>
    </v-col>
  </v-row>
</v-container>
```

### Mobile-First Approach

#### Progressive Enhancement

```css
/* Base styles (mobile-first) */
.auth-card {
  padding: 1rem;
  margin: 0.5rem;
}

/* Tablet and up */
@media (min-width: 600px) {
  .auth-card {
    padding: 1.5rem;
    margin: 1rem;
  }
}

/* Desktop and up */
@media (min-width: 960px) {
  .auth-card {
    padding: 2rem;
    margin: 2rem auto;
    max-width: 500px;
  }
}
```

#### Responsive Typography

```css
/* Fluid typography */
.responsive-title {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  line-height: 1.2;
}

.responsive-body {
  font-size: clamp(0.875rem, 2.5vw, 1rem);
  line-height: 1.6;
}
```

### Touch-Friendly Design

#### Button Sizing

```css
/* Minimum touch target: 44px */
.touch-friendly-btn {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
}

/* Enhanced touch targets for mobile */
@media (max-width: 599px) {
  .mobile-btn {
    height: 56px;
    font-size: 1.1rem;
  }
}
```

#### Spacing and Layout

```css
/* Touch-friendly spacing */
.mobile-form .v-text-field {
  margin-bottom: 1.5rem;
}

.mobile-form .v-btn {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}
```

---

## Accessibility Features

### ARIA Labels and Roles

#### Form Accessibility

```vue
<v-text-field
  :label="$t('auth.login.username')"
  :aria-label="$t('auth.login.username')"
  :aria-describedby="usernameError ? 'username-error' : undefined"
  :aria-invalid="!!usernameError"
  role="textbox"
/>

<div v-if="usernameError" id="username-error" role="alert">
  {{ usernameError }}
</div>
```

#### Button Accessibility

```vue
<v-btn
  :aria-label="$t('auth.login.button')"
  :aria-describedby="loading ? 'login-status' : undefined"
  :disabled="!isFormValid"
>
  {{ $t('auth.login.button') }}
</v-btn>

<div v-if="loading" id="login-status" role="status" aria-live="polite">
  {{ $t('auth.login.processing') }}
</div>
```

### Keyboard Navigation

#### Focus Management

```css
/* Enhanced focus indicators */
.v-btn:focus,
.v-text-field:focus-within {
  outline: 2px solid rgba(var(--v-theme-primary), 0.5);
  outline-offset: 2px;
}

/* Skip to content link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--v-theme-primary);
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}
```

#### Tab Order

```vue
<!-- Logical tab order -->
<div class="auth-form">
  <v-text-field tabindex="1" /> <!-- Username -->
  <v-text-field tabindex="2" /> <!-- Password -->
  <v-checkbox tabindex="3" />   <!-- Remember me -->
  <v-btn tabindex="4" />        <!-- Login button -->
  <v-btn tabindex="5" />        <!-- Register link -->
</div>
```

### Screen Reader Support

#### Semantic HTML

```vue
<main role="main" aria-labelledby="page-title">
  <h1 id="page-title" class="sr-only">{{ $t('auth.login.title') }}</h1>

  <section aria-labelledby="login-form-title">
    <h2 id="login-form-title" class="sr-only">{{ $t('auth.login.form') }}</h2>

    <form role="form" aria-label="Login form">
      <!-- Form content -->
    </form>
  </section>
</main>
```

#### Live Regions

```vue
<!-- Status announcements -->
<div role="status" aria-live="polite" class="sr-only">
  {{ statusMessage }}
</div>

<!-- Error announcements -->
<div role="alert" aria-live="assertive" class="sr-only">
  {{ errorMessage }}
</div>
```

---

## Animation System

### CSS Animations

#### Entrance Animations

```css
/* Card fade-in animation */
@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.auth-card {
  animation: cardFadeIn 0.8s ease-out;
}

/* Staggered list animations */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.reason-item {
  animation: slideInLeft 0.6s ease-out;
}

.reason-item:nth-child(1) {
  animation-delay: 0.1s;
}
.reason-item:nth-child(2) {
  animation-delay: 0.2s;
}
.reason-item:nth-child(3) {
  animation-delay: 0.3s;
}
.reason-item:nth-child(4) {
  animation-delay: 0.4s;
}
```

#### Hover Animations

```css
/* Button hover effects */
.enhanced-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.enhanced-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(var(--v-theme-primary), 0.4);
}

/* Card hover effects */
.interactive-card {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.interactive-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}
```

#### Loading Animations

```css
/* Shimmer effect for loading states */
@keyframes shimmer {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  50% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
  100% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
}

.shimmer-effect::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  animation: shimmer 3s ease-in-out infinite;
}
```

### Vue Transitions

#### Page Transitions

```vue
<template>
  <transition name="page" mode="out-in">
    <component :is="currentPage" />
  </transition>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
```

#### Component Transitions

```vue
<!-- Expand transition for alerts -->
<v-expand-transition>
  <v-alert v-if="showAlert" type="error">
    {{ errorMessage }}
  </v-alert>
</v-expand-transition>

<!-- Fade transition for content -->
<transition name="fade" mode="out-in">
  <div v-if="isLoaded" key="content">
    <!-- Content -->
  </div>
  <div v-else key="loading">
    <!-- Loading state -->
  </div>
</transition>
```

### Performance Considerations

#### Animation Optimization

```css
/* Use transform and opacity for smooth animations */
.optimized-animation {
  will-change: transform, opacity;
  transform: translateZ(0); /* Force hardware acceleration */
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .animated-element {
    animation: none;
    transition: none;
  }
}
```

#### GPU Acceleration

```css
/* Force GPU acceleration for smooth animations */
.gpu-accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
```

---

## Best Practices

### Component Organization

1. **Single Responsibility**: Each component should have one clear purpose
2. **Composition over Inheritance**: Use composables for shared logic
3. **Props Validation**: Always validate component props with TypeScript
4. **Event Naming**: Use descriptive event names with proper prefixes

### Performance Optimization

1. **Lazy Loading**: Load components only when needed
2. **Image Optimization**: Use Nuxt Image for optimized images
3. **Bundle Splitting**: Split code at route level
4. **Tree Shaking**: Import only what you need from libraries

### Accessibility Standards

1. **WCAG 2.1 AA**: Meet accessibility guidelines
2. **Semantic HTML**: Use proper HTML elements
3. **Keyboard Navigation**: Ensure full keyboard accessibility
4. **Screen Reader Support**: Test with screen reader tools

### Testing Strategy

1. **Unit Tests**: Test component logic and methods
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Test complete user journeys
4. **Visual Regression**: Test UI consistency

---

## Troubleshooting

### Common Issues

#### Styling Problems

```css
/* Fix z-index issues */
.modal-overlay {
  z-index: 2000; /* Higher than Vuetify's default */
}

/* Fix responsive issues */
.responsive-fix {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}
```

#### Animation Issues

```css
/* Fix animation flickering */
.smooth-animation {
  backface-visibility: hidden;
  transform: translateZ(0);
}

/* Fix transition conflicts */
.transition-fix {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
```

#### Theme Issues

```typescript
// Fix theme color access
const theme = useTheme();
const colors = computed(() => theme.current.value.colors);

// Fix dark mode detection
const isDark = computed(() => theme.global.name.value === "dark");
```

### Debug Tools

#### Vue DevTools

```typescript
// Add component debugging
export default {
  name: "AuthComponent",
  __debugInfo: {
    authMode: authMode.value,
    isAuthenticated: authStore.isAuthenticated,
    currentUser: authStore.user,
  },
};
```

#### Console Logging

```typescript
// Structured logging for debugging
const debugAuth = (action: string, data?: any) => {
  if (process.env.NODE_ENV === "development") {
    console.group(`🔐 Auth Debug: ${action}`);
    console.log("Timestamp:", new Date().toISOString());
    console.log("Auth Mode:", authMode.value);
    console.log("Data:", data);
    console.groupEnd();
  }
};
```

---

## Conclusion

This UI components guide provides comprehensive documentation for all authentication-related components built with Vuetify 3. The components are designed to be:

- **Professional**: Clean, modern design following Material Design principles
- **Accessible**: Full WCAG 2.1 AA compliance with keyboard and screen reader support
- **Responsive**: Mobile-first design that works on all screen sizes
- **Performant**: Optimized animations and efficient rendering
- **Maintainable**: Well-structured code with clear documentation

For additional help or customization needs, refer to the [Vuetify 3 documentation](https://vuetifyjs.com/) and the project's specific implementation guides.
