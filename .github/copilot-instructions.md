# Copilot Instructions (Nuxt 4 + Vuetify + Pinia)

Goal: Enable fast, correct contributions using existing patterns; avoid re‑inventing data, state, or UI layers.

## Architecture

- `srcDir: 'app'`; treat `app/` as root for pages, components, layouts, stores, composables, assets, middleware, i18n.
- Core stacks: Nuxt 4, Vuetify 3 (inline vite plugin), Pinia, `@nuxtjs/i18n`, Color Mode, Chart.js.
- Cross‑cutting logic lives in composables (`app/composables/*`); shared pure helpers/typedefs in `shared/`.
- Server endpoints: add under `server/api/name.method.ts` (Nitro auto routing) and consume only via `useApi()`.

## Data & API

- Always call HTTP through `useApi()` (SSR-safe GET via `get()`, mutations with `useMutation().mutate()`).
- 401/403/network/5xx handled centrally (`handleApiError`); let 400 bubble to the component for form-level UX.
- Never hardcode full URLs—use `runtimeConfig.public.apiBaseUrl`.

## State & Reactivity

- Use Pinia stores for global UI/auth/loading; access with composable imports (Nuxt auto-import). Guard browser storage with `process.client`.
- Date ranges: normalize order before storing (mirror existing pattern) to keep downstream logic simple.

## UI & Components

- Prefer `<script setup lang="ts">`; migrate JS when touched.
- Reusable table (`components/ReusableTable.vue`): extend via slots, not internal prop reshaping.
- Charts: `chart.js` only; wrap heavy logic in `onMounted` / `<ClientOnly>`.
- Navigation: single source (store) → sidebar component; don’t duplicate arrays.

## i18n & Theming

- Extract ALL visible strings to `app/i18n/locales/*`; Arabic locale has `dir: 'rtl'` (let i18n drive RTL, do not force CSS direction per component).
- Theme: use existing Color Mode + Vuetify theme service; if adding a toggle, persist consistently (no parallel mechanisms).

## Loading & Feedback

- Wrap async work with `useLoading().withLoading(fn, { text })` or manual `startLoading()` control; do not mutate loading store state directly.
- Use `useSnackbar()` for user notifications; pass translation keys not raw text.

## Performance & SSR

- Guard `window`, `localStorage`, visual-only libs with `process.client`.
- Lazy import large optional components with `defineAsyncComponent`.

## PR Safety Checklist

1. Follow existing composable/store (no duplicate helpers).
2. No raw `$fetch` in components/pages (except justified edge case documented in PR).
3. All new strings localized; RTL-friendly.
4. No direct localStorage outside designated stores/composables.
5. SSR safety: no browser globals at top-level.

## Commands

```bash
pnpm dev       # dev server
pnpm build     # production build
pnpm generate  # static generation
pnpm preview   # preview build
```

Unsure? Search for similar `useX` composable and mirror pattern before adding new abstractions.
