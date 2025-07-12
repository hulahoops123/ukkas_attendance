<template>
  <div class="max-w-3xl mx-auto mt-10 p-4 relative" style="z-index: 10;">
    <!-- Animated Background -->
    <div class="background">
      <span class="ball"></span>
      <span class="ball"></span>
      <span class="ball"></span>
      <span class="ball"></span>
      <span class="ball"></span>
      <span class="ball"></span>
      <span class="ball"></span>
      <span class="ball"></span>
    </div>
    <h1 class="text-3xl font-bold mb-6">Admin Dashboard</h1>

    <div class="flex flex-wrap gap-3 mb-6">
      <input v-model="searchQuery" placeholder="Search users..." 
             class="border px-3 py-1 rounded flex-1" />
      <button @click="goToHome"
              class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">← Back to Home</button>
      <button @click="goToAddUser"
              class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">+ Add User</button>
      <button @click="exportUsers"
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Export Users</button>
      <input type="file" accept=".json"
             @change="handleImport"
             class="border px-4 py-2 rounded cursor-pointer" />
      <button @click="confirmDeleteAllUsers"
              class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete All Users</button>
      <button @click="emailAttendanceLogs"
              class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Email Attendance</button>
    </div>

    <!-- EMAIL CONFIGURATION -->
    <section class="mb-8 border p-4 rounded bg-gray-50">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-xl font-semibold">Email Configuration</h2>
        <button @click="showEmailConfig = !showEmailConfig"
                class="text-blue-600 hover:text-blue-800 text-sm">
          {{ showEmailConfig ? 'Hide' : 'Configure' }}
        </button>
      </div>
      
      <div class="mb-2">
        <p class="text-sm text-gray-600">Reports are currently sent to:</p>
        <p class="font-semibold">{{ getReportEmail() || 'No email configured' }}</p>
      </div>

      <div v-if="showEmailConfig" class="space-y-3">
        <div class="flex gap-2">
          <input v-model="newEmailAddress" 
                 type="email"
                 placeholder="Enter custom email address"
                 class="border px-3 py-2 rounded flex-1" />
          <button @click="updateReportEmail"
                  class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Set Custom Email
          </button>
        </div>
        <button @click="resetEmailToFirstUser"
                class="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
          Reset to First User's Email
        </button>
      </div>
    </section>

    <!-- USERS -->
    <section class="mb-8 bg-white bg-opacity-90 p-4 rounded-lg">
      <h2 class="text-xl font-semibold mb-2">
        {{ searchQuery ? `Searching for '${searchQuery}'` : 'Registered Users' }}
      </h2>
      <h2 class="text-xl font-semibold mb-2">Current User: {{ currentUserData?.name || 'Not logged in' }}</h2>
      <!-- <h2 class="text-xl font-semibold mb-2">{{ temp }}</h2> -->
      <div v-if="filteredUsers.length" class="space-y-2">
        <div 
          v-for="user in filteredUsers" :key="user.name" 
          class="border p-3 rounded flex justify-between items-center"
        >
          <div>
            <p class="font-bold">{{ user.name }}</p>
            <p class="text-sm text-gray-600">{{ user.email || 'No email' }}</p>
            <p v-if="user.isAdmin" class="text-xs text-purple-600 font-semibold">Admin</p>
          </div>
<button @click="handleDeleteUser(user.name)"
        class="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
  Delete
</button>

        </div>
      </div>
      <p v-else class="text-gray-600">No users registered yet.</p>
    </section>

    <!-- TODAY'S ATTENDANCE -->
        <section class="bg-white bg-opacity-90 p-4 rounded-lg">
      <h2 class="text-xl font-semibold mb-2">Today's Attendance Logs</h2>
      <div v-if="Object.keys(todayLogs).length" class="space-y-4">
        <div 
          v-for="(logs, key) in todayLogs" :key="key"
          class="border p-4 rounded"
        >
          <p class="font-bold mb-2">{{ getEmployeeNameFromKey(key) }}</p>
          <ul class="list-disc ml-6 text-sm text-gray-700">
            <li v-for="(log, index) in logs" :key="index">
              {{ log.status }} at {{ formatTime(log.time) }}
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

// Reactive current user for display
const currentUserData = computed(() => getCurrentUser())

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

function goToHome() {
  router.push('/')
}

function goToAddUser() {
  router.push('/adduser')
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
  const current = currentUserData.value
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

<style scoped>
@keyframes move {
  100% {
    transform: translate3d(0, 0, 1px) rotate(360deg);
  }
}

.background {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  background: #4CB8B6;
  overflow: hidden;
  z-index: -10;
}

.ball {
  position: absolute;
  width: 20vmin;
  height: 20vmin;
  border-radius: 50%;
  backface-visibility: hidden;
  animation: move linear infinite;
}

.ball:nth-child(odd) {
    color: #006D5B;
}

.ball:nth-child(even) {
    color: #FF6F61;
}

.ball:nth-child(1) {
  top: 77%;
  left: 88%;
  animation-duration: 40s;
  animation-delay: -3s;
  transform-origin: 16vw -2vh;
  box-shadow: 40vmin 0 5.703076368487546vmin currentColor;
}
.ball:nth-child(2) {
  top: 42%;
  left: 2%;
  animation-duration: 53s;
  animation-delay: -29s;
  transform-origin: -19vw 21vh;
  box-shadow: -40vmin 0 5.17594621519026vmin currentColor;
}
.ball:nth-child(3) {
  top: 28%;
  left: 18%;
  animation-duration: 49s;
  animation-delay: -8s;
  transform-origin: -22vw 3vh;
  box-shadow: 40vmin 0 5.248179047256236vmin currentColor;
}
.ball:nth-child(4) {
  top: 50%;
  left: 79%;
  animation-duration: 26s;
  animation-delay: -21s;
  transform-origin: -17vw -6vh;
  box-shadow: 40vmin 0 5.279749632220298vmin currentColor;
}
.ball:nth-child(5) {
  top: 46%;
  left: 15%;
  animation-duration: 36s;
  animation-delay: -40s;
  transform-origin: 4vw 0vh;
  box-shadow: -40vmin 0 5.964309466052033vmin currentColor;
}
.ball:nth-child(6) {
  top: 77%;
  left: 16%;
  animation-duration: 31s;
  animation-delay: -10s;
  transform-origin: 18vw 4vh;
  box-shadow: 40vmin 0 5.178483653434181vmin currentColor;
}
.ball:nth-child(7) {
  top: 22%;
  left: 17%;
  animation-duration: 55s;
  animation-delay: -6s;
  transform-origin: 1vw -23vh;
  box-shadow: -40vmin 0 5.703026794398318vmin currentColor;
}
.ball:nth-child(8) {
  top: 41%;
  left: 47%;
  animation-duration: 43s;
  animation-delay: -28s;
  transform-origin: 25vw -3vh;
  box-shadow: 40vmin 0 5.196265905749415vmin currentColor;
}
</style>
