### AI collaborator project context (Nuxt 4)

Use this as system instructions when working on this repository. It explains the folder/file structure and conventions so you can propose precise, path-specific edits.

- **Stack**: Nuxt 4, Vue 3, TypeScript, Pinia, Vuetify 3, @nuxtjs/i18n, @nuxt/image, @nuxt/icon, @nuxt/fonts, ESLint.
- **Dev scripts**: `npm run dev`, `npm run build`, `npm run preview`.

### Directory map and roles
```
nuxt.config.ts          # Nuxt config: modules, CSS, i18n, Vite/Vuetify
i18n.config.ts          # vue-i18n messages loaded from app/i18n
assets/css/global.css   # Global styles imported in nuxt.config.ts
public/                 # Static assets served at root
server/api/             # Nitro API routes (currently empty)
app/
  app.vue               # Root wrapper with <NuxtLayout><NuxtPage/></NuxtLayout>
  layouts/default.vue   # Global layout: header, sidebar, breadcrumbs, snackbar
  pages/                # File-based routing. Each page may set definePageMeta
  components/           # Reusable UI (AppHeader.vue, AppSidebar.vue, etc.)
  plugins/              # Client/server plugins (vuetify.ts)
  composables/          # Reusable logic (useApi, useAuth, useLoading, etc.)
  stores/               # Pinia stores (useAppStore in app.ts)
  i18n/                 # Locale messages: en.json, ar.json
```

### Key configuration
- **nuxt.config.ts**:
  - Transpiles Vuetify and registers modules: `@pinia/nuxt`, `@nuxtjs/i18n`, `@nuxt/eslint`, `@nuxt/image`, `@nuxt/icon`, `@nuxt/fonts`, `@nuxt/scripts`.
  - Loads global CSS: `@/assets/css/global.css`.
  - i18n: locales `en`, `ar` (RTL), `strategy: no_prefix`, `vueI18n: ./i18n.config.ts`.
- **i18n.config.ts**: Imports `app/i18n/en.json` and `app/i18n/ar.json`, `legacy: false`, `globalInjection: true`.
- **plugins/vuetify.ts**: Creates Vuetify, sets themes, icons (MDI), enables RTL for `ar`.

### Layout and page conventions
- **Root**: `app/app.vue` mounts `<NuxtLayout>` and `<NuxtPage>`.
- **Default layout**: `app/layouts/default.vue` wires Vuetify shell, header (`AppHeader`), sidebar (`AppSidebar`), breadcrumb builder, scroll-to-top, snackbar.
- **Page meta**: Pages should call `definePageMeta({ title: "i18n.key", subtitle: "i18n.key" })`. The layout uses these keys for the header.
- **Breadcrumbs**: Auto-derived from `route.path` unless `route.meta.breadcrumbs === false`.
- **i18n**: Use translation keys in templates and scripts via `useI18n`. Do not hardcode user-facing strings. Update `app/i18n/en.json` and `app/i18n/ar.json` together.

### State management
- Use Pinia stores in `app/stores`. The main UI store is `useAppStore` (`app/stores/app.ts`) for sidebar, theme, locale, loading.
- Toggle theme and locale via the store; layout and header sync HTML `lang` and `dir` attributes, and Vuetify theme.

### UI and styling
- Use Vuetify 3 components and Material Design Icons. Respect theme tokens.
- Global styles live in `assets/css/global.css` and are already included by Nuxt.

### Routing and navigation
- File-based routes under `app/pages`. Add directories/files to create routes.
- Navigation items are currently defined inside `app/components/AppSidebar.vue` (and also listed in `app/stores/app.ts`). Keep these consistent when adding pages.

### Imports and aliases
- Prefer `~/...` to import from project root and `@/...` for root as well (Nuxt aliases). Examples: `import { useAppStore } from "~/stores/app"`, `import "~/assets/css/global.css"`.
- Use `<script setup lang="ts">` with composition API.

### How to ask for and propose changes
- When you propose edits, reference exact paths and show the full new content or a concise diff.
- Include any new i18n keys to add in both `app/i18n/en.json` and `app/i18n/ar.json`.
- For new pages: create files under `app/pages/...` and set `definePageMeta`. Update navigation where applicable.
- For new plugins: add files under `app/plugins/` and highlight if they are client-only (suffix with `.client.ts` if needed).
- For API routes: create files under `server/api/` using Nitro handlers.
- For assets: put static files in `public/` and processed styles/images in `assets/`.

### Quality and style
- Follow ESLint defaults (project uses `@nuxt/eslint`).
- Keep TypeScript types for stores, composables, and props.
- Match Vuetify patterns already used (themes, display breakpoints, layout).

### Quick facts to remember
- Default locale: `en`. Arabic `ar` uses RTL.
- The layout reads meta `title` and `subtitle` keys and builds breadcrumbs automatically.
- `useAppStore.initializeTheme()` reads persisted theme and locale on mount.

With this context, always generate path-accurate, Nuxt/Vuetify-consistent edits, and keep i18n keys synchronized.

### Complete file inventory | قائمة الملفات الكاملة
- Generated from the working tree (excluding node_modules, .nuxt, build outputs). Archives like .rar are included for awareness but should not be modified by code edits.

```
.cursor\rules\myStructure.mdc
.env
.gitignore
0_4.rar
ai_full_tree.txt
app\app.vue
app\assets\css\global.css
app\components\0.rar
app\components\AppHeader.vue
app\components\AppSidebar.rar
app\components\AppSidebar.vue
app\components\AppSidebar1.rar
app\components\AppSidebar2.rar
app\components\AppSidebar3.rar
app\components\AppSidebar4.rar
app\components\CryptoChart.vue
app\components\layout\AppHeader.vue
app\components\layout\AppSidebar.vue
app\composables\useApi.ts
app\composables\useAuth.ts
app\composables\useErrorHandler.ts
app\composables\useExport.ts
app\composables\useFileUpload.ts
app\composables\useLoading.ts
app\composables\useNetworkStatus.ts
app\composables\useSnackbar.ts
app\composables\useUnauthorized.ts
app\composables\useUtils.ts
app\composables\useZod.ts
app\error.vue
app\i18n\ar.json
app\i18n\en.json
app\layouts\default.vue
app\locales\en.json
app\pages\index.vue
app\plugins\i18n.client.ts
app\plugins\vuetify.ts
app\stores\app.ts
assets\css\global.css
eslint.config.mjs
explain.md
i18n.config.ts
install.ps1
nuxt.config.ts
package.json
plan.md
pnpm-lock.yaml
public\favicon.ico
public\images\almadar.jpg
public\images\libyana.jpg
public\images\libyaphone.png
public\images\logoDark.png
public\images\logoWhite.png
public\images\moamalat.png
public\images\moamalatLogo.png
public\logo.png
public\prompts\code generation\Brainstorming Ideas.md
public\prompts\code generation\Code Explanation and Understanding.md
public\prompts\code generation\Code Generation 1.md
public\prompts\code generation\Code Refactoring and Optimization.md
public\prompts\code generation\Coding Challenge Practice & Interview Preparation.md
public\prompts\code generation\collection of prompts for generating high quality\links.md
public\prompts\code generation\collection of prompts for generating high quality\prompts.md
public\prompts\code generation\collection of prompts for generating high quality\prompts2.md
public\prompts\code generation\collection of prompts for generating high quality\test.md
public\prompts\code generation\Data-Specific Tasks (Regex, SQL, etc.).md
public\prompts\code generation\Debugging and Error Resolution.md
public\prompts\code generation\Language Translation & API\Library Usage.md
public\prompts\code generation\Learning and Best Practices.md
public\prompts\code generation\Tooling and Environment.md
public\prompts\code generation\Understanding and Applying Design Patterns.md
public\prompts\code generation\Unit Testing.md
public\prompts\fix bugs\find and fix codeBugs.md
public\prompts\list of prompts\convert code to other lang.md
public\prompts\list of prompts\create api endpoints.md
public\prompts\list of prompts\Create Code Documentation.md
public\prompts\list of prompts\Explain Code Step-by-Step.md
public\prompts\list of prompts\Generate SQL Queries.md
public\prompts\list of prompts\improve code structure.md
public\prompts\list of prompts\Optimize Code for Performance.md
public\prompts\list of prompts\The Database Optimization Prompt.md
public\prompts\list of prompts\The Debugging Specialist Prompt.md
public\prompts\list of prompts\The Last One, It's the Deepseek R1 System Prompt.md
public\prompts\list of prompts\Write Less Code Solve More.md
public\prompts\list of prompts\Write Unit Tests for Code.md
public\prompts\n4startTest.md
public\prompts\nuxt4_1.md
public\prompts\prompts.rar
public\robots.txt
README.md
tsconfig.json
```

Notes:
- There are two global style entry points present: `assets/css/global.css` (loaded by Nuxt) and `app/assets/css/global.css` (duplicate). Prefer the one referenced in `nuxt.config.ts` (`@/assets/css/global.css`).
- Some `.rar` files under `app/components/` and repo root are binary archives; do not modify them in code edits.

### Additional structure and helpers added
- **`server/api/health.get.ts`**: Simple health-check endpoint (`GET /api/health`).
- **`server/api/_readme.md`**: Notes on Nitro API file naming and methods.
- **`app/middleware/auth.global.ts`**: Global route middleware placeholder for auth/analytics.
- **`shared/types/index.ts`**: Central TypeScript types (e.g., `ApiResponse<T>`, `Pagination`, `LocaleCode`).
- **`shared/utils/index.ts`**: Shared utilities (`sleep`, `formatCurrency`, `safeParseInt`, `isBrowser`).
- **`app/docs/README.md`**: In-repo documentation space (architecture, i18n, UI patterns).
- **`app/examples/README.md`**: Minimal runnable examples and code snippets.
- **`env.example`**: Template for environment variables; copy to `.env`.

```
server/api/health.get.ts
server/api/_readme.md
app/middleware/auth.global.ts
shared/types/index.ts
shared/utils/index.ts
app/docs/README.md
app/examples/README.md
env.example
```

### Arabic project context (مختصر بالعربية)
- **التقنيات**: Nuxt 4، Vue 3، TypeScript، Pinia، Vuetify 3، i18n، Image، Icon، Fonts، ESLint.
- **الخدمات والأدوار**:
  - `nuxt.config.ts`: إعداد الوحدات وCSS وi18n وVite/Vuetify.
  - `i18n.config.ts`: تحميل رسائل اللغتين من `app/i18n` مع `legacy: false` و`globalInjection`.
  - `app/`: يحتوي على `app.vue`، القوالب `layouts/`، الصفحات `pages/` (توليد المسارات حسب الملفات)، المكونات `components/`، الإضافات `plugins/`، مركبات `composables/`، المتاجر `stores/`، وملفات الترجمة `i18n/`.
  - `assets/`: أنماط وصور تتم معالجتها (يتم استيراد `assets/css/global.css`).
  - `public/`: ملفات ثابتة تُخدم كما هي.
- **اتفاقيات الصفحات والتخطيط**:
  - استخدم `<script setup lang="ts">` و`definePageMeta({ title, subtitle })` بمفاتيح i18n لاستخدامها في العنوان ومسارات التصفح.
  - التخطيط الافتراضي `app/layouts/default.vue` ينسق الهيكل (رأس، شريط جانبي، فُتات الخبز، إشعارات، زر للأعلى) ويتزامن مع RTL للعربية.
- **الإدارة الحالة**: استخدم Pinia في `app/stores` (المتجر الرئيسي `useAppStore`) لإدارة السمة، اللغة، وحالة التحميل.
- **الترجمة**: أضف المفاتيح إلى `app/i18n/en.json` و`app/i18n/ar.json` معًا، وتجنب النصوص الصلبة في الواجهات.
- **الملاحة**: أضف ملفات تحت `app/pages` لإنشاء مسارات جديدة، وحدث عناصر القائمة في `app/components/AppSidebar.vue` عند الحاجة.
- **جودة الكود**: اتبع ESLint الافتراضي، وحافظ على الأنواع في TypeScript للمركبات والمخازن والـ props.