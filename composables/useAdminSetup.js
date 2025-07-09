// composables/useAdminSetup.js
export default function useAdminSetup() {
  const ADMIN_KEY = 'ukkas_admin'

  function saveAdminData(adminData) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ADMIN_KEY, JSON.stringify(adminData))
    }
  }

  function loadAdminData() {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(ADMIN_KEY)
      return data ? JSON.parse(data) : null
    }
    return null
  }

  function adminExists() {
    if (typeof localStorage !== 'undefined') {
      return !!localStorage.getItem(ADMIN_KEY)
    }
    return false
  }

  function clearAdmin() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(ADMIN_KEY)
    }
  }

  return {
    saveAdminData,
    loadAdminData,
    adminExists,
    clearAdmin
  }
}
