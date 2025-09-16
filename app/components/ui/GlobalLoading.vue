<template>
  <div class="global-loading">
    <!-- Top Progress Bar -->
    <Teleport to="body">
      <Transition name="progress-fade">
        <div
          v-if="showTopBar && progressVisible"
          class="global-loading__progress-container"
          role="progressbar"
          :aria-valuemin="0"
          :aria-valuemax="100"
          :aria-valuenow="progressValue"
          :aria-label="progressLabel"
          aria-live="polite"
        >
          <div
            class="global-loading__progress-bar"
            :class="`global-loading__progress-bar--${currentColor}`"
            :style="{ width: `${progressValue}%` }"
          />
        </div>
      </Transition>
    </Teleport>

    <!-- Loading Overlay -->
    <Teleport to="body">
      <Transition
        name="overlay-fade"
        @enter="onOverlayEnter"
        @leave="onOverlayLeave"
      >
        <div
          v-if="showOverlay && isLoading && overlayEnabled"
          class="global-loading__overlay"
          :class="[
            `global-loading__overlay--${currentOverlayVariant}`,
            { 'global-loading__overlay--rtl': isRTL },
          ]"
          role="status"
          :aria-busy="isLoading"
          aria-live="polite"
          :aria-label="loadingText"
        >
          <!-- Backdrop -->
          <div class="global-loading__backdrop" />

          <!-- Content -->
          <div class="global-loading__content">
            <!-- Spinner -->
            <div
              class="global-loading__spinner"
              :class="`global-loading__spinner--${currentColor}`"
              aria-hidden="true"
            >
              <v-progress-circular
                :size="spinnerSize"
                :width="spinnerWidth"
                :color="vuetifyColor"
                indeterminate
              />
            </div>

            <!-- Loading Text -->
            <div class="global-loading__text">
              <Transition name="text-fade" mode="out-in">
                <span :key="loadingText">{{ loadingText }}</span>
              </Transition>
            </div>

            <!-- Operations Debug Info (development only) -->
            <div
              v-if="showDebugInfo && isDevelopment"
              class="global-loading__debug"
            >
              <small>{{ operationsCount }} operation(s) active</small>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useGlobalLoading } from "~~/app/composables/useGlobalLoading";

const props = defineProps({
  showTopBar: {
    type: Boolean,
    default: true,
  },
  showOverlay: {
    type: Boolean,
    default: true,
  },
  overlayVariant: {
    type: String,
    default: "modern",
  },
  spinnerColor: {
    type: String,
    default: "primary",
  },
  spinnerSize: {
    type: Number,
    default: 40,
  },
  spinnerWidth: {
    type: Number,
    default: 4,
  },
  showDebugInfo: {
    type: Boolean,
    default: false,
  },
});

const loading = useGlobalLoading();

// i18n support
let t;
try {
  const { $i18n } = useNuxtApp();
  t = $i18n?.t;
} catch {
  t = undefined;
}

// Computed properties from store
const isLoading = loading.isLoading;
const loadingText = loading.loadingText;
const operationsCount = loading.operationsCount;
const progressValue = loading.progressValue;
const progressVisible = loading.progressVisible;
const overlayEnabled = loading.overlayEnabled;
const currentColor = loading.currentColor;
const overlayVariantFromStore = loading.overlayVariant;

// Use props or store values
const currentOverlayVariant = computed(
  () => props.overlayVariant || overlayVariantFromStore.value
);
const effectiveSpinnerColor = computed(
  () => props.spinnerColor || currentColor.value
);

// Vuetify color mapping
const vuetifyColor = computed(() => {
  const colorKey = effectiveSpinnerColor.value;
  switch (colorKey) {
    case "primary":
      return "primary";
    case "secondary":
      return "secondary";
    case "info":
      return "info";
    case "success":
      return "success";
    case "warning":
      return "warning";
    case "error":
      return "error";
    default:
      return "primary";
  }
});

// Progress bar label for accessibility
const progressLabel = computed(() => {
  const baseText = t ? t("loading.progress") : "Loading progress";
  return `${baseText}: ${Math.round(progressValue.value)}%`;
});

// RTL detection
const isRTL = computed(() => {
  if (typeof document !== "undefined") {
    return (
      document.documentElement.dir === "rtl" ||
      document.documentElement.lang === "ar"
    );
  }
  return false;
});

// Development mode detection
const isDevelopment = computed(() => {
  return process.env.NODE_ENV === "development";
});

// Animation hooks
function onOverlayEnter() {
  if (typeof document !== "undefined") {
    document.body.style.overflow = "hidden";
  }
}

function onOverlayLeave() {
  if (typeof document !== "undefined") {
    document.body.style.overflow = "";
  }
}

// Expose component state for testing
defineExpose({
  isLoading,
  progressVisible,
  overlayEnabled,
  currentColor,
  progressValue,
});
</script>

<style scoped>
/* Progress Bar Styles */
.global-loading__progress-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 9999;
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
}

.global-loading__progress-bar {
  height: 100%;
  transition: width 0.3s ease;
  background: linear-gradient(
    90deg,
    rgb(var(--v-theme-primary)) 0%,
    rgb(var(--v-theme-primary-lighten-1)) 100%
  );
}

.global-loading__progress-bar--primary {
  background: linear-gradient(
    90deg,
    rgb(var(--v-theme-primary)) 0%,
    rgb(var(--v-theme-primary-lighten-1)) 100%
  );
}

.global-loading__progress-bar--secondary {
  background: linear-gradient(
    90deg,
    rgb(var(--v-theme-secondary)) 0%,
    rgb(var(--v-theme-secondary-lighten-1)) 100%
  );
}

.global-loading__progress-bar--info {
  background: linear-gradient(
    90deg,
    rgb(var(--v-theme-info)) 0%,
    rgb(var(--v-theme-info-lighten-1)) 100%
  );
}

.global-loading__progress-bar--success {
  background: linear-gradient(
    90deg,
    rgb(var(--v-theme-success)) 0%,
    rgb(var(--v-theme-success-lighten-1)) 100%
  );
}

.global-loading__progress-bar--warning {
  background: linear-gradient(
    90deg,
    rgb(var(--v-theme-warning)) 0%,
    rgb(var(--v-theme-warning-lighten-1)) 100%
  );
}

.global-loading__progress-bar--error {
  background: linear-gradient(
    90deg,
    rgb(var(--v-theme-error)) 0%,
    rgb(var(--v-theme-error-lighten-1)) 100%
  );
}

/* Overlay Styles */
.global-loading__overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
}

.global-loading__backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(var(--v-theme-surface), 0.8);
  backdrop-filter: blur(2px);
}

.global-loading__content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background-color: rgb(var(--v-theme-surface));
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 90vw;
  min-width: 200px;
}

/* Modern variant */
.global-loading__overlay--modern .global-loading__content {
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  backdrop-filter: blur(8px);
  background-color: rgba(var(--v-theme-surface), 0.95);
}

/* Classic variant */
.global-loading__overlay--classic .global-loading__content {
  border: 2px solid rgb(var(--v-theme-primary));
  background-color: rgb(var(--v-theme-surface));
}

.global-loading__text {
  text-align: center;
  color: rgb(var(--v-theme-on-surface));
  font-weight: 500;
  min-height: 1.5rem;
}

.global-loading__debug {
  opacity: 0.6;
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface-variant));
}

/* RTL Support */
.global-loading__overlay--rtl .global-loading__content {
  direction: rtl;
}

/* Transitions */
.progress-fade-enter-active,
.progress-fade-leave-active {
  transition: opacity 0.3s ease;
}

.progress-fade-enter-from,
.progress-fade-leave-to {
  opacity: 0;
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

.text-fade-enter-active,
.text-fade-leave-active {
  transition: opacity 0.2s ease;
}

.text-fade-enter-from,
.text-fade-leave-to {
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .global-loading__content {
    padding: 1.5rem;
    gap: 0.75rem;
  }
}
</style>
