import { io, Socket } from 'socket.io-client'
import type { Piece } from '@/utils/chess'

// Socket instance for chess communication.
// Used by: Chess.vue to send and receive game events.
// Connects to: server Chess.ts events for multiplayer synchronization.
let socket: Socket | null = null

// Main composable for chess socket functionality.
// Used by: Chess.vue to manage socket connection and game events.
// Connects to: chess.ts (Piece type), server Chess.ts (events).
export function useChessSocket() {
  // Initializes and connects to the socket.io server.
  // Used by: Chess.vue onMounted to establish connection.
  // Connects to: io() to create socket connection to localhost:3000.
  function connect() {
    socket = io('http://localhost:3000')
    return socket
  }

  // Joins a chess room with specified team.
  // Used by: Chess.vue to connect to a game room on mount.
  // Connects to: server JoinRoom event (receives GameState).
  function joinRoom(roomId: string, team: 'white' | 'black' = 'white') {
    socket?.emit('JoinRoom', roomId, team)
  }

  // Emits a piece movement to the server.
  // Used by: Chess.vue endMove when player completes a move.
  // Connects to: server MovePiece event (validates and broadcasts).
  function emitMove(
    roomId: string,
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
  ) {
    socket?.emit('MovePiece', roomId, fromRow, fromCol, toRow, toCol)
  }

  // Emits pawn promotion to selected piece type.
  // Used by: Chess.vue handlePromotion when user selects promotion piece.
  // Connects to: server Promote event (updates board for all players).
  function emitPromotion(roomId: string, row: number, col: number, type: Piece['type']) {
    socket?.emit('Promote', roomId, row, col, type)
  }

  // Emits game over with result message.
  // Used by: Chess.vue checkAfterMove when checkmate or draw occurs.
  // Connects to: server GameOver event (notifies players, resets board).
  function emitGameOver(roomId: string, result: string) {
    socket?.emit('GameOver', roomId, result)
  }

  // Requests current game state from server.
  // Used by: Chess.vue onMounted (after delay) and on page refresh (F5).
  // Connects to: server GetGameState event (sends board + turn + team).
  function requestGameState(roomId: string) {
    socket?.emit('GetGameState', roomId)
  }

  // Receives game state including board, turn, and player's team.
  // Used by: Chess.vue onGameState callback to initialize/sync board.
  // Connects to: server GameState event (JoinRoom response, GetGameState response).
  function onGameState(
    cb: (data: { board: (Piece | null)[][]; currentTurn: string; myTeam: string }) => void,
  ) {
    socket?.on('GameState', cb)
  }

  // Receives turn change notification.
  // Used by: Chess.vue onTurnChanged to update currentTeam variable.
  // Connects to: server TurnChanged event (after valid MovePiece).
  function onTurnChanged(cb: (turn: string) => void) {
    socket?.on('TurnChanged', cb)
  }

  // Receives piece movement from other player.
  // Used by: Chess.vue onPieceMoved to apply opponent's move.
  // Connects to: server PieceMoved event (broadcast after MovePiece).
  function onPieceMoved(
    cb: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void,
  ) {
    socket?.on('PieceMoved', cb)
  }

  // Receives pawn promotion notification.
  // Used by: Chess.vue onPiecePromoted to update promoted piece.
  // Connects to: server PiecePromoted event (broadcast after Promote).
  function onPiecePromoted(cb: (row: number, col: number, type: Piece['type']) => void) {
    socket?.on('PiecePromoted', cb)
  }

  // Receives game over notification.
  // Used by: Chess.vue onGameOver to display result.
  // Connects to: server GameOver event (checkmate, draw, or surrender).
  function onGameOver(cb: (result: string) => void) {
    socket?.on('GameOver', cb)
  }

  // Receives notification when opponent disconnects.
  // Used by: Chess.vue onPlayerDisconnected to show waiting state.
  // Connects to: server PlayerDisconnected event (when 1 player remains).
  function onPlayerDisconnected(cb: (team: string) => void) {
    socket?.on('PlayerDisconnected', cb)
  }

  // Receives notification when room is full (2 players already).
  // Used by: Chess.vue to handle error state.
  // Connects to: server RoomFull event (when 3rd player tries to join).
  function onRoomFull(cb: () => void) {
    socket?.on('RoomFull', cb)
  }

  // Gets the current socket ID.
  // Used by: Chess.vue (getId in return) for potential future use.
  // Connects to: socket.id property.
  function getId() {
    return socket?.id
  }

  // Disconnects from the socket server.
  // Used by: Chess.vue onBeforeUnmount to cleanup connection.
  // Connects to: socket.disconnect() to close connection.
  function disconnect() {
    socket?.disconnect()
  }

  return {
    connect,
    joinRoom,
    emitMove,
    emitPromotion,
    emitGameOver,
    requestGameState,
    onGameState,
    onTurnChanged,
    onPieceMoved,
    onPiecePromoted,
    onGameOver,
    onPlayerDisconnected,
    onRoomFull,
    getId,
    disconnect,
  }
}
