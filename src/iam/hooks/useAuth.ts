import { ref, computed } from 'vue';
import { AuthUseCase } from '../application/auth.usecase';
import { UserEntity } from '../domain/entities/user.entity';
import { AuthSessionEntity } from '../domain/entities/auth-session.entity';
import { IamContainer, IAM_TYPES } from '../infrastructure/container/iam-container.conf';

/**
 * Composable de Vue para manejar la autenticación
 */
export function useAuth() {
  // Obtener dependencias del contenedor de Inversify
  const authUseCase = IamContainer.get<AuthUseCase>(IAM_TYPES.AuthUseCase);

  // Estado local del composable
  const currentUser = ref<UserEntity | null>(null);
  const currentSession = ref<AuthSessionEntity | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters computados
  const isAuthenticated = computed(() => !!currentUser.value && !!currentSession.value);
  const isSessionValid = computed(() => currentSession.value?.isValid() ?? false);

  /**
   * Registra un nuevo usuario
   */
  const register = async (email: string, password: string, username: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      const { user, session } = await authUseCase.register(email, password, username);
      
      currentUser.value = user;
      currentSession.value = session;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Autentica un usuario
   */
  const login = async (email: string, password: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      const { user, session } = await authUseCase.login(email, password);
      
      currentUser.value = user;
      currentSession.value = session;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Cierra la sesión (solo local, no hay API de logout)
   */
  const logout = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      // Intentar logout en el backend (aunque no existe la API)
      if (currentSession.value) {
        try {
          await authUseCase.logout(currentSession.value.id);
        } catch (err) {
          // Si falla el logout del backend, continuamos con la limpieza local
          console.warn('Logout del backend falló, continuando con limpieza local:', err);
        }
      }
      
      // Siempre limpiamos el estado local
      currentUser.value = null;
      currentSession.value = null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido';
      // Aún así limpiamos el estado local
      currentUser.value = null;
      currentSession.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Refresca el token
   */
  const refreshToken = async () => {
    try {
      if (!currentSession.value) {
        throw new Error('No hay sesión activa');
      }

      const newSession = await authUseCase.refreshToken(currentSession.value.refreshToken);
      currentSession.value = newSession;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido';
      // Si falla el refresh, cerramos la sesión
      currentUser.value = null;
      currentSession.value = null;
      throw err;
    }
  };

  /**
   * Valida el token actual
   */
  const validateCurrentToken = async () => {
    try {
      if (!currentSession.value) {
        return false;
      }

      const user = await authUseCase.validateToken(currentSession.value.token);
      
      if (!user) {
        currentUser.value = null;
        currentSession.value = null;
        return false;
      }

      currentUser.value = user;
      return true;
    } catch (err) {
      currentUser.value = null;
      currentSession.value = null;
      return false;
    }
  };

  /**
   * Cambia la contraseña
   */
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!currentUser.value) {
        throw new Error('No hay usuario autenticado');
      }

      isLoading.value = true;
      error.value = null;

      await authUseCase.changePassword(currentUser.value.id, currentPassword, newPassword);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Solicita restablecimiento de contraseña
   */
  const requestPasswordReset = async (email: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      await authUseCase.requestPasswordReset(email);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Restablece la contraseña
   */
  const resetPassword = async (token: string, newPassword: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      await authUseCase.resetPassword(token, newPassword);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Limpia el error
   */
  const clearError = () => {
    error.value = null;
  };

  return {
    // Estado
    currentUser,
    currentSession,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    isSessionValid,
    
    // Acciones
    register,
    login,
    logout,
    refreshToken,
    validateCurrentToken,
    changePassword,
    requestPasswordReset,
    resetPassword,
    clearError
  };
}
