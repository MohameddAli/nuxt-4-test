import type { LocaleCode } from "../types";

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatCurrency(
  value: number,
  locale: LocaleCode = "en",
  currency: string = "LY"
): string {
  const intlLocale = locale === "ar" ? "ar" : "en-US";
  return new Intl.NumberFormat(intlLocale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function safeParseInt(value: string, fallback = 0): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

// Export loading utilities
export * from "./loading";
