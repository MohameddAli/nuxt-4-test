<template>
    <v-snackbar
      v-model="show"
      :color="isOnline ? 'success' : 'error'"
      :timeout="isOnline ? 3000 : -1"
      location="top"
    >
      <template v-slot:default>
        <v-icon
          :icon="isOnline ? 'mdi-wifi' : 'mdi-wifi-off'"
          class="mr-2"
        />
        {{ isOnline ? $t('network.restored') : $t('network.offline') }}
      </template>
      <template v-slot:actions>
        <v-btn
          v-if="!isOnline"
          color="white"
          variant="text"
          @click="retryConnection"
        >
          {{ $t('common.retry') }}
        </v-btn>
      </template>
    </v-snackbar>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  import { useNetworkStatus } from '~/composables/useNetworkStatus'
  
  const { isOnline } = useNetworkStatus()
  const show = ref(false)
  
  watch(isOnline, (newValue, oldValue) => {
    if (oldValue !== undefined) { // Skip initial value
      show.value = true
    }
  })
  
  const retryConnection = () => {
    // Trigger a refresh of the current page
    window.location.reload()
  }
  </script>