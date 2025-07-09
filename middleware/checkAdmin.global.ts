import { useLocalDb } from '~/composables/useLocalDb'

export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    const { hasAdmin } = useLocalDb()
    if (!hasAdmin() && to.path !== '/adduser') {
      return navigateTo('/adduser')
    }
  }
})
