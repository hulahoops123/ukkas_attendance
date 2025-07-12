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
let startTime = null
const LETTER_SIZE = 80 // approximate size of letters including padding
const CYCLE_DURATION = 20000 // 20 seconds in milliseconds
const RETURN_START_TIME = 15000 // Start returning at 15 seconds

function startCycle() {
  if (isAnimating) return
  isAnimating = true
  startTime = Date.now()
  
  // Set initial random positions within bounds
  letters.forEach((_, i) => {
    positions[i].x = (Math.random() - 0.5) * (window.innerWidth - LETTER_SIZE * 2)
    positions[i].y = (Math.random() - 0.5) * (window.innerHeight - LETTER_SIZE * 2)
  })
  
  function animate() {
    const currentTime = Date.now()
    const elapsed = currentTime - startTime
    
    if (elapsed >= CYCLE_DURATION) {
      // Cycle complete, start new cycle
      startTime = currentTime
      // Reset velocities for new cycle
      letters.forEach((_, i) => {
        velocities[i].vx = (Math.random() - 0.5) * 4
        velocities[i].vy = (Math.random() - 0.5) * 4
      })
    }
    
    letters.forEach((letter, i) => {
      if (elapsed < RETURN_START_TIME) {
        // Normal bouncing phase (0-15 seconds)
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
      } else {
        // Return phase (15-20 seconds) - smoothly interpolate back to original
        const returnProgress = (elapsed - RETURN_START_TIME) / (CYCLE_DURATION - RETURN_START_TIME)
        const easeProgress = 1 - Math.pow(1 - returnProgress, 3) // ease-out cubic
        
        // Store current position at start of return phase
        if (elapsed === RETURN_START_TIME || Math.abs(elapsed - RETURN_START_TIME) < 16) {
          if (!positions[i].returnStartX) {
            positions[i].returnStartX = positions[i].x
            positions[i].returnStartY = positions[i].y
          }
        }
        
        // Interpolate from return start position to original position
        const startX = positions[i].returnStartX || positions[i].x
        const startY = positions[i].returnStartY || positions[i].y
        
        positions[i].x = startX + (letter.x - startX) * easeProgress
        positions[i].y = startY + (letter.y - startY) * easeProgress
        
        // Clean up return start positions at end of cycle
        if (elapsed >= CYCLE_DURATION - 16) {
          delete positions[i].returnStartX
          delete positions[i].returnStartY
        }
      }
    })
    
    if (isAnimating) {
      animationId = requestAnimationFrame(animate)
    }
  }
  
  animate()
}

function stopAnimation() {
  isAnimating = false
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
}

onMounted(() => {
  // Start the first cycle after a brief delay
  setTimeout(() => {
    startCycle()
  }, 1000)
})

onUnmounted(() => {
  stopAnimation()
})
</script>

<style scoped>
</style>
