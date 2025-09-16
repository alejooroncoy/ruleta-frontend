<template>
  <div class="roulette-container">
    <!-- Indicador fijo -->
    <div class="roulette-indicator">
      <div class="roulette-indicator__arrow"></div>
    </div>

    <!-- Ruleta principal -->
    <div 
      class="roulette-wheel" 
      ref="rouletteWheel" 
      :class="{ 'roulette-wheel--spinning': isSpinning }"
    >
      <!-- Números de la ruleta -->
      <div class="roulette-numbers">
        <div 
          v-for="(number, index) in rouletteNumbers" 
          :key="number.value"
          class="roulette-number"
          :style="{ transform: `rotate(${index * 9.73}deg)` }"
        >
          <span 
            class="roulette-number__text"
            :class="`roulette-number__text--${number.color}`"
            :style="{ transform: `rotate(${-index * 9.73}deg)` }"
          >
            {{ number.value }}
          </span>
        </div>
      </div>

      <!-- Centro de la ruleta -->
      <div class="roulette-center">
        <div v-if="lastBetResult" class="roulette-result">
          <div class="roulette-result__number roulette-result__number--3d">{{ lastBetResult.resultNumber }}</div>
          <div class="roulette-result__details">
            <span 
              class="roulette-result__color" 
              :class="`roulette-result__color--${lastBetResult.resultColor}`"
            >
              {{ getColorName(lastBetResult.resultColor) }}
            </span>
            <span class="roulette-result__parity">
              {{ lastBetResult.isResultEven ? 'Par' : lastBetResult.isResultOdd ? 'Impar' : 'Cero' }}
            </span>
          </div>
        </div>
        <div v-else class="roulette-waiting">
          <div class="roulette-waiting__icon">🎰</div>
        </div>
      </div>

      <!-- Aviso del número ganador con efecto 3D -->
      <div v-if="lastBetResult" class="winner-notification">
        <div class="winner-notification__content">
          <div class="winner-notification__number">{{ lastBetResult.resultNumber }}</div>
          <div class="winner-notification__text">¡GANADOR!</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { BetResult } from '../domain/entities/roulette.entity';

// Props
interface Props {
  isSpinning: boolean;
  lastBetResult?: BetResult | null;
}

defineProps<Props>();

// Emits (definido pero no usado directamente en este componente)
// const emit = defineEmits<{
//   spin: [];
// }>();

// Referencias
const rouletteWheel = ref<HTMLElement>();

// Números de la ruleta en orden correcto (ruleta europea)
const rouletteNumbers = [
  { value: 0, color: 'green' },
  { value: 32, color: 'red' },
  { value: 15, color: 'black' },
  { value: 19, color: 'red' },
  { value: 4, color: 'black' },
  { value: 21, color: 'red' },
  { value: 2, color: 'black' },
  { value: 25, color: 'red' },
  { value: 17, color: 'black' },
  { value: 34, color: 'red' },
  { value: 6, color: 'black' },
  { value: 27, color: 'red' },
  { value: 13, color: 'black' },
  { value: 36, color: 'red' },
  { value: 11, color: 'black' },
  { value: 30, color: 'red' },
  { value: 8, color: 'black' },
  { value: 23, color: 'red' },
  { value: 10, color: 'black' },
  { value: 5, color: 'red' },
  { value: 24, color: 'black' },
  { value: 16, color: 'red' },
  { value: 33, color: 'black' },
  { value: 1, color: 'red' },
  { value: 20, color: 'black' },
  { value: 14, color: 'red' },
  { value: 31, color: 'black' },
  { value: 9, color: 'red' },
  { value: 22, color: 'black' },
  { value: 18, color: 'red' },
  { value: 29, color: 'black' },
  { value: 7, color: 'red' },
  { value: 28, color: 'black' },
  { value: 12, color: 'red' },
  { value: 35, color: 'black' },
  { value: 3, color: 'red' },
  { value: 26, color: 'black' }
];

// Métodos
const getColorName = (color: string) => {
  switch (color) {
    case 'red': return 'Rojo';
    case 'black': return 'Negro';
    case 'green': return 'Verde';
    default: return color;
  }
};

// Función para emitir evento de giro (no se usa directamente en este componente)
// const handleSpin = () => {
//   emit('spin');
// };
</script>

<style scoped>
/* Contenedor de la ruleta */
.roulette-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto var(--spacing-lg);
}

/* Indicador fijo */
.roulette-indicator {
  position: absolute;
  top: -1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  pointer-events: none;
}

.roulette-indicator__arrow {
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-top: 20px solid #ffd700;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

/* Ruleta principal */
.roulette-wheel {
  width: 16rem; /* 256px */
  height: 16rem; /* 256px */
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    #16a34a 0deg 9.73deg,
    #dc2626 9.73deg 19.46deg,
    #000000 19.46deg 29.19deg,
    #dc2626 29.19deg 38.92deg,
    #000000 38.92deg 48.65deg,
    #dc2626 48.65deg 58.38deg,
    #000000 58.38deg 68.11deg,
    #dc2626 68.11deg 77.84deg,
    #000000 77.84deg 87.57deg,
    #dc2626 87.57deg 97.3deg,
    #000000 97.3deg 107.03deg,
    #dc2626 107.03deg 116.76deg,
    #000000 116.76deg 126.49deg,
    #dc2626 126.49deg 136.22deg,
    #000000 136.22deg 145.95deg,
    #dc2626 145.95deg 155.68deg,
    #000000 155.68deg 165.41deg,
    #dc2626 165.41deg 175.14deg,
    #000000 175.14deg 184.87deg,
    #dc2626 184.87deg 194.6deg,
    #000000 194.6deg 204.33deg,
    #dc2626 204.33deg 214.06deg,
    #000000 214.06deg 223.79deg,
    #dc2626 223.79deg 233.52deg,
    #000000 233.52deg 243.25deg,
    #dc2626 243.25deg 252.98deg,
    #000000 252.98deg 262.71deg,
    #dc2626 262.71deg 272.44deg,
    #000000 272.44deg 282.17deg,
    #dc2626 282.17deg 291.9deg,
    #000000 291.9deg 301.63deg,
    #dc2626 301.63deg 311.36deg,
    #000000 311.36deg 321.09deg,
    #dc2626 321.09deg 330.82deg,
    #000000 330.82deg 340.55deg,
    #dc2626 340.55deg 350.28deg,
    #000000 350.28deg 360deg
  );
  position: relative;
  box-shadow: 
    0 0 20px rgba(0, 0, 0, 0.3),
    inset 0 0 10px rgba(255, 255, 255, 0.1);
  border: 3px solid #ffd700;
  transition: transform 4s ease-out;
}

.roulette-wheel--spinning {
  animation: spin 4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Números de la ruleta */
.roulette-numbers {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.roulette-number {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8rem;
  height: 8rem;
  margin-left: -4rem;
  margin-top: -4rem;
  transform-origin: center center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.roulette-number__text {
  font-size: 0.6rem;
  font-weight: 900;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  border-radius: 50%;
  width: 1.4rem;
  height: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  top: -2.6rem;
}

.roulette-number__text--red {
  background: rgba(220, 38, 38, 0.9);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.roulette-number__text--black {
  background: rgba(0, 0, 0, 0.9);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.roulette-number__text--green {
  background: rgba(22, 163, 74, 0.9);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

/* Centro de la ruleta */
.roulette-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 3.5rem; /* 56px - más pequeño */
  height: 3.5rem; /* 56px - más pequeño */
  border-radius: 50%;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(0, 0, 0, 0.15) 100%
  );
  box-shadow: 
    0 6px 20px rgba(0, 0, 0, 0.4),
    inset 0 2px 4px rgba(255, 255, 255, 0.3),
    inset 0 -2px 4px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(15px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  transform-style: preserve-3d;
  perspective: 1000px;
}

.roulette-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.roulette-result__number {
  font-size: 1rem; /* Reducido para el centro más pequeño */
  font-weight: 900;
  color: #ffd700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

.roulette-result__number--3d {
  transform: translateZ(20px);
  animation: numberGlow 2s ease-in-out infinite alternate;
}

.roulette-result__details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
}

.roulette-result__color {
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.roulette-result__color--red {
  background: rgba(220, 38, 38, 0.8);
  color: white;
}

.roulette-result__color--black {
  background: rgba(0, 0, 0, 0.8);
  color: white;
}

.roulette-result__color--green {
  background: rgba(22, 163, 74, 0.8);
  color: white;
}

.roulette-result__parity {
  font-size: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.roulette-waiting {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.roulette-waiting__icon {
  font-size: 1.5rem;
  animation: bounce 2s infinite;
}

.roulette-waiting__text {
  font-size: 0.5rem; /* Reducido para el centro más pequeño */
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  text-align: center;
}

/* Aviso del número ganador con efecto 3D */
.winner-notification {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  pointer-events: none;
  animation: winnerPop 3s ease-out forwards;
}

.winner-notification__content {
  background: linear-gradient(135deg, 
    rgba(255, 215, 0, 0.95) 0%,
    rgba(255, 193, 7, 0.95) 50%,
    rgba(255, 152, 0, 0.95) 100%
  );
  border-radius: 50%;
  width: 8rem;
  height: 8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.8),
    0 0 60px rgba(255, 215, 0, 0.4),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
  border: 3px solid rgba(255, 255, 255, 0.5);
  transform-style: preserve-3d;
  perspective: 1000px;
}

.winner-notification__number {
  font-size: 2.5rem;
  font-weight: 900;
  color: #000;
  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.8);
  transform: translateZ(30px);
  animation: numberBounce 1s ease-in-out infinite alternate;
}

.winner-notification__text {
  font-size: 0.75rem;
  font-weight: 700;
  color: #000;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  transform: translateZ(20px);
  animation: textPulse 1.5s ease-in-out infinite alternate;
}

/* Animaciones */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  70% {
    transform: rotate(1800deg);
  }
  100% {
    transform: rotate(2160deg);
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes numberGlow {
  0% {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8), 0 0 10px rgba(255, 215, 0, 0.5);
  }
  100% {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.8);
  }
}

@keyframes winnerPop {
  0% {
    transform: translate(-50%, -50%) scale(0) rotateY(0deg);
    opacity: 0;
  }
  20% {
    transform: translate(-50%, -50%) scale(1.2) rotateY(180deg);
    opacity: 1;
  }
  40% {
    transform: translate(-50%, -50%) scale(1) rotateY(360deg);
    opacity: 1;
  }
  80% {
    transform: translate(-50%, -50%) scale(1) rotateY(360deg);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(0) rotateY(720deg);
    opacity: 0;
  }
}

@keyframes numberBounce {
  0% {
    transform: translateZ(30px) scale(1);
  }
  100% {
    transform: translateZ(30px) scale(1.1);
  }
}

@keyframes textPulse {
  0% {
    transform: translateZ(20px) scale(1);
    opacity: 0.8;
  }
  100% {
    transform: translateZ(20px) scale(1.05);
    opacity: 1;
  }
}

/* Responsive */
@media (min-width: 768px) {
  .roulette-wheel {
    width: 20rem; /* 320px */
    height: 20rem; /* 320px */
  }
  
  .roulette-number {
    width: 10rem;
    height: 10rem;
    margin-left: -5rem;
    margin-top: -5rem;
  }
  
  .roulette-number__text {
    font-size: 0.7rem;
    width: 1.8rem;
    height: 1.8rem;
    top: -3rem;
  }
  
  .roulette-center {
    width: 4.5rem; /* 72px - más pequeño */
    height: 4.5rem; /* 72px - más pequeño */
  }
  
  .roulette-result__number {
    font-size: 1.25rem; /* Reducido */
  }
  
  .roulette-result__color {
    font-size: 0.75rem;
  }
  
  .roulette-result__parity {
    font-size: 0.625rem;
  }
  
  .roulette-waiting__icon {
    font-size: 2rem;
  }
  
  .roulette-waiting__text {
    font-size: 0.75rem;
  }

  /* Aviso del número ganador responsive */
  .winner-notification__content {
    width: 10rem;
    height: 10rem;
  }
  
  .winner-notification__number {
    font-size: 3rem;
  }
  
  .winner-notification__text {
    font-size: 0.875rem;
  }
}

@media (min-width: 1024px) {
  .roulette-wheel {
    width: 24rem; /* 384px */
    height: 24rem; /* 384px */
  }
  
  .roulette-number {
    width: 12rem;
    height: 12rem;
    margin-left: -6rem;
    margin-top: -6rem;
  }
  
  .roulette-number__text {
    font-size: 0.8rem;
    width: 2.2rem;
    height: 2.2rem;
    top: -3.5rem;
  }
  
  .roulette-center {
    width: 5.5rem; /* 88px - más pequeño */
    height: 5.5rem; /* 88px - más pequeño */
  }
  
  .roulette-result__number {
    font-size: 1.5rem; /* Reducido */
  }
  
  .roulette-result__color {
    font-size: 0.875rem;
  }
  
  .roulette-result__parity {
    font-size: 0.75rem;
  }
  
  .roulette-waiting__icon {
    font-size: 1.4rem;
  }
  
  .roulette-waiting__text {
    font-size: 0.5rem;
  }

  /* Aviso del número ganador responsive desktop */
  .winner-notification__content {
    width: 12rem;
    height: 12rem;
  }
  
  .winner-notification__number {
    font-size: 3.5rem;
  }
  
  .winner-notification__text {
    font-size: 1rem;
  }
}
</style>
