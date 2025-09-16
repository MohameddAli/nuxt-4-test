# Internationalization Guide for Authentication Features

## Overview

This guide explains how to work with internationalization (i18n) in the enhanced Nuxt 4 authentication system. The system provides comprehensive Arabic and English support with RTL/LTR handling for all authentication-related features.

## Table of Contents

1. [Translation Structure](#translation-structure)
2. [Authentication Messages](#authentication-messages)
3. [Network Status Messages](#network-status-messages)
4. [Error Handling Messages](#error-handling-messages)
5. [Session Management Messages](#session-management-messages)
6. [Adding New Translations](#adding-new-translations)
7. [RTL Support](#rtl-support)
8. [Best Practices](#best-practices)
9. [Usage Examples](#usage-examples)

## Translation Structure

The authentication system uses a structured approach to translations with the following main categories:

```json
{
  "auth": {
    "login": {
      /* Login related messages */
    },
    "logout": {
      /* Logout related messages */
    },
    "modes": {
      /* Authentication mode descriptions */
    },
    "tokenStorage": {
      /* Token management messages */
    },
    "retry": {
      /* Retry operation messages */
    }
  },
  "network": {
    "status": {
      /* Connection status messages */
    },
    "quality": {
      /* Connection quality indicators */
    },
    "actions": {
      /* Network-related actions */
    }
  },
  "session": {
    /* Session management and expiry messages */
  },
  "errors": {
    "categories": {
      /* Error category messages */
    },
    "contextual": {
      /* Context-aware error messages */
    },
    "recovery": {
      /* Error recovery actions */
    }
  }
}
```

## Authentication Messages

### Login and Logout

**English (`app/i18n/locales/en.json`)**:

```json
{
  "auth": {
    "login": {
      "title": "Login",
      "subtitle": "Welcome back to our platform",
      "button": "Sign In",
      "success": "Login successful!",
      "error": "Invalid username or password"
    },
    "logout": {
      "title": "Logout",
      "success": "Logout successful"
    }
  }
}
```

**Arabic (`app/i18n/locales/ar.json`)**:

```json
{
  "auth": {
    "login": {
      "title": "تسجيل الدخول",
      "subtitle": "مرحباً بعودتك إلى منصتنا",
      "button": "تسجيل الدخول",
      "success": "تم تسجيل الدخول بنجاح!",
      "error": "اسم المستخدم أو كلمة المرور غير صحيحة"
    },
    "logout": {
      "title": "تسجيل الخروج",
      "success": "تم تسجيل الخروج بنجاح"
    }
  }
}
```

### Authentication Modes

The system supports three authentication modes with descriptive messages:

```json
{
  "auth": {
    "modes": {
      "access": {
        "title": "Access Token Mode / وضع الرمز المميز",
        "description": "Memory-only temporary storage / تخزين مؤقت في الذاكرة فقط"
      },
      "refresh": {
        "title": "Refresh Token Mode / وضع التحديث التلقائي",
        "description": "Access token + refresh token / رمز الوصول + رمز التحديث"
      },
      "cookie": {
        "title": "Cookie Mode / وضع ملفات تعريف الارتباط",
        "description": "Secure cookie-based authentication / مصادقة آمنة بملفات تعريف الارتباط"
      }
    }
  }
}
```

### Token Storage Messages

```json
{
  "auth": {
    "tokenStorage": {
      "cleared": "All tokens cleared successfully / تم مسح جميع الرموز المميزة بنجاح",
      "accessTokenSet": "Access token stored in memory / تم حفظ رمز الوصول في الذاكرة",
      "refreshTokenSet": "Refresh token stored securely / تم حفظ رمز التحديث بأمان",
      "tokenExpired": "Token has expired / انتهت صلاحية الرمز المميز",
      "tokenValid": "Token is valid / الرمز المميز صالح",
      "modeChanged": "Authentication mode changed to {mode} / تم تغيير وضع المصادقة إلى {mode}",
      "storageError": "Error accessing token storage / خطأ في الوصول لتخزين الرموز المميزة"
    }
  }
}
```

## Network Status Messages

### Connection Status

```json
{
  "network": {
    "offline": "Internet connection lost / انقطع الاتصال بالإنترنت",
    "online": "Internet connection restored / تم استعادة الاتصال بالإنترنت",
    "reconnecting": "Reconnecting... / جاري إعادة الاتصال...",
    "error": "Network error, please try again later / خطأ في الشبكة، يرجى المحاولة لاحقاً"
  }
}
```

### Connection Quality

```json
{
  "network": {
    "quality": {
      "excellent": "Excellent / ممتاز",
      "good": "Good / جيد",
      "fair": "Fair / مقبول",
      "poor": "Poor / ضعيف"
    }
  }
}
```

### Network Actions

```json
{
  "network": {
    "actions": {
      "retry": "Retry Failed Operations / إعادة تنفيذ العمليات الفاشلة",
      "refresh": "Refresh Page / تحديث الصفحة",
      "checkConnection": "Check Connection / فحص الاتصال"
    }
  }
}
```

## Error Handling Messages

### Error Categories

The system categorizes errors for appropriate handling:

```json
{
  "errors": {
    "categories": {
      "network": "Unable to connect to server, please try again later / تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً",
      "server": "Server error, please try again later / خطأ في الخادم، يرجى المحاولة لاحقاً",
      "validation": "Please check your input and fix any errors / يرجى التحقق من البيانات المدخلة وإصلاح الأخطاء",
      "auth": "Session expired, please login again / انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً",
      "permission": "You don't have permission to access this resource / ليس لديك صلاحية للوصول إلى هذا المورد",
      "client": "Request error, please try again / حدث خطأ في الطلب، يرجى المحاولة مرة أخرى",
      "unknown": "An unexpected error occurred, please try again / حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى"
    }
  }
}
```

### Contextual Error Messages

For more specific error reporting with context:

```json
{
  "errors": {
    "contextual": {
      "network": "Connection failed during {context} / تعذر الاتصال أثناء {context}",
      "server": "Server error during {context} / خطأ في الخادم أثناء {context}",
      "validation": "Input validation error in {context} / خطأ في البيانات المدخلة في {context}",
      "auth": "Session expired during {context} / انتهت صلاحية الجلسة أثناء {context}",
      "permission": "No permission for {context} / ليس لديك صلاحية لـ {context}",
      "client": "Request error for {context} / خطأ في طلب {context}",
      "unknown": "Error occurred during {context} / حدث خطأ أثناء {context}"
    }
  }
}
```

## Session Management Messages

### Session Expiry

```json
{
  "session": {
    "expired": "Session expired, please login again / انتهت صلاحية الجلسة، يرجى التسجيل مجدداً",
    "expiredContext": "Session expired during {context} / انتهت صلاحية الجلسة أثناء {context}",
    "expiredCritical": "Session expired - critical area / انتهت صلاحية الجلسة - منطقة حساسة",
    "refreshed": "Session refreshed successfully / تم تحديث الجلسة بنجاح",
    "refreshing": "Refreshing session... / جاري تحديث الجلسة...",
    "refreshFailed": "Failed to refresh session / فشل في تحديث الجلسة"
  }
}
```

### Session Management

```json
{
  "session": {
    "manualTrigger": "Session ended: {reason} / انتهت الجلسة: {reason}",
    "cleanup": "Authentication data cleared / تم مسح بيانات المصادقة",
    "redirecting": "Redirecting to login page... / جاري التوجيه لصفحة تسجيل الدخول...",
    "returnUrlSaved": "Return URL saved for seamless redirect / تم حفظ رابط العودة للتوجيه السلس"
  }
}
```

## Adding New Translations

### Step 1: Identify the Translation Key

Choose a descriptive key that follows the existing structure:

```typescript
// Good examples
"auth.tokenStorage.cleared";
"network.status.connected";
"errors.contextual.network";
"session.expiredContext";

// Avoid generic keys
"message";
"error";
"success";
```

### Step 2: Add to Both Language Files

Always add translations to both `en.json` and `ar.json`:

**English (`app/i18n/locales/en.json`)**:

```json
{
  "auth": {
    "newFeature": {
      "title": "New Feature",
      "description": "This is a new authentication feature",
      "success": "Feature enabled successfully"
    }
  }
}
```

**Arabic (`app/i18n/locales/ar.json`)**:

```json
{
  "auth": {
    "newFeature": {
      "title": "ميزة جديدة",
      "description": "هذه ميزة مصادقة جديدة",
      "success": "تم تفعيل الميزة بنجاح"
    }
  }
}
```

### Step 3: Use in Components/Composables

```vue
<template>
  <div>
    <h2>{{ $t("auth.newFeature.title") }}</h2>
    <p>{{ $t("auth.newFeature.description") }}</p>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();

// In composables
const showSuccess = () => {
  showSnackbar(t("auth.newFeature.success"));
};
</script>
```

## RTL Support

### Automatic Direction Handling

The system automatically handles text direction based on the selected language:

- **English**: Left-to-Right (LTR)
- **Arabic**: Right-to-Left (RTL)

### CSS Classes

Vuetify automatically applies RTL classes when Arabic is selected:

```css
/* Automatically applied for Arabic */
.v-application--is-rtl {
  direction: rtl;
}

/* Custom RTL-aware styles */
.auth-form {
  text-align: start; /* Adapts to direction */
}
```

### Layout Considerations

When designing components, use direction-neutral properties:

```css
/* Good - direction neutral */
margin-inline-start: 16px;
padding-inline-end: 8px;
border-inline-start: 1px solid;

/* Avoid - direction specific */
margin-left: 16px;
padding-right: 8px;
border-left: 1px solid;
```

## Best Practices

### 1. Message Hierarchy

Always prioritize backend messages over client-side translations:

```typescript
// Good - backend message takes priority
const displayMessage = backendMessage || t("errors.categories.network");

// Avoid - always using client-side message
const displayMessage = t("errors.categories.network");
```

### 2. Context-Aware Messages

Use contextual messages for better user experience:

```typescript
// Good - provides context
const message = t("errors.contextual.network", { context: "تسجيل الدخول" });

// Basic - less informative
const message = t("errors.categories.network");
```

### 3. Parameterized Messages

Use parameters for dynamic content:

```typescript
// Translation
"session.expiredContext": "Session expired during {context}"

// Usage
const message = t('session.expiredContext', { context: 'data saving' })
```

### 4. Consistent Terminology

Maintain consistent terminology across all translations:

```json
{
  // Consistent use of "تسجيل الدخول" for login
  "auth.login.title": "تسجيل الدخول",
  "auth.login.button": "تسجيل الدخول",
  "session.expired": "انتهت صلاحية الجلسة، يرجى التسجيل مجدداً"
}
```

### 5. Error Message Guidelines

- **Be specific**: Provide clear, actionable error messages
- **Be helpful**: Include suggestions for resolution when possible
- **Be consistent**: Use the same terminology for similar errors
- **Be respectful**: Use polite, professional language

## Usage Examples

### In Vue Components

```vue
<template>
  <v-card>
    <v-card-title>{{ $t("auth.login.title") }}</v-card-title>
    <v-card-text>{{ $t("auth.login.subtitle") }}</v-card-text>

    <v-btn @click="handleLogin">
      {{ $t("auth.login.button") }}
    </v-btn>
  </v-card>
</template>

<script setup lang="ts">
const { t } = useI18n();

const handleLogin = async () => {
  try {
    await login();
    showSuccess(t("auth.login.success"));
  } catch (error) {
    showError(t("auth.login.error"));
  }
};
</script>
```

### In Composables

```typescript
// useSessionExpiry.ts
export const useSessionExpiry = () => {
  const { t } = useI18n();

  const handleSessionExpiry = async (context?: string) => {
    const message = context
      ? t("session.expiredContext", { context })
      : t("session.expired");

    showWarning(message);
  };

  return { handleSessionExpiry };
};
```

### In Error Handlers

```typescript
// useErrorHandler.ts
export const useErrorHandler = () => {
  const { t } = useI18n();

  const handleError = (error: any, context?: string) => {
    const category = categorizeError(error);

    const message = context
      ? t(`errors.contextual.${category}`, { context })
      : t(`errors.categories.${category}`);

    // Backend message takes priority
    const displayMessage = extractBackendMessage(error) || message;

    showError(displayMessage);
  };

  return { handleError };
};
```

### Network Status Integration

```typescript
// useNetworkStatus.ts
export const useNetworkStatus = () => {
  const { t } = useI18n();

  const handleConnectionChange = (isOnline: boolean) => {
    const message = isOnline ? t("network.online") : t("network.offline");

    const type = isOnline ? "success" : "error";
    showSnackbar(message, { type });
  };

  return { handleConnectionChange };
};
```

## Testing Translations

### 1. Language Switching

Test that all messages appear correctly when switching languages:

```typescript
// Test both languages
const { locale } = useI18n();

// Test English
locale.value = "en";
expect(t("auth.login.title")).toBe("Login");

// Test Arabic
locale.value = "ar";
expect(t("auth.login.title")).toBe("تسجيل الدخول");
```

### 2. Parameter Substitution

Test that parameters are correctly substituted:

```typescript
const message = t("session.expiredContext", { context: "saving data" });
expect(message).toContain("saving data");
```

### 3. RTL Layout

Test that RTL layout works correctly:

```typescript
// Check that RTL class is applied
locale.value = "ar";
await nextTick();
expect(document.documentElement).toHaveClass("v-application--is-rtl");
```

## Troubleshooting

### Common Issues

1. **Missing Translation Key**

   ```
   Error: Translation key 'auth.newFeature.title' not found
   ```

   **Solution**: Add the key to both language files

2. **Parameter Not Substituted**

   ```
   Message shows: "Session expired during {context}"
   ```

   **Solution**: Pass parameters object: `t('key', { context: 'value' })`

3. **RTL Layout Issues**

   ```
   Arabic text appears left-aligned
   ```

   **Solution**: Use direction-neutral CSS properties

4. **Backend Message Not Showing**
   ```
   Client-side message always shows instead of backend message
   ```
   **Solution**: Check message extraction logic and prioritization

### Debug Mode

Enable i18n debug mode in development:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  i18n: {
    debug: process.env.NODE_ENV === "development",
  },
});
```

This will log missing translations and other i18n issues to the console.

## Conclusion

The enhanced authentication system provides comprehensive internationalization support with:

- ✅ Complete Arabic and English translations
- ✅ RTL/LTR automatic handling
- ✅ Context-aware error messages
- ✅ Backend message prioritization
- ✅ Consistent terminology
- ✅ Network status integration
- ✅ Session management messages
- ✅ Token storage notifications

Follow this guide to maintain consistency and provide an excellent multilingual user experience in your authentication system.
