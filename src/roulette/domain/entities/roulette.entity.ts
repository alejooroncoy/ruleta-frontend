/**
 * Entidad principal de la ruleta que maneja la lógica del juego
 */
export class RouletteEntity {
  private static readonly RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  private static readonly BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
  // private static readonly GREEN_NUMBERS = [0]; // No se usa actualmente

  /**
   * Genera un número aleatorio de la ruleta (0-36)
   */
  static generateNumber(): number {
    return Math.floor(Math.random() * 37);
  }

  /**
   * Determina el color de un número
   */
  static getNumberColor(number: number): 'red' | 'black' | 'green' {
    if (this.RED_NUMBERS.includes(number)) return 'red';
    if (this.BLACK_NUMBERS.includes(number)) return 'black';
    return 'green';
  }

  /**
   * Determina si un número es par
   */
  static isEven(number: number): boolean {
    return number !== 0 && number % 2 === 0;
  }

  /**
   * Determina si un número es impar
   */
  static isOdd(number: number): boolean {
    return number !== 0 && number % 2 === 1;
  }

  /**
   * Calcula el resultado de una apuesta
   */
  static calculateBetResult(
    betType: BetType,
    betValue: string | number,
    betAmount: number,
    resultNumber: number
  ): BetResult {
    const resultColor = this.getNumberColor(resultNumber);
    const isResultEven = this.isEven(resultNumber);
    const isResultOdd = this.isOdd(resultNumber);

    let won = false;
    let multiplier = 0;

    switch (betType) {
      case 'color':
        won = resultColor === betValue;
        multiplier = won ? 2 : 0;
        break;

      case 'even_odd':
        if (betValue === 'even') {
          won = isResultEven;
        } else if (betValue === 'odd') {
          won = isResultOdd;
        }
        multiplier = won ? 2 : 0;
        break;

      case 'color_even_odd':
        const [color, parity] = (betValue as string).split('_');
        const colorMatch = resultColor === color;
        const parityMatch = parity === 'even' ? isResultEven : isResultOdd;
        won = colorMatch && parityMatch;
        multiplier = won ? 4 : 0;
        break;

      case 'specific_number':
        won = resultNumber === betValue;
        multiplier = won ? 36 : 0;
        break;

      case 'number_color':
        const [number, colorValue] = (betValue as string).split('_');
        won = resultNumber === parseInt(number) && resultColor === colorValue;
        multiplier = won ? 36 : 0;
        break;
    }

    const winnings = betAmount * multiplier;
    const profit = winnings - betAmount;

    return {
      won,
      winnings,
      profit,
      multiplier,
      resultNumber,
      resultColor,
      isResultEven,
      isResultOdd
    };
  }
}

export type BetType = 'color' | 'even_odd' | 'color_even_odd' | 'specific_number' | 'number_color';

export interface BetResult {
  won: boolean;
  winnings: number;
  profit: number;
  multiplier: number;
  resultNumber: number;
  resultColor: 'red' | 'black' | 'green';
  isResultEven: boolean;
  isResultOdd: boolean;
}
