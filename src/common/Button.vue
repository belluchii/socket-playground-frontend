<script setup lang="ts">
type Variant = 'primary' | 'secondary' | 'outline' | 'yellow' | 'ghost'
type Size = 'sm' | 'lg' | null

interface Props {
  variant?: Variant
  size?: Size
  icon?: boolean
  block?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: null,
  icon: false,
  block: false,
  disabled: false,
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    :class="[
      'btn',
      `btn-${variant}`,
      size ? `btn-${size}` : '',
      { 'btn-icon': icon, 'btn-block': block },
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped>
/* ─── Base ─── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  font-family: var(--font-display);
  font-weight: var(--weight-bold);
  font-size: var(--text-sm);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  text-decoration: none;
  padding: var(--space-3) var(--space-6);
  border: var(--border-thick) solid var(--color-black);
  border-radius: var(--radius-none);
  cursor: pointer;
  transition:
    transform 0.1s,
    box-shadow 0.1s;
  background: transparent;
  line-height: 1;
}

.btn:hover {
  transform: translate(-3px, -3px);
}

.btn:active {
  transform: translate(0, 0);
  box-shadow: none !important;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* ─── Variants ─── */
.btn-primary {
  background: var(--color-black);
  color: var(--color-cream);
  box-shadow: var(--shadow-hard-orange);
}
.btn-primary:hover {
  box-shadow: 6px 6px 0 var(--color-orange);
}

.btn-secondary {
  background: var(--color-orange);
  color: var(--color-white);
  border-color: var(--color-orange);
  box-shadow: var(--shadow-hard-md);
}
.btn-secondary:hover {
  box-shadow: 6px 6px 0 var(--color-black);
}

.btn-outline {
  background: transparent;
  color: var(--color-black);
  box-shadow: var(--shadow-hard-sm);
}
.btn-outline:hover {
  background: var(--color-black);
  color: var(--color-cream);
  box-shadow: 6px 6px 0 var(--color-orange);
}

.btn-yellow {
  background: var(--color-yellow);
  color: var(--color-black);
  border-color: var(--color-black);
  box-shadow: var(--shadow-hard-md);
}
.btn-yellow:hover {
  box-shadow: 6px 6px 0 var(--color-black);
}

.btn-ghost {
  background: transparent;
  color: var(--color-black);
  border-color: transparent;
  text-decoration: underline;
  text-underline-offset: 4px;
  box-shadow: none;
}
.btn-ghost:hover {
  transform: none;
}

/* ─── Sizes ─── */
.btn-sm {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-xs);
}

.btn-lg {
  padding: var(--space-4) var(--space-8);
  font-size: var(--text-base);
}

/* ─── Modifiers ─── */
.btn-icon {
  width: 44px;
  height: 44px;
  padding: 0;
}

.btn-block {
  width: 100%;
}
</style>
