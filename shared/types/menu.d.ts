// types/menu.d.ts
export interface MenuItem {
    title: string
    icon?: string
    to?: string
    value: string
    permission?: string
    children?: MenuItem[]
    badge?: {
      text: string
      color: string
    }
  }