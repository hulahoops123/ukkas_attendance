

<template>
<div class="min-h-screen w-full bg-gray-800 flex flex-col items-center px-4">
    <h1 class="text-4xl font-bold text-gray-200 mt-8 mb-6">Therapist Attendance System</h1>

    <div class="flex flex-col items-center space-y-6 w-full max-w-md">

      <div v-if="showOverlay"
        class="fixed inset-0 bg-black flex items-center justify-center text-3xl font-bold text-black z-50"
        @click="startCamera">
        <OrbAnimation class="border-8 border-pink-600"></OrbAnimation>
      </div>

      <FaceCamera
        v-if="cameraActive"
        @faceFound="handleFaceFound"
        @faceLost="handleFaceLost"
        ref="faceCam"
        class="rounded shadow-lg w-full"
      />

      <div v-if="cameraActive && !showModal" class="bg-black bg-opacity-75 text-white px-6 py-4 rounded-lg shadow w-full">
        <h3 class="text-lg font-semibold mb-3 text-blue-300">Face Recognition Active</h3>
        <div class="space-y-2 text-sm">
          <p class="flex items-center"><span class="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>Stand still and look directly at the camera</p>
          <p class="flex items-center"><span class="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>Keep your face well-lit and visible</p>
          <p class="flex items-center"><span class="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>Wait for recognition to complete</p>
        </div>
        <div class="mt-2 text-xs text-gray-300">Auto-return to idle in {{ remainingIdleTime }}s</div>
      </div>

      <button v-if="cameraActive && !showModal"
        @click="backToIdle"
        class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 w-full">
        ← Back to Idle 
      </button>
    </div>

    <div v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded shadow-lg text-center w-80">
        <template v-if="matchedUser?.isAdmin">
          <p class="text-xl font-bold mb-2">
            Hi {{ currentUserName }}, you’ll be {{ getNextAction(matchedUser) }} in {{ countdown }}s
          </p>
          <button @click="goToAdminDashboard"
            class="mt-2 px-4 py-2 bg-purple-600 text-white rounded w-full">
            Go to Admin Dashboard
          </button>
        </template>

        <template v-else-if="matchedUser">
          <p class="text-xl font-bold mb-4">
            Hi {{ currentUserName }}, you’ve been {{ currentAction }}.
          </p>
          <button @click="closeModal"
            class="mt-2 px-4 py-2 bg-blue-500 text-white rounded w-full">
            OK
          </button>
        </template>

        <template v-else>
          <p class="text-xl font-bold mb-4">
            <span v-if="noMatchAttempts < 3">
              Couldn’t recognize you. Please try again.
            </span>
            <span v-else>
              We still couldn’t find you. Please contact an admin.
            </span>
          </p>
          <div>
            <button v-if="noMatchAttempts < 3" @click="tryAgain"
              class="mt-2 px-4 py-2 bg-green-600 text-white rounded w-full">
              Try Again
            </button>
            <button v-else @click="closeModal"
              class="mt-2 px-4 py-2 bg-gray-600 text-white rounded w-full">
              Back to Idle
            </button>
          </div>
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
const { getAllUsers, addAttendanceLog, getCurrentStatus, setCurrentUser } = useLocalDb()

const faceCam = ref(null)
const showOverlay = ref(true)
const cameraActive = ref(false)

const showModal = ref(false)
const currentUserName = ref('')
const currentAction = ref('')
const matchedUser = ref(null)

const countdown = ref(6)
const countdownTimer = ref(null)
const adminInterrupt = ref(false)
const processing = ref(false)
const noMatchAttempts = ref(0)

// 🕒 Add these refs at the top with your other refs
const cameraInactivityTimer = ref(null)
const noMatchAutoCloseTimer = ref(null)
const remainingIdleTime = ref(20)
const inactivityInterval = ref(null)
const faceDetected = ref(false)

// 🕒 Helper functions
function startInactivityTimeout() {
  clearTimeout(cameraInactivityTimer.value)
  clearInterval(inactivityInterval.value)
  remainingIdleTime.value = 20
  cameraInactivityTimer.value = setTimeout(() => {
    console.log("No activity detected, returning to idle.")
    backToIdle()
  }, 20000)

  // Start the countdown immediately
  inactivityInterval.value = setInterval(() => {
    remainingIdleTime.value--
    if (remainingIdleTime.value <= 0) {
      clearInterval(inactivityInterval.value)
    }
  }, 1000)

  // Start the first countdown tick immediately
  setTimeout(() => {
    if (remainingIdleTime.value > 0) {
      remainingIdleTime.value--
    }
  }, 1000)
}


function clearInactivityTimeout() {
  clearTimeout(cameraInactivityTimer.value)
  clearInterval(inactivityInterval.value)
}

function startNoMatchAutoClose() {
  clearTimeout(noMatchAutoCloseTimer.value)
  noMatchAutoCloseTimer.value = setTimeout(() => {
    console.log("No match after 3 attempts, auto returning to idle.")
    closeModal()
  }, 8000) // 8 seconds
}

// 🛠️ Patch your existing functions

function startCamera() {
  showOverlay.value = false
  cameraActive.value = true
  clearInactivityTimeout() // make sure any old intervals gone
  startInactivityTimeout()
}

async function handleFaceFound() {
  if (processing.value) return
  clearInactivityTimeout()
  faceDetected.value = true
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
      currentUserName.value = user.name

      // Set the current user so they're properly logged in
      setCurrentUser(user)

      if (user.isAdmin) {
        showAdminModal(user)
      } else {
        normalClockFlow(user)
      }

      cameraActive.value = false
    } else {
      console.log("No matching user found.")
      noMatchAttempts.value++
      showNoMatchModal()
      cameraActive.value = false
    }
  } catch (e) {
    console.error("Error during detection:", e)
  } finally {
    processing.value = false
  }
}

function handleFaceLost() {
  // console.log("Face lost")
  faceDetected.value = false
  // Only start timeout if not already running
  if (!cameraInactivityTimer.value) {
    startInactivityTimeout()
  }
}

function showNoMatchModal() {
  matchedUser.value = null
  currentUserName.value = ''
  currentAction.value = ''
  showModal.value = true

  if (noMatchAttempts.value >= 3) {
    startNoMatchAutoClose()
  }
}

function backToIdle() {
  cameraActive.value = false
  showOverlay.value = true
  processing.value = false
  noMatchAttempts.value = 0
  faceDetected.value = false
  clearTimeout(cameraInactivityTimer.value)
  clearTimeout(noMatchAutoCloseTimer.value)
  clearInterval(inactivityInterval.value)
}

function closeModal() {
  showModal.value = false
  showOverlay.value = true
  cameraActive.value = false
  clearTimeout(noMatchAutoCloseTimer.value)

  if (noMatchAttempts.value >= 3) {
    noMatchAttempts.value = 0
  }
}


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

function tryAgain() {
  showModal.value = false
  cameraActive.value = true
}







</script>
