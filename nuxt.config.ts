// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  build: {
    transpile: ['moment'],
  },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/app.css', '~/assets/css/components.css'],
  pinia: {
    autoImports: ['defineStore'],
  },
  components: {
    global: true,
    dirs: ['~/components'],
  },
});
