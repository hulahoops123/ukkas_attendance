<template>
  <div class="flex flex-col items-center mt-10">
    <!-- STEP 1: FACE CAPTURE -->
    <div v-if="step === 1" class="flex flex-col items-center">
      <FaceCamera ref="faceCam" @faceFound="faceInFrame = true" @faceLost="faceInFrame = false" />
      <button 
        @click="captureFace"
        class="mt-4 px-4 py-2 rounded bg-blue-500 text-white
               disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed">
        Capture Face ({{ captures }}/5)
      </button>
    </div>

    <!-- STEP 2: SET PIN + EMAIL -->
<!-- STEP 2: SET NAME + PIN + EMAIL -->
<div v-else-if="step === 2" class="flex flex-col items-center space-y-4 w-full max-w-xs">
  <input v-model="userName" type="text" placeholder="Your Name" class="border p-2 rounded w-full" />
  <input v-model="pin" type="password" placeholder="Enter PIN" class="border p-2 rounded w-full" />
  <input v-model="pinConfirm" type="password" placeholder="Confirm PIN" class="border p-2 rounded w-full" />
  <input v-model="email" type="email" placeholder="Admin Email" class="border p-2 rounded w-full" />
  <button @click="saveAdmin" class="px-4 py-2 bg-green-500 text-white rounded w-full">
    Save Admin
  </button>
  <p v-if="pinError" class="text-red-600">{{ pinError }}</p>
</div>


    <!-- STEP 3: DONE -->
    <div v-else class="flex flex-col items-center">
      <p class="text-green-600 font-bold text-xl">Admin setup complete!</p>
      <button @click="goToIdle" class="mt-4 px-4 py-2 bg-gray-700 text-white rounded">
        Go to Home
      </button>
    </div>
  </div>
</template>

<script setup>
import FaceCamera from '@/components/FaceCamera.vue'
const userName = ref('')

const step = ref(1)
const captures = ref(0)
const descriptors = []
const faceInFrame = ref(false)
const pin = ref('')
const pinConfirm = ref('')
const email = ref('')
const pinError = ref('')
const router = useRouter()
const { saveAdminData } = useAdminSetup()
const faceCam = ref(null)

async function captureFace() {
  console.log('captureFace called')
  const descriptor = await faceCam.value.getDescriptor()
  console.log('descriptor:', descriptor)

  if (descriptor) {
    descriptors.push(descriptor)
    captures.value++
    console.log(`Capture ${captures.value}/5 done`)
  } else {
    alert("No face detected at the moment. Please hold steady.")
  }

  if (captures.value >= 5) {
    console.log('Moving to PIN step')
    step.value = 2
  }
}

function saveAdmin() {
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

  saveAdminData({ 
    descriptors, 
    pin: pin.value, 
    email: email.value,
    name: userName.value,
    isAdmin: true
  })
  console.log("Admin saved:", localStorage.getItem('ukkas_admin'))
  step.value = 3
}

function goToIdle() {
  router.push('/')
}
</script>
