import { PlayerEntity } from '../entities/player.entity';
import { GameEntity } from '../entities/game.entity';
import type { BetType, BetResult } from '../entities/roulette.entity';

/**
 * Interfaz del servicio de dominio para manejar la lógica del juego
 */
export interface GameService {
  /**
   * Crea un nuevo jugador
   */
  createPlayer(name: string, initialBalance: number): Promise<PlayerEntity>;

  /**
   * Carga un jugador existente
   */
  loadPlayer(name: string): Promise<PlayerEntity>;

  /**
   * Inicia una nueva partida
   */
  startNewGame(player: PlayerEntity): GameEntity;

  /**
   * Realiza una apuesta
   */
  placeBet(game: GameEntity, betType: BetType, betValue: string | number, betAmount: number): void;

  /**
   * Ejecuta el giro de la ruleta
   */
  spinRoulette(game: GameEntity): BetResult;

  /**
   * Guarda el estado del jugador
   */
  savePlayer(player: PlayerEntity): Promise<void>;

  /**
   * Valida los datos de entrada para una apuesta
   */
  validateBet(betType: BetType, betValue: string | number, betAmount: number): void;
}
