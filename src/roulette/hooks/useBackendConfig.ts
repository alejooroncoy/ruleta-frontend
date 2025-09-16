import { ref, computed } from 'vue';
import { configService } from '../../shared/infrastructure/services/config.service';

/**
 * Composable para manejar la configuración del backend
 * Proporciona reactividad para la configuración y métodos de utilidad
 */
export function useBackendConfig() {
  // Estado reactivo
  const isConnected = ref<boolean>(false);
  const connectionError = ref<string | null>(null);
  const isLoading = ref<boolean>(false);

  // Configuración computada
  const apiBaseUrl = computed(() => configService.getApiBaseUrl());
  const environment = computed(() => configService.getEnvironment());
  const isDevelopment = computed(() => configService.isDevelopment());
  const isProduction = computed(() => configService.isProduction());

  /**
   * Verifica la conexión con el backend
   */
  const checkConnection = async (): Promise<boolean> => {
    isLoading.value = true;
    connectionError.value = null;
    
    try {
      const response = await fetch(`${apiBaseUrl.value}/api/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        isConnected.value = true;
        return true;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      isConnected.value = false;
      connectionError.value = error instanceof Error ? error.message : 'Error desconocido';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Obtiene la URL completa de un endpoint
   */
  const getApiUrl = (endpoint: string): string => {
    return configService.getApiUrl(endpoint);
  };

  /**
   * Obtiene todas las configuraciones
   */
  const getAllConfig = () => {
    return configService.getAllConfig();
  };

  /**
   * Resetea el estado de conexión
   */
  const resetConnectionState = () => {
    isConnected.value = false;
    connectionError.value = null;
    isLoading.value = false;
  };

  return {
    // Estado
    isConnected,
    connectionError,
    isLoading,
    
    // Configuración
    apiBaseUrl,
    environment,
    isDevelopment,
    isProduction,
    
    // Métodos
    checkConnection,
    getApiUrl,
    getAllConfig,
    resetConnectionState,
  };
}
