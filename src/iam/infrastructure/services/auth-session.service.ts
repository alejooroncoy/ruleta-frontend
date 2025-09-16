/**
 * Servicio para manejar la sesión de autenticación local
 * Guarda y recupera el token y información del usuario desde localStorage
 */
export class AuthSessionService {
  private static instance: AuthSessionService;
  private readonly STORAGE_KEY = 'roulette_auth_session';
  private readonly TOKEN_KEY = 'roulette_auth_token';
  private readonly USER_KEY = 'roulette_auth_user';

  private constructor() {}

  public static getInstance(): AuthSessionService {
    if (!AuthSessionService.instance) {
      AuthSessionService.instance = new AuthSessionService();
    }
    return AuthSessionService.instance;
  }

  /**
   * Guarda la información de la sesión
   */
  public saveSession(token: string, userData: {
    uid: string;
    name: string;
    balance: number;
  }): void {
    try {
      const sessionData = {
        token,
        user: userData,
        timestamp: Date.now()
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionData));
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error al guardar sesión:', error);
    }
  }

  /**
   * Obtiene el token de la sesión
   */
  public getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error al obtener token:', error);
      return null;
    }
  }

  /**
   * Obtiene la información del usuario de la sesión
   */
  public getUserData(): {
    uid: string;
    name: string;
    balance: number;
  } | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      return null;
    }
  }

  /**
   * Obtiene toda la información de la sesión
   */
  public getSession(): {
    token: string;
    user: {
      uid: string;
      name: string;
      balance: number;
    };
    timestamp: number;
  } | null {
    try {
      const sessionData = localStorage.getItem(this.STORAGE_KEY);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Error al obtener sesión:', error);
      return null;
    }
  }

  /**
   * Verifica si hay una sesión activa
   */
  public isLoggedIn(): boolean {
    const token = this.getToken();
    const userData = this.getUserData();
    return !!(token && userData);
  }

  /**
   * Actualiza el saldo del usuario en la sesión
   */
  public updateUserBalance(newBalance: number): void {
    try {
      const userData = this.getUserData();
      if (userData) {
        userData.balance = newBalance;
        localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
        
        // Actualizar también en la sesión completa
        const sessionData = this.getSession();
        if (sessionData) {
          sessionData.user.balance = newBalance;
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionData));
        }
      }
    } catch (error) {
      console.error('Error al actualizar saldo:', error);
    }
  }

  /**
   * Limpia la sesión
   */
  public clearSession(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Error al limpiar sesión:', error);
    }
  }

  /**
   * Verifica si la sesión ha expirado (opcional, basado en timestamp)
   */
  public isSessionExpired(maxAgeHours: number = 24): boolean {
    try {
      const sessionData = this.getSession();
      if (!sessionData) return true;
      
      const now = Date.now();
      const sessionAge = now - sessionData.timestamp;
      const maxAge = maxAgeHours * 60 * 60 * 1000; // Convertir horas a milisegundos
      
      return sessionAge > maxAge;
    } catch (error) {
      console.error('Error al verificar expiración de sesión:', error);
      return true;
    }
  }
}

// Exportar instancia singleton
export const authSessionService = AuthSessionService.getInstance();
