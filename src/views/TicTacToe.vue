<script setup lang="ts">
    import { ref } from 'vue';
    import { io, Socket } from 'socket.io-client';

    // const socket: Socket = io('http://localhost:3001');

    // socket.on('connect', () => {
    //     console.log('Connected to server');
    // });

    const celdas = ref<(string | null)[]>(Array(9).fill(null));
    const turno = ref<string>('X');
    
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
            alert(`¡Jugador ${type} gana!`);
            celdas.value = Array(9).fill(null);
        }
        else if (!celdas.value.includes(null)) {
            alert('¡Empate!');
            celdas.value = Array(9).fill(null);
        }
        return;
    }

    function MarkPlace(index: number) {
        if (celdas.value[index] !== null) return;
        
        celdas.value[index] = turno.value;
        turno.value = turno.value === 'X' ? 'O' : 'X';
        
        checkWin(index);
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
        /* Línea \ */
        linear-gradient(
            45deg,
            transparent 43%,
            rgba(255, 255, 255, 0.4) 43%,
            rgba(255, 255, 255, 0.4) 57%,
            transparent 57%
        ),
        /* Línea / */
        linear-gradient(
            -45deg,
            transparent 43%,
            rgba(255, 255, 255, 0.4) 43%,
            rgba(255, 255, 255, 0.4) 57%,
            transparent 57%
        );
    background-size: 60% 60%;       /* Tamaño de la X */
    background-repeat: no-repeat;
    background-position: center;
        cursor:not-allowed;
    }
    .celda.player-o {
        background-color: var(--color-blue);
        background-image:
            radial-gradient(
                circle,
                transparent 25%,
                rgba(255, 255, 255, 0.4) 25%,
                rgba(255, 255, 255, 0.4) 35%,
                transparent 35%
        );
        background-size: 100% 100%;
        background-repeat: no-repeat;
        background-position: center;
        cursor: not-allowed;
    }
</style>  