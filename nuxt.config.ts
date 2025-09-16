import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  build: {
    transpile: ["vuetify"],
  },
  srcDir: "app",
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  css: ["@/assets/css/global.css"],

  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error - Vuetify plugin types are incompatible with Vite config types
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/scripts",
    "@pinia/nuxt",
    "@nuxtjs/i18n",
    "@nuxtjs/color-mode",
  ],
  colorMode: {
    preference: "system",
    fallback: "light",
    classSuffix: "",
  },
  i18n: {
    // Lazy loading is implicit when using langDir + file per locale in v8;
    // For TS types, keep only supported keys and rely on file-based loading.
    // nuxt-i18n resolves langDir from an internal "i18n/" base at project root.
    // With srcDir: 'app', point one level up into app/i18n/locales.
    langDir: "../app/i18n/locales",
    locales: [
      { code: "en", file: "en.json", name: "English" },
      { code: "ar", file: "ar.json", name: "العربية", dir: "rtl" },
    ],
    defaultLocale: "en",
    strategy: "no_prefix",
    // Our i18n.config.ts lives at project root, not inside srcDir 'app'
    vueI18n: "../i18n.config.ts",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
    },
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
});
