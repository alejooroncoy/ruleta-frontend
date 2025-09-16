import { Container } from 'inversify';
import { SHARED_TYPES } from './types';

/**
 * Configuración del contenedor de servicios compartidos
 * Nota: HttpService se configura directamente en los bounded contexts que lo necesiten
 */
export const SharedContainer = new Container();

export { SHARED_TYPES };
