import type {
  I18nTranslate,
  LoadingType,
  RouteLike,
  RouteTextResolverOptions,
  WithLoadingOptions,
} from "~~/shared/types/loading";

// Generate a unique ID for loading operations
export function generateLoadingId(prefix = "loading"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Get i18n loading text by key
export function getLoadingText(
  key: string,
  t?: I18nTranslate,
  fallback?: string
): string {
  if (!t) {
    // Return fallback or default based on key
    if (fallback) return fallback;

    switch (key) {
      case "loading.navigating":
        return "Navigating...";
      case "loading.processing":
        return "Processing...";
      case "loading.saving":
        return "Saving...";
      case "loading.fetching":
        return "Fetching data...";
      case "loading.uploading":
        return "Uploading...";
      case "loading.downloading":
        return "Downloading...";
      case "loading.authenticating":
        return "Authenticating...";
      case "loading.connecting":
        return "Connecting...";
      case "loading.searching":
        return "Searching...";
      default:
        return "Loading...";
    }
  }

  return t(key);
}

// Ensures the promise takes at least minDurationMs to resolve
export async function withMinDuration<T>(
  promise: Promise<T>,
  minDurationMs = 400
): Promise<T> {
  const start = Date.now();
  const result = await promise;
  const elapsed = Date.now() - start;
  if (elapsed < minDurationMs) {
    await new Promise((r) => setTimeout(r, minDurationMs - elapsed));
  }
  return result;
}

// Wrap a promise with a provided start/stop loading API
// start returns a stop function; The wrapper supports debounce and minDuration
export async function withLoading<T>(
  runner: () => Promise<T>,
  start: (opts?: WithLoadingOptions) => () => void,
  options?: WithLoadingOptions
): Promise<T> {
  const { debounceMs = 120, minDurationMs = 400, ...rest } = options || {};

  let stop: (() => void) | null = null;
  let showed = false;
  const showTimer = setTimeout(() => {
    stop = start({ minDurationMs, ...rest });
    showed = true;
  }, debounceMs);

  try {
    const result = await runner();
    if (showed && minDurationMs) {
      // If we showed the loader, we still want to respect min duration
      // The start() impl should handle min duration internally when stop() is called.
    }
    return result;
  } finally {
    clearTimeout(showTimer);
    callIfFunction(stop);
  }
}

// Resolve a user-facing loading text for a given route, with i18n and sensible fallbacks
export function resolveRouteLoadingText(
  to: RouteLike | undefined,
  opts: RouteTextResolverOptions = {}
): string {
  const t: I18nTranslate | undefined = opts.t;
  const routeNameMap = opts.routeNameMap || {};

  const name = (to?.name ?? "")?.toString();
  const path = to?.path ?? "";

  if (name && routeNameMap[name]) return routeNameMap[name];

  // i18n attempt by route name
  if (t && name) {
    const key = `loading.routes.${name}`;
    const translated = t(key);
    if (translated && translated !== key) return translated;
  }

  // derive from path
  const segments = String(path).split("/").filter(Boolean);
  if (segments.length > 0) {
    const first = segments[0] ?? "";
    const main = first
      .replace(/[-_]/g, " ")
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase());
    return t ? t("loading.page", { page: main }) : `Loading ${main}...`;
  }

  return t ? t("loading.generic") : "Loading page...";
}

// Map a LoadingType to a friendly default text if none is provided
export function defaultTextForType(
  type: LoadingType,
  t?: I18nTranslate
): string {
  switch (type) {
    case "navigation":
      return t ? t("loading.navigation") : "Loading page...";
    case "api":
      return t ? t("loading.fetching") : "Loading data...";
    default:
      return t ? t("loading.generic") : "Loading...";
  }
}

// Internal: call a function if value is callable (defensive for TS narrowing)
function callIfFunction(fn: unknown): void {
  if (typeof fn === "function") {
    try {
      (fn as () => void)();
    } catch {
      // swallow
    }
  }
}
