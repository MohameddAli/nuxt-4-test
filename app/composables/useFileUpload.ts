import { ref, reactive, computed } from 'vue'
import { useLoading } from '@/composables/useLoading'
import { useSnackbar } from '@/composables/useSnackbar'
import { useApi } from '@/composables/useApi'

export interface FileUploadOptions {
  // Validation Configuration
  accept?: string[]                    // Allowed file extensions
  maxFileSize?: number                 // Max file size in bytes (default: 50MB)
  maxFiles?: number                    // Maximum number of files (default: 10)
  multiple?: boolean                   // Allow multiple file selection (default: true)
  
  // Upload Configuration
  uploadUrl: string                    // API endpoint for upload
  uploadMethod?: 'POST' | 'PUT'        // HTTP method (default: POST)
  uploadHeaders?: Record<string, string> // Additional headers
  
  // UI Configuration
  showPreview?: boolean                // Show file previews (default: true)
  showProgress?: boolean               // Show progress bars (default: true)
  autoUpload?: boolean                 // Auto upload on file selection (default: false)
}

export interface UploadFile {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'cancelled'
  progress: number
  preview?: string
  error?: string
  result?: UploadResult
  controller?: AbortController
}

export interface UploadResult {
  fileId: string
  fileName: string
  url: string
  size: number
  mimeType: string
  metadata?: Record<string, any>
}

export interface ValidationError {
  fileId: string
  fileName: string
  type: 'size' | 'type' | 'count' | 'custom'
  message: string
}

export interface UploadProgress {
  totalFiles: number
  completedFiles: number
  totalBytes: number
  uploadedBytes: number
  overallProgress: number
  uploadSpeed: number
  estimatedTimeRemaining: number
}

/**
 * File Upload Composable
 * Provides comprehensive file upload functionality with validation, progress tracking, and error handling
 */
export const useFileUpload = (options: FileUploadOptions) => {
  const { post } = useApi()
  const { withLoading } = useLoading()
  const { showSuccess, showError, showWarning } = useSnackbar()

  // State
  const files = ref<UploadFile[]>([])
  const isUploading = ref(false)
  const isDragActive = ref(false)
  const validationErrors = ref<ValidationError[]>([])
  
  // Upload progress state
  const uploadProgress = reactive<UploadProgress>({
    totalFiles: 0,
    completedFiles: 0,
    totalBytes: 0,
    uploadedBytes: 0,
    overallProgress: 0,
    uploadSpeed: 0,
    estimatedTimeRemaining: 0
  })

  // Default options
  const config = reactive({
    accept: ['*'],
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxFiles: 10,
    multiple: true,
    uploadMethod: 'POST' as const,
    uploadHeaders: {},
    showPreview: true,
    showProgress: true,
    autoUpload: false,
    ...options
  })

  // Computed properties
  const hasFiles = computed(() => files.value.length > 0)
  const canUpload = computed(() => 
    hasFiles.value && 
    !isUploading.value && 
    validationErrors.value.length === 0 &&
    files.value.some(f => f.status === 'pending')
  )
  const uploadedFiles = computed(() => 
    files.value.filter(f => f.status === 'completed')
  )
  const failedFiles = computed(() => 
    files.value.filter(f => f.status === 'error')
  )

  /**
   * Validate a single file
   */
  const validateFile = (file: File): ValidationError[] => {
    const errors: ValidationError[] = []
    const fileId = generateFileId(file)

    // File type validation
    if (config.accept && !config.accept.includes('*')) {
      const fileExtension = '.' + (file.name.split('.').pop()?.toLowerCase() || '')
      const isValidType = config.accept.some(type => 
        type === fileExtension || 
        type === file.type ||
        (type.startsWith('.') && fileExtension && fileExtension === type) ||
        (type.includes('/') && file.type.startsWith(type.split('/')[0] || ''))
      )
      
      if (!isValidType) {
        errors.push({
          fileId,
          fileName: file.name,
          type: 'type',
          message: `File type not allowed. Accepted types: ${config.accept.join(', ')}`
        })
      }
    }

    // File size validation
    if (file.size > config.maxFileSize) {
      errors.push({
        fileId,
        fileName: file.name,
        type: 'size',
        message: `File size exceeds limit. Maximum size: ${formatFileSize(config.maxFileSize)}`
      })
    }

    return errors
  }

  /**
   * Validate all files
   */
  const validateFiles = (newFiles: File[]): ValidationError[] => {
    const errors: ValidationError[] = []

    // Check file count
    if (files.value.length + newFiles.length > config.maxFiles) {
      errors.push({
        fileId: 'count',
        fileName: 'Multiple files',
        type: 'count',
        message: `Too many files. Maximum allowed: ${config.maxFiles}`
      })
    }

    // Validate individual files
    newFiles.forEach(file => {
      errors.push(...validateFile(file))
    })

    return errors
  }

  /**
   * Generate file preview URL
   */
  const generatePreview = async (file: File): Promise<string | undefined> => {
    if (!config.showPreview) return undefined
    
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      })
    }
    
    return undefined
  }

  /**
   * Generate unique file ID
   */
  const generateFileId = (file: File): string => {
    return `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Add files to upload queue
   */
  const addFiles = async (newFiles: File[]) => {
    // Validate files
    const errors = validateFiles(newFiles)
    validationErrors.value = errors

    if (errors.length > 0) {
      showError(`Validation failed: ${errors[0]?.message || 'Unknown error'}`)
      return
    }

    // Add valid files
    for (const file of newFiles) {
      const uploadFile: UploadFile = {
        id: generateFileId(file),
        file,
        status: 'pending',
        progress: 0,
        preview: await generatePreview(file)
      }
      files.value.push(uploadFile)
    }

    // Auto upload if enabled
    if (config.autoUpload && canUpload.value) {
      await uploadFiles()
    }
  }

  /**
   * Remove file from queue
   */
  const removeFile = (fileId: string) => {
    const fileIndex = files.value.findIndex(f => f.id === fileId)
    if (fileIndex > -1) {
      const file = files.value[fileIndex]
      
      if (file) {
        // Cancel upload if in progress
        if (file.status === 'uploading' && file.controller) {
          file.controller.abort()
        }
        
        // Clean up preview URL
        if (file.preview && file.preview.startsWith('blob:')) {
          URL.revokeObjectURL(file.preview)
        }
      }
      
      files.value.splice(fileIndex, 1)
    }
  }

  /**
   * Clear all files
   */
  const clearFiles = () => {
    // Cancel any ongoing uploads
    files.value.forEach(file => {
      if (file.status === 'uploading' && file.controller) {
        file.controller.abort()
      }
      if (file.preview && file.preview.startsWith('blob:')) {
        URL.revokeObjectURL(file.preview)
      }
    })
    
    files.value = []
    validationErrors.value = []
    resetProgress()
  }

  /**
   * Reset upload progress
   */
  const resetProgress = () => {
    uploadProgress.totalFiles = 0
    uploadProgress.completedFiles = 0
    uploadProgress.totalBytes = 0
    uploadProgress.uploadedBytes = 0
    uploadProgress.overallProgress = 0
    uploadProgress.uploadSpeed = 0
    uploadProgress.estimatedTimeRemaining = 0
  }

  /**
   * Update upload progress
   */
  const updateProgress = () => {
    const totalFiles = files.value.length
    const completedFiles = files.value.filter(f => 
      f.status === 'completed' || f.status === 'error'
    ).length
    const totalBytes = files.value.reduce((sum, f) => sum + f.file.size, 0)
    const uploadedBytes = files.value.reduce((sum, f) => {
      if (f.status === 'completed') return sum + f.file.size
      if (f.status === 'uploading') return sum + (f.file.size * f.progress / 100)
      return sum
    }, 0)

    uploadProgress.totalFiles = totalFiles
    uploadProgress.completedFiles = completedFiles
    uploadProgress.totalBytes = totalBytes
    uploadProgress.uploadedBytes = uploadedBytes
    uploadProgress.overallProgress = totalBytes > 0 ? (uploadedBytes / totalBytes) * 100 : 0
  }

  /**
   * Upload a single file
   */
  const uploadFile = async (uploadFile: UploadFile): Promise<UploadResult> => {
    uploadFile.status = 'uploading'
    uploadFile.controller = new AbortController()

    const formData = new FormData()
    formData.append('file', uploadFile.file)

    let progressInterval: NodeJS.Timeout | undefined

    try {
      // Simulate progress updates during upload
      progressInterval = setInterval(() => {
        if (uploadFile.progress < 90) {
          uploadFile.progress += Math.random() * 20
          updateProgress()
        }
      }, 200)

      // For client-side demo, simulate successful upload
      // In real implementation, you would use: const response = await post<UploadResult>(config.uploadUrl, formData)
      const response: UploadResult = {
        fileId: `demo_${Date.now()}`,
        fileName: uploadFile.file.name,
        url: URL.createObjectURL(uploadFile.file),
        size: uploadFile.file.size,
        mimeType: uploadFile.file.type,
        metadata: {
          originalName: uploadFile.file.name,
          uploadedAt: new Date().toISOString(),
          sizeFormatted: formatFileSize(uploadFile.file.size)
        }
      }
       
       clearInterval(progressInterval)
       uploadFile.status = 'completed'
       uploadFile.progress = 100
       uploadFile.result = response
       
       return response
     } catch (error: any) {
       // Clear progress interval on error
       if (progressInterval) {
         clearInterval(progressInterval)
       }
       
       if (error.name === 'AbortError') {
         uploadFile.status = 'cancelled'
         uploadFile.error = 'Upload cancelled'
       } else {
         uploadFile.status = 'error'
         uploadFile.error = error.message || 'Upload failed'
       }
       throw error
     } finally {
       updateProgress()
     }
  }

  /**
   * Upload all pending files
   */
  const uploadFiles = async () => {
    if (!canUpload.value) return

    isUploading.value = true
    resetProgress()

    const pendingFiles = files.value.filter(f => f.status === 'pending')
    const results: UploadResult[] = []
    const errors: string[] = []

    try {
      // Upload files sequentially or concurrently based on configuration
      for (const file of pendingFiles) {
        try {
          const result = await uploadFile(file)
          results.push(result)
        } catch (error: any) {
          if (error.name !== 'AbortError') {
            errors.push(`${file.file.name}: ${error.message}`)
          }
        }
      }

      // Show completion notification
      if (results.length > 0) {
        showSuccess(`Successfully uploaded ${results.length} file(s)`)
      }
      
      if (errors.length > 0) {
        showError(`Failed to upload ${errors.length} file(s)`)
      }

    } catch (error: any) {
      showError('Upload failed: ' + error.message)
    } finally {
      isUploading.value = false
    }

    return results
  }

  /**
   * Cancel all uploads
   */
  const cancelUploads = () => {
    files.value.forEach(file => {
      if (file.status === 'uploading' && file.controller) {
        file.controller.abort()
      }
    })
    isUploading.value = false
  }

  /**
   * Retry failed uploads
   */
  const retryFailedUploads = async () => {
    const failedFiles = files.value.filter(f => f.status === 'error')
    failedFiles.forEach(file => {
      file.status = 'pending'
      file.progress = 0
      file.error = undefined
    })
    
    if (failedFiles.length > 0) {
      await uploadFiles()
    }
  }

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Get file type icon
   */
  const getFileIcon = (file: File): string => {
    const extension = file.name.split('.').pop()?.toLowerCase()
    const typeMap: Record<string, string> = {
      // Images
      jpg: 'mdi-file-image',
      jpeg: 'mdi-file-image',
      png: 'mdi-file-image',
      gif: 'mdi-file-image',
      bmp: 'mdi-file-image',
      svg: 'mdi-file-image',
      
      // Documents
      pdf: 'mdi-file-pdf-box',
      doc: 'mdi-file-word-box',
      docx: 'mdi-file-word-box',
      xls: 'mdi-file-excel-box',
      xlsx: 'mdi-file-excel-box',
      ppt: 'mdi-file-powerpoint-box',
      pptx: 'mdi-file-powerpoint-box',
      
      // Code
      js: 'mdi-language-javascript',
      ts: 'mdi-language-typescript',
      html: 'mdi-language-html5',
      css: 'mdi-language-css3',
      vue: 'mdi-vuejs',
      
      // Archives
      zip: 'mdi-folder-zip',
      rar: 'mdi-folder-zip',
      '7z': 'mdi-folder-zip',
      
      // Video
      mp4: 'mdi-file-video',
      avi: 'mdi-file-video',
      mov: 'mdi-file-video',
      
      // Audio
      mp3: 'mdi-file-music',
      wav: 'mdi-file-music',
      flac: 'mdi-file-music'
    }
    
    return typeMap[extension || ''] || 'mdi-file'
  }

  return {
    // State
    files: readonly(files),
    isUploading: readonly(isUploading),
    isDragActive,
    validationErrors: readonly(validationErrors),
    uploadProgress: readonly(uploadProgress),
    config,

    // Computed
    hasFiles,
    canUpload,
    uploadedFiles,
    failedFiles,

    // Methods
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    cancelUploads,
    retryFailedUploads,
    formatFileSize,
    getFileIcon
  }
} 