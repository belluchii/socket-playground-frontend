<script setup lang="ts">
// Chess board state and utilities for piece movement and validation.
// Used by: ChessSquare, ChessPiece components for rendering, movePiece for game logic.
// Connects to: useChessSocket for multiplayer synchronization.
import {
  board,
  createPiece,
  getValidMoves,
  isInCheck,
  isInCheckMate,
  isInsufficientMaterial,
  isStalemate,
  movePiece,
  pieceSymbols,
  setBoard,
  setSquare,
} from '@/utils/chess'
import type { Piece } from '@/utils/chess'

// Chess board visual components for rendering squares and pieces.
// Used by: template to display the chess board.
// Connects to: chess.ts (board state), PromotionModal (pawn promotion).
import ChessSquare from '@/components/ChessSquare.vue'
import ChessPiece from '@/components/ChessPiece.vue'
import PromotionModal from '@/components/PromotionModal.vue'

// Socket composable for real-time multiplayer communication.
// Used by: all socket event handlers for game synchronization.
// Connects to: server Chess.ts events.
import { useChessSocket } from '@/composables/useChessSocket'

// Vue lifecycle and state management utilities.
// Used by: onMounted (socket setup), onBeforeUnmount (cleanup), ref (reactive state).
import { onBeforeUnmount, onMounted, ref } from 'vue'

// Route utilities to get room ID from URL query parameter.
// Used by: roomId variable to connect to specific game room.
// Connects to: useChessSocket joinRoom.
import { useRoute } from 'vue-router'

// Gets room ID from URL query or uses default.
// Used by: useChessSocket to identify which game room to join.
// Connects to: joinRoom, emitMove, emitPromotion, requestGameState.
const route = useRoute()
const roomId = (route.query.room as string) || 'default'

// Initializes board with default chess starting position.
// Used by: component on load before socket connection.
// Connects to: chess.ts setBoard function.
setBoard()

// Socket functions and event handlers for chess game.
// Used by: onMounted to register event callbacks.
// Connects to: Chess.vue lifecycle and chess.ts (server events).
const {
  connect,
  joinRoom,
  emitMove,
  emitPromotion,
  onGameState,
  onTurnChanged,
  onPieceMoved,
  onPiecePromoted,
  onGameOver,
  onPlayerDisconnected,
  requestGameState,
} = useChessSocket()

// Highlights valid moves for selected piece.
// Used by: startMove to populate, ChessSquare template for highlighting.
// Connects to: getValidMoves (populate), ChessSquare :highlighted (display).
const highlightedMoves = ref<[number, number][]>([])

// Stores piece being dragged for visual feedback.
// Used by: startMove, endMove, drag-ghost template.
// Connects to: pieceSymbols (display), drag-ghost :class (team color).
const dragPiece = ref<{ type: Piece['type']; team: Piece['team'] } | null>(null)

// Stores starting position of drag.
// Used by: startMove, endMove, ChessPiece :dragging (hide original).
// Connects to: ChessPiece template.
const fromRef = ref<[number, number] | null>(null)

// Stores pending pawn promotion state.
// Used by: endMove (detect promotion), PromotionModal template (display modal).
// Connects to: handlePromotion (process), PromotionModal :team.
const promotionPending = ref<{ row: number; col: number; team: Piece['team'] } | null>(null)

// Shows waiting message when opponent not connected.
// Used by: template :if to display message, onPlayerDisconnected (set true).
// Connects to: onGameState (set false), onPlayerDisconnected (set true).
const waitingForPlayer = ref(true)

// Player's assigned team (white or black).
// Used by: startMove (validate turn), onGameState (set from server).
// Connects to: onGameState callback.
let myTeam: 'white' | 'black' | null = null

// Starting position of current move.
// Used by: startMove (set), endMove (get and clear).
// Connects to: getValidMoves, movePiece, highlightedMoves.
let from: [number, number] | null = null

// Current turn (which team's move it is).
// Used by: startMove (validate), checkAfterMove (update), onTurnChanged (sync).
// Connects to: onGameState, onTurnChanged, checkAfterMove.
let currentTeam: 'white' | 'black' = 'white'

// Drag state tracking.
// Used by: startDrag, endMove, template :if (drag-ghost).
// Connects to: onMouseMove, drag-ghost.
let drag = false

// Animation frame ID for mouse tracking.
// Used by: onMouseMove (request), onBeforeUnmount (cancel).
// Connects to: requestAnimationFrame, cancelAnimationFrame.
let rafId: number | null = null

// Mouse position for drag-ghost positioning.
// Used by: onMouseMove (update), drag-ghost :style (position).
// Connects to: onMouseMove, template.
const x = ref(0)
const y = ref(0)

// Scroll position for drag-ghost when page scrolled.
// Used by: onScroll (update), drag-ghost :style (adjust for scroll).
// Connects to: onScroll, template.
const scrollX = ref(0)
const scrollY = ref(0)

// Starts drag operation when user clicks a piece.
// Used by: ChessPiece @mousedown event.
// Connects to: drag variable.
function startDrag() {
  drag = true
}

// Ends drag operation.
// Used by: ChessPiece @mouseup, endMove (on drop).
// Connects to: drag variable.
function endDrag() {
  drag = false
}

// Checks game state after each move: check, checkmate, stalemate, insufficient material.
// Used by: endMove, handlePromotion, onPieceMoved, onPiecePromoted.
// Connects to: isInsufficientMaterial, isInCheck, isInCheckMate, isStalemate.
function checkAfterMove() {
  currentTeam = currentTeam === 'white' ? 'black' : 'white'
  const opponent = currentTeam

  if (isInsufficientMaterial()) {
    console.log('Empate por falta de material')
    return
  }

  if (isInCheck(opponent, null, null)) {
    if (isInCheckMate(opponent)) {
      const winner = opponent === 'white' ? 'black' : 'white'
      console.log(`¡Jaque mate! Gana ${winner}`)
    } else {
      console.log(`¡Jaque al rey ${opponent}!`)
    }
  } else if (isStalemate(opponent)) {
    console.log('Empate por ahogado')
  }
}

// Handles pawn promotion when user selects piece type.
// Used by: PromotionModal @promote event.
// Connects to: setSquare, emitPromotion, checkAfterMove, promotionPending.
function handlePromotion(type: Piece['type']) {
  if (!promotionPending.value) return
  const { row, col, team } = promotionPending.value
  setSquare(row, col, createPiece(type, team))
  emitPromotion(roomId, row, col, type)
  promotionPending.value = null
  checkAfterMove()
}

// Initiates piece movement on mouse down.
// Used by: ChessPiece @mousedown event.
// Connects to: getValidMoves, highlightedMoves, dragPiece, from.
function startMove(row: number, col: number) {
  if (promotionPending.value) return
  if (myTeam && currentTeam !== myTeam) return
  startDrag()
  const piece = board[row]?.[col]
  if (!piece || piece.team !== currentTeam) return

  from = [row, col]
  fromRef.value = [row, col]
  highlightedMoves.value = getValidMoves(row, col, piece)
  dragPiece.value = { type: piece.type, team: piece.team }
}

// Completes piece movement on mouse up.
// Used by: ChessSquare @mouseup event.
// Connects to: movePiece, emitMove, checkAfterMove, promotionPending.
function endMove(row: number, col: number) {
  const wasDrag = drag
  endDrag()
  dragPiece.value = null
  fromRef.value = null
  if (!from || promotionPending.value) return

  const [fromRow, fromCol] = from

  if (!wasDrag && fromRow === row && fromCol === col) return

  from = null
  highlightedMoves.value = []

  if (fromRow === row && fromCol === col) return

  const move = movePiece(fromRow, fromCol, row, col)
  if (!move) return

  emitMove(roomId, fromRow, fromCol, row, col)

  const piece = board[row]?.[col]
  if (piece?.type === 'pawn' && (row === 0 || row === 7)) {
    promotionPending.value = { row, col, team: piece.team }
    return
  }

  checkAfterMove()
}

// Tracks mouse position for drag-ghost positioning.
// Used by: window 'mousemove' event in onMounted.
// Connects to: x, y, rafId.
function onMouseMove(e: MouseEvent) {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    x.value = e.clientX
    y.value = e.clientY
  })
}

// Tracks scroll position for drag-ghost adjustment.
// Used by: window 'scroll' event in onMounted.
// Connects to: scrollX, scrollY.
function onScroll() {
  scrollX.value = window.scrollX || window.pageXOffset
  scrollY.value = window.scrollY || window.pageYOffset
}

// Generates array of all 64 squares for board rendering.
// Used by: ChessSquare v-for in template.
// Connects to: template.
const squares = Array.from({ length: 64 }, (_, i) => ({
  row: Math.floor(i / 8),
  col: i % 8,
}))

// Component initialization and socket event setup.
// Used by: Vue onMounted lifecycle hook.
// Connects to: all useChessSocket functions.
onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('scroll', onScroll)

  // Connect to server and join room as white (first player).
  connect()
  joinRoom(roomId, 'white')

  // Receives initial game state (board, turn, team) from server.
  // Used by: initial room join, player reconnection.
  // Connects to: setBoard, currentTeam, myTeam, waitingForPlayer.
  onGameState((data) => {
    if (data.myTeam === 'white' || data.myTeam === 'black') {
      myTeam = data.myTeam
    }
    setBoard(data.board)
    if (data.currentTurn === 'white' || data.currentTurn === 'black') {
      currentTeam = data.currentTurn
    }
    waitingForPlayer.value = false
  })

  // Receives turn change from server after valid move.
  // Used by: other player's move to update turn.
  // Connects to: currentTeam.
  onTurnChanged((turn) => {
    if (turn === 'white' || turn === 'black') {
      currentTeam = turn
    }
  })

  // Applies opponent's move to local board.
  // Used by: other player's MovePiece event.
  // Connects to: movePiece, checkAfterMove, promotionPending.
  onPieceMoved((fromRow, fromCol, toRow, toCol) => {
    const move = movePiece(fromRow, fromCol, toRow, toCol)
    if (!move) return
    const piece = board[toRow]?.[toCol]
    if (piece?.type === 'pawn' && (toRow === 0 || toRow === 7)) {
      promotionPending.value = { row: toRow, col: toCol, team: piece.team }
      return
    }
    checkAfterMove()
  })

  // Applies opponent's pawn promotion.
  // Used by: other player's Promote event.
  // Connects to: setSquare, checkAfterMove.
  onPiecePromoted((row, col, type) => {
    setSquare(row, col, createPiece(type, board[row]?.[col]?.team ?? 'white'))
    checkAfterMove()
  })

  // Handles game over notification.
  // Used by: checkmate or draw detection on server.
  // Connects to: console.log.
  onGameOver((result) => {
    console.log(result)
  })

  // Handles opponent disconnection.
  // Used by: other player's socket disconnect.
  // Connects to: waitingForPlayer.
  onPlayerDisconnected((team) => {
    console.log(`El jugador ${team} se desconectó, esperando reconexión...`)
    waitingForPlayer.value = true
  })
})

// Cleanup on component unmount.
// Used by: Vue onBeforeUnmount lifecycle hook.
// Connects to: removeEventListener, cancelAnimationFrame.
onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onMouseMove)
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<template>
  <main>
    <div v-if="waitingForPlayer" class="waiting">Esperando al otro jugador...</div>
    <div class="chess-board" :class="{ disabled: waitingForPlayer }">
      <ChessSquare
        v-for="square in squares"
        :key="`${square.row}-${square.col}`"
        :row="square.row"
        :col="square.col"
        :highlighted="highlightedMoves.some(([r, c]) => r === square.row && c === square.col)"
        @mouseup="endMove(square.row, square.col)"
      >
        <ChessPiece
          @mousedown="startMove(square.row, square.col)"
          @mouseup="endDrag()"
          :row="square.row"
          :col="square.col"
          :dragging="fromRef !== null && fromRef[0] === square.row && fromRef[1] === square.col"
        />
      </ChessSquare>
    </div>
  </main>

  <div
    v-if="drag && dragPiece"
    :style="{ left: x + scrollX + 'px', top: y + scrollY + 'px' }"
    class="drag-ghost"
    :class="dragPiece.team"
  >
    {{ pieceSymbols[dragPiece.type][dragPiece.team] }}
  </div>

  <PromotionModal
    v-if="promotionPending"
    :team="promotionPending.team"
    @promote="handlePromotion"
  />
</template>

<style>
main {
  margin: 100px auto;
  width: 90%;
  max-width: 1200px;
}

.waiting {
  text-align: center;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--color-text-secondary);
}

.chess-board {
  user-select: none;
  width: 800px;
  height: 800px;
  display: flex;
  flex-wrap: wrap;
  margin: auto;
  box-shadow: var(--shadow-hard-lg);
  border: var(--border-thick) solid var(--color-black);
}

.chess-board.disabled {
  pointer-events: none;
  opacity: 0.6;
}

.drag-ghost {
  position: absolute;
  pointer-events: none;
  font-size: 64px;
  line-height: 1;
  transform: translate(-50%, -50%);
  z-index: 100;
}

.drag-ghost.white {
  color: var(--color-red);
}

.drag-ghost.black {
  color: var(--color-blue);
}
</style>
