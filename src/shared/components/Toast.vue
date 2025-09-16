<template>
  <Transition
    name="toast"
    appear
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @leave="onLeave"
  >
    <div
      v-if="visible"
      class="toast"
      :class="[
        `toast--${type}`,
        { 'toast--closing': isClosing }
      ]"
      @click="handleClick"
    >
      <div class="toast__icon">
        <span v-if="type === 'success'">✅</span>
        <span v-else-if="type === 'error'">❌</span>
        <span v-else-if="type === 'warning'">⚠️</span>
        <span v-else>ℹ️</span>
      </div>
      
      <div class="toast__content">
        <div class="toast__title" v-if="title">{{ title }}</div>
        <div class="toast__message">{{ message }}</div>
      </div>
      
      <button
        v-if="closable"
        class="toast__close"
        @click.stop="close"
        aria-label="Cerrar notificación"
      >
        ✕
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// Props
interface Props {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  closable?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const props = withDefaults(defineProps<Props>(), {
  duration: 5000,
  closable: true,
  position: 'top-right'
});

// Emits
const emit = defineEmits<{
  close: [id: string];
  click: [id: string];
}>();

// Estado
const visible = ref(false);
const isClosing = ref(false);
let timeoutId: number | null = null;

// Métodos
const close = () => {
  if (isClosing.value) return;
  
  isClosing.value = true;
  visible.value = false;
  
  // Emitir evento después de la animación
  setTimeout(() => {
    emit('close', props.id);
  }, 300);
};

const handleClick = () => {
  emit('click', props.id);
};

const onBeforeEnter = (el: Element) => {
  const element = el as HTMLElement;
  element.style.transform = 'translateX(100%)';
  element.style.opacity = '0';
};

const onEnter = (el: Element) => {
  const element = el as HTMLElement;
  element.offsetHeight; // Trigger reflow
  element.style.transform = 'translateX(0)';
  element.style.opacity = '1';
};

const onLeave = (el: Element) => {
  const element = el as HTMLElement;
  element.style.transform = 'translateX(100%)';
  element.style.opacity = '0';
};

// Lifecycle
onMounted(() => {
  visible.value = true;
  
  if (props.duration > 0) {
    timeoutId = window.setTimeout(() => {
      close();
    }, props.duration);
  }
});

onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
});
</script>

<style scoped>
.toast {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: rgba(31, 41, 55, 0.95);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border-left: 4px solid;
  min-width: 300px;
  max-width: 400px;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.toast:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.toast--success {
  border-left-color: #22c55e;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(31, 41, 55, 0.95) 100%);
  backdrop-filter: blur(10px);
}

.toast--error {
  border-left-color: #ef4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(31, 41, 55, 0.95) 100%);
  backdrop-filter: blur(10px);
}

.toast--warning {
  border-left-color: #f59e0b;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(31, 41, 55, 0.95) 100%);
  backdrop-filter: blur(10px);
}

.toast--info {
  border-left-color: #3b82f6;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(31, 41, 55, 0.95) 100%);
  backdrop-filter: blur(10px);
}

.toast__icon {
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.toast__content {
  flex: 1;
  min-width: 0;
}

.toast__title {
  font-weight: var(--font-weight-semibold);
  color: #f9fafb;
  margin-bottom: 0.25rem;
  font-size: var(--font-size-sm);
}

.toast__message {
  color: #d1d5db;
  font-size: var(--font-size-sm);
  line-height: 1.4;
}

.toast__close {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.875rem;
  flex-shrink: 0;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
}

.toast__close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f9fafb;
}

/* Animaciones */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Responsive */
@media (max-width: 480px) {
  .toast {
    min-width: 280px;
    max-width: calc(100vw - 2rem);
    margin: 0 1rem;
  }
}
</style>
