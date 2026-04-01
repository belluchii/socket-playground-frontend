<script setup lang="ts">
type Variant = 'solid' | 'orange' | 'dashed' | 'double' | 'striped'

interface Props {
  variant?: Variant
}

withDefaults(defineProps<Props>(), {
  variant: 'solid',
})
</script>

<template>
  <div v-if="variant === 'striped'" class="divider-striped" />
  <hr v-else :class="['divider', `divider-${variant}`]" />
</template>

<style scoped>
/* ─── Base ─── */
.divider {
  border: none;
  border-top: var(--border-thick) solid var(--color-black);
}

/* ─── Variants ─── */
.divider-orange {
  border-top-color: var(--color-orange);
}

.divider-dashed {
  border-top-style: dashed;
}

.divider-double {
  border-top-style: double;
  border-top-width: 6px;
}

/* ─── Striped ─── */
.divider-striped {
  height: 8px;
  background: repeating-linear-gradient(
    90deg,
    var(--color-black) 0,
    var(--color-black) 12px,
    var(--color-orange) 12px,
    var(--color-orange) 24px
  );
  border: none;
  margin: var(--space-8) 0;
}
</style>
