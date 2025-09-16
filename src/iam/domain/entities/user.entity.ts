/**
 * Entidad de usuario para el sistema de autenticación
 */
export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly username: string,
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  /**
   * Verifica si el usuario está activo
   */
  isUserActive(): boolean {
    return this.isActive;
  }

  /**
   * Crea una copia del usuario con nuevos valores
   */
  clone(): UserEntity {
    return new UserEntity(
      this.id,
      this.email,
      this.username,
      this.isActive,
      this.createdAt,
      this.updatedAt
    );
  }

  /**
   * Actualiza la información del usuario
   */
  updateInfo(email: string, username: string): UserEntity {
    return new UserEntity(
      this.id,
      email,
      username,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Desactiva el usuario
   */
  deactivate(): UserEntity {
    return new UserEntity(
      this.id,
      this.email,
      this.username,
      false,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Activa el usuario
   */
  activate(): UserEntity {
    return new UserEntity(
      this.id,
      this.email,
      this.username,
      true,
      this.createdAt,
      new Date()
    );
  }
}
