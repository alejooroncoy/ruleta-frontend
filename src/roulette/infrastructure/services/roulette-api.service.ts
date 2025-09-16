import { HttpService, HttpError } from '../../../shared/infrastructure/services/http.service';
import { configService } from '../../../shared/infrastructure/services/config.service';

/**
 * Servicio para comunicación con la API de la ruleta
 * Maneja todas las peticiones relacionadas con el juego
 */
export class RouletteApiService extends HttpService {
  private static instance: RouletteApiService;
  
  private constructor() {
    super();
  }
  
  public static getInstance(): RouletteApiService {
    if (!RouletteApiService.instance) {
      RouletteApiService.instance = new RouletteApiService();
    }
    return RouletteApiService.instance;
  }
  
  /**
   * Obtiene la URL base de la API de la ruleta
   */
  protected getApiBaseUrl(): string {
    return configService.getApiBaseUrl();
  }
  
  /**
   * Realiza una apuesta en la ruleta
   */
  public async placeBet(betData: {
    gameId: string;
    userUid: string;
    betType?: string;
    amount: number;
    number?: number;
    color?: string;
    evenOdd?: string;
  }): Promise<{
    betId: string;
    gameId: string;
    userUid: string;
    betType?: string;
    amount: number;
    number?: number;
    color?: string;
    evenOdd?: string;
    isWinning?: boolean;
    winningsAmount?: number;
    createdAt: string;
  }> {
    try {
      const response = await this.post<{
        betId: string;
        gameId: string;
        userUid: string;
        betType?: string;
        amount: number;
        number?: number;
        color?: string;
        evenOdd?: string;
        isWinning?: boolean;
        winningsAmount?: number;
        createdAt: string;
      }>('/api/v1/roulette/bet', betData);
      return response;
    } catch (error) {
      console.error('Error al realizar apuesta:', error);
      throw new HttpError(
        'Error al realizar la apuesta',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
  
  /**
   * Gira la ruleta y obtiene el resultado
   */
  public async spinRoulette(gameId: string): Promise<{
    gameId: string;
    winningNumber?: number;
    winningColor?: string;
    isCompleted: boolean;
    createdAt: string;
    completedAt?: string;
  }> {
    try {
      const response = await this.post<{
        gameId: string;
        winningNumber?: number;
        winningColor?: string;
        isCompleted: boolean;
        createdAt: string;
        completedAt?: string;
      }>('/api/v1/roulette/spin', { gameId });
      return response;
    } catch (error) {
      console.error('Error al girar la ruleta:', error);
      throw new HttpError(
        'Error al girar la ruleta',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
  
  /**
   * Obtiene el estado actual del juego
   */
  public async getGameState(gameId: string): Promise<{
    gameId: string;
    winningNumber?: number;
    winningColor?: string;
    isCompleted: boolean;
    createdAt: string;
    completedAt?: string;
  }> {
    try {
      const response = await this.get<{
        gameId: string;
        winningNumber?: number;
        winningColor?: string;
        isCompleted: boolean;
        createdAt: string;
        completedAt?: string;
      }>(`/api/v1/roulette/game/${gameId}`);
      return response;
    } catch (error) {
      console.error('Error al obtener estado del juego:', error);
      throw new HttpError(
        'Error al obtener estado del juego',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
  
  /**
   * Obtiene las apuestas de un juego específico
   */
  public async getGameBets(gameId: string): Promise<Array<{
    betId: string;
    gameId: string;
    userUid: string;
    betType?: string;
    amount: number;
    number?: number;
    color?: string;
    evenOdd?: string;
    isWinning?: boolean;
    winningsAmount?: number;
    createdAt: string;
  }>> {
    try {
      const response = await this.get<Array<{
        betId: string;
        gameId: string;
        userUid: string;
        betType?: string;
        amount: number;
        number?: number;
        color?: string;
        evenOdd?: string;
        isWinning?: boolean;
        winningsAmount?: number;
        createdAt: string;
      }>>(`/api/v1/roulette/game/${gameId}/bets`);
      return response;
    } catch (error) {
      console.error('Error al obtener apuestas del juego:', error);
      throw new HttpError(
        'Error al obtener apuestas del juego',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Calcula las ganancias de un juego
   */
  public async calculateWinnings(gameId: string): Promise<{
    totalBets: number;
    totalWinnings: number;
    netProfit: number;
    winningBets: number;
    totalBetsCount: number;
  }> {
    try {
      const response = await this.post<{
        totalBets: number;
        totalWinnings: number;
        netProfit: number;
        winningBets: number;
        totalBetsCount: number;
      }>(`/api/v1/roulette/game/${gameId}/calculate-winnings`, {});
      return response;
    } catch (error) {
      console.error('Error calculating winnings:', error);
      throw new HttpError(
        'Error calculating winnings',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Obtiene una apuesta específica por ID
   */
  public async getBetById(betId: string): Promise<{
    betId: string;
    gameId: string;
    userUid: string;
    betType?: string;
    amount: number;
    number?: number;
    color?: string;
    evenOdd?: string;
    isWinning?: boolean;
    winningsAmount?: number;
    createdAt: string;
  }> {
    try {
      const response = await this.get<{
        betId: string;
        gameId: string;
        userUid: string;
        betType?: string;
        amount: number;
        number?: number;
        color?: string;
        evenOdd?: string;
        isWinning?: boolean;
        winningsAmount?: number;
        createdAt: string;
      }>(`/api/v1/roulette/bet/${betId}`);
      return response;
    } catch (error) {
      console.error('Error al obtener apuesta:', error);
      throw new HttpError(
        'Error al obtener apuesta',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
  
  /**
   * Verifica la conexión con el backend
   * Nota: No hay endpoint de health en la API, usamos el endpoint de autenticación
   */
  public async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      // Intentamos hacer una petición simple para verificar la conexión
      const response = await this.get<{ status: string; timestamp: string }>('/api/v1/authentication');
      return response;
    } catch (error) {
      console.error('Error en health check:', error);
      throw new HttpError(
        'Error de conexión con el backend',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
}

// Exportar instancia singleton
export const rouletteApiService = RouletteApiService.getInstance();
