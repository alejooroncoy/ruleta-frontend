/**
 * Entidad del jugador que maneja el saldo y las apuestas
 */
export class PlayerEntity {
  public readonly name: string;
  public balance: number;
  public readonly uid: string;

  constructor(name: string, balance: number, uid: string) {
    this.name = name;
    this.balance = balance;
    this.uid = uid;
  }

  /**
   * Verifica si el jugador tiene suficiente saldo para apostar
   */
  canBet(amount: number): boolean {
    return this.balance >= amount;
  }

  /**
   * Realiza una apuesta (reduce el saldo)
   */
  placeBet(amount: number): void {
    if (!this.canBet(amount)) {
      throw new Error('Saldo insuficiente para realizar la apuesta');
    }
    this.balance -= amount;
  }

  /**
   * Añade ganancias al saldo
   */
  addWinnings(amount: number): void {
    this.balance += amount;
  }

  /**
   * Actualiza el saldo del jugador
   */
  updateBalance(newBalance: number): void {
    if (newBalance < 0) {
      throw new Error('El saldo no puede ser negativo');
    }
    this.balance = newBalance;
  }

  /**
   * Crea una copia del jugador
   */
  clone(): PlayerEntity {
    return new PlayerEntity(this.name, this.balance, this.uid);
  }
}
