import { z } from 'zod'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('z', z)
})