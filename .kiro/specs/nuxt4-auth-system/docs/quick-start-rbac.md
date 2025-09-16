# Quick Start: Role-Based Access Control (RBAC)

## 🚀 5-Minute RBAC Setup

Implement role-based access control in your Nuxt 4 app quickly and securely!

## Step 1: Understanding RBAC Concepts

### Roles vs Permissions

- **Roles**: Groups of permissions (e.g., 'admin', 'editor', 'viewer')
- **Permissions**: Specific actions (e.g., 'users.view', 'posts.create', 'settings.edit')

### User Structure

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  roles: string[]; // ['admin', 'editor']
  permissions: string[]; // ['users.view', 'posts.create']
}
```

## Step 2: Basic Permission Checking

### In Components

```vue
<template>
  <div>
    <!-- Show content based on permissions -->
    <div v-if="canViewUsers">
      <h2>Users List</h2>
      <!-- Users content -->
    </div>

    <!-- Show buttons based on permissions -->
    <v-btn v-if="canCreatePosts" @click="createPost"> Create Post </v-btn>

    <!-- Show admin panel for admins only -->
    <AdminPanel v-if="isAdmin" />
  </div>
</template>

<script setup>
// Using Pinia Store Approach
const authStore = useAuthStore();
const { hasPermission, hasRole } = authStore;

// Using Composable-Only Approach
// const { hasPermission, hasRole } = useAuth()

// Check specific permissions
const canViewUsers = hasPermission("users.view");
const canCreatePosts = hasPermission("posts.create");

// Check roles
const isAdmin = hasRole("admin");
</script>
```

### In Composables

```typescript
// composables/useUserPermissions.ts
export const useUserPermissions = () => {
  const { hasPermission, hasRole, hasAnyPermission } = useAuth();

  // Specific permission checks
  const canManageUsers = () => hasPermission("users.manage");
  const canViewReports = () => hasPermission("reports.view");
  const canEditSettings = () => hasPermission("settings.edit");

  // Role checks
  const isAdmin = () => hasRole("admin");
  const isEditor = () => hasRole("editor");
  const isModerator = () => hasRole("moderator");

  // Complex permission logic
  const canAccessAdminPanel = () => {
    return (
      isAdmin() ||
      hasAnyPermission(["users.manage", "settings.edit", "reports.view"])
    );
  };

  return {
    canManageUsers,
    canViewReports,
    canEditSettings,
    isAdmin,
    isEditor,
    isModerator,
    canAccessAdminPanel,
  };
};
```

## Step 3: Route Protection

### Basic Route Protection

```vue
<!-- pages/admin/index.vue -->
<script setup>
// Require admin role
definePageMeta({
  middleware: "permission",
  permission: "admin.access",
});
</script>

<template>
  <div>
    <h1>Admin Dashboard</h1>
    <!-- Admin content -->
  </div>
</template>
```

### Multiple Permission Requirements

```vue
<!-- pages/users/manage.vue -->
<script setup>
// Require ALL specified permissions
definePageMeta({
  middleware: "permission",
  permissions: ["users.view", "users.edit"],
  permissionMode: "all", // User must have ALL permissions
});
</script>
```

```vue
<!-- pages/content/moderate.vue -->
<script setup>
// Require ANY of the specified permissions
definePageMeta({
  middleware: "permission",
  permissions: ["content.moderate", "admin.access"],
  permissionMode: "any", // User needs ANY of these permissions
});
</script>
```

### Role-Based Route Protection

```vue
<!-- pages/editor/dashboard.vue -->
<script setup>
// Require specific role
definePageMeta({
  middleware: "permission",
  role: "editor",
});
</script>
```

## Step 4: Dynamic UI Based on Permissions

### Conditional Rendering

```vue
<template>
  <v-container>
    <!-- Navigation based on permissions -->
    <v-navigation-drawer>
      <v-list>
        <v-list-item v-if="canViewUsers" to="/users">
          <v-list-item-title>Users</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="canViewReports" to="/reports">
          <v-list-item-title>Reports</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="isAdmin" to="/admin">
          <v-list-item-title>Admin Panel</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Action buttons based on permissions -->
    <v-card>
      <v-card-actions>
        <v-btn v-if="canEdit" color="primary" @click="editItem"> Edit </v-btn>

        <v-btn v-if="canDelete" color="error" @click="deleteItem">
          Delete
        </v-btn>

        <v-btn v-if="canApprove" color="success" @click="approveItem">
          Approve
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
const { hasPermission, hasRole } = useAuth();

// Permission-based UI controls
const canViewUsers = hasPermission("users.view");
const canViewReports = hasPermission("reports.view");
const canEdit = hasPermission("content.edit");
const canDelete = hasPermission("content.delete");
const canApprove = hasPermission("content.approve");
const isAdmin = hasRole("admin");
</script>
```

### Dynamic Menu Generation

```typescript
// composables/useNavigationMenu.ts
export const useNavigationMenu = () => {
  const { hasPermission, hasRole } = useAuth();

  const menuItems = computed(() => {
    const items = [];

    // Always visible items
    items.push({
      title: "Dashboard",
      to: "/dashboard",
      icon: "mdi-view-dashboard",
    });

    // Permission-based items
    if (hasPermission("users.view")) {
      items.push({
        title: "Users",
        to: "/users",
        icon: "mdi-account-group",
      });
    }

    if (hasPermission("reports.view")) {
      items.push({
        title: "Reports",
        to: "/reports",
        icon: "mdi-chart-line",
      });
    }

    if (hasRole("admin")) {
      items.push({
        title: "Admin Panel",
        to: "/admin",
        icon: "mdi-cog",
        children: [
          {
            title: "System Settings",
            to: "/admin/settings",
            permission: "settings.edit",
          },
          {
            title: "User Management",
            to: "/admin/users",
            permission: "users.manage",
          },
        ],
      });
    }

    return items;
  });

  return { menuItems };
};
```

## Step 5: Advanced RBAC Patterns

### Permission Groups

```typescript
// utils/permissionGroups.ts
export const PERMISSION_GROUPS = {
  USER_MANAGEMENT: ["users.view", "users.create", "users.edit", "users.delete"],
  CONTENT_MANAGEMENT: [
    "posts.view",
    "posts.create",
    "posts.edit",
    "posts.delete",
    "posts.publish",
  ],
  SYSTEM_ADMIN: [
    "settings.view",
    "settings.edit",
    "logs.view",
    "backup.create",
  ],
};

// Check if user has any permission from a group
export const hasAnyFromGroup = (group: string[]) => {
  const { hasAnyPermission } = useAuth();
  return hasAnyPermission(group);
};

// Check if user has all permissions from a group
export const hasAllFromGroup = (group: string[]) => {
  const { hasAllPermissions } = useAuth();
  return hasAllPermissions(group);
};
```

### Hierarchical Permissions

```typescript
// utils/permissionHierarchy.ts
export const PERMISSION_HIERARCHY = {
  admin: ["*"], // Admin has all permissions
  manager: ["users.view", "users.edit", "reports.view", "content.moderate"],
  editor: ["posts.view", "posts.create", "posts.edit"],
  viewer: ["posts.view", "reports.view"],
};

export const getPermissionsForRole = (role: string): string[] => {
  return PERMISSION_HIERARCHY[role] || [];
};
```

### Context-Aware Permissions

```typescript
// Check permissions with context (e.g., resource ownership)
export const useContextualPermissions = () => {
  const { user, hasPermission } = useAuth();

  const canEditPost = (post: Post) => {
    // Admin can edit any post
    if (hasPermission("posts.edit.any")) {
      return true;
    }

    // User can edit their own posts
    if (hasPermission("posts.edit.own") && post.authorId === user.value?.id) {
      return true;
    }

    return false;
  };

  const canDeleteComment = (comment: Comment) => {
    // Admin or moderator can delete any comment
    if (hasPermission("comments.delete.any")) {
      return true;
    }

    // User can delete their own comments
    if (
      hasPermission("comments.delete.own") &&
      comment.userId === user.value?.id
    ) {
      return true;
    }

    return false;
  };

  return {
    canEditPost,
    canDeleteComment,
  };
};
```

## 🔧 Common Patterns

### Permission-Based Component Loading

```vue
<template>
  <div>
    <!-- Lazy load admin components only for admins -->
    <LazyAdminPanel v-if="isAdmin" />

    <!-- Load different components based on role -->
    <LazyEditorDashboard v-if="isEditor" />
    <LazyViewerDashboard v-else-if="isViewer" />
    <LazyGuestWelcome v-else />
  </div>
</template>

<script setup>
const { hasRole } = useAuth();

const isAdmin = hasRole("admin");
const isEditor = hasRole("editor");
const isViewer = hasRole("viewer");
</script>
```

### Permission-Based API Calls

```typescript
// Only make API calls if user has permission
const fetchUserData = async () => {
  const { hasPermission } = useAuth();

  if (!hasPermission("users.view")) {
    console.warn("User lacks permission to view users");
    return;
  }

  try {
    const { data } = await $api.get("/api/users");
    return data;
  } catch (error) {
    if (error.statusCode === 403) {
      console.error("Permission denied by server");
    }
    throw error;
  }
};
```

### Bulk Permission Checking

```typescript
// Check multiple permissions at once
const checkBulkPermissions = () => {
  const { hasAllPermissions, hasAnyPermission } = useAuth();

  const requiredPermissions = ["users.view", "users.edit", "reports.view"];

  const optionalPermissions = ["admin.access", "settings.edit"];

  const hasAllRequired = hasAllPermissions(requiredPermissions);
  const hasAnyOptional = hasAnyPermission(optionalPermissions);

  return {
    canAccessFeature: hasAllRequired,
    hasAdvancedAccess: hasAllRequired && hasAnyOptional,
  };
};
```

## 🛡️ Security Best Practices

### 1. Server-Side Validation

```typescript
// Always validate permissions on the server
// Client-side checks are for UX only, not security

// ❌ DON'T rely only on client-side checks
const deleteUser = async (userId: string) => {
  // This check is for UX only
  if (!hasPermission("users.delete")) {
    showError("You don't have permission to delete users");
    return;
  }

  // Server will validate permissions again
  await $api.delete(`/api/users/${userId}`);
};
```

### 2. Principle of Least Privilege

```typescript
// Give users only the minimum permissions they need
const ROLE_PERMISSIONS = {
  viewer: ["posts.view"],
  editor: ["posts.view", "posts.create", "posts.edit.own"],
  admin: ["*"], // Only admins get all permissions
};
```

### 3. Regular Permission Audits

```typescript
// Log permission usage for auditing
const auditPermissionUsage = (permission: string, resource?: string) => {
  if (process.env.NODE_ENV === "production") {
    console.log(`Permission used: ${permission}`, {
      user: user.value?.id,
      resource,
      timestamp: new Date().toISOString(),
    });
  }
};
```

## 📝 Copy-Paste Examples

### Complete RBAC Composable

```typescript
// composables/useRBACHelpers.ts
export const useRBACHelpers = () => {
  const { user, hasPermission, hasRole, hasAnyPermission } = useAuth();

  // UI permission helpers
  const canView = (resource: string) => hasPermission(`${resource}.view`);
  const canCreate = (resource: string) => hasPermission(`${resource}.create`);
  const canEdit = (resource: string) => hasPermission(`${resource}.edit`);
  const canDelete = (resource: string) => hasPermission(`${resource}.delete`);

  // Role helpers
  const isAdmin = () => hasRole("admin");
  const isModerator = () => hasRole("moderator");
  const isEditor = () => hasRole("editor");

  // Complex permission logic
  const canManageResource = (resource: string) => {
    return hasAnyPermission([
      `${resource}.create`,
      `${resource}.edit`,
      `${resource}.delete`,
    ]);
  };

  // Ownership-based permissions
  const canEditOwn = (resource: string, ownerId: number) => {
    return hasPermission(`${resource}.edit.own`) && user.value?.id === ownerId;
  };

  return {
    canView,
    canCreate,
    canEdit,
    canDelete,
    isAdmin,
    isModerator,
    isEditor,
    canManageResource,
    canEditOwn,
  };
};
```

### Permission-Based Navigation Guard

```typescript
// middleware/rbac.ts
export default defineNuxtRouteMiddleware((to) => {
  const { hasPermission, hasRole } = useAuth();

  // Define route permissions
  const routePermissions: Record<string, string | string[]> = {
    "/admin": "admin.access",
    "/users": "users.view",
    "/reports": ["reports.view", "admin.access"], // Any of these
    "/settings": "settings.edit",
  };

  const requiredPermission = routePermissions[to.path];

  if (requiredPermission) {
    if (Array.isArray(requiredPermission)) {
      // Check if user has any of the required permissions
      const hasAccess = requiredPermission.some(
        (permission) => hasPermission(permission) || hasRole(permission)
      );

      if (!hasAccess) {
        throw createError({
          statusCode: 403,
          statusMessage: "Access Denied",
        });
      }
    } else {
      // Check single permission
      if (!hasPermission(requiredPermission) && !hasRole(requiredPermission)) {
        throw createError({
          statusCode: 403,
          statusMessage: "Access Denied",
        });
      }
    }
  }
});
```

### Dynamic Form Fields Based on Permissions

```vue
<template>
  <v-form>
    <!-- Basic fields for everyone -->
    <v-text-field v-model="form.name" label="Name" />
    <v-text-field v-model="form.email" label="Email" />

    <!-- Admin-only fields -->
    <template v-if="isAdmin">
      <v-select v-model="form.role" :items="availableRoles" label="Role" />
      <v-checkbox v-model="form.isActive" label="Active User" />
    </template>

    <!-- Manager-level fields -->
    <template v-if="canManageUsers">
      <v-select
        v-model="form.department"
        :items="departments"
        label="Department"
      />
    </template>

    <!-- Permission-based action buttons -->
    <v-card-actions>
      <v-btn v-if="canCreate" @click="createUser">Create</v-btn>
      <v-btn v-if="canEdit" @click="updateUser">Update</v-btn>
      <v-btn v-if="canDelete" color="error" @click="deleteUser">Delete</v-btn>
    </v-card-actions>
  </v-form>
</template>

<script setup>
const { hasPermission, hasRole } = useAuth();

const isAdmin = hasRole("admin");
const canManageUsers = hasPermission("users.manage");
const canCreate = hasPermission("users.create");
const canEdit = hasPermission("users.edit");
const canDelete = hasPermission("users.delete");

const form = reactive({
  name: "",
  email: "",
  role: "",
  isActive: true,
  department: "",
});
</script>
```

---

**Next Steps:**

- [API Integration Quick Start](./quick-start-api-integration.md)
- [UI Components Quick Start](./quick-start-ui-components.md)
- [Error Handling Quick Start](./quick-start-error-handling.md)
