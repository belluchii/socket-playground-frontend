<script setup lang="ts">
type AlertType = 'info' | 'success' | 'warning' | 'error'

interface Props {
  type?: AlertType
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  dismissible: false,
})

const emit = defineEmits<{
  dismiss: []
}>()

const icons: Record<AlertType, string> = {
  info: '◉',
  success: '✓',
  warning: '▲',
  error: '✕',
}
</script>

<template>
  <div :class="['alert', `alert-${type}`]">
    <span class="alert-icon">{{ icons[type] }}</span>
    <div class="alert-content">
      <slot />
    </div>

    <button v-if="dismissible" class="alert-close" @click="emit('dismiss')">✕</button>
  </div>
</template>

<style scoped>
/* ─── Base ─── */
.alert {
  padding: var(--space-4) var(--space-6);
  border: var(--border-thick) solid var(--color-black);
  border-left-width: var(--border-heavy);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

/* ─── Icon ─── */
.alert-icon {
  font-size: var(--text-md);
  line-height: 1;
  flex-shrink: 0;
}

/* ─── Content ─── */
.alert-content {
  flex: 1;
  line-height: var(--leading-normal);
}

/* ─── Dismiss ─── */
.alert-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: var(--weight-black);
  color: inherit;
  opacity: 0.5;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
  transition: opacity 0.15s;
}

.alert-close:hover {
  opacity: 1;
}

/* ─── Variants ─── */
.alert-info {
  border-left-color: var(--color-blue);
  background: #eef2f8;
}

.alert-success {
  border-left-color: #2a7a4b;
  background: #eaf4ee;
}

.alert-warning {
  border-left-color: var(--color-yellow);
  background: #fffae6;
}

.alert-error {
  border-left-color: var(--color-red);
  background: #fdecea;
}
</style>
