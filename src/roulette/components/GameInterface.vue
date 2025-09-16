<template>
  <div class="game-interface">
    <!-- Header con información del jugador -->
    <GameHeader
      :player-name="playerName"
      :player-balance="playerBalance"
      :can-save-game="canSaveGame"
      :can-start-new-game="canStartNewGame"
      :is-loading="isLoading"
      @save-game="handleSaveGame"
      @new-game="handleNewGame"
      @switch-player="handleSwitchPlayer"
      @sync-balance="handleSyncBalance"
    />

    <!-- Área principal del juego -->
    <main class="game-interface__main">
      <!-- Panel de la ruleta (arriba) -->
      <section class="roulette-panel">
        <header class="roulette-panel__header">
          <h3 class="roulette-panel__title">Ruleta</h3>
        </header>
        
        <div class="roulette-panel__content">
          <RouletteWheel
            :is-spinning="isSpinning"
            :last-bet-result="lastBetResult"
            @spin="handleSpinRoulette"
          />

          <button 
            @click="handleSpinRoulette" 
            class="btn btn--secondary btn--large btn--game"
            :disabled="!canSpin"
          >
            <span v-if="isSpinning">Girando...</span>
            <span v-else>🎯 Girar Ruleta</span>
          </button>
        </div>
      </section>

      <!-- Tablero de apuestas (abajo) -->
      <BettingBoard
        :player-balance="playerBalance"
        :can-place-bet="canPlaceBet"
        @place-bet="handlePlaceBet"
      />

      <!-- Panel de resultados -->
      <ResultsPanel :last-bet-result="lastBetResult" />
    </main>

    <!-- Mensaje de error -->
    <div v-if="error" class="alert alert--error">
      {{ error }}
    </div>

    <!-- Modal de Player Setup -->
    <div v-if="showPlayerSetupModal" class="modal-overlay" @click="closePlayerSetupModal">
      <div class="modal-content" @click.stop>
        <PlayerSetup @close="closePlayerSetupModal" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useGameFlow } from '../hooks/useGameFlow';
import { useRouletteStore } from '../infrastructure/stores/roulette.store';
import type { BetType } from '../domain/entities/roulette.entity';

// Importar components
import GameHeader from './GameHeader.vue';
import RouletteWheel from './RouletteWheel.vue';
import BettingBoard from './BettingBoard.vue';
import ResultsPanel from './ResultsPanel.vue';
import PlayerSetup from './PlayerSetup.vue';

const { 
  placeBet, 
  spinRoulette, 
  saveGame, 
  startNewGame, 
  syncBalance,
  isSpinning,
  canPlaceBet,
  canSpin,
  canSaveGame,
  canStartNewGame
} = useGameFlow();

const store = useRouletteStore();

// Estado local para el modal
const showPlayerSetupModal = ref(false);

// Getters del store
const playerName = store.playerName;
const playerBalance = store.playerBalance;
const lastBetResult = store.lastBetResult;
const error = store.error;
const isLoading = store.isLoading;

// Métodos
const handlePlaceBet = (bets: Array<{type: BetType, value: string | number, amount: number}>) => {
  // Procesar cada apuesta
  bets.forEach(bet => {
    placeBet(bet.type, bet.value, bet.amount);
  });
};

const handleSaveGame = () => {
  saveGame();
};

const handleNewGame = () => {
  startNewGame();
};

const handleSwitchPlayer = () => {
  showPlayerSetupModal.value = true;
};

const handleSyncBalance = () => {
  syncBalance();
};

const closePlayerSetupModal = () => {
  showPlayerSetupModal.value = false;
};

const handleSpinRoulette = () => {
  spinRoulette();
};
</script>

<style scoped>
/* Game Interface - Layout Principal */
.game-interface {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: var(--color-text-primary);
  padding: var(--spacing-md);
}

.game-interface__main {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* Panel de la ruleta */
.roulette-panel {
  background: var(--color-background-primary);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-lg);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.roulette-panel__header {
  margin-bottom: var(--spacing-lg);
}

.roulette-panel__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.roulette-panel__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
}

/* Alertas */
.alert {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  margin: var(--spacing-md) 0;
  font-weight: var(--font-weight-medium);
}

.alert--error {
  background: rgba(248, 113, 113, 0.1);
  color: #f87171;
  border: 1px solid rgba(248, 113, 113, 0.3);
}

.btn--game {
  z-index: 10;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: var(--spacing-md);
}

.modal-content {
  background: var(--color-background-primary);
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-2xl);
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

/* Responsive */
@media (min-width: 768px) {
  .game-interface {
    padding: var(--spacing-lg);
  }
  
  .game-interface__main {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }
  
  .modal-overlay {
    padding: var(--spacing-xl);
  }
}
</style>
