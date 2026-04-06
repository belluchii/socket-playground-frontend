import { reactive } from 'vue'

// Represents a chess piece with its type, team, and movement state.
// Used by: ChessSquare component for rendering, movePiece for move validation.
// Connects to: pieceSymbols for display, board array for game state.
export interface Piece {
  type: 'rook' | 'knight' | 'bishop' | 'queen' | 'king' | 'pawn'
  team: 'black' | 'white'
  hasMoved: boolean
}

// Represents a single square on the chess board.
// Can contain a Piece or be empty (null).
// Used by: board array to store game state, setBoard for state updates.
export type Square = Piece | null

// Snapshot of the board state at a specific moment.
// Used by: movePiece to validate moves without changing board, getValidMoves for simulation.
// Connects to: movePiece (undo invalid moves), isInCheck (check validation).
export type BoardSnapshot = (Square | null)[][]

// Unicode symbols for each piece type and team.
// Used by: ChessPiece component to display pieces on the board.
// Connects to: ChessPiece template to render piece characters.
export const pieceSymbols: Record<Piece['type'], Record<Piece['team'], string>> = {
  king: { white: '♔', black: '♚' },
  queen: { white: '♕', black: '♛' },
  rook: { white: '♖', black: '♜' },
  bishop: { white: '♗', black: '♝' },
  knight: { white: '♘', black: '♞' },
  pawn: { white: '♙', black: '♟' },
}

// Standard chess board dimensions.
// Used by: setBoard, getValidMoves, and all piece movement functions to iterate the board.
export const boardLength: number = 8

// Reactive 8x8 board representing the current game state.
// Used by: ChessSquare, ChessPiece components for rendering, movePiece for updates.
// Connects to: setBoard (initialize), movePiece (update), setSquare (modify individual squares).
export const board = reactive<Square[][]>(
  Array.from({ length: boardLength }, () => Array.from({ length: boardLength }, () => null)),
)

// Stores the target square for en passant capture.
// Used by: getPawnMoves to include en passant moves, movePiece to handle en passant logic.
// Connects to: getPawnMoves (en passant detection), movePiece (en passant capture).
export let enPassantTarget: [number, number] | null = null

// Initializes or updates the board with given state or standard starting position.
// Used by: Chess.vue on mount and on GameState event from server.
// Connects to: createPiece (create pieces), setSquare (place pieces on board).
export function setBoard(state?: (Square | null)[][] | null) {
  for (let row = 0; row < boardLength; row++) {
    for (let col = 0; col < boardLength; col++) {
      const rowArr = board[row]
      if (rowArr) rowArr[col] = null
    }
  }
  if (state) {
    for (let row = 0; row < boardLength; row++) {
      for (let col = 0; col < boardLength; col++) {
        const stateRow = state[row]
        const piece = stateRow?.[col]
        if (piece) {
          const boardRow = board[row]
          if (boardRow) {
            boardRow[col] = { type: piece.type, team: piece.team, hasMoved: piece.hasMoved }
          }
        }
      }
    }
  } else {
    const backRank: Piece['type'][] = [
      'rook',
      'knight',
      'bishop',
      'queen',
      'king',
      'bishop',
      'knight',
      'rook',
    ]
    for (let col = 0; col < boardLength; col++) {
      setSquare(0, col, createPiece(backRank[col]!, 'black'))
      setSquare(1, col, createPiece('pawn', 'black'))
      setSquare(6, col, createPiece('pawn', 'white'))
      setSquare(7, col, createPiece(backRank[col]!, 'white'))
    }
  }
}

// Creates a new piece with default hasMoved=false.
// Used by: setBoard to initialize pieces, handlePromotion to create promoted piece.
// Connects to: setSquare to place the piece on the board.
export function createPiece(type: Piece['type'], team: Piece['team']): Piece {
  return { type, team, hasMoved: false }
}

// Sets a piece at the specified board position.
// Used by: setBoard, movePiece, handlePromotion to update board state.
// Connects to: board array (reactive state).
export function setSquare(row: number, col: number, piece: Piece | null) {
  if (!board[row]) return
  board[row][col] = piece
  return board[row][col]
}

// Executes a move if valid, handles special moves like castling and en passant.
// Used by: Chess.vue endMove function when player releases a piece.
// Connects to: getValidMoves (validate), isInCheck (undo if self-check), enPassantTarget (en passant).
export function movePiece(fromRow: number, fromCol: number, toRow: number, toCol: number) {
  const piece = board[fromRow]?.[fromCol]
  if (!piece) return

  const validMoves = getValidMoves(fromRow, fromCol, piece)
  if (!validMoves.some((move) => move[0] === toRow && move[1] === toCol)) return

  const boardSnapshot: BoardSnapshot = board.map((row) => row.map((p) => (p ? { ...p } : null)))

  if (piece.type === 'pawn' && toCol !== fromCol && board[toRow]?.[toCol] === null) {
    setSquare(fromRow, toCol, null)
  }

  setSquare(fromRow, fromCol, null)

  if (piece.type === 'king' && Math.abs(toCol - fromCol) === 2) {
    if (toCol === 6) {
      setSquare(fromRow, 5, { ...boardSnapshot[fromRow]![7]!, hasMoved: true })
      setSquare(fromRow, 7, null)
    } else if (toCol === 2) {
      setSquare(fromRow, 3, { ...boardSnapshot[fromRow]![0]!, hasMoved: true })
      setSquare(fromRow, 0, null)
    }
  }

  const move = setSquare(toRow, toCol, { ...piece, hasMoved: true })

  if (isInCheck(piece.team, null, null)) {
    board.splice(0, board.length)
    board.push(...boardSnapshot)
    enPassantTarget = null
    return
  }

  if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
    enPassantTarget = [toRow, toCol]
  } else {
    enPassantTarget = null
  }

  return move
}

// Gets all valid moves for a piece, filtering moves that leave king in check.
// Used by: movePiece to validate moves, Chess.vue startMove to highlight possible moves.
// Connects to: getPawnMoves, getRookMoves, getKnightMoves, getBishopMoves, getQueenMoves, getKingMoves.
export function getValidMoves(
  row: number,
  col: number,
  piece: Piece,
  b: BoardSnapshot = board,
  checkCastling = true,
): [number, number][] {
  let moves: [number, number][]
  switch (piece.type) {
    case 'pawn':
      moves = getPawnMoves(row, col, piece.team, piece.hasMoved, b)
      break
    case 'rook':
      moves = getRookMoves(row, col, piece.team, b)
      break
    case 'knight':
      moves = getKnightMoves(row, col, piece.team, b)
      break
    case 'bishop':
      moves = getBishopMoves(row, col, piece.team, b)
      break
    case 'queen':
      moves = [...getRookMoves(row, col, piece.team, b), ...getBishopMoves(row, col, piece.team, b)]
      break
    case 'king':
      moves = getKingMoves(row, col, piece.team, b, checkCastling)
      break
  }

  if (b === board) {
    moves = moves.filter(([mr, mc]) => {
      const snap: BoardSnapshot = board.map((row) => row.map((p) => (p ? { ...p } : null)))
      snap[mr]![mc] = { ...piece, hasMoved: true }
      snap[row]![col] = null
      return !isInCheck(piece.team, null, snap)
    })
  }

  return moves
}

// Gets the position of the king for the given team.
// Used by: isInCheckMate to find king position, isInCheck to verify check state.
// Connects to: getKingOnBoard (board-specific lookup).
export function getKing(team: 'white' | 'black'): [number, number] | null {
  return getKingOnBoard(team, board)
}

// Gets the position of the king on a specific board snapshot.
// Used by: isInCheck to find attacked king, getKing for default board.
// Connects to: isInCheck (king detection), isInCheckMate (mate verification).
export function getKingOnBoard(team: 'white' | 'black', b: BoardSnapshot): [number, number] | null {
  for (let r = 0; r < boardLength; r++)
    for (let c = 0; c < boardLength; c++)
      if (b[r]?.[c]?.type === 'king' && b[r]?.[c]?.team === team) return [r, c]
  return null
}

// Checks if the king of the given team is in check.
// Used by: movePiece to undo self-check moves, isInCheckMate for verification.
// Connects to: getKingOnBoard (find king), getValidMoves (enemy piece attacks).
export function isInCheck(
  team: 'white' | 'black',
  pos: [number, number] | null,
  snapshot: BoardSnapshot | null,
): boolean {
  const b = snapshot ?? board
  const kingPos = pos ?? getKingOnBoard(team, b)
  if (!kingPos) return false

  const enemyTeam = team === 'white' ? 'black' : 'white'
  return b.some((row, r) =>
    row.some((piece, c) => {
      if (piece?.team !== enemyTeam) return false
      return getValidMoves(r, c, piece, b, false).some(
        ([mr, mc]) => mr === kingPos[0] && mc === kingPos[1],
      )
    }),
  )
}

// Checks if the given team has no valid moves and is in check (checkmate).
// Used by: Chess.vue checkAfterMove to detect win condition.
// Connects to: getKing (find king), isInCheck (verify check state), getValidMoves (all possible moves).
export function isInCheckMate(team: 'white' | 'black'): boolean {
  const kingPos = getKing(team)
  if (!kingPos) return false
  if (!isInCheck(team, kingPos, null)) return false

  for (let r = 0; r < boardLength; r++) {
    for (let c = 0; c < boardLength; c++) {
      const piece = board[r]?.[c]
      if (!piece || piece.team !== team) continue

      for (const [mr, mc] of getValidMoves(r, c, piece)) {
        const snap: BoardSnapshot = board.map((row) => row.map((p) => (p ? { ...p } : null)))
        snap[mr]![mc] = { ...piece, hasMoved: true }
        snap[r]![c] = null
        if (!isInCheck(team, null, snap)) return false
      }
    }
  }

  return true
}

// Checks if the given team has no valid moves but is not in check (stalemate).
// Used by: Chess.vue checkAfterMove to detect draw condition.
// Connects to: isInCheck (exclude check), getValidMoves (no moves available).
export function isStalemate(team: 'white' | 'black'): boolean {
  if (isInCheck(team, null, null)) return false

  for (let r = 0; r < boardLength; r++) {
    for (let c = 0; c < boardLength; c++) {
      const piece = board[r]?.[c]
      if (!piece || piece.team !== team) continue
      if (getValidMoves(r, c, piece).length > 0) return false
    }
  }

  return true
}

// Checks if the board has insufficient material for checkmate.
// Used by: Chess.vue checkAfterMove to detect draw condition.
// Connects to: board array (piece count analysis).
export function isInsufficientMaterial(): boolean {
  const pieces: Piece[] = []
  board.forEach((row) =>
    row.forEach((p) => {
      if (p) pieces.push(p)
    }),
  )

  if (pieces.length === 2) return true

  if (pieces.length === 3) {
    const minor = pieces.find((p) => p.type === 'bishop' || p.type === 'knight')
    if (minor) return true
  }

  if (pieces.length === 4) {
    const bishops = pieces.filter((p) => p.type === 'bishop')
    if (bishops.length === 2 && bishops[0]!.team !== bishops[1]!.team) {
      const bishopSquares: number[] = []
      board.forEach((row, r) =>
        row.forEach((p, c) => {
          if (p?.type === 'bishop') bishopSquares.push((r + c) % 2)
        }),
      )
      if (bishopSquares[0] === bishopSquares[1]) return true
    }
  }

  return false
}

// Gets all possible pawn moves including forward, diagonal captures, and en passant.
// Used by: getValidMoves to calculate piece-specific movements.
// Connects to: enPassantTarget (en passant detection), getValidMoves (final validation).
export function getPawnMoves(
  row: number,
  col: number,
  team: Piece['team'],
  hasMoved: boolean,
  b: BoardSnapshot = board,
) {
  const dir = team === 'black' ? 1 : -1
  const moves: [number, number][] = []
  const frontRow = row + dir
  const frontPiece = b[frontRow]?.[col]

  if (frontPiece === null) {
    moves.push([frontRow, col])
    if (b[row + 2 * dir]?.[col] === null && !hasMoved) moves.push([row + 2 * dir, col])
  }

  ;[-1, 1].forEach((offset) => {
    const diagonalPiece = b[frontRow]?.[col + offset]
    if (diagonalPiece?.team && diagonalPiece.team !== team) moves.push([frontRow, col + offset])

    if (enPassantTarget && enPassantTarget[0] === row && enPassantTarget[1] === col + offset) {
      moves.push([frontRow, col + offset])
    }
  })

  return moves
}

// Gets all possible rook moves in horizontal and vertical directions.
// Used by: getValidMoves to calculate piece-specific movements, queen combines with bishop.
// Connects to: getValidMoves (final validation), isInCheck (attack detection).
export function getRookMoves(
  row: number,
  col: number,
  team: Piece['team'],
  b: BoardSnapshot = board,
) {
  const moves: [number, number][] = []
  for (const { rowDelta, colDelta } of [
    { rowDelta: -1, colDelta: 0 },
    { rowDelta: 1, colDelta: 0 },
    { rowDelta: 0, colDelta: -1 },
    { rowDelta: 0, colDelta: 1 },
  ]) {
    let r = row + rowDelta,
      c = col + colDelta
    while (r >= 0 && r < boardLength && c >= 0 && c < boardLength) {
      const sq = b[r]?.[c]
      if (sq === null || sq?.team !== team) moves.push([r, c])
      if (sq !== null) break
      r += rowDelta
      c += colDelta
    }
  }
  return moves
}

// Gets all possible bishop moves in diagonal directions.
// Used by: getValidMoves to calculate piece-specific movements, queen combines with rook.
// Connects to: getValidMoves (final validation), isInCheck (attack detection).
export function getBishopMoves(
  row: number,
  col: number,
  team: Piece['team'],
  b: BoardSnapshot = board,
) {
  const moves: [number, number][] = []
  for (const { rowDelta, colDelta } of [
    { rowDelta: -1, colDelta: -1 },
    { rowDelta: -1, colDelta: 1 },
    { rowDelta: 1, colDelta: -1 },
    { rowDelta: 1, colDelta: 1 },
  ]) {
    let r = row + rowDelta,
      c = col + colDelta
    while (r >= 0 && r < boardLength && c >= 0 && c < boardLength) {
      const sq = b[r]?.[c]
      if (sq === null || sq?.team !== team) moves.push([r, c])
      if (sq !== null) break
      r += rowDelta
      c += colDelta
    }
  }
  return moves
}

// Gets all possible knight moves in L-shape pattern.
// Used by: getValidMoves to calculate piece-specific movements.
// Connects to: getValidMoves (final validation), isInCheck (attack detection).
export function getKnightMoves(
  row: number,
  col: number,
  team: Piece['team'],
  b: BoardSnapshot = board,
) {
  const moves: [number, number][] = []
  for (const { rowDelta, colDelta } of [
    { rowDelta: 2, colDelta: 1 },
    { rowDelta: 2, colDelta: -1 },
    { rowDelta: -2, colDelta: 1 },
    { rowDelta: -2, colDelta: -1 },
    { rowDelta: 1, colDelta: 2 },
    { rowDelta: 1, colDelta: -2 },
    { rowDelta: -1, colDelta: 2 },
    { rowDelta: -1, colDelta: -2 },
  ]) {
    const nr = row + rowDelta,
      nc = col + colDelta
    if (nr >= 0 && nr < boardLength && nc >= 0 && nc < boardLength) {
      const sq = b[nr]?.[nc]
      if (sq === null || sq?.team !== team) moves.push([nr, nc])
    }
  }
  return moves
}

// Gets all possible king moves including castling (when enabled).
// Used by: getValidMoves to calculate piece-specific movements.
// Connects to: isInCheck (castling validation), getValidMoves (final validation).
export function getKingMoves(
  row: number,
  col: number,
  team: Piece['team'],
  b: BoardSnapshot = board,
  checkCastling = true,
) {
  const moves: [number, number][] = []
  for (const { rowDelta, colDelta } of [
    { rowDelta: -1, colDelta: 0 },
    { rowDelta: 1, colDelta: 0 },
    { rowDelta: 0, colDelta: -1 },
    { rowDelta: 0, colDelta: 1 },
    { rowDelta: -1, colDelta: -1 },
    { rowDelta: -1, colDelta: 1 },
    { rowDelta: 1, colDelta: -1 },
    { rowDelta: 1, colDelta: 1 },
  ]) {
    const nr = row + rowDelta,
      nc = col + colDelta
    if (nr >= 0 && nr < boardLength && nc >= 0 && nc < boardLength) {
      const sq = b[nr]?.[nc]
      if (sq === null || sq?.team !== team) moves.push([nr, nc])
    }
  }

  if (!checkCastling) return moves

  const king = b[row]?.[col]
  if (!king?.hasMoved && !isInCheck(team, [row, col], b)) {
    const rookKingSide = b[row]?.[7]
    if (
      rookKingSide?.type === 'rook' &&
      !rookKingSide.hasMoved &&
      b[row]?.[5] === null &&
      b[row]?.[6] === null &&
      !isInCheck(team, [row, 5], b) &&
      !isInCheck(team, [row, 6], b)
    ) {
      moves.push([row, 6])
    }

    const rookQueenSide = b[row]?.[0]
    if (
      rookQueenSide?.type === 'rook' &&
      !rookQueenSide.hasMoved &&
      b[row]?.[1] === null &&
      b[row]?.[2] === null &&
      b[row]?.[3] === null &&
      !isInCheck(team, [row, 3], b) &&
      !isInCheck(team, [row, 2], b)
    ) {
      moves.push([row, 2])
    }
  }

  return moves
}
