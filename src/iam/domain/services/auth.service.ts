import { UserEntity } from '../entities/user.entity';
import { AuthSessionEntity } from '../entities/auth-session.entity';
import { CredentialsEntity } from '../entities/credentials.entity';

/**
 * Interfaz del servicio de autenticación
 */
export interface AuthService {
  /**
   * Registra un nuevo usuario
   */
  register(credentials: CredentialsEntity, username: string): Promise<UserEntity>;

  /**
   * Autentica un usuario con credenciales
   */
  login(credentials: CredentialsEntity): Promise<AuthSessionEntity>;

  /**
   * Cierra la sesión de un usuario
   */
  logout(sessionId: string): Promise<void>;

  /**
   * Refresca el token de una sesión
   */
  refreshToken(refreshToken: string): Promise<AuthSessionEntity>;

  /**
   * Valida un token de acceso
   */
  validateToken(token: string): Promise<UserEntity | null>;

  /**
   * Cambia la contraseña de un usuario
   */
  changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;

  /**
   * Solicita restablecimiento de contraseña
   */
  requestPasswordReset(email: string): Promise<void>;

  /**
   * Restablece la contraseña con un token
   */
  resetPassword(token: string, newPassword: string): Promise<void>;
}
