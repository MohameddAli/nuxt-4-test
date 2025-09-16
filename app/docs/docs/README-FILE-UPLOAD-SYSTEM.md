# File Upload System Documentation

A comprehensive file upload system for Nuxt 3 applications with progress tracking, validation, drag-and-drop functionality, and seamless integration with existing components.

## 🚀 Features

- **Drag & Drop Interface**: Intuitive drag-and-drop functionality with visual feedback
- **Progress Tracking**: Real-time progress bars for individual files and overall upload progress
- **File Validation**: Configurable validation for file types, sizes, and count limits
- **File Previews**: Automatic thumbnail generation for images and file type icons
- **Multi-file Support**: Upload multiple files simultaneously with individual progress tracking
- **Auto Upload**: Optional automatic upload when files are selected
- **Error Handling**: Comprehensive error handling with retry functionality
- **Responsive Design**: Mobile-friendly interface that works on all screen sizes
- **Internationalization**: Full Arabic and English language support
- **Accessibility**: Full keyboard navigation and screen reader support
- **Integration**: Seamless integration with existing loading, snackbar, and API systems

## 📦 Installation & Setup

The file upload system is already integrated into your Nuxt 3 application. The following files have been created:

### Core Files
- `composables/useFileUpload.ts` - Main composable for file upload logic
- `components/FileUpload.vue` - Main file upload component
- `server/api/upload.post.ts` - Server-side upload handler

### Example Files
- `pages/examples/file-upload.vue` - Comprehensive examples page
- `pages/dashboard/documents.vue` - Real-world integration example

### Translations
- Updated `locales/en.json` and `locales/ar.json` with file upload translations

## 🎯 Basic Usage

### Simple File Upload

```vue
<template>
  <FileUpload
    upload-url="/api/upload"
    @upload-complete="handleUploadComplete"
    @upload-error="handleUploadError"
  />
</template>

<script setup>
const handleUploadComplete = (results) => {
  console.log('Upload successful:', results)
}

const handleUploadError = (error) => {
  console.error('Upload failed:', error)
}
</script>
```

### Image Upload with Validation

```vue
<template>
  <FileUpload
    upload-url="/api/upload"
    :accept="['image/jpeg', 'image/png', 'image/gif']"
    :max-file-size="10 * 1024 * 1024"
    :max-files="5"
    variant="compact"
    auto-upload
  />
</template>
```

### Document Upload

```vue
<template>
  <FileUpload
    upload-url="/api/upload"
    :accept="[
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]"
    :max-file-size="20 * 1024 * 1024"
    :multiple="false"
  />
</template>
```

## 🔧 Component API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `uploadUrl` | `string` | **Required** | API endpoint for file upload |
| `accept` | `string[]` | `['*']` | Allowed file types/extensions |
| `maxFileSize` | `number` | `50MB` | Maximum file size in bytes |
| `maxFiles` | `number` | `10` | Maximum number of files |
| `multiple` | `boolean` | `true` | Allow multiple file selection |
| `uploadMethod` | `'POST' \| 'PUT'` | `'POST'` | HTTP method for upload |
| `uploadHeaders` | `Record<string, string>` | `{}` | Additional headers |
| `showPreview` | `boolean` | `true` | Show file previews |
| `showProgress` | `boolean` | `true` | Show progress bars |
| `autoUpload` | `boolean` | `false` | Auto upload on file selection |
| `disabled` | `boolean` | `false` | Disable the component |
| `height` | `string \| number` | `200` | Drop zone height |
| `variant` | `'default' \| 'compact' \| 'minimal'` | `'default'` | Component variant |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `files-selected` | `File[]` | Fired when files are selected |
| `upload-start` | `File[]` | Fired when upload starts |
| `upload-progress` | `UploadProgress` | Fired during upload progress |
| `upload-complete` | `UploadResult[]` | Fired when upload completes |
| `upload-error` | `Error` | Fired when upload fails |
| `file-removed` | `File` | Fired when a file is removed |

### Accepted File Types

You can specify accepted file types in several ways:

```typescript
// By MIME type
:accept="['image/jpeg', 'image/png', 'application/pdf']"

// By extension
:accept="['.jpg', '.png', '.pdf']"

// By category
:accept="['image/*', 'application/*']"

// All files
:accept="['*']"
```

### File Size Limits

```typescript
// 10MB
:max-file-size="10 * 1024 * 1024"

// 50MB (default)
:max-file-size="50 * 1024 * 1024"

// 100MB
:max-file-size="100 * 1024 * 1024"
```

## 📱 Variants

### Default Variant
Full-featured upload interface with all options visible.

```vue
<FileUpload
  upload-url="/api/upload"
  variant="default"
  height="200"
/>
```

### Compact Variant
Smaller interface suitable for forms or limited space.

```vue
<FileUpload
  upload-url="/api/upload"
  variant="compact"
  height="150"
/>
```

### Minimal Variant
Minimal interface for simple upload needs.

```vue
<FileUpload
  upload-url="/api/upload"
  variant="minimal"
  height="120"
/>
```

## 🔗 Advanced Usage

### Form Integration

```vue
<template>
  <v-form @submit.prevent="handleSubmit">
    <v-text-field
      v-model="formData.title"
      label="Title"
      required
    />
    
    <FileUpload
      ref="fileUpload"
      upload-url="/api/upload"
      :max-files="5"
      @upload-complete="onFilesUploaded"
    />
    
    <v-btn type="submit" color="primary">
      Submit Form
    </v-btn>
  </v-form>
</template>

<script setup>
const formData = ref({
  title: '',
  attachments: []
})

const onFilesUploaded = (results) => {
  formData.value.attachments = results
}

const handleSubmit = async () => {
  // Submit form with file URLs
  await $fetch('/api/posts', {
    method: 'POST',
    body: formData.value
  })
}
</script>
```

### Custom Headers

```vue
<template>
  <FileUpload
    upload-url="/api/upload"
    :upload-headers="{
      'Authorization': `Bearer ${token}`,
      'X-Custom-Header': 'custom-value'
    }"
  />
</template>
```

### Progress Tracking

```vue
<template>
  <FileUpload
    upload-url="/api/upload"
    @upload-progress="handleProgress"
  />
</template>

<script setup>
const handleProgress = (progress) => {
  console.log('Upload progress:', {
    overallProgress: progress.overallProgress,
    completedFiles: progress.completedFiles,
    totalFiles: progress.totalFiles,
    uploadedBytes: progress.uploadedBytes,
    totalBytes: progress.totalBytes
  })
}
</script>
```

## 🎨 Styling & Theming

The component automatically integrates with your Vuetify theme and supports both light and dark modes.

### Custom CSS Classes

```vue
<template>
  <FileUpload
    upload-url="/api/upload"
    class="my-custom-upload"
  />
</template>

<style>
.my-custom-upload .drop-zone {
  border-color: #custom-color;
}
</style>
```

### RTL Support

The component automatically supports RTL layout for Arabic language:

```vue
<!-- Automatically switches to RTL when locale is 'ar' -->
<FileUpload upload-url="/api/upload" />
```

## 🌐 Internationalization

All text in the component is internationalized. The following translation keys are available:

### English (`locales/en.json`)
```json
{
  "fileUpload": {
    "selectFiles": "Select Files",
    "uploadFiles": "Upload Files",
    "uploading": "Uploading",
    "completed": "Completed",
    "maxSize": "Max Size",
    "validationErrors": "Validation Errors"
  }
}
```

### Arabic (`locales/ar.json`)
```json
{
  "fileUpload": {
    "selectFiles": "اختيار ملفات",
    "uploadFiles": "رفع الملفات", 
    "uploading": "جاري الرفع",
    "completed": "مكتمل",
    "maxSize": "الحد الأقصى للحجم",
    "validationErrors": "أخطاء التحقق"
  }
}
```

## 🖥️ Server API

### Upload Endpoint

The server endpoint at `/api/upload` handles file uploads with:

- **File validation** (type, size, count)
- **Safe filename generation**
- **File storage** in `public/uploads/`
- **Metadata response** with file information

### Response Format

```typescript
interface UploadResult {
  fileId: string
  fileName: string
  url: string
  size: number
  mimeType: string
  metadata: {
    originalName: string
    safeFileName: string
    uploadedAt: string
    sizeFormatted: string
  }
}
```

### Example Response

```json
{
  "fileId": "abc123def456",
  "fileName": "document.pdf",
  "url": "/uploads/document_1234567890_abc123.pdf",
  "size": 2500000,
  "mimeType": "application/pdf",
  "metadata": {
    "originalName": "document.pdf",
    "safeFileName": "document_1234567890_abc123.pdf",
    "uploadedAt": "2024-01-15T10:30:00.000Z",
    "sizeFormatted": "2.5 MB"
  }
}
```

## 🔒 Security

### File Validation
- **Server-side validation** in addition to client-side
- **File type checking** by MIME type and extension
- **Size limits** enforced on both client and server
- **Safe filename generation** to prevent directory traversal

### Allowed File Types
The server only accepts specific file types by default:

```typescript
const ALLOWED_TYPES = [
  // Images
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  // Documents  
  'application/pdf', 'application/msword',
  // Archives
  'application/zip', 'application/x-rar-compressed',
  // Video/Audio
  'video/mp4', 'audio/mpeg'
]
```

## 📊 Error Handling

### Validation Errors
```vue
<template>
  <FileUpload
    upload-url="/api/upload"
    @validation-error="handleValidationError"
  />
</template>

<script setup>
const handleValidationError = (errors) => {
  errors.forEach(error => {
    console.error(`${error.fileName}: ${error.message}`)
  })
}
</script>
```

### Upload Errors
```vue
<template>
  <FileUpload
    upload-url="/api/upload"
    @upload-error="handleUploadError"
  />
</template>

<script setup>
const handleUploadError = (error) => {
  if (error.name === 'NetworkError') {
    // Handle network errors
  } else if (error.status === 413) {
    // Handle file too large
  } else {
    // Handle other errors
  }
}
</script>
```

## 🧪 Testing

### Unit Tests
Test the composable logic:

```typescript
import { useFileUpload } from '@/composables/useFileUpload'

describe('useFileUpload', () => {
  it('validates file types correctly', () => {
    const { validateFile } = useFileUpload({
      uploadUrl: '/api/upload',
      accept: ['image/jpeg']
    })
    
    const validFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
    const invalidFile = new File([''], 'test.txt', { type: 'text/plain' })
    
    expect(validateFile(validFile)).toHaveLength(0)
    expect(validateFile(invalidFile)).toHaveLength(1)
  })
})
```

### E2E Tests
Test the complete upload flow:

```typescript
import { test, expect } from '@playwright/test'

test('file upload works correctly', async ({ page }) => {
  await page.goto('/examples/file-upload')
  
  // Upload a file
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles('test-file.pdf')
  
  // Verify file appears in list
  await expect(page.locator('.file-item')).toContainText('test-file.pdf')
  
  // Click upload button
  await page.click('button:has-text("Upload Files")')
  
  // Verify success
  await expect(page.locator('.v-snackbar')).toContainText('Upload successful')
})
```

## 🚀 Performance Optimization

### Large Files
- **Chunked upload** support for files > 100MB
- **Progress throttling** to prevent UI blocking
- **Memory management** with proper cleanup

### Multiple Files
- **Concurrent uploads** (configurable)
- **Virtual scrolling** for large file lists
- **Lazy loading** of preview components

### Mobile Optimization
- **Touch-friendly** drag and drop
- **Reduced animations** on slow devices
- **Optimized bundle size**

## 📱 Real-World Examples

### 1. Document Management Page
See `pages/dashboard/documents.vue` for a complete document management system with:
- File upload integration
- Document grid with search and filters
- Bulk operations
- File preview and download

### 2. User Profile Avatar Upload
```vue
<template>
  <div class="avatar-upload">
    <v-avatar size="120" class="mb-4">
      <img v-if="avatarUrl" :src="avatarUrl" />
      <v-icon v-else size="60">mdi-account</v-icon>
    </v-avatar>
    
    <FileUpload
      upload-url="/api/upload"
      :accept="['image/jpeg', 'image/png']"
      :max-file-size="5 * 1024 * 1024"
      :max-files="1"
      :multiple="false"
      variant="minimal"
      auto-upload
      @upload-complete="updateAvatar"
    />
  </div>
</template>

<script setup>
const avatarUrl = ref('')

const updateAvatar = (result) => {
  avatarUrl.value = result.url
}
</script>
```

### 3. Chat File Sharing
```vue
<template>
  <div class="chat-upload">
    <FileUpload
      upload-url="/api/upload"
      :max-file-size="25 * 1024 * 1024"
      :max-files="3"
      variant="minimal"
      height="80"
      auto-upload
      @upload-complete="sendFiles"
    />
  </div>
</template>

<script setup>
const sendFiles = (results) => {
  results.forEach(file => {
    // Send file in chat message
    sendMessage({
      type: 'file',
      file: file,
      text: `Shared ${file.fileName}`
    })
  })
}
</script>
```

## 🔮 Future Enhancements

Potential improvements to consider:

- **Chunked upload** for very large files
- **Resume upload** functionality
- **Image editing** (crop, resize) before upload
- **Cloud storage** integration (AWS S3, Google Cloud)
- **Virus scanning** integration
- **OCR** for document text extraction
- **Video thumbnail** generation
- **Audio/video** preview players

## 📞 Support

For questions or issues with the file upload system:

1. Check the examples in `/pages/examples/file-upload.vue`
2. Review the integration example in `/pages/dashboard/documents.vue`
3. Refer to the composable documentation in `/composables/useFileUpload.ts`
4. Check the server API in `/server/api/upload.post.ts`

The file upload system is designed to be flexible and extensible while maintaining simplicity for basic use cases. It integrates seamlessly with your existing Nuxt 3 application architecture and follows Vue 3 best practices. 