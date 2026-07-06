<template>
  <div style="padding: 20px; background: #f0f8ff;">
    <h1>🧪 TEST: Movimiento Individual</h1>
    <p>Si puedes ver esta página, Vue está funcionando correctamente</p>
    
    <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 10px; border: 2px solid #007bff;">
      <h2>Movimiento Individual</h2>
      <p>Esta es una versión de prueba de la sección</p>
      
      <select style="width: 100%; padding: 10px; margin: 10px 0;">
        <option>Socio de Prueba 1</option>
        <option>Socio de Prueba 2</option>
      </select>
      
      <button style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px;">
        Consultar Movimiento
      </button>
    </div>
    
    <div style="background: #d4edda; padding: 15px; border-radius: 8px; color: #155724; margin: 20px 0;">
      ✅ Si ves esto, el problema NO es de Vue ni de ubicación HTML
    </div>
  </div>
</template>

<script setup>
console.log('🧪 Componente de prueba cargado')
</script>