### UserProfileMenu.vue

Reusable user profile dropdown with avatar, name/role, and action items.

Path: `app/components/user/UserProfileMenu.vue`

Props:
- `name?: string` default: `"Robin Jivan"`
- `role?: string` default: `"Admin"`
- `avatar?: string` default: Vuetify sample image
- `avatarAlt?: string` default: `"User avatar"`
- `showUserInfo?: boolean` default: `true`
- `items?: { title: string; icon: string; action: () => void }[]` optional; if omitted, a default set is used (Profile, Settings, Help, Logout)
- `location?: 'bottom end' | 'bottom start' | 'top end' | 'top start'` default: `'bottom end'`
- `offset?: [number, number]` default: `[0, 8]`
- `avatarSize?: number | string` default: `32`
- `btnVariant?: 'text' | 'elevated' | 'flat' | 'tonal' | 'outlined' | 'plain'` default: `'text'`

Emits:
- `navigate` with `to: string` when default items are used
- `logout` when Logout is clicked (default items)

Basic usage:
```vue
<script setup lang="ts">
import UserProfileMenu from '~/components/user/UserProfileMenu.vue'
const handleLogout = () => {/* call your auth logout */}
const handleNavigate = (to: string) => navigateTo(to)
</script>

<template>
  <UserProfileMenu
    name="Jane Doe"
    role="Owner"
    avatar="/images/avatar.png"
    @logout="handleLogout"
    @navigate="handleNavigate"
  />
</template>
```

Custom items menu:
```vue
<script setup lang="ts">
import UserProfileMenu from '~/components/user/UserProfileMenu.vue'
type MenuItem = { title: string; icon: string; action: () => void }
const items: MenuItem[] = [
  { title: 'My Team', icon: 'mdi-account-group', action: () => navigateTo('/team') },
  { title: 'Billing', icon: 'mdi-credit-card-outline', action: () => navigateTo('/billing') },
  { title: 'Sign out', icon: 'mdi-logout', action: () => {/* call auth */} },
]
</script>

<template>
  <UserProfileMenu :items="items" show-user-info="false" />
</template>
```

Notes:
- Keep user identity values in a store (e.g., `useAuth` or `useUserStore`) and pass as props here. The component is stateless and purely presentational/behavioral.
- Styling matches `AppHeader.vue` so replacement is drop-in.


