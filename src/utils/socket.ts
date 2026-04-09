import { io } from 'socket.io-client'

const socket = io('https://cf44-186-65-102-3.ngrok-free.app', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10,
  transports: ['websocket', 'polling'],
  credentials: true,
})

export default socket
