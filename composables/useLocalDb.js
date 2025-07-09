// ~/composables/useLocalDb.js
import { useStorage } from '@vueuse/core'

export function useLocalDb() {
  function getTodayKey(employeeId) {
    return `attendance:${employeeId}:${new Date().toISOString().slice(0,10)}`
  }

  function checkTodayLog(employeeId) {
    const key = getTodayKey(employeeId)
    return useStorage(key, null)  // returns a stable ref tied to localStorage
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
    checkTodayLog,
    addAttendanceLog
  }
}
