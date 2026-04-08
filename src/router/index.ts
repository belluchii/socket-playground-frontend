import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/lobbys',
    name: 'Lobbys',
    component: () => import('@/views/Lobbys.vue'),
  },
  {
    path: '/Game/TicTacToe',
    name: 'TicTacToe',
    component: () => import('@/views/TicTacToe.vue'),
  },
  {
    path: '/Game/chess',
    name: 'Chess',
    component: () => import('@/views/Chess.vue'),
  },
  {
    path: '/Game/arm-wrestling',
    name: 'ArmWrestling',
    component: () => import('@/views/ArmWrest.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
