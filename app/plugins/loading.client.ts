// C:\projects\nuxt\nuxt4\app/plugins/loading.client.ts
import { useLoadingStore } from "#imports";

export default defineNuxtPlugin((nuxtApp) => {
  const loadingStore = useLoadingStore();
  const router = useRouter();

  let navigationOperationId: string | null = null;
  const MIN_LOADING_TIME = 500;

  function startNavigationLoading(toPath: string) {
    if (navigationOperationId) return; // already loading
    const text = `Navigating to ${toPath}...`;
    navigationOperationId = loadingStore.startLoading({ text });
  }

  function finishNavigationLoading() {
    if (!navigationOperationId) return;
    setTimeout(() => {
      loadingStore.stopLoading(navigationOperationId!);
      navigationOperationId = null;
    }, MIN_LOADING_TIME);
  }

  router.beforeEach((to, from) => {
    if (to.path !== from.path) startNavigationLoading(to.path);
  });

  nuxtApp.hook("page:finish", () => {
    finishNavigationLoading();
  });

  router.onError(() => finishNavigationLoading());
  nuxtApp.hook("app:error", () => finishNavigationLoading());
  nuxtApp.hook("app:mounted", () => {
    loadingStore.clearAllLoading();
    navigationOperationId = null;
  });
});
