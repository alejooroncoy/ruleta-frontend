import { injectable } from 'inversify';
import type { UserRepository } from '../../domain/repositories/user.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import { HttpService } from '../../../shared/infrastructure/services/http.service';

/**
 * Implementación del repositorio de usuarios que se conecta al backend
 */
@injectable()
export class ApiUserRepository extends HttpService implements UserRepository {
  private readonly API_BASE = '/api/users';

  constructor(baseURL: string = '') {
    super(baseURL);
  }

  /**
   * Guarda un usuario en el backend
   */
  async save(user: UserEntity): Promise<void> {
    try {
      const userData = {
        id: user.id,
        email: user.email,
        username: user.username,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      };

      await this.post(`${this.API_BASE}`, userData);
    } catch (error) {
      throw new Error(`Error al guardar usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Busca un usuario por ID en el backend
   */
  async findById(id: string): Promise<UserEntity | null> {
    try {
      const response = await this.get(`${this.API_BASE}/${id}`);
      return this.mapToUserEntity(response);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw new Error(`Error al buscar usuario por ID: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Busca un usuario por email en el backend
   */
  async findByEmail(email: string): Promise<UserEntity | null> {
    try {
      const response = await this.get(`${this.API_BASE}/email/${encodeURIComponent(email)}`);
      return this.mapToUserEntity(response);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw new Error(`Error al buscar usuario por email: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Busca un usuario por username en el backend
   */
  async findByUsername(username: string): Promise<UserEntity | null> {
    try {
      const response = await this.get(`${this.API_BASE}/username/${encodeURIComponent(username)}`);
      return this.mapToUserEntity(response);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw new Error(`Error al buscar usuario por username: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtiene todos los usuarios del backend
   */
  async findAll(): Promise<UserEntity[]> {
    try {
      const response = await this.get(`${this.API_BASE}`);
      return Array.isArray(response) ? response.map(user => this.mapToUserEntity(user)) : [];
    } catch (error) {
      throw new Error(`Error al obtener usuarios: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Elimina un usuario del backend
   */
  async delete(id: string): Promise<void> {
    try {
      await this.delete(`${this.API_BASE}/${id}`);
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Verifica si existe un usuario con el email dado
   */
  async existsByEmail(email: string): Promise<boolean> {
    try {
      const user = await this.findByEmail(email);
      return user !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verifica si existe un usuario con el username dado
   */
  async existsByUsername(username: string): Promise<boolean> {
    try {
      const user = await this.findByUsername(username);
      return user !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Mapea la respuesta del backend a UserEntity
   */
  private mapToUserEntity(data: any): UserEntity {
    return new UserEntity(
      data.id,
      data.email,
      data.username,
      data.isActive,
      new Date(data.createdAt),
      new Date(data.updatedAt)
    );
  }
}
