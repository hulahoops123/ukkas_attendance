<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
    <div class="container mx-auto px-6 py-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-4xl font-bold text-gray-800">Add New User</h1>
        <button @click="goHome" 
                class="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          Home
        </button>
      </div>

      <div class="flex flex-col items-center">
        <div v-if="step === 1" class="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <h2 class="text-2xl font-bold text-center mb-6 text-gray-800">Step 1: Face Recognition Setup</h2>
          <p class="text-gray-600 text-center mb-6">Position your face in the camera and capture 5 photos for recognition</p>
          
          <div class="flex flex-col items-center">
            <FaceCamera ref="faceCam" @faceFound="faceInFrame = true" @faceLost="faceInFrame = false" />
            <button 
              @click="captureFace"
              :disabled="!faceInFrame"
              class="mt-6 px-8 py-3 rounded-lg font-semibold text-lg transition-colors shadow-md
                     bg-blue-600 text-white hover:bg-blue-700
                     disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed disabled:shadow-none">
              {{ faceInFrame ? `Capture Face (${captures}/5)` : 'Position your face in frame' }}
            </button>
            
            <div class="mt-4 flex gap-2">
              <div v-for="i in 5" :key="i" 
                   :class="i <= captures ? 'bg-blue-600' : 'bg-gray-200'"
                   class="w-3 h-3 rounded-full transition-colors"></div>
            </div>
          </div>
        </div>

        <div v-else-if="step === 2" class="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <h2 class="text-2xl font-bold text-center mb-6 text-gray-800">Step 2: User Information</h2>
          <p class="text-gray-600 text-center mb-6">Enter your details to complete registration</p>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input v-model="userName" type="text" placeholder="Enter your full name" 
                     class="border-2 border-gray-200 p-3 rounded-lg w-full focus:border-green-500 focus:outline-none transition-colors" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">PIN</label>
              <input v-model="pin" type="password" placeholder="Create a PIN" 
                     class="border-2 border-gray-200 p-3 rounded-lg w-full focus:border-green-500 focus:outline-none transition-colors" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Confirm PIN</label>
              <input v-model="pinConfirm" type="password" placeholder="Confirm your PIN" 
                     class="border-2 border-gray-200 p-3 rounded-lg w-full focus:border-green-500 focus:outline-none transition-colors" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input v-model="email" type="email" placeholder="Enter your email" 
                     class="border-2 border-gray-200 p-3 rounded-lg w-full focus:border-green-500 focus:outline-none transition-colors" />
            </div>
            
            <button @click="saveUser" 
                    class="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg shadow-md mt-6">
              Save User
            </button>
            
            <p v-if="pinError" class="text-red-600 text-center text-sm mt-2">{{ pinError }}</p>
          </div>
        </div>

        <div v-else class="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div class="mb-6">
            <svg class="w-16 h-16 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-green-600 font-bold text-xl mb-2">Success!</p>
            <p class="text-gray-700">{{ completionMsg }}</p>
          </div>
          <button @click="goToIdle" 
                  class="px-8 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold shadow-md">
            Go to Home
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useLocalDb } from '~/composables/useLocalDb'
import FaceCamera from '@/components/FaceCamera.vue'

// local state
const step = ref(1)
const captures = ref(0)
const descriptors = []
const faceInFrame = ref(false)

const userName = ref('')
const pin = ref('')
const pinConfirm = ref('')
const email = ref('')
const pinError = ref('')
const completionMsg = ref('')

// composable
const { addUser, hasAdmin } = useLocalDb()
const faceCam = ref(null)
const router = useRouter()

async function captureFace() {
  const descriptor = await faceCam.value.getDescriptor()
  if (descriptor) {
    descriptors.push(descriptor)
    captures.value++
    console.log(`Capture ${captures.value}/5 done`)
  } else {
    alert("No face detected at the moment. Please hold steady.")
  }

  if (captures.value >= 5) {
    step.value = 2
  }
}

function saveUser() {
  pinError.value = ''
  if (!userName.value) {
    pinError.value = "Name cannot be empty."
    return
  }
  if (!pin.value || !pinConfirm.value) {
    pinError.value = "PIN fields cannot be empty."
    return
  }
  if (pin.value !== pinConfirm.value) {
    pinError.value = "PINs do not match."
    return
  }
  if (!email.value || !/.+@.+\..+/.test(email.value)) {
    pinError.value = "Please enter a valid email address."
    return
  }

  const isFirstAdmin = !hasAdmin()
  addUser({
    name: userName.value,
    pin: pin.value,
    email: email.value,
    descriptors,
    isAdmin: isFirstAdmin
  })

  completionMsg.value = isFirstAdmin
    ? `Admin setup complete for ${userName.value}!`
    : `User ${userName.value} added successfully!`

  step.value = 3
}

function goToIdle() {
  router.push('/')
}

function goHome() {
  router.push('/')
}
</script>
