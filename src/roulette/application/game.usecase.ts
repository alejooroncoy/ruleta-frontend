import { injectable, inject } from 'inversify';
import type { GameService } from '../domain/services/game.service';
import type { NotificationService } from '../domain/services/notification.service';
import type { AuthService } from '../../iam/domain/services/auth.service';
import { RouletteApiService } from '../infrastructure/services/roulette-api.service';
import { PlayerEntity } from '../domain/entities/player.entity';
import { GameEntity } from '../domain/entities/game.entity';
import { BetEntity } from '../domain/entities/bet.entity';
import type { BetType } from '../domain/entities/roulette.entity';
import { ROULETTE_TYPES } from '../infrastructure/container/types';

/**
 * Caso de uso para manejar el flujo del juego de ruleta
 * Esta es la capa de aplicación que orquesta los servicios de dominio
 */
@injectable()
export class GameUseCase {
  constructor(
    @inject(ROULETTE_TYPES.GameService) private gameService: GameService,
    @inject(ROULETTE_TYPES.NotificationService) private notificationService: NotificationService,
    @inject(ROULETTE_TYPES.RouletteApiService) private rouletteApiService: RouletteApiService,
    @inject(ROULETTE_TYPES.AuthService) private _authService: AuthService // TODO: Use when implemented in AuthService
  ) {}

  // ===== MÉTODOS PARA MODO LOCAL =====

  /**
   * Crea un nuevo jugador e inicia el juego (modo local)
   */
  async createNewPlayer(name: string, initialBalance: number): Promise<{ player: PlayerEntity; game: GameEntity }> {
    try {
      const player = await this.gameService.createPlayer(name, initialBalance);
      const game = this.gameService.startNewGame(player);
      
      this.notificationService.showSuccess(`¡Bienvenido ${name}! Tu saldo inicial es $${initialBalance}`);
      
      return { player, game };
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.notificationService.showError(errorMessage);
      throw error;
    }
  }

  /**
   * Carga un jugador existente e inicia el juego (modo local)
   */
  async loadExistingPlayer(name: string): Promise<{ player: PlayerEntity; game: GameEntity }> {
    try {
      const player = await this.gameService.loadPlayer(name);
      const game = this.gameService.startNewGame(player);
      
      this.notificationService.showSuccess(`¡Bienvenido de nuevo ${name}! Tu saldo actual es $${player.balance}`);
      
      return { player, game };
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.notificationService.showError(errorMessage);
      throw error;
    }
  }

  /**
   * Realiza una apuesta usando la API
   */
  async placeBet(game: GameEntity, betType: BetType, betValue: string | number, betAmount: number): Promise<BetEntity> {
    try {
      if (!game.player.uid) {
        throw new Error('El jugador no tiene un UID válido');
      }

      // Validar la apuesta localmente primero
      this.gameService.validateBet(betType, betValue, betAmount);
      
      // Realizar la apuesta a través de la API
      const betResponse = await this.placeBetViaApi(game.gameId, game.player.uid, betType, betValue, betAmount);
      
      // Crear la entidad de apuesta
      const bet = BetEntity.fromApiData(betResponse);
      
      // Agregar la apuesta al juego
      game.addBet(bet);
      
      // Marcar que hay una apuesta pendiente para habilitar el botón de girar
      // (esto también actualiza el saldo del jugador)
      game.placeBet(betType, betValue, betAmount);
      
      // Actualizar el balance en el backend
      if (game.player.uid) {
        try {
          await this.updateUserBalanceViaApi(game.player.uid, game.player.balance);
        } catch (error) {
          console.warn('Error updating balance in backend after bet:', error);
        }
      }
      
      this.notificationService.showInfo(`Apuesta realizada: $${betAmount}`);
      return bet;
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.notificationService.showError(errorMessage);
      throw error;
    }
  }

  /**
   * Ejecuta el giro de la ruleta usando la API
   */
  async spinRoulette(game: GameEntity): Promise<{
    gameId: string;
    winningNumber?: number;
    winningColor?: string;
    isCompleted: boolean;
    createdAt: string;
    completedAt?: string;
  }> {
    try {
      // Girar la ruleta a través de la API
      const result = await this.spinRouletteViaApi(game.gameId);
      
      // Actualizar el estado del juego
      game.updateFromApiData(result);
      
      if (result.isCompleted && result.winningNumber !== undefined) {
        this.notificationService.showSuccess(`¡Resultado: ${result.winningNumber} (${result.winningColor})!`);
        
        // Calculate winnings and update player balance
        await this.calculateAndUpdateWinnings(game);
        
        // Limpiar el estado de apuesta pendiente después del giro
        game.endGame();
        game.startGame(); // Reiniciar para permitir nuevas apuestas
      } else {
        this.notificationService.showInfo('Ruleta girando...');
      }
      
      return result;
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.notificationService.showError(errorMessage);
      throw error;
    }
  }

  /**
   * Guarda el estado actual del jugador usando la API
   */
  async savePlayer(player: PlayerEntity): Promise<void> {
    try {
      await this.saveGameViaApi(player);
      this.notificationService.showSuccess('¡Partida guardada exitosamente!');
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.notificationService.showError(errorMessage);
      throw error;
    }
  }

  /**
   * Inicia una nueva partida (modo local)
   */
  startNewGame(player: PlayerEntity): GameEntity {
    try {
      const game = this.gameService.startNewGame(player);
      this.notificationService.showInfo('Nueva partida iniciada');
      return game;
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.notificationService.showError(errorMessage);
      throw error;
    }
  }

  // ===== MÉTODOS PARA MODO API =====

  /**
   * Crea un nuevo jugador usando la API del backend
   */
  async createNewPlayerViaApi(userData: {
    name: string;
    balance: number;
  }): Promise<{ player: PlayerEntity; game: GameEntity }> {
    try {
      const userResponse = await this.signUpViaApi({ name: userData.name, balance: userData.balance });
      const player = new PlayerEntity(userResponse.name || userData.name, userData.balance, userResponse.uid);
      const game = this.gameService.startNewGame(player);
      
      this.notificationService.showSuccess(`¡Bienvenido ${userData.name}! Tu saldo inicial es $${userResponse.balance}`);
      
      return { player, game };
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.notificationService.showError(errorMessage);
      throw error;
    }
  }

  /**
   * Carga un jugador existente usando la API del backend
   */
  async loadExistingPlayerViaApi(name: string): Promise<{ player: PlayerEntity; game: GameEntity }> {
    try {
      const player = await this.loadGameViaApi(name);
      
      if (!player) {
        throw new Error(`No se encontró el jugador ${name}`);
      }
      
      const game = this.gameService.startNewGame(player);
      
      this.notificationService.showSuccess(`¡Bienvenido de nuevo ${name}! Tu saldo actual es $${player.balance}`);
      
      return { player, game };
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.notificationService.showError(errorMessage);
      throw error;
    }
  }

  /**
   * Realiza una apuesta usando la API del backend
   */
  async placeBetViaApi(gameId: string, userUid: string, betType: BetType, betValue: string | number, betAmount: number): Promise<{
    betId: string;
    gameId: string;
    userUid: string;
    betType?: string;
    amount: number;
    number?: number;
    color?: string;
    evenOdd?: string;
    isWinning?: boolean;
    winningsAmount?: number;
    createdAt: string;
  }> {
    try {
      // Convertir el tipo de apuesta y valor a los campos correctos de la API
      const betData: {
        gameId: string;
        userUid: string;
        betType?: string;
        amount: number;
        number?: number;
        color?: string;
        evenOdd?: string;
      } = {
        gameId,
        userUid,
        amount: betAmount
      };

      // Mapear el tipo de apuesta a los campos de la API
      switch (betType) {
        case 'specific_number':
          betData.betType = 'NUMERO';
          betData.number = Number(betValue);
          break;
        case 'color':
          betData.betType = 'COLOR';
          betData.color = String(betValue);
          break;
        case 'even_odd':
          betData.betType = 'PAR_IMPAR';
          betData.evenOdd = String(betValue);
          break;
        default:
          betData.betType = String(betType);
      }

      const response = await this.rouletteApiService.placeBet(betData);
      this.notificationService.showSuccess(`Apuesta realizada: $${betAmount}`);
      return response;
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.notificationService.showError(errorMessage);
      throw error;
    }
  }

  /**
   * Gira la ruleta usando la API del backend
   */
  async spinRouletteViaApi(gameId: string): Promise<{
    gameId: string;
    winningNumber?: number;
    winningColor?: string;
    isCompleted: boolean;
    createdAt: string;
    completedAt?: string;
  }> {
    try {
      const result = await this.rouletteApiService.spinRoulette(gameId);
      
      if (result.isCompleted && result.winningNumber !== undefined) {
        this.notificationService.showSuccess(`¡Resultado: ${result.winningNumber} (${result.winningColor})!`);
      } else {
        this.notificationService.showInfo('Ruleta girando...');
      }
      
      return result;
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.notificationService.showError(errorMessage);
      throw error;
    }
  }

  /**
   * Guarda el juego usando la API del backend
   * TODO: Implementar a través del AuthService inyectado
   */
  async saveGameViaApi(player: PlayerEntity): Promise<void> {
    try {
      // Temporal: usar authApiService directamente hasta implementar en AuthService
      const { authApiService } = await import('../../iam/infrastructure/services/auth-api.service');
      await authApiService.updateUserBalance(player.uid, player.balance);
      
      this.notificationService.showSuccess('¡Partida guardada exitosamente!');
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.notificationService.showError(errorMessage);
      throw error;
    }
  }

  /**
   * Carga un juego usando la API del backend
   * TODO: Implementar a través del AuthService inyectado
   */
  async loadGameViaApi(playerName: string): Promise<PlayerEntity | null> {
    try {
      // Temporal: usar authApiService directamente hasta implementar en AuthService
      const { authApiService } = await import('../../iam/infrastructure/services/auth-api.service');
      const userData = await authApiService.getUserByName(playerName);
      
      if (userData) {
        const player = new PlayerEntity(userData.name || playerName, userData.balance, userData.uid);
        this.notificationService.showSuccess(`¡Juego cargado para ${playerName}!`);
        return player;
      } else {
        this.notificationService.showWarning(`No se encontró un juego guardado para ${playerName}`);
        return null;
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        this.notificationService.showWarning(`No se encontró un juego guardado para ${playerName}`);
        return null;
      }
      const errorMessage = (error as Error).message;
      this.notificationService.showError(errorMessage);
      throw error;
    }
  }

  // ===== MÉTODOS DE AUTENTICACIÓN =====

  /**
   * Registra un nuevo usuario en el backend
   * TODO: Implementar a través del AuthService inyectado
   */
  async signUpViaApi(userData: {
    name: string;
    balance: number;
  }): Promise<{
    uid: string;
    name?: string;
    balance: number;
    role?: string;
    status?: string;
    createdAt: string;
    updatedAt: string;
  }> {
    try {
      // Temporal: usar authApiService directamente hasta implementar en AuthService
      const { authApiService } = await import('../../iam/infrastructure/services/auth-api.service');
      const response = await authApiService.signUp({
        name: userData.name,
        email: userData.name, // Usar name como email para compatibilidad
        password: 'dummy' // Dummy password since real backend doesn't require it
      });
      this.notificationService.showSuccess(`¡Usuario ${userData.name} registrado exitosamente!`);
      return response;
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.notificationService.showError(errorMessage);
      throw error;
    }
  }

  /**
   * Inicia sesión de un usuario en el backend
   * TODO: Implementar a través del AuthService inyectado
   */
  async signInViaApi(name: string): Promise<{
    uid: string;
    name?: string;
    balance: number;
    role?: string;
    status?: string;
    createdAt: string;
    updatedAt: string;
    token: string;
  }> {
    try {
      // Temporal: usar authApiService directamente hasta implementar en AuthService
      const { authApiService } = await import('../../iam/infrastructure/services/auth-api.service');
      const response = await authApiService.signIn({ name });
      this.notificationService.showSuccess(`¡Bienvenido ${response.name}!`);
      return response;
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.notificationService.showError(errorMessage);
      throw error;
    }
  }

  /**
   * Obtiene información de un usuario por nombre
   * TODO: Implementar a través del AuthService inyectado
   */
  async getUserByNameViaApi(name: string): Promise<{
    uid: string;
    name?: string;
    balance: number;
    role?: string;
    status?: string;
    createdAt: string;
    updatedAt: string;
  } | null> {
    try {
      // Temporal: usar authApiService directamente hasta implementar en AuthService
      const { authApiService } = await import('../../iam/infrastructure/services/auth-api.service');
      const response = await authApiService.getUserByName(name);
      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      const errorMessage = (error as Error).message;
      this.notificationService.showError(errorMessage);
      throw error;
    }
  }

  /**
   * Actualiza el saldo de un usuario
   * TODO: Implementar a través del AuthService inyectado
   */
  async updateUserBalanceViaApi(uid: string, newBalance: number): Promise<{
    uid: string;
    name?: string;
    balance: number;
    role?: string;
    status?: string;
    createdAt: string;
    updatedAt: string;
  }> {
    try {
      // Temporal: usar authApiService directamente hasta implementar en AuthService
      const { authApiService } = await import('../../iam/infrastructure/services/auth-api.service');
      const response = await authApiService.updateUserBalance(uid, newBalance);
      this.notificationService.showSuccess(`Saldo actualizado: $${newBalance}`);
      return response;
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.notificationService.showError(errorMessage);
      throw error;
    }
  }

  /**
   * Cierra la sesión del usuario
   * TODO: Implementar a través del AuthService inyectado
   */
  async logout(): Promise<void> {
    try {
      // Temporal: usar authApiService directamente hasta implementar en AuthService
      const { authApiService } = await import('../../iam/infrastructure/services/auth-api.service');
      await authApiService.logout();
      this.notificationService.showInfo('Sesión cerrada');
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.notificationService.showError(errorMessage);
      throw error;
    }
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Cambia a un jugador diferente
   */
  async switchPlayer(name: string): Promise<{ player: PlayerEntity; game: GameEntity }> {
    try {
      // Si hay una partida activa, se perderá
      this.notificationService.showWarning('Se perderá la partida actual al cambiar de jugador');
      
      return await this.loadExistingPlayer(name);
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.notificationService.showError(errorMessage);
      throw error;
    }
  }

  /**
   * Resetea todo el estado del juego
   */
  resetAll(): void {
    this.notificationService.showInfo('Juego reiniciado');
  }

  /**
   * Verifica la conexión con el backend
   */
  async checkBackendConnection(): Promise<boolean> {
    try {
      await this.rouletteApiService.healthCheck();
      this.notificationService.showSuccess('Conexión con el backend establecida');
      return true;
    } catch (error) {
      this.notificationService.showError('Error de conexión con el backend');
      return false;
    }
  }

  /**
   * Obtiene las apuestas de un juego
   */
  async getGameBetsViaApi(gameId: string): Promise<Array<{
    betId: string;
    gameId: string;
    userUid: string;
    betType?: string;
    amount: number;
    number?: number;
    color?: string;
    evenOdd?: string;
    isWinning?: boolean;
    winningsAmount?: number;
    createdAt: string;
  }>> {
    try {
      const bets = await this.rouletteApiService.getGameBets(gameId);
      return bets;
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.notificationService.showError(errorMessage);
      throw error;
    }
  }

  /**
   * Calcula las ganancias de un juego
   */
  async calculateWinningsViaApi(gameId: string): Promise<{
    totalBets: number;
    totalWinnings: number;
    netProfit: number;
    winningBets: number;
    totalBetsCount: number;
  }> {
    try {
      const winnings = await this.rouletteApiService.calculateWinnings(gameId);
      this.notificationService.showInfo(`Ganancias calculadas: $${winnings.totalWinnings}`);
      return winnings;
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.notificationService.showError(errorMessage);
      throw error;
    }
  }

  /**
   * Calcula y actualiza las ganancias del jugador después del giro
   */
  private async calculateAndUpdateWinnings(game: GameEntity): Promise<void> {
    try {
      // Obtener las apuestas del juego desde la API
      const bets = await this.getGameBetsViaApi(game.gameId);
      
      // Limpiar las apuestas existentes y agregar las actualizadas desde la API
      const existingBets = game.getBets();
      existingBets.length = 0; // Limpiar array existente
      
      // Agregar las apuestas actualizadas desde la API
      bets.forEach(apiBet => {
        const updatedBet = BetEntity.fromApiData(apiBet);
        existingBets.push(updatedBet);
      });

      // Calculate total winnings
      const totalWinnings = existingBets.reduce((sum, bet) => sum + (bet.winningsAmount || 0), 0);
      
      if (totalWinnings > 0) {
        // Actualizar el saldo del jugador
        game.player.addWinnings(totalWinnings);
        this.notificationService.showSuccess(`¡Ganaste $${totalWinnings} en total!`);
      }
      
      // Actualizar el balance en el backend y en el store
      if (game.player.uid) {
        try {
          await this.updateUserBalanceViaApi(game.player.uid, game.player.balance);
        } catch (error) {
          console.warn('Error updating balance in backend:', error);
        }
      }
    } catch (error) {
      console.error('Error calculating winnings:', error);
      // No lanzar error para no interrumpir el flujo del juego
    }
  }
}