import { injectable } from 'inversify';
import type { AuthSessionRepository } from '../../domain/repositories/auth-session.repository';
import { AuthSessionEntity } from '../../domain/entities/auth-session.entity';
import { HttpService } from '../../../shared/infrastructure/services/http.service';

/**
 * Implementación del repositorio de sesiones que se conecta al backend
 */
@injectable()
export class ApiAuthSessionRepository extends HttpService implements AuthSessionRepository {
  private readonly API_BASE = '/api/auth/sessions';

  constructor(baseURL: string = '') {
    super(baseURL);
  }

  /**
   * Guarda una sesión en el backend
   */
  async save(session: AuthSessionEntity): Promise<void> {
    try {
      const sessionData = {
        id: session.id,
        userId: session.userId,
        token: session.token,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt.toISOString(),
        createdAt: session.createdAt.toISOString(),
        isActive: session.isActive
      };

      await this.post(`${this.API_BASE}`, sessionData);
    } catch (error) {
      throw new Error(`Error al guardar sesión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Busca una sesión por ID en el backend
   */
  async findById(id: string): Promise<AuthSessionEntity | null> {
    try {
      const response = await this.get(`${this.API_BASE}/${id}`);
      return this.mapToAuthSessionEntity(response);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw new Error(`Error al buscar sesión por ID: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Busca una sesión por token en el backend
   */
  async findByToken(token: string): Promise<AuthSessionEntity | null> {
    try {
      const response = await this.get(`${this.API_BASE}/token/${encodeURIComponent(token)}`);
      return this.mapToAuthSessionEntity(response);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw new Error(`Error al buscar sesión por token: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Busca una sesión por refresh token en el backend
   */
  async findByRefreshToken(refreshToken: string): Promise<AuthSessionEntity | null> {
    try {
      const response = await this.get(`${this.API_BASE}/refresh/${encodeURIComponent(refreshToken)}`);
      return this.mapToAuthSessionEntity(response);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw new Error(`Error al buscar sesión por refresh token: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Busca sesiones activas de un usuario en el backend
   */
  async findActiveByUserId(userId: string): Promise<AuthSessionEntity[]> {
    try {
      const response = await this.get(`${this.API_BASE}/user/${userId}/active`);
      return Array.isArray(response) ? response.map(session => this.mapToAuthSessionEntity(session)) : [];
    } catch (error) {
      throw new Error(`Error al buscar sesiones activas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Elimina una sesión del backend
   */
  async delete(id: string): Promise<void> {
    try {
      await this.delete(`${this.API_BASE}/${id}`);
    } catch (error) {
      throw new Error(`Error al eliminar sesión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Elimina todas las sesiones de un usuario del backend
   */
  async deleteAllByUserId(userId: string): Promise<void> {
    try {
      await this.delete(`${this.API_BASE}/user/${userId}`);
    } catch (error) {
      throw new Error(`Error al eliminar sesiones del usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Elimina sesiones expiradas del backend
   */
  async deleteExpired(): Promise<void> {
    try {
      await this.delete(`${this.API_BASE}/expired`);
    } catch (error) {
      throw new Error(`Error al eliminar sesiones expiradas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Mapea la respuesta del backend a AuthSessionEntity
   */
  private mapToAuthSessionEntity(data: any): AuthSessionEntity {
    return new AuthSessionEntity(
      data.id,
      data.userId,
      data.token,
      data.refreshToken,
      new Date(data.expiresAt),
      new Date(data.createdAt),
      data.isActive
    );
  }
}
