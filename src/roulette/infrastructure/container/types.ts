/**
 * Símbolos de Inversify para la inyección de dependencias
 */
export const ROULETTE_TYPES = {
  // Repositories
  PlayerRepository: Symbol.for('PlayerRepository'),
  
  // Services
  GameService: Symbol.for('GameService'),
  NotificationService: Symbol.for('NotificationService'),
  RouletteApiService: Symbol.for('RouletteApiService'),
  AuthService: Symbol.for('AuthService'),
  
  // Use Cases
  GameUseCase: Symbol.for('GameUseCase'),
} as const;

export type RouletteTypes = typeof ROULETTE_TYPES;
