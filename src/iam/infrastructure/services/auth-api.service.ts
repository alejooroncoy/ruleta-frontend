import { HttpService, HttpError } from '../../../shared/infrastructure/services/http.service';
import { configService } from '../../../shared/infrastructure/services/config.service';

/**
 * Servicio para comunicación con la API de autenticación
 * Maneja la autenticación y gestión de usuarios
 */
export class AuthApiService extends HttpService {
  private static instance: AuthApiService;
  
  private constructor() {
    super();
  }
  
  public static getInstance(): AuthApiService {
    if (!AuthApiService.instance) {
      AuthApiService.instance = new AuthApiService();
    }
    return AuthApiService.instance;
  }
  
  /**
   * Obtiene la URL base de la API de autenticación
   */
  protected getApiBaseUrl(): string {
    return configService.getApiBaseUrl();
  }
  
  /**
   * Registra un nuevo usuario
   */
  public async signUp(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<{
    uid: string;
    name?: string;
    balance: number;
    role?: string;
    status?: string;
    createdAt: string;
    updatedAt: string;
  }> {
    try {
      const response = await this.post<{
        uid: string;
        name?: string;
        balance: number;
        role?: string;
        status?: string;
        createdAt: string;
        updatedAt: string;
      }>('/api/v1/authentication/signup', userData);
      return response;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw new HttpError(
        'Error al registrar usuario',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
  
  /**
   * Inicia sesión de un usuario
   */
  public async signIn(credentials: {
    name: string;
  }): Promise<{
    uid: string;
    name?: string;
    balance: number;
    role?: string;
    status?: string;
    createdAt: string;
    updatedAt: string;
    token: string;
  }> {
    try {
      const response = await this.post<{
        uid: string;
        name?: string;
        balance: number;
        role?: string;
        status?: string;
        createdAt: string;
        updatedAt: string;
        token: string;
      }>('/api/v1/authentication/signin', credentials);
      return response;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw new HttpError(
        'Error al iniciar sesión',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
  
  /**
   * Obtiene información de un usuario por UID
   */
  public async getUserByUid(uid: string): Promise<{
    uid: string;
    name?: string;
    balance: number;
    role?: string;
    status?: string;
    createdAt: string;
    updatedAt: string;
  }> {
    try {
      const response = await this.get<{
        uid: string;
        name?: string;
        balance: number;
        role?: string;
        status?: string;
        createdAt: string;
        updatedAt: string;
      }>(`/api/v1/authentication/${uid}`);
      return response;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw new HttpError(
        'Error al obtener usuario',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
  
  /**
   * Obtiene información de un usuario por nombre
   */
  public async getUserByName(name: string): Promise<{
    uid: string;
    name?: string;
    balance: number;
    role?: string;
    status?: string;
    createdAt: string;
    updatedAt: string;
  }> {
    try {
      const response = await this.get<{
        uid: string;
        name?: string;
        balance: number;
        role?: string;
        status?: string;
        createdAt: string;
        updatedAt: string;
      }>(`/api/v1/authentication/name/${encodeURIComponent(name)}`);
      return response;
    } catch (error) {
      console.error('Error al obtener usuario por nombre:', error);
      if (error instanceof HttpError && error.status === 404) {
        throw new HttpError('Usuario no encontrado', 404);
      }
      throw new HttpError(
        'Error al obtener usuario por nombre',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
  
  /**
   * Actualiza el saldo de un usuario
   */
  public async updateUserBalance(uid: string, newBalance: number): Promise<{
    uid: string;
    name?: string;
    balance: number;
    role?: string;
    status?: string;
    createdAt: string;
    updatedAt: string;
  }> {
    try {
      const response = await this.put<{
        uid: string;
        name?: string;
        balance: number;
        role?: string;
        status?: string;
        createdAt: string;
        updatedAt: string;
      }>(`/api/v1/authentication/${uid}/balance`, { balance: newBalance });
      return response;
    } catch (error) {
      console.error('Error al actualizar saldo:', error);
      throw new HttpError(
        'Error al actualizar saldo',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Cierra la sesión del usuario (solo local, no hay API de logout)
   */
  public async logout(): Promise<void> {
    try {
      // No hay API de logout en el backend, solo limpiamos el estado local
      console.log('Logout local - no hay API de logout en el backend');
      // No hacemos llamada al backend, solo retornamos éxito
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw new HttpError(
        'Error al cerrar sesión',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
}

// Exportar instancia singleton
export const authApiService = AuthApiService.getInstance();
