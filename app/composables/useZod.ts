import { useNuxtApp } from '#app'
import { toTypedSchema } from '@vee-validate/zod'
import type { z } from 'zod'

// تعريف النوع من Zod مباشرة
export const useZod = () => {
    const { $z } = useNuxtApp()
    return $z as typeof z
}

// Helper لتحويل Zod schema إلى VeeValidate schema
export const useZodSchema = (schema: z.ZodSchema) => {
    return toTypedSchema(schema)
}

// ==================== Base Validators ====================

/**
 * Required string validator
 * @param message - Custom error message
 */
export const useZodRequiredString = (message = 'This field is required') => {
    const zod = useZod()
    return zod.string().min(1, { message })
}

/**
 * Email validator
 * @param message - Custom error message
 */
export const useZodEmail = (message?: string) => {
    const zod = useZod()
    return zod.string()
        .min(1, { message: 'Email is required' })
        .email({ message: message ?? 'Invalid email address' })
}

/**
 * Password validator with customizable requirements
 * @param options - Password validation options
 */
export const useZodPassword = (options?: {
    min?: number
    max?: number
    requireUppercase?: boolean
    requireLowercase?: boolean
    requireNumbers?: boolean
    requireSpecialChars?: boolean
    message?: string
}) => {
    const zod = useZod()
    const {
        min = 8,
        max = 128,
        requireUppercase = false,
        requireLowercase = false,
        requireNumbers = false,
        requireSpecialChars = false,
        message
    } = options || {}
    
    let validator = zod.string()
        .min(1, { message: 'Password is required' })
        .min(min, { message: message ?? `Password must be at least ${min} characters long` })
    
    if (max) {
        validator = validator.max(max, { message: `Password must not exceed ${max} characters` })
    }
    
    if (requireUppercase) {
        validator = validator.regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    }
    
    if (requireLowercase) {
        validator = validator.regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    }
    
    if (requireNumbers) {
        validator = validator.regex(/\d/, { message: 'Password must contain at least one number' })
    }
    
    if (requireSpecialChars) {
        validator = validator.regex(/[!@#$%^&*(),.?":{}|<>]/, { message: 'Password must contain at least one special character' })
    }
    
    return validator
}

/**
 * Phone number validator with international support
 * @param message - Custom error message
 */
export const useZodPhoneNumber = (message?: string) => {
    const zod = useZod()
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return zod.string()
        .min(1, { message: 'Phone number is required' })
        .regex(phoneRegex, { message: message ?? 'Invalid phone number format' })
}

/**
 * URL validator
 * @param message - Custom error message
 */
export const useZodUrl = (message?: string) => {
    const zod = useZod()
    return zod.string()
        .min(1, { message: 'URL is required' })
        .url({ message: message ?? 'Invalid URL format' })
}

/**
 * Number validator with range options
 * @param options - Number validation options
 */
export const useZodNumber = (options?: {
    min?: number
    max?: number
    int?: boolean
    positive?: boolean
    message?: string
}) => {
    const zod = useZod()
    const { min, max, int = false, positive = false, message } = options || {}
    
    let validator = zod.number({ message: message ?? 'Must be a valid number' })
    
    if (min !== undefined) {
        validator = validator.min(min, { message: `Must be at least ${min}` })
    }
    
    if (max !== undefined) {
        validator = validator.max(max, { message: `Must not exceed ${max}` })
    }
    
    if (int) {
        validator = validator.int({ message: 'Must be an integer' })
    }
    
    if (positive) {
        validator = validator.positive({ message: 'Must be a positive number' })
    }
    
    return validator
}

/**
 * Date validator
 * @param options - Date validation options
 */
export const useZodDate = (options?: {
    min?: Date
    max?: Date
    message?: string
}) => {
    const zod = useZod()
    const { min, max, message } = options || {}
    
    let validator = zod.date({ message: message ?? 'Invalid date' })
    
    if (min) {
        validator = validator.min(min, { message: `Date must be after ${min.toLocaleDateString()}` })
    }
    
    if (max) {
        validator = validator.max(max, { message: `Date must be before ${max.toLocaleDateString()}` })
    }
    
    return validator
}

/**
 * File validator for uploads
 * @param options - File validation options
 */
export const useZodFile = (options?: {
    maxSize?: number // in bytes
    allowedTypes?: string[]
    message?: string
}) => {
    const zod = useZod()
    const { maxSize = 5 * 1024 * 1024, allowedTypes, message } = options || {} // 5MB default
    
    return zod.instanceof(File, { message: message ?? 'Must be a valid file' })
        .refine(
            (file) => file.size <= maxSize,
            { message: `File size must not exceed ${Math.round(maxSize / 1024 / 1024)}MB` }
        )
        .refine(
            (file) => !allowedTypes || allowedTypes.includes(file.type),
            { message: `File type must be one of: ${allowedTypes?.join(', ')}` }
        )
}

// ==================== Predefined Schemas ====================

/**
 * Login schema with username and password
 */
export const useLoginSchema = () => {
    const zod = useZod()
    const schema = zod.object({
        username: useZodRequiredString('Username is required')
            .min(3, { message: 'Username must be at least 3 characters' })
            .max(30, { message: 'Username must not exceed 30 characters' })
            .regex(/^[a-zA-Z0-9_.-]+$/, { message: 'Username can only contain letters, numbers, dots, dashes, and underscores' }),
        password: useZodPassword({
            min: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true
        })
    })
    return useZodSchema(schema)
}

/**
 * Registration schema
 */
export const useRegisterSchema = () => {
    const zod = useZod()
    const schema = zod.object({
        firstName: useZodRequiredString('First name is required')
            .min(2, { message: 'First name must be at least 2 characters' }),
        lastName: useZodRequiredString('Last name is required')
            .min(2, { message: 'Last name must be at least 2 characters' }),
        email: useZodEmail(),
        username: useZodRequiredString('Username is required')
            .min(3, { message: 'Username must be at least 3 characters' })
            .max(30, { message: 'Username must not exceed 30 characters' })
            .regex(/^[a-zA-Z0-9_.-]+$/, { message: 'Username can only contain letters, numbers, dots, dashes, and underscores' }),
        password: useZodPassword({
            min: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true
        }),
        confirmPassword: useZodRequiredString('Please confirm your password')
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"]
    })
    return useZodSchema(schema)
}

/**
 * Contact form schema
 */
export const useContactSchema = () => {
    const zod = useZod()
    const schema = zod.object({
        name: useZodRequiredString('Name is required'),
        email: useZodEmail(),
        subject: useZodRequiredString('Subject is required')
            .min(5, { message: 'Subject must be at least 5 characters' }),
        message: useZodRequiredString('Message is required')
            .min(10, { message: 'Message must be at least 10 characters' })
    })
    return useZodSchema(schema)
}

/**
 * Profile update schema
 */
export const useProfileSchema = () => {
    const zod = useZod()
    const schema = zod.object({
        firstName: useZodRequiredString('First name is required'),
        lastName: useZodRequiredString('Last name is required'),
        email: useZodEmail(),
        phone: useZodPhoneNumber().optional(),
        bio: zod.string().max(500, { message: 'Bio must not exceed 500 characters' }).optional(),
        website: useZodUrl().optional()
    })
    return useZodSchema(schema)
}

/**
 * Password change schema
 */
export const usePasswordChangeSchema = () => {
    const zod = useZod()
    const schema = zod.object({
        currentPassword: useZodRequiredString('Current password is required'),
        newPassword: useZodPassword({
            min: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true
        }),
        confirmNewPassword: useZodRequiredString('Please confirm your new password')
    }).refine((data) => data.newPassword === data.confirmNewPassword, {
        message: "New passwords don't match",
        path: ["confirmNewPassword"]
    }).refine((data) => data.currentPassword !== data.newPassword, {
        message: "New password must be different from current password",
        path: ["newPassword"]
    })
    return useZodSchema(schema)
}

// ==================== Form Helpers ====================

/**
 * Create a custom form schema
 * @param schemaObject - Object containing field validators
 */
export const useCustomSchema = (schemaObject: Record<string, z.ZodTypeAny>) => {
    const zod = useZod()
    const schema = zod.object(schemaObject)
    return useZodSchema(schema)
}

/**
 * Create an array schema for dynamic forms
 * @param itemSchema - Schema for each array item
 */
export const useArraySchema = (itemSchema: z.ZodTypeAny) => {
    const zod = useZod()
    return zod.array(itemSchema)
}

/**
 * Create optional version of any schema
 * @param schema - Base schema to make optional
 */
export const useOptionalSchema = (schema: z.ZodTypeAny) => {
    return schema.optional()
}

// ==================== Validation Helpers ====================

/**
 * Validate data against schema
 * @param schema - Zod schema
 * @param data - Data to validate
 */
export const useValidateData = async (schema: z.ZodSchema, data: unknown) => {
    try {
        const result = await schema.safeParseAsync(data)
        return {
            success: result.success,
            data: result.success ? result.data : null,
            errors: result.success ? null : result.error.issues
        }
    } catch (error) {
        return {
            success: false,
            data: null,
            errors: [{ message: 'Validation failed', path: [] }]
        }
    }
}

/**
 * Get field error message from Zod issues
 * @param issues - Zod validation issues
 * @param field - Field name
 */
export const useGetFieldError = (issues: z.ZodIssue[] | null, field: string) => {
    if (!issues) return null
    const fieldIssue = issues.find(issue => issue.path.includes(field))
    return fieldIssue ? fieldIssue.message : null
}
