// Authentication related types and interfaces

export interface User {
  id: number
  name: string
  username: string
  email: string
  phone?: string
  avatar?: string
  permissions: string[]
  roles: string[]
  group?: {
    id: number
    name: string
    description?: string
  }
  createdAt?: string
  updatedAt?: string
  lastLoginAt?: string
}

export interface LoginCredentials {
  username: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  name: string
  username: string
  email: string
  phone?: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  token: string
  user: User
  message?: string
}

export interface TokenValidationResponse {
  valid: boolean
  user?: User
  message?: string
}

export interface UpdateProfileData {
  name?: string
  email?: string
  phone?: string
  avatar?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ResetPasswordData {
  email: string
}

// Permission and Role types
export type Permission = 
  | 'user.view'
  | 'user.create' 
  | 'user.update'
  | 'user.delete'
  | 'admin.access'
  | 'admin.manage_users'
  | 'admin.manage_permissions'
  | 'profile.view'
  | 'profile.update'
  | 'dashboard.view'
  | 'reports.view'
  | 'reports.export'

export type Role = 'admin' | 'user' | 'moderator' | 'guest'

// Auth error types
export interface AuthError {
  code: string
  message: string
  field?: string
  details?: any
}

// Auth state interface for consistent state management
export interface AuthState {
  token: string | null
  user: User | null
  loading: boolean
  error: string | null
  isInitialized: boolean
}

// Configuration for permission checking
export interface AccessConfig {
  permission?: Permission | string
  permissions?: (Permission | string)[]
  role?: Role | string
  roles?: (Role | string)[]
  mode?: 'all' | 'any'
  requireAuth?: boolean
}

// Auth configuration for routes
export interface RouteAuthConfig {
  requiresAuth: boolean
  permissions?: Permission[]
  roles?: Role[]
  redirectTo?: string
  mode?: 'all' | 'any'
}