import { injectable } from 'inversify';
import { PlayerEntity } from '../../domain/entities/player.entity';
import type { PlayerRepository } from '../../domain/repositories/player.repository';

/**
 * Implementación del repositorio de jugadores usando localStorage
 */
@injectable()
export class LocalStoragePlayerRepository implements PlayerRepository {
  private readonly STORAGE_KEY = 'roulette_players';

  /**
   * Guarda un jugador en localStorage
   */
  async save(player: PlayerEntity): Promise<void> {
    try {
      const players = await this.getAllPlayersFromStorage();
      const existingIndex = players.findIndex(p => p.name === player.name);
      
      if (existingIndex >= 0) {
        players[existingIndex] = player;
      } else {
        players.push(player);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(players));
    } catch (error) {
      throw new Error('Error al guardar el jugador: ' + (error as Error).message);
    }
  }

  /**
   * Busca un jugador por nombre
   */
  async findByName(name: string): Promise<PlayerEntity | null> {
    try {
      const players = await this.getAllPlayersFromStorage();
      const playerData = players.find(p => p.name === name);
      
      if (!playerData) {
        return null;
      }
      
      return new PlayerEntity(playerData.name, playerData.balance, playerData.id);
    } catch (error) {
      throw new Error('Error al buscar el jugador: ' + (error as Error).message);
    }
  }

  /**
   * Obtiene todos los jugadores
   */
  async findAll(): Promise<PlayerEntity[]> {
    try {
      const players = await this.getAllPlayersFromStorage();
      return players.map(p => new PlayerEntity(p.name, p.balance, p.id));
    } catch (error) {
      throw new Error('Error al obtener los jugadores: ' + (error as Error).message);
    }
  }

  /**
   * Elimina un jugador
   */
  async delete(name: string): Promise<void> {
    try {
      const players = await this.getAllPlayersFromStorage();
      const filteredPlayers = players.filter(p => p.name !== name);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredPlayers));
    } catch (error) {
      throw new Error('Error al eliminar el jugador: ' + (error as Error).message);
    }
  }

  /**
   * Obtiene todos los jugadores desde localStorage
   */
  private async getAllPlayersFromStorage(): Promise<PlayerData[]> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      return [];
    }
    
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.warn('Error al parsear datos de jugadores, iniciando con lista vacía');
      return [];
    }
  }
}

interface PlayerData {
  name: string;
  balance: number;
  id?: string;
}
