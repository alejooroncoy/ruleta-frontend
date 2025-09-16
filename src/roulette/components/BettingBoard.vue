<template>
  <section class="betting-board">
    <header class="betting-board__header">
      <h3 class="betting-board__title">Tablero de Apuestas</h3>
      <div class="betting-board__controls">
        <div class="betting-board__amount">
          <label class="betting-board__amount-label">Monto:</label>
          <input
            v-model.number="localBetAmount"
            type="number"
            class="betting-board__amount-input"
            min="0.01"
            :max="playerBalance"
            step="0.01"
            :disabled="!canPlaceBet"
          />
        </div>
        <button 
          @click="handlePlaceBet" 
          class="btn btn--primary"
          :disabled="!canPlaceBet || !hasSelectedBet"
        >
          Apostar ${{ Number(localBetAmount).toFixed(2) }}
        </button>
      </div>
    </header>
    
    <div class="betting-board__content">
      <!-- Tablero principal con números 0-36 -->
      <div class="betting-board__main">
        <!-- Columna del 0 -->
        <div class="betting-board__zero-column">
          <div 
            class="betting-board__cell betting-board__cell--zero"
            :class="{ 'betting-board__cell--selected': selectedBets.includes('0') }"
            @click="toggleBet('0')"
          >
            <span class="betting-board__cell-number">0</span>
          </div>
        </div>
        
        <!-- Grid de números 1-36 -->
        <div class="betting-board__numbers-grid">
          <div 
            v-for="number in numbers1to36" 
            :key="number.value"
            class="betting-board__cell"
            :class="[
              `betting-board__cell--${number.color}`,
              { 'betting-board__cell--selected': selectedBets.includes(number.value.toString()) }
            ]"
            @click="toggleBet(number.value.toString())"
          >
            <span class="betting-board__cell-number">{{ number.value }}</span>
          </div>
        </div>
        
        <!-- Columns 2:1 -->
        <div class="betting-board__columns">
          <div 
            class="betting-board__cell betting-board__cell--column"
            :class="{ 'betting-board__cell--selected': selectedBets.includes('column1') }"
            @click="toggleBet('column1')"
          >
            <span class="betting-board__cell-text">2:1</span>
          </div>
          <div 
            class="betting-board__cell betting-board__cell--column"
            :class="{ 'betting-board__cell--selected': selectedBets.includes('column2') }"
            @click="toggleBet('column2')"
          >
            <span class="betting-board__cell-text">2:1</span>
          </div>
          <div 
            class="betting-board__cell betting-board__cell--column"
            :class="{ 'betting-board__cell--selected': selectedBets.includes('column3') }"
            @click="toggleBet('column3')"
          >
            <span class="betting-board__cell-text">2:1</span>
          </div>
        </div>
      </div>

      <!-- Apuestas externas -->
      <div class="betting-board__outside">
        <!-- Docenas -->
        <div class="betting-board__dozens">
          <div 
            class="betting-board__cell betting-board__cell--dozen"
            :class="{ 'betting-board__cell--selected': selectedBets.includes('dozen1') }"
            @click="toggleBet('dozen1')"
          >
            <span class="betting-board__cell-text">1era 12</span>
          </div>
          <div 
            class="betting-board__cell betting-board__cell--dozen"
            :class="{ 'betting-board__cell--selected': selectedBets.includes('dozen2') }"
            @click="toggleBet('dozen2')"
          >
            <span class="betting-board__cell-text">2nda 12</span>
          </div>
          <div 
            class="betting-board__cell betting-board__cell--dozen"
            :class="{ 'betting-board__cell--selected': selectedBets.includes('dozen3') }"
            @click="toggleBet('dozen3')"
          >
            <span class="betting-board__cell-text">3era 12</span>
          </div>
        </div>
        
        <!-- Apuestas de color y paridad -->
        <div class="betting-board__bottom">
          <div 
            class="betting-board__cell betting-board__cell--range"
            :class="{ 'betting-board__cell--selected': selectedBets.includes('low') }"
            @click="toggleBet('low')"
          >
            <span class="betting-board__cell-text">1 - 18</span>
          </div>
          <div 
            class="betting-board__cell betting-board__cell--parity"
            :class="{ 'betting-board__cell--selected': selectedBets.includes('even') }"
            @click="toggleBet('even')"
          >
            <span class="betting-board__cell-text">Par</span>
          </div>
          <div 
            class="betting-board__cell betting-board__cell--red"
            :class="{ 'betting-board__cell--selected': selectedBets.includes('red') }"
            @click="toggleBet('red')"
          >
            <span class="betting-board__cell-text">Rojo</span>
          </div>
          <div 
            class="betting-board__cell betting-board__cell--black"
            :class="{ 'betting-board__cell--selected': selectedBets.includes('black') }"
            @click="toggleBet('black')"
          >
            <span class="betting-board__cell-text">Negro</span>
          </div>
          <div 
            class="betting-board__cell betting-board__cell--parity"
            :class="{ 'betting-board__cell--selected': selectedBets.includes('odd') }"
            @click="toggleBet('odd')"
          >
            <span class="betting-board__cell-text">Impar</span>
          </div>
          <div 
            class="betting-board__cell betting-board__cell--range"
            :class="{ 'betting-board__cell--selected': selectedBets.includes('high') }"
            @click="toggleBet('high')"
          >
            <span class="betting-board__cell-text">19 - 36</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { BetType } from '../domain/entities/roulette.entity';

// Props
interface Props {
  playerBalance: number;
  canPlaceBet: boolean;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'place-bet': [bets: Array<{type: BetType, value: string | number, amount: number}>];
}>();

// Estado local
const localBetAmount = ref<number>(1);
const selectedBets = ref<string[]>([]);

// Números 1-36 para el tablero de apuestas (ordenados por filas)
const numbers1to36 = [
  // Primera fila (3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36)
  { value: 3, color: 'red' },
  { value: 6, color: 'black' },
  { value: 9, color: 'red' },
  { value: 12, color: 'red' },
  { value: 15, color: 'black' },
  { value: 18, color: 'red' },
  { value: 21, color: 'red' },
  { value: 24, color: 'black' },
  { value: 27, color: 'red' },
  { value: 30, color: 'red' },
  { value: 33, color: 'black' },
  { value: 36, color: 'red' },
  // Segunda fila (2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35)
  { value: 2, color: 'black' },
  { value: 5, color: 'red' },
  { value: 8, color: 'black' },
  { value: 11, color: 'black' },
  { value: 14, color: 'red' },
  { value: 17, color: 'black' },
  { value: 20, color: 'black' },
  { value: 23, color: 'red' },
  { value: 26, color: 'black' },
  { value: 29, color: 'black' },
  { value: 32, color: 'red' },
  { value: 35, color: 'black' },
  // Tercera fila (1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34)
  { value: 1, color: 'red' },
  { value: 4, color: 'black' },
  { value: 7, color: 'red' },
  { value: 10, color: 'black' },
  { value: 13, color: 'black' },
  { value: 16, color: 'red' },
  { value: 19, color: 'red' },
  { value: 22, color: 'black' },
  { value: 25, color: 'red' },
  { value: 28, color: 'black' },
  { value: 31, color: 'black' },
  { value: 34, color: 'red' }
];

// Computed
const hasSelectedBet = computed(() => {
  return selectedBets.value.length > 0 && localBetAmount.value > 0;
});

// Métodos
const toggleBet = (betId: string) => {
  if (!props.canPlaceBet) return;
  
  const index = selectedBets.value.indexOf(betId);
  if (index > -1) {
    selectedBets.value.splice(index, 1);
  } else {
    selectedBets.value.push(betId);
  }
};

const processBoardBets = () => {
  const bets: Array<{type: BetType, value: string | number, amount: number}> = [];
  const amount = Number(localBetAmount.value);
  
  selectedBets.value.forEach(betId => {
    switch (betId) {
      case '0':
        bets.push({ type: 'specific_number', value: 0, amount });
        break;
      case 'red':
        bets.push({ type: 'color', value: 'red', amount });
        break;
      case 'black':
        bets.push({ type: 'color', value: 'black', amount });
        break;
      case 'even':
        bets.push({ type: 'even_odd', value: 'even', amount });
        break;
      case 'odd':
        bets.push({ type: 'even_odd', value: 'odd', amount });
        break;
      case 'low':
        // Apuesta en números bajos (1-18)
        for (let i = 1; i <= 18; i++) {
          bets.push({ type: 'specific_number', value: i, amount: amount / 18 });
        }
        break;
      case 'high':
        // Apuesta en números altos (19-36)
        for (let i = 19; i <= 36; i++) {
          bets.push({ type: 'specific_number', value: i, amount: amount / 18 });
        }
        break;
      case 'dozen1':
        // Primera docena (1-12)
        for (let i = 1; i <= 12; i++) {
          bets.push({ type: 'specific_number', value: i, amount: amount / 12 });
        }
        break;
      case 'dozen2':
        // Segunda docena (13-24)
        for (let i = 13; i <= 24; i++) {
          bets.push({ type: 'specific_number', value: i, amount: amount / 12 });
        }
        break;
      case 'dozen3':
        // Tercera docena (25-36)
        for (let i = 25; i <= 36; i++) {
          bets.push({ type: 'specific_number', value: i, amount: amount / 12 });
        }
        break;
      case 'column1':
        // Primera columna (3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36)
        const column1Numbers = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
        column1Numbers.forEach(num => {
          bets.push({ type: 'specific_number', value: num, amount: amount / 12 });
        });
        break;
      case 'column2':
        // Segunda columna (2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35)
        const column2Numbers = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
        column2Numbers.forEach(num => {
          bets.push({ type: 'specific_number', value: num, amount: amount / 12 });
        });
        break;
      case 'column3':
        // Tercera columna (1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34)
        const column3Numbers = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
        column3Numbers.forEach(num => {
          bets.push({ type: 'specific_number', value: num, amount: amount / 12 });
        });
        break;
      default:
        // Números individual
        if (!isNaN(Number(betId))) {
          bets.push({ type: 'specific_number', value: Number(betId), amount });
        }
        break;
    }
  });
  
  return bets;
};

const handlePlaceBet = () => {
  if (!hasSelectedBet.value) return;
  
  const bets = processBoardBets();
  emit('place-bet', bets);
  
  // Limpiar apuestas seleccionadas
  selectedBets.value = [];
  localBetAmount.value = 1;
};
</script>

<style scoped>
/* Tablero de apuestas */
.betting-board {
  background: var(--color-background-primary);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-lg);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.betting-board__header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

@media (min-width: 768px) {
  .betting-board__header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.betting-board__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.betting-board__controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  width: 100%;
}

@media (min-width: 480px) {
  .betting-board__controls {
    flex-direction: row;
    align-items: center;
    width: auto;
  }
}

.betting-board__amount {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  width: 100%;
}

@media (min-width: 480px) {
  .betting-board__amount {
    flex-direction: row;
    align-items: center;
    width: auto;
  }
}

.betting-board__amount-label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.betting-board__amount-input {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
}

@media (min-width: 480px) {
  .betting-board__amount-input {
    width: 120px;
  }
}

.betting-board__content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.betting-board__main {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  align-items: center;
}

@media (min-width: 768px) {
  .betting-board__main {
    flex-direction: row;
    gap: var(--spacing-sm);
    align-items: flex-start;
  }
}

.betting-board__zero-column {
  display: flex;
  flex-direction: column;
}

.betting-board__numbers-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(6, 1fr);
  gap: var(--spacing-xs);
  flex: 1;
  max-width: 100%;
}

@media (min-width: 768px) {
  .betting-board__numbers-grid {
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: repeat(3, 1fr);
  }
}

.betting-board__columns {
  display: none;
}

@media (min-width: 768px) {
  .betting-board__columns {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }
}

.betting-board__outside {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.betting-board__dozens {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-sm);
}

@media (min-width: 480px) {
  .betting-board__dozens {
    grid-template-columns: repeat(3, 1fr);
  }
}

.betting-board__bottom {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
}

@media (min-width: 480px) {
  .betting-board__bottom {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 768px) {
  .betting-board__bottom {
    grid-template-columns: repeat(6, 1fr);
  }
}

.betting-board__cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 2.5rem;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: var(--font-weight-semibold);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
  padding: var(--spacing-xs);
}

.betting-board__cell:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.betting-board__cell--selected {
  border-color: #ffd700;
  box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.3);
}

.betting-board__cell--zero {
  background: #16a34a;
  color: white;
  min-height: 6rem;
  width: 3rem;
}

@media (min-width: 768px) {
  .betting-board__cell--zero {
    min-height: 9rem;
    width: 4rem;
  }
}

.betting-board__cell--red {
  background: #dc2626;
  color: white;
}

.betting-board__cell--black {
  background: #000000;
  color: white;
}

.betting-board__cell--column {
  background: #dc2626;
  color: white;
  min-height: 2.5rem;
  width: 3rem;
}

@media (min-width: 768px) {
  .betting-board__cell--column {
    min-height: 3rem;
    width: 4rem;
  }
}

.betting-board__cell--dozen {
  background: #000000;
  color: white;
  min-height: 2.5rem;
}

@media (min-width: 768px) {
  .betting-board__cell--dozen {
    min-height: 3rem;
  }
}

.betting-board__cell--range {
  background: #000000;
  color: white;
  min-height: 2.5rem;
}

.betting-board__cell--parity {
  background: #000000;
  color: white;
  min-height: 2.5rem;
}

@media (min-width: 768px) {
  .betting-board__cell--range,
  .betting-board__cell--parity {
    min-height: 3rem;
  }
}

.betting-board__cell-number {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
}

.betting-board__cell-text {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-align: center;
}

@media (min-width: 768px) {
  .betting-board__cell-number {
    font-size: var(--font-size-lg);
  }
  
  .betting-board__cell-text {
    font-size: var(--font-size-sm);
  }
}

/* Responsive adicional para desktop */
@media (min-width: 1024px) {
  .betting-board__cell {
    min-height: 3.5rem;
  }
  
  .betting-board__cell--zero {
    min-height: 10.5rem;
    width: 5rem;
  }
  
  .betting-board__cell--column {
    min-height: 3.5rem;
    width: 5rem;
  }
  
  .betting-board__cell-number {
    font-size: var(--font-size-xl);
  }
  
  .betting-board__cell-text {
    font-size: var(--font-size-base);
  }
}
</style>
