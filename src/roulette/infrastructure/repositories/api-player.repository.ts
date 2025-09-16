import { injectable } from 'inversify';
import { PlayerEntity } from '../../domain/entities/player.entity';
import type { PlayerRepository } from '../../domain/repositories/player.repository';
import { HttpService } from '../../../shared/infrastructure/services/http.service';
import { configService } from '../../../shared/infrastructure/services/config.service';

/**
 * Implementación del repositorio de jugadores usando API HTTP
 */
@injectable()
export class ApiPlayerRepository extends HttpService implements PlayerRepository {
  private readonly API_BASE = '/api/v1/authentication';
  private authToken: string | null = null;

  constructor(baseURL?: string) {
    super(baseURL || configService.getApiBaseUrl());
  }

  /**
   * Obtiene los headers por defecto incluyendo autenticación
   */
  protected getDefaultHeaders(): Record<string, string> {
    const headers = super.getDefaultHeaders();
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    return headers;
  }

  /**
   * Establece el token de autenticación
   * Este método se puede llamar desde el sistema IAM
   */
  public setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Limpia el token de autenticación
   * Este método se puede llamar desde el sistema IAM
   */
  public clearAuthToken(): void {
    this.authToken = null;
  }

  /**
   * Obtiene el token de autenticación actual
   */
  public getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Configura la URL base
   */
  public setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
  }

  /**
   * Guarda un jugador en el servidor
   */
  async save(player: PlayerEntity): Promise<void> {
    try {
      const playerData = {
        uid: player.uid,
        name: player.name,
        balance: player.balance,
      };

      if (player.uid) {
        // Actualizar jugador existente
        await this.put(`${this.API_BASE}/${player.uid}`, playerData);
      } else {
        // Crear nuevo jugador
        const response = await this.post<{ uid: string }>(this.API_BASE, playerData);
        // Actualizar el UID del jugador
        (player as any).uid = response.uid;
      }
    } catch (error) {
      throw new Error(`Error al guardar jugador: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Busca un jugador por nombre
   */
  async findByName(name: string): Promise<PlayerEntity | null> {
    try {
      const response = await this.get<{
        uid: string;
        name: string;
        balance: number;
      }>(`${this.API_BASE}/name/${encodeURIComponent(name)}`);

      if (!response) {
        return null;
      }

      return new PlayerEntity(response.name, response.balance, response.uid);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw new Error(`Error al buscar jugador: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtiene todos los jugadores
   */
  async findAll(): Promise<PlayerEntity[]> {
    try {
      const response = await this.get<Array<{
        uid: string;
        name: string;
        balance: number;
      }>>(this.API_BASE);

      return response.map(playerData => 
        new PlayerEntity(playerData.name, playerData.balance, playerData.uid)
      );
    } catch (error) {
      throw new Error(`Error al obtener jugadores: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Elimina un jugador
   */
  async deletePlayer(uid: string): Promise<void> {
    try {
      await this.delete(`${this.API_BASE}/${uid}`);
    } catch (error) {
      throw new Error(`Error al eliminar jugador: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}
