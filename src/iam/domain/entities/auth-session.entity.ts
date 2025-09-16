/**
 * Entidad de sesión de autenticación
 */
export class AuthSessionEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly token: string,
    public readonly refreshToken: string,
    public readonly expiresAt: Date,
    public readonly createdAt: Date = new Date(),
    public readonly isActive: boolean = true
  ) {}

  /**
   * Verifica si la sesión está activa y no ha expirado
   */
  isValid(): boolean {
    return this.isActive && this.expiresAt > new Date();
  }

  /**
   * Verifica si la sesión ha expirado
   */
  isExpired(): boolean {
    return this.expiresAt <= new Date();
  }

  /**
   * Renueva la sesión con nuevos tokens
   */
  renew(newToken: string, newRefreshToken: string, newExpiresAt: Date): AuthSessionEntity {
    return new AuthSessionEntity(
      this.id,
      this.userId,
      newToken,
      newRefreshToken,
      newExpiresAt,
      this.createdAt,
      true
    );
  }

  /**
   * Invalida la sesión
   */
  invalidate(): AuthSessionEntity {
    return new AuthSessionEntity(
      this.id,
      this.userId,
      this.token,
      this.refreshToken,
      this.expiresAt,
      this.createdAt,
      false
    );
  }

  /**
   * Crea una copia de la sesión
   */
  clone(): AuthSessionEntity {
    return new AuthSessionEntity(
      this.id,
      this.userId,
      this.token,
      this.refreshToken,
      this.expiresAt,
      this.createdAt,
      this.isActive
    );
  }
}
