import { ref, computed } from 'vue';
import { useRouletteStore } from '../infrastructure/stores/roulette.store';
import { GameUseCase } from '../application/game.usecase';
import { GameEntity } from '../domain/entities/game.entity';
import type { BetType } from '../domain/entities/roulette.entity';
import { RouletteContainer, ROULETTE_TYPES } from '../infrastructure/container/inversify.conf';

/**
 * Composable de Vue para manejar el flujo del juego de ruleta
 * Esta es la capa de presentación que conecta la UI con los casos de uso
 */
export function useGameFlow() {
  const store = useRouletteStore();
  
  // Obtener dependencies del contenedor de Inversify
  const gameUseCase = RouletteContainer.get<GameUseCase>(ROULETTE_TYPES.GameUseCase);

  // Estado local del composable
  const isInitializing = ref(false);
  const isSpinning = ref(false);

  // Getters computados
  const canStartNewGame = computed(() => !!store.currentPlayer && !store.isGameActive);
  const canPlaceBet = computed(() => store.isGameActive && !store.hasPendingBet);
  const canSpin = computed(() => store.hasPendingBet && !isSpinning.value);
  const canSaveGame = computed(() => !!store.currentPlayer && store.isGameActive);

  /**
   * Crea un nuevo jugador e inicia el juego
   */
  const createNewPlayer = async (name: string, initialBalance: number) => {
    try {
      isInitializing.value = true;
      store.setLoading(true);
      store.clearError();

      // 1. Crear el jugador (signup)
      const { player, game } = await gameUseCase.createNewPlayerViaApi({ name, balance: initialBalance });
      
      // 2. Hacer login automático para obtener el token y guardar la sesión
      const authResponse = await gameUseCase.signInViaApi(name);
      
      // 3. Guardar la sesión de autenticación
      store.setAuthSession(authResponse.token, {
        uid: authResponse.uid,
        name: authResponse.name || name,
        balance: authResponse.balance
      });
      
      store.setCurrentPlayer(player);
      store.setCurrentGame(game);
    } catch (error) {
      const errorMessage = (error as Error).message;
      store.setError(errorMessage);
    } finally {
      isInitializing.value = false;
      store.setLoading(false);
    }
  };

  /**
   * Carga un jugador existente e inicia el juego
   */
  const loadExistingPlayer = async (name: string) => {
    try {
      isInitializing.value = true;
      store.setLoading(true);
      store.clearError();

      // 1. Cargar el jugador existente
      const { player, game } = await gameUseCase.loadExistingPlayerViaApi(name);
      
      // 2. Hacer login automático para obtener el token y guardar la sesión
      const authResponse = await gameUseCase.signInViaApi(name);
      
      // 3. Guardar la sesión de autenticación
      store.setAuthSession(authResponse.token, {
        uid: authResponse.uid,
        name: authResponse.name || name,
        balance: authResponse.balance
      });
      
      store.setCurrentPlayer(player);
      store.setCurrentGame(game);
    } catch (error) {
      const errorMessage = (error as Error).message;
      store.setError(errorMessage);
    } finally {
      isInitializing.value = false;
      store.setLoading(false);
    }
  };

  /**
   * Realiza una apuesta usando la API
   */
  const placeBet = async (betType: BetType, betValue: string | number, betAmount: number) => {
    try {
      store.clearError();
      store.setLoading(true);
      
      if (!store.currentGame) {
        throw new Error('No hay una partida activa');
      }

      await gameUseCase.placeBet(store.currentGame as GameEntity, betType, betValue, betAmount);
      
      // Actualizar el balance en el store después de la apuesta
      if (store.currentPlayer && store.currentUser) {
        store.updateUserBalance(store.currentPlayer.balance);
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      store.setError(errorMessage);
    } finally {
      store.setLoading(false);
    }
  };

  /**
   * Ejecuta el giro de la ruleta usando la API
   */
  const spinRoulette = async () => {
    try {
      isSpinning.value = true;
      store.clearError();
      store.setLoading(true);
      
      if (!store.currentGame) {
        throw new Error('No hay una partida activa');
      }

      const result = await gameUseCase.spinRoulette(store.currentGame as GameEntity);
      
      // Actualizar el balance en el store después del giro
      if (store.currentPlayer && store.currentUser) {
        store.updateUserBalance(store.currentPlayer.balance);
      }
      
      // Crear un resultado de apuesta para compatibilidad con el store
      if (result.isCompleted && result.winningNumber !== undefined) {
        const betResult = {
          won: false, // Se calculará basado en las apuestas
          winnings: 0, // Se calculará basado en las apuestas
          profit: 0, // Se calculará basado en las apuestas
          multiplier: 0, // Se calculará basado en las apuestas
          resultNumber: result.winningNumber,
          resultColor: (result.winningColor as 'red' | 'black' | 'green') || 'green',
          isResultEven: result.winningNumber % 2 === 0,
          isResultOdd: result.winningNumber % 2 === 1
        };
        store.setLastBetResult(betResult);
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      store.setError(errorMessage);
    } finally {
      isSpinning.value = false;
      store.setLoading(false);
    }
  };

  /**
   * Guarda el estado actual del jugador
   */
  const saveGame = async () => {
    try {
      store.setLoading(true);
      store.clearError();
      
      if (!store.currentPlayer) {
        throw new Error('No hay un jugador activo');
      }

      await gameUseCase.savePlayer(store.currentPlayer);
    } catch (error) {
      const errorMessage = (error as Error).message;
      store.setError(errorMessage);
    } finally {
      store.setLoading(false);
    }
  };

  /**
   * Inicia una nueva partida
   */
  const startNewGame = () => {
    try {
      store.clearError();
      
      if (!store.currentPlayer) {
        throw new Error('No hay un jugador activo');
      }

      const game = gameUseCase.startNewGame(store.currentPlayer);
      store.setCurrentGame(game);
      store.setLastBetResult(null);
    } catch (error) {
      const errorMessage = (error as Error).message;
      store.setError(errorMessage);
    }
  };

  /**
   * Cambia a un jugador diferente
   */
  const switchPlayer = async (name: string) => {
    try {
      store.clearError();
      
      // 1. Cerrar sesión actual
      await gameUseCase.logout();
      
      // 2. Limpiar estado actual
      store.resetAll();
      
      // 3. Cargar nuevo jugador
      const { player, game } = await gameUseCase.loadExistingPlayerViaApi(name);
      
      // 4. Hacer login con el nuevo jugador
      await gameUseCase.signInViaApi(name);
      
      // 5. Establecer nuevo estado
      store.setCurrentPlayer(player);
      store.setCurrentGame(game);
    } catch (error) {
      const errorMessage = (error as Error).message;
      store.setError(errorMessage);
    }
  };

  /**
   * Resetea todo el estado del juego
   */
  const resetAll = () => {
    store.resetAll();
    isInitializing.value = false;
    isSpinning.value = false;
    gameUseCase.resetAll();
  };

  /**
   * Obtiene las apuestas de un juego
   */
  const getGameBets = async (gameId: string) => {
    try {
      store.clearError();
      const bets = await gameUseCase.getGameBetsViaApi(gameId);
      return bets;
    } catch (error) {
      const errorMessage = (error as Error).message;
      store.setError(errorMessage);
      return [];
    }
  };

  /**
   * Calcula las ganancias de un juego
   */
  const calculateWinnings = async (gameId: string) => {
    try {
      store.clearError();
      const winnings = await gameUseCase.calculateWinningsViaApi(gameId);
      return winnings;
    } catch (error) {
      const errorMessage = (error as Error).message;
      store.setError(errorMessage);
      return null;
    }
  };

  /**
   * Obtiene el estado actual del juego desde la API
   */
  const refreshGameState = async () => {
    try {
      if (!store.currentGame) {
        throw new Error('No hay una partida activa');
      }

      store.clearError();
      store.setLoading(true);

      // Obtener el estado actual del juego desde la API
      const { rouletteApiService } = await import('../infrastructure/services/roulette-api.service');
      const gameState = await rouletteApiService.getGameState(store.currentGame.gameId);
      
      // Actualizar el juego con los datos de la API
      store.currentGame.updateFromApiData(gameState);
    } catch (error) {
      const errorMessage = (error as Error).message;
      store.setError(errorMessage);
    } finally {
      store.setLoading(false);
    }
  };

  /**
   * Verifica la conexión con el backend
   */
  const checkBackendConnection = async () => {
    try {
      const isConnected = await gameUseCase.checkBackendConnection();
      return isConnected;
    } catch (error) {
      return false;
    }
  };

  /**
   * Inicializa la autenticación desde localStorage
   */
  const initializeAuth = () => {
    store.initializeAuth();
  };

  /**
   * Verifica si hay una sesión activa y la restaura
   */
  const checkExistingSession = async () => {
    try {
      if (store.checkAuthStatus()) {
        // Hay una sesión válida, cargar el jugador
        const userData = store.currentUser;
        if (userData) {
          const { player, game } = await gameUseCase.loadExistingPlayerViaApi(userData.name);
          store.setCurrentPlayer(player);
          store.setCurrentGame(game);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error al verificar sesión existente:', error);
      // Si hay error, limpiar la sesión
      store.clearAuthSession();
      return false;
    }
  };

  /**
   * Cierra la sesión actual
   */
  const logout = async () => {
    try {
      await gameUseCase.logout();
      store.clearAuthSession();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Limpiar la sesión local aunque falle la API
      store.clearAuthSession();
    }
  };

  return {
    // Estado
    isInitializing,
    isSpinning,
    
    // Getters
    canStartNewGame,
    canPlaceBet,
    canSpin,
    canSaveGame,
    
    // Main actions
    createNewPlayer,
    loadExistingPlayer,
    createNewPlayerViaApi: createNewPlayer, // Alias para compatibilidad
    placeBet,
    spinRoulette,
    saveGame,
    startNewGame,
    switchPlayer,
    resetAll,
    
    // Acciones adicionales de la API
    getGameBets,
    calculateWinnings,
    refreshGameState,
    checkBackendConnection,
    
    // Acciones de autenticación
    initializeAuth,
    checkExistingSession,
    logout
  };
}
