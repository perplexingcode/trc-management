// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  build: {
    transpile: ['moment'],
  },
  // modules: ['@nuxtjs/axios'],
  css: ['~/assets/css/app.css', '~/assets/css/components.css'],
});
