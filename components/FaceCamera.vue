<template>
  <div class="flex flex-col items-center mt-10">
    <div class="relative inline-block">
      <video ref="video" autoplay muted playsinline class="border rounded w-[320px] h-[240px]" />
      <canvas ref="overlay" class="absolute top-0 left-0 w-full h-full pointer-events-none border-8 border-blue-800" />
      <div v-if="showFeedback"
        class="absolute top-2 left-2 bg-green-600 text-white text-sm font-bold px-2 py-1 rounded pointer-events-none">
        ✔ Face Detected
      </div>
    </div>
  </div>
</template>

<script setup>
import * as faceapi from 'face-api.js'
const emits = defineEmits(['faceFound', 'faceLost'])

const video = ref(null)
const overlay = ref(null)
const showFeedback = ref(false)

const { loadModels, detect, modelsLoaded, detections, getFaceDescriptor } = useFaceApi()

async function startVideo() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
  video.value.srcObject = stream
}

onMounted(async () => {
  await loadModels()
  await startVideo()

  video.value.addEventListener('loadedmetadata', () => {
    if (!overlay.value || !video.value) return
    overlay.value.width = video.value.videoWidth
    overlay.value.height = video.value.videoHeight
    overlay.value.style.width = video.value.clientWidth + 'px'
    overlay.value.style.height = video.value.clientHeight + 'px'
    startLoop()
  })
})

function startLoop() {
  if (!overlay.value) return
  const ctx = overlay.value.getContext('2d')

  function loop() {
    if (!video.value || !overlay.value || !ctx) {
      return requestAnimationFrame(loop)
    }

    if (!video.value.paused && !video.value.ended) {
      detect(video.value).then(() => {
        if (!overlay.value) return

        const displaySize = {
          width: overlay.value.width,
          height: overlay.value.height
        }

        if (!displaySize.width || !displaySize.height) {
          console.warn("Skipping draw, zero dimensions")
          return requestAnimationFrame(loop)
        }

        const resizedDetections = faceapi.resizeResults(
          detections.value.map(d => ({
            detection: d.detection,
            landmarks: d.landmarks
          })),
          displaySize
        )

        ctx.clearRect(0, 0, overlay.value.width, overlay.value.height)
        faceapi.draw.drawDetections(
          overlay.value,
          resizedDetections.map(d => d.detection)
        )
        faceapi.draw.drawFaceLandmarks(
          overlay.value,
          resizedDetections.map(d => d.landmarks)
        )

        showFeedback.value = resizedDetections.length > 0
        if (showFeedback.value) emits('faceFound')
        else emits('faceLost')
      })
    }

    requestAnimationFrame(loop)
  }

  loop()
}

async function getDescriptor() {
  if (!video.value) return null
  return await getFaceDescriptor(video.value)
}

defineExpose({ getDescriptor })
</script>
