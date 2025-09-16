# Features TODO - Authentication, Authorization & Notifications

## 🔐 Authentication System

### Phase 1: Core Authentication (High Priority)

- [ ] **Complete `useAuth` composable** (`app/composables/useAuth.ts`)

  - [ ] Login function with JWT token handling
  - [ ] Logout function with cleanup
  - [ ] Auto-logout on token expiry

- [ ] **Implement `auth` store** (`app/stores/auth.ts`)

  - [ ] User profile data
  - [ ] Authentication state
  - [ ] Token storage (localStorage) i only use access_token without refresh token
  - [ ] User permissions/roles
  - [ ] Profile update actions - only ui part and use only vuetify 3 components without css classes

- [ ] **Complete auth middleware** (`app/middleware/auth.global.ts`)

  - [ ] Route protection logic
  - [ ] Redirect handling (save intended route)
  - [ ] Public/private route detection
  - [ ] Role-based route access

- [ ] **Auth API endpoints** (`server/api/auth/`)
  - [ ] `login.post.ts` - User login
  - [ ] `logout.post.ts` - User logout
  - [ ] `verify.get.ts` - Token verification
  - [ ] `reset-password.post.ts` - Password reset
  - [ ] `change-password.post.ts` - Change password

## 👤 User Profile System

### Phase 1: Basic Profile (High Priority)

- [ ] **Profile page** (`app/pages/profile.vue`)

  - [ ] Personal information display ui only using vuetify 3 components only without css
  - [ ] Avatar upload/change ui only using vuetify 3 components only without css
  - [ ] Basic settings (name, email, phone) ui only using vuetify 3 components only without css
  - [ ] Password change form ui only using vuetify 3 components only without css

## 🔑 Authorization & Permissions System

### Phase 1: Role-Based Access Control (RBAC)

- [ ] **Permissions system**

  - [ ] Define permission constants (`shared/types/permissions.ts`)
  - [ ] Role definitions (`admin`, `user`, `moderator`)
  - [ ] Permission-role mapping
  - [ ] Dynamic permission checking

- [ ] **Authorization middleware** (`app/middleware/permission.ts`)

  - [ ] Page-level permission checking
  - [ ] Component-level permission directives
  - [ ] API endpoint protection
  - [ ] Redirect unauthorized users

- [ ] **Permission composable** (`app/composables/usePermissions.ts`)
  - [ ] Check user permissions
  - [ ] Check user roles
  - [ ] Dynamic menu/UI rendering based on permissions
  - [ ] Permission-based component visibility

### Phase 2: Advanced Authorization (Low Priority)

- [ ] **Granular Permissions**
  - [ ] Resource-based permissions
  - [ ] Dynamic permission assignment
  - [ ] Permission inheritance
  - [ ] Temporary permissions with expiry

## 🔔 Comprehensive Notifications System

### Phase 1: Core Notification System (High Priority)

- [ ] **Enhance `useSnackbar` composable** (`app/composables/useSnackbar.ts`)

  - [ ] Notification queue management
  - [ ] Duplicate detection and prevention
  - [ ] Auto-dismiss with customizable timing
  - [ ] Persistent notifications for critical errors
  - [ ] Notification history storage

- [ ] **Notification store** (`app/stores/notifications.ts`)

  - [ ] Active notifications array
  - [ ] Notification history
  - [ ] Dismissal management
  - [ ] Notification preferences
  - [ ] Seen/unseen status tracking

- [ ] **Network status notifications**
  - [ ] Online/offline detection (`app/composables/useNetworkStatus.ts`)
  - [ ] Connection quality monitoring
  - [ ] Auto-retry failed requests when back online
  - [ ] Offline mode indicator
  - [ ] Sync pending actions when reconnected

### Phase 2: Advanced Notifications (High Priority)

- [ ] **Error handling notifications**

  - [ ] API error categorization and specific messages
  - [ ] Form validation error display
  - [ ] File upload error notifications
  - [ ] Database connection errors
  - [ ] Server maintenance notifications

- [ ] **Session management notifications**

  - [ ] Session expiry warnings (5 min, 1 min before)
  - [ ] Auto-logout countdown
  - [ ] Session extended notification
  - [ ] Multiple device login alerts
  - [ ] Forced logout from admin

- [ ] **Real-time notifications**
  - [ ] WebSocket connection for live updates
  - [ ] In-app notification center
  - [ ] Push notification support (PWA)
  - [ ] Email notification integration
  - [ ] SMS notification support

### Phase 3: Notification Enhancements (Medium Priority)

- [ ] **Notification types and styling**

  - [ ] Success notifications (green)
  - [ ] Warning notifications (yellow/orange)
  - [ ] Error notifications (red)
  - [ ] Info notifications (blue)
  - [ ] Loading notifications with progress

- [ ] **Smart notification management**

  - [ ] Rate limiting to prevent spam
  - [ ] Grouping similar notifications
  - [ ] Batch notifications for bulk operations
  - [ ] User preferences for notification types
  - [ ] Do not disturb mode

- [ ] **Notification actions**
  - [ ] Actionable notifications (Undo, Retry, etc.)
  - [ ] Deep linking from notifications
  - [ ] Notification sound customization
  - [ ] Desktop notifications (when supported)

## 🛠️ Implementation Guidelines

### File Structure

```
app/
├── composables/
│   ├── useAuth.ts ✅ (exists, needs completion)
│   ├── useProfile.ts (create)
│   ├── usePermissions.ts (create)
│   ├── useNotifications.ts (enhance existing useSnackbar)
│   └── useNetworkStatus.ts ✅ (exists)
├── stores/
│   ├── auth.ts (create)
│   ├── profile.ts (create)
│   └── notifications.ts (create)
├── middleware/
│   ├── auth.global.ts ✅ (exists, needs implementation)
│   ├── auth.ts ✅ (exists, needs implementation)
│   ├── guest.ts ✅ (exists, needs implementation)
│   └── permission.ts ✅ (exists, needs implementation)
├── pages/
│   ├── login.vue (create)
│   ├── register.vue (create)
│   ├── profile.vue (create)
│   └── unauthorized.vue ✅ (exists)
└── components/
    ├── auth/
    │   ├── LoginForm.vue (create)
    │   ├── RegisterForm.vue (create)
    │   └── ProfileForm.vue (create)
    └── notifications/
        ├── NotificationCenter.vue (create)
        ├── NotificationItem.vue (create)
        └── NetworkStatus.vue (create)

server/api/
├── auth/
│   ├── login.post.ts (create)
│   ├── logout.post.ts (create)
│   ├── refresh.post.ts (create)
│   └── verify.get.ts (create)
├── profile/
│   ├── index.get.ts (create)
│   ├── index.put.ts (create)
│   └── avatar.post.ts (create)
└── notifications/
    ├── index.get.ts (create)
    └── mark-read.post.ts (create)

shared/
├── types/
│   ├── auth.ts (create)
│   ├── profile.ts (create)
│   ├── permissions.ts (create)
│   └── notifications.ts (create)
└── utils/
    ├── auth.ts (create)
    ├── permissions.ts (create)
    └── notifications.ts (create)
```

### Technical Requirements

- Use existing `useApi` composable for all HTTP calls
- Follow existing `useLoading` pattern for async operations
- Integrate with i18n for all user-facing messages
- Use Zod for validation schemas
- Follow existing Pinia store patterns
- Ensure RTL support for Arabic users
- Maintain SSR compatibility with `process.client` guards
- Use TypeScript for type safety

### Testing Strategy

- Unit tests for composables and utilities
- Integration tests for auth flow
- E2E tests for critical user journeys
- Security testing for auth endpoints
- Network failure simulation testing

---

## Priority Implementation Order

1. **Core Authentication** - Essential for app security
2. **Comprehensive Notifications** - Critical for UX
3. **Basic User Profile** - Core user functionality
4. **Authorization & Permissions** - Security and access control
5. **Advanced Features** - Enhancement and polish

Each phase should be completed and tested before moving to the next.
