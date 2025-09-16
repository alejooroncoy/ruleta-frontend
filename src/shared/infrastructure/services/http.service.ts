import { configService } from './config.service';

/**
 * Servicio HTTP abstracto para comunicación con APIs
 * Proporciona métodos base para realizar peticiones HTTP
 */
export abstract class HttpService {
  protected baseURL: string;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || configService.getApiBaseUrl();
  }

  /**
   * Realiza una petición GET
   */
  public async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = this.buildURL(endpoint);
    const response = await this.makeRequest(url, {
      method: 'GET',
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * Realiza una petición POST
   */
  public async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const url = this.buildURL(endpoint);
    const response = await this.makeRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * Realiza una petición PUT
   */
  public async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const url = this.buildURL(endpoint);
    const response = await this.makeRequest(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * Realiza una petición DELETE
   */
  public async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = this.buildURL(endpoint);
    const response = await this.makeRequest(url, {
      method: 'DELETE',
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * Construye la URL completa
   */
  private buildURL(endpoint: string): string {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    
    const base = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    return `${base}${path}`;
  }

  /**
   * Realiza la petición HTTP
   */
  private async makeRequest(url: string, options: RequestInit): Promise<Response> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getDefaultHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new HttpError(
          `HTTP Error: ${response.status} ${response.statusText}`,
          response.status,
          response.statusText
        );
      }

      return response;
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(`Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 0);
    }
  }

  /**
   * Maneja la respuesta HTTP
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    const text = await response.text();
    return text as unknown as T;
  }

  /**
   * Obtiene los headers por defecto
   * Puede ser sobrescrito por implementaciones específicas
   */
  protected getDefaultHeaders(): Record<string, string> {
    return {
      'Accept': 'application/json',
    };
  }

  /**
   * Establece el token de autenticación
   */
  public setAuthToken(_token: string): void {
    // Implementación específica en las clases hijas
  }

  /**
   * Limpia el token de autenticación
   */
  public clearAuthToken(): void {
    // Implementación específica en las clases hijas
  }
}

/**
 * Error personalizado para errores HTTP
 */
export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText?: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
