// File: shared/types/loading.ts

// أنواع العمليات المختلفة
export type LoadingType = "manual" | "api" | "navigation";

// ألوان المؤشر المتاحة (من الثيم)
export type LoadingColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "background"
  | "surface";

// نوع العملية الواحدة للـ Loading
export interface LoadingOperation {
  id: string; // معرف فريد للعملية
  text: string; // نص التحميل المعروض
  type?: LoadingType; // نوع العملية
  timestamp: number; // وقت إنشاء العملية (ms)
}

// الخيارات عند بدء تحميل جديد
export interface StartLoadingOptions {
  text?: string; // نص التحميل
  type?: LoadingType; // نوع العملية
}

// نوع دالة الترجمة
export type I18nTranslate = (key: string, values?: any) => string;

// نوع الطريق المبسط
export interface RouteLike {
  path?: string;
  name?: string;
  meta?: {
    title?: string;
    [key: string]: any;
  };
}

// خيارات حل نص الطريق
export interface RouteTextResolverOptions {
  t?: I18nTranslate;
  fallback?: string;
}

// خيارات withLoading
export interface WithLoadingOptions {
  text?: string;
  type?: LoadingType;
  debounceMs?: number;
  minDurationMs?: number;
}
