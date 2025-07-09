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

  // === ATTENDANCE ===
  const attendanceRefs = new Map()

  function getTodayKey(employeeId) {
    return `attendance:${employeeId}:${new Date().toISOString().slice(0,10)}`
  }

  function checkTodayLog(employeeId) {
    const key = getTodayKey(employeeId)
    if (!attendanceRefs.has(key)) {
      attendanceRefs.set(key, useStorage(key, null))
    }
    return attendanceRefs.get(key)
  }

  function addAttendanceLog(todayLogRef, employeeId, status) {
    const log = {
      employeeId,
      status,
      time: new Date().toISOString()
    }
    todayLogRef.value = log
    console.log(`Logged ${status} for ${employeeId} at ${log.time}`)
  }

  return {
    users,
    addUser,
    clearUsers,
    getAllUsers,
    findMatchingUser,
    hasAdmin,
    getAdmin,
    checkTodayLog,
    addAttendanceLog
  }
}
