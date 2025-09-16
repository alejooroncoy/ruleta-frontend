<template>
  <div class="roulette-game">
    <!-- Mostrar configuración del jugador si no hay jugador activo -->
    <PlayerSetup v-if="!hasActivePlayer" />
    
    <!-- Mostrar interfaz del juego si hay jugador activo -->
    <GameInterface v-else />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouletteStore } from '../infrastructure/stores/roulette.store';
import PlayerSetup from '../components/PlayerSetup.vue';
import GameInterface from '../components/GameInterface.vue';

const store = useRouletteStore();

// Computed para determinar si hay un jugador activo
const hasActivePlayer = computed(() => !!store.currentPlayer);
</script>

<style scoped>
.roulette-game {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-background-gradient);
}
</style>
