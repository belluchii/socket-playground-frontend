// Snake.io game types, constants, and game logic.
// Used by: useSnakeSocket, SnakeIo view.

// ===========================================
// Types
// ===========================================

// Direction vector for snake movement.
export type Direction = [number, number]

// Represents a single snake in the game.
export interface Snake {
  id: string
  positions: number[][]
  direction: Direction
  alive: boolean
  spawnTime: number
}

// Represents a fruit on the map.
export type Fruit = [number, number]

// Full game state for the snake.io room (server-side).
export interface SnakeRoomState {
  snakes: Map<string, Snake>
  fruits: Fruit[]
  map: (string | null)[][]
  gameStarted: boolean
  gameLoop: ReturnType<typeof setInterval> | null
  readyPlayers: Set<string>
  waitingPlayers: Set<string>
  playerNames: Map<string, string>
}

// ===========================================
// Client-side Types
// ===========================================

// Lightweight snake data for client (without server-only fields).
export interface SnakeData {
  id: string
  positions: number[][]
  direction: Direction
  alive: boolean
}

// Full game state received from server.
export interface GameState {
  snakes: SnakeData[]
  fruits: Fruit[]
  mapSize: number
  gameStarted: boolean
  gameEnded: boolean
  winnerId: string | null
}

// Ready status for all players in the room.
export interface ReadyStatus {
  ready: string[]
  total: number
  allReady: boolean
  gameStarted: boolean
  gameEnded: boolean
  playerNames: Record<string, string>
}

// Game ended event data.
export interface GameEndedInfo {
  winnerId: string | null
  message: string
}

// ===========================================
// Constants
// ===========================================

// Map dimensions.
export const MAP_SIZE = 50

// Size of each cell in pixels.
export const CELL_SIZE = 15

// Game frames per second.
export const FPS = 24

// Maximum number of fruits on the map.
export const MAX_FRUITS = 5

// Initial snake length.
export const INITIAL_LENGTH = 3

// ===========================================
// Game Logic (Drawing Functions)
// ===========================================

// Canvas context reference
let ctx: CanvasRenderingContext2D | null | undefined = undefined

// Direction mappings for keyboard input
export const DIRECTIONS: Record<string, Direction> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
  w: [-1, 0],
  s: [1, 0],
  a: [0, -1],
  d: [0, 1],
}

// Initialize canvas context
export function initCanvas(canvasEl: HTMLCanvasElement | null) {
  ctx = canvasEl?.getContext('2d') ?? null
}

// Draw the game map grid
export function drawMap() {
  if (!ctx) return
  const c = ctx
  c.fillStyle = '#0a0a0a'
  c.fillRect(0, 0, MAP_SIZE * CELL_SIZE, MAP_SIZE * CELL_SIZE)
  c.strokeStyle = '#1a1a1a'
  c.lineWidth = 1
  for (let i = 0; i <= MAP_SIZE; i++) {
    c.beginPath()
    c.moveTo(i * CELL_SIZE, 0)
    c.lineTo(i * CELL_SIZE, MAP_SIZE * CELL_SIZE)
    c.stroke()
    c.beginPath()
    c.moveTo(0, i * CELL_SIZE)
    c.lineTo(MAP_SIZE * CELL_SIZE, i * CELL_SIZE)
    c.stroke()
  }
}

// Draw all fruits on the map
export function drawFruits(fruits: Fruit[]) {
  if (!ctx || !fruits.length) return
  const c = ctx
  c.fillStyle = '#ff00ff'
  c.shadowColor = '#ff00ff'
  c.shadowBlur = 5
  fruits.forEach((fruit) => {
    const [y, x] = fruit
    if (y !== undefined && x !== undefined) {
      c.fillRect(x * CELL_SIZE + 2, y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4)
    }
  })
  c.shadowBlur = 0
}

// Draw all snakes on the map
export function drawSnakes(snakes: SnakeData[], myPlayerId: string) {
  if (!ctx) return
  const c = ctx

  snakes.forEach((snake) => {
    if (!snake.positions?.length) return

    const isMe = snake.id === myPlayerId
    const isAlive = snake.alive

    let color: string
    if (isMe && isAlive) color = '#00ff00'
    else if (isMe && !isAlive) color = '#006600'
    else if (isAlive) color = '#ff4444'
    else color = '#662222'

    const alpha = isAlive ? 1.0 : 0.4
    c.globalAlpha = alpha
    c.fillStyle = color

    snake.positions.forEach((pos, index) => {
      const [y, x] = pos
      if (y === undefined || x === undefined) return

      if (index === snake.positions.length - 1) {
        // Draw head with eyes
        c.fillStyle = isMe ? '#44ff44' : '#ff6666'
        c.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)

        c.fillStyle = '#000'
        if (isAlive) {
          c.fillRect(x * CELL_SIZE + 2, y * CELL_SIZE + 3, 3, 3)
          c.fillRect(x * CELL_SIZE + CELL_SIZE - 5, y * CELL_SIZE + 3, 3, 3)
        }
      } else {
        // Draw body segment
        c.fillStyle = color
        c.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)
      }
    })

    c.globalAlpha = 1.0
  })
}

// Complete draw function
export function draw(snakes: SnakeData[], fruits: Fruit[], myPlayerId: string) {
  drawMap()
  drawFruits(fruits)
  drawSnakes(snakes, myPlayerId)
}
