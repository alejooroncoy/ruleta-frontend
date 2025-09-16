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
  register(name: string, balance: number): Promise<UserEntity>;

  /**
   * Autentica un usuario con credenciales
   */
  login(name: string): Promise<{ user: UserEntity; session: AuthSessionEntity }>;

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

}
