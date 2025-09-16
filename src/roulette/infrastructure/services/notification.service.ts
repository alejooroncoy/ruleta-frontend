import { injectable } from 'inversify';
import type { NotificationService } from '../../domain/services/notification.service';

/**
 * Implementación concreta del servicio para manejar notificaciones al usuario
 */
@injectable()
export class NotificationServiceImpl implements NotificationService {
  /**
   * Muestra una notificación de éxito
   */
  showSuccess(message: string): void {
    // En una implementación real, esto podría usar un toast library
    console.log('✅ Éxito:', message);
    // Aquí podrías integrar con un sistema de notificaciones como vue-toastification
  }

  /**
   * Muestra una notificación de error
   */
  showError(message: string): void {
    // En una implementación real, esto podría usar un toast library
    console.error('❌ Error:', message);
    // Aquí podrías integrar con un sistema de notificaciones como vue-toastification
  }

  /**
   * Muestra una notificación de información
   */
  showInfo(message: string): void {
    // En una implementación real, esto podría usar un toast library
    console.info('ℹ️ Info:', message);
    // Aquí podrías integrar con un sistema de notificaciones como vue-toastification
  }

  /**
   * Muestra una notificación de advertencia
   */
  showWarning(message: string): void {
    // En una implementación real, esto podría usar un toast library
    console.warn('⚠️ Advertencia:', message);
    // Aquí podrías integrar con un sistema de notificaciones como vue-toastification
  }
}
