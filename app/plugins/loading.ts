import { defineNuxtPlugin } from "#app";
import { useLoading, useLoadingStore } from "#imports";
import { resolveRouteLoadingText } from "~~/shared/utils/loading";

export default defineNuxtPlugin((nuxtApp) => {
  if (!process.client) return;

  // Lazy-resolved references to avoid timing issues with Pinia
  let loading: ReturnType<typeof useLoading> | null = null;
  let loadingStore: ReturnType<typeof useLoadingStore> | null = null;
  let navigationStopper: (() => void) | null = null;
  let navigationShowTimer: number | null = null;
  let isMounted = false;

  function ensureLoading() {
    if (!loading) loading = useLoading();
    if (!loadingStore) loadingStore = useLoadingStore();
  }

  function getLoadingTextForRoute(to: any): string {
    const { $i18n } = nuxtApp;
    const t = $i18n?.t?.bind($i18n) as
      | ((key: string, params?: Record<string, unknown>) => string)
      | undefined;
    return resolveRouteLoadingText(to, { t });
  }

  // Utility to stop navigation loading cleanly
  function stopNavIfAny() {
    if (navigationShowTimer) {
      clearTimeout(navigationShowTimer);
      navigationShowTimer = null;
    }
    if (navigationStopper) {
      navigationStopper();
      navigationStopper = null;
    }
  }

  function startNavigationLoading(to: any) {
    ensureLoading();
    // Check if navigation loading is enabled
    if (!loadingStore!.navigationEnabled) return;

    // Stop existing navigation loading if any
    stopNavIfAny();

    const text = getLoadingTextForRoute(to);
    // Debounce initial show to avoid flash during very fast navigations
    navigationShowTimer = window.setTimeout(() => {
      navigationStopper = loading!.beginLoading({
        text,
        type: "navigation",
        minDurationMs: 400,
      });
      navigationShowTimer = null;
    }, 120);
  }

  function stopNavigationLoading() {
    ensureLoading();
    if (navigationShowTimer) {
      clearTimeout(navigationShowTimer);
      navigationShowTimer = null;
      return;
    }
    if (navigationStopper) {
      // Small delay for smoother UX (allow page to paint)
      setTimeout(() => {
        if (navigationStopper) {
          navigationStopper();
          navigationStopper = null;
        }
      }, 180);
    }
  }

  // Use Nuxt page hooks for navigation lifecycle
  nuxtApp.hook("app:mounted", () => {
    isMounted = true;
  });

  nuxtApp.hook("page:start", () => {
    if (!isMounted) return; // avoid SSR hydration mismatch on first paint
    const to = nuxtApp.$router?.currentRoute?.value;
    if (to) startNavigationLoading(to);
  });

  nuxtApp.hook("page:finish", () => {
    stopNavigationLoading();
  });

  // Also handle generic app/vue errors by clearing any loading
  nuxtApp.hook("app:error", () => {
    ensureLoading();
    stopNavIfAny();
    loadingStore!.clearAllLoading();
  });

  nuxtApp.hook("vue:error", () => {
    ensureLoading();
    stopNavIfAny();
    loadingStore!.clearAllLoading();
  });

  // Expose $loading helper
  return {
    provide: {
      loading: () => {
        ensureLoading();
        return loading!;
      },
    },
  };
});
