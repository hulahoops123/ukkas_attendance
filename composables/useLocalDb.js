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


const currentUser = useStorage('currentUser', null, localStorage, {
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

function setCurrentUser(user) {
  currentUser.value = user
}

function getCurrentUser() {
  return currentUser.value
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

    // attendance
    attendanceRefs,
    getTodayKey,
    addAttendanceLog,
    getCurrentStatus
  }
}
