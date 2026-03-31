<script setup lang="ts">
import { io } from 'socket.io-client'
import Footer from './components/Footer.vue'

const socket = io('http://localhost:3001', {
  transports: ['websocket'],
  reconnection: true,
})

socket.on('connect', () => console.log(`Hola de nuevo id: ${socket.id}`))
socket.on('client-clicked', (text) => console.log(text))

function onClick(number: string) {
  socket.emit('pressed', 'boton clickeado' + number)
}
</script>

<template>
  <div class="cont">
    <button @click="onClick('1')">unirse a un room</button>
    <button @click="onClick('2')">unirse a un room</button>
  </div>
  <Footer />
</template>

<style scoped>
.cont {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80%;
  height: 80%;
  border: 1px solid #000;
  background: #333;
}
</style>
