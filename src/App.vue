<script setup lang="ts">
import { io } from 'socket.io-client'
import { ref } from 'vue'

const socket = io('http://localhost:3001', {
  transports: ['websocket'],
  reconnection: true,
})

socket.on('connect', () => console.log(`Hola de nuevo id: ${socket.id}`))

const lobbyName = ref('')
let lobbys = ref(['lobby1', 'lobby2'])

function addLobby(lobby: string) {
  if (lobby != '') lobbys.value.push(lobby)
}

function joinLobby(lobby: string) {
  console.log(lobby)
}

function exitLobby() {
  console.log('saliste del lobby')
}
</script>

<template>
  <div class="cont">
    <p class="lobby" @click="() => joinLobby(texto)" v-for="(texto, index) in lobbys" :key="index">
      {{ texto }}
    </p>
  </div>
  <div class="buttons-cont">
    <input type="text" v-model="lobbyName" />
    <button @click="() => addLobby(lobbyName)">crear lobby</button>
    <button @click="() => exitLobby()">salir lobby</button>
  </div>
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
