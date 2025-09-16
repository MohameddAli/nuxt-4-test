<template>
  <v-snackbar
    v-model="snackbarState.show"
    :timeout="snackbarState.timeout"
    :color="snackbarColor"
    :location="snackbarState.position"
    :closable="snackbarState.closable"
    elevation="6"
    class="global-snackbar"
    @update:model-value="handleSnackbarUpdate"
  >
    <div class="d-flex align-center">
      <v-icon
        v-if="snackbarState.icon"
        :icon="snackbarState.icon"
        class="me-3"
        size="20"
      />
      
      <span class="snackbar-message">
        {{ snackbarState.message }}
      </span>
    </div>

    <!-- Custom Actions -->
    <template v-slot:actions v-if="snackbarState.actions.length > 0">
      <v-btn
        v-for="(action, index) in snackbarState.actions"
        :key="index"
        :color="action.color || 'white'"
        variant="text"
        size="small"
        @click="handleActionClick(action)"
      >
        {{ action.label }}
      </v-btn>
    </template>

    <!-- Default Close Button -->
    <template v-slot:actions v-else-if="snackbarState.closable">
      <v-btn
        color="white"
        variant="text"
        size="small"
        icon="mdi-close"
        @click="hideSnackbar"
      />
    </template>
  </v-snackbar>
</template>

<script setup>
import { computed } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'

const { snackbarState, hideSnackbar } = useSnackbar()

// Compute the snackbar color based on type
const snackbarColor = computed(() => {
  const colorMap = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info'
  }
  return colorMap[snackbarState.type] || 'info'
})

// Handle snackbar visibility changes (including auto-hide)
const handleSnackbarUpdate = (value) => {
  if (!value) {
    // When snackbar is hidden (either manually or by timeout), clean up
    setTimeout(() => {
      snackbarState.message = ''
      snackbarState.actions = []
    }, 100) // Small delay to avoid conflicts
  }
}

// Handle action button clicks
const handleActionClick = (action) => {
  action.handler()
  hideSnackbar()
}
</script>

<style scoped>
.global-snackbar {
  z-index: 9999;
}

.snackbar-message {
  flex: 1;
  word-break: break-word;
  line-height: 1.4;
}

/* RTL Support */
:deep(.v-snackbar__content) {
  direction: inherit;
}

/* Custom styling for different types */
:deep(.v-snackbar--variant-elevated.bg-success) {
  background: rgb(var(--v-theme-success)) !important;
}

:deep(.v-snackbar--variant-elevated.bg-error) {
  background: rgb(var(--v-theme-error)) !important;
}

:deep(.v-snackbar--variant-elevated.bg-warning) {
  background: rgb(var(--v-theme-warning)) !important;
}

:deep(.v-snackbar--variant-elevated.bg-info) {
  background: rgb(var(--v-theme-info)) !important;
}
</style> 