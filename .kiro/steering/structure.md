---
inclusion: always
---

# Project Structure & Development Guidelines

## Directory Architecture

### Root Structure

```
├── app/                    # Main application source (srcDir)
├── server/                 # Server-side API routes
├── shared/                 # Shared utilities and types
├── public/                 # Static assets
├── .kiro/                  # Kiro AI assistant configuration
├── .nuxt/                  # Generated Nuxt files (auto-generated)
├── node_modules/           # Dependencies
└── [config files]         # Configuration files
```

### App Directory (`app/`) - Client-Side Code

```
app/
├── assets/css/            # Global stylesheets only
├── components/            # Vue components (auto-imported)
│   ├── charts/           # Data visualization components
│   ├── layout/           # Navigation, header, sidebar
│   ├── notifications/    # Toast, alert components
│   ├── pagination/       # Table pagination
│   ├── search/           # Search functionality
│   ├── ui/               # Reusable UI components
│   └── user/             # User-specific components
├── composables/          # Reusable logic (auto-imported)
├── i18n/locales/         # en.json, ar.json translation files
├── layouts/              # Page layouts (default, auth, etc.)
├── middleware/           # Route guards and auth checks
├── pages/                # File-based routing
├── plugins/              # Nuxt plugins initialization
├── stores/               # Pinia state management
├── app.vue               # Root component
├── error.vue             # Global error page
└── theme.ts              # Vuetify theme configuration
```

### Server Directory (`server/`) - API Routes

```
server/
└── api/                  # RESTful API endpoints
    ├── health.get.ts     # Health check endpoint
    └── _readme.md        # API documentation
```

### Shared Directory (`shared/`) - Common Code

```
shared/
├── types/                # TypeScript definitions
│   ├── env.d.ts         # Environment variables
│   ├── index.ts         # Main type exports
│   └── menu.d.ts        # Navigation types
└── utils/                # Utility functions
    ├── errorHandler.ts   # Error handling
    ├── helpers.ts        # General utilities
    ├── index.ts          # Main exports
    ├── menuItems.ts      # Menu configuration
    └── safeConsole.ts    # Safe logging
```

## Architectural Patterns & Rules

### Component Organization Rules

- **UI Components**: Generic, reusable components in `components/ui/` (buttons, inputs, modals)
- **Feature Components**: Domain-specific components in feature folders (charts/, user/, etc.)
- **Layout Components**: Navigation and structural components in `components/layout/`
- **Single Responsibility**: Each component should have one clear purpose
- **Composition over Inheritance**: Use composables for shared logic

### State Management Guidelines

- **Domain-Based Stores**: Separate stores by business domain (auth, users, groups, app, loading)
- **Composables for Logic**: Extract reusable logic into composables with `use` prefix
- **Global State**: App-wide state only in `stores/app.ts`
- **Local State**: Component-specific state should remain local unless shared

### File-Based Routing Rules

- **Pages Directory**: All routes defined in `pages/` directory structure
- **Dynamic Routes**: Use `[id].vue` for dynamic parameters
- **Nested Routes**: Use folder structure for nested routes
- **Layouts**: Apply layouts via `definePageMeta({ layout: 'name' })`
- **Middleware**: Use for authentication, permissions, and route guards

### Internationalization Standards

- **Locale Files**: JSON structure in `app/i18n/locales/` (en.json, ar.json)
- **Translation Keys**: Use dot notation (e.g., `auth.login.title`)
- **RTL Support**: Automatic layout direction for Arabic
- **Configuration**: Root-level `i18n.config.ts` for global settings

### Type Safety Requirements

- **Shared Types**: Common interfaces in `shared/types/`
- **Component Props**: Define explicit prop types with TypeScript
- **API Types**: Server response types in server directory
- **Auto-imports**: Leverage Nuxt's auto-import for types

## Naming Conventions & Code Style

### File Naming Rules

- **Components**: PascalCase for Vue components (`UserProfile.vue`)
- **Pages**: kebab-case matching URL structure (`user-profile.vue`)
- **Composables**: camelCase with `use` prefix (`useAuth.ts`, `useUserData.ts`)
- **Stores**: camelCase domain names (`auth.ts`, `userManagement.ts`)
- **Utilities**: camelCase descriptive names (`errorHandler.ts`, `dateHelpers.ts`)
- **Types**: PascalCase interfaces (`User.ts`, `ApiResponse.ts`)

### Code Organization Standards

- **Single File Components**: Use `<script setup>` syntax
- **Composition API**: Prefer over Options API
- **TypeScript**: All new code must use TypeScript
- **Auto-imports**: Leverage Nuxt's auto-import system
- **Explicit Imports**: Only for external libraries and specific utilities

### Component Structure

```vue
<template>
  <!-- Template content -->
</template>

<script setup lang="ts">
// Imports
// Props/Emits definitions
// Composables
// Reactive data
// Computed properties
// Methods
// Lifecycle hooks
</script>

<style scoped>
/* Component-specific styles */
</style>
```

## Import Patterns & Path Resolution

### Auto-Import System

- **Components**: All components in `components/` are auto-imported
- **Composables**: All composables in `composables/` are auto-imported
- **Utilities**: Utilities in `utils/` are auto-imported
- **Stores**: Pinia stores are auto-imported

### Explicit Import Rules

- **External Libraries**: Always explicitly import (`import { ref } from 'vue'`)
- **Shared Utilities**: Import from `shared/utils/`
- **Types**: Import types with `import type { ... }`

### Path Aliases

- `~/` or `@/`: Points to app directory
- `#imports`: Nuxt auto-imports
- `#app`: Nuxt app context

## Development Guidelines

### Code Quality Standards

- **ESLint**: Follow project ESLint configuration
- **TypeScript**: Strict mode enabled, no `any` types
- **Vue 3**: Use Composition API with `<script setup>`
- **Reactivity**: Use `ref()` for primitives, `reactive()` for objects

### Performance Best Practices

- **Lazy Loading**: Use dynamic imports for heavy components
- **Tree Shaking**: Import only what you need from libraries
- **Image Optimization**: Use Nuxt Image for optimized images
- **Bundle Analysis**: Monitor bundle size with build tools

### Security Guidelines

- **Input Validation**: Validate all user inputs
- **XSS Prevention**: Sanitize dynamic content
- **CSRF Protection**: Use built-in Nuxt CSRF protection
- **Environment Variables**: Never expose sensitive data to client

### Accessibility Requirements

- **Semantic HTML**: Use proper HTML elements
- **ARIA Labels**: Add ARIA attributes where needed
- **Keyboard Navigation**: Ensure keyboard accessibility
- **Color Contrast**: Meet WCAG 2.1 AA standards
- **Screen Readers**: Test with screen reader tools
