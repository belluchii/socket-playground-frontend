<script setup lang="ts">
type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'textarea'
  | 'select'

interface Props {
  label?: string
  type?: InputType
  modelValue?: string | number
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  rows?: number
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  modelValue: '',
  placeholder: '',
  hint: '',
  error: '',
  disabled: false,
  rows: 4,
})

defineEmits<{
  'update:modelValue': [value: string | number]
}>()
</script>

<template>
  <div :class="['field', { 'field-disabled': disabled }]">
    <label v-if="label" class="field-label">{{ label }}</label>

    <!-- Select -->
    <select
      v-if="type === 'select'"
      :class="['input', 'select', { 'input-error': error }]"
      :value="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <slot />
    </select>

    <!-- Textarea -->
    <textarea
      v-else-if="type === 'textarea'"
      :class="['input', { 'input-error': error }]"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />

    <!-- Input -->
    <input
      v-else
      :class="['input', { 'input-error': error }]"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />

    <!-- Feedback -->
    <div v-if="error" class="field-error">✕ {{ error }}</div>
    <div v-else-if="hint" class="field-hint">{{ hint }}</div>
  </div>
</template>

<style scoped>
/* ─── Field Container ─── */
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

/* ─── Input Base ─── */
.input {
  width: 100%;
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: var(--weight-regular);
  padding: var(--space-3) var(--space-4);
  background: var(--color-white);
  border: var(--border-thick) solid var(--color-black);
  border-radius: var(--radius-none);
  outline: none;
  transition: box-shadow 0.15s;
  color: var(--color-black);
}

.input::placeholder {
  color: var(--color-grey-lt);
}

.input:focus {
  box-shadow: var(--shadow-hard-orange);
}

/* ─── Error State ─── */
.input-error {
  border-color: var(--color-red);
}

.input-error:focus {
  box-shadow: 4px 4px 0 var(--color-red);
}

/* ─── Select ─── */
.select {
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M0 0l6 8 6-8z' fill='%23111'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: var(--space-12);
}

/* ─── Textarea ─── */
textarea.input {
  resize: vertical;
  min-height: 80px;
}

/* ─── Hint ─── */
.field-hint {
  font-size: var(--text-xs);
  color: var(--color-grey);
  margin-top: var(--space-1);
  font-family: var(--font-mono);
}

/* ─── Error Message ─── */
.field-error {
  font-size: var(--text-xs);
  color: var(--color-red);
  margin-top: var(--space-1);
  font-family: var(--font-mono);
  font-weight: var(--weight-bold);
}
</style>
