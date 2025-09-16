<template>
  <section v-if="lastBetResult" class="results-panel">
    <header class="results-panel__header">
      <h3 class="results-panel__title">Resultado de la Apuesta</h3>
    </header>
    
    <div class="results-panel__content">
      <div class="result-summary" :class="{ 
        'result-summary--won': lastBetResult.won, 
        'result-summary--lost': !lastBetResult.won 
      }">
        <div class="result-summary__status">
          <span v-if="lastBetResult.won" class="result-summary__status-text result-summary__status-text--won">
            🎉 ¡GANASTE!
          </span>
          <span v-else class="result-summary__status-text result-summary__status-text--lost">
            😔 No ganaste
          </span>
        </div>
        
        <div class="result-summary__details">
          <div class="result-summary__info">
            <span class="result-summary__info-item">
              Número: <strong>{{ lastBetResult.resultNumber }}</strong>
            </span>
            <span class="result-summary__info-item">
              Color: <strong>{{ getColorName(lastBetResult.resultColor) }}</strong>
            </span>
            <span class="result-summary__info-item">
              Paridad: <strong>{{ getParityText(lastBetResult) }}</strong>
            </span>
          </div>
          
          <div class="result-summary__financial">
            <span class="result-summary__financial-item">
              Multiplicador: <strong>x{{ lastBetResult.multiplier }}</strong>
            </span>
            <span class="result-summary__financial-item">
              Ganancias: <strong>${{ lastBetResult.winnings.toFixed(2) }}</strong>
            </span>
            <span class="result-summary__financial-item">
              Beneficio: <strong>${{ lastBetResult.profit.toFixed(2) }}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BetResult } from '../domain/entities/roulette.entity';

// Props
interface Props {
  lastBetResult: BetResult | null;
}

defineProps<Props>();

// Métodos
const getColorName = (color: string) => {
  switch (color) {
    case 'red': return 'Rojo';
    case 'black': return 'Negro';
    case 'green': return 'Verde';
    default: return color;
  }
};

const getParityText = (result: BetResult) => {
  if (result.isResultEven) return 'Par';
  if (result.isResultOdd) return 'Impar';
  return 'Cero';
};
</script>

<style scoped>
/* Panel de resultados */
.results-panel {
  background: var(--color-background-primary);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-lg);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.results-panel__header {
  margin-bottom: var(--spacing-lg);
}

.results-panel__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

/* Resultados */
.result-summary {
  background: var(--color-background-secondary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  border: 2px solid transparent;
}

.result-summary--won {
  border-color: #4ade80;
  background: linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, rgba(74, 222, 128, 0.05) 100%);
}

.result-summary--lost {
  border-color: #f87171;
  background: linear-gradient(135deg, rgba(248, 113, 113, 0.1) 0%, rgba(248, 113, 113, 0.05) 100%);
}

.result-summary__status {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.result-summary__status-text {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
}

.result-summary__status-text--won {
  color: #4ade80;
  background: rgba(74, 222, 128, 0.1);
}

.result-summary__status-text--lost {
  color: #f87171;
  background: rgba(248, 113, 113, 0.1);
}

.result-summary__details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.result-summary__info,
.result-summary__financial {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.result-summary__info-item,
.result-summary__financial-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--border-radius-md);
}
</style>
