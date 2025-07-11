import { useStorage } from '@vueuse/core'

export function useLocalDb() {
  const users = useStorage('ukkas_users', [])

  function addUser(user) {
    users.value.push(user)
  }

  function clearUsers() {
    users.value = []
  }

  function getAllUsers() {
    return users
  }

  function findMatchingUser(faceDescriptor, matchFn) {
    return users.value.find(user => matchFn(user.descriptor, faceDescriptor))
  }

  function hasAdmin() {
    return users.value.some(user => user.isAdmin)
  }

  function getAdmin() {
    return users.value.find(user => user.isAdmin)
  }

function deleteUser(name) {
  users.value = users.value.filter(u => u.name !== name)
}

function deleteAllUsers() {
  users.value = []
}


const currentUser = useStorage('currentUser', null, undefined, {
  serializer: {
    read: (value) => {
      try {
        return value ? JSON.parse(value) : null
      } catch {
        return null
      }
    },
    write: (value) => JSON.stringify(value)
  }
})

const emailConfig = useStorage('emailConfig', {
  reportEmail: null,
  useCustomEmail: false
})

function setCurrentUser(user) {
  currentUser.value = user
}

function getCurrentUser() {
  return currentUser.value
}

function setReportEmail(email) {
  emailConfig.value.reportEmail = email
  emailConfig.value.useCustomEmail = true
}

function getReportEmail() {
  if (emailConfig.value.useCustomEmail && emailConfig.value.reportEmail) {
    return emailConfig.value.reportEmail
  }
  // Fallback to first user's email
  return users.value[0]?.email || null
}

function resetToFirstUserEmail() {
  emailConfig.value.useCustomEmail = false
  emailConfig.value.reportEmail = null
}


  // === ATTENDANCE ===
 const attendanceRefs = useStorage('attendanceRefs', {}) // one object with all days & users

  function getTodayKey(employeeId) {
    return `attendance:${employeeId}:${new Date().toISOString().slice(0,10)}`
  }

  function addAttendanceLog(employeeId, status) {
    const key = getTodayKey(employeeId)
    const log = {
      status,
      time: new Date().toISOString()
    }

    if (!attendanceRefs.value[key]) {
      attendanceRefs.value[key] = []
    }
    attendanceRefs.value[key].push(log)

    console.log(`Added ${status} for ${employeeId} under ${key}`)
  }

  function getCurrentStatus(employeeId) {
    const key = getTodayKey(employeeId)
    const logs = attendanceRefs.value[key]

    if (logs && logs.length) {
      // safeguard: sort to guarantee latest at end
      logs.sort((a, b) => new Date(a.time) - new Date(b.time))
      return logs[logs.length - 1].status
    }

    return null // no logs yet today
  }

  return {
    // users
    users,
    addUser,
    clearUsers,
    getAllUsers,
    findMatchingUser,
    hasAdmin,
    getAdmin,
    deleteUser,
    deleteAllUsers,
    currentUser,
    setCurrentUser,
    getCurrentUser,

    // email config
    emailConfig,
    setReportEmail,
    getReportEmail,
    resetToFirstUserEmail,

    // attendance
    attendanceRefs,
    getTodayKey,
    addAttendanceLog,
    getCurrentStatus
  }
}
