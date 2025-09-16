/**
 * Interfaz del servicio de contraseñas
 */
export interface PasswordService {
  /**
   * Hashea una contraseña
   */
  hash(password: string): Promise<string>;

  /**
   * Verifica una contraseña contra su hash
   */
  verify(password: string, hash: string): Promise<boolean>;

  /**
   * Valida la fortaleza de una contraseña
   */
  validateStrength(password: string): boolean;

  /**
   * Obtiene los errores de validación de la contraseña
   */
  getValidationErrors(password: string): string[];
}
