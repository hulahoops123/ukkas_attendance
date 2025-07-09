export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    const { adminExists } = useAdminSetup()
    if (!adminExists() && to.path !== '/setup') {
      return navigateTo('/setup')
    }
  }
})
