<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center relative">
    <!-- Welcome overlay -->
    <div v-if="showOverlay" 
         class="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 flex flex-col items-center justify-center z-50 text-white">
      <div class="text-center p-8">
        <h1 class="text-5xl font-bold mb-4">Welcome</h1>
        <p class="text-xl mb-8 opacity-90">Face Recognition Attendance System</p>
        
        <div class="bg-white bg-opacity-20 rounded-xl p-8 mb-8 backdrop-blur-sm">
          <svg class="w-24 h-24 mx-auto mb-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
          <p class="text-lg">Position your face in front of the camera</p>
        </div>
        
        <button @click="startCamera"
                class="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-xl hover:bg-gray-100 transition-colors shadow-lg">
          Start Camera
        </button>
        
        <div class="mt-8 flex gap-4">
          <button @click="goToAddUser"
                  class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold">
            + Add New User
          </button>
          <button @click="goToAdmin"
                  class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold">
            Admin Panel
          </button>
        </div>
      </div>
    </div>

    <!-- Camera view -->
    <div v-if="cameraActive" class="w-full max-w-md">
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-2xl font-bold text-center mb-4 text-gray-800">Face Recognition</h2>
        <FaceCamera 
          @faceFound="handleFaceFound" 
          @faceLost="handleFaceLost" 
          ref="faceCam"
        />
        <button @click="cancelCamera"
                class="mt-4 w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
          Cancel
        </button>
      </div>
    </div>

    <!-- Confirmation modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded shadow-lg text-center">
        <h2>{{ currentUser.name }}</h2>
        <template v-if="matchedUser?.isAdmin">
          <p class="text-xl font-bold mb-2">
            Hi {{ currentUser.name }}, you’ll be {{ getNextAction(matchedUser) }} in {{ countdown }}s
          </p>
          <button @click="goToAdminDashboard" class="mt-2 px-4 py-2 bg-purple-600 text-white rounded">
            Go to Admin Dashboard
          </button>
        </template>
        <template v-else>
          <p class="text-xl font-bold mb-4">
            Hi {{ currentUser.name }}, you’ve been {{ currentAction }}.
          </p>
          <button @click="closeModal" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
            OK
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import FaceCamera from '@/components/FaceCamera.vue'
import { useLocalDb } from '~/composables/useLocalDb'
import * as faceapi from 'face-api.js'

const router = useRouter()
const { getAllUsers, addAttendanceLog, getCurrentStatus, setCurrentUser, currentUser, getCurrentUser } = useLocalDb()

const faceCam = ref(null)
const showOverlay = ref(true)
const cameraActive = ref(false)

const showModal = ref(false)
// const currentUserName = ref('')
const currentAction = ref('')
const matchedUser = ref(null)

const countdown = ref(6)
const countdownTimer = ref(null)
const adminInterrupt = ref(false)
const processing = ref(false)

function getNextAction(user) {
  const status = getCurrentStatus(user.name)
  return status === 'clocked in' ? 'clocked out' : 'clocked in'
}

function isMatch(newDescriptor, storedDescriptors, threshold = 0.6) {
  if (!newDescriptor || !storedDescriptors?.length) return false
  const distance = Math.min(...storedDescriptors.map(stored =>
    faceapi.euclideanDistance(new Float32Array(Object.values(stored)), newDescriptor)
  ))
  console.log('Matching distance:', distance)
  return distance < threshold
}

function startCamera() {
  showOverlay.value = false
  cameraActive.value = true
}

async function handleFaceFound() {
  if (processing.value) return
  processing.value = true

  console.log("Face found, trying to match...")

  try {
    if (!faceCam.value) return

    const descriptor = await faceCam.value.getDescriptor()
    if (!descriptor) return

    const user = getAllUsers().value.find(u =>
      isMatch(descriptor, u.descriptors)
    )

    if (user) {
      console.log(`Matched with ${user.name}`)
      matchedUser.value = user
      // currentUserName.value = user.name
      setCurrentUser({
    name: user.name,
    email: user.email,
    pin: user.pin,
    isAdmin: user.isAdmin
  })
      console.log(user)
      console.log(getCurrentUser())
      console.log(currentUser.value)
      

      if (user.isAdmin) {
        showAdminModal(user)
      } else {
        normalClockFlow(user)
      }

      cameraActive.value = false
    } else {
      console.log("No matching user found.")
    }
  } catch (e) {
    console.error("Error during detection:", e)
  } finally {
    processing.value = false
  }
}

function normalClockFlow(user) {
  const currentStatus = getCurrentStatus(user.name)
  const newStatus = currentStatus === 'clocked in' ? 'clocked out' : 'clocked in'

  addAttendanceLog(user.name, newStatus)

  currentAction.value = newStatus
  showModal.value = true
}

function showAdminModal(user) {
  showModal.value = true
  countdown.value = 6
  adminInterrupt.value = false

  countdownTimer.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer.value)
      if (!adminInterrupt.value) {
        console.log("Admin countdown done, proceeding to clock.")
        normalClockFlow(user)
      }
      showModal.value = false
      showOverlay.value = true
    }
  }, 1000)
}

function goToAdminDashboard() {
  console.log("Admin chose dashboard, cancelling clock.")
  adminInterrupt.value = true
  clearInterval(countdownTimer.value)
  showModal.value = false
  router.push('/admin')
}

function handleFaceLost() {
  console.log("Face lost")
}

function closeModal() {
  showModal.value = false
  showOverlay.value = true
  cameraActive.value = false
}

function cancelCamera() {
  cameraActive.value = false
  showOverlay.value = true
}

function goToAddUser() {
  router.push('/adduser')
}

function goToAdmin() {
  router.push('/admin')
}
</script>
