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
        color: letter.circle ? '#E5E7EB' : letter.color,
        backgroundColor: letter.circle ? letter.color : 'transparent',
        transform: `translate(${positions[index].x}px, ${positions[index].y}px) rotate(${angles[index]}deg)`
      }"
    >
      {{ letter.char }}
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, onUnmounted } from 'vue'

const letters = [
  { char: 'K', x: 0, y: -120, color: '#0AAA0A', circle: true },
  { char: 'I', x: 0, y: -40,  color: '#00AEEF', circle: true },
  { char: 'D', x: 0, y: 40,   color: '#F75A79', circle: true },
  { char: 'S', x: 0, y: 120,  color: '#FFD600', circle: true },
  { char: 'A', x: -70, y: 40, color: '#0AAA0A', circle: false },
  { char: 'U', x: 55,  y: 40, color: '#FFD600', circle: false },
  { char: 'L', x: 115, y: 40, color: '#F75A79', circle: false },
  { char: 'T', x: 175, y: 40, color: '#F75A79', circle: false },
  { char: 'S', x: 235, y: 40, color: '#FF9800', circle: false }
]

const positions = reactive(letters.map(l => ({ x: l.x, y: l.y })))
const velocities = reactive(letters.map(() => ({ 
  vx: (Math.random() - 0.5) * 0.4, // reduced from *1
  vy: (Math.random() - 0.5) * 0.4
})))
const angles = reactive(letters.map(() => 0))
const rotationVelocities = reactive(letters.map(() => (Math.random() - 0.5) * 1)) // reduced from *2

let animationId = null
let isAnimating = false
let startTime = null
const LETTER_SIZE = 80
const CYCLE_DURATION = 20000
const RETURN_START_TIME = 15000

function startCycle() {
  if (isAnimating) return
  isAnimating = true
  startTime = Date.now()

  letters.forEach((_, i) => {
    positions[i].x = (Math.random() - 0.5) * (window.innerWidth - LETTER_SIZE * 2)
    positions[i].y = (Math.random() - 0.5) * (window.innerHeight - LETTER_SIZE * 2)
  })

  function animate() {
    const currentTime = Date.now()
    const elapsed = currentTime - startTime

    if (elapsed >= CYCLE_DURATION) {
      startTime = currentTime
      letters.forEach((_, i) => {
        velocities[i].vx = (Math.random() - 0.5) * 0.4
        velocities[i].vy = (Math.random() - 0.5) * 0.4
        rotationVelocities[i] = (Math.random() - 0.5) * 1
      })
    }

    letters.forEach((letter, i) => {
      if (elapsed < RETURN_START_TIME) {
        // Move & rotate with damping
        positions[i].x += velocities[i].vx
        positions[i].y += velocities[i].vy
        angles[i] += rotationVelocities[i]
        
        velocities[i].vx *= 0.995 // more damping
        velocities[i].vy *= 0.995
        rotationVelocities[i] *= 0.995

        // Bounce
        if (positions[i].x <= -window.innerWidth/2 + LETTER_SIZE/2) {
          positions[i].x = -window.innerWidth/2 + LETTER_SIZE/2
          velocities[i].vx = Math.abs(velocities[i].vx)
          rotationVelocities[i] += (Math.random() - 0.5) * 1.5
        } else if (positions[i].x >= window.innerWidth/2 - LETTER_SIZE/2) {
          positions[i].x = window.innerWidth/2 - LETTER_SIZE/2
          velocities[i].vx = -Math.abs(velocities[i].vx)
          rotationVelocities[i] += (Math.random() - 0.5) * 1.5
        }

        if (positions[i].y <= -window.innerHeight/2 + LETTER_SIZE/2) {
          positions[i].y = -window.innerHeight/2 + LETTER_SIZE/2
          velocities[i].vy = Math.abs(velocities[i].vy)
          rotationVelocities[i] += (Math.random() - 0.5) * 1.5
        } else if (positions[i].y >= window.innerHeight/2 - LETTER_SIZE/2) {
          positions[i].y = window.innerHeight/2 - LETTER_SIZE/2
          velocities[i].vy = -Math.abs(velocities[i].vy)
          rotationVelocities[i] += (Math.random() - 0.5) * 1.5
        }

        // Collisions
        for (let j = i + 1; j < letters.length; j++) {
          const dx = positions[i].x - positions[j].x
          const dy = positions[i].y - positions[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const minDistance = LETTER_SIZE

          if (distance < minDistance && distance > 0) {
            const overlap = minDistance - distance
            const separationX = (dx / distance) * overlap * 0.5
            const separationY = (dy / distance) * overlap * 0.5

            positions[i].x += separationX
            positions[i].y += separationY
            positions[j].x -= separationX
            positions[j].y -= separationY

            const normalX = dx / distance
            const normalY = dy / distance
            
            const relativeVelocityX = velocities[i].vx - velocities[j].vx
            const relativeVelocityY = velocities[i].vy - velocities[j].vy
            
            const velocityAlongNormal = relativeVelocityX * normalX + relativeVelocityY * normalY
            
            if (velocityAlongNormal > 0) continue
            
            const restitution = 0.1 // less bouncy
            const impulse = -(1 + restitution) * velocityAlongNormal * 0.5 // extra damp
            
            velocities[i].vx += impulse * normalX
            velocities[i].vy += impulse * normalY
            velocities[j].vx -= impulse * normalX
            velocities[j].vy -= impulse * normalY

            rotationVelocities[i] += (Math.random() - 0.5) * 1.5
            rotationVelocities[j] += (Math.random() - 0.5) * 1.5
          }
        }
      } else {
        // Return to original positions
        const returnProgress = (elapsed - RETURN_START_TIME) / (CYCLE_DURATION - RETURN_START_TIME)
        const easeProgress = 1 - Math.pow(1 - returnProgress, 3)

        if (elapsed === RETURN_START_TIME || Math.abs(elapsed - RETURN_START_TIME) < 16) {
          if (!positions[i].returnStartX) {
            positions[i].returnStartX = positions[i].x
            positions[i].returnStartY = positions[i].y
            positions[i].returnStartAngle = angles[i]
          }
        }

        const startX = positions[i].returnStartX || positions[i].x
        const startY = positions[i].returnStartY || positions[i].y
        const startAngle = positions[i].returnStartAngle || angles[i]

        positions[i].x = startX + (letter.x - startX) * easeProgress
        positions[i].y = startY + (letter.y - startY) * easeProgress
        angles[i] = startAngle + (0 - startAngle) * easeProgress

        if (elapsed >= CYCLE_DURATION - 16) {
          delete positions[i].returnStartX
          delete positions[i].returnStartY
          delete positions[i].returnStartAngle
        }
      }
    })

    if (isAnimating) animationId = requestAnimationFrame(animate)
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
  setTimeout(() => startCycle(), 1000)
})

onUnmounted(() => {
  stopAnimation()
})
</script>
