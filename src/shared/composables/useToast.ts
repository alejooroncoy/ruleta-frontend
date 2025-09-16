import { ref } from 'vue';

export interface ToastOptions {
  title?: string;
  duration?: number;
  closable?: boolean;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  closable?: boolean;
}

/**
 * Composable para manejar toasts de notificación
 */
export function useToast() {
  const toasts = ref<Toast[]>([]);
  const maxToasts = ref(5);

  /**
   * Genera un ID único para el toast
   */
  const generateId = (): string => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * Agrega un nuevo toast
   */
  const addToast = (
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    options: ToastOptions = {}
  ): string => {
    const id = generateId();
    const toast: Toast = {
      id,
      type,
      message,
      title: options.title,
      duration: options.duration ?? 5000,
      closable: options.closable ?? true
    };

    // Agregar al inicio del array
    toasts.value.unshift(toast);

    // Limitar el número máximo de toasts
    if (toasts.value.length > maxToasts.value) {
      toasts.value = toasts.value.slice(0, maxToasts.value);
    }

    return id;
  };

  /**
   * Remueve un toast por ID
   */
  const removeToast = (id: string): void => {
    const index = toasts.value.findIndex(toast => toast.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  /**
   * Limpia todos los toasts
   */
  const clearAllToasts = (): void => {
    toasts.value = [];
  };

  /**
   * Muestra un toast de éxito
   */
  const success = (message: string, options?: ToastOptions): string => {
    return addToast('success', message, options);
  };

  /**
   * Muestra un toast de error
   */
  const error = (message: string, options?: ToastOptions): string => {
    return addToast('error', message, { ...options, duration: options?.duration ?? 7000 });
  };

  /**
   * Muestra un toast de advertencia
   */
  const warning = (message: string, options?: ToastOptions): string => {
    return addToast('warning', message, options);
  };

  /**
   * Muestra un toast de información
   */
  const info = (message: string, options?: ToastOptions): string => {
    return addToast('info', message, options);
  };

  /**
   * Muestra un toast personalizado
   */
  const custom = (
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    options?: ToastOptions
  ): string => {
    return addToast(type, message, options);
  };

  return {
    // Estado
    toasts,
    maxToasts,
    
    // Métodos principales
    addToast,
    removeToast,
    clearAllToasts,
    
    // Métodos de conveniencia
    success,
    error,
    warning,
    info,
    custom
  };
}
