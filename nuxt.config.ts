// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules:[
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@nuxtjs/google-fonts',
    'nuxt-icon',
    '@kevinmarrec/nuxt-pwa'
  ],
  devServer: {
    https: process.env.NODE_ENV === 'development' && require('fs').existsSync('./localhost-key.pem') ? {
      key: './localhost-key.pem',
      cert: './localhost.pem'
    } : false
  },
  pwa: {
    manifest: {
      name: "HSQUAD PB",
      short_name: "HSQUAD",
      },
    workbox: {
      enabled: true
    }
  },
  googleFonts: {
    // display: "swap",
    download:false,
    families: {
      'Raleway': true,
      'Staatliches':true
    }
  },
})
