<script setup lang="ts">
import { ref } from 'vue'
import socket from '../utils/socket'

const bigRange: ref<[number, number]> = ref([70, 90])
const closeRange: ref<[number, number]> = ref([40, 50])
const interval: typeof setInterval | null = ref(null)
const history: number[] = ref([])
const rivalHistory = ref([])
const strength: number = ref(0)
const time: number = 1000
let canPush: boolean = false
const degs: number = ref(0)
const rounds: number = ref(3)
const currentRound: number = ref(0)
let startTime: number | null = null

function startRound() {
  if (interval.value) return
  setRoundDefaults()
  startTime = Date.now()
  interval.value = setInterval(() => {
    manageRoundFrames()
  }, 10)
}

function setRoundDefaults() {
  canPush = true
  bigRange.value[0] = Math.floor(Math.random() * 80 + 1)
  bigRange.value[1] = bigRange.value[0] + 20
  closeRange.value[0] = Math.floor(Math.random() * 90 + 1)
  closeRange.value[1] = closeRange.value[0] + 10
}

function manageRoundFrames() {
  const elapsed = Date.now() - startTime!
  if (canPush) degs.value = (elapsed / time) * 270

  if (elapsed >= time) {
    clearInterval(interval.value)
    interval.value = null
    currentRound.value += 1
    startTime = null
    if (canPush) {
      canPush = false
      history.value.push(0)
      socket.emit('sendResult', history.value, 'roomid')
    }
    if (currentRound.value < rounds.value) startRound()
    else currentRound.value = 0
  }
}

function pushArm() {
  if (!canPush) return
  const elapsed = Date.now() - startTime!
  const progress = (elapsed / time) * 100
  let holder = 0
  if (bigRange.value[0] <= progress && progress <= bigRange.value[1]) holder = 1
  if (closeRange.value[0] <= progress && progress <= closeRange.value[1]) holder = 2
  strength.value += holder
  history.value.push(holder)
  socket.emit('sendResult', history.value, 'roomid')
  canPush = false
}

socket.emit('joinArmWrestle', 'roomid')
socket.on('startGame', (rounds) => startRound(rounds))
socket.on('emitResult', (history) => (rivalHistory.value = history))

function startGame() {
  socket.emit('startGame', 3, 'roomid')
}
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
      <button @click="pushArm()">stop clock</button>
      <button @click="startGame()">Start round</button>
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
