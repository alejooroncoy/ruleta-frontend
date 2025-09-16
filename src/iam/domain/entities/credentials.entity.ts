/**
 * Entidad para credenciales de autenticación
 */
export class CredentialsEntity {
  constructor(
    public readonly email: string,
    public readonly password: string
  ) {}

  /**
   * Valida el formato del email
   */
  isValidEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  /**
   * Valida la fortaleza de la contraseña
   */
  isValidPassword(): boolean {
    // Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(this.password);
  }

  /**
   * Valida las credenciales completas
   */
  isValid(): boolean {
    return this.isValidEmail() && this.isValidPassword();
  }

  /**
   * Obtiene los errores de validación
   */
  getValidationErrors(): string[] {
    const errors: string[] = [];

    if (!this.isValidEmail()) {
      errors.push('El email no tiene un formato válido');
    }

    if (!this.isValidPassword()) {
      errors.push('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');
    }

    return errors;
  }

  /**
   * Crea una copia de las credenciales
   */
  clone(): CredentialsEntity {
    return new CredentialsEntity(this.email, this.password);
  }
}
