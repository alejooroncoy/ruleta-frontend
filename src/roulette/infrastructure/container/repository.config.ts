/**
 * Configuración para seleccionar el tipo de repositorio
 */
export enum RepositoryType {
  LOCAL_STORAGE = 'localStorage',
  API = 'api'
}

import { configService } from '../../../shared/infrastructure/services/config.service';

/**
 * Configuración del repositorio
 * Cambiar este valor para alternar entre localStorage y API
 */
export const REPOSITORY_CONFIG = {
  type: RepositoryType.API as RepositoryType, // Cambiar a RepositoryType.LOCAL_STORAGE para usar localStorage
  apiBaseURL: configService.getApiBaseUrl(), // URL base de la API desde configuración
};
