<script setup lang="ts">
import { io } from 'socket.io-client'
import { ref } from 'vue'
import Footer from './components/Footer.vue'

const socket = io('http://localhost:3001', {
  transports: ['websocket'],
  reconnection: true,
})

socket.on('connect', () => {
  console.log(`Hola de nuevo id: ${socket.id}`)
  socket.emit('getLobbies')
})

const lobbyName = ref('')
let lobbys = ref<{ id: string; users: number }[]>([])

function joinLobby(lobby: string) {
  socket.emit('joinLobby', lobby)
}

function addLobby(lobby: string) {
  if (lobby != '') joinLobby(lobby)
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
</script>

<template>
  <div class="cont">
    <p
      class="lobby"
      @click="() => joinLobby(texto.id)"
      v-for="(texto, index) in lobbys"
      :key="texto.id"
    >
      {{ texto.id }} - Jugadores: {{ texto.users }}/6
    </p>
  </div>
  <div class="buttons-cont">
    <input type="text" v-model="lobbyName" />
    <button @click="() => addLobby(lobbyName)">crear lobby</button>
    <button @click="() => exitLobby(lobbyName)">salir lobby</button>
    <button @click="() => getCurrentLobbies()">obtener lobbys actuales</button>
  </div>
  <Footer />
</template>

<style scoped>
.cont {
  flex-direction: column;
  gap: 10px;
  display: flex;
  padding: 20px;
  color: #fff;
  width: 400px;
  height: 700px;
  margin: auto;
  margin-top: 10px;
  border: 1px solid #fff;
  background: #000000;
}

.buttons-cont {
  width: 400px;
  margin: auto;
  margin-top: 20px;
}

.lobby {
  background: #444;
  padding: 5px;
  border: 1px solid #fff;
}
</style>
