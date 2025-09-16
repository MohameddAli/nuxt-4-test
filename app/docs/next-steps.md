# Nuxt 4 Base Project – Next Steps & Feature Roadmap

A pragmatic, incremental plan to take this Nuxt 4 + Vuetify 3 base forward into a production-ready starter you can reuse for future projects.

## Goals
- Production-ready defaults: SSR-safe theming, i18n/RTL, robust API layer, auth scaffolding, testing, CI.
- Keep styling 100% in Vuetify (no custom CSS required beyond existing tokens).
- Centralize configuration and ensure clear conventions.

---

## Immediate (Week 0–1)

- [ ] Theme & Color Mode (SSR-safe)
  - Run the Cursor plan in `.cursor/darkmode-lightmode.mdc` (already added).
  - Install module: `npx nuxi module add @nuxtjs/color-mode`.
  - Files: `app/theme.ts`, `app/plugins/vuetify.ts` (sync with color mode), `app/composables/useAppTheme.ts`.
  - Wire the header toggle in `app/components/AppHeader.vue` (replace `noop`).

- [ ] Dependency hygiene
  - Remove Nuxt-internal or unused deps (avoid version drift & reduce size):
    ```bash
    npm rm vue vue-router vue-chartjs xlsx exceljs jspdf jspdf-autotable toastify-js
    ```
  - Ensure scopes: `vuetify` in `dependencies`; `eslint`, `vite-plugin-vuetify` in `devDependencies`.
  - Keep `chart.js` if you use `CryptoChart.vue`.

- [ ] API client composable (typed, with interceptors)
  - Create `app/composables/useApi.ts` using `$fetch`/`ofetch`:
    ```ts
    // app/composables/useApi.ts
    export function useApi() {
      const config = useRuntimeConfig()
      const token = useState<string | null>('auth_token', () => null)
      const baseURL = config.public.apiBase || '/api'

      async function request<T>(url: string, opts: any = {}): Promise<T> {
        const headers = new Headers(opts.headers || {})
        if (token.value) headers.set('Authorization', `Bearer ${token.value}`)
        try {
          return await $fetch<T>(url, { baseURL, headers, ...opts })
        } catch (err: any) {
          if (err?.status === 401) navigateTo('/login')
          throw err
        }
      }

      return { request, token }
    }
    ```
  - Add `runtimeConfig.public.apiBase` in `nuxt.config.ts`.

- [ ] Auth scaffold
  - Pages: `app/pages/login.vue`, `app/pages/logout.vue`.
  - Middleware: `app/middleware/auth.global.ts` to protect private routes (skip for public like `/login`).
  - Persist token in a safe store (`useState`/Pinia) and read by `useApi`.

- [ ] i18n polish
  - Extract any hardcoded strings into `app/i18n/*.json`.
  - Ensure `AppHeader` and layout keep HTML `lang`/`dir` synced (already mostly in place).

- [ ] Testing baseline
  - Install: `npm i -D vitest @vue/test-utils vue-tsc`.
  - Add 1–2 unit tests for `stores/app.ts` (date range), and a simple component test.
  - Script:
    ```json
    // package.json
    {
      "scripts": { "test": "vitest" }
    }
    ```

- [ ] CI (lint + test)
  - GitHub Actions workflow `.github/workflows/ci.yml` to run `npm ci`, `npm run lint`, `npm test`, and `nuxt build`.
  - Add Node engines + `.nvmrc` to pin Node version.

---

## Short Term (Week 2–4)

- [ ] Error handling & UX
  - Add `app/error.vue`, `app/layouts/error.vue`, and a friendly 404 page.
  - Global error boundary component for API/display errors.

- [ ] Form system
  - Standardize with `vee-validate` + `zod` schemas.
  - Create base inputs (wrappers for Vuetify fields) to unify validation states.

- [ ] Navigation single-source
  - Keep menu model in `app/stores/app.ts`; have `AppSidebar.vue` consume it (avoid duplication).

- [ ] Accessibility pass (A11y)
  - Keyboard nav, focus styles, `aria-*` on menus/overlays, color contrast in dark theme.

- [ ] Performance
  - Audit images with `@nuxt/image` presets.
  - Code-split heavy components; wrap chart and other client-only widgets with `ClientOnly`.
  - Add `routeRules` for caching of public pages.

- [ ] E2E testing
  - Add Playwright: critical flows (auth, navigation, form submit).

- [ ] Documentation & DX
  - Developer onboarding doc: commands, env setup, conventions.
  - Consider Storybook/Histoire for isolated component docs (optional if keeping footprint small).

---

## Medium Term (Month 2–3)

- [ ] Observability & Analytics
  - Sentry (client + server) or an alternative for error tracking.
  - Analytics hook (e.g., Plausible) with a composable to track page/CTA events.

- [ ] Security & Hardening
  - CSP headers via Nitro/middleware.
  - Input sanitization, rate limiting for server routes.
  - Secrets handling via `.env` and `runtimeConfig` (never commit secrets).

- [ ] API schema contracts
  - Zod schemas for request/response; infer TypeScript types for `useApi` responses.
  - Optional: OpenAPI generator or tRPC if you own the backend.

- [ ] Feature flags
  - Simple flags via `runtimeConfig.public.flags` or a tiny SDK wrapper.

- [ ] Release & Versioning
  - Conventional commits, `changesets` (optional) for release notes.
  - PR templates, issue templates, CODEOWNERS.

---

## Conventions (keep unified)

- Directories
  - `srcDir: 'app'` (already set). Use `~/` alias for imports.
  - Components in `app/components`, pages in `app/pages`, stores in `app/stores`.

- Naming & typing
  - `<script setup lang="ts">` everywhere; typed props/emit.
  - Clear function names; avoid ambiguous abbreviations.

- State
  - Pinia for cross-page state; local component state stays local.
  - Persist only what’s necessary (locale, theme, date range, auth token).

- Styling
  - Rely on Vuetify tokens and theme; avoid ad-hoc CSS. Keep `app/assets/css/global.css` minimal and token-based.

---

## Checklist (copy/paste)

- [ ] Run `.cursor/darkmode-lightmode.mdc` and `npx nuxi module add @nuxtjs/color-mode`
- [ ] Clean dependencies and scopes
- [ ] Add `useApi` composable + `runtimeConfig.public.apiBase`
- [ ] Implement auth pages + middleware
- [ ] Extract strings to i18n
- [ ] Add Vitest + a couple of unit tests
- [ ] Add CI workflow, engines, and Node version file
- [ ] Add error pages and error boundary
- [ ] Standardize forms (vee-validate + zod) and base field wrappers
- [ ] Accessibility pass
- [ ] Performance optimizations and route rules
- [ ] Playwright e2e baseline
- [ ] Observability, analytics, security headers (as needed)
- [ ] API schema contracts, feature flags, release process

---

## References
- Nuxt 4 docs: https://nuxt.com
- Vuetify 3: https://vuetifyjs.com
- VeeValidate + Zod: https://vee-validate.logaretm.com + https://zod.dev
- Playwright: https://playwright.dev
- Sentry Nuxt: https://docs.sentry.io/platforms/javascript/guides/nuxt/
