<script setup lang="ts">
interface Props {
  row: number
  col: number
  highlighted: boolean
}

defineProps<Props>()
</script>

<template>
  <div :class="[(row + col) % 2 ? '' : ' white', { highlighted }, 'chess-cell']">
    <slot />
  </div>
</template>

<style scoped>
.chess-cell {
  background: var(--color-black);
  width: calc(100% / 8);
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  position: relative;
}

.white {
  background: var(--color-white);
}
.highlighted {
  position: relative;
}

.highlighted::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 0, 0, 0.25);
}
</style>
