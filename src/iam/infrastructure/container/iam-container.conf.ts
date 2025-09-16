import { Container } from 'inversify';
import { IAM_TYPES } from './types';
import { IAM_CONFIG } from './iam.config';

// Repositories
import type { UserRepository } from '../../domain/repositories/user.repository';
import type { AuthSessionRepository } from '../../domain/repositories/auth-session.repository';
import { ApiUserRepository } from '../repositories/api-user.repository';
import { ApiAuthSessionRepository } from '../repositories/api-auth-session.repository';

// Services
import type { AuthService } from '../../domain/services/auth.service';
import { ApiAuthService } from '../services/api-auth.service';
import { AuthApiService } from '../services/auth-api.service';

// Use Cases
import { AuthUseCase } from '../../application/auth.usecase';

/**
 * Configuración del contenedor de inyección de dependencias para IAM
 */
export const IamContainer = new Container();

// Configurar bindings de repositorios
IamContainer.bind<UserRepository>(IAM_TYPES.UserRepository)
  .toDynamicValue(() => {
    const repository = new ApiUserRepository(IAM_CONFIG.apiBaseURL);
    return repository;
  })
  .inSingletonScope();

IamContainer.bind<AuthSessionRepository>(IAM_TYPES.AuthSessionRepository)
  .toDynamicValue(() => {
    const repository = new ApiAuthSessionRepository(IAM_CONFIG.apiBaseURL);
    return repository;
  })
  .inSingletonScope();

// Configurar bindings de servicios
IamContainer.bind<AuthService>(IAM_TYPES.AuthService)
  .toDynamicValue(() => {
    const userRepository = IamContainer.get<UserRepository>(IAM_TYPES.UserRepository);
    const authSessionRepository = IamContainer.get<AuthSessionRepository>(IAM_TYPES.AuthSessionRepository);
    
    return new ApiAuthService(
      userRepository,
      authSessionRepository,
      IAM_CONFIG.apiBaseURL
    );
  })
  .inSingletonScope();

IamContainer.bind<AuthApiService>(IAM_TYPES.AuthApiService)
  .toDynamicValue(() => AuthApiService.getInstance())
  .inSingletonScope();

IamContainer.bind<AuthUseCase>(IAM_TYPES.AuthUseCase)
  .to(AuthUseCase)
  .inSingletonScope();

export { IAM_TYPES };
