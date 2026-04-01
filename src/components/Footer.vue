<script setup lang="ts"></script>

<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-left">
        <p class="footer-label">Kinetic playground</p>
        <p class="footer-sub">Play, enjoy, rest. All in one place</p>
      </div>

      <div class="footer-geo">
        <div class="geo-circle" />
        <div class="geo-square" />
        <div class="geo-triangle" />
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin: auto;

  width: 90%;
  border-top: var(--border-thick) solid var(--color-black);
  padding-top: var(--space-8);
  padding-bottom: var(--space-8);
}

.footer-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-4);
}

/* ─── Texto ─── */
.footer-label {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-ultra);
  text-transform: uppercase;
  font-weight: var(--weight-bold);
}

.footer-sub {
  font-size: var(--text-sm);
  font-weight: var(--weight-regular);
  color: var(--color-grey);
  margin-top: var(--space-1);
}

/* ─── Figuras geométricas ─── */
.footer-geo {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.geo-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-black);
  flex-shrink: 0;
}

.geo-square {
  width: 40px;
  height: 40px;
  background: var(--color-orange);
  flex-shrink: 0;
}

.geo-triangle {
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-bottom: 34px solid var(--color-yellow);
  flex-shrink: 0;
}

/* ─── Responsive ─── */
@media (max-width: 768px) {
  .footer-inner {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
