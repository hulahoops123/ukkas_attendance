<template>
  <div class="relative w-full h-screen overflow-hidden flex items-center justify-center">
    <div
      v-for="(letter, index) in letters"
      :key="index"
      class="absolute font-bold text-6xl transition-none"
      :class="[
        letter.circle ? 'w-20 h-20 rounded-full flex items-center justify-center' : '',
      ]"
      :style="{
        color: letter.circle ? 'white' : letter.color,
        backgroundColor: letter.circle ? letter.color : 'transparent',
        transform: `translate(${positions[index].x}px, ${positions[index].y}px)`
      }"
    >
      {{ letter.char }}
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, onUnmounted, ref } from 'vue'

const letters = [
  { char: 'K', x: 0, y: -120, color: '#0AAA0A', circle: true },
  { char: 'I', x: 0, y: -40, color: '#00AEEF', circle: true },
  { char: 'D', x: 0, y: 40, color: '#F75A79', circle: true },
  { char: 'S', x: 0, y: 120, color: '#FFD600', circle: true },
  { char: 'A', x: -160, y: 40, color: '#0AAA0A', circle: false },
  { char: 'D', x: -80, y: 40, color: '#F75A79', circle: false },
  { char: 'U', x: 80, y: 40, color: '#FFD600', circle: false },
  { char: 'L', x: 160, y: 40, color: '#F75A79', circle: false },
  { char: 'T', x: 240, y: 40, color: '#F75A79', circle: false },
  { char: 'S', x: 320, y: 40, color: '#FF9800', circle: false }
]

const positions = reactive(
  letters.map(l => ({ x: l.x, y: l.y }))
)

const velocities = reactive(
  letters.map(() => ({ 
    vx: (Math.random() - 0.5) * 4, // random velocity between -2 and 2
    vy: (Math.random() - 0.5) * 4 
  }))
)

let animationId = null
let isAnimating = false
const LETTER_SIZE = 80 // approximate size of letters including padding

function startBouncing() {
  if (isAnimating) return
  isAnimating = true
  
  // Set initial random positions within bounds
  letters.forEach((_, i) => {
    positions[i].x = (Math.random() - 0.5) * (window.innerWidth - LETTER_SIZE * 2)
    positions[i].y = (Math.random() - 0.5) * (window.innerHeight - LETTER_SIZE * 2)
  })
  
  function animate() {
    letters.forEach((_, i) => {
      // Update positions
      positions[i].x += velocities[i].vx
      positions[i].y += velocities[i].vy
      
      // Bounce off left and right walls
      if (positions[i].x <= -window.innerWidth/2 + LETTER_SIZE/2) {
        positions[i].x = -window.innerWidth/2 + LETTER_SIZE/2
        velocities[i].vx = Math.abs(velocities[i].vx)
      } else if (positions[i].x >= window.innerWidth/2 - LETTER_SIZE/2) {
        positions[i].x = window.innerWidth/2 - LETTER_SIZE/2
        velocities[i].vx = -Math.abs(velocities[i].vx)
      }
      
      // Bounce off top and bottom walls
      if (positions[i].y <= -window.innerHeight/2 + LETTER_SIZE/2) {
        positions[i].y = -window.innerHeight/2 + LETTER_SIZE/2
        velocities[i].vy = Math.abs(velocities[i].vy)
      } else if (positions[i].y >= window.innerHeight/2 - LETTER_SIZE/2) {
        positions[i].y = window.innerHeight/2 - LETTER_SIZE/2
        velocities[i].vy = -Math.abs(velocities[i].vy)
      }
    })
    
    if (isAnimating) {
      animationId = requestAnimationFrame(animate)
    }
  }
  
  animate()
}

function stopBouncing() {
  isAnimating = false
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
}

function returnToOriginal() {
  stopBouncing()
  
  // Smoothly return to original positions
  letters.forEach((l, i) => {
    positions[i].x = l.x
    positions[i].y = l.y
  })
}

function startCycle() {
  // Start bouncing animation
  startBouncing()
  
  // After 15 seconds, return to original for 5 seconds
  setTimeout(() => {
    returnToOriginal()
    
    // After 5 seconds at original position, start next cycle
    setTimeout(() => {
      startCycle()
    }, 5000)
  }, 15000)
}

onMounted(() => {
  // Start the first cycle after a brief delay
  setTimeout(() => {
    startCycle()
  }, 1000)
})

onUnmounted(() => {
  stopBouncing()
})
</script>

<style scoped>
</style>
