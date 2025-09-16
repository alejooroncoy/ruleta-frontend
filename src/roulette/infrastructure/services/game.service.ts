import { injectable, inject } from 'inversify';
import { PlayerEntity } from '../../domain/entities/player.entity';
import { GameEntity } from '../../domain/entities/game.entity';
import type { BetType, BetResult } from '../../domain/entities/roulette.entity';
import type { PlayerRepository } from '../../domain/repositories/player.repository';
import type { GameService } from '../../domain/services/game.service';
import { ROULETTE_TYPES } from '../container/types';

/**
 * Implementación concreta del servicio de dominio para manejar la lógica del juego
 */
@injectable()
export class GameServiceImpl implements GameService {
  constructor(
    @inject(ROULETTE_TYPES.PlayerRepository) private playerRepository: PlayerRepository
  ) {}

  /**
   * Crea un nuevo jugador
   */
  async createPlayer(name: string, initialBalance: number): Promise<PlayerEntity> {
    if (!name.trim()) {
      throw new Error('El nombre del jugador no puede estar vacío');
    }

    if (initialBalance < 0) {
      throw new Error('El saldo inicial no puede ser negativo');
    }

    const existingPlayer = await this.playerRepository.findByName(name);
    if (existingPlayer) {
      throw new Error('Ya existe un jugador con ese nombre');
    }

    const player = new PlayerEntity(name, initialBalance, crypto.randomUUID());
    await this.playerRepository.save(player);
    return player;
  }

  /**
   * Carga un jugador existente
   */
  async loadPlayer(name: string): Promise<PlayerEntity> {
    if (!name.trim()) {
      throw new Error('El nombre del jugador no puede estar vacío');
    }

    const player = await this.playerRepository.findByName(name);
    if (!player) {
      throw new Error('No se encontró un jugador con ese nombre');
    }

    return player;
  }

  /**
   * Inicia una nueva partida
   */
  startNewGame(player: PlayerEntity): GameEntity {
    const game = new GameEntity(player);
    game.startGame();
    return game;
  }

  /**
   * Realiza una apuesta
   */
  placeBet(game: GameEntity, betType: BetType, betValue: string | number, betAmount: number): void {
    if (betAmount <= 0) {
      throw new Error('El monto de la apuesta debe ser mayor a 0');
    }

    game.placeBet(betType, betValue, betAmount);
  }

  /**
   * Ejecuta el giro de la ruleta
   */
  spinRoulette(game: GameEntity): BetResult {
    return game.spinRoulette();
  }

  /**
   * Guarda el estado del jugador
   */
  async savePlayer(player: PlayerEntity): Promise<void> {
    await this.playerRepository.save(player);
  }

  /**
   * Valida los datos de entrada para una apuesta
   */
  validateBet(betType: BetType, betValue: string | number, betAmount: number): void {
    if (betAmount <= 0) {
      throw new Error('El monto de la apuesta debe ser mayor a 0');
    }

    switch (betType) {
      case 'color':
        if (!['red', 'black'].includes(betValue as string)) {
          throw new Error('El color debe ser "red" o "black"');
        }
        break;

      case 'even_odd':
        if (!['even', 'odd'].includes(betValue as string)) {
          throw new Error('La paridad debe ser "even" o "odd"');
        }
        break;

      case 'color_even_odd':
        const colorParity = (betValue as string).split('_');
        if (colorParity.length !== 2) {
          throw new Error('El formato debe ser "color_paridad" (ej: "red_even")');
        }
        if (!['red', 'black'].includes(colorParity[0])) {
          throw new Error('El color debe ser "red" o "black"');
        }
        if (!['even', 'odd'].includes(colorParity[1])) {
          throw new Error('La paridad debe ser "even" o "odd"');
        }
        break;

      case 'specific_number':
        const number = Number(betValue);
        if (isNaN(number) || number < 0 || number > 36) {
          throw new Error('El número debe estar entre 0 y 36');
        }
        break;

      case 'number_color':
        const numberColor = (betValue as string).split('_');
        if (numberColor.length !== 2) {
          throw new Error('El formato debe ser "numero_color" (ej: "15_red")');
        }
        const num = Number(numberColor[0]);
        if (isNaN(num) || num < 0 || num > 36) {
          throw new Error('El número debe estar entre 0 y 36');
        }
        if (!['red', 'black', 'green'].includes(numberColor[1])) {
          throw new Error('El color debe ser "red", "black" o "green"');
        }
        break;
    }
  }
}
