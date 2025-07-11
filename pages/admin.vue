<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="max-w-4xl mx-auto p-6">
      <!-- Header with back button -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
        <button @click="goHome" 
                class="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          Home
        </button>
      </div>

      <!-- Action buttons -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div class="flex flex-wrap gap-3 mb-4">
          <input v-model="searchQuery" placeholder="Search users..." 
                 class="border-2 border-gray-200 px-4 py-2 rounded-lg flex-1 min-w-64 focus:border-blue-500 focus:outline-none transition-colors" />
        </div>
        <div class="flex flex-wrap gap-3">
          <button @click="goToAddUser"
                  class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md">
            + Add User
          </button>
          <button @click="exportUsers"
                  class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md">
            Export Users
          </button>
          <input type="file" accept=".json"
                 @change="handleImport"
                 class="border-2 border-gray-200 px-4 py-3 rounded-lg cursor-pointer hover:border-gray-300 transition-colors" />
          <button @click="confirmDeleteAllUsers"
                  class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md">
            Delete All Users
          </button>
          <button @click="emailAttendanceLogs"
                  class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-md">
            Email Attendance
          </button>
        </div>
      </div>

      <!-- EMAIL CONFIGURATION -->
      <section class="mb-8 bg-white rounded-xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-xl font-semibold">Email Configuration</h2>
          <button @click="showEmailConfig = !showEmailConfig"
                  class="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
            {{ showEmailConfig ? 'Hide' : 'Configure' }}
          </button>
        </div>
        
        <div class="mb-2">
          <p class="text-sm text-gray-600">Reports are currently sent to:</p>
          <p class="font-semibold">{{ getReportEmail() || 'No email configured' }}</p>
        </div>

        <div v-if="showEmailConfig" class="space-y-3">
          <div class="flex gap-3">
            <input v-model="newEmailAddress" 
                   type="email"
                   placeholder="Enter custom email address"
                   class="border-2 border-gray-200 px-4 py-2 rounded-lg flex-1 focus:border-blue-500 focus:outline-none transition-colors" />
            <button @click="updateReportEmail"
                    class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
              Set Custom Email
            </button>
          </div>
          <button @click="resetEmailToFirstUser"
                  class="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors font-medium">
            Reset to First User's Email
          </button>
        </div>
      </section>

      <!-- USERS -->
      <section class="mb-8 bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-semibold mb-2">
          {{ searchQuery ? `Searching for '${searchQuery}'` : 'Registered Users' }}
        </h2>
        <h2 class="text-xl font-semibold mb-2">Current User: {{ getCurrentUser()?.name || 'Not logged in' }}</h2>
        <!-- <h2 class="text-xl font-semibold mb-2">{{ temp }}</h2> -->
        <div v-if="filteredUsers.length" class="space-y-2">
          <div 
            v-for="user in filteredUsers" :key="user.name" 
            class="border-2 border-gray-100 p-4 rounded-lg flex justify-between items-center hover:border-gray-200 transition-colors"
          >
            <div>
              <p class="font-bold text-lg text-gray-800">{{ user.name }}</p>
              <p class="text-sm text-gray-600">{{ user.email || 'No email' }}</p>
              <p v-if="user.isAdmin" class="text-xs text-purple-600 font-semibold bg-purple-100 px-2 py-1 rounded-full inline-block mt-1">Admin</p>
            </div>
            <button @click="handleDeleteUser(user.name)"
                    class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium shadow-md">
              Delete
            </button>
          </div>
        </div>
        <p v-else class="text-gray-600">No users registered yet.</p>
      </section>

      <!-- TODAY'S ATTENDANCE -->
      <section class="bg-white rounded-xl shadow-lg p-6">
      <h2 class="text-xl font-semibold mb-2">Today’s Attendance Logs</h2>
      <div v-if="Object.keys(todayLogs).length" class="space-y-4">
        <div 
          v-for="(logs, key) in todayLogs" :key="key"
          class="border-2 border-gray-100 p-4 rounded-lg hover:border-gray-200 transition-colors"
        >
          <p class="font-bold mb-3 text-lg text-gray-800">{{ getEmployeeNameFromKey(key) }}</p>
          <ul class="space-y-1">
            <li v-for="(log, index) in logs" :key="index" class="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded">
              <span class="font-medium">{{ log.status }}</span> at {{ formatTime(log.time) }}
            </li>
          </ul>
        </div>
      </div>
      <p v-else class="text-gray-600">No attendance recorded today yet.</p>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useLocalDb } from '~/composables/useLocalDb'
import { useEmail } from '~/composables/useEmail'

const router = useRouter()
const { users, attendanceRefs, deleteUser, deleteAllUsers, currentUser, getCurrentUser, emailConfig, setReportEmail, getReportEmail, resetToFirstUserEmail } = useLocalDb()
const { sendEmail } = useEmail()

const searchQuery = ref('')
const showEmailConfig = ref(false)
const newEmailAddress = ref('')

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  return users.value.filter(u => u.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const todayKeyPrefix = new Date().toISOString().slice(0,10)

const todayLogs = computed(() => {
  const logs = {}
  for (const key in attendanceRefs.value) {
    if (key.includes(todayKeyPrefix)) {
      logs[key] = attendanceRefs.value[key]
    }
  }
  return logs
})

function getEmployeeNameFromKey(key) {
  return key.split(':')[1]
}

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function goToAddUser() {
  router.push('/adduser')
}

function goHome() {
  router.push('/')
}

function exportUsers() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(users.value, null, 2))
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute("href", dataStr)
  downloadAnchor.setAttribute("download", "users.json")
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
}

function handleImport(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = e => {
    try {
      const importedUsers = JSON.parse(e.target.result)
      if (Array.isArray(importedUsers)) {
        users.value = importedUsers
        alert("Users imported successfully!")
      } else {
        alert("Invalid format. Expected an array.")
      }
    } catch (err) {
      alert("Error parsing JSON file.")
    }
  }
  reader.readAsText(file)
}
function handleDeleteUser(name) {
  const current = getCurrentUser()
  console.log('Current user:', JSON.stringify(current))
  console.log('Current user name:', current?.name)
  console.log('Trying to delete:', name)
  console.log('Names match:', current?.name === name)
  
  if (current && current.name === name) {
    alert("You cannot delete yourself. Use 'Delete All Users' to reset.")
    return
  }
  
  if (confirm(`Are you sure you want to delete user "${name}"?`)) {
    deleteUser(name)
  }
}

function confirmDeleteAllUsers() {
  if (confirm("Are you sure you want to delete all users?")) {
    deleteAllUsers()
  }
}

async function emailAttendanceLogs(event) {
  const reportEmail = getReportEmail()
  if (!reportEmail) {
    alert("No email address configured. Please set up an email address in the Email Configuration section.")
    return
  }

  try {
    // Show loading state
    const button = event.target
    const originalText = button.textContent
    button.textContent = 'Sending...'
    button.disabled = true

    // Format today's attendance logs for email
    const emailBody = formatAttendanceForEmail()
    const subject = `Attendance Report - ${new Date().toLocaleDateString()}`
    
    // Send email using the composable
    const result = await sendEmail(
      reportEmail,
      'Admin',
      subject,
      emailBody
    )

    if (result.success) {
      alert('Attendance report sent successfully!')
    } else {
      throw new Error(result.error)
    }
    
    // Restore button state
    button.textContent = originalText
    button.disabled = false
    
  } catch (error) {
    console.error('Failed to send email:', error)
    alert('Failed to send email. Please try again.')
    
    // Restore button state
    const button = event.target
    button.textContent = 'Email Attendance'
    button.disabled = false
  }
}

function formatAttendanceForEmail() {
  const today = new Date().toLocaleDateString()
  let emailContent = `Attendance Report for ${today}\n\n`
  
  if (Object.keys(todayLogs.value).length === 0) {
    emailContent += "No attendance recorded today.\n"
  } else {
    for (const [key, logs] of Object.entries(todayLogs.value)) {
      const employeeName = getEmployeeNameFromKey(key)
      emailContent += `${employeeName}:\n`
      
      logs.forEach(log => {
        const time = formatTime(log.time)
        emailContent += `  - ${log.status} at ${time}\n`
      })
      emailContent += "\n"
    }
  }
  
  emailContent += `\nReport generated on ${new Date().toLocaleString()}`
  return emailContent
}

function updateReportEmail() {
  if (!newEmailAddress.value) {
    alert('Please enter a valid email address.')
    return
  }
  
  setReportEmail(newEmailAddress.value)
  newEmailAddress.value = ''
  showEmailConfig.value = false
  alert('Email address updated successfully!')
}

function resetEmailToFirstUser() {
  resetToFirstUserEmail()
  showEmailConfig.value = false
  alert('Email reset to first user\'s email address.')
}
</script>
