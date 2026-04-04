<script setup lang="ts">
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
import ChessSquare from '@/components/ChessSquare.vue'
import ChessPiece from '@/components/ChessPiece.vue'
import PromotionModal from '@/components/PromotionModal.vue'
import { useChessSocket } from '@/composables/useChessSocket'
import { onBeforeUnmount, onMounted, ref } from 'vue'

setBoard()

const {
  connect,
  joinRoom,
  requestTeam,
  sendTeam,
  emitMove,
  emitPromotion,
  onGameStart,
  onPieceMoved,
  onPiecePromoted,
  onReceivedTeam,
  onAskTeam,
  onGameOver,
  onPlayerLeft,
  getId,
} = useChessSocket()

const highlightedMoves = ref<[number, number][]>([])
const dragPiece = ref<{ type: Piece['type']; team: Piece['team'] } | null>(null)
const fromRef = ref<[number, number] | null>(null)
const promotionPending = ref<{ row: number; col: number; team: Piece['team'] } | null>(null)
const waitingForPlayer = ref(true)
let myTeam: 'white' | 'black' | null = null
let from: [number, number] | null = null
let currentTeam: 'white' | 'black' = 'white'
let drag = false
let rafId: number | null = null
const x = ref(0)
const y = ref(0)
const scrollX = ref(0)
const scrollY = ref(0)

function startDrag() {
  drag = true
}
function endDrag() {
  drag = false
}

function checkAfterMove() {
  currentTeam = currentTeam === 'white' ? 'black' : 'white'
  const opponent = currentTeam

  if (isInsufficientMaterial()) {
    alert('Empate por falta de material')
    return
  }

  if (isInCheck(opponent, null, null)) {
    if (isInCheckMate(opponent)) {
      const winner = opponent === 'white' ? 'black' : 'white'
      alert(`¡Jaque mate! Gana ${winner}`)
    } else {
      alert(`¡Jaque al rey ${opponent}!`)
    }
  } else if (isStalemate(opponent)) {
    alert('Empate por ahogado')
  }
}

function handlePromotion(type: Piece['type']) {
  if (!promotionPending.value) return
  const { row, col, team } = promotionPending.value
  setSquare(row, col, createPiece(type, team))
  emitPromotion(row, col, type)
  promotionPending.value = null
  checkAfterMove()
}

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

  emitMove(fromRow, fromCol, row, col)

  const piece = board[row]?.[col]
  if (piece?.type === 'pawn' && (row === 0 || row === 7)) {
    promotionPending.value = { row, col, team: piece.team }
    return
  }

  checkAfterMove()
}

function onMouseMove(e: MouseEvent) {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    x.value = e.clientX
    y.value = e.clientY
  })
}
function onScroll() {
  scrollX.value = window.scrollX || window.pageXOffset
  scrollY.value = window.scrollY || window.pageYOffset
}

const squares = Array.from({ length: 64 }, (_, i) => ({
  row: Math.floor(i / 8),
  col: i % 8,
}))

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('scroll', onScroll)

  connect()
  joinRoom()

  onGameStart(() => {
    waitingForPlayer.value = false
    requestTeam(getId()!)
  })

  onAskTeam(() => {
    const team = Math.random() > 0.5 ? 'white' : 'black'
    myTeam = team
    currentTeam = 'white'
    sendTeam(team, getId()!)
  })

  onReceivedTeam((team) => {
    if (team === '') return
    myTeam = team === 'white' ? 'black' : 'white'
    currentTeam = 'white'
  })

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

  onPiecePromoted((row, col, type) => {
    setSquare(row, col, createPiece(type, board[row]?.[col]?.team ?? 'white'))
    checkAfterMove()
  })

  onGameOver((result) => {
    alert(result)
  })

  onPlayerLeft(() => {
    alert('El otro jugador se desconectó')
  })
})

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
