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
    console.log('✅ Éxito:', message);
    this.showToast('success', message, 'Éxito');
  }

  /**
   * Muestra una notificación de error
   */
  showError(message: string): void {
    console.error('❌ Error:', message);
    this.showToast('error', message, 'Error');
  }

  /**
   * Muestra una notificación de información
   */
  showInfo(message: string): void {
    console.info('ℹ️ Info:', message);
    this.showToast('info', message, 'Información');
  }

  /**
   * Muestra una notificación de advertencia
   */
  showWarning(message: string): void {
    console.warn('⚠️ Advertencia:', message);
    this.showToast('warning', message, 'Advertencia');
  }

  /**
   * Método privado para mostrar toasts
   */
  private showToast(type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string): void {
    // Verificar si el servicio de toast está disponible
    if (typeof window !== 'undefined' && (window as any).toastService) {
      const toastService = (window as any).toastService;
      
      switch (type) {
        case 'success':
          toastService.success(message, title);
          break;
        case 'error':
          toastService.error(message, title);
          break;
        case 'warning':
          toastService.warning(message, title);
          break;
        case 'info':
          toastService.info(message, title);
          break;
      }
    } else {
      // Fallback: mostrar en consola si no hay servicio de toast
      console.log(`[${type.toUpperCase()}] ${title ? title + ': ' : ''}${message}`);
    }
  }
}
