// import this after install `@mdi/font` package
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'
import { createVuetify, type ThemeDefinition } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { watchEffect } from 'vue'
import { lightTheme, darkTheme } from '~/theme'

// Nuxt auto-imports this via @nuxtjs/color-mode at runtime; declare to satisfy TS during linting
declare function useColorMode(): any

export default defineNuxtPlugin((nuxtApp) => {
  const colorMode = useColorMode()

  const vuetify = createVuetify({
    locale: {
      // Enable RTL for Arabic so Vuetify mirrors components automatically
      rtl: { ar: true },
    },
    theme: {
      defaultTheme: colorMode && colorMode.value === 'dark' ? 'dark' : 'light',
      themes: {
        light: lightTheme as ThemeDefinition,
        dark: darkTheme as ThemeDefinition,
      },
    },
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: { mdi },
    },
    display: {
      mobileBreakpoint: 'sm',
      thresholds: { xs: 0, sm: 600, md: 960, lg: 1280, xl: 1920 },
    },
  })

  // Reactively keep Vuetify theme in sync with color mode
  watchEffect(() => {
    vuetify.theme.global.name.value = colorMode.value === 'dark' ? 'dark' : 'light'
  })

  nuxtApp.vueApp.use(vuetify)
})
