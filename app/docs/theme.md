# دليل إدارة الثيم والألوان

## نظرة عامة

يستخدم هذا المشروع نظام ثيمات متقدم يعتمد على **Vuetify 3** مع متغيرات CSS مخصصة. يتيح لك النظام تغيير الألوان بسهولة وإضافة ألوان جديدة حسب الحاجة.

## هيكل نظام الثيم

### 1. ملفات الثيم الرئيسية

```
app/
├── theme.ts                    # تعريف الثيمات الأساسية
├── assets/css/global.css       # متغيرات CSS المخصصة
└── plugins/vuetify.ts         # تكوين Vuetify
```

### 2. نظام الألوان الحالي

المشروع يستخدم نظام ألوان أصفر كـ primary color مع دعم كامل للوضعين الفاتح والمظلم.

## كيفية تغيير الألوان

### 1. تغيير الألوان الأساسية

#### في ملف `app/theme.ts`:

```typescript
export const lightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    // الألوان الأساسية
    primary: "#FFC107", // اللون الأساسي
    secondary: "#424242", // اللون الثانوي
    success: "#4CAF50", // لون النجاح
    info: "#2196F3", // لون المعلومات
    warning: "#FF9800", // لون التحذير
    error: "#FF5252", // لون الخطأ

    // ألوان الخلفية
    background: "#FAFAFA", // خلفية الصفحة
    surface: "#FFFFFF", // خلفية العناصر

    // ألوان النص
    "on-primary": "#000000", // نص على اللون الأساسي
    "on-secondary": "#FFFFFF", // نص على اللون الثانوي
  },
};
```

### 2. إضافة ألوان جديدة

#### أ) إضافة ألوان مخصصة في الثيم:

```typescript
export const lightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    // الألوان الأساسية الموجودة...

    // ألوان مخصصة جديدة
    "brand-blue": "#1976D2",
    "brand-green": "#388E3C",
    "accent-purple": "#7B1FA2",
    "neutral-gray": "#757575",

    // درجات متدرجة للون مخصص
    "brand-blue-darken-1": "#1565C0",
    "brand-blue-lighten-1": "#42A5F5",
    "brand-blue-lighten-2": "#90CAF9",
  },
};
```

#### ب) إضافة متغيرات CSS في `global.css`:

```css
:root {
  /* الألوان الموجودة... */

  /* ألوان مخصصة جديدة */
  --brand-blue: #1976d2;
  --brand-green: #388e3c;
  --accent-purple: #7b1fa2;
  --neutral-gray: #757575;

  /* درجات متدرجة */
  --brand-blue-dark: #1565c0;
  --brand-blue-light: #90caf9;
  --brand-blue-hover: #42a5f5;
}
```

### 3. استخدام الألوان الجديدة

#### أ) في مكونات Vue:

```vue
<template>
  <!-- استخدام ألوان Vuetify -->
  <v-btn color="brand-blue">زر أزرق</v-btn>
  <v-card color="brand-green">بطاقة خضراء</v-card>

  <!-- استخدام ألوان CSS -->
  <div class="custom-element">عنصر مخصص</div>
</template>

<style scoped>
.custom-element {
  background-color: var(--brand-blue);
  color: white;
}

.custom-element:hover {
  background-color: var(--brand-blue-hover);
}
</style>
```

#### ب) في ملفات CSS:

```css
/* استخدام متغيرات CSS */
.my-component {
  background-color: var(--brand-blue);
  border-color: var(--brand-blue-dark);
}

.my-component:hover {
  background-color: var(--brand-blue-hover);
}

/* استخدام ألوان Vuetify */
.v-btn--color-brand-blue {
  background-color: rgb(var(--v-theme-brand-blue)) !important;
}
```

## أفضل الممارسات

### 1. تسمية الألوان

```typescript
// ✅ أسماء واضحة ومفهومة
'brand-primary': '#1976D2',
'brand-secondary': '#388E3C',
'accent-warning': '#FF9800',

// ❌ أسماء غير واضحة
'color1': '#1976D2',
'blue': '#1976D2',
'btn-color': '#1976D2',
```

### 2. تنظيم الألوان

```typescript
export const lightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    // 1. الألوان الأساسية
    primary: "#FFC107",
    secondary: "#424242",

    // 2. ألوان الحالة
    success: "#4CAF50",
    info: "#2196F3",
    warning: "#FF9800",
    error: "#FF5252",

    // 3. ألوان الخلفية
    background: "#FAFAFA",
    surface: "#FFFFFF",

    // 4. ألوان النص
    "on-primary": "#000000",
    "on-secondary": "#FFFFFF",

    // 5. ألوان مخصصة
    "brand-blue": "#1976D2",
    "brand-green": "#388E3C",
  },
};
```

### 3. ضمان التباين

```typescript
// ✅ تباين جيد
primary: '#FFC107',        // أصفر
'on-primary': '#000000',   // أسود على أصفر

// ❌ تباين ضعيف
primary: '#FFFF00',        // أصفر فاتح جداً
'on-primary': '#FFFFFF',   // أبيض على أصفر فاتح
```

## أمثلة عملية

### 1. تغيير الثيم من أصفر إلى أزرق

```typescript
// في app/theme.ts
export const lightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    primary: "#1976D2", // أزرق بدلاً من أصفر
    "on-primary": "#FFFFFF", // أبيض على أزرق
    "primary-darken-1": "#1565C0",
    "primary-lighten-1": "#42A5F5",
    "primary-lighten-2": "#90CAF9",
    "primary-lighten-3": "#BBDEFB", // للهوفر
  },
};
```

```css
/* في app/assets/css/global.css */
:root {
  --yellow-primary: #1976d2; /* تغيير إلى أزرق */
  --yellow-primary-dark: #1565c0;
  --yellow-primary-light: #bbdefb;
  --yellow-text-on-primary: #ffffff; /* أبيض على أزرق */
  --yellow-hover: #42a5f5;
  --yellow-focus: #90caf9;
}
```

### 2. إضافة ثيم متعدد الألوان

```typescript
export const lightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    // ألوان أساسية متعددة
    primary: "#1976D2", // أزرق
    secondary: "#388E3C", // أخضر
    tertiary: "#7B1FA2", // بنفسجي

    // ألوان الحالة
    success: "#4CAF50",
    info: "#2196F3",
    warning: "#FF9800",
    error: "#FF5252",

    // درجات متدرجة لكل لون
    "primary-darken-1": "#1565C0",
    "primary-lighten-1": "#42A5F5",
    "secondary-darken-1": "#2E7D32",
    "secondary-lighten-1": "#66BB6A",
    "tertiary-darken-1": "#6A1B9A",
    "tertiary-lighten-1": "#AB47BC",
  },
};
```

### 3. إنشاء ثيم مظلم مخصص

```typescript
export const darkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    // ألوان مظلمة مع تباين جيد
    primary: "#90CAF9", // أزرق فاتح
    "on-primary": "#000000", // أسود على أزرق فاتح
    secondary: "#81C784", // أخضر فاتح
    "on-secondary": "#000000",

    // خلفيات مظلمة
    background: "#121212",
    surface: "#1E1E1E",

    // ألوان الحالة للوضع المظلم
    success: "#81C784",
    info: "#64B5F6",
    warning: "#FFB74D",
    error: "#EF9A9A",
  },
};
```

## نصائح متقدمة

### 1. استخدام CSS Custom Properties

```css
:root {
  /* ألوان أساسية */
  --color-primary: #1976d2;
  --color-secondary: #388e3c;

  /* درجات متدرجة تلقائياً */
  --color-primary-50: #e3f2fd;
  --color-primary-100: #bbdefb;
  --color-primary-200: #90caf9;
  --color-primary-300: #64b5f6;
  --color-primary-400: #42a5f5;
  --color-primary-500: #2196f3;
  --color-primary-600: #1e88e5;
  --color-primary-700: #1976d2;
  --color-primary-800: #1565c0;
  --color-primary-900: #0d47a1;
}
```

### 2. إنشاء فئات مساعدة

```css
/* فئات ألوان مساعدة */
.text-primary {
  color: var(--color-primary) !important;
}
.bg-primary {
  background-color: var(--color-primary) !important;
}
.border-primary {
  border-color: var(--color-primary) !important;
}

.text-secondary {
  color: var(--color-secondary) !important;
}
.bg-secondary {
  background-color: var(--color-secondary) !important;
}
.border-secondary {
  border-color: var(--color-secondary) !important;
}
```

### 3. استخدام JavaScript لإدارة الألوان

```typescript
// في composable جديد
export const useThemeColors = () => {
  const getColor = (colorName: string) => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(`--color-${colorName}`)
      .trim();
  };

  const setColor = (colorName: string, value: string) => {
    document.documentElement.style.setProperty(`--color-${colorName}`, value);
  };

  return { getColor, setColor };
};
```

## استكشاف الأخطاء

### 1. مشاكل شائعة

```typescript
// ❌ خطأ: لون غير موجود
<v-btn color="non-existent-color">زر</v-btn>

// ✅ صحيح: استخدام لون موجود
<v-btn color="primary">زر</v-btn>
```

### 2. التحقق من التباين

```css
/* استخدام أدوات التحقق من التباين */
.contrast-check {
  /* نسبة التباين يجب أن تكون 4.5:1 على الأقل */
  background-color: var(--color-primary);
  color: var(--color-on-primary);
}
```

### 3. اختبار الثيمات

```typescript
// اختبار سريع للثيم
const testTheme = () => {
  const colors = [
    "primary",
    "secondary",
    "success",
    "info",
    "warning",
    "error",
  ];
  colors.forEach((color) => {
    console.log(
      `${color}:`,
      getComputedStyle(document.documentElement).getPropertyValue(
        `--v-theme-${color}`
      )
    );
  });
};
```

## الخلاصة

نظام الثيم في هذا المشروع مرن وقابل للتخصيص. يمكنك:

1. **تغيير الألوان الأساسية** في `app/theme.ts`
2. **إضافة ألوان جديدة** كمتغيرات CSS
3. **استخدام الألوان** في المكونات والأنماط
4. **ضمان التباين** والوصولية
5. **إنشاء ثيمات متعددة** حسب الحاجة

اتبع أفضل الممارسات المذكورة أعلاه لضمان ثيم متسق وجميل في جميع أنحاء التطبيق.
