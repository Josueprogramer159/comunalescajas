<!-- Test para deposito -->
<template>
  <div style="padding: 20px; border: 2px solid red;">
    <h3>Test Deposito</h3>
    <input 
      v-model.number="testDeposito" 
      type="number" 
      placeholder="Ingresa un deposito"
      step="0.01"
      style="padding: 10px; font-size: 16px;"
    />
    <p>Valor en testDeposito: {{ testDeposito }}</p>
    <p>Tipo: {{ typeof testDeposito }}</p>
    <button @click="showValues" style="padding: 10px 20px; margin-top: 10px;">Mostrar Valores</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const testDeposito = ref(0)

const showValues = () => {
  console.log('testDeposito:', testDeposito.value)
  console.log('Tipo:', typeof testDeposito.value)
  console.log('Es número:', Number.isFinite(testDeposito.value))
}
</script>
