<template>
  <header class="game-header">
    <div class="game-header__player-info">
      <h2 class="game-header__title">🎰 Ruleta - {{ playerName }}</h2>
      <div class="game-header__balance">
        <span class="game-header__balance-label">Saldo:</span>
        <span class="game-header__balance-amount">${{ playerBalance.toFixed(2) }}</span>
      </div>
    </div>
    
    <div class="game-header__actions">
      <button 
        @click="$emit('save-game')" 
        class="btn btn--info btn--small" 
        :disabled="!canSaveGame || isLoading"
      >
        💾 Guardar
      </button>
      <button 
        @click="$emit('new-game')" 
        class="btn btn--success btn--small" 
        :disabled="!canStartNewGame"
      >
        🎮 Nueva Partida
      </button>
      <button 
        @click="$emit('switch-player')" 
        class="btn btn--secondary btn--small"
      >
        🔄 Cambiar Jugador
      </button>
        <button 
          @click="testToast" 
          class="btn btn--primary btn--small"
          title="Probar toasts"
        >
          🍞 Test Toast
        </button>
        <button 
          @click="$emit('sync-balance')" 
          class="btn btn--secondary btn--small"
          title="Sincronizar balance con el backend"
        >
          🔄 Sync Balance
        </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useToast } from '../../shared/composables/useToast';

// Props
interface Props {
  playerName: string;
  playerBalance: number;
  canSaveGame: boolean;
  canStartNewGame: boolean;
  isLoading: boolean;
}

defineProps<Props>();

// Emits
defineEmits<{
  'save-game': [];
  'new-game': [];
  'switch-player': [];
  'sync-balance': [];
}>();

// Toast service
const { success, error, warning, info } = useToast();

// Método para probar toasts
const testToast = () => {
  const messages = [
    { type: 'success', message: '¡Operación exitosa!', title: 'Éxito' },
    { type: 'error', message: 'Algo salió mal', title: 'Error' },
    { type: 'warning', message: 'Ten cuidado con esto', title: 'Advertencia' },
    { type: 'info', message: 'Información importante', title: 'Información' }
  ];
  
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  
  switch (randomMessage.type) {
    case 'success':
      success(randomMessage.message, { title: randomMessage.title });
      break;
    case 'error':
      error(randomMessage.message, { title: randomMessage.title });
      break;
    case 'warning':
      warning(randomMessage.message, { title: randomMessage.title });
      break;
    case 'info':
      info(randomMessage.message, { title: randomMessage.title });
      break;
  }
};
</script>

<style scoped>
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.game-header__player-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.game-header__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.game-header__balance {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.game-header__balance-label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.game-header__balance-amount {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: #4ade80;
}

.game-header__actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

/* Responsive */
@media (min-width: 768px) {
  .game-header {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .game-header__actions {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
