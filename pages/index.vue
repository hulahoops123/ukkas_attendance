<template>
  <div class="min-h-screen w-full flex flex-col items-center px-4 relative" style="z-index: 10;">
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

    <h1 class="text-3xl font-bold text-gray-200 mt-8 mb-6">Therapist Attendance</h1>

    <div class="flex flex-col items-center space-y-6 w-full max-w-md">
      <div v-if="showOverlay"
        class="fixed inset-0 bg-black flex items-center justify-center text-3xl font-bold text-black z-50"
        @click="startCamera">
        <OrbAnimation class="border-8 border-pink-600"></OrbAnimation>
      </div>

      <FaceCamera v-if="cameraActive" @faceFound="handleFaceFound" @faceLost="handleFaceLost" ref="faceCam"
        class="rounded shadow-lg w-full" />

      <div v-if="cameraActive && !showModal"
        class="bg-black bg-opacity-50 text-white px-6 py-4 rounded-lg shadow w-full">
        <h3 class="text-xl font-semibold mb-3 text-blue-300">Face Recognition Active</h3>
        <div class="space-y-3 text-base">
          <p class="flex items-center"><span class="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></span>Stand
            still and look directly at the camera</p>
          <p class="flex items-center"><span class="w-3 h-3 bg-blue-400 rounded-full mr-3"></span>Keep your face
            well-lit and visible</p>
          <p class="flex items-center"><span class="w-3 h-3 bg-yellow-400 rounded-full mr-3"></span>Wait for recognition
            to complete</p>
        </div>
        <div class="mt-3 text-sm text-gray-300">Auto-return to idle in {{ remainingIdleTime }}s</div>
      </div>

      <button v-if="cameraActive && !showModal" @click="backToIdle"
        class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 w-full">
        ← Back to Idle
      </button>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded shadow-lg text-center w-80">
        <template v-if="matchedUser?.isAdmin">
          <div class="mb-4 text-center">
            <p class="text-4xl font-extrabold mb-2 text-gray-800">
              {{ getTimeGreeting() }},
              <span class="text-purple-600">{{ currentUserName }}</span>!
            </p>
            <p class="text-2xl font-semibold text-purple-700">
              You’ll be {{ getNextAction(matchedUser) }} in {{ countdown }}s
            </p>
          </div>
          <button @click="goToAdminDashboard" class="mt-2 px-4 py-2 bg-purple-600 text-white rounded w-full">
            Go to Admin Dashboard
          </button>
        </template>
        <template v-else-if="matchedUser">
          <div class="mb-4 text-center">
            <p class="text-4xl font-extrabold mb-2 text-gray-800">
              {{ getTimeGreeting() }},
              <span class="text-purple-600">{{ currentUserName }}</span>!
            </p>
            <p class="text-2xl font-semibold text-green-700" v-if="currentAction === 'clocked in'">
              Have a great day!
            </p>
            <p class="text-2xl font-semibold text-blue-700" v-else>
              See you later!
            </p>
          </div>
          <button @click="closeModal" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded w-full">
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
            <button v-else @click="closeModal" class="mt-2 px-4 py-2 bg-gray-600 text-white rounded w-full">
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

const cameraInactivityTimer = ref(null)
const noMatchAutoCloseTimer = ref(null)
const remainingIdleTime = ref(20)
const inactivityInterval = ref(null)
const faceDetected = ref(false)

function startInactivityTimeout() {
  clearTimeout(cameraInactivityTimer.value)
  clearInterval(inactivityInterval.value)
  remainingIdleTime.value = 20
  cameraInactivityTimer.value = setTimeout(() => {
    console.log("No activity detected, returning to idle.")
    backToIdle()
  }, 20000)

  inactivityInterval.value = setInterval(() => {
    remainingIdleTime.value--
    if (remainingIdleTime.value <= 0) {
      clearInterval(inactivityInterval.value)
    }
  }, 1000)

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
  }, 8000)
}

function startCamera() {
  showOverlay.value = false
  cameraActive.value = true
  clearInactivityTimeout()
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
  faceDetected.value = false
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

function getTimeGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) {
    return 'Good morning'
  } else if (hour < 18) {
    return 'Good afternoon'
  } else {
    return 'Good evening'
  }
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
  box-shadow: 40vmin 0 5.7vmin currentColor;
}

.ball:nth-child(2) {
  top: 42%;
  left: 2%;
  animation-duration: 53s;
  animation-delay: -29s;
  transform-origin: -19vw 21vh;
  box-shadow: -40vmin 0 5.1vmin currentColor;
}

.ball:nth-child(3) {
  top: 28%;
  left: 18%;
  animation-duration: 49s;
  animation-delay: -8s;
  transform-origin: -22vw 3vh;
  box-shadow: 40vmin 0 5.2vmin currentColor;
}

.ball:nth-child(4) {
  top: 50%;
  left: 79%;
  animation-duration: 26s;
  animation-delay: -21s;
  transform-origin: -17vw -6vh;
  box-shadow: 40vmin 0 5.2vmin currentColor;
}

.ball:nth-child(5) {
  top: 46%;
  left: 15%;
  animation-duration: 36s;
  animation-delay: -40s;
  transform-origin: 4vw 0vh;
  box-shadow: -40vmin 0 5.9vmin currentColor;
}

.ball:nth-child(6) {
  top: 77%;
  left: 16%;
  animation-duration: 31s;
  animation-delay: -10s;
  transform-origin: 18vw 4vh;
  box-shadow: 40vmin 0 5.1vmin currentColor;
}

.ball:nth-child(7) {
  top: 22%;
  left: 17%;
  animation-duration: 55s;
  animation-delay: -6s;
  transform-origin: 1vw -23vh;
  box-shadow: -40vmin 0 5.7vmin currentColor;
}

.ball:nth-child(8) {
  top: 41%;
  left: 47%;
  animation-duration: 43s;
  animation-delay: -28s;
  transform-origin: 25vw -3vh;
  box-shadow: 40vmin 0 5.1vmin currentColor;
}
</style>
