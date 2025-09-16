import { injectable, inject } from 'inversify';
import type { AuthService } from '../domain/services/auth.service';
import type { PasswordService } from '../domain/services/password.service';
import type { UserRepository } from '../domain/repositories/user.repository';
import { UserEntity } from '../domain/entities/user.entity';
import { AuthSessionEntity } from '../domain/entities/auth-session.entity';
import { CredentialsEntity } from '../domain/entities/credentials.entity';
import { IAM_TYPES } from '../infrastructure/container/types';

/**
 * Caso de uso para manejar la autenticación
 */
@injectable()
export class AuthUseCase {
  constructor(
    @inject(IAM_TYPES.AuthService) private authService: AuthService,
    @inject(IAM_TYPES.PasswordService) private passwordService: PasswordService,
    @inject(IAM_TYPES.UserRepository) private userRepository: UserRepository
  ) {}

  /**
   * Registra un nuevo usuario
   */
  async register(email: string, password: string, username: string): Promise<{ user: UserEntity; session: AuthSessionEntity }> {
    try {
      const credentials = new CredentialsEntity(email, password);
      
      if (!credentials.isValid()) {
        const errors = credentials.getValidationErrors();
        throw new Error(`Credenciales inválidas: ${errors.join(', ')}`);
      }

      const user = await this.authService.register(credentials, username);
      const session = await this.authService.login(credentials);

      return { user, session };
    } catch (error) {
      throw new Error(`Error en el registro: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Autentica un usuario
   */
  async login(email: string, password: string): Promise<{ user: UserEntity; session: AuthSessionEntity }> {
    try {
      const credentials = new CredentialsEntity(email, password);
      
      if (!credentials.isValidEmail()) {
        throw new Error('El email no tiene un formato válido');
      }

      const session = await this.authService.login(credentials);
      const user = await this.userRepository.findById(session.userId);

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

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

  /**
   * Cambia la contraseña de un usuario
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      if (!this.passwordService.validateStrength(newPassword)) {
        const errors = this.passwordService.getValidationErrors(newPassword);
        throw new Error(`Nueva contraseña inválida: ${errors.join(', ')}`);
      }

      await this.authService.changePassword(userId, currentPassword, newPassword);
    } catch (error) {
      throw new Error(`Error al cambiar contraseña: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Solicita restablecimiento de contraseña
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await this.authService.requestPasswordReset(email);
    } catch (error) {
      throw new Error(`Error al solicitar restablecimiento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Restablece la contraseña
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      if (!this.passwordService.validateStrength(newPassword)) {
        const errors = this.passwordService.getValidationErrors(newPassword);
        throw new Error(`Nueva contraseña inválida: ${errors.join(', ')}`);
      }

      await this.authService.resetPassword(token, newPassword);
    } catch (error) {
      throw new Error(`Error al restablecer contraseña: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}
