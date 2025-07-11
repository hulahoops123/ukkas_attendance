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
    https: {
      key: './localhost-key.pem',
      cert: './localhost.pem'
    }
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
