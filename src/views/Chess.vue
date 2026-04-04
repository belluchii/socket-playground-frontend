<script setup lang="ts">
import {
  board,
  getValidMoves,
  isInCheck,
  isInCheckMate,
  movePiece,
  pieceSymbols,
  setBoard,
} from '@/utils/chess'
import type { Piece } from '@/utils/chess'
import ChessSquare from '@/components/ChessSquare.vue'
import ChessPiece from '@/components/ChessPiece.vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'

setBoard()

const highlightedMoves = ref<[number, number][]>([])
const dragPiece = ref<{ type: Piece['type']; team: Piece['team'] } | null>(null)
const fromRef = ref<[number, number] | null>(null)
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

function startMove(row: number, col: number) {
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
  if (!from) return

  const [fromRow, fromCol] = from

  if (!wasDrag && fromRow === row && fromCol === col) return

  from = null
  highlightedMoves.value = []

  if (fromRow === row && fromCol === col) return

  const move = movePiece(fromRow, fromCol, row, col)
  if (!move) return

  currentTeam = currentTeam === 'white' ? 'black' : 'white'

  const opponent = currentTeam
  if (isInCheck(opponent, null, null)) {
    if (isInCheckMate(opponent)) {
      const winner = opponent === 'white' ? 'black' : 'white'
      alert(`¡Jaque mate! Gana ${winner}`)
    } else {
      alert(`¡Jaque al rey ${opponent}!`)
    }
  }
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
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onMouseMove)
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<template>
  <main>
    <div class="chess-board">
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
</template>

<style>
main {
  margin: 100px auto;
  width: 90%;
  max-width: 1200px;
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
