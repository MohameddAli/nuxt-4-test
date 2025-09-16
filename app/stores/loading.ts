// C:\projects\nuxt\nuxt4\app/stores/loading.ts
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type {
  LoadingColor,
  LoadingOperation,
  StartLoadingOptions,
} from "~~/shared/types/loading";

export const useLoadingStore = defineStore("loading", () => {
  const operations = ref<Map<string, LoadingOperation>>(new Map());
  const spinnerColor = ref<LoadingColor>("primary");

  const isLoading = computed(() => operations.value.size > 0);
  const operationsCount = computed(() => operations.value.size);
  const loadingText = computed(() => {
    if (!isLoading.value) return "";
    const firstOp = Array.from(operations.value.values())[0];
    return firstOp?.text ?? "Loading...";
  });

  function generateOperationId(): string {
    return `loading_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  function addOperation(options: StartLoadingOptions = {}): string {
    const id = generateOperationId();
    const { text = "Loading...", type = "manual" } = options;
    operations.value.set(id, { id, text, type, timestamp: Date.now() });
    return id;
  }

  function removeOperation(id: string) {
    operations.value.delete(id);
  }

  function startLoading(options: StartLoadingOptions = {}): string {
    return addOperation(options);
  }

  function stopLoading(id: string) {
    removeOperation(id);
  }

  function clearAllLoading() {
    operations.value.clear();
  }

  function cleanupOldOperations(maxAge = 60000) {
    const now = Date.now();
    const toRemove: string[] = [];

    operations.value.forEach((op) => {
      if (now - op.timestamp > maxAge) {
        toRemove.push(op.id);
      }
    });

    toRemove.forEach((id) => operations.value.delete(id));
  }

  function setSpinnerColor(color: LoadingColor) {
    spinnerColor.value = color;
  }

  function updateOperationText(id: string, text: string) {
    const operation = operations.value.get(id);
    if (operation) {
      operation.text = text;
    }
  }

  return {
    isLoading,
    loadingText,
    operationsCount,
    spinnerColor,
    startLoading,
    stopLoading,
    clearAllLoading,
    cleanupOldOperations,
    setSpinnerColor,
    updateOperationText,
  };
});
