<script setup lang="ts">
interface Props {
  label?: string
  modelValue?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  label: '',
  modelValue: false,
  disabled: false,
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <label :class="['toggle', { 'toggle-disabled': disabled }]">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <div class="toggle-track">
      <div class="toggle-thumb" />
    </div>
    <span v-if="label" class="toggle-label">{{ label }}</span>
  </label>
</template>

<style scoped>
/* ─── Container ─── */
.toggle {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
}

.toggle-disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

/* ─── Hidden Input ─── */
.toggle input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

/* ─── Track ─── */
.toggle-track {
  width: 48px;
  height: 26px;
  background: var(--color-grey-lt);
  border: var(--border-thick) solid var(--color-black);
  position: relative;
  transition: background 0.15s;
  flex-shrink: 0;
}

.toggle input:checked ~ .toggle-track {
  background: var(--color-orange);
}

.toggle input:focus-visible ~ .toggle-track {
  box-shadow: var(--shadow-hard-orange);
}

/* ─── Thumb ─── */
.toggle-thumb {
  position: absolute;
  top: 1px;
  left: 1px;
  width: 18px;
  height: 18px;
  background: var(--color-black);
  transition: transform 0.15s;
}

.toggle input:checked ~ .toggle-track .toggle-thumb {
  transform: translateX(22px);
}

/* ─── Label ─── */
.toggle-label {
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
}
</style>
