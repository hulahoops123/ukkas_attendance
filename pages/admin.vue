<template>
  <div class="max-w-3xl mx-auto mt-10 p-4">
    <h1 class="text-3xl font-bold mb-6">Admin Dashboard</h1>

    <div class="flex flex-wrap gap-3 mb-6">
      <input v-model="searchQuery" placeholder="Search users..." 
             class="border px-3 py-1 rounded flex-1" />
      <button @click="goToAddUser"
              class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">+ Add User</button>
      <button @click="exportUsers"
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Export Users</button>
      <button @click="deleteAllUsers"
              class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete All Users</button>
    </div>

    <!-- USERS -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-2">Registered Users</h2>
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
          <button @click="deleteUser(user.name)"
                  class="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
            Delete
          </button>
        </div>
      </div>
      <p v-else class="text-gray-600">No users registered yet.</p>
    </section>

    <!-- TODAY'S ATTENDANCE -->
    
    <section>
  <h2 class="text-xl font-semibold mb-2">Today’s Attendance Logs</h2>
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

const router = useRouter()
const { users, attendanceRefs, clearUsers } = useLocalDb()

const searchQuery = ref('')

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
  // "attendance:hula:2025-07-10" -> "hula"
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

function exportUsers() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(users.value, null, 2))
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute("href", dataStr)
  downloadAnchor.setAttribute("download", "users.json")
  document.body.appendChild(downloadAnchor) // required for firefox
  downloadAnchor.click()
  downloadAnchor.remove()
}

function deleteUser(name) {
  users.value = users.value.filter(u => u.name !== name)
}

function deleteAllUsers() {
  if (confirm("Are you sure you want to delete all users?")) {
    clearUsers()
  }
}
console.log(todayLogs.value)
</script>
