/**
 * Entidad que representa una apuesta en la ruleta
 */
export class BetEntity {
  constructor(
    public readonly betId: string,
    public readonly gameId: string,
    public readonly userUid: string,
    public readonly amount: number,
    public readonly betType?: string,
    public readonly number?: number,
    public readonly color?: string,
    public readonly evenOdd?: string,
    public readonly isWinning?: boolean,
    public readonly winningsAmount?: number,
    public readonly createdAt: string = new Date().toISOString()
  ) {}

  /**
   * Crea una nueva instancia de BetEntity desde los datos de la API
   */
  static fromApiData(data: {
    betId: string;
    gameId: string;
    userUid: string;
    betType?: string;
    amount: number;
    number?: number;
    color?: string;
    evenOdd?: string;
    isWinning?: boolean;
    winningsAmount?: number;
    createdAt: string;
  }): BetEntity {
    return new BetEntity(
      data.betId,
      data.gameId,
      data.userUid,
      data.amount,
      data.betType,
      data.number,
      data.color,
      data.evenOdd,
      data.isWinning,
      data.winningsAmount,
      data.createdAt
    );
  }

  /**
   * Convierte la entidad a formato de API
   */
  toApiData(): {
    gameId: string;
    userUid: string;
    betType?: string;
    amount: number;
    number?: number;
    color?: string;
    evenOdd?: string;
  } {
    return {
      gameId: this.gameId,
      userUid: this.userUid,
      betType: this.betType,
      amount: this.amount,
      number: this.number,
      color: this.color,
      evenOdd: this.evenOdd
    };
  }

  /**
   * Verifica si la apuesta es ganadora
   */
  get isWinningBet(): boolean {
    return this.isWinning === true;
  }

  /**
   * Obtiene el monto de ganancias
   */
  get winnings(): number {
    return this.winningsAmount || 0;
  }

  /**
   * Obtiene el beneficio neto (ganancias - apuesta)
   */
  get netProfit(): number {
    return this.winnings - this.amount;
  }

  /**
   * Obtiene el multiplicador de la apuesta
   */
  get multiplier(): number {
    if (this.amount === 0) return 0;
    return this.winnings / this.amount;
  }

  /**
   * Obtiene una descripción legible de la apuesta
   */
  get description(): string {
    if (this.betType === 'number' && this.number !== undefined) {
      return `Número ${this.number}`;
    }
    if (this.betType === 'color' && this.color) {
      return `Color ${this.color}`;
    }
    if (this.betType === 'even_odd' && this.evenOdd) {
      return this.evenOdd === 'even' ? 'Par' : 'Impar';
    }
    return `Apuesta ${this.betType || 'desconocida'}`;
  }
}

/**
 * Tipo para los datos de creación de una apuesta
 */
export interface CreateBetData {
  gameId: string;
  userUid: string;
  betType?: string;
  amount: number;
  number?: number;
  color?: string;
  evenOdd?: string;
}

/**
 * Tipo para los datos de respuesta de una apuesta desde la API
 */
export interface BetApiResponse {
  betId: string;
  gameId: string;
  userUid: string;
  betType?: string;
  amount: number;
  number?: number;
  color?: string;
  evenOdd?: string;
  isWinning?: boolean;
  winningsAmount?: number;
  createdAt: string;
}
