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
    https: true
  },
   app: {
    head: {
      title: 'Therapist Attendance',
      meta: [
        { name: 'description', content: 'Track therapist attendance for kids with ease.' }
      ]
    }
  },
  pwa: {
    manifest: {
      name: "Therapist Atendance",
      short_name: "KIDS",
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
