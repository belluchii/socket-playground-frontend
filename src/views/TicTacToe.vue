<script setup lang="ts">
    import { ref } from 'vue';
    import { io, Socket } from 'socket.io-client';

    let typeP: string = '';
    const celdas = ref<(string | null)[]>(Array(9).fill(null));
    let sId:string = '';


    const socket = io('http://localhost:3001', {
    transports: ['websocket'],
    reconnection: true,
    })

    socket.on('connect', () => {
        console.log('Connected to server');
        sId = socket.id!;
        socket.emit("JoinRoom");
        socket.emit("RequestType", sId);
    });

    socket.on("AskType", () => {
        socket.emit("SendType", typeP, sId);
    });

    socket.on("ReceivedType", (type: string) => {
        GiveType(type || '');
    });

    socket.on("PlaceMarked", (index:number, typeP:string) => {
        celdas.value[index] = typeP;
        checkWin(index);
    });

    socket.on("GameOver", (type:string) => {
        if (type === "Draw") {
            alert("It's a draw!");
        } else {
            alert(`Player ${type} wins!`);
        }
    });

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

    // const turno = ref<string>('X');
    
    function checkWin(index: number) {
        let type = celdas.value[index];
        let b: number = 0; // c = contador, b = existe alguna combinacion de 3 en raya
        for (let i = 0; i < 3; i++) {
            if (celdas.value[i] === type && celdas.value[i+3] === type && celdas.value[i+6] === type) {
                b = 1;
                break;
            }
            if (celdas.value[i*3] === type && celdas.value[i*3+1] === type && celdas.value[i*3+2] === type) {
                b = 1;
                break;
            }
        }
        if (b === 0) {
            if ((celdas.value[0] === type && celdas.value[4] === type && celdas.value[8] === type) || (celdas.value[2] === type && celdas.value[4] === type && celdas.value[6] === type)) {
                b = 1;
            }
        }
        if (b===1){
            socket.emit("GameOver", type, sId);
            celdas.value = Array(9).fill(null);
        }
        else if (!celdas.value.includes(null)) {
            socket.emit("GameOver", "Draw", sId);
            celdas.value = Array(9).fill(null);
        }
        return;
    }

    function MarkPlace(index: number) {
        if (celdas.value[index] !== null) return;
        socket.emit("MarkPlace", index, typeP);   
        // typeP = typeP === 'X' ? 'O' : 'X';
    }
</script>

<template>
    <div class="Main">
        <div class="BG">
            <div class="tablero">
                <div class="celda" v-for="(celda,index) in 9" :key="index":class="
                    {'player-x': celdas[index] === 'X',
                    'player-o': celdas[index] === 'O'}"
                    @click="MarkPlace(index)"></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .Main {
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
</style>  