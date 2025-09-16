// Nuxt auto-imports this via @nuxtjs/color-mode at runtime; declare to satisfy TS during linting
declare function useColorMode(): any

export const useAppTheme = () => {
  const colorMode = useColorMode()
  const isDark = computed(() => colorMode.value === 'dark')

  const toggle = () => {
    colorMode.preference = isDark.value ? 'light' : 'dark'
  }

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    colorMode.preference = theme
  }

  return { isDark, toggle, setTheme }
}


