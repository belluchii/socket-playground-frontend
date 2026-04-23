<script setup lang="ts">
    import { ref, computed } from 'vue'
    import socket from '../utils/socket.ts'

    import { useRoute } from 'vue-router'
import { board } from '@/utils/chess.ts'

    const route = useRoute()
    const roomId = (route.query.room as string) || 'default'



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
    const currentBoard = ref<'player' | 'enemy'>('player')
    const activeBoard = computed(() => {
    return (currentBoard.value === 'player')
      ? playerBoard.value
      : enemyBoard.value
    })
    const playerShips = ref<Ship[]>([])
    const enemyShips = ref<Ship[]>([])
    const phase = ref<GamePhase>(GamePhase.PLACING)
    const currentTurn = ref<'player' | 'enemy'>('enemy');
    const currentShipIndex = ref(0)
    const currentOrientation = ref<Orientation>(Orientation.HORIZONTAL)
    let countPlayers = 0;

    const currentShipDef = computed(() => {
        if (currentShipIndex.value < SHIP_DEFINITIONS.length) {
        return SHIP_DEFINITIONS[currentShipIndex.value]
    }
    return null
    })

    // ===== SOCKET.IO =====

    socket.on('connect', () => {
        console.log('Connected to server')
        socket.emit("JoinLobbyBS",roomId)
        socket.emit("RequestGamePhaseBS",roomId)
        countPlayers=0;
    })


    socket.on("PackGamePhaseBS",()=>{
      socket.emit("SendGamePhaseBS",roomId,phase.value)
    })

    socket.on("CatchGamePhaseBS", (enemyPhase:string)=>{
      if(enemyPhase === GamePhase.PLAYING){
        phase.value = GamePhase.PLAYING;
        console.log(phase.value);
        // currentShipIndex.value = 5;
        socket.emit("RequestEnemyBoardBS", roomId);
        socket.emit("RequestPlayerBoardBS", roomId);
      }
    })

    socket.on("PackPlayerBoardBS", ()=>{
      socket.emit("SendPlayerBoardBS", 
      {
        lobby: roomId,
        board: enemyBoard.value.map(row => row.map(cell => ({...cell}))),
        ships: enemyShips.value,
        turn: currentTurn.value});
    })

    socket.on("CatchPlayerBoardBS", (board:Cell[][],ships:Ship[], turn:string)=>{
      playerBoard.value = board
      playerShips.value = ships;
      showShips();
      currentTurn.value = (turn === 'player')? 'enemy' : 'player';
      currentBoard.value = (turn === 'player')? 'player' : 'enemy';
    })

    socket.on("isReadyBS",(count:number)=>{
        if(countPlayers + count === 2){
            socket.emit("BothReadyBS", roomId);
        }
    })


    socket.on('StartGameBS', () => {
        console.log('Both players are ready! Starting game...')
        socket.emit("RequestEnemyBoardBS", roomId);
        phase.value = GamePhase.PLAYING;
        currentBoard.value = 'player';
        console.log(currentBoard.value);
    })


    socket.on('PackBoard', () => {
        socket.emit('SendBoard', {
            roomId,
            board: hideShips(),
            ships: playerShips.value,
        })
    })


    socket.on('ReceiveEnemyBoard', ( board: Cell[][], ships: Ship[] ) => {
        enemyBoard.value = board
        enemyShips.value = ships
    })
    

    socket.on("GrantTurnBS", () => {
        console.log("It's your turn");
        currentTurn.value = 'player';
        currentBoard.value = 'enemy';
    });


    socket.on("ReceiveAttack", (row: number, col: number) => {
        enemyAttack(row, col);
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

        // ===== REINICIAR =====
    function resetGame() {
      playerBoard.value = fillBoard()
      playerShips.value = []
      phase.value = GamePhase.PLACING
      currentShipIndex.value = 0
      currentOrientation.value = Orientation.HORIZONTAL
      countPlayers = 0;
    }

    // Ocultar los barcos después de colocarlos
    function hideShips() {
      let SubsBoard: Cell[][] = playerBoard.value.map(row => row.map(cell => ({ ...cell })));
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          if (SubsBoard[row][col].state === CellState.SHIP) {
            SubsBoard[row][col].state = CellState.EMPTY
          }
        }
      }
      return SubsBoard;
    }

    function showShips() {
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          if (playerBoard.value[row][col].shipId !== null) {
            playerBoard.value[row][col].state = CellState.SHIP
          }
        }
      }
    }

    function sendReady() {
      countPlayers=1;
      socket.emit('PlayerReadyBS', roomId,countPlayers);
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
      currentBoard.value = 'player'
    }
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
    

    if (cell?.state === CellState.HIT || cell?.state === CellState.MISS || cell?.state === CellState.SUNK) {
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

    const result = attack(enemyBoard.value, enemyShips.value, { row, col })
    if (result === 'invalid') return

    socket.emit("SendAttack", roomId, row, col);

    if (enemyShips.value.every(s => s.isSunk)) {
      phase.value = GamePhase.GAME_OVER;
      alert('¡Has Ganado! Hundiste todos los barcos.');
      setTimeout(()=>{resetGame()},1000);
      return
    }

    if (result !== 'hit'){
      currentTurn.value = 'enemy';
      socket.emit("SwitchTurnBS", roomId);
      setTimeout(() => {currentBoard.value = 'player';}, 2000);
    }
    
  }



  function enemyAttack(row: number, col: number) {
    if (phase.value !== GamePhase.PLAYING || currentTurn.value !== 'enemy') return

    const result = attack(playerBoard.value, playerShips.value, { row, col })
    if (result === 'invalid') return

    if (playerShips.value.every(s => s.isSunk)) {
      phase.value = GamePhase.GAME_OVER;
      alert('¡Has perdido! Todos tus barcos han sido hundidos.');
      setTimeout(()=>{resetGame()},1000);
      return
    }
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
          :class="'cell--' + activeBoard[row - 1][col - 1].state"
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
        <button v-if="currentShipIndex >= SHIP_DEFINITIONS.length" @click="sendReady">
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