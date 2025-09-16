<template>
  <div class="file-upload">
    <!-- File Drop Zone -->
    <div
      ref="dropZone"
      class="drop-zone"
      :class="dropZoneClasses"
      @click="triggerFileInput"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @keydown.enter="triggerFileInput"
      @keydown.space="triggerFileInput"
      tabindex="0"
      role="button"
      :aria-label="$t('fileUpload.dropZone.label')"
    >
      <!-- Hidden file input -->
      <input
        ref="fileInput"
        type="file"
        :multiple="config.multiple"
        :accept="acceptAttribute"
        @change="handleFileSelect"
        class="sr-only"
        :aria-hidden="true"
      />

      <!-- Drop zone content -->
      <div class="drop-zone-content">
        <v-icon
          :icon="dropZoneIcon"
          :size="64"
          :color="isDragActive ? 'primary' : 'grey'"
          class="mb-4"
        />
        
        <h3 class="text-h6 mb-2">
          {{ dropZoneTitle }}
        </h3>
        
        <p class="text-body-2 text-grey-600 mb-4">
          {{ dropZoneSubtitle }}
        </p>

        <v-btn
          color="primary"
          variant="outlined"
          :disabled="disabled"
          @click.stop="triggerFileInput"
        >
          <v-icon start>mdi-file-plus</v-icon>
          {{ $t('fileUpload.selectFiles') }}
        </v-btn>

        <!-- Upload constraints info -->
        <div class="upload-info mt-4">
          <v-chip
            v-if="config.maxFileSize"
            size="small"
            variant="text"
            class="mr-2"
          >
            <v-icon start size="16">mdi-weight</v-icon>
            {{ $t('fileUpload.maxSize') }}: {{ formatFileSize(config.maxFileSize) }}
          </v-chip>
          
          <v-chip
            v-if="config.maxFiles > 1"
            size="small"
            variant="text"
            class="mr-2"
          >
            <v-icon start size="16">mdi-file-multiple</v-icon>
            {{ $t('fileUpload.maxFiles') }}: {{ config.maxFiles }}
          </v-chip>
          
          <v-chip
            v-if="config.accept && !config.accept.includes('*')"
            size="small"
            variant="text"
          >
            <v-icon start size="16">mdi-file-check</v-icon>
            {{ config.accept.join(', ') }}
          </v-chip>
        </div>
      </div>
    </div>

    <!-- File List -->
    <div v-if="hasFiles" class="file-list mt-6">
      <div class="d-flex justify-space-between align-center mb-4">
        <h4 class="text-h6">
          {{ $t('fileUpload.selectedFiles') }} ({{ files.length }})
        </h4>
        
        <div>
          <v-btn
            v-if="failedFiles.length > 0"
            color="warning"
            variant="text"
            size="small"
            @click="retryFailedUploads"
            :disabled="isUploading"
          >
            <v-icon start>mdi-refresh</v-icon>
            {{ $t('fileUpload.retryFailed') }}
          </v-btn>
          
          <v-btn
            color="error"
            variant="text"
            size="small"
            @click="clearFiles"
            :disabled="isUploading"
          >
            <v-icon start>mdi-delete</v-icon>
            {{ $t('fileUpload.clearAll') }}
          </v-btn>
        </div>
      </div>

      <!-- Overall Progress -->
      <div v-if="isUploading && config.showProgress" class="overall-progress mb-4">
        <div class="d-flex justify-space-between align-center mb-2">
          <span class="text-body-2">
            {{ $t('fileUpload.uploading') }} {{ uploadProgress.completedFiles }}/{{ uploadProgress.totalFiles }}
          </span>
          <span class="text-body-2">
            {{ Math.round(uploadProgress.overallProgress) }}%
          </span>
        </div>
        
        <v-progress-linear
          :model-value="uploadProgress.overallProgress"
          color="primary"
          height="8"
          rounded
        />
        
        <div class="d-flex justify-space-between mt-1">
          <span class="text-caption text-grey-600">
            {{ formatFileSize(uploadProgress.uploadedBytes) }} / {{ formatFileSize(uploadProgress.totalBytes) }}
          </span>
          <v-btn
            color="error"
            variant="text"
            size="x-small"
            @click="cancelUploads"
          >
            {{ $t('fileUpload.cancel') }}
          </v-btn>
        </div>
      </div>

      <!-- Individual Files -->
      <div class="file-items">
        <v-card
          v-for="file in files"
          :key="file.id"
          class="file-item mb-3"
          :class="fileItemClasses(file)"
          variant="outlined"
        >
          <v-card-text class="pa-3">
            <div class="d-flex">
              <!-- File Preview/Icon -->
              <div class="file-preview mr-3">
                <div class="preview-container">
                  <img
                    v-if="file.preview"
                    :src="file.preview"
                    :alt="file.file.name"
                    class="preview-image"
                  />
                  <v-icon
                    v-else
                    :icon="getFileIcon(file.file)"
                    size="32"
                    :color="getStatusColor(file.status)"
                  />
                </div>
                
                <!-- Status badge -->
                <v-badge
                  :color="getStatusColor(file.status)"
                  :icon="getStatusIcon(file.status)"
                  location="bottom right"
                  offset-x="2"
                  offset-y="2"
                />
              </div>

              <!-- File Info -->
              <div class="file-info flex-grow-1">
                <div class="d-flex justify-space-between align-start">
                  <div>
                    <h6 class="text-subtitle-2 mb-1">
                      {{ file.file.name }}
                    </h6>
                    <div class="text-caption text-grey-600">
                      {{ formatFileSize(file.file.size) }} • 
                      {{ file.file.type || 'Unknown type' }}
                    </div>
                  </div>
                  
                  <v-btn
                    icon="mdi-close"
                    size="small"
                    variant="text"
                    color="error"
                    @click="removeFile(file.id)"
                    :disabled="file.status === 'uploading'"
                  />
                </div>

                <!-- Progress Bar -->
                <div v-if="file.status === 'uploading' && config.showProgress" class="mt-2">
                  <div class="d-flex justify-space-between mb-1">
                    <span class="text-caption">{{ $t('fileUpload.uploading') }}</span>
                    <span class="text-caption">{{ file.progress }}%</span>
                  </div>
                  <v-progress-linear
                    :model-value="file.progress"
                    color="primary"
                    height="4"
                  />
                </div>

                <!-- Error Message -->
                <div v-if="file.status === 'error'" class="mt-2">
                  <v-alert
                    type="error"
                    variant="tonal"
                    density="compact"
                    class="text-caption"
                  >
                    {{ file.error }}
                  </v-alert>
                </div>

                <!-- Success Message -->
                <div v-if="file.status === 'completed'" class="mt-2">
                  <v-chip
                    color="success"
                    size="small"
                    variant="tonal"
                  >
                    <v-icon start size="16">mdi-check</v-icon>
                    {{ $t('fileUpload.completed') }}
                  </v-chip>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <!-- Upload Actions -->
    <div v-if="hasFiles && !config.autoUpload" class="upload-actions mt-4">
      <v-btn
        color="primary"
        size="large"
        :disabled="!canUpload"
        :loading="isUploading"
        @click="uploadFiles"
        block
      >
        <v-icon start>mdi-cloud-upload</v-icon>
        {{ $t('fileUpload.uploadFiles') }} ({{ files.filter(f => f.status === 'pending').length }})
      </v-btn>
    </div>

    <!-- Validation Errors -->
    <div v-if="validationErrors.length > 0" class="validation-errors mt-4">
      <v-alert
        type="error"
        variant="tonal"
        class="mb-2"
      >
        <div class="text-subtitle-2 mb-2">{{ $t('fileUpload.validationErrors') }}</div>
        <ul class="text-body-2">
          <li v-for="error in validationErrors" :key="error.fileId">
            <strong>{{ error.fileName }}:</strong> {{ error.message }}
          </li>
        </ul>
      </v-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useFileUpload, type FileUploadOptions } from '@/composables/useFileUpload'
import { useUtils } from '@/composables/useUtils'

// Props
interface Props extends Partial<FileUploadOptions> {
  disabled?: boolean
  height?: string | number
  variant?: 'default' | 'compact' | 'minimal'
}

const props = withDefaults(defineProps<Props>(), {
  multiple: true,
  maxFileSize: 50 * 1024 * 1024, // 50MB
  maxFiles: 10,
  accept: () => ['*'],
  showPreview: true,
  showProgress: true,
  autoUpload: false,
  disabled: false,
  height: 200,
  variant: 'default',
  uploadMethod: 'POST',
  uploadUrl: '/api/upload'
})

// Events
const emit = defineEmits<{
  'files-selected': [files: File[]]
  'upload-start': [files: File[]]
  'upload-progress': [progress: any]
  'upload-complete': [results: any[]]
  'upload-error': [error: any]
  'file-removed': [file: File]
}>()

// Template refs
const dropZone = ref<HTMLElement>()
const fileInput = ref<HTMLInputElement>()

// File upload composable
const {
  files,
  isUploading,
  isDragActive,
  validationErrors,
  uploadProgress,
  config,
  hasFiles,
  canUpload,
  failedFiles,
  addFiles,
  removeFile,
  clearFiles,
  uploadFiles,
  cancelUploads,
  retryFailedUploads,
  formatFileSize,
  getFileIcon
} = useFileUpload({
  uploadUrl: props.uploadUrl,
  accept: props.accept,
  maxFileSize: props.maxFileSize,
  maxFiles: props.maxFiles,
  multiple: props.multiple,
  uploadMethod: props.uploadMethod,
  uploadHeaders: props.uploadHeaders,
  showPreview: props.showPreview,
  showProgress: props.showProgress,
  autoUpload: props.autoUpload
})

// Computed properties
const dropZoneClasses = computed(() => ({
  'drop-zone--active': isDragActive.value,
  'drop-zone--disabled': props.disabled,
  'drop-zone--has-files': hasFiles.value,
  [`drop-zone--${props.variant}`]: true
}))

const dropZoneIcon = computed(() => {
  if (isDragActive.value) return 'mdi-cloud-upload'
  if (hasFiles.value) return 'mdi-file-multiple'
  return 'mdi-cloud-upload-outline'
})

const dropZoneTitle = computed(() => {
  if (isDragActive.value) return 'Drop files here'
  if (hasFiles.value) return 'Add more files'
  return 'Upload your files'
})

const dropZoneSubtitle = computed(() => {
  if (isDragActive.value) return 'Release to add files'
  return 'Drag and drop files here, or click to browse'
})

const acceptAttribute = computed(() => {
  if (!props.accept || props.accept.includes('*')) return undefined
  return props.accept.join(',')
})

// Methods
const triggerFileInput = () => {
  if (!props.disabled && fileInput.value) {
    fileInput.value.click()
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const filesArray = Array.from(target.files)
    addFiles(filesArray)
    emit('files-selected', filesArray)
    
    // Reset input
    target.value = ''
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
}

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  isDragActive.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  
  // Only set to false if leaving the drop zone entirely
  if (!dropZone.value?.contains(event.relatedTarget as Node)) {
    isDragActive.value = false
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  isDragActive.value = false

  if (props.disabled) return

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const filesArray = Array.from(files)
    addFiles(filesArray)
    emit('files-selected', filesArray)
  }
}

const fileItemClasses = (file: any) => ({
  'file-item--uploading': file.status === 'uploading',
  'file-item--completed': file.status === 'completed',
  'file-item--error': file.status === 'error',
  'file-item--cancelled': file.status === 'cancelled'
})

// استخدام الدوال المساعدة الموحدة
const { getStatusColor } = useUtils()

const getStatusIcon = (status: string) => {
  const icons = {
    pending: 'mdi-clock-outline',
    uploading: 'mdi-loading mdi-spin',
    completed: 'mdi-check-circle',
    error: 'mdi-alert-circle',
    cancelled: 'mdi-cancel'
  }
  return icons[status as keyof typeof icons] || 'mdi-file'
}

// Cleanup on unmount
onUnmounted(() => {
  clearFiles()
})
</script>

<style scoped>
.file-upload {
  width: 100%;
}

.drop-zone {
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
  min-height: v-bind('props.height + "px"');
  display: flex;
  align-items: center;
  justify-content: center;
}

.drop-zone:hover {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.05);
}

.drop-zone--active {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.1);
  transform: scale(1.02);
}

.drop-zone--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.drop-zone--has-files {
  border-style: solid;
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.drop-zone--compact {
  padding: 1rem;
  min-height: 120px;
}

.drop-zone--minimal {
  padding: 0.75rem;
  min-height: 80px;
  border-radius: 8px;
}

.drop-zone-content {
  max-width: 400px;
}

.upload-info {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.file-list {
  max-height: 400px;
  overflow-y: auto;
}

.file-item {
  transition: all 0.2s ease;
}

.file-item--uploading {
  background: rgba(var(--v-theme-primary), 0.05);
  border-color: rgb(var(--v-theme-primary));
}

.file-item--completed {
  background: rgba(var(--v-theme-success), 0.05);
  border-color: rgb(var(--v-theme-success));
}

.file-item--error {
  background: rgba(var(--v-theme-error), 0.05);
  border-color: rgb(var(--v-theme-error));
}

.file-item--cancelled {
  background: rgba(var(--v-theme-warning), 0.05);
  border-color: rgb(var(--v-theme-warning));
}

.file-preview {
  position: relative;
  width: 48px;
  height: 48px;
}

.preview-container {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-info {
  min-width: 0;
}

.overall-progress {
  padding: 1rem;
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
}

.upload-actions {
  position: sticky;
  bottom: 0;
  padding-top: 1rem;
  background: white;
  z-index: 1;
}

/* RTL Support */
[dir="rtl"] .file-preview {
  margin-right: 0;
  margin-left: 0.75rem;
}

/* Dark theme support removed */

/* Accessibility */
.drop-zone:focus {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Animation for status icons */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

:deep(.mdi-spin) {
  animation: spin 1s linear infinite;
}
</style> 