/**
 * Interfaz del servicio de dominio para manejar notificaciones al usuario
 */
export interface NotificationService {
  /**
   * Muestra una notificación de éxito
   */
  showSuccess(message: string): void;

  /**
   * Muestra una notificación de error
   */
  showError(message: string): void;

  /**
   * Muestra una notificación de información
   */
  showInfo(message: string): void;

  /**
   * Muestra una notificación de advertencia
   */
  showWarning(message: string): void;
}
