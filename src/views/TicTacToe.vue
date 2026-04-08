<script setup lang="ts">
    import { ref } from 'vue';
    import { io, Socket } from 'socket.io-client';

    let typeP: string = '';
    const board = ref<(string | null)[]>(Array(9).fill(null));
    let sId:string = '';

    const overlay = ref(false);
    const waitMessage =ref(false);

    const socket = io('http://localhost:3001', {
    transports: ['websocket'],
    reconnection: true,
    })

    socket.on('connect', () => {
        console.log('Connected to server');
        sId = socket.id!;
        socket.emit("JoinRoom");
        socket.emit("RequestType", sId);
        overlay.value = true;
        // socket.emit("GrantTurn", sId);
        socket.emit("WaitForPlayer");
        socket.emit("askBoard")
    });

    socket.on("giveBoard", () => {
      socket.emit("sendBoard", board.value);
    })

    socket.on("receiveBoard", (pkg: (string | null)[]) => {
      board.value = pkg;
    });

    socket.on("AskType", () => {
        socket.emit("SendType", typeP, sId);
    });

    socket.on("ReceivedType", (type: string) => {
        GiveType(type || '');
    });

    socket.on("PlaceMarked", (index:number, typeP:string) => {
        board.value[index] = typeP;
        checkWin(index);
    });

    socket.on("GameOver", (type:string) => {
        if (type === "Draw") {
            alert("It's a draw!");
        } else {
            alert(`Player ${type} wins!`);
        }
    });

    socket.on("YourTurn", () => {
        removeOverlay();
    });

    socket.on("WaitMessage", () => {
        waitMessage.value = true;
    });

    socket.on("StartGame", () => {
        waitMessage.value = false;
    });

    function removeOverlay() {
        overlay.value = false;
    }


    function GiveType(type: string) {
        if (type === '') {
            typeP=Math.floor(Math.random() * (2)) === 0 ? 'X' : 'O';
        }
        else if (type === 'X') {
            typeP = 'O';
        }
        else if (type === 'O') {
            typeP = 'X';
        }
        return;
    }

    
    function checkWin(index: number) {
        let type = board.value[index];
        let b: number = 0; // b = existe alguna combinacion de 3 en raya
        for (let i = 0; i < 3; i++) {
            if (board.value[i] === type && board.value[i+3] === type && board.value[i+6] === type) {
                b = 1;
                break;
            }
            if (board.value[i*3] === type && board.value[i*3+1] === type && board.value[i*3+2] === type) {
                b = 1;
                break;
            }
        }
        if (b === 0) {
            if ((board.value[0] === type && board.value[4] === type && board.value[8] === type) || (board.value[2] === type && board.value[4] === type && board.value[6] === type)) {
                b = 1;
            }
        }
        if (b===1){
            socket.emit("GameOver", type, sId);
            board.value = Array(9).fill(null);
        }
        else if (!board.value.includes(null)) {
            socket.emit("GameOver", "Draw", sId);
            board.value = Array(9).fill(null);
        }
        return;
    }

    function MarkPlace(index: number) {
        if (board.value[index] !== null) return;
        socket.emit("MarkPlace", index, typeP);  
        socket.emit("GrantTurn", sId);
        overlay.value=true;
        return;
    }

</script>

<template>
    <div id="Main">
        <p :class="['overlay',overlay?'':'d-none']" ></p>
        <p :class="['waitMessage',waitMessage?'':'d-none']">Waiting for another player to join...</p>
        <div class="BG">
            <div class="tablero">
                <div class="celda" v-for="(celda,index) in 9" :key="index":class="
                    {'player-x': board[index] === 'X',
                    'player-o': board[index] === 'O'}"
                    @click="MarkPlace(index)"></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    #Main {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        font-family: Arial, sans-serif;
        margin-top: 40px;
    }

    .BG {
        width: 400px;
        height: 400px;
        background-color: var(--color-black);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .tablero {
        height: 80%;
        width: 80%;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
        gap: 10px;
    }

    .celda {
        background-color: var(--color-black);
        border: 2px solid var(--color-grey);
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 3rem;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.3s, transform 0.2s;
    }

    .celda:hover {
        background-color: var(--color-grey);
        transform: scale(1.05);
    }
    .celda.player-x {
        background-color: var(--color-red);
        background-origin:content-box;
        background-image:
        linear-gradient(45deg, transparent 90%, var(--color-red) 90%),
        linear-gradient(135deg, transparent 90%, var(--color-red) 90%),
        linear-gradient(-45deg, transparent 90%, var(--color-red) 90%),
        linear-gradient(-135deg, transparent 90%, var(--color-red) 90%),
        linear-gradient(
            45deg,
            transparent 43%,
            var(--color-white) 43%,
            var(--color-white) 57%,
            transparent 57%
        )
        ,
        linear-gradient(
            -45deg,
            transparent 43%,
            var(--color-white) 43%,
            var(--color-white) 57%,
            transparent 57%
        )
        ;
        background-size: 60% 60%;
        background-repeat: no-repeat;
        background-position: center;
        cursor:not-allowed;
        
        }
    .celda.player-o {
        background-color: var(--color-blue);
        background-image:
            radial-gradient(circle at center, var(--color-blue) 0%, var(--color-blue) 25%, transparent 26%),
            radial-gradient(
                circle,
                var(--color-white) 32%,
                transparent 33%
            )
            ;
        background-size: 150% 100%;
        background-position: center;
        cursor: not-allowed;
    }

    .overlay{
        position:absolute;
        width: 400px;
        height: 400px;
        background-color: var(--color-black);
        z-index: 1000;
        opacity: 0.40;
    }
    .d-none{
        display:none;
    }

    .waitMessage{
      position :absolute;
      z-index : 1001;
      color :var(--color-white);
      font-family :--font-mono;
      font-size :1.25rem;
    }
</style>  