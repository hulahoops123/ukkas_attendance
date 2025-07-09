<template>
  <div class="flex flex-col items-center mt-10 relative">
    <!-- Transparent overlay to click and start -->
<div v-if="showOverlay" 
     class="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center tex text-3xl font-bold text-black z-50"
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
        <p class="text-xl font-bold mb-4">
          Hi {{ currentUserName }}, you've been {{ currentAction }}.
        </p>
        <button @click="closeModal" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
          OK
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import FaceCamera from '@/components/FaceCamera.vue'
import useAdminSetup from '@/composables/useAdminSetup'
import * as faceapi from 'face-api.js'

const faceCam = ref(null)
const showOverlay = ref(true)
const cameraActive = ref(false)

const showModal = ref(false)
const currentUserName = ref('')
const currentAction = ref('')

const { loadAdminData } = useAdminSetup()
const adminData = loadAdminData()

function isMatch(newDescriptor, storedDescriptors, threshold = 0.6) {
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
  console.log("Face found, trying to match...")

  const descriptor = await faceCam.value.getDescriptor()
  console.log("New descriptor:", descriptor)

  if (descriptor && isMatch(descriptor, adminData.descriptors)) {
    currentUserName.value = adminData.name
    currentAction.value = "clocked in"
    showModal.value = true
    cameraActive.value = false
  } else {
    console.log("No match found, would fallback here.")
    // later will trigger fallback: showFallback.value = true
  }
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
