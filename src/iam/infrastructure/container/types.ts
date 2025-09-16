/**
 * Símbolos de Inversify para el bounded context IAM
 */
export const IAM_TYPES = {
  // Repositories
  UserRepository: Symbol.for('UserRepository'),
  AuthSessionRepository: Symbol.for('AuthSessionRepository'),
  
  // Services
  AuthService: Symbol.for('AuthService'),
  PasswordService: Symbol.for('PasswordService'),
  AuthApiService: Symbol.for('AuthApiService'),
  
  // Use Cases
  AuthUseCase: Symbol.for('AuthUseCase'),
} as const;

export type IamTypes = typeof IAM_TYPES;
