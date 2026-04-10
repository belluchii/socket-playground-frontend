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
    path: '/game/tictactoe',
    name: 'TicTacToe',
    component: () => import('@/views/TicTacToe.vue'),
  },
  {
    path: '/game/chess',
    name: 'Chess',
    component: () => import('@/views/Chess.vue'),
  },
  {
    path: '/game/arm-wrestling',
    name: 'ArmWrestling',
    component: () => import('@/views/ArmWrest.vue'),
  },
  {
    path: '/game/BattleShip',
    name: 'BattleShip',
    component: () => import('@/views/BattleShip.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
