<script setup lang="ts">
    import { ref, computed } from 'vue'
    import socket from '../utils/socket.ts'

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
        placeEnemyShips()
        phase.value = GamePhase.PLAYING
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

    if (cell.state === CellState.SHIP && cell.shipId) {
      cell.state = CellState.HIT
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

    const result = attack(enemyBoard.value, enemyShips.value, { row, col })
    if (result === 'invalid') return

    if (enemyShips.value.every(s => s.isSunk)) {
      phase.value = GamePhase.GAME_OVER
      return
    }

    currentTurn.value = 'enemy'
    setTimeout(enemyAttack, 800)
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
</script>

<template>
    <div class="Main">
    <!-- Tablero Jugador -->
        <div class="board">
            <div class="header"></div>
            <div v-for="col in 10" :key="'p-col-' + col" class="header">
            {{ String.fromCharCode(64 + col) }}
            </div>

            <template v-for="row in 10" :key="'p-row-' + row">
                <div class="header">{{ row }}</div>
                <div
                v-for="col in 10"
                :key="'p-cell-' + row + '-' + col"
                class="cell"
                >
                </div>
            </template>
        </div>
    </div>
</template>


<style scoped>
.Main{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    font-family: Arial, sans-serif;
    margin-top: 40px;
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

.cell {
    background: #1a3a5c;
    border: 1px solid #2a4a6b;
    border-radius: 5px;
    cursor: pointer;
}

.cell:hover {
    background: #2c4a6c;
}
</style>