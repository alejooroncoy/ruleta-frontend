import { injectable, inject } from 'inversify';
import type { AuthService } from '../../domain/services/auth.service';
import type { UserRepository } from '../../domain/repositories/user.repository';
import type { AuthSessionRepository } from '../../domain/repositories/auth-session.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import { AuthSessionEntity } from '../../domain/entities/auth-session.entity';
import { CredentialsEntity } from '../../domain/entities/credentials.entity';
import { HttpService } from '../../../shared/infrastructure/services/http.service';
import { IAM_TYPES } from '../container/types';

/**
 * Implementación del servicio de autenticación que se conecta al backend
 */
@injectable()
export class ApiAuthService extends HttpService implements AuthService {
  private readonly API_BASE = '/api/auth';

  constructor(
    @inject(IAM_TYPES.UserRepository) private userRepository: UserRepository,
    @inject(IAM_TYPES.AuthSessionRepository) private authSessionRepository: AuthSessionRepository,
    baseURL: string = ''
  ) {
    super(baseURL);
  }

  /**
   * Registra un nuevo usuario en el backend
   */
  async register(credentials: CredentialsEntity, username: string): Promise<UserEntity> {
    try {
      const registerData = {
        name: username, // Usar username como name
        balance: 100 // Balance inicial por defecto
      };

      const response = await this.post<{
        uid: string;
        name: string;
        balance: number;
        role?: string;
        status?: string;
        createdAt: string;
        updatedAt: string;
      }>(`${this.API_BASE}/signup`, registerData);
      
      // El backend devuelve el usuario creado
      const user = new UserEntity(
        response.uid,
        response.name, // Usar name como email para compatibilidad
        response.name, // Usar name como username
        true, // isActive por defecto
        new Date(response.createdAt),
        new Date(response.updatedAt)
      );

      // Guardamos el usuario en el repositorio local si es necesario
      await this.userRepository.save(user);

      return user;
    } catch (error) {
      throw new Error(`Error en el registro: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Autentica un usuario con el backend usando solo el nombre
   */
  async login(credentials: CredentialsEntity): Promise<AuthSessionEntity> {
    try {
      const loginData = {
        name: credentials.email // Usamos email como name para mantener compatibilidad
      };

      const response = await this.post<{
        session: {
          id: string;
          userId: string;
          token: string;
          refreshToken: string;
          expiresAt: string;
          createdAt: string;
          isActive: boolean;
        };
      }>(`${this.API_BASE}/login`, loginData);
      
      // El backend devuelve la sesión con tokens
      const session = new AuthSessionEntity(
        response.session.id,
        response.session.userId,
        response.session.token,
        response.session.refreshToken,
        new Date(response.session.expiresAt),
        new Date(response.session.createdAt),
        response.session.isActive
      );

      // Guardamos la sesión en el repositorio local si es necesario
      await this.authSessionRepository.save(session);

      return session;
    } catch (error) {
      throw new Error(`Error en el login: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Cierra la sesión (solo local, no hay API de logout en el backend)
   */
  async logout(sessionId: string): Promise<void> {
    try {
      // No hay API de logout en el backend, solo limpiamos el estado local
      console.log('Logout local - no hay API de logout en el backend');
      
      // Eliminamos la sesión del repositorio local
      await this.authSessionRepository.delete(sessionId);
    } catch (error) {
      // Aún si hay error, intentamos limpiar la sesión local
      console.warn('Error al eliminar sesión del repositorio local:', error);
      throw new Error(`Error en el logout local: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Refresca el token con el backend
   */
  async refreshToken(refreshToken: string): Promise<AuthSessionEntity> {
    try {
      const response = await this.post<{
        session: {
          id: string;
          userId: string;
          token: string;
          refreshToken: string;
          expiresAt: string;
          createdAt: string;
          isActive: boolean;
        };
      }>(`${this.API_BASE}/refresh`, { refreshToken });
      
      // El backend devuelve una nueva sesión
      const session = new AuthSessionEntity(
        response.session.id,
        response.session.userId,
        response.session.token,
        response.session.refreshToken,
        new Date(response.session.expiresAt),
        new Date(response.session.createdAt),
        response.session.isActive
      );

      // Actualizamos la sesión en el repositorio local
      await this.authSessionRepository.save(session);

      return session;
    } catch (error) {
      throw new Error(`Error al refrescar token: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Valida un token con el backend
   */
  async validateToken(token: string): Promise<UserEntity | null> {
    try {
      const response = await this.post<{
        valid: boolean;
        user?: {
          id: string;
          email: string;
          username: string;
          isActive: boolean;
          createdAt: string;
          updatedAt: string;
        };
      }>(`${this.API_BASE}/validate`, { token });
      
      if (response.valid && response.user) {
        return new UserEntity(
          response.user.id,
          response.user.email,
          response.user.username,
          response.user.isActive,
          new Date(response.user.createdAt),
          new Date(response.user.updatedAt)
        );
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Cambia la contraseña en el backend
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const changePasswordData = {
        userId,
        currentPassword,
        newPassword
      };

      await this.post(`${this.API_BASE}/change-password`, changePasswordData);
    } catch (error) {
      throw new Error(`Error al cambiar contraseña: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Solicita restablecimiento de contraseña en el backend
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await this.post(`${this.API_BASE}/request-password-reset`, { email });
    } catch (error) {
      throw new Error(`Error al solicitar restablecimiento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Restablece la contraseña con un token en el backend
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const resetData = {
        token,
        newPassword
      };

      await this.post(`${this.API_BASE}/reset-password`, resetData);
    } catch (error) {
      throw new Error(`Error al restablecer contraseña: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}
