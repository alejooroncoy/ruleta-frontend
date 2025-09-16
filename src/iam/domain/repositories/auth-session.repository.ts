import { AuthSessionEntity } from '../entities/auth-session.entity';

/**
 * Interfaz del repositorio de sesiones de autenticación
 */
export interface AuthSessionRepository {
  /**
   * Guarda una sesión de autenticación
   */
  save(session: AuthSessionEntity): Promise<void>;

  /**
   * Busca una sesión por ID
   */
  findById(id: string): Promise<AuthSessionEntity | null>;

  /**
   * Busca una sesión por token
   */
  findByToken(token: string): Promise<AuthSessionEntity | null>;

  /**
   * Busca una sesión por refresh token
   */
  findByRefreshToken(refreshToken: string): Promise<AuthSessionEntity | null>;

  /**
   * Busca sesiones activas de un usuario
   */
  findActiveByUserId(userId: string): Promise<AuthSessionEntity[]>;

  /**
   * Elimina una sesión
   */
  delete(id: string): Promise<void>;

  /**
   * Elimina todas las sesiones de un usuario
   */
  deleteAllByUserId(userId: string): Promise<void>;

  /**
   * Elimina sesiones expiradas
   */
  deleteExpired(): Promise<void>;
}
