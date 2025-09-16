<template>
  <v-text-field
    :model-value="inputValue"
    :placeholder="resolvedPlaceholder"
    :prepend-inner-icon="icon"
    :variant="variant"
    :density="density"
    :hide-details="true"
    :single-line="true"
    class="cursor-pointer"
    :style="maxWidthStyle"
    :readonly="readonly"
    :aria-label="resolvedAriaLabel"
    tabindex="0"
    @click="handleOpenIfEnabled('click')"
    @keydown.enter.prevent="handleOpenIfEnabled('enter')"
    @update:model-value="handleUpdate"
  />
</template>

<script setup lang="ts">
import { useAppStore } from '~/stores/app'

type Density = 'compact' | 'comfortable' | 'default'
type Variant = 'outlined' | 'filled' | 'solo' | 'underlined' | 'plain'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  ariaLabel?: string
  icon?: string
  density?: Density
  variant?: Variant
  maxWidth?: string | number
  readonly?: boolean
  openOnClick?: boolean
  openOnEnter?: boolean
}>(), {
  icon: 'mdi-magnify',
  density: 'compact',
  variant: 'outlined',
  maxWidth: '400px',
  readonly: true,
  openOnClick: true,
  openOnEnter: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'open', source: 'click' | 'enter'): void
}>()

const { t } = useI18n()
const appStore = useAppStore()

const localValue = ref(props.modelValue ?? '')
watch(() => props.modelValue, (v) => {
  if (v === undefined) return
  localValue.value = v ?? ''
})

const inputValue = computed(() => props.modelValue ?? localValue.value)
const resolvedPlaceholder = computed(() => props.placeholder ?? t('header.searchPlaceholder'))
const resolvedAriaLabel = computed(() => props.ariaLabel ?? t('header.openSearch'))

const maxWidthStyle = computed(() => ({ maxWidth: typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth }))

const handleUpdate = (val: string) => {
  localValue.value = val
  emit('update:modelValue', val)
}

const openLightbox = (source: 'click' | 'enter') => {
  appStore.openSearch()
  emit('open', source)
}

const handleOpenIfEnabled = (source: 'click' | 'enter') => {
  if (source === 'click' && !props.openOnClick) return
  if (source === 'enter' && !props.openOnEnter) return
  openLightbox(source)
}
</script>

<style scoped>
/* Inherit styling from parent context; keep component minimal */
</style>


