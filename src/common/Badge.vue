<script setup lang="ts">
type Variant = 'black' | 'orange' | 'yellow' | 'red' | 'blue' | 'outline' | 'cream'

interface Props {
  variant?: Variant
}

withDefaults(defineProps<Props>(), {
  variant: 'black',
})
</script>

<template>
  <span :class="['badge', `badge-${variant}`]">
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  padding: 3px var(--space-3);
  border: var(--border-base) solid currentColor;
  line-height: 1;
}

/* ─── Variants ─── */
.badge-black {
  background: var(--color-black);
  color: var(--color-cream);
  border-color: var(--color-black);
}

.badge-orange {
  background: var(--color-orange);
  color: var(--color-white);
  border-color: var(--color-orange);
}

.badge-yellow {
  background: var(--color-yellow);
  color: var(--color-black);
  border-color: var(--color-black);
}

.badge-red {
  background: var(--color-red);
  color: var(--color-white);
  border-color: var(--color-red);
}

.badge-blue {
  background: var(--color-blue);
  color: var(--color-white);
  border-color: var(--color-blue);
}

.badge-outline {
  background: transparent;
  color: var(--color-black);
  border-color: var(--color-black);
}

.badge-cream {
  background: var(--color-cream);
  color: var(--color-black);
  border-color: var(--color-black);
}
</style>
