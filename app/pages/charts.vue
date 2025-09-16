<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-card class="mb-6">
            <v-card-title class="text-h4 font-weight-bold primary--text">
              {{ $t('pages.charts.title') }}
            </v-card-title>
            <v-card-subtitle class="text-body-1">
              {{ $t('pages.charts.subtitle') }}
            </v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>
      
      <ChartDashboard />
    </v-container>
  </div>
</template>

<script setup lang="ts">
import ChartDashboard from '~/components/charts/examples/ChartDashboard.vue'

definePageMeta({
  title: 'pages.charts.title',
  subtitle: 'pages.charts.subtitle'
})
</script>

<style scoped>
/* Charts page specific styles */
</style>
