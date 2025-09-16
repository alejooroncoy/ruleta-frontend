import { Container } from 'inversify';
import { ROULETTE_TYPES } from './types';

// Repositories
import type { PlayerRepository } from '../../domain/repositories/player.repository';
import { LocalStoragePlayerRepository } from '../repositories/localStoragePlayer.repository';
import { ApiPlayerRepository } from '../repositories/api-player.repository';

// Services
import type { GameService } from '../../domain/services/game.service';
import type { NotificationService } from '../../domain/services/notification.service';
import type { AuthService } from '../../../iam/domain/services/auth.service';
import { GameServiceImpl } from '../services/game.service';
import { NotificationServiceImpl } from '../services/notification.service';
import { RouletteApiService } from '../services/roulette-api.service';

// Use Cases
import { GameUseCase } from '../../application/game.usecase';

// Configuration
import { REPOSITORY_CONFIG, RepositoryType } from './repository.config';

/**
 * Configuración del contenedor de inyección de dependencies
 */
export const RouletteContainer = new Container();

// El SharedContainer se puede usar como referencia para servicios compartidos
// pero no necesitamos establecer parent-child relationship

// Configurar bindings
// Seleccionar repositorio basado en la configuración
if (REPOSITORY_CONFIG.type === RepositoryType.API) {
  // Configurar ApiPlayerRepository con la URL base
  RouletteContainer.bind<PlayerRepository>(ROULETTE_TYPES.PlayerRepository)
    .toDynamicValue(() => {
      const repository = new ApiPlayerRepository(REPOSITORY_CONFIG.apiBaseURL);
      return repository;
    })
    .inSingletonScope();
} else {
  RouletteContainer.bind<PlayerRepository>(ROULETTE_TYPES.PlayerRepository)
    .to(LocalStoragePlayerRepository)
    .inSingletonScope();
}

RouletteContainer.bind<GameService>(ROULETTE_TYPES.GameService)
  .to(GameServiceImpl)
  .inSingletonScope();

RouletteContainer.bind<NotificationService>(ROULETTE_TYPES.NotificationService)
  .to(NotificationServiceImpl)
  .inSingletonScope();

RouletteContainer.bind<RouletteApiService>(ROULETTE_TYPES.RouletteApiService)
  .toDynamicValue(() => RouletteApiService.getInstance())
  .inSingletonScope();

// TODO: Implementar AuthService completo o usar el contenedor de IAM
RouletteContainer.bind<AuthService>(ROULETTE_TYPES.AuthService)
  .toDynamicValue(() => {
    // Temporal: crear una implementación mock hasta integrar completamente con IAM
    return {
      register: async () => { throw new Error('Not implemented'); },
      login: async () => { throw new Error('Not implemented'); },
      logout: async () => { throw new Error('Not implemented'); },
      refreshToken: async () => { throw new Error('Not implemented'); },
      validateToken: async () => { throw new Error('Not implemented'); },
      changePassword: async () => { throw new Error('Not implemented'); },
      requestPasswordReset: async () => { throw new Error('Not implemented'); },
      resetPassword: async () => { throw new Error('Not implemented'); }
    } as AuthService;
  })
  .inSingletonScope();

RouletteContainer.bind<GameUseCase>(ROULETTE_TYPES.GameUseCase)
  .to(GameUseCase)
  .inSingletonScope();

export { ROULETTE_TYPES };
