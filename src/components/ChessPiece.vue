<script setup lang="ts">
import { board, pieceSymbols } from '@/utils/chess'
import { computed } from 'vue'

interface Props {
  row: number
  col: number
  dragging: boolean
}
const props = defineProps<Props>()

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
