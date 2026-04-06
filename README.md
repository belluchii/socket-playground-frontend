# WebSocket Playground - Frontend

Vue 3 client for real-time multiplayer games.

## Overview

Frontend application built with **Vue 3**, **Vite**, and **Socket.io Client** for real-time multiplayer gaming.

## Quick Start

```bash
# Install dependencies
bun install

# Run development server
bun run dev
```

Frontend runs on `http://localhost:5173` (default Vite port).

## Project Structure

```
ws-playground-front/
├── src/
│   ├── views/
│   │   ├── Chess.vue          # Chess game view
│   │   ├── TicTacToe.vue      # TicTacToe game view
│   │   ├── Home.vue           # Home page
│   │   ├── Lobbys.vue         # Lobby browser
│   │   └── ...
│   ├── components/
│   │   ├── ChessSquare.vue    # Chess board square
│   │   ├── ChessPiece.vue    # Chess piece
│   │   ├── PromotionModal.vue # Pawn promotion UI
│   │   └── ...
│   ├── composables/
│   │   ├── useChessSocket.ts  # Chess socket logic
│   │   └── ...
│   ├── utils/
│   │   ├── chess.ts          # Chess game logic
│   │   └── socket.ts         # General socket utils
│   ├── common/               # Reusable UI components
│   ├── router/               # Vue Router config
│   ├── App.vue               # Root component
│   └── main.ts               # Entry point
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Available Scripts

| Script               | Description               |
| -------------------- | ------------------------- |
| `bun run dev`        | Start dev server with HMR |
| `bun run build`      | Build for production      |
| `bun run preview`    | Preview production build  |
| `bun run type-check` | TypeScript checking       |
| `bun run lint`       | Run all linters           |
| `bun run test:unit`  | Run unit tests            |

## Games

### Chess

Multiplayer chess game with the following features:

- Drag-and-drop piece movement
- Valid move highlighting
- Turn-based gameplay
- Pawn promotion
- Check/checkmate detection
- Stalemate detection
- Server-side state synchronization

**Chess Components:**

- `Chess.vue` - Main game view
- `ChessSquare.vue` - Board square
- `ChessPiece.vue` - Piece display
- `PromotionModal.vue` - Promotion selection

**Chess Utilities:**

- `chess.ts` - Board state, piece movement, validation
- `useChessSocket.ts` - Socket communication

### TicTacToe

Simple multiplayer TicTacToe.

## Adding a New Game

1. **Create the view:**

```vue
<!-- src/views/YourGame.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useYourGameSocket } from '@/composables/useYourGameSocket'

const { connect, joinRoom, onGameState } = useYourGameSocket()

onMounted(() => {
  connect()
  joinRoom('roomId')

  onGameState((data) => {
    // Handle game state
  })
})
</script>

<template>
  <!-- Your game UI -->
</template>
```

2. **Create socket composable:**

```typescript
// src/composables/useYourGameSocket.ts
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function useYourGameSocket() {
  function connect() {
    socket = io('http://localhost:3000')
    return socket
  }

  // Add emit and on functions

  return {
    connect,
    // ...
  }
}
```

3. **Add route:**

```typescript
// src/router/index.ts
import YourGame from '@/views/YourGame.vue'

const routes = [
  // ... existing routes
  {
    path: '/yourgame',
    name: 'YourGame',
    component: YourGame,
  },
]
```

## Design System

The project includes common UI components in `src/common/`:

| Component     | Description     |
| ------------- | --------------- |
| `Button.vue`  | Styled button   |
| `Input.vue`   | Text input      |
| `Card.vue`    | Card container  |
| `Badge.vue`   | Status badge    |
| `Alert.vue`   | Alert message   |
| `Table.vue`   | Data table      |
| `Divider.vue` | Section divider |

## Socket Connection

The default server URL is `http://localhost:3000`.

To change it, update the `io()` call in each composable:

```typescript
socket = io('http://your-server:port')
```

## Dependencies

- `vue` - Frontend framework
- `vue-router` - Routing
- `socket.io-client` - WebSocket client
- `vite` - Build tool
- `typescript` - TypeScript support

## Recommended Setup

- **VS Code** with **Vue.volar** extension
- **Chromium browser** with Vue DevTools
