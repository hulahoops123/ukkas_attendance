<template>
  <div class="flex flex-col items-center mt-10 relative">
    <div v-if="showOverlay"
      class="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center text-3xl font-bold text-black z-50"
      @click="startCamera">
      👆 Tap to start camera
    </div>

<FaceCamera
  v-if="cameraActive"
  @faceFound="handleFaceFound"
  @faceLost="handleFaceLost"
  ref="faceCam"
/>


<button v-if="cameraActive && !showModal" @click="backToIdle"
  class="absolute top-4 right-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 z-40">
  ← Back to Idle ({{ remainingIdleTime }}s)
</button>

    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded shadow-lg text-center">
        <!-- Admin modal -->
        <template v-if="matchedUser?.isAdmin">
          <p class="text-xl font-bold mb-2">
            Hi {{ currentUserName }}, you’ll be {{ getNextAction(matchedUser) }} in {{ countdown }}s
          </p>
          <button @click="goToAdminDashboard" class="mt-2 px-4 py-2 bg-purple-600 text-white rounded">
            Go to Admin Dashboard
          </button>
        </template>

        <template v-else-if="matchedUser">
          <p class="text-xl font-bold mb-4">
            Hi {{ currentUserName }}, you’ve been {{ currentAction }}.
          </p>
          <button @click="closeModal" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
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
            <button v-if="noMatchAttempts < 3" @click="tryAgain" class="mt-2 px-4 py-2 bg-green-600 text-white rounded">
              Try Again
            </button>
            <button v-else @click="closeModal" class="mt-2 px-4 py-2 bg-gray-600 text-white rounded">
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
const { getAllUsers, addAttendanceLog, getCurrentStatus } = useLocalDb()

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

// 🕒 Helper functions
function startInactivityTimeout() {
  clearTimeout(cameraInactivityTimer.value)
  clearInterval(inactivityInterval.value)
  remainingIdleTime.value = 20
  console.log("tinactiviuty timer started")
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
  startInactivityTimeout()
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
