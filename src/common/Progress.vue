<script setup lang="ts">
type Variant = 'default' | 'orange' | 'yellow' | 'striped' | 'red' | 'blue'

interface Props {
  value?: number
  variant?: Variant
  label?: string
  showValue?: boolean
}

withDefaults(defineProps<Props>(), {
  value: 0,
  variant: 'default',
  label: '',
  showValue: true,
})
</script>

<template>
  <div class="progress">
    <!-- Label -->
    <div v-if="label || showValue" class="progress-label">
      <span v-if="label" class="progress-label-text">{{ label }}</span>
      <span v-if="showValue" class="progress-label-value">{{ value }}%</span>
    </div>

    <!-- Track -->
    <div class="progress-track">
      <div
        :class="['progress-fill', `progress-fill-${variant}`]"
        :style="{ width: `${Math.min(Math.max(value, 0), 100)}%` }"
      />
    </div>
  </div>
</template>

<style scoped>
/* ─── Container ─── */
.progress {
  margin-bottom: var(--space-4);
}

/* ─── Label ─── */
.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  margin-bottom: var(--space-1);
}

.progress-label-text {
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

.progress-label-value {
  color: var(--color-grey);
}

/* ─── Track ─── */
.progress-track {
  height: 16px;
  background: var(--color-cream);
  border: var(--border-thick) solid var(--color-black);
  overflow: hidden;
}

/* ─── Fill Base ─── */
.progress-fill {
  height: 100%;
  background: var(--color-black);
  transition: width 0.6s ease;
}

/* ─── Variants ─── */
.progress-fill-default {
  background: var(--color-black);
}

.progress-fill-orange {
  background: var(--color-orange);
}

.progress-fill-yellow {
  background: var(--color-yellow);
}

.progress-fill-red {
  background: var(--color-red);
}

.progress-fill-blue {
  background: var(--color-blue);
}

.progress-fill-striped {
  background: repeating-linear-gradient(
    90deg,
    var(--color-black) 0,
    var(--color-black) 12px,
    var(--color-orange) 12px,
    var(--color-orange) 24px
  );
}
</style>
