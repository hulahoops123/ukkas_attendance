<template>
  <div class="relative w-full h-screen overflow-hidden flex items-center justify-center">
    <div
      v-for="(letter, index) in letters"
      :key="index"
      class="absolute font-bold text-6xl transition-transform duration-[2000ms] ease-in-out"
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
import { reactive, onMounted } from 'vue'

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

function scatterAndReturn() {
  letters.forEach((_, i) => {
    // scatter to random position
    positions[i].x = (Math.random() - 0.5) * 800
    positions[i].y = (Math.random() - 0.5) * 600
  })

  // after 3 seconds, return to original
  setTimeout(() => {
    letters.forEach((l, i) => {
      positions[i].x = l.x
      positions[i].y = l.y
    })
  }, 3000)
}

onMounted(() => {
  setInterval(() => {
    scatterAndReturn()
  }, 8000)
})
</script>

<style scoped>
</style>
