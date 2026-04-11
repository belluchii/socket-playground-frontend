<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSnakeSocket } from '@/composables/useSnakeSocket'
import CommonButton from '@/common/Button.vue'
import CommonCard from '@/common/Card.vue'
import CommonBadge from '@/common/Badge.vue'
import {
  MAP_SIZE,
  CELL_SIZE,
  DIRECTIONS,
  initCanvas,
  draw,
  type GameState,
  type ReadyStatus,
  type GameEndedInfo,
} from '@/utils/snake'

const canvas = ref<HTMLCanvasElement | null>(null)

// Socket API
const socketApi = useSnakeSocket()

// Game State
const gameState = ref<GameState>({
  snakes: [],
  fruits: [],
  mapSize: MAP_SIZE,
  gameStarted: false,
  gameEnded: false,
  winnerId: null,
})

// Player State
const myPlayerId = ref('')
const myDirection = ref<[number, number]>([0, 1])
const lastSentDirection = ref<[number, number]>([0, 1])
let inputSent = false

// Ready State
const iAmReady = ref(false)
const isWaiting = ref(false)
const waitingMessage = ref('Partida en progreso...')
const overlayVisible = ref(false)

// Room State
const readyStatus = ref<ReadyStatus>({
  ready: [],
  total: 0,
  allReady: false,
  gameStarted: false,
  gameEnded: false,
  playerNames: {},
})

const route = useRoute()
const roomId = (route.query.room as string) || 'default'

// Computed
const aliveCount = computed(() => {
  return gameState.value.snakes.filter((s) => s.alive).length
})

const notReadyPlayers = computed(() => {
  return gameState.value.snakes
    .map((s) => s.id)
    .filter((id) => !readyStatus.value.ready.includes(id))
})

const canReady = computed(() => {
  return !gameState.value.gameStarted && !overlayVisible.value
})

// Helpers
function getPlayerName(playerId: string): string {
  return readyStatus.value.playerNames?.[playerId] || `Jugador ${playerId.substring(0, 6)}`
}

// Input handlers
function handleInput(e: KeyboardEvent) {
  if (isWaiting.value) return

  const dir = DIRECTIONS[e.key]
  if (!dir) return
  e.preventDefault()
  const [dy, dx] = dir
  const [lsdy, lsdx] = lastSentDirection.value
  if ((dy + lsdy === 0 && dx + lsdx === 0) || inputSent) return

  inputSent = true
  lastSentDirection.value = [dy, dx]
  socketApi.emitInput(roomId, dir)
}

function toggleReady() {
  if (gameState.value.gameStarted) return
  if (isWaiting.value) return

  if (iAmReady.value) {
    socketApi.emitUnready(roomId)
    iAmReady.value = false
  } else {
    socketApi.emitReady(roomId)
    iAmReady.value = true
  }
}

// Socket event handlers
function setupSocketEvents() {
  socketApi.connect(roomId)

  socketApi.onPlayerId((id: string) => {
    myPlayerId.value = id
    render()
  })

  socketApi.onWaitingForGameEnd((data: { message: string; currentPlayers: number }) => {
    isWaiting.value = true
    overlayVisible.value = true
    waitingMessage.value = data.message
  })

  socketApi.onGameState((state: GameState) => {
    if (!state.snakes) return
    inputSent = false
    gameState.value = state

    if (!state.gameStarted && isWaiting.value) {
      isWaiting.value = false
    }

    if (myPlayerId.value) {
      const mySnake = state.snakes.find((s) => s.id === myPlayerId.value)
      if (mySnake) {
        myDirection.value = [...mySnake.direction]
        lastSentDirection.value = [...mySnake.direction]
      }
    }
    render()
  })

  socketApi.onReadyStatus((status: ReadyStatus) => {
    readyStatus.value = status

    if (myPlayerId.value) {
      iAmReady.value = status.ready.includes(myPlayerId.value)
    }
  })

  socketApi.onGameStarted(() => {
    gameState.value.gameStarted = true
    gameState.value.gameEnded = false
    iAmReady.value = false
    isWaiting.value = false
    overlayVisible.value = false
    render()
  })

  socketApi.onGameEnded((info: GameEndedInfo) => {
    gameState.value.gameStarted = false
    gameState.value.gameEnded = true
    gameState.value.winnerId = info.winnerId
    iAmReady.value = false

    if (isWaiting.value || overlayVisible.value) {
      isWaiting.value = false
      overlayVisible.value = false

      setTimeout(() => {
        socketApi.connect(roomId)
        setTimeout(() => {
          socketApi.emitReady(roomId)
          iAmReady.value = true
        }, 300)
      }, 500)
    }

    render()
  })
}

function cleanupSocketEvents() {
  socketApi.removeAllListeners()
}

function render() {
  draw(gameState.value.snakes, gameState.value.fruits, myPlayerId.value)
}

// Lifecycle
onMounted(() => {
  initCanvas(canvas.value)
  setupSocketEvents()
  window.addEventListener('keydown', handleInput)
})

onUnmounted(() => {
  cleanupSocketEvents()
  window.removeEventListener('keydown', handleInput)
})
</script>

<template>
  <main>
    <canvas ref="canvas" :width="MAP_SIZE * CELL_SIZE" :height="MAP_SIZE * CELL_SIZE"></canvas>

    <!-- Waiting overlay -->
    <CommonCard v-if="overlayVisible" variant="dark">
      <h2>{{ waitingMessage }}</h2>
      <p>Podrás unirte cuando termine</p>
    </CommonCard>

    <!-- Controls -->
    <div class="controls">
      <template v-if="!gameState.gameStarted">
        <CommonButton v-if="!iAmReady" variant="primary" :disabled="!canReady" @click="toggleReady">
          ✓ Ready
        </CommonButton>

        <CommonButton v-else variant="secondary" @click="toggleReady"> ✗ Unready </CommonButton>
      </template>

      <p v-else class="game-status">🎮 ¡Partida en curso!</p>
    </div>

    <!-- Players List -->
    <CommonCard variant="striped" label="Jugadores">
      <ul>
        <li v-for="playerId in readyStatus.ready" :key="playerId">
          ✓ {{ getPlayerName(playerId) }}
          <span v-if="playerId === myPlayerId">(tú)</span>
        </li>
        <li v-for="playerId in notReadyPlayers" :key="playerId">
          ○ {{ getPlayerName(playerId) }}
          <span v-if="playerId === myPlayerId">(tú)</span>
        </li>
      </ul>
      <template #actions>
        <CommonBadge v-if="readyStatus.allReady">
          {{ readyStatus.ready.length }}/{{ readyStatus.total }} listos
        </CommonBadge>
      </template>
    </CommonCard>

    <!-- Winner Banner -->
    <CommonCard v-if="gameState.gameEnded && gameState.winnerId" variant="orange">
      <h2 v-if="gameState.winnerId === myPlayerId">¡TRIUNFO!</h2>
      <h2 v-else>{{ getPlayerName(gameState.winnerId) }} gana!</h2>
    </CommonCard>

    <CommonCard v-if="gameState.gameEnded && !gameState.winnerId" variant="accent-top">
      <h2>¡EMPATE!</h2>
    </CommonCard>

    <!-- Status -->
    <CommonCard variant="default">
      <p>ID: {{ myPlayerId ? myPlayerId.substring(0, 8) : 'Conectando...' }}</p>
      <p v-if="gameState.gameStarted && !gameState.gameEnded">Vivos: {{ aliveCount }}</p>
    </CommonCard>
  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 150px;
  position: relative;
}

canvas {
  border: 3px solid #333;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);
}
</style>
