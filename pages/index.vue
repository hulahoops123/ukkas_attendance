<template>
  <div class="flex flex-col items-center mt-10 relative">
    <!-- Transparent overlay to click and start -->
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

    <!-- Confirmation modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded shadow-lg text-center">
        <template v-if="matchedUser?.isAdmin">
          <p class="text-xl font-bold mb-2">
            Hi {{ currentUserName }}, you’ll be {{ nextAdminAction }} in {{ countdown }}s
          </p>
          <button @click="goToAdminDashboard" class="mt-2 px-4 py-2 bg-purple-600 text-white rounded">
            Go to Admin Dashboard
          </button>
        </template>
        <template v-else>
          <p class="text-xl font-bold mb-4">
            Hi {{ currentUserName }}, you’ve been {{ currentAction }}.
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import FaceCamera from '@/components/FaceCamera.vue'
import { useLocalDb } from '~/composables/useLocalDb'
import * as faceapi from 'face-api.js'

const router = useRouter()
const { getAllUsers, checkTodayLog, addAttendanceLog } = useLocalDb()

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

const nextAdminAction = computed(() => {
  if (!matchedUser.value) return ''
  const todayLog = checkTodayLog(matchedUser.value.name)
  return todayLog.value?.status === 'clocked in' ? 'clocked out' : 'clocked in'
})

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
    if (!faceCam.value) {
      console.log("FaceCamera not mounted.")
      return
    }

    const descriptor = await faceCam.value.getDescriptor()
    console.log("New descriptor:", descriptor)

    if (!descriptor) {
      console.log("No descriptor returned, skipping.")
      return
    }

    const user = getAllUsers().value.find(user =>
      isMatch(descriptor, user.descriptors)
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
    }
  } catch (e) {
    console.error("Error during detection:", e)
  } finally {
    processing.value = false
  }
}

function normalClockFlow(user) {
  const todayLog = checkTodayLog(user.name)
  const newStatus = todayLog.value?.status === 'clocked in' ? 'clocked out' : 'clocked in'
  addAttendanceLog(todayLog, user.name, newStatus)
  currentAction.value = todayLog.value?.status
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
</script>
