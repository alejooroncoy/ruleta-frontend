/**
 * Configuración para el bounded context IAM
 */
export const IAM_CONFIG = {
  // URL base del backend de autenticación
  apiBaseURL: 'http://localhost:3000',
  
  // Configuración de tokens
  tokenConfig: {
    accessTokenExpiryHours: 1,
    refreshTokenExpiryDays: 7,
  },
  
  // Configuración de contraseñas
  passwordConfig: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
  },
  
  // Configuración de sesiones
  sessionConfig: {
    maxConcurrentSessions: 3,
    autoRefreshThreshold: 5 * 60 * 1000, // 5 minutos antes de expirar
  }
} as const;
