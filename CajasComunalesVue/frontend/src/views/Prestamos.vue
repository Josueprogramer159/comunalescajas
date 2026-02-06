<template>
  <div class="section">
    <h2>Préstamos</h2>
    <p class="description">Sistema de créditos y seguimiento de préstamos</p>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Prestado</div>
        <div class="stat-value">${{ totalPrestado.toFixed(2) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Recuperado</div>
        <div class="stat-value income">${{ totalRecuperado.toFixed(2) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Por Recuperar</div>
        <div class="stat-value expense">${{ totalPendiente.toFixed(2) }}</div>
      </div>
    </div>

    <div class="add-button">
      <button @click="showForm = !showForm" class="btn-add">
        {{ showForm ? '✕ Cancelar' : '+ Registrar Préstamo' }}
      </button>
    </div>

    <form v-if="showForm" @submit.prevent="addPrestamo" class="form">
      <div class="form-row">
        <div class="form-group">
          <label>Nombre del Prestatario</label>
          <input v-model="newPrestamo.prestatario" type="text" required />
        </div>
        <div class="form-group">
          <label>Monto</label>
          <input v-model.number="newPrestamo.monto" type="number" step="0.01" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Plazo (días)</label>
          <input v-model.number="newPrestamo.plazo" type="number" required />
        </div>
        <div class="form-group">
          <label>Interés (%)</label>
          <input v-model.number="newPrestamo.interes" type="number" step="0.1" value="5" />
        </div>
      </div>
      <div class="form-group">
        <label>Descripción</label>
        <input v-model="newPrestamo.descripcion" type="text" />
      </div>
      <button type="submit" class="btn-save">Guardar</button>
    </form>

    <div class="prestamos-list">
      <h3>Listado de Préstamos</h3>
      <div v-if="prestamos.length === 0" class="empty-state">
        <p>No hay préstamos registrados</p>
      </div>
      <div v-else class="prestamos-grid">
        <div v-for="(prestamo, index) in prestamos" :key="index" class="prestamo-card" :class="{ pagado: prestamo.pagado }">
          <div class="prestamo-header">
            <h4>{{ prestamo.prestatario }}</h4>
            <span class="badge" :class="prestamo.pagado ? 'pagado' : 'pendiente'">
              {{ prestamo.pagado ? '✓ Pagado' : '⏳ Pendiente' }}
            </span>
          </div>
          <div class="prestamo-details">
            <p><strong>Monto:</strong> ${{ prestamo.monto.toFixed(2) }}</p>
            <p><strong>Con interés:</strong> ${{ (prestamo.monto + (prestamo.monto * prestamo.interes / 100)).toFixed(2) }}</p>
            <p><strong>Plazo:</strong> {{ prestamo.plazo }} días</p>
            <p><strong>Fecha:</strong> {{ prestamo.fecha }}</p>
            <p v-if="prestamo.descripcion"><strong>Descripción:</strong> {{ prestamo.descripcion }}</p>
          </div>
          <div class="prestamo-actions">
            <button 
              v-if="!prestamo.pagado" 
              @click="markAsPaid(index)" 
              class="btn-mark"
            >
              Marcar como Pagado
            </button>
            <button @click="deletePrestamo(index)" class="btn-delete">✕ Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const showForm = ref(false)
const prestamos = ref([])
const newPrestamo = ref({
  prestatario: '',
  monto: '',
  plazo: '',
  interes: 5,
  descripcion: ''
})

const totalPrestado = computed(() => {
  return prestamos.value.reduce((sum, p) => sum + p.monto, 0)
})

const totalRecuperado = computed(() => {
  return prestamos.value.filter(p => p.pagado).reduce((sum, p) => {
    return sum + (p.monto + (p.monto * p.interes / 100))
  }, 0)
})

const totalPendiente = computed(() => {
  return prestamos.value.filter(p => !p.pagado).reduce((sum, p) => {
    return sum + (p.monto + (p.monto * p.interes / 100))
  }, 0)
})

const loadPrestamos = () => {
  const data = localStorage.getItem('prestamos')
  if (data) {
    prestamos.value = JSON.parse(data)
  }
}

const addPrestamo = () => {
  const today = new Date().toLocaleDateString('es-ES')
  prestamos.value.unshift({
    prestatario: newPrestamo.value.prestatario,
    monto: parseFloat(newPrestamo.value.monto),
    plazo: parseInt(newPrestamo.value.plazo),
    interes: parseFloat(newPrestamo.value.interes),
    descripcion: newPrestamo.value.descripcion,
    fecha: today,
    pagado: false
  })
  localStorage.setItem('prestamos', JSON.stringify(prestamos.value))
  newPrestamo.value = {
    prestatario: '',
    monto: '',
    plazo: '',
    interes: 5,
    descripcion: ''
  }
  showForm.value = false
}

const markAsPaid = (index) => {
  prestamos.value[index].pagado = true
  localStorage.setItem('prestamos', JSON.stringify(prestamos.value))
}

const deletePrestamo = (index) => {
  prestamos.value.splice(index, 1)
  localStorage.setItem('prestamos', JSON.stringify(prestamos.value))
}

onMounted(loadPrestamos)
</script>

<style scoped>
.section {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

h2 {
  color: #0052CC;
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
}

.description {
  color: #999;
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, #0052CC 0%, #7F3FA8 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
}

.stat-value.income {
  color: #7F3FA8;
}

.stat-value.expense {
  color: #ff9800;
}

.add-button {
  margin-bottom: 2rem;
}

.btn-add {
  padding: 0.8rem 1.5rem;
  background: linear-gradient(135deg, #0052CC 0%, #7F3FA8 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.form {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border-left: 4px solid #0052CC;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #0052CC;
}

.btn-save {
  padding: 0.8rem 1.5rem;
  background: #003d99;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-save:hover {
  background: #1b5e20;
  transform: translateY(-2px);
}

.prestamos-list {
  margin-top: 2rem;
}

.prestamos-list h3 {
  color: #333;
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.prestamos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.prestamo-card {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #0052CC;
  transition: all 0.3s ease;
}

.prestamo-card.pagado {
  opacity: 0.7;
  border-left-color: #7F3FA8;
}

.prestamo-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
}

.prestamo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.prestamo-header h4 {
  color: #333;
  margin: 0;
}

.badge {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.badge.pagado {
  background: #e8f5e9;
  color: #003d99;
}

.badge.pendiente {
  background: #fff3e0;
  color: #e65100;
}

.prestamo-details {
  margin-bottom: 1rem;
}

.prestamo-details p {
  margin: 0.5rem 0;
  color: #666;
  font-size: 0.95rem;
}

.prestamo-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-mark {
  flex: 1;
  padding: 0.6rem;
  background: #7F3FA8;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-mark:hover {
  background: #388e3c;
  transform: translateY(-2px);
}

.btn-delete {
  padding: 0.6rem 0.8rem;
  background: #c62828;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-delete:hover {
  background: #8e0000;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .prestamos-grid {
    grid-template-columns: 1fr;
  }

  .prestamo-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
