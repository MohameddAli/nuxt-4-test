### GlobalSearchInput.vue

Reusable search input that opens the global Search Lightbox and emits updates.

Path: `app/components/search/GlobalSearchInput.vue`

Props:
- `modelValue?: string` two-way bound value
- `placeholder?: string` fallback: i18n `header.searchPlaceholder`
- `ariaLabel?: string` fallback: i18n `header.openSearch`
- `icon?: string` default: `mdi-magnify`
- `density?: 'compact' | 'comfortable' | 'default'` default: `compact`
- `variant?: 'outlined' | 'filled' | 'solo' | 'underlined' | 'plain'` default: `outlined`
- `maxWidth?: number | string` default: `400`
- `readonly?: boolean` default: `true`
- `openOnClick?: boolean` default: `true`
- `openOnEnter?: boolean` default: `true`

Emits:
- `update:modelValue` when user types
- `open` with source `'click' | 'enter'`

Behavior:
- Calls `useAppStore().openSearch()` when opened. Works with existing `SearchLightbox.vue` which is mounted in `app/layouts/default.vue`.

Basic usage:
```vue
<script setup lang="ts">
import GlobalSearchInput from '~/components/search/GlobalSearchInput.vue'
const search = ref('')
</script>

<template>
  <GlobalSearchInput v-model="search" />
  <!-- Ensure SearchLightbox is present in your layout or page -->
  <!-- <SearchLightbox :items="items" @submit="..." /> -->
  <v-btn @click="() => useAppStore().openSearch()">Open Search</v-btn>
  <!-- Provide items from page or computed if needed -->
  <!-- See default.vue for example of global items -->
  <!-- <SearchLightbox :items="myItems" /> -->
  
  <!-- Optional customization -->
  <!-- <GlobalSearchInput :variant="'solo'" :density="'comfortable'" :max-width="600" /> -->
  
  
  
  
  
</template>
```

Notes:
- The actual result list and keyboard shortcuts live in `SearchLightbox.vue`.
- You can drop `GlobalSearchInput` in any page/section. As long as the lightbox component exists (e.g., in the default layout), it will open and use the provided items.


