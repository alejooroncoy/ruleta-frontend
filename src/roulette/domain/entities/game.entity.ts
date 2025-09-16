import { PlayerEntity } from './player.entity';
import { RouletteEntity } from './roulette.entity';
import { BetEntity } from './bet.entity';
import type { BetType, BetResult } from './roulette.entity';

/**
 * Entidad del juego que maneja el estado de la partida
 */
export class GameEntity {
  private currentBet: GameBet | null = null;
  private lastResult: BetResult | null = null;
  private isGameActive = false;
  private bets: BetEntity[] = [];
  private winningNumber?: number;
  private winningColor?: string;
  private isCompleted = false;
  private completedAt?: string;
  public readonly player: PlayerEntity;
  public readonly gameId: string;
  public readonly createdAt: string;

  constructor(player: PlayerEntity, gameId: string = crypto.randomUUID()) {
    this.player = player;
    this.gameId = gameId;
    this.createdAt = new Date().toISOString();
  }

  /**
   * Inicia una nueva partida
   */
  startGame(): void {
    this.isGameActive = true;
    this.currentBet = null;
    this.lastResult = null;
  }

  /**
   * Realiza una apuesta
   */
  placeBet(betType: BetType, betValue: string | number, betAmount: number): void {
    if (!this.isGameActive) {
      throw new Error('No hay una partida activa');
    }

    if (!this.player.canBet(betAmount)) {
      throw new Error('Saldo insuficiente para realizar la apuesta');
    }

    this.player.placeBet(betAmount);
    this.currentBet = {
      type: betType,
      value: betValue,
      amount: betAmount,
      timestamp: new Date()
    };
  }

  /**
   * Ejecuta el giro de la ruleta y calcula el resultado
   */
  spinRoulette(): BetResult {
    if (!this.currentBet) {
      throw new Error('No hay una apuesta realizada');
    }

    const resultNumber = RouletteEntity.generateNumber();
    const result = RouletteEntity.calculateBetResult(
      this.currentBet.type,
      this.currentBet.value,
      this.currentBet.amount,
      resultNumber
    );

    this.lastResult = result;

    // Añadir ganancias al saldo del jugador
    if (result.won) {
      this.player.addWinnings(result.winnings);
    }

    return result;
  }

  /**
   * Obtiene el estado actual del juego
   */
  getGameState(): GameState {
    return {
      gameId: this.gameId,
      player: this.player.clone(),
      currentBet: this.currentBet,
      lastResult: this.lastResult,
      isGameActive: this.isGameActive
    };
  }

  /**
   * Finaliza la partida actual
   */
  endGame(): void {
    this.isGameActive = false;
    this.currentBet = null;
  }

  /**
   * Verifica si hay una partida activa
   */
  hasActiveGame(): boolean {
    return this.isGameActive;
  }

  /**
   * Verifica si hay una apuesta pendiente
   */
  hasPendingBet(): boolean {
    return this.currentBet !== null && this.lastResult === null;
  }

  // ===== MÉTODOS PARA INTEGRACIÓN CON API =====

  /**
   * Crea una nueva instancia de GameEntity desde los datos de la API
   */
  static fromApiData(data: {
    gameId: string;
    winningNumber?: number;
    winningColor?: string;
    isCompleted: boolean;
    createdAt: string;
    completedAt?: string;
  }, player: PlayerEntity): GameEntity {
    const game = new GameEntity(player, data.gameId);
    game.winningNumber = data.winningNumber;
    game.winningColor = data.winningColor;
    game.isCompleted = data.isCompleted;
    game.completedAt = data.completedAt;
    game.isGameActive = !data.isCompleted;
    return game;
  }

  /**
   * Actualiza el estado del juego con datos de la API
   */
  updateFromApiData(data: {
    gameId: string;
    winningNumber?: number;
    winningColor?: string;
    isCompleted: boolean;
    createdAt: string;
    completedAt?: string;
  }): void {
    this.winningNumber = data.winningNumber;
    this.winningColor = data.winningColor;
    this.isCompleted = data.isCompleted;
    this.completedAt = data.completedAt;
    this.isGameActive = !data.isCompleted;
  }

  /**
   * Agrega una apuesta a la lista de apuestas del juego
   */
  addBet(bet: BetEntity): void {
    this.bets.push(bet);
  }

  /**
   * Obtiene todas las apuestas del juego
   */
  getBets(): BetEntity[] {
    return [...this.bets];
  }

  /**
   * Obtiene el número ganador
   */
  getWinningNumber(): number | undefined {
    return this.winningNumber;
  }

  /**
   * Obtiene el color ganador
   */
  getWinningColor(): string | undefined {
    return this.winningColor;
  }

  /**
   * Verifica si el juego está completado
   */
  getIsCompleted(): boolean {
    return this.isCompleted;
  }

  /**
   * Obtiene la fecha de finalización
   */
  getCompletedAt(): string | undefined {
    return this.completedAt;
  }

  /**
   * Calcula las ganancias totales del juego
   */
  calculateTotalWinnings(): {
    totalBets: number;
    totalWinnings: number;
    netProfit: number;
    winningBets: number;
    totalBetsCount: number;
  } {
    const totalBets = this.bets.reduce((sum, bet) => sum + bet.amount, 0);
    const totalWinnings = this.bets.reduce((sum, bet) => sum + bet.winnings, 0);
    const winningBets = this.bets.filter(bet => bet.isWinningBet).length;
    const netProfit = totalWinnings - totalBets;

    return {
      totalBets,
      totalWinnings,
      netProfit,
      winningBets,
      totalBetsCount: this.bets.length
    };
  }
}

export interface GameBet {
  type: BetType;
  value: string | number;
  amount: number;
  timestamp: Date;
}

export interface GameState {
  gameId: string;
  player: PlayerEntity;
  currentBet: GameBet | null;
  lastResult: BetResult | null;
  isGameActive: boolean;
}
