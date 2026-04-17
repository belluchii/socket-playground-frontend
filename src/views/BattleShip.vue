<script setup lang="ts">
    import { ref, computed } from 'vue'
    import socket from '../utils/socket.ts'

    // ===== SOCKET.IO =====

      socket.on('connect', () => {
          console.log('Connected to server')
          socket.emit('JoinLobby')
      })

    // ===== ENUMS =====
    enum CellState {
        EMPTY = 'empty',
        SHIP = 'ship',
        HIT = 'hit',
        MISS = 'miss',
        SUNK = 'sunk',
    }

    enum GamePhase {
        PLACING = 'placing',
        PLAYING = 'playing',
        GAME_OVER = 'game_over',
    }

    enum Orientation {
        HORIZONTAL = 'horizontal',
        VERTICAL = 'vertical',
    }

    // ===== INTERFACES =====
    interface Coordinate {
        row: number
        col: number
    }

    interface Cell {
        coordinate: Coordinate
        state: CellState
        shipId: string | null
    }

    interface ShipDefinition {
        id: string
        size: number
    }

    interface Ship {
        id: string
        definition: ShipDefinition
        coordinates: Coordinate[]
        orientation: Orientation
        hits: number
        isSunk: boolean
    }

    // ===== CONSTANTES =====
    const BOARD_SIZE = 10

    const SHIP_DEFINITIONS: ShipDefinition[] = [
        { id: 'carrier', size: 5 },
        { id: 'battleship', size: 4 },
        { id: 'cruiser', size: 3 },
        { id: 'submarine', size: 3 },
        { id: 'destroyer', size: 2 },
    ]

    // ===== LLENAR TABLERO =====
    function fillBoard(): Cell[][] {
        const cells: Cell[][] = []
        for (let row = 0; row < BOARD_SIZE; row++) {
            cells[row] = []
            for (let col = 0; col < BOARD_SIZE; col++) {
                cells[row][col] = {
                coordinate: { row, col },
                state: CellState.EMPTY,
                shipId: null,
            }
        }
    }
    return cells
    }

    // ===== ESTADO DEL JUEGO =====
    const playerBoard = ref<Cell[][]>(fillBoard())
    const enemyBoard = ref<Cell[][]>(fillBoard())
    const playerShips = ref<Ship[]>([])
    const enemyShips = ref<Ship[]>([])
    const phase = ref<GamePhase>(GamePhase.PLACING)
    const currentTurn = ref<'player' | 'enemy'>('player')
    const currentShipIndex = ref(0)
    const currentOrientation = ref<Orientation>(Orientation.HORIZONTAL)

    const currentShipDef = computed(() => {
        if (currentShipIndex.value < SHIP_DEFINITIONS.length) {
        return SHIP_DEFINITIONS[currentShipIndex.value]
    }
    return null
    })

    // ===== UTILIDADES =====
    function isInBounds(coord: Coordinate): boolean {
    return coord.row >= 0 && coord.row < BOARD_SIZE &&
        coord.col >= 0 && coord.col < BOARD_SIZE
    }

    function getShipCells(
        start: Coordinate,
        size: number,
        orientation: Orientation
    ): Coordinate[] {
        const cells: Coordinate[] = []
        for (let i = 0; i < size; i++) {
            cells.push({
            row: orientation === Orientation.VERTICAL ? start.row + i : start.row,
            col: orientation === Orientation.HORIZONTAL ? start.col + i : start.col,
            })
        }
        return cells
    }

    function canPlaceShip(
        board: Cell[][],
        start: Coordinate,
        size: number,
        orientation: Orientation
    ): boolean {
        const cells = getShipCells(start, size, orientation)
        return cells.every(coord => {
        if (!isInBounds(coord)) return false
        if (board[coord.row][coord.col].state !== CellState.EMPTY) return false
        return true
        })
        }

    // ===== COLOCAR BARCOS =====
  function placeShip(
    board: Cell[][],
    ships: Ship[],
    definition: ShipDefinition,
    start: Coordinate,
    orientation: Orientation
    ): boolean {
    if (!canPlaceShip(board, start, definition.size, orientation)) return false

    const coordinates = getShipCells(start, definition.size, orientation)
    const ship: Ship = {
      id: `${definition.id}-${Date.now()}`,
      definition,
      coordinates,
      orientation,
      hits: 0,
      isSunk: false,
    }

    coordinates.forEach(coord => {
      board[coord.row][coord.col].state = CellState.SHIP
      board[coord.row][coord.col].shipId = ship.id
    })

    ships.push(ship)
    return true
  }

  function playerPlaceShip(row: number, col: number) {
    if (phase.value !== GamePhase.PLACING || !currentShipDef.value) return

    const success = placeShip(
      playerBoard.value,
      playerShips.value,
      currentShipDef.value,
      { row, col },
      currentOrientation.value
    )

    if (success) {
      currentShipIndex.value++
      if (currentShipIndex.value >= SHIP_DEFINITIONS.length) {
        // placeEnemyShips()
        // phase.value = GamePhase.PLAYING
        // hideShips();
      }
    }
  }

  function placeEnemyShips() {
    SHIP_DEFINITIONS.forEach(def => {
      let placed = false 
      while (!placed) {
        const orientation = Math.random() > 0.5
          ? Orientation.HORIZONTAL
          : Orientation.VERTICAL
        const start: Coordinate = {
          row: Math.floor(Math.random() * BOARD_SIZE),
          col: Math.floor(Math.random() * BOARD_SIZE),
        }
        placed = placeShip(enemyBoard.value, enemyShips.value, def, start, orientation)
      }
    })
  }

  function toggleOrientation() {
    currentOrientation.value =
      currentOrientation.value === Orientation.HORIZONTAL
        ? Orientation.VERTICAL
        : Orientation.HORIZONTAL
  }

// ===== ATAQUES =====
  function attack(board: Cell[][], ships: Ship[], coord: Coordinate): 'hit' | 'miss' | 'sunk' | 'invalid' {
    const cell = board[coord.row][coord.col]
    

    if (cell.state === CellState.HIT || cell.state === CellState.MISS || cell.state === CellState.SUNK) {
      return 'invalid'
    }
    
    if (cell?.state === CellState.SHIP || cell?.shipId) {
      cell.state = CellState.HIT;
      console.log(`Hit at (${coord.row}, ${coord.col}, ${cell?.state})`);
      const ship = ships.find(s => s.id === cell.shipId)
      if (ship) {
        ship.hits++
        if (ship.hits >= ship.definition.size) {
          ship.isSunk = true
          ship.coordinates.forEach(c => {
            board[c.row][c.col].state = CellState.SUNK
          })
          return 'sunk'
        }
      }
      return 'hit'
    }

    cell.state = CellState.MISS
    return 'miss'
  }

  function playerAttack(row: number, col: number) {
    if (phase.value !== GamePhase.PLAYING || currentTurn.value !== 'player') return

    const result = attack(playerBoard.value, playerShips.value, { row, col })
    if (result === 'invalid') return

    if (playerShips.value.every(s => s.isSunk)) {
      phase.value = GamePhase.GAME_OVER;
      alert('¡Has perdido! Todos tus barcos han sido hundidos.');
      resetGame();
      return
    }

    // currentTurn.value = 'enemy'
    // setTimeout(enemyAttack, 800)
  }

  function enemyAttack() {
    let result: 'hit' | 'miss' | 'sunk' | 'invalid'
    let coord: Coordinate

    do {
      coord = {
        row: Math.floor(Math.random() * BOARD_SIZE),
        col: Math.floor(Math.random() * BOARD_SIZE),
      }
      result = attack(playerBoard.value, playerShips.value, coord)
    } while (result === 'invalid')

    if (playerShips.value.every(s => s.isSunk)) {
      phase.value = GamePhase.GAME_OVER
      return
    }

    currentTurn.value = 'player'
  }

  // ===== REINICIAR =====
  function resetGame() {
    playerBoard.value = fillBoard()
    enemyBoard.value = fillBoard()
    playerShips.value = []
    enemyShips.value = []
    phase.value = GamePhase.PLACING
    currentTurn.value = 'player'
    currentShipIndex.value = 0
    currentOrientation.value = Orientation.HORIZONTAL
  }

  // Ocultar los barcos después de colocarlos
function hideShips() {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (playerBoard.value[row][col].state === CellState.SHIP) {
        playerBoard.value[row][col].state = CellState.EMPTY
        // el shipId se mantiene, solo se oculta visualmente
      }
    }
  }
}

function readyToPlay() {
  if (currentShipIndex.value < SHIP_DEFINITIONS.length) {
    alert('¡Coloca todos tus barcos antes de empezar!')
    return
  }
  phase.value = GamePhase.PLAYING
  hideShips();
}

</script>

<template>
  <div class="Main">

    <div class="boardBackground"></div>

    

    <div class="board">
      <div class="header"></div>
      <div v-for="col in 10" :key="'col-' + col" class="header">
        {{ String.fromCharCode(64 + col) }}
      </div>

      <template v-for="row in 10" :key="'row-' + row">
        <div class="header">{{ row }}</div>
        <div
          v-for="col in 10"
          :key="'cell-' + row + '-' + col"
          class="cell"
          :class="'cell--' + playerBoard[row - 1][col - 1].state"
          @click="(phase === GamePhase.PLAYING) ? playerAttack(row - 1, col - 1) : playerPlaceShip(row - 1, col - 1)"
        >
        </div>
      </template>
    </div>

    <div class="sidebar">
      <div v-if="phase === 'placing'" class="container">
        <p>Colocando: {{ currentShipDef?.id }}</p>
        <button @click="toggleOrientation">
          Rotar ({{ currentOrientation }})
        </button>
        <button v-if="currentShipIndex >= SHIP_DEFINITIONS.length" @click="readyToPlay">
          Ready
        </button>
      </div>
    </div>
  </div>
</template>



<style scoped>
.Main{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin-top: 40px;
    position: relative;
}

.boardBackground {
    position: absolute;
    margin-top: 20px;
    margin-left: 20px;
    width: 500px;
    height: 500px;
    background-color: var(--color-black);
    border-radius: 20px;
    z-index: -1;
}

.board {
    display: grid;
    grid-template-columns: 30px repeat(10, 40px);
    grid-template-rows: 30px repeat(10, 40px);
    gap: 3px;
}

.header {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: #bdc3c7;
    font-size: 12px;
}

.cell:hover {
    background: #2c4a6c;
}

.cell {
  background: #1a3a5c;
  border: 1px solid #2a4a6b;
  border-radius: 3px;
  cursor: pointer;
}

.cell--miss {
  background: var(--color-red);
}

.cell--hit {
  background: var(--color-yellow);
}

.cell--sunk {
  background: var(--color-orange);
}

.cell--ship {
  background: #4a7c59;
}

.sidebar {
  position: absolute;
  display: flex;
  flex-direction: row;
  justify-content: center;
  justify-items: center;
  width: 200px;
  height: 500px;
  margin-top: 10px;
  left: calc(50% - 450px); /* 50% + (mitad del tablero + margen) */
  top: 50%;
  transform: translateY(-50%);
  background-color: var(--color-blue);
  padding-top: 30px;
  border-radius: 20px;
  font-family:Georgia, 'Times New Roman', Times, serif;
  font-weight: 600;
  color: var(--color-grey-lt);
}
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}
</style>