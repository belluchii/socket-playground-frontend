<script setup lang="ts">
interface Column {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  mono?: boolean
}

interface Props {
  columns: Column[]
  rows: Record<string, any>[]
  striped?: boolean
  hoverable?: boolean
}

withDefaults(defineProps<Props>(), {
  striped: true,
  hoverable: true,
})
</script>

<template>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key" :style="{ textAlign: col.align || 'left' }">
            {{ col.label }}
          </th>
        </tr>
      </thead>

      <tbody :class="{ striped, hoverable }">
        <tr v-for="(row, i) in rows" :key="i">
          <td
            v-for="col in columns"
            :key="col.key"
            :class="{ 'td-mono': col.mono }"
            :style="{ textAlign: col.align || 'left' }"
          >
            <!-- Slot dinámico por columna -->
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>

        <!-- Empty state -->
        <tr v-if="rows.length === 0">
          <td :colspan="columns.length" class="td-empty">
            <slot name="empty"> No hay datos disponibles </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* ─── Wrapper ─── */
.table-wrap {
  border: var(--border-thick) solid var(--color-black);
  overflow-x: auto;
}

/* ─── Table ─── */
table {
  width: 100%;
  border-collapse: collapse;
}

/* ─── Header ─── */
thead th {
  background: var(--color-black);
  color: var(--color-cream);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  padding: var(--space-3) var(--space-4);
  white-space: nowrap;
}

/* ─── Body ─── */
tbody tr {
  border-bottom: var(--border-base) solid var(--color-black);
}

tbody tr:last-child {
  border-bottom: none;
}

/* Striped */
tbody.striped tr:nth-child(even) {
  background: var(--color-cream);
}

/* Hoverable */
tbody.hoverable tr:hover {
  background: #f0eae0;
}

/* ─── Cells ─── */
td {
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
}

.td-mono {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

/* ─── Empty ─── */
.td-empty {
  text-align: center;
  padding: var(--space-12) var(--space-4);
  color: var(--color-grey);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}
</style>
