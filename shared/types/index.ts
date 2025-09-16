export type LocaleCode = "en" | "ar";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

// Export loading types
export * from "./loading";

// Export auth types
export * from "./auth";

// Export notification types
export * from "./notifications";
