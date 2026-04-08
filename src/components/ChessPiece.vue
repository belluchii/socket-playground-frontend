<script setup lang="ts">
// Chess board state and piece symbols for rendering.
// Used by: computed piece property to display piece at position.
// Connects to: chess.ts board and pieceSymbols.
import { board, pieceSymbols } from '@/utils/chess'
import { computed } from 'vue'

// Props for ChessPiece component.
// Used by: template to render piece at position and handle drag state.
// Connects to: board computed, template classes.
interface Props {
  row: number
  col: number
  dragging: boolean
}
const props = defineProps<Props>()

// Gets piece at the specified position from board state.
// Used by: template to display piece and determine team class.
// Connects to: chess.ts board reactive array.
const piece = computed(() => board[props.row]?.[props.col])
</script>

<template>
  <div v-if="piece" :class="['piece', piece.team, { dragging }]">
    {{ pieceSymbols[piece.type][piece.team] }}
  </div>
</template>

<style scoped>
.piece {
  color: var(--color-blue);
  font-size: 3rem;
  cursor: pointer;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.white {
  color: var(--color-red);
}
.piece {
  transition: opacity 0.05s;
}
.piece.dragging {
  opacity: 0;
}
</style>
