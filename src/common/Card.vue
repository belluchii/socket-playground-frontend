<script setup lang="ts">
type Variant = 'default' | 'accent-top' | 'accent-left' | 'striped' | 'dark' | 'orange'

interface Props {
  variant?: Variant
  label?: string
  title?: string
  body?: string
  hoverable?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  label: '',
  title: '',
  body: '',
  hoverable: true,
})
</script>

<template>
  <div :class="['card', `card-${variant}`, { 'card-hoverable': hoverable }]">
    <!-- Header slot o props -->
    <slot name="header">
      <span v-if="label" class="card-label">{{ label }}</span>
      <h3 v-if="title" class="card-title">{{ title }}</h3>
    </slot>

    <!-- Body slot o prop -->
    <slot name="body">
      <p v-if="body" class="card-body">{{ body }}</p>
    </slot>

    <!-- Footer / Actions -->
    <div v-if="$slots.actions" class="card-actions">
      <slot name="actions" />
    </div>

    <!-- Default slot para contenido libre -->
    <slot />
  </div>
</template>

<style scoped>
/* ─── Base ─── */
.card {
  background: var(--color-white);
  border: var(--border-thick) solid var(--color-black);
  padding: var(--space-6);
  position: relative;
  transition:
    transform 0.15s,
    box-shadow 0.15s;
}

/* ─── Hover ─── */
.card-hoverable:hover {
  transform: translate(-4px, -4px);
  box-shadow: var(--shadow-hard-lg);
}

/* ═══════════════════════════════════════════
   VARIANTS
═══════════════════════════════════════════ */

/* ─── Accent Top ─── */
.card-accent-top {
  border-top: var(--border-heavy) solid var(--color-orange);
}

/* ─── Accent Left ─── */
.card-accent-left {
  border-left: var(--border-heavy) solid var(--color-yellow);
}

/* ─── Striped ─── */
.card-striped {
  overflow: hidden;
  padding-left: var(--space-8);
}

.card-striped::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 8px;
  height: 100%;
  background: repeating-linear-gradient(
    180deg,
    var(--color-orange) 0,
    var(--color-orange) 6px,
    var(--color-black) 6px,
    var(--color-black) 12px
  );
}

/* ─── Dark ─── */
.card-dark {
  background: var(--color-black);
  color: var(--color-cream);
  border-color: var(--color-black);
}

.card-dark .card-body {
  color: var(--color-grey-lt);
}

.card-dark.card-hoverable:hover {
  box-shadow: var(--shadow-hard-orange);
}

/* ─── Orange ─── */
.card-orange {
  background: var(--color-orange);
  color: var(--color-white);
  border-color: var(--color-orange);
}

.card-orange .card-label {
  opacity: 0.8;
}

.card-orange.card-hoverable:hover {
  box-shadow: 6px 6px 0 var(--color-black);
}

/* ═══════════════════════════════════════════
   INNER ELEMENTS
═══════════════════════════════════════════ */

/* ─── Label ─── */
.card-label {
  display: block;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-ultra);
  text-transform: uppercase;
  margin-bottom: var(--space-3);
  opacity: 0.6;
}

/* ─── Title ─── */
.card-title {
  font-size: var(--text-lg);
  font-weight: var(--weight-black);
  letter-spacing: var(--tracking-tight);
  margin-bottom: var(--space-3);
  line-height: 1.1;
}

/* ─── Body ─── */
.card-body {
  font-size: var(--text-sm);
  line-height: var(--leading-loose);
  margin-bottom: var(--space-6);
  opacity: 0.8;
}

/* ─── Actions ─── */
.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: auto;
}
</style>
