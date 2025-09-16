import type { ThemeDefinition } from "vuetify";

export const lightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    background: "#FAFAFA",
    surface: "#FFFFFF",
    primary: "#FFC107", // اللون الأصفر الأساسي
    "on-primary": "#000000", // نص أسود على الأصفر لضمان التباين
    secondary: "#424242",
    success: "#4CAF50",
    info: "#2196F3",
    warning: "#FF9800", // برتقالي للتحذير
    error: "#FF5252",
    // ألوان إضافية للثيم الأصفر
    "primary-darken-1": "#FFB300",
    "primary-darken-2": "#FFA000",
    "primary-lighten-1": "#FFCA28",
    "primary-lighten-2": "#FFD54F",
    "primary-lighten-3": "#FFECB3", // للهوفر
  },
};

export const darkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    background: "#0B0B0F",
    surface: "#121212",
    primary: "#FFC107", // نفس اللون الأصفر في الوضع المظلم
    "on-primary": "#000000", // نص أسود على الأصفر
    secondary: "#BDBDBD",
    success: "#81C784",
    info: "#64B5F6",
    warning: "#FFB74D", // برتقالي فاتح للتحذير في الوضع المظلم
    error: "#EF9A9A",
    // ألوان إضافية للثيم الأصفر في الوضع المظلم
    "primary-darken-1": "#FFB300",
    "primary-darken-2": "#FFA000",
    "primary-lighten-1": "#FFCA28",
    "primary-lighten-2": "#FFD54F",
    "primary-lighten-3": "#FFECB3", // للهوفر
  },
};
