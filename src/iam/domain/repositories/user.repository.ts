import { UserEntity } from '../entities/user.entity';

/**
 * Interfaz del repositorio de usuarios
 */
export interface UserRepository {
  /**
   * Guarda un usuario
   */
  save(user: UserEntity): Promise<void>;

  /**
   * Busca un usuario por ID
   */
  findById(id: string): Promise<UserEntity | null>;

  /**
   * Busca un usuario por email
   */
  findByEmail(email: string): Promise<UserEntity | null>;

  /**
   * Busca un usuario por username
   */
  findByUsername(username: string): Promise<UserEntity | null>;

  /**
   * Obtiene todos los usuarios
   */
  findAll(): Promise<UserEntity[]>;

  /**
   * Elimina un usuario
   */
  delete(id: string): Promise<void>;

  /**
   * Verifica si existe un usuario con el email dado
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * Verifica si existe un usuario con el username dado
   */
  existsByUsername(username: string): Promise<boolean>;
}
