// types/env.d.ts
interface ImportMetaEnv {
    readonly NUXT_PUBLIC_API_BASE_URL: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }