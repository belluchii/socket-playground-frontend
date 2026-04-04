import { io, Socket } from 'socket.io-client'
import type { Piece } from '@/utils/chess'

let socket: Socket | null = null

export function useChessSocket() {
  function connect() {
    socket = io('http://localhost:3000')
    return socket
  }

  function joinRoom() {
    socket?.emit('JoinRoom')
  }

  function requestTeam(sId: string) {
    socket?.emit('RequestTeam', sId)
  }

  function sendTeam(team: string, sId: string) {
    socket?.emit('SendTeam', team, sId)
  }

  function emitMove(fromRow: number, fromCol: number, toRow: number, toCol: number) {
    socket?.emit('MovePiece', fromRow, fromCol, toRow, toCol)
  }

  function emitPromotion(row: number, col: number, type: Piece['type']) {
    socket?.emit('Promote', row, col, type)
  }

  function emitGameOver(result: string, sId: string) {
    socket?.emit('GameOver', result, sId)
  }

  function onGameStart(cb: () => void) {
    socket?.on('GameStart', cb)
  }

  function onPieceMoved(
    cb: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void,
  ) {
    socket?.on('PieceMoved', cb)
  }

  function onPiecePromoted(cb: (row: number, col: number, type: Piece['type']) => void) {
    socket?.on('PiecePromoted', cb)
  }

  function onReceivedTeam(cb: (team: string) => void) {
    socket?.on('ReceivedTeam', cb)
  }

  function onAskTeam(cb: () => void) {
    socket?.on('AskTeam', cb)
  }

  function onGameOver(cb: (result: string) => void) {
    socket?.on('GameOver', cb)
  }

  function onPlayerLeft(cb: () => void) {
    socket?.on('PlayerLeft', cb)
  }

  function getId() {
    return socket?.id
  }

  function disconnect() {
    socket?.disconnect()
  }

  return {
    connect,
    joinRoom,
    requestTeam,
    sendTeam,
    emitMove,
    emitPromotion,
    emitGameOver,
    getId,
    disconnect,
    onGameStart,
    onPieceMoved,
    onPiecePromoted,
    onReceivedTeam,
    onAskTeam,
    onGameOver,
    onPlayerLeft,
  }
}
