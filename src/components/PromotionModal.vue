<script setup lang="ts">
// Piece symbols for displaying promotion options.
// Used by: template to show available piece choices.
// Connects to: chess.ts pieceSymbols.
import { pieceSymbols } from '@/utils/chess'
import type { Piece } from '@/utils/chess'

// Team of the pawn being promoted (determines piece color).
// Used by: template to display correct colored pieces.
// Connects to: template pieceSymbols[team].
defineProps<{ team: Piece['team'] }>()

// Emits selected promotion piece type.
// Used by: handlePromotion in Chess.vue to complete promotion.
// Connects to: Chess.vue handlePromotion function.
const emit = defineEmits<{ promote: [type: Piece['type']] }>()
</script>

<template>
  <Teleport to="body">
    <div class="promotion-overlay">
      <div class="promotion-modal">
        <p>Elegí una pieza</p>
        <div class="promotion-options">
          <button
            v-for="type in ['queen', 'rook', 'bishop', 'knight'] as Piece['type'][]"
            :key="type"
            @click="emit('promote', type)"
            class="promotion-btn"
          >
            {{ pieceSymbols[type][team] }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.promotion-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.promotion-modal {
  background: var(--color-white);
  border: var(--border-thick) solid var(--color-black);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.promotion-modal p {
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--color-black);
}

.promotion-options {
  display: flex;
  gap: 1rem;
}

.promotion-btn {
  font-size: 52px;
  background: none;
  border: 2px solid var(--color-black);
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
}

.promotion-btn:hover {
  background: var(--color-black);
  color: var(--color-white);
}
</style>
