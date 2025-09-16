/**
 * Símbolos de Inversify para servicios compartidos
 */
export const SHARED_TYPES = {
  // HTTP Services
  HttpService: Symbol.for('HttpService'),
} as const;

export type SharedTypes = typeof SHARED_TYPES;
