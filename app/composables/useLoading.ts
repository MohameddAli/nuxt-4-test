// C:\projects\nuxt\nuxt4\app/composables/useLoading.ts
import { useLoadingStore } from "#imports";
import type {
  LoadingColor,
  StartLoadingOptions,
} from "~~/shared/types/loading";

interface LoadingControl {
  updateText: (text: string) => void;
  stop: () => void;
}

export function useLoading() {
  const store = useLoadingStore();

  function start(text?: string) {
    return store.startLoading({ text });
  }

  function stop(id: string) {
    store.stopLoading(id);
  }

  function clearAll() {
    store.clearAllLoading();
  }

  function clearAllLoading() {
    store.clearAllLoading();
  }

  function setSpinnerColor(color: LoadingColor) {
    store.setSpinnerColor(color);
  }

  // Show loading for a specific duration
  async function showLoadingFor(
    durationMs: number,
    options: StartLoadingOptions = {}
  ) {
    const id = store.startLoading(options);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        store.stopLoading(id);
        resolve();
      }, durationMs);
    });
  }

  // Wrap an async function with loading
  async function withLoading<T>(
    fn: () => Promise<T>,
    options: StartLoadingOptions = {}
  ): Promise<T> {
    const id = store.startLoading(options);

    try {
      const result = await fn();
      return result;
    } finally {
      store.stopLoading(id);
    }
  }

  // Start loading with control object
  function startLoading(options: StartLoadingOptions = {}): LoadingControl {
    const id = store.startLoading(options);

    return {
      updateText: (text: string) => {
        store.updateOperationText(id, text);
      },
      stop: () => {
        store.stopLoading(id);
      },
    };
  }

  return {
    start,
    stop,
    clearAll,
    clearAllLoading,
    setSpinnerColor,
    showLoadingFor,
    withLoading,
    startLoading,
    isLoading: store.isLoading,
    loadingText: store.loadingText,
    operationsCount: store.operationsCount,
    spinnerColor: store.spinnerColor,
  };
}
