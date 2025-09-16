<script setup lang="ts">
import RouletteGame from './roulette/views/RouletteGame.vue';
import ToastContainer from './shared/components/ToastContainer.vue';
</script>

<template>
  <RouletteGame />
  <ToastContainer position="top-right" :max-toasts="5" />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
}

#app {
  min-height: 100vh;
}
</style>
