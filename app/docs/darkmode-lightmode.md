# نظام المظهر (فاتح/داكن) في Nuxt 4 + Vuetify 3 — عميل فقط (بدون SSR)

يوضح هذا الدليل كيف تم بناء نظام مظهر عالمي يعمل على مستوى التطبيق بالكامل باستخدام `@nuxtjs/color-mode` وVuetify 3، مع توافق كامل مع العربية وRTL. الإعداد هنا يعمل على جانب العميل فقط (Client Only) ولا يعتمد على SSR.

## ما الذي نكسبه؟
- تبديل فوري بين الوضعين دون إعادة تحميل الصفحة.
- تفضيل المستخدم محفوظ في التخزين المحلي ويُستعاد تلقائيًا.
- لوحتا ألوان واضحتان وقابلتان للتخصيص من ملف واحد.
- تكامل مع Vuetify بحيث تنعكس الألوان على جميع المكونات مباشرة.

## المتطلبات
- الحزمة موجودة بالفعل: `@nuxtjs/color-mode` (إن لم تكن موجودة: `npm i @nuxtjs/color-mode`).

## الملفات والتعديلات الأساسية
- `nuxt.config.ts`: تفعيل الموديول وإعداد `colorMode` (موجودة لديك).
- `app/theme.ts`: تعريف لوحتي الألوان (فاتح/داكن).
- `app/plugins/vuetify.ts`: ربط Vuetify مع `useColorMode()` وتحديث اسم السمة تلقائيًا.
- `app/composables/useAppTheme.ts`: واجهة بسيطة للتبديل/التعيين من أي مكوّن.
- `app/components/AppHeader.vue`: ربط زر التبديل في الهيدر.

## كيف يعمل؟
1. `@nuxtjs/color-mode` يدير قيمة المظهر الحالية ويخزن تفضيل المستخدم (`system | light | dark`) في `localStorage`.
2. في `app/plugins/vuetify.ts` نقرأ القيمة عبر `useColorMode()` ونحدد `defaultTheme` إلى `light` أو `dark` عند إنشاء Vuetify.
3. نستخدم `watchEffect` لمزامنة `vuetify.theme.global.name` مع أي تغيير في قيمة `colorMode` بشكل فوري.
4. عبر `useAppTheme()` يمكن لأي مكوّن التبديل (`toggle`) أو التعيين الصريح (`setTheme('light'|'dark'|'system')`).

## تخصيص الألوان
قم بتعديل الألوان فقط داخل `app/theme.ts`:

```ts
import type { ThemeDefinition } from 'vuetify'

export const lightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    primary: '#1976D2',
    secondary: '#424242',
    success: '#4CAF50',
    info: '#2196F3',
    warning: '#FFC107',
    error: '#FF5252',
  },
}

export const darkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#0B0B0F',
    surface: '#121212',
    primary: '#90CAF9',
    secondary: '#BDBDBD',
    success: '#81C784',
    info: '#64B5F6',
    warning: '#FFCA28',
    error: '#EF9A9A',
  },
}
```

## استخدام من أي صفحة/مكوّن
```vue
<script setup lang="ts">
const { isDark, toggle, setTheme } = useAppTheme()
</script>

<template>
  <v-btn @click="toggle" aria-label="Toggle theme">
    {{ isDark ? 'Dark' : 'Light' }}
  </v-btn>

  <!-- تعيين صريح -->
  <v-btn @click="setTheme('system')">System</v-btn>
  <v-btn @click="setTheme('light')">Light</v-btn>
  <v-btn @click="setTheme('dark')">Dark</v-btn>

  <!-- الألوان ستنعكس تلقائيًا على جميع مكونات Vuetify -->
  <v-card class="pa-4" color="surface">
    <div class="text-primary">Primary text</div>
    <div class="text-error">Error text</div>
  </v-card>
</template>
```

## ملاحظات هامة
- المشروع يعمل «عميل فقط»، لذلك لا يوجد وميض متعلق بـ SSR. `@nuxtjs/color-mode` يتكفل بإدارة التخزين والمزامنة.
- مفاتيح الترجمة موجودة (`header.toggleTheme`). RTL مفعّل للعربية في إعدادات Vuetify.
- إن تغيرت الألوان ولم تُحدّث، امسح `localStorage` للمفتاح `nuxt-color-mode` وأعد المحاولة.

## فحص سريع
- زر التبديل في الهيدر يغيّر الأيقونة بين الشمس/القمر.
- تغيّر الخلفية والنصوص حسب الوضع عبر رموز Vuetify (`background`, `surface`, `primary`, ...).
- إعادة فتح الصفحة تعيد آخر تفضيل للمستخدم.

انتهى. الآن يمكنك إدارة المظهر بسهولة وتخصيص الهوية البصرية من ملف واحد فقط.
