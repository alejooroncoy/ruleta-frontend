<template>
  <div class="player-setup">
    <div class="player-setup__container">
      <header class="player-setup__header">
        <h2 class="player-setup__title">🎰 Configuración del Jugador</h2>
        <button 
          @click="emit('close')" 
          class="player-setup__close-btn"
          aria-label="Cerrar modal"
        >
          ✕
        </button>
      </header>
      
      <main class="player-setup__content">
        <!-- Información del usuario autenticado -->
        <section v-if="isAuthenticated && currentUser" class="player-setup__section player-setup__section--authenticated">
          <h3 class="player-setup__section-title">Sesión Activa</h3>
          <div class="user-info">
            <div class="user-info__item">
              <span class="user-info__label">Usuario:</span>
              <span class="user-info__value">{{ currentUser.name }}</span>
            </div>
            <div class="user-info__item">
              <span class="user-info__label">Saldo:</span>
              <span class="user-info__value">${{ currentUser.balance.toFixed(2) }}</span>
            </div>
          </div>
          <button 
            @click="handleLogout" 
            class="btn btn--danger btn--medium player-setup__logout-btn"
            :disabled="isInitializing"
          >
            Cerrar Sesión
          </button>
        </section>

        <!-- Formulario para nuevo jugador -->
        <section class="player-setup__section">
          <h3 class="player-setup__section-title">Nuevo Jugador</h3>
          <form @submit.prevent="handleCreatePlayer" class="form">
            <div class="form__group">
              <label for="playerName" class="form__label">Nombre del jugador:</label>
              <input
                id="playerName"
                v-model="newPlayerName"
                type="text"
                class="form__input"
                placeholder="Ingresa tu nombre"
                required
                :disabled="isInitializing"
              />
            </div>
            
            <div class="form__group">
              <label for="initialBalance" class="form__label">Saldo inicial:</label>
              <input
                id="initialBalance"
                v-model.number="newPlayerBalance"
                type="number"
                class="form__input"
                min="0"
                step="0.01"
                placeholder="0.00"
                required
                :disabled="isInitializing"
              />
            </div>
            
            <button 
              type="submit" 
              class="btn btn--primary btn--large"
              :disabled="isInitializing || !newPlayerName.trim() || newPlayerBalance <= 0"
            >
              <span v-if="isInitializing">Creando...</span>
              <span v-else>Crear Jugador</span>
            </button>
          </form>
        </section>

        <!-- Separador -->
        <div class="divider">
          <span class="divider__text">O</span>
        </div>

        <!-- Formulario para cargar jugador existente -->
        <section class="player-setup__section">
          <h3 class="player-setup__section-title">Jugador Existente</h3>
          <form @submit.prevent="handleLoadPlayer" class="form">
            <div class="form__group">
              <label for="existingPlayerName" class="form__label">Nombre del jugador:</label>
              <input
                id="existingPlayerName"
                v-model="existingPlayerName"
                type="text"
                class="form__input"
                placeholder="Ingresa tu nombre"
                required
                :disabled="isInitializing"
              />
            </div>
            
            <button 
              type="submit" 
              class="btn btn--secondary btn--large"
              :disabled="isInitializing || !existingPlayerName.trim()"
            >
              <span v-if="isInitializing">Cargando...</span>
              <span v-else>Cargar Jugador</span>
            </button>
          </form>
        </section>

        <!-- Mensaje de error -->
        <div v-if="error" class="alert alert--error">
          {{ error }}
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useGameFlow } from '../hooks/useGameFlow';
import { useRouletteStore } from '../infrastructure/stores/roulette.store';

// Definir eventos que emite el componente
const emit = defineEmits<{
  close: []
}>();

const { 
  createNewPlayer, 
  loadExistingPlayer, 
  isInitializing, 
  initializeAuth, 
  checkExistingSession,
  logout 
} = useGameFlow();
const store = useRouletteStore();

// Estado local del componente
const newPlayerName = ref('');
const newPlayerBalance = ref(100);
const existingPlayerName = ref('');

// Getters del store
const error = store.error;
const isAuthenticated = store.isAuthenticated;
const currentUser = store.currentUser;

// Métodos
const handleCreatePlayer = async () => {
  console.log('handleCreatePlayer', newPlayerName.value.trim(), newPlayerBalance.value);
  await createNewPlayer(newPlayerName.value.trim(), newPlayerBalance.value);
  if (!store.error) {
    // Limpiar formulario si fue exitoso
    newPlayerName.value = '';
    newPlayerBalance.value = 100;
    // Cerrar el modal
    emit('close');
  }
};

const handleLoadPlayer = async () => {
  console.log('handleLoadPlayer', existingPlayerName.value.trim());
  await loadExistingPlayer(existingPlayerName.value.trim());

  if (!store.error) {
    // Limpiar formulario si fue exitoso
    existingPlayerName.value = '';
    // Cerrar el modal
    emit('close');
  }
};

const handleLogout = async () => {
  await logout();
  // Cerrar el modal después del logout
  emit('close');
};

// Inicializar autenticación al montar el componente
onMounted(async () => {
  // Inicializar la autenticación desde localStorage
  initializeAuth();
  
  // Verificar si hay una sesión existente
  const hasSession = await checkExistingSession();
  if (hasSession && store.currentUser) {
    console.log('Sesión restaurada para:', store.currentUser.name);
  }
});
</script>

<style scoped>
/* Mobile First - Player Setup Component */
.player-setup {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--color-background-gradient);
  padding: var(--spacing-md);
}

.player-setup__container {
  background: var(--color-background-primary);
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-2xl);
  width: 100%;
  max-width: 28rem; /* 448px */
  overflow: hidden;
}

.player-setup__header {
  padding: var(--spacing-xl);
  text-align: center;
  border-bottom: 1px solid var(--color-border-primary);
  position: relative;
}

.player-setup__title {
  color: var(--color-text-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.player-setup__close-btn {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xl);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
}

.player-setup__close-btn:hover {
  background: var(--color-background-secondary, rgba(255, 255, 255, 0.1));
  color: var(--color-text-primary);
}

.player-setup__content {
  padding: var(--spacing-xl);
}

.player-setup__section {
  margin-bottom: var(--spacing-xl);
}

.player-setup__section:last-of-type {
  margin-bottom: 0;
}

.player-setup__section--authenticated {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid var(--color-success, #22c55e);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  box-shadow: 0 4px 16px rgba(34, 197, 94, 0.2);
}

.player-setup__section-title {
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--spacing-lg) 0;
}

.player-setup__section--authenticated .player-setup__section-title {
  color: var(--color-success, #22c55e);
  font-weight: var(--font-weight-bold);
}

/* Tablet y desktop */
@media (min-width: 768px) {
  .player-setup {
    padding: var(--spacing-xl);
  }
  
  .player-setup__container {
    max-width: 32rem; /* 512px */
  }
  
  .player-setup__header {
    padding: var(--spacing-2xl);
  }
  
  .player-setup__content {
    padding: var(--spacing-2xl);
  }
  
  .player-setup__title {
    font-size: var(--font-size-3xl);
  }
  
  .player-setup__section-title {
    font-size: var(--font-size-xl);
  }
}

/* Estilos para la información del usuario */
.user-info {
  margin-bottom: var(--spacing-lg);
}

.user-info__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.user-info__item:last-child {
  margin-bottom: 0;
}

.user-info__label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.user-info__value {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

/* Estilos específicos para la sección autenticada */
.player-setup__section--authenticated .user-info__label {
  color: #e2e8f0;
  font-weight: var(--font-weight-semibold);
}

.player-setup__section--authenticated .user-info__value {
  color: #ffffff;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
}

/* Estilo para el botón de logout en la sección autenticada */
.player-setup__logout-btn {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  border: 2px solid #dc2626;
  color: #ffffff;
  font-weight: var(--font-weight-bold);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
  transition: all 0.3s ease;
}

.player-setup__logout-btn:hover {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  border-color: #b91c1c;
  box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4);
  transform: translateY(-2px);
}

.player-setup__logout-btn:disabled {
  background: #6b7280;
  border-color: #6b7280;
  box-shadow: none;
  transform: none;
}

/* Desktop grande */
@media (min-width: 1024px) {
  .player-setup__container {
    max-width: 36rem; /* 576px */
  }
}
</style>
