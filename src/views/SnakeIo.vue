ws-playground\ws-playground-front\src\views\SnakeIo.vue ``` ```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import socket from '../utils/socket'

const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

const mapSize = 30
const cellSize = 20
const roomId = 'snake1'

interface SnakeData {
  id: string
  positions: number[][]
  direction: [number, number]
  alive: boolean
}

interface GameState {
  snakes: SnakeData[]
  fruits: number[][]
  mapSize: number
}

const gameState = ref<GameState>({
  snakes: [],
  fruits: [],
  mapSize: 30,
})
let playerId = ''
const myDirection: [number, number] = [0, 1]
const lastSentDirection: [number, number] = [0, 1]
let inputSent = false

const directions: Record<string, [number, number]> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
}

function drawMap() {
  if (!ctx) return
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, mapSize * cellSize, mapSize * cellSize)
  ctx.strokeStyle = '#222'
  for (let i = 0; i <= mapSize; i++) {
    ctx.strokeRect(i * cellSize, 0, cellSize, mapSize * cellSize)
    ctx.strokeRect(0, i * cellSize, mapSize * cellSize, cellSize)
  }
}

function drawFruits() {
  if (!ctx || !gameState.value.fruits.length) return
  ctx.fillStyle = '#f0f'
  gameState.value.fruits.forEach(([y, x]) => {
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
  })
}

function drawSnakes() {
  if (!ctx) return
  gameState.value.snakes.forEach((snake) => {
    if (!snake.positions?.length || !snake.alive) return
    const isMe = snake.id === playerId
    ctx.fillStyle = isMe ? '#0f0' : '#f00'
    snake.positions.forEach(([y, x]) => {
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
    })
  })
}

function draw() {
  drawMap()
  drawFruits()
  drawSnakes()
}

function handleInput(e: KeyboardEvent) {
  const dir = directions[e.key]
  if (!dir) return

  const [dy, dx] = dir
  const [lsdy, lsdx] = lastSentDirection
  if ((dy + lsdy === 0 && dx + lsdx === 0) || inputSent) return

  inputSent = true
  myDirection[0] = dy
  myDirection[1] = dx
  lastSentDirection[0] = dy
  lastSentDirection[1] = dx
  socket?.emit('Input', roomId, dir)
}

onMounted(() => {
  ctx = canvas.value?.getContext('2d')

  socket.on('connect', () => {
    socket?.emit('JoinRoom', roomId)
  })

  socket.on('PlayerId', (id: string) => {
    playerId = id
  })

  socket.on('GameState', (state: GameState) => {
    if (!state.snakes) return
    inputSent = false
    gameState.value = state
    const mySnake = state.snakes.find((s) => s.id === playerId)
    if (mySnake) {
      const [dy, dx] = mySnake.direction
      myDirection[0] = dy
      myDirection[1] = dx
      lastSentDirection[0] = dy
      lastSentDirection[1] = dx
    }
    draw()
  })

  window.addEventListener('keydown', handleInput)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleInput)
  socket?.disconnect()
})

function startGame() {
  socket?.emit('StartGame', roomId)
}
</script>

<template>
  <main>
    <canvas ref="canvas" :width="mapSize * cellSize" :height="mapSize * cellSize"></canvas>
    <button @click="startGame">Start Game</button>
    <p>Player ID: {{ playerId }}</p>
    <p>Snakes: {{ gameState.snakes.length }}</p>
  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 100px;
}
button {
  width: min-content;
  padding: 10px;
  margin-top: 10px;
}
p {
  color: white;
}
</style>
