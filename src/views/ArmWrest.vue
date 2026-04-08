<script setup lang="ts">
import { ref } from 'vue'
import socket from '../utils/socket'

const bigRange: ref<[number, number]> = ref([70, 90])
const closeRange: ref<[number, number]> = ref([40, 50])
const interval = ref<ReturnType<typeof setInterval> | null>(null)
const history: number[] = ref([])
const rivalHistory = ref([])
const strength: number = ref(0)
const time: number = 2000
const degs: number = ref(0)
const speedIncrement: number = 0.25
let canPush: boolean = false
let speed: number = 1
let startTime: number | null = null

function initializeNewGame() {
  history.value = []
  rivalHistory.value = []
  strength.value = 0
  speed = 1
}

function setRandomRanges() {
  canPush = true
  bigRange.value[0] = Math.floor(Math.random() * 80 + 1)
  bigRange.value[1] = bigRange.value[0] + 20
  closeRange.value[0] = Math.floor(Math.random() * 90 + 1)
  closeRange.value[1] = closeRange.value[0] + 10
}

function startNewRound() {
  if (interval.value) return
  setRandomRanges()
  startTime = Date.now()
  interval.value = setInterval(() => {
    updateRoundAnimation()
  }, 10)
}

function updateRoundAnimation() {
  const elapsed = Date.now() - startTime!
  if (canPush) degs.value = (elapsed / (time / speed)) * 270

  if (elapsed >= time / speed) {
    clearInterval(interval.value)
    interval.value = null
    startTime = null

    if (canPush) {
      history.value.push(0)
      socket.emit('finishRound', 0, 'roomid')
    }
  }
}

function pushArmButton() {
  if (!canPush) return
  const elapsed = Date.now() - startTime!
  const progress = (elapsed / (time / speed)) * 100
  let points = 0
  if (bigRange.value[0] <= progress && progress <= bigRange.value[1]) points = 1
  if (closeRange.value[0] <= progress && progress <= closeRange.value[1]) points = 2
  strength.value += points
  history.value.push(points)
  socket.emit('finishRound', points, 'roomid')
  canPush = false
  clearInterval(interval.value)
  interval.value = null
}

function handleStartNewGame() {
  socket.emit('initializeNewGame', 'roomid')
}

function calculateDifference() {
  return rivalHistory.value.reduce((a, c) => a + c, 0) - history.value.reduce((a, c) => a + c, 0)
}

function checkGameWinner(difference: number) {
  if (difference <= -3) {
    console.log('victoria')
  } else if (difference >= 3) {
    console.log('derrota')
  } else {
    if (speed < 5) speed += speedIncrement
  }
}

socket.emit('joinArmWrestle', 'roomid')

socket.on('roomReadyToStart', () => {
  console.log('Ambos jugadores listos')
})

socket.on('gameInitialized', () => {
  initializeNewGame()
  startNewRound()
})

socket.on('startNewRound', () => startNewRound())

socket.on('opponentFinishedRound', (score) => {
  rivalHistory.value.push(score)

  if (history.value.length === rivalHistory.value.length) {
    const difference = calculateDifference()
    checkGameWinner(difference)
  }
})

socket.on('gameFinished', (data) => {
  if (interval.value) clearInterval(interval.value)
  console.log('Juego terminado', data)
})

socket.on('opponentDisconnected', () => {
  if (interval.value) clearInterval(interval.value)
})
</script>

<template>
  <main>
    <div class="circle">
      <div :style="{ rotate: `${degs}deg` }" class="pointer"></div>
      <div class="filler"></div>
      <div
        class="range"
        :style="{
          background: `conic-gradient(#0000 ${bigRange[0] * 0.75}%, #f0f ${bigRange[0] * 0.75}%, #f0f ${bigRange[1] * 0.75}%, #0000 ${bigRange[1] * 0.75}%)`,
        }"
      ></div>
      <div
        class="mini-range"
        :style="{
          background: `conic-gradient(#0000 ${closeRange[0] * 0.75}%, #f00 ${closeRange[0] * 0.75}%, #f00 ${closeRange[1] * 0.75}%, #0000 ${closeRange[1] * 0.75}%)`,
        }"
      ></div>
    </div>
    <div class="button-cont">
      <button @click="pushArmButton()">stop clock</button>
      <button @click="handleStartNewGame()">Start Game</button>
    </div>
    <p>history: {{ history }}</p>
    <p>rivalHistory: {{ rivalHistory }}</p>
  </main>
</template>

<style lang="css" scoped>
main {
  margin: 200px auto;
  width: 90%;
  max-width: 1200px;
}
.circle {
  rotate: -45deg;
  position: relative;
  width: 200px;
  height: 200px;
  background: var(--color-black);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
.filler {
  border-radius: 50%;
  width: 150px;
  height: 150px;
  z-index: 5;
  position: absolute;
  background: var(--color-cream);
}
.range {
  border-radius: 50%;
  rotate: -90deg;
  position: absolute;
  width: 200px;
  height: 200px;
}
.mini-range {
  position: absolute;
  rotate: -90deg;
  width: 200px;
  height: 200px;
}
.pointer {
  background: linear-gradient(to right, var(--color-black) 50%, #0000 50%);
  width: 200px;
  height: 2px;
  z-index: 10;
  position: absolute;
}
.button-cont {
  margin-top: 200px;
}
</style>
