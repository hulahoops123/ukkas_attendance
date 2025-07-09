import * as faceapi from 'face-api.js'

export default function useFaceApi() {
  const modelsLoaded = ref(false)
  const detections = ref([])

  async function loadModels() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models')
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models')
    modelsLoaded.value = true
  }

  async function detect(video) {
    if (!modelsLoaded.value) return

    const options = new faceapi.TinyFaceDetectorOptions()
    const result = await faceapi.detectAllFaces(video, options)
      .withFaceLandmarks()
      .withFaceDescriptors()

    detections.value = result
  }

  async function getFaceDescriptor(video) {
    if (!modelsLoaded.value) return null

    const options = new faceapi.TinyFaceDetectorOptions()
    const result = await faceapi.detectSingleFace(video, options)
      .withFaceLandmarks()
      .withFaceDescriptor()

    return result ? result.descriptor : null
  }

  return {
    loadModels,
    detect,
    getFaceDescriptor,
    modelsLoaded,
    detections
  }
}
