import { injectable, inject } from 'inversify';
import type { AuthService } from '../domain/services/auth.service';
import { UserEntity } from '../domain/entities/user.entity';
import { AuthSessionEntity } from '../domain/entities/auth-session.entity';
import { IAM_TYPES } from '../infrastructure/container/types';

/**
 * Caso de uso para manejar la autenticación
 */
@injectable()
export class AuthUseCase {
  constructor(
    @inject(IAM_TYPES.AuthService) private authService: AuthService
  ) {}

  /**
   * Registra un nuevo usuario
   */
  async register(name: string, balance: number): Promise<{ user: UserEntity; session: AuthSessionEntity }> {
    try {
      const user = await this.authService.register(name, balance);
      const { session } = await this.authService.login(name);

      return { user, session };
    } catch (error) {
      throw new Error(`Error en el registro: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Autentica un usuario
   */
  async login(name: string): Promise<{ user: UserEntity; session: AuthSessionEntity }> {
    try {
      const { user, session } = await this.authService.login(name);

      return { user, session };
    } catch (error) {
      throw new Error(`Error en el login: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Cierra la sesión de un usuario
   */
  async logout(sessionId: string): Promise<void> {
    try {
      await this.authService.logout(sessionId);
    } catch (error) {
      throw new Error(`Error en el logout: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Refresca el token de una sesión
   */
  async refreshToken(refreshToken: string): Promise<AuthSessionEntity> {
    try {
      return await this.authService.refreshToken(refreshToken);
    } catch (error) {
      throw new Error(`Error al refrescar token: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Valida un token y obtiene el usuario
   */
  async validateToken(token: string): Promise<UserEntity | null> {
    try {
      return await this.authService.validateToken(token);
    } catch (error) {
      return null;
    }
  }

}
