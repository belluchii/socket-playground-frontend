<script setup lang="ts">
import { ref, onMounted } from 'vue'

const myCanvas = ref(null)

onMounted(() => {
  const ctx = myCanvas.value.getContext('2d')
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, 600, 600)
})

const draw = () => {
  const ctx = myCanvas.value.getContext('2d')
  ctx.clearRect(0, 0, myCanvas.value.width, myCanvas.value.height)
  ctx.fillStyle = 'red'
  ctx.fillRect(0, 0, 600, 600)
}
</script>

<template>
  <main>
    <canvas ref="myCanvas" width="600" height="400"></canvas>
    <button @click="draw">Dibujar</button>
  </main>
</template>

<style scoped>
main {
  width: 90%;
  margin: 100px auto 0;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
}
button {
  width: min-content;
  padding: 10px;
}
</style>
