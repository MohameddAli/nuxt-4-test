<template>
  <NuxtLayout>
    <!-- Global Loading Overlay - Single instance -->
    <LoadingOverlay />
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import LoadingOverlay from "~/components/ui/LoadingOverlay.vue";
</script>
