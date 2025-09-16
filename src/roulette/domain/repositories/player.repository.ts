import { PlayerEntity } from '../entities/player.entity';

/**
 * Interfaz del repositorio de jugadores
 */
export interface PlayerRepository {
  /**
   * Guarda un jugador
   */
  save(player: PlayerEntity): Promise<void>;

  /**
   * Busca un jugador por nombre
   */
  findByName(name: string): Promise<PlayerEntity | null>;

  /**
   * Obtiene todos los jugadores
   */
  findAll(): Promise<PlayerEntity[]>;

  /**
   * Elimina un jugador
   */
  delete(name: string): Promise<void>;
}
