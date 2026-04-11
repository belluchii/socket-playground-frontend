import socket from '../utils/socket'

// Types for socket events
import type { GameState, ReadyStatus, GameEndedInfo } from '../utils/snake'

// ===========================================
// Main Composable
// ===========================================

// Snake.io socket functionality for multiplayer connection and events.
// Used by: useSnakeGame composable to handle socket communication.
// Connects to: socket.ts (connection), server SnakeIo.ts (events).

export function useSnakeSocket() {
  // ===========================================
  // Connection Functions
  // ===========================================

  // Connect to socket and join a room.
  // Used by: useSnakeGame init function on component mount.
  // Connects to: server JoinRoom event.
  function connect(roomId: string) {
    socket?.emit('JoinRoom', roomId)
  }

  // Send player ready status to start game.
  // Used by: useSnakeGame toggleReady when player clicks ready button.
  // Connects to: server Ready event.
  function emitReady(roomId: string) {
    socket?.emit('Ready', roomId)
  }

  // Send player unready status.
  // Used by: useSnakeGame toggleReady when player clicks unready button.
  // Connects to: server Unready event.
  function emitUnready(roomId: string) {
    socket?.emit('Unready', roomId)
  }

  // Send player movement input.
  // Used by: useSnakeGame handleInput when player presses arrow keys.
  // Connects to: server Input event.
  function emitInput(roomId: string, direction: [number, number]) {
    socket?.emit('Input', roomId, direction)
  }

  // Request game reset after game ends.
  // Used by: useSnakeGame handleResetGame when player clicks reset button.
  // Connects to: server ResetGame event.
  function emitResetGame(roomId: string) {
    socket?.emit('ResetGame', roomId)
  }

  // Request current game state (for reconnection/refresh).
  // Used by: useSnakeGame init function after socket connects.
  // Connects to: server GetState event.
  function requestGameState(roomId: string) {
    socket?.emit('GetState', roomId)
  }

  // ===========================================
  // Event Listeners
  // ===========================================

  // Receive player ID after joining room.
  // Used by: useSnakeGame to store myPlayerId.
  // Connects to: server PlayerId event.
  function onPlayerId(cb: (id: string) => void) {
    socket?.on('PlayerId', cb)
  }

  // Receive waiting status when joining during active game.
  // Used by: useSnakeGame to show waiting overlay.
  // Connects to: server WaitingForGameEnd event.
  function onWaitingForGameEnd(cb: (data: { message: string; currentPlayers: number }) => void) {
    socket?.on('WaitingForGameEnd', cb)
  }

  // Receive full game state (snakes, fruits, status).
  // Used by: useSnakeGame to update game state and render.
  // Connects to: server GameState event (sent every game tick).
  function onGameState(cb: (state: GameState) => void) {
    socket?.on('GameState', cb)
  }

  // Receive ready status updates for all players.
  // Used by: useSnakeGame to update readyStatus and player list.
  // Connects to: server ReadyStatus event.
  function onReadyStatus(cb: (status: ReadyStatus) => void) {
    socket?.on('ReadyStatus', cb)
  }

  // Receive notification that game has started.
  // Used by: useSnakeGame to set gameStarted true.
  // Connects to: server GameStarted event.
  function onGameStarted(cb: () => void) {
    socket?.on('GameStarted', cb)
  }

  // Receive game over notification with winner info.
  // Used by: useSnakeGame to set gameEnded and handle auto-rejoin.
  // Connects to: server GameEnded event.
  function onGameEnded(cb: (info: GameEndedInfo) => void) {
    socket?.on('GameEnded', cb)
  }

  // ===========================================
  // Cleanup Functions
  // ===========================================

  // Remove all socket event listeners.
  // Used by: useSnakeGame cleanup on component unmount.
  function removeAllListeners() {
    socket?.off('connect')
    socket?.off('PlayerId')
    socket?.off('WaitingForGameEnd')
    socket?.off('GameState')
    socket?.off('ReadyStatus')
    socket?.off('GameStarted')
    socket?.off('GameEnded')
  }

  // ===========================================
  // Return API
  // ===========================================

  return {
    // Connection
    connect,
    emitReady,
    emitUnready,
    emitInput,
    emitResetGame,
    requestGameState,

    // Event listeners
    onPlayerId,
    onWaitingForGameEnd,
    onGameState,
    onReadyStatus,
    onGameStarted,
    onGameEnded,

    // Cleanup
    removeAllListeners,
  }
}
