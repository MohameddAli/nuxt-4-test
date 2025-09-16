import { defineStore } from 'pinia'

export interface NavigationItem {
  title: string
  icon: string
  to?: string
  children?: NavigationItem[]
  divider?: boolean
}

export const useAppStore = defineStore('app', () => {
  // State
  const sidebarOpen = ref(true)
  const sidebarMini = ref(false)
  const currentLocale = ref('en')
  const isLoading = ref(false)
  const isSearchOpen = ref(false)
  // Date range persisted selection (ISO strings: YYYY-MM-DD)
  const dateRange = ref<{ start: string | null; end: string | null }>({ start: null, end: null })

  // Navigation items
  const navigationItems = ref<NavigationItem[]>([
    {
      title: 'Overview',
      icon: 'mdi-view-dashboard',
      to: '/'
    },
    {
      title: 'Chat',
      icon: 'mdi-chat',
      to: '/chat'
    },
    {
      title: 'Cards',
      icon: 'mdi-credit-card',
      to: '/cards'
    },
    {
      title: 'Customers',
      icon: 'mdi-account-group',
      to: '/customers'
    },
    {
      title: 'Movies',
      icon: 'mdi-movie',
      to: '/movies'
    },
    { divider: true, title: '', icon: '' },
    {
      title: 'Support',
      icon: 'mdi-help-circle',
      to: '/support'
    },
    {
      title: 'Settings',
      icon: 'mdi-cog',
      to: '/settings'
    }
  ])

  // Getters
  const filteredNavigationItems = computed(() => navigationItems.value)

  // Start Helpers for date range
  const toIsoDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const normalizeToIso = (value: string | Date | null | undefined): string | null => {
    if (!value) return null
    if (value instanceof Date) return toIsoDate(value)
    // assume string like YYYY-MM-DD
    return value
  }

  const formattedDateRange = computed(() => {
    const { start, end } = dateRange.value
    if (!start || !end) return ''
    const locale = currentLocale.value === 'ar' ? 'ar-EG' : 'en-US'
    const formatter = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' })
    return `${formatter.format(new Date(start))} - ${formatter.format(new Date(end))}`
  })
  // End Helpers for date range
  

  // Actions
  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
  }

  const toggleSidebarMini = () => {
    sidebarMini.value = !sidebarMini.value
  }

  const setSidebarOpen = (value: boolean) => {
    sidebarOpen.value = value
  }

  const setSidebarMini = (value: boolean) => {
    sidebarMini.value = value
  }

  

  const setLocale = (locale: string) => {
    currentLocale.value = locale
    if (process.client) {
      localStorage.setItem('locale', locale)
    }
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }
  // Start for date range
  const setDateRange = (range: { start: string | Date | null; end: string | Date | null }) => {
    const startIso = normalizeToIso(range.start)
    const endIso = normalizeToIso(range.end)
    // Ensure start <= end if both present
    if (startIso && endIso) {
      const startDate = new Date(startIso)
      const endDate = new Date(endIso)
      const [minDate, maxDate] = startDate <= endDate ? [startDate, endDate] : [endDate, startDate]
      dateRange.value = { start: toIsoDate(minDate), end: toIsoDate(maxDate) }
    } else {
      dateRange.value = { start: startIso, end: endIso }
    }
    if (process.client) {
      localStorage.setItem('dateRange', JSON.stringify(dateRange.value))
    }
  }

  const clearDateRange = () => {
    dateRange.value = { start: null, end: null }
    if (process.client) localStorage.removeItem('dateRange')
  }
  // End for date range
// Start Lighybox Search
  const openSearch = () => {
    isSearchOpen.value = true
  }

  const closeSearch = () => {
    isSearchOpen.value = false
  }

  const toggleSearch = () => {
    isSearchOpen.value = !isSearchOpen.value
  }
// End Lighybox Search

  // Initialize locale on client side
  const initializeApp = () => {
    if (process.client) {
      const savedLocale = localStorage.getItem('locale')
      if (savedLocale) {
        currentLocale.value = savedLocale
      }
      // Start for date range
      const savedRange = localStorage.getItem('dateRange')
      if (savedRange) {
        try {
          const parsed = JSON.parse(savedRange) as { start?: string | null; end?: string | null }
          dateRange.value.start = parsed?.start ?? null
          dateRange.value.end = parsed?.end ?? null
        } catch {
          // ignore invalid JSON
        }
      }
      // Default to current month if nothing selected
      if (!dateRange.value.start || !dateRange.value.end) {
        const today = new Date()
        const start = new Date(today.getFullYear(), today.getMonth(), 1)
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        dateRange.value = {
          start: toIsoDate(start),
          end: toIsoDate(end)
        }
        localStorage.setItem('dateRange', JSON.stringify(dateRange.value))
      }
      // End for date range
    }
  }

  // Persist locale is handled in setLocale; no extra watcher needed

  return {
    // State
    sidebarOpen,
    sidebarMini,
    currentLocale,
    isLoading,
    isSearchOpen,
    dateRange,
    navigationItems,
    
    // Getters
    filteredNavigationItems,
    formattedDateRange,
    
    // Actions
    toggleSidebar,
    toggleSidebarMini,
    setSidebarOpen,
    setSidebarMini,
    setLocale,
    setLoading,
    setDateRange,
    clearDateRange,
    openSearch,
    closeSearch,
    toggleSearch,
    initializeApp
  }
})