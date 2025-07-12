import { useLocalDb } from '~/composables/useLocalDb'

export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    const { hasAdmin, getCurrentUser } = useLocalDb()
    
    // If no admin exists, redirect to adduser page
    if (!hasAdmin() && to.path !== '/adduser') {
      return navigateTo('/adduser')
    }
    
    // If trying to access admin page, check if current user is admin
    if (to.path === '/admin') {
      const currentUser = getCurrentUser()
      if (!currentUser || !currentUser.isAdmin) {
        return navigateTo('/')
      }
    }
  }
})
