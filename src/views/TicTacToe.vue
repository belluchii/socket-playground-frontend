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
        createOverlay();
        // socket.emit("GrantTurn", sId);
        socket.emit("WaitForPlayer");
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

    socket.on("YourTurn", () => {
        removeOverlay();
    });

    socket.on("WaitMessage", (message: string) => {
        const messageElement = document.createElement('p');
        messageElement.textContent = message;
        messageElement.style.position = 'fixed';
        messageElement.style.zIndex = '1001';
        messageElement.style.color = 'var(--color-white)';
        messageElement.style.fontFamily = '--font-mono';
        messageElement.style.fontSize = '1.25rem';
        messageElement.id = 'waitMessage';
        document.getElementById('Main')?.appendChild(messageElement);
    });

    socket.on("StartGame", () => {
        document.getElementById('waitMessage')?.remove();
    });

    function createOverlay(){
        const overlay = document.createElement('div');
        
        // Estilos del overlay
        overlay.style.position = 'fixed';
        overlay.style.top = '23.3%';
        overlay.style.left = '34.2%';
        overlay.style.width = '400px';
        overlay.style.height = '400px';
        overlay.style.backgroundColor = 'var(--color-black)';
        overlay.style.zIndex = '1000';
        overlay.style.opacity='0.40';
        overlay.id = 'overlay';

        // Evitar clics en elementos debajo
        overlay.addEventListener('click', (e: MouseEvent) => {
            e.stopPropagation();
        });
        
        const element = document.getElementById('Main');

        element?.appendChild(overlay);
        return;
    }

    function removeOverlay() {
        const child = document.getElementById('overlay');
        if (child) {
            child.remove();
        }
        return;
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
        let type = celdas.value[index];
        let b: number = 0; // b = existe alguna combinacion de 3 en raya
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
        socket.emit("GrantTurn", sId);
        createOverlay();
        return;
    }

</script>

<template>
    <div id="Main">
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
</style>  