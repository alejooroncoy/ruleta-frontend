import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { PlayerEntity } from '../../domain/entities/player.entity';
import { GameEntity } from '../../domain/entities/game.entity';
import { BetEntity } from '../../domain/entities/bet.entity';
import type { GameState } from '../../domain/entities/game.entity';
import type { BetResult } from '../../domain/entities/roulette.entity';
import { authSessionService } from '../../../iam/infrastructure/services/auth-session.service';

/**
 * Store para manejar el estado de la ruleta
 * Ubicado en infrastructure ya que es una implementación concreta de persistencia de estado
 */
export const useRouletteStore = defineStore('roulette', () => {
  // Estado
  const currentPlayer = ref<PlayerEntity | null>(null);
  const currentGame = ref<GameEntity | null>(null);
  const lastBetResult = ref<BetResult | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const gameBets = ref<BetEntity[]>([]);
  const isConnectedToBackend = ref(false);
  
  // Estado de autenticación
  const authToken = ref<string | null>(null);
  const isAuthenticated = ref(false);
  const currentUser = ref<{
    uid: string;
    name: string;
    balance: number;
  } | null>(null);

  // Getters computados
  const isGameActive = computed(() => currentGame.value?.hasActiveGame() ?? false);
  const hasPendingBet = computed(() => currentGame.value?.hasPendingBet() ?? false);
  const playerBalance = computed(() => currentPlayer.value?.balance ?? 0);
  const playerName = computed(() => currentPlayer.value?.name ?? '');
  const totalBetsAmount = computed(() => gameBets.value.reduce((sum, bet) => sum + bet.amount, 0));
  const totalWinnings = computed(() => gameBets.value.reduce((sum, bet) => sum + bet.winnings, 0));
  const netProfit = computed(() => totalWinnings.value - totalBetsAmount.value);
  const winningBetsCount = computed(() => gameBets.value.filter(bet => bet.isWinningBet).length);

  // Acciones
  const setCurrentPlayer = (player: PlayerEntity) => {
    currentPlayer.value = player;
    error.value = null;
  };

  const setCurrentGame = (game: GameEntity) => {
    currentGame.value = game;
    error.value = null;
  };

  const setLastBetResult = (result: BetResult | null) => {
    lastBetResult.value = result;
  };

  const setLoading = (loading: boolean) => {
    isLoading.value = loading;
  };

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage;
  };

  const clearError = () => {
    error.value = null;
  };

  const resetGame = () => {
    currentGame.value = null;
    lastBetResult.value = null;
    error.value = null;
  };

  const resetAll = () => {
    currentPlayer.value = null;
    currentGame.value = null;
    lastBetResult.value = null;
    error.value = null;
    isLoading.value = false;
  };

  const getGameState = (): GameState | null => {
    return currentGame.value?.getGameState() ?? null;
  };

  const setGameBets = (bets: BetEntity[]) => {
    gameBets.value = bets;
  };

  const addBet = (bet: BetEntity) => {
    gameBets.value.push(bet);
  };

  const setBackendConnection = (connected: boolean) => {
    isConnectedToBackend.value = connected;
  };

  const clearGameBets = () => {
    gameBets.value = [];
  };

  // ===== MÉTODOS DE AUTENTICACIÓN =====

  /**
   * Inicializa la autenticación desde localStorage
   */
  const initializeAuth = () => {
    const session = authSessionService.getSession();
    if (session && !authSessionService.isSessionExpired()) {
      authToken.value = session.token;
      currentUser.value = session.user;
      isAuthenticated.value = true;
      
      // Crear PlayerEntity desde los datos de la sesión
      const player = new PlayerEntity(session.user.name, session.user.balance, session.user.uid);
      currentPlayer.value = player;
    }
  };

  /**
   * Establece la sesión de autenticación
   */
  const setAuthSession = (token: string, userData: {
    uid: string;
    name: string;
    balance: number;
  }) => {
    authToken.value = token;
    currentUser.value = userData;
    isAuthenticated.value = true;
    
    // Guardar en localStorage
    authSessionService.saveSession(token, userData);
    
    // Crear PlayerEntity
    const player = new PlayerEntity(userData.name, userData.balance, userData.uid);
    currentPlayer.value = player;
  };

  /**
   * Actualiza el saldo del usuario autenticado
   */
  const updateUserBalance = (newBalance: number) => {
    console.log('updateUserBalance llamado con:', newBalance);
    if (currentUser.value) {
      currentUser.value.balance = newBalance;
      authSessionService.updateUserBalance(newBalance);
      
      // Actualizar también el PlayerEntity y forzar reactividad
      if (currentPlayer.value) {
        currentPlayer.value.updateBalance(newBalance);
        // Forzar la reactividad creando una nueva instancia del PlayerEntity
        const updatedPlayer = new PlayerEntity(
          currentPlayer.value.name,
          newBalance,
          currentPlayer.value.uid
        );
        currentPlayer.value = updatedPlayer;
        console.log('PlayerEntity actualizado con balance:', updatedPlayer.balance);
      }
    }
  };

  /**
   * Fuerza la actualización del balance del jugador actual
   */
  const forceUpdatePlayerBalance = (newBalance: number) => {
    console.log('forceUpdatePlayerBalance llamado con:', newBalance);
    if (currentPlayer.value) {
      const updatedPlayer = new PlayerEntity(
        currentPlayer.value.name,
        newBalance,
        currentPlayer.value.uid
      );
      currentPlayer.value = updatedPlayer;
      
      // También actualizar currentUser si existe
      if (currentUser.value) {
        currentUser.value.balance = newBalance;
        authSessionService.updateUserBalance(newBalance);
      }
      console.log('Balance forzado a actualizar:', newBalance);
    }
  };

  /**
   * Cierra la sesión de autenticación
   */
  const clearAuthSession = () => {
    authToken.value = null;
    currentUser.value = null;
    isAuthenticated.value = false;
    
    // Limpiar localStorage
    authSessionService.clearSession();
    
    // Limpiar estado del juego
    resetAll();
  };

  /**
   * Verifica si el usuario está autenticado
   */
  const checkAuthStatus = (): boolean => {
    const isLoggedIn = authSessionService.isLoggedIn() && !authSessionService.isSessionExpired();
    
    if (!isLoggedIn && isAuthenticated.value) {
      // Sesión expirada, limpiar estado
      clearAuthSession();
    }
    
    return isLoggedIn;
  };

  return {
    // Estado
    currentPlayer,
    currentGame,
    lastBetResult,
    isLoading,
    error,
    gameBets,
    isConnectedToBackend,
    
    // Estado de autenticación
    authToken,
    isAuthenticated,
    currentUser,
    
    // Getters
    isGameActive,
    hasPendingBet,
    playerBalance,
    playerName,
    totalBetsAmount,
    totalWinnings,
    netProfit,
    winningBetsCount,
    
    // Acciones
    setCurrentPlayer,
    setCurrentGame,
    setLastBetResult,
    setLoading,
    setError,
    clearError,
    resetGame,
    resetAll,
    getGameState,
    setGameBets,
    addBet,
    setBackendConnection,
    clearGameBets,
    
    // Acciones de autenticación
    initializeAuth,
    setAuthSession,
    updateUserBalance,
    forceUpdatePlayerBalance,
    clearAuthSession,
    checkAuthStatus
  };
});
