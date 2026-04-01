<script setup lang="ts">
import Button from '@/common/Button.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface NavLink {
  label: string
  to: string
}

const router = useRouter()

const links: NavLink[] = [
  { label: 'Work', to: '/work' },
  { label: 'About', to: '/about' },
  { label: 'Archive', to: '/archive' },
  { label: 'Contact', to: '/contact' },
]

const logoText = 'KINETIC'
const ctaText = '✦ open'
const isOpen = ref<boolean>(false)

const toggleMenu = (): void => {
  isOpen.value = !isOpen.value
}

const goHome = (): void => {
  router.push('/')
}

const handleCta = (): void => {
  // Tu lógica de CTA acá
  console.log('CTA clicked')
}

const closeMobileMenu = (): void => {
  isOpen.value = false
}
</script>

<template>
  <nav class="nav">
    <div class="nav-inner">
      <div class="nav-logo" @click="goHome">{{ logoText }}<span class="nav-logo-dot">.</span></div>

      <div class="nav-links">
        <!-- <router-link
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="nav-link"
          active-class="active"
        >
          {{ link.label }}
        </router-link> -->
      </div>

      <div class="nav-action">
        <Button variant="secondary" size="sm" @click="handleCta">
          {{ ctaText }}
        </Button>
      </div>

      <!-- Mobile hamburger -->
      <button class="nav-hamburger" @click="toggleMenu">
        <span :class="['hamburger-line', { open: isOpen }]" />
        <span :class="['hamburger-line', { open: isOpen }]" />
        <span :class="['hamburger-line', { open: isOpen }]" />
      </button>
    </div>

    <!-- Mobile menu -->
    <Transition name="menu">
      <div v-if="isOpen" class="nav-mobile">
        <!-- <router-link
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="nav-mobile-link"
          active-class="active"
          @click="closeMobileMenu"
        >
          {{ link.label }}
        </router-link> -->
        <div class="nav-mobile-action">
          <Button variant="secondary" block @click="(handleCta(), closeMobileMenu())">
            {{ ctaText }}
          </Button>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
/* ═══════════════════════════════════════════
   NAVBAR — BASE
═══════════════════════════════════════════ */
.nav {
  background: var(--color-black);
  color: var(--color-cream);
  border-bottom: var(--border-thick) solid var(--color-orange);
  position: fixed;
  top: 0;
  z-index: 1000;
  width: 100%;
}

.nav::before {
  content: '';
  position: absolute;
  pointer-events: none;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: repeating-linear-gradient(
    90deg,
    transparent,
    transparent calc(var(--stripe-size) - 1px),
    rgba(255, 255, 255, 0.04) var(--stripe-size)
  );
}

.nav-inner {
  display: flex;
  align-items: center;
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
}

/* ═══════════════════════════════════════════
   LOGO
═══════════════════════════════════════════ */
.nav-logo {
  padding: var(--space-4) var(--space-6) var(--space-4) 0;
  font-size: var(--text-lg);
  font-weight: var(--weight-black);
  letter-spacing: var(--tracking-tight);
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.15s;
}

.nav-logo:hover {
  opacity: 0.8;
}

.nav-logo-dot {
  color: var(--color-orange);
}

/* ═══════════════════════════════════════════
   LINKS — DESKTOP
═══════════════════════════════════════════ */
.nav-links {
  display: flex;
  flex: 1;
}

.nav-link:first-of-type {
  border-left: var(--border-base) solid rgba(255, 255, 255, 0.08);
}

.nav-link:first-of-type:hover {
  border-left: var(--border-base) solid rgba(255, 255, 255, 0);
}

.nav-link {
  padding: var(--space-4) var(--space-6);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-grey);
  border-right: var(--border-base) solid rgba(255, 255, 255, 0.08);
  transition:
    color 0.15s,
    background 0.15s;
  position: relative;
}

.nav-link:hover {
  color: var(--color-cream);
  background: rgba(255, 255, 255, 0.08);
}

.nav-link.active {
  color: var(--color-orange);
  background: rgba(255, 255, 255, 0.08);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--color-orange);
}

/* ═══════════════════════════════════════════
   CTA — DESKTOP
═══════════════════════════════════════════ */
.nav-action {
  margin-left: auto;
  padding: var(--space-4) 0 var(--space-4) var(--space-6);
}

/* ═══════════════════════════════════════════
   HAMBURGER — MOBILE ONLY
═══════════════════════════════════════════ */
.nav-hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 44px;
  height: 44px;
  padding: var(--space-2);
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
}

.hamburger-line {
  display: block;
  width: 100%;
  height: 3px;
  background: var(--color-cream);
  transition:
    transform 0.25s,
    opacity 0.25s;
  transform-origin: center;
}

.hamburger-line.open:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.hamburger-line.open:nth-child(2) {
  opacity: 0;
}

.hamburger-line.open:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

/* ═══════════════════════════════════════════
   MOBILE MENU
═══════════════════════════════════════════ */
.nav-mobile {
  display: none;
  flex-direction: column;
  background: var(--color-black);
  border-top: var(--border-base) solid rgba(255, 255, 255, 0.1);
  padding: var(--space-4) 0;
}

.nav-mobile-link {
  display: block;
  padding: var(--space-4) var(--space-6);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-grey);
  border-bottom: var(--border-thin) solid rgba(255, 255, 255, 0.06);
  transition:
    color 0.15s,
    background 0.15s,
    padding-left 0.15s;
}

.nav-mobile-link:hover {
  color: var(--color-cream);
  background: rgba(255, 255, 255, 0.05);
  padding-left: var(--space-8);
}

.nav-mobile-link.active {
  color: var(--color-orange);
  border-left: var(--border-thick) solid var(--color-orange);
}

.nav-mobile-action {
  padding: var(--space-6);
}

/* ═══════════════════════════════════════════
   TRANSITION
═══════════════════════════════════════════ */
.menu-enter-active,
.menu-leave-active {
  transition:
    opacity 0.25s,
    transform 0.25s;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ═══════════════════════════════════════════
   RESPONSIVE
═══════════════════════════════════════════ */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .nav-action {
    display: none;
  }

  .nav-hamburger {
    display: flex;
  }

  .nav-mobile {
    display: flex;
  }

  .nav-logo {
    border-right: none;
  }
}
</style>
