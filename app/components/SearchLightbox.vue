<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="appStore.isSearchOpen"
        class="search-overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="$t('search.title')"
        @keydown.esc.prevent="handleClose"
      >
        <div class="search-container" @click.stop>
          <div class="search-header">
            <v-text-field
              v-model="query"
              :placeholder="$t('search.placeholder')"
              variant="solo"
              density="comfortable"
              clearable
              prepend-inner-icon="mdi-magnify"
              hide-details
              autofocus
              @update:model-value="handleQueryChange"
              @keydown.enter.prevent="handleSubmit"
              :aria-label="$t('search.inputAria')"
            />

            <div class="kbd-hints">
              <span class="kbd">Esc</span>
              <span class="hint">{{ $t('search.close') }}</span>
            </div>
          </div>

          <div class="search-results" :class="{ empty: !hasResults }">
            <template v-if="hasResults">
              <v-list lines="two" density="comfortable">
                <v-list-item
                  v-for="item in filteredResults"
                  :key="item.id"
                  @click="handleSelect(item)"
                  class="result-item"
                >
                  <template #prepend>
                    <v-icon class="me-2" v-if="item.icon">{{ item.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                  <v-list-item-subtitle v-if="item.subtitle">{{ item.subtitle }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </template>
            <template v-else>
              <div class="empty-state">
                <v-icon size="40" class="mb-3">mdi-text-search</v-icon>
                <p class="text-body-2">{{ $t('search.empty') }}</p>
              </div>
            </template>
          </div>

          <div class="search-footer">
            <div class="hint-group">
              <span class="kbd">Enter</span>
              <span class="hint">{{ $t('search.open') }}</span>
            </div>
            <div class="hint-group">
              <span class="kbd">↑</span>
              <span class="kbd">↓</span>
              <span class="hint">{{ $t('search.navigate') }}</span>
            </div>
          </div>
        </div>

        <div class="backdrop" @click="handleClose" />
      </div>
    </transition>
  </Teleport>
  </template>

<script setup lang="ts">
import { useAppStore } from '~/stores/app'

type SearchItem = {
  id: string | number
  title: string
  subtitle?: string
  icon?: string
  to?: string
  action?: () => void
}

const emit = defineEmits<{
  (e: 'submit', value: string): void
  (e: 'select', item: SearchItem): void
  (e: 'change', value: string): void
}>()

const props = defineProps<{
  items?: SearchItem[]
}>()

const appStore = useAppStore()
const query = ref('')

const filteredResults = computed<SearchItem[]>(() => {
  const list = props.items ?? []
  const q = query.value.trim().toLowerCase()
  if (!q) return list.slice(0, 5)
  return list.filter(i => i.title.toLowerCase().includes(q) || i.subtitle?.toLowerCase().includes(q)).slice(0, 10)
})

const hasResults = computed(() => filteredResults.value.length > 0)

const handleClose = () => {
  appStore.closeSearch()
  query.value = ''
}

const handleSubmit = () => {
  emit('submit', query.value)
}

const handleSelect = (item: SearchItem) => {
  if (item.action) item.action()
  else if (item.to) navigateTo(item.to)
  emit('select', item)
  handleClose()
}

const handleQueryChange = (val: string) => emit('change', val)

onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      appStore.toggleSearch()
    }
  }
  window.addEventListener('keydown', handler)
  onBeforeUnmount(() => window.removeEventListener('keydown', handler))
})
</script>

<style scoped>
.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
}

.backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px);
}

.search-container {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 10vh auto 0;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), 0.2);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.search-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.kbd-hints { display: flex; align-items: center; gap: 8px; }
.kbd {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 6px;
  border: 1px solid rgba(var(--v-border-color), 0.5);
  background: rgba(var(--v-theme-surface-variant), 0.5);
}
.hint { font-size: 12px; opacity: 0.7; }

.search-results { max-height: 50vh; overflow: auto; }
.search-results.empty { padding: 32px; text-align: center; }
.empty-state { color: rgba(var(--v-theme-on-surface), 0.7); }

.search-footer {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid rgba(var(--v-border-color), 0.15);
}

.hint-group { display: flex; align-items: center; gap: 8px; }

.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 600px) {
  .search-container { margin: 5vh 16px 0; }
}
</style>


