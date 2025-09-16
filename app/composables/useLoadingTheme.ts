import { computed } from "vue";
import { useTheme } from "vuetify";
import type { LoadingColor } from "~~/shared/types/loading";

/**
 * Composable للتحكم بألوان التحميل بناءً على الثيم
 * Theme-based Loading Colors composable
 */
export function useLoadingTheme() {
  const theme = useTheme();

  // خريطة الألوان من الثيم
  // Theme colors mapping
  const getThemeColor = (colorName: LoadingColor): string => {
    return (
      theme.current.value.colors[colorName] ||
      theme.current.value.colors.primary
    );
  };

  // لون التحميل الحالي
  // Current loading color
  const currentLoadingColor = computed(() => getThemeColor("primary"));

  // دالة للحصول على لون محدد من الثيم
  // Function to get specific theme color
  const getLoadingColor = (color: LoadingColor): string => {
    return getThemeColor(color);
  };

  // دالة للحصول على لون مع شفافية
  // Function to get color with opacity
  const getLoadingColorWithOpacity = (
    color: LoadingColor,
    opacity: number = 0.8
  ): string => {
    const themeColor = getThemeColor(color);
    // تحويل hex إلى rgba إذا أمكن
    if (themeColor.startsWith("#")) {
      const hex = themeColor.substring(1);
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return themeColor;
  };

  // الألوان المتاحة من الثيم
  // Available theme colors
  const availableColors = computed((): LoadingColor[] => [
    "primary",
    "secondary",
    "success",
    "info",
    "warning",
    "error",
    "background",
    "surface",
  ]);

  // اختيار لون عشوائي من الثيم
  // Pick random theme color
  const getRandomThemeColor = (): LoadingColor => {
    const colors = availableColors.value;
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // تدرج الألوان حسب الحالة
  // Color gradient based on state
  const getStateBasedColor = (
    state: "loading" | "success" | "error" | "warning"
  ): LoadingColor => {
    const stateMap: Record<string, LoadingColor> = {
      loading: "primary",
      success: "success",
      error: "error",
      warning: "warning",
    };
    return stateMap[state] || "primary";
  };

  return {
    // Properties
    currentLoadingColor,
    availableColors,

    // Methods
    getThemeColor,
    getLoadingColor,
    getLoadingColorWithOpacity,
    getRandomThemeColor,
    getStateBasedColor,
  };
}
