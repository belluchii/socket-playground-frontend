<script setup lang="ts">
interface Option {
  value: string
  label: string
  disabled?: boolean
}

interface Props {
  label?: string
  options?: Option[]
  modelValue?: string[]
  disabled?: boolean
  error?: string
  hint?: string
}

withDefaults(defineProps<Props>(), {
  label: '',
  options: () => [],
  modelValue: () => [],
  disabled: false,
  error: '',
  hint: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const toggle = (value: string, currentValues: string[]): void => {
  const updated = currentValues.includes(value)
    ? currentValues.filter((v) => v !== value)
    : [...currentValues, value]

  emit('update:modelValue', updated)
}
</script>

<template>
  <div :class="['field', { 'field-disabled': disabled }]">
    <span v-if="label" class="field-label">{{ label }}</span>

    <div class="checkbox-group">
      <label
        v-for="option in options"
        :key="option.value"
        :class="['checkbox-item', { 'checkbox-disabled': option.disabled || disabled }]"
      >
        <input
          type="checkbox"
          :checked="modelValue.includes(option.value)"
          :disabled="option.disabled || disabled"
          @change="toggle(option.value, modelValue)"
        />
        <span class="checkbox-label">{{ option.label }}</span>
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
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

/* ─── Item ─── */
.checkbox-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
}

.checkbox-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ─── Custom Checkbox ─── */
.checkbox-item input {
  appearance: none;
  width: 20px;
  height: 20px;
  min-width: 20px;
  border: var(--border-thick) solid var(--color-black);
  background: var(--color-white);
  cursor: pointer;
  position: relative;
  border-radius: 0;
  transition: background 0.15s;
}

.checkbox-item input:checked {
  background: var(--color-black);
}

.checkbox-item input:checked::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 5px;
  width: 5px;
  height: 9px;
  border: 2px solid var(--color-cream);
  border-top: none;
  border-left: none;
  transform: rotate(45deg);
}

.checkbox-item input:focus-visible {
  box-shadow: var(--shadow-hard-orange);
}

.checkbox-disabled input {
  cursor: not-allowed;
}

/* ─── Label Text ─── */
.checkbox-label {
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
