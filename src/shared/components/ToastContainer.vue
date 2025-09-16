<template>
  <div class="toast-container" :class="`toast-container--${position}`">
    <Toast
      v-for="toast in toasts"
      :key="toast.id"
      :id="toast.id"
      :type="toast.type"
      :title="toast.title"
      :message="toast.message"
      :duration="toast.duration"
      :closable="toast.closable"
      :position="toast.position"
      @close="removeToast"
      @click="handleToastClick"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Toast from './Toast.vue';

// Props
interface Props {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top-right',
  maxToasts: 5
});

// Estado
const toasts = ref<Array<{
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  closable?: boolean;
  position?: string;
}>>([]);

// Métodos
const addToast = (toast: {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  closable?: boolean;
}) => {
  const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const newToast = {
    id,
    ...toast,
    position: props.position
  };
  
  // Agregar al inicio del array
  toasts.value.unshift(newToast);
  
  // Limitar el número máximo de toasts
  if (toasts.value.length > props.maxToasts) {
    toasts.value = toasts.value.slice(0, props.maxToasts);
  }
  
  return id;
};

const removeToast = (id: string) => {
  const index = toasts.value.findIndex(toast => toast.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
};

const clearAllToasts = () => {
  toasts.value = [];
};

const handleToastClick = (id: string) => {
  // Opcional: manejar clics en toasts
  console.log('Toast clicked:', id);
};

// Exponer métodos globalmente
const toastService = {
  success: (message: string, title?: string, duration?: number) => 
    addToast({ type: 'success', message, title, duration }),
  error: (message: string, title?: string, duration?: number) => 
    addToast({ type: 'error', message, title, duration }),
  warning: (message: string, title?: string, duration?: number) => 
    addToast({ type: 'warning', message, title, duration }),
  info: (message: string, title?: string, duration?: number) => 
    addToast({ type: 'info', message, title, duration }),
  clear: clearAllToasts
};

// Hacer el servicio disponible globalmente
onMounted(() => {
  (window as any).toastService = toastService;
});

onUnmounted(() => {
  delete (window as any).toastService;
});

// Exponer para uso en composables
defineExpose({
  addToast,
  removeToast,
  clearAllToasts,
  toastService
});
</script>

<style scoped>
.toast-container {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
}

.toast-container--top-right {
  top: 0;
  right: 0;
}

.toast-container--top-left {
  top: 0;
  left: 0;
}

.toast-container--bottom-right {
  bottom: 0;
  right: 0;
  flex-direction: column-reverse;
}

.toast-container--bottom-left {
  bottom: 0;
  left: 0;
  flex-direction: column-reverse;
}

.toast-container--top-center {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.toast-container--bottom-center {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  flex-direction: column-reverse;
}

/* Permitir interacción con los toasts */
.toast-container :deep(.toast) {
  pointer-events: auto;
}

/* Responsive */
@media (max-width: 768px) {
  .toast-container {
    padding: var(--spacing-sm);
  }
  
  .toast-container--top-center,
  .toast-container--bottom-center {
    left: 0;
    right: 0;
    transform: none;
    padding: var(--spacing-sm);
  }
}
</style>
