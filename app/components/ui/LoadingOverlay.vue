<template>
  <!-- Teleport to body for top-level display -->
  <Teleport to="body">
    <!-- Instant appear, smooth disappear -->
    <Transition
      name="loading-overlay"
      appear
      :duration="{ enter: 0, leave: 300 }"
    >
      <!-- Global loading overlay -->
      <div v-if="isVisible" class="global-loading-overlay">
        <!-- Loading content -->
        <div class="loading-content">
          <!-- Modern spinner -->
          <div class="spinner-container">
            <div
              class="modern-spinner"
              :style="{
                borderTopColor: themeSpinnerColor,
                borderRightColor: `${themeSpinnerColor}50`,
              }"
            />
          </div>

          <!-- Loading text -->
          <div v-if="displayText" class="loading-text">
            {{ displayText }}
          </div>

          <!-- Progress dots -->
          <div class="loading-dots">
            <span
              v-for="i in 3"
              :key="i"
              class="dot"
              :style="{
                backgroundColor: themeSpinnerColor,
                animationDelay: `${(i - 1) * 0.15}s`,
              }"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useTheme } from "vuetify";

// Import loading store
const loadingStore = useLoadingStore();

// Import theme
const theme = useTheme();

// Computed properties
const isVisible = computed(() => loadingStore.isLoading);
const displayText = computed(() => loadingStore.loadingText);
const spinnerColor = computed(() => loadingStore.spinnerColor);

// Spinner color from theme
const themeSpinnerColor = computed(() => {
  const colorName = spinnerColor.value;
  return (
    theme.current.value.colors[colorName] || theme.current.value.colors.primary
  );
});
</script>

<style scoped>
.global-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 99999; /* Increased z-index to ensure it appears above everything */
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  pointer-events: all;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  max-width: 300px;
}

.spinner-container {
  position: relative;
  width: 64px;
  height: 64px;
  margin-bottom: 1.5rem;
}

.modern-spinner {
  width: 64px;
  height: 64px;
  border: 4px solid transparent;
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  position: relative;
}

.modern-spinner::before {
  content: "";
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 4px solid transparent;
  border-top-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: spin 2s linear infinite reverse;
}

.loading-text {
  color: white;
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 1rem;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  line-height: 1.4;
}

.loading-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: dot-pulse 1.4s ease-in-out infinite both;
}

/* Animations */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dot-pulse {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* انتقالات الظهور/الاختفاء - Enter/Leave transitions */
.loading-overlay-enter-active {
  transition: none; /* ظهور فوري */
}

.loading-overlay-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); /* اختفاء سلس */
}

.loading-overlay-enter-from {
  opacity: 1; /* ظهور بشفافية كاملة */
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  transform: scale(1);
}

.loading-overlay-enter-to {
  opacity: 1;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  transform: scale(1);
}

.loading-overlay-leave-from {
  opacity: 1;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  transform: scale(1);
}

.loading-overlay-leave-to {
  opacity: 0; /* اختفاء كامل */
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
  transform: scale(1.05); /* توسع طفيف */
}

/* Responsive Design */
@media (max-width: 480px) {
  .loading-content {
    padding: 1.5rem;
    max-width: 250px;
  }

  .spinner-container {
    width: 48px;
    height: 48px;
    margin-bottom: 1rem;
  }

  .modern-spinner {
    width: 48px;
    height: 48px;
  }

  .loading-text {
    font-size: 1rem;
  }
}

/* Accessibility - Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .modern-spinner,
  .modern-spinner::before {
    animation-duration: 3s;
  }

  .dot {
    animation-duration: 2s;
  }

  .loading-fade-enter-active,
  .loading-fade-leave-active {
    transition-duration: 0.1s;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .global-loading-overlay {
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .loading-text {
    color: white;
    text-shadow: none;
    font-weight: 600;
  }
}
</style>
