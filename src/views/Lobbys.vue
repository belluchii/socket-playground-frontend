<script setup lang="ts">
import { io } from 'socket.io-client'
import { ref, computed } from 'vue'

import Badge from '@/common/Badge.vue'
import Button from '@/common/Button.vue'
import Table from '@/common/Table.vue'
import Input from '@/common/Input.vue'

const socket = io('http://localhost:3001', {
  transports: ['websocket'],
  reconnection: true,
})

socket.on('connect', () => {
  console.log(`Hola de nuevo id: ${socket.id}`)
  socket.emit('getLobbies')
})

interface Lobby {
  id: string
  users: number
}

const lobbyName = ref('')
const lobbys = ref<Lobby[]>([])

function joinLobby(lobby: string) {
  socket.emit('joinLobby', lobby)
}

function addLobby(lobby: string) {
  if (lobby !== '') joinLobby(lobby)
}

function exitLobby(lobby: string) {
  socket.emit('exitLobby', lobby)
}

function getCurrentLobbies() {
  socket.emit('getLobbies')
}

socket.on('joinedLobby', (texto) => {
  console.log(texto)
})

socket.on('lobbiesList', (lobbies) => {
  lobbys.value = lobbies
})

// ─── Las keys tienen que coincidir entre columns y rows ───
const columns = [
  { key: 'id', label: 'Lobby', mono: true },
  { key: 'players', label: 'Players', align: 'center' as const },
  { key: 'status', label: 'Status', align: 'center' as const },
  { key: 'action', label: '', align: 'right' as const },
]

const rows = computed(() =>
  lobbys.value.map((lobby) => ({
    id: lobby.id,
    players: `${lobby.users}/6`,
    status: lobby.users >= 6 ? 'Full' : 'Open',
    _raw: lobby,
  })),
)
</script>

<template>
  <main>
    <Table :columns="columns" :rows="rows">
      <!-- Celda players con badge -->
      <template #cell-players="{ row }">
        <Badge :variant="row._raw.users >= 6 ? 'red' : 'orange'">
          {{ row.players }}
        </Badge>
      </template>

      <!-- Celda status con badge -->
      <template #cell-status="{ row }">
        <Badge :variant="row._raw.users >= 6 ? 'red' : 'blue'">
          {{ row.status }}
        </Badge>
      </template>

      <!-- Celda action con botón -->
      <template #cell-action="{ row }">
        <Button
          variant="outline"
          size="sm"
          :disabled="row._raw.users >= 6"
          @click="joinLobby(row.id)"
        >
          Join →
        </Button>
      </template>

      <!-- Empty -->
      <template #empty> No hay lobbys disponibles </template>
    </Table>

    <!-- Controles -->
    <div class="controls">
      <Input v-model="lobbyName" placeholder="Nombre del lobby…"></Input>
      <div class="controls-buttons">
        <Button variant="secondary" size="sm" @click="addLobby(lobbyName)"> Crear lobby </Button>
        <Button variant="outline" size="sm" @click="exitLobby(lobbyName)"> Salir lobby </Button>
        <Button variant="yellow" size="sm" @click="getCurrentLobbies()"> Refresh </Button>
      </div>
    </div>
  </main>
</template>

<style scoped>
main {
  max-width: 1200px;
  width: 90%;
  margin: 50px auto;
  padding-top: calc(var(--space-24) + var(--space-8));
  padding-bottom: var(--space-16);
}

.controls {
  margin-top: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.controls-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}
</style>
