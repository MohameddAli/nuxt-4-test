```vue
<template>
  <v-alert
    v-if="show"
    type="error"
    variant="tonal"
    closable
    class="mb-4"
  >
    <template v-slot:prepend>
      <v-icon icon="mdi-wifi-off" />
    </template>
    {{ $t('errors.network') }}
    <template v-slot:append>
      <v-btn
        color="error"
        variant="text"
        @click="retry"
      >
        {{ $t('common.retry') }}
      </v-btn>
    </template>
  </v-alert>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['retry'])

const retry = () => {
  emit('retry')
}
</script>
```