The project configuration you've provided is comprehensive and well-defined, outlining a robust Nuxt 4 starter application with essential features like authentication, RBAC, file management, reporting, and a strong emphasis on UI/UX and best practices. Building a production-ready application with these specifications is an excellent goal.

Let's begin by outlining the initial project setup, core configurations, and tackling the foundational aspects of Authentication & Authorization along with the custom useApi composable.

Initial Project Setup & Core Configuration
First, we'll establish the basic Nuxt 4 project structure and configure the necessary modules: Vuetify 3, Pinia, Nuxt i18n, and NProgress.

1. Project Structure Proposal:

A clear and logical folder structure is crucial for maintainability. Here's a suggested layout:

.
├── assets/
│   ├── scss/
│   │   ├── main.scss           // Global styles, Vuetify overrides
│   │   └── variables.scss      // SCSS variables
│   └── images/
│       └── logo.svg
├── components/
│   ├── ui/                     // General UI components (e.g., AppButton, AppCard)
│   │   ├── AppButton.vue
│   │   └── AppCard.vue
│   ├── global/                 // Components used globally (e.g., TheHeader, TheFooter)
│   │   ├── TheAppBar.vue
│   │   └── TheDrawer.vue
│   ├── auth/                   // Authentication-specific components
│   │   ├── LoginForm.vue
│   │   └── RegisterForm.vue
│   ├── crud/                   // Reusable CRUD components
│   │   ├── AppDataTable.vue    // Data table with sorting, filtering, pagination
│   │   └── AppModal.vue
│   ├── file-upload/            // File upload specific components
│   │   ├── ImageUploader.vue
│   │   └── FileUploader.vue
│   └── notifications/          // Notification system components
│       └── AppToast.vue
├── composables/
│   ├── useApi.ts               // Custom API wrapper
│   ├── useAuth.ts              // Authentication-related helper composable
│   ├── useNotifications.ts     // Notification helper
│   ├── useTheme.ts             // Dark/light mode helper
│   └── usePermissions.ts       // RBAC permissions check
├── layouts/
│   ├── default.vue             // Main application layout
│   └── auth.vue                // Layout for login, register, password reset
├── middleware/
│   ├── auth.ts                 // Protects authenticated routes
│   ├── guest.ts                // Redirects authenticated users from guest routes
│   └── rbac.ts                 // Role-based access control middleware
├── pages/
│   ├── index.vue               // Home page
│   ├── login.vue
│   ├── register.vue
│   ├── forgot-password.vue
│   ├── dashboard.vue
│   ├── admin/
│   │   ├── users/
│   │   │   ├── index.vue
│   │   │   ├── [id].vue
│   │   │   └── create.vue
│   │   └── products/
│   │       ├── index.vue
│   │       ├── [id].vue
│   │       └── create.vue
│   └── error.vue               // Custom error page (e.g., 404, 500)
├── plugins/
│   ├── vuetify.ts              // Vuetify configuration plugin
│   ├── i18n.ts                 // Nuxt i18n configuration
│   ├── nprogress.client.ts     // NProgress client-side plugin
│   └── api-interceptor.client.ts // API interceptors for global error/token refresh
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── server/
│   ├── api/                    // Mock API endpoints (for development/examples)
│   │   ├── auth/
│   │   │   └── login.ts
│   │   └── users.ts
│   └── middleware/             // Server middleware (e.g., for JWT token verification)
├── stores/
│   ├── auth.ts                 // Pinia store for authentication state
│   ├── app.ts                  // Global application state (loading, theme)
│   └── user.ts                 // User-specific data
├── types/
│   ├── auth.d.ts               // TypeScript types for authentication
│   ├── user.d.ts               // TypeScript types for user data
│   └── index.d.ts              // Global types and interfaces
├── nuxt.config.ts
├── package.json
├── tsconfig.json
└── README.md
2. nuxt.config.ts (Initial Configuration):

This file will configure our core modules and global settings.

// nuxt.config.ts
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  // Nuxt 4 specific features (still under development, assume latest stable)
  // ssr: true, // Enable Server-Side Rendering by default

  devtools: { enabled: true },

  // Global CSS/SCSS files
  css: [
    '~/assets/scss/main.scss',
    'vuetify/lib/styles/main.sass', // Vuetify 3 styles
    '@mdi/font/css/materialdesignicons.min.css', // MDI icons
    'nprogress/nprogress.css' // NProgress styles
  ],

  // Modules
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    async (options, nuxt) => {
      // @ts-ignore
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        config.plugins?.push(vuetify({
          styles: { configFile: 'assets/scss/variables.scss' }
        }))
      })
    },
    // Custom module for NProgress, or directly integrated via plugin
    // Example of a minimal NProgress module if you prefer:
    // './modules/nprogress'
  ],

  // Build configuration (for Vuetify)
  build: {
    transpile: ['vuetify'],
  },

  // Vite specific configuration
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
    // Optional: for environment variables, though Nuxt 4 handles this well with runtimeConfig
    define: {
      'process.env.DEBUG': 'false',
    },
  },

  // Runtime configuration - exposed to client and server
  runtimeConfig: {
    // Private keys that are only available on the server
    apiSecret: process.env.NUXT_API_SECRET,
    // Public keys that are exposed to the client
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
    }
  },

  // Pinia configuration
  pinia: {
    storesDirs: ['./stores/**'], // Auto-import Pinia stores
  },

  // i18n configuration (@nuxtjs/i18n)
  i18n: {
    locales: [
      { code: 'en', file: 'en.json', dir: 'ltr' },
      { code: 'ar', file: 'ar.json', dir: 'rtl' },
    ],
    lazy: true,
    langDir: 'locales', // Directory for language files
    defaultLocale: 'en',
    vueI18n: './i18n.config.ts', // Path to your i18n.config.ts
    strategy: 'no_prefix', // Or 'prefix_except_default' if you want /en/ for English
    // detectBrowserLanguage: {
    //   useCookie: true,
    //   cookieKey: 'i18n_redirected',
    //   redirectOn: 'root',  // recommended
    // },
  },

  // NProgress configuration (via a plugin)
  plugins: [
    { src: '~/plugins/nprogress.client.ts', mode: 'client' },
    { src: '~/plugins/vuetify.ts' },
    { src: '~/plugins/api-interceptor.client.ts', mode: 'client' } // For token refresh, logout on 401
  ],

  // Route middleware (global or named)
  routeRules: {
    '/admin/**': { ssr: true, prerender: false }, // Example: Force SSR for admin pages
    '/dashboard': { ssr: false, prerender: false } // Example: Client-side rendering for dashboard
  },

  // App configuration (for global metadata, headers)
  app: {
    head: {
      titleTemplate: '%s - Nuxt 4 Starter',
      title: 'Welcome',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'A comprehensive Nuxt 4 starter project.' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ],
      htmlAttrs: {
        lang: 'en' // Default language, will be updated by i18n
      }
    }
  },
})
3. i18n.config.ts:

This file defines the vue-i18n options.

// i18n.config.ts
import en from './locales/en.json'
import ar from './locales/ar.json'

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    ar,
  }
}))
4. locales/en.json & locales/ar.json:

Example language files.

// locales/en.json
{
  "common": {
    "login": "Login",
    "register": "Register",
    "logout": "Logout",
    "dashboard": "Dashboard",
    "home": "Home",
    "admin": "Admin"
  },
  "validation": {
    "required": "This field is required."
  },
  "errors": {
    "unauthorized": "You are not authorized to access this page.",
    "notFound": "Page not found."
  }
}
// locales/ar.json
{
  "common": {
    "login": "تسجيل الدخول",
    "register": "التسجيل",
    "logout": "تسجيل الخروج",
    "dashboard": "لوحة التحكم",
    "home": "الرئيسية",
    "admin": "الإدارة"
  },
  "validation": {
    "required": "هذا الحقل مطلوب.",
  },
  "errors": {
    "unauthorized": "أنت غير مصرح لك بالوصول إلى هذه الصفحة.",
    "notFound": "الصفحة غير موجودة."
  }
}
5. plugins/vuetify.ts:

Configures Vuetify, including dark/light mode and default component properties.

// plugins/vuetify.ts
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { VSnackbar } from 'vuetify/components/VSnackbar' // Ensure VSnackbar is imported for overrides

export default defineNuxtPlugin(nuxtApp => {
  const vuetify = createVuetify({
    ssr: true, // Enable SSR for Vuetify components
    components,
    directives,
    defaults: {
      VAppBar: {
        flat: true,
      },
      VBtn: {
        variant: 'flat',
        rounded: 'lg',
      },
      VCard: {
        flat: true,
        rounded: 'lg',
      },
      VTextField: {
        variant: 'outlined',
        density: 'comfortable',
      },
      VSelect: {
        variant: 'outlined',
        density: 'comfortable',
      },
      VSnackbar: { // Global defaults for notifications
        timeout: 3000,
        location: 'bottom right',
        rounded: 'lg',
      },
    },
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          colors: {
            primary: '#1867C0', // Blue
            secondary: '#5CBBF6',
            accent: '#0052D1',
            error: '#FF5252',
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FB8C00',
            background: '#F5F5F5', // Light grey background
          },
        },
        dark: {
          colors: {
            primary: '#2196F3', // Light blue
            secondary: '#424242',
            accent: '#448AFF',
            error: '#FF5252',
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FB8C00',
            background: '#121212', // Dark background
          },
        },
      },
    },
  })

  nuxtApp.vueApp.use(vuetify)
})
6. plugins/nprogress.client.ts:

Integrates NProgress for navigation loading indicators.

// plugins/nprogress.client.ts
import NProgress from 'nprogress'

export default defineNuxtPlugin((nuxtApp) => {
  NProgress.configure({ showSpinner: false, speed: 500, minimum: 0.1 });

  nuxtApp.hook('app:mounted', () => {
    // Optional: Start on app mount if needed, though route hooks are more common
  })

  nuxtApp.hook('page:start', () => {
    NProgress.start()
  })

  nuxtApp.hook('page:finish', () => {
    NProgress.done()
  })

  // Optional: Handle errors as well
  nuxtApp.hook('app:error', () => {
    if (NProgress.isStarted()) {
      NProgress.done()
    }
  })
})
Authentication & Authorization (JWT, RBAC, useApi)
This is a core part of the application. We'll set up the Pinia store for authentication, the useApi composable for API interactions with token handling, and initial middleware for route protection.

7. types/auth.d.ts:

Define TypeScript interfaces for authentication data.

// types/auth.d.ts
export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[]; // e.g., ['Admin', 'User']
  // Add other user properties as needed
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // For auto-logout
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}

export type UserRole = 'Admin' | 'User' | 'Guest';
8. stores/auth.ts (Pinia Store):

Handles authentication state, including user data, tokens, and methods for login/logout.

// stores/auth.ts
import { defineStore } from 'pinia'
import type { User, AuthTokens, LoginPayload, RegisterPayload, AuthState, UserRole } from '~/types/auth'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
  }),
  getters: {
    // Check if user is authenticated
    getIsAuthenticated: (state) => state.isAuthenticated,
    // Get current user data
    getUser: (state) => state.user,
    // Get current JWT token
    getToken: (state) => state.token,
    // Check if user has a specific role
    hasRole: (state) => (role: UserRole | UserRole[]) => {
      if (!state.user || !state.user.roles) return false;
      const rolesArray = Array.isArray(role) ? role : [role];
      return state.user.roles.some(userRole => rolesArray.includes(userRole as UserRole));
    },
    // Check if user is an Admin
    isAdmin: (state) => state.isAuthenticated && state.user?.roles.includes('Admin'),
  },
  actions: {
    async login(payload: LoginPayload) {
      this.isLoading = true;
      try {
        // In a real app, this would be an API call
        // const { data } = await useApi().post('/auth/login', payload);
        // For now, mock a successful login
        const mockData: AuthTokens & { user: User } = {
          accessToken: 'mock_jwt_token_admin', // Example token
          refreshToken: 'mock_refresh_token',
          expiresIn: 3600, // 1 hour
          user: {
            id: 1,
            name: 'John Doe',
            email: payload.email,
            roles: payload.email === 'admin@example.com' ? ['Admin', 'User'] : ['User'],
          },
        };
        const { accessToken, refreshToken, user } = mockData;

        this.setTokens({ accessToken, refreshToken, expiresIn: mockData.expiresIn });
        this.setUser(user);
        this.isAuthenticated = true;
        
        // You might want to dispatch a global success notification here
        // useNotifications().success('Login successful!');

        return true; // Indicate success
      } catch (error: any) {
        console.error('Login failed:', error);
        this.clearAuthData();
        // You might want to dispatch a global error notification here
        // useNotifications().error(error.message || 'Login failed!');
        throw error; // Re-throw to allow component to handle
      } finally {
        this.isLoading = false;
      }
    },

    async register(payload: RegisterPayload) {
      this.isLoading = true;
      try {
        // const { data } = await useApi().post('/auth/register', payload);
        // Mock register for now
        const mockData: AuthTokens & { user: User } = {
          accessToken: 'mock_jwt_token_user',
          refreshToken: 'mock_refresh_token_new',
          expiresIn: 3600,
          user: {
            id: Math.floor(Math.random() * 1000) + 2, // New ID
            name: payload.name,
            email: payload.email,
            roles: ['User'],
          },
        };

        const { accessToken, refreshToken, user } = mockData;
        this.setTokens({ accessToken, refreshToken, expiresIn: mockData.expiresIn });
        this.setUser(user);
        this.isAuthenticated = true;
        // useNotifications().success('Registration successful!');
        return true;
      } catch (error: any) {
        console.error('Registration failed:', error);
        this.clearAuthData();
        // useNotifications().error(error.message || 'Registration failed!');
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async logout() {
      // In a real app, you might invalidate the token on the server
      // await useApi().post('/auth/logout');
      this.clearAuthData();
      // useNotifications().info('You have been logged out.');
      await navigateTo('/login'); // Redirect to login after logout
    },

    // Set user data and authentication status
    setUser(user: User | null) {
      this.user = user;
      this.isAuthenticated = !!user;
    },

    // Set tokens and handle their expiration
    setTokens({ accessToken, refreshToken, expiresIn }: AuthTokens) {
      this.token = accessToken;
      this.refreshToken = refreshToken;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      // Optional: Store expiration time if you want client-side auto-logout based on exp
      localStorage.setItem('tokenExpiresAt', String(Date.now() + expiresIn * 1000));
    },

    // Clear all authentication data
    clearAuthData() {
      this.user = null;
      this.token = null;
      this.refreshToken = null;
      this.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiresAt');
    },

    // Attempt to load auth data from local storage on app init
    async initializeAuth() {
      if (process.client) { // Only run on client-side
        const storedToken = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        const tokenExpiresAt = localStorage.getItem('tokenExpiresAt');

        if (storedToken && storedRefreshToken && tokenExpiresAt) {
          // Check if token is expired
          if (Date.now() < parseInt(tokenExpiresAt)) {
            this.token = storedToken;
            this.refreshToken = storedRefreshToken;
            // In a real app, you'd verify the token with an API call to get user data
            // For now, mock user data retrieval based on a valid token
            try {
              // const user = await useApi().get('/auth/me'); // Get user profile
              const mockUser: User = {
                id: 1,
                name: 'Loaded User',
                email: 'user@example.com',
                roles: ['User'], // Default role or derived from token
              };
              if (storedToken.includes('admin')) { // Simple mock logic for roles
                mockUser.name = 'Loaded Admin';
                mockUser.email = 'admin@example.com';
                mockUser.roles = ['Admin', 'User'];
              }

              this.setUser(mockUser);
              this.isAuthenticated = true;
            } catch (e) {
              console.error("Failed to re-authenticate from stored token:", e);
              this.clearAuthData(); // Token invalid or expired on server
            }
          } else {
            // Token expired, attempt refresh or clear
            console.warn("Access token expired. Attempting refresh or clearing data...");
            // await this.refreshTokenAction(); // Implement token refresh logic
            this.clearAuthData();
          }
        }
      }
    },

    // Placeholder for token refresh logic
    async refreshTokenAction() {
      if (!this.refreshToken) {
        this.clearAuthData();
        return false;
      }
      try {
        // const { data } = await useApi().post('/auth/refresh', { refreshToken: this.refreshToken });
        // Mock refresh
        const mockData: AuthTokens = {
          accessToken: 'new_mock_jwt_token',
          refreshToken: 'new_mock_refresh_token',
          expiresIn: 3600,
        };
        this.setTokens(mockData);
        return true;
      } catch (error) {
        console.error('Token refresh failed:', error);
        this.clearAuthData(); // Force logout on refresh failure
        return false;
      }
    }
  },
});
To persist the Pinia store across page loads (for token, refreshToken, user), you'll need a plugin like pinia-plugin-persistedstate. Add it to nuxt.config.ts:

// nuxt.config.ts (add to modules)
modules: [
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt', // Add this module
    // ... other modules
],
// And configure it
piniaPersistedstate: {
    cookieOptions: {
      sameSite: 'strict',
      maxAge: 3600 * 24 * 7, // 7 days
    },
    storage: 'localStorage' // Or 'cookie'
},
You would also need to run npm install @pinia-plugin-persistedstate/nuxt.

9. composables/useApi.ts:

This custom composable will wrap Nuxt's useFetch to add common functionality like token attachment, loading states, and error handling.

// composables/useApi.ts
import { storeToRefs } from 'pinia';
import { useAuthStore } from '~/stores/auth';
import { useAppStore } from '~/stores/app'; // For global loading indicator
import { useNotifications } from '~/composables/useNotifications'; // For toast messages

// Define API response structure
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  pending: Ref<boolean>;
  status: Ref<number | undefined>;
}

/**
 * Custom composable for making API requests.
 * Handles token attachment, loading states, and basic error handling.
 *
 * @param url The URL endpoint for the request.
 * @param options Nuxt useFetch options.
 * @returns An object with data, error, and pending state.
 */
export const useApi = <T>(
  url: string | Ref<string> | (() => string),
  options: Parameters<typeof useFetch>[1] = {}
): ApiResponse<T> => {
  const authStore = useAuthStore();
  const { token } = storeToRefs(authStore);
  const appStore = useAppStore(); // Assuming you have an app store for global loading
  const { addNotification } = useNotifications(); // Assuming this composable exists

  const config = useRuntimeConfig();
  const baseUrl = config.public.apiBaseUrl;

  // Default headers, including authorization if token exists
  const defaultHeaders = {
    ...options.headers,
    ...(token.value && { Authorization: `Bearer ${token.value}` }),
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Merge default options with provided options
  const fetchOptions = {
    baseURL: baseUrl,
    ...options,
    headers: defaultHeaders,
    // Interceptors for request/response logic
    onRequest({ request, options }) {
      appStore.setGlobalLoading(true); // Start global loading
      // Log request details (optional)
      console.log(`[useApi] Request: ${options.method || 'GET'} ${request}`);
    },
    onRequestError({ request, options, error }) {
      appStore.setGlobalLoading(false); // Stop global loading
      console.error(`[useApi] Request Error: ${request}`, error);
      addNotification({ type: 'error', message: `Request failed: ${error.message || 'Unknown error'}` });
    },
    onResponse({ request, response, options }) {
      appStore.setGlobalLoading(false); // Stop global loading
      // Handle specific status codes
      if (response.status === 401) {
        // Token expired or invalid
        authStore.logout(); // Clear auth data and redirect
        addNotification({ type: 'error', message: 'Session expired. Please log in again.' });
        navigateTo('/login');
      } else if (response.status >= 400) {
        const errorData = response._data?.message || response._data?.error || `API Error: ${response.status}`;
        addNotification({ type: 'error', message: errorData });
      }
      console.log(`[useApi] Response: ${response.status} ${request}`);
    },
    onResponseError({ request, response, options }) {
      appStore.setGlobalLoading(false); // Stop global loading
      console.error(`[useApi] Response Error: ${request}`, response.status, response._data);
      const errorData = response._data?.message || response._data?.error || `API Error: ${response.status} ${response.statusText}`;
      addNotification({ type: 'error', message: errorData });
    },
  };

  // Use Nuxt's useFetch
  const { data, pending, error, status } = useFetch<T>(url, fetchOptions);

  // Return values as a structured object
  return {
    data: data as Ref<T | null>, // Cast data to T | null
    error: error as Ref<Error | null>,
    pending,
    status,
  };
};

// Helper functions for common HTTP methods
export const useApiGet = <T>(url: string | Ref<string> | (() => string), options?: Parameters<typeof useFetch>[1]) =>
  useApi<T>(url, { method: 'GET', ...options });

export const useApiPost = <T>(url: string | Ref<string> | (() => string), body?: any, options?: Parameters<typeof useFetch>[1]) =>
  useApi<T>(url, { method: 'POST', body, ...options });

export const useApiPut = <T>(url: string | Ref<string> | (() => string), body?: any, options?: Parameters<typeof useFetch>[1]) =>
  useApi<T>(url, { method: 'PUT', body, ...options });

export const useApiDelete = <T>(url: string | Ref<string> | (() => string), options?: Parameters<typeof useFetch>[1]) =>
  useApi<T>(url, { method: 'DELETE', ...options });

// For File Uploads (multipart/form-data)
export const useApiUpload = <T>(url: string | Ref<string> | (() => string), body: FormData, options?: Parameters<typeof useFetch>[1]) =>
  useApi<T>(url, {
    method: 'POST',
    body,
    headers: {
      ...(useAuthStore().token && { Authorization: `Bearer ${useAuthStore().token}` }),
      // Do NOT set Content-Type header for FormData, browser sets it automatically with boundary
    },
    ...options
  });
This useApi composable requires a useAppStore for global loading and useNotifications for toast messages, which we'll define next.

10. stores/app.ts (for Global Loading):

// stores/app.ts
import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    globalLoading: false,
    darkMode: false, // Initial state for dark mode
  }),
  actions: {
    setGlobalLoading(status: boolean) {
      this.globalLoading = status;
    },
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      if (process.client) {
        localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', this.darkMode ? 'dark' : 'light');
      }
    },
    initializeTheme() {
      if (process.client) {
        const storedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (storedTheme) {
          this.darkMode = storedTheme === 'dark';
        } else {
          this.darkMode = systemPrefersDark;
        }
        document.documentElement.setAttribute('data-theme', this.darkMode ? 'dark' : 'light');
      }
    }
  },
});
11. composables/useNotifications.ts (for Toast Messages):

// composables/useNotifications.ts
import { ref } from 'vue';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timeout?: number;
  id?: number;
}

const notifications = ref<Notification[]>([]);
let notificationId = 0;

export const useNotifications = () => {
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = notificationId++;
    notifications.value.push({ ...notification, id });

    if (notification.timeout !== 0) { // 0 means indefinite
      setTimeout(() => {
        removeNotification(id);
      }, notification.timeout || 3000); // Default 3 seconds
    }
  };

  const removeNotification = (id: number) => {
    notifications.value = notifications.value.filter(n => n.id !== id);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    success: (message: string, timeout?: number) => addNotification({ message, type: 'success', timeout }),
    error: (message: string, timeout?: number) => addNotification({ message, type: 'error', timeout }),
    warning: (message: string, timeout?: number) => addNotification({ message, type: 'warning', timeout }),
    info: (message: string, timeout?: number) => addNotification({ message, type: 'info', timeout }),
  };
};
We'll create a global notification component to display these.

12. middleware/auth.ts:

Nuxt middleware for protecting routes.

// middleware/auth.ts
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.getIsAuthenticated;

  if (process.client) { // Ensure this runs only on client after hydration
    // For protected routes, check authentication
    if (to.meta.auth && !isAuthenticated) {
      // If not authenticated, redirect to login
      console.warn('Authentication required. Redirecting to login.');
      return navigateTo('/login');
    }

    // Optional: Auto-logout on token expiry check (client-side)
    const tokenExpiresAt = localStorage.getItem('tokenExpiresAt');
    if (isAuthenticated && tokenExpiresAt && Date.now() >= parseInt(tokenExpiresAt)) {
      console.warn('Token expired. Logging out.');
      authStore.logout(); // This will clear data and redirect
      return navigateTo('/login');
    }
  }
});
13. middleware/guest.ts:

Middleware for routes accessible only to guests (e.g., login, register).

// middleware/guest.ts
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  if (process.client && authStore.getIsAuthenticated) {
    // If authenticated, redirect from guest pages to dashboard
    console.info('Already authenticated. Redirecting to dashboard.');
    return navigateTo('/dashboard');
  }
});
14. layouts/auth.vue:

A minimal layout for authentication pages.

<!-- layouts/auth.vue -->
<template>
  <v-app :theme="appStore.darkMode ? 'dark' : 'light'">
    <v-main class="d-flex align-center justify-center">
      <v-container>
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useAppStore } from '~/stores/app';
const appStore = useAppStore();

onMounted(() => {
  appStore.initializeTheme(); // Initialize theme on component mount
});
</script>

<style scoped>
/* Add auth layout specific styles if needed */
</style>
15. pages/login.vue:

A basic login page using Vuetify components.

<!-- pages/login.vue -->
<template>
  <v-row justify="center">
    <v-col cols="12" sm="8" md="6" lg="4">
      <v-card class="pa-4">
        <v-card-title class="text-h5 text-center">{{ $t('common.login') }}</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleLogin">
            <v-text-field
              v-model="email"
              label="Email"
              prepend-inner-icon="mdi-email"
              :rules="[rules.required, rules.email]"
              required
            ></v-text-field>
            <v-text-field
              v-model="password"
              label="Password"
              prepend-inner-icon="mdi-lock"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="showPassword = !showPassword"
              :rules="[rules.required]"
              required
            ></v-text-field>
            <v-btn
              color="primary"
              block
              class="mt-4"
              type="submit"
              :loading="authStore.isLoading"
              :disabled="authStore.isLoading"
            >
              {{ $t('common.login') }}
            </v-btn>
          </v-form>
          <div class="text-center mt-4">
            <NuxtLink to="/forgot-password" class="text-caption">Forgot Password?</NuxtLink>
            <div class="mt-2">
              Don't have an account? <NuxtLink to="/register">Register</NuxtLink>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useNotifications } from '~/composables/useNotifications';

definePageMeta({
  layout: 'auth',
  middleware: 'guest', // Apply guest middleware to redirect if already logged in
});

const authStore = useAuthStore();
const { addNotification } = useNotifications();
const { t } = useI18n();

const email = ref('admin@example.com'); // Pre-fill for convenience
const password = ref('password'); // Pre-fill for convenience
const showPassword = ref(false);

const rules = {
  required: (value: string) => !!value || t('validation.required'),
  email: (value: string) => /.+@.+\..+/.test(value) || 'Must be a valid email address.',
};

const handleLogin = async () => {
  try {
    await authStore.login({ email: email.value, password: password.value });
    addNotification({ type: 'success', message: t('common.login') + ' successful!' });
    await navigateTo('/dashboard'); // Redirect to dashboard on success
  } catch (error: any) {
    addNotification({ type: 'error', message: error.message || t('common.login') + ' failed!' });
  }
};
</script>
16. pages/register.vue (placeholder):

<!-- pages/register.vue -->
<template>
  <v-row justify="center">
    <v-col cols="12" sm="8" md="6" lg="4">
      <v-card class="pa-4">
        <v-card-title class="text-h5 text-center">{{ $t('common.register') }}</v-card-title>
        <v-card-text>
          <p class="text-center">Registration form will go here.</p>
          <div class="text-center mt-4">
            Already have an account? <NuxtLink to="/login">Login</NuxtLink>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest',
});

const { t } = useI18n(); // Just to show i18n is available
</script>
17. pages/dashboard.vue (example protected page):

<!-- pages/dashboard.vue -->
<template>
  <v-app :theme="appStore.darkMode ? 'dark' : 'light'">
    <TheAppBar />
    <TheDrawer />
    <v-main>
      <v-container fluid>
        <h1 class="text-h4 mb-4">Welcome to your Dashboard!</h1>
        <v-card class="pa-4">
          <v-card-title>User Information</v-card-title>
          <v-card-text v-if="authStore.getUser">
            <p><strong>Name:</strong> {{ authStore.getUser.name }}</p>
            <p><strong>Email:</strong> {{ authStore.getUser.email }}</p>
            <p><strong>Roles:</strong> {{ authStore.getUser.roles.join(', ') }}</p>
          </v-card-text>
          <v-card-text v-else>
            <p>Loading user data...</p>
          </v-card-text>
          <v-btn color="error" @click="authStore.logout()">{{ $t('common.logout') }}</v-btn>
          <v-btn class="ml-2" @click="toggleTheme">Toggle Theme</v-btn>
          <v-btn class="ml-2" @click="toggleLocale">Toggle Language ({{ currentLocale }})</v-btn>
        </v-card>

        <h2 class="text-h5 mt-8 mb-4">Protected Content Example</h2>
        <v-card class="pa-4">
          <v-card-title>Admin Access Only</v-card-title>
          <v-card-text>
            <p v-if="authStore.isAdmin">
              This content is visible only to users with the 'Admin' role.
              You can access <NuxtLink to="/admin/users">Admin Users</NuxtLink> page.
            </p>
            <p v-else>
              You do not have administrative privileges to view this content.
            </p>
          </v-card-text>
        </v-card>

      </v-container>
    </v-main>
    <AppToastContainer />
  </v-app>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { useAppStore } from '~/stores/app';
import { useI18n } from 'vue-i18n';
import TheAppBar from '~/components/global/TheAppBar.vue';
import TheDrawer from '~/components/global/TheDrawer.vue';
import AppToastContainer from '~/components/notifications/AppToastContainer.vue';

definePageMeta({
  middleware: 'auth', // This route is protected
});

const authStore = useAuthStore();
const appStore = useAppStore();
const { locale } = useI18n();

const toggleTheme = () => {
  appStore.toggleDarkMode();
};

const currentLocale = computed(() => locale.value);

const toggleLocale = () => {
  locale.value = locale.value === 'en' ? 'ar' : 'en';
  // Update HTML lang attribute for accessibility and browser
  if (process.client) {
    document.documentElement.setAttribute('lang', locale.value);
    document.documentElement.setAttribute('dir', locale.value === 'ar' ? 'rtl' : 'ltr');
  }
};

onMounted(() => {
  // Ensure theme is applied on client-side navigation as well
  appStore.initializeTheme();
});
</script>
18. components/global/TheAppBar.vue (example for top bar):

<!-- components/global/TheAppBar.vue -->
<template>
  <v-app-bar app>
    <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
    <v-toolbar-title>Nuxt 4 Starter</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn icon @click="appStore.toggleDarkMode()">
      <v-icon>{{ appStore.darkMode ? 'mdi-weather-night' : 'mdi-white-balance-sunny' }}</v-icon>
    </v-btn>
    <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props">
          <v-icon>mdi-translate</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="setLocale('en')">
          <v-list-item-title>English</v-list-item-title>
        </v-list-item>
        <v-list-item @click="setLocale('ar')">
          <v-list-item-title>العربية</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-btn color="primary" @click="authStore.logout()">
      {{ $t('common.logout') }}
    </v-btn>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { useAppStore } from '~/stores/app';
import { useI18n } from 'vue-i18n';

const authStore = useAuthStore();
const appStore = useAppStore();
const { locale } = useI18n();

const drawer = defineModel('drawer', { type: Boolean, default: false }); // Define a model for drawer state

const setLocale = (lang: string) => {
  locale.value = lang;
  if (process.client) {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }
};
</script>
19. components/global/TheDrawer.vue (example for side navigation):

<!-- components/global/TheDrawer.vue -->
<template>
  <v-navigation-drawer v-model="drawer" app>
    <v-list>
      <v-list-item :title="$t('common.home')" to="/" prepend-icon="mdi-home"></v-list-item>
      <v-list-item :title="$t('common.dashboard')" to="/dashboard" prepend-icon="mdi-view-dashboard"></v-list-item>
      <v-list-item
        v-if="authStore.isAdmin"
        :title="$t('common.admin')"
        to="/admin/users"
        prepend-icon="mdi-shield-account"
      ></v-list-item>
      <!-- More navigation items -->
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const { t } = useI18n();

const drawer = defineModel('drawer', { type: Boolean, default: false }); // Define a model for drawer state
</script>
20. components/notifications/AppToastContainer.vue:

This component will display the toast messages using Vuetify's VSnackbar.

<!-- components/notifications/AppToastContainer.vue -->
<template>
  <v-snackbar
    v-for="notification in notifications"
    :key="notification.id"
    v-model="notification.show"
    :timeout="notification.timeout || 3000"
    :color="notification.type"
    location="bottom right"
    variant="flat"
    rounded="lg"
    @update:model-value="val => !val && removeNotification(notification.id as number)"
  >
    {{ notification.message }}
    <template v-slot:actions>
      <v-btn icon @click="removeNotification(notification.id as number)">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { useNotifications, Notification } from '~/composables/useNotifications';
import { computed, watch } from 'vue';

const { notifications: rawNotifications, removeNotification } = useNotifications();

// Create a computed ref that adds a 'show' property for v-model in VSnackbar
const notifications = computed(() => {
  return rawNotifications.value.map(n => ({ ...n, show: true }));
});
</script>

<style scoped>
/* Scoped styles if needed, though VSnackbar handles much of the positioning */
</style>
To display AppToastContainer globally, you can add it to your layouts/default.vue and layouts/auth.vue or integrate it as a global component using a plugin. For simplicity, we can add it to the main layout.

21. layouts/default.vue:

The main application layout.

<!-- layouts/default.vue -->
<template>
  <v-app :theme="appStore.darkMode ? 'dark' : 'light'">
    <TheAppBar v-model:drawer="drawer" />
    <TheDrawer v-model:drawer="drawer" />
    <v-main>
      <v-container fluid>
        <NuxtPage />
      </v-container>
    </v-main>
    <AppToastContainer />
    <!-- Global Loading Overlay -->
    <v-overlay :model-value="appStore.globalLoading" class="align-center justify-center" persistent>
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAppStore } from '~/stores/app';
import TheAppBar from '~/components/global/TheAppBar.vue';
import TheDrawer from '~/components/global/TheDrawer.vue';
import AppToastContainer from '~/components/notifications/AppToastContainer.vue';

const appStore = useAppStore();
const drawer = ref(false); // Controls the navigation drawer

onMounted(() => {
  appStore.initializeTheme(); // Initialize theme on component mount
  // Also, initialize auth state on client-side mount
  // This will try to re-hydrate user/token from localStorage
  useAuthStore().initializeAuth();
});
</script>

<style lang="scss">
@import '~/assets/scss/main.scss';

// Global styles for dark/light mode transitions and RTL
html {
  transition: background-color 0.3s ease, color 0.3s ease;
}

[data-theme="dark"] {
  background-color: #121212;
  color: #E0E0E0;
}

[data-theme="light"] {
  background-color: #F5F5F5;
  color: #333333;
}

// RTL support for Vuetify 3 (might need more specific overrides)
html[dir="rtl"] {
  .v-navigation-drawer--left {
    right: 0 !important;
    left: auto !important;
  }
  .v-navigation-drawer--right {
    left: 0 !important;
    right: auto !important;
  }
  .v-list-item__prepend, .v-list-item__append {
    margin-right: 0;
    margin-left: 12px;
  }
}
</style>
This initial setup covers the core project structure, nuxt.config.ts, i18n, Vuetify theming and defaults, NProgress, the essential Pinia auth store, the custom useApi composable with interceptors and global loading, a notification system, and basic authentication pages with routing and middleware.

We've laid a strong foundation for the authentication flow, including JWT handling (mocked for now), automatic token attachment to API requests, and basic error handling including session expiration. The global loading indicator and notification system are also integrated.

Next, we can delve into more advanced aspects of RBAC, detailed CRUD operations, file management, and reporting systems.