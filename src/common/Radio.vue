<script setup lang="ts">
interface Option {
  value: string
  label: string
  disabled?: boolean
}

interface Props {
  label?: string
  options?: Option[]
  modelValue?: string
  disabled?: boolean
  error?: string
  hint?: string
}

withDefaults(defineProps<Props>(), {
  label: '',
  options: () => [],
  modelValue: '',
  disabled: false,
  error: '',
  hint: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const select = (value: string): void => {
  emit('update:modelValue', value)
}
</script>

<template>
  <div :class="['field', { 'field-disabled': disabled }]">
    <span v-if="label" class="field-label">{{ label }}</span>

    <div class="radio-group">
      <label
        v-for="option in options"
        :key="option.value"
        :class="['radio-item', { 'radio-disabled': option.disabled || disabled }]"
      >
        <input
          type="radio"
          :checked="modelValue === option.value"
          :disabled="option.disabled || disabled"
          @change="select(option.value)"
        />
        <span class="radio-label">{{ option.label }}</span>
      </label>
    </div>

    <div v-if="error" class="field-error">✕ {{ error }}</div>
    <div v-else-if="hint" class="field-hint">{{ hint }}</div>
  </div>
</template>

<style scoped>
/* ─── Field ─── */
.field {
  margin-bottom: var(--space-6);
}

.field-disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* ─── Label ─── */
.field-label {
  display: block;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-ultra);
  text-transform: uppercase;
  font-weight: var(--weight-bold);
  margin-bottom: var(--space-2);
}

/* ─── Group ─── */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

/* ─── Item ─── */
.radio-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
}

.radio-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ─── Custom Radio ─── */
.radio-item input {
  appearance: none;
  width: 20px;
  height: 20px;
  min-width: 20px;
  border: var(--border-thick) solid var(--color-black);
  background: var(--color-white);
  cursor: pointer;
  position: relative;
  border-radius: 50%;
  transition: background 0.15s;
}

.radio-item input:checked {
  background: var(--color-black);
}

.radio-item input:checked::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 10px;
  height: 10px;
  background: var(--color-cream);
  border-radius: 50%;
}

.radio-item input:focus-visible {
  box-shadow: var(--shadow-hard-orange);
}

.radio-disabled input {
  cursor: not-allowed;
}

/* ─── Label Text ─── */
.radio-label {
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
}

/* ─── Feedback ─── */
.field-error {
  font-size: var(--text-xs);
  color: var(--color-red);
  margin-top: var(--space-2);
  font-family: var(--font-mono);
  font-weight: var(--weight-bold);
}

.field-hint {
  font-size: var(--text-xs);
  color: var(--color-grey);
  margin-top: var(--space-2);
  font-family: var(--font-mono);
}
</style>
