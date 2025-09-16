/**
 * Servicio de configuración para manejar variables de entorno
 * Centraliza el acceso a las configuraciones de la aplicación
 */
export class ConfigService {
  private static instance: ConfigService;
  
  private constructor() {}
  
  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }
  
  /**
   * Obtiene la URL base de la API
   */
  public getApiBaseUrl(): string {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    
    if (!baseUrl) {
      console.warn('VITE_API_BASE_URL no está definida, usando URL por defecto');
      return 'http://localhost:5194';
    }
    
    return baseUrl;
  }
  
  /**
   * Obtiene el entorno de la aplicación
   */
  public getEnvironment(): string {
    return import.meta.env.VITE_APP_ENV || 'development';
  }
  
  /**
   * Verifica si estamos en modo desarrollo
   */
  public isDevelopment(): boolean {
    return this.getEnvironment() === 'development';
  }
  
  /**
   * Verifica si estamos en modo producción
   */
  public isProduction(): boolean {
    return this.getEnvironment() === 'production';
  }
  
  /**
   * Obtiene la URL completa de un endpoint
   */
  public getApiUrl(endpoint: string): string {
    const baseUrl = this.getApiBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
  }
  
  /**
   * Obtiene todas las configuraciones como objeto
   */
  public getAllConfig(): Record<string, string> {
    return {
      apiBaseUrl: this.getApiBaseUrl(),
      environment: this.getEnvironment(),
      isDevelopment: this.isDevelopment().toString(),
      isProduction: this.isProduction().toString()
    };
  }
}

// Exportar instancia singleton
export const configService = ConfigService.getInstance();
