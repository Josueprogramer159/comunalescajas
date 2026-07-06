<template>
  <div class="section">
    <h2> Caja General</h2>
    <p class="description">Control centralizado de fondos principales</p>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Saldo Total</div>
        <div class="stat-value">${{ totalBalance.toFixed(2) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Ingresos</div>
        <div class="stat-value income">${{ totalIncome.toFixed(2) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Egresos</div>
        <div class="stat-value expense">${{ totalExpense.toFixed(2) }}</div>
      </div>
    </div>

    <div class="add-button">
      <button @click="showForm = !showForm" class="btn-add">
        {{ showForm ? '✕ Cancelar' : '+ Registrar Movimiento' }}
      </button>
    </div>

    <form v-if="showForm" @submit.prevent="addMovement" class="form">
      <div class="form-row">
        <div class="form-group">
          <label>Tipo</label>
          <select v-model="newMovement.type" required>
            <option value="">Seleccionar</option>
            <option value="ingreso">Ingreso</option>
            <option value="egreso">Egreso</option>
          </select>
        </div>
        <div class="form-group">
          <label>Monto</label>
          <input v-model.number="newMovement.amount" type="number" step="0.01" required />
        </div>
      </div>
      <div class="form-group">
        <label>Descripción</label>
        <input v-model="newMovement.description" type="text" required />
      </div>
      <button type="submit" class="btn-save">Guardar</button>
    </form>

    <div class="movements-table">
      <h3>Historial de Movimientos</h3>
      <div v-if="movements.length === 0" class="empty-state">
        <p>No hay movimientos registrados</p>
      </div>
      <table v-else>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Descripción</th>
            <th>Monto</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(mov, index) in movements" :key="index" :class="mov.type">
            <td>{{ mov.date }}</td>
            <td><span class="badge" :class="mov.type">{{ mov.type === 'ingreso' ? 'Ingreso' : 'Egreso' }}</span></td>
            <td>{{ mov.description }}</td>
            <td class="amount" :class="mov.type">
              {{ mov.type === 'ingreso' ? '+' : '-' }}${{ mov.amount.toFixed(2) }}
            </td>
            <td>
              <button @click="deleteMovement(index)" class="btn-delete">✕</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const showForm = ref(false)
const movements = ref([])
const newMovement = ref({ type: '', amount: '', description: '' })

const totalBalance = computed(() => {
  return movements.value.reduce((sum, mov) => {
    return mov.type === 'ingreso' ? sum + mov.amount : sum - mov.amount
  }, 0)
})

const totalIncome = computed(() => {
  return movements.value.filter(m => m.type === 'ingreso').reduce((sum, m) => sum + m.amount, 0)
})

const totalExpense = computed(() => {
  return movements.value.filter(m => m.type === 'egreso').reduce((sum, m) => sum + m.amount, 0)
})

const loadMovements = () => {
  const data = localStorage.getItem('cajaGeneral')
  if (data) {
    movements.value = JSON.parse(data)
  }
}

const addMovement = () => {
  const today = new Date().toLocaleDateString('es-ES')
  movements.value.unshift({
    type: newMovement.value.type,
    amount: parseFloat(newMovement.value.amount),
    description: newMovement.value.description,
    date: today
  })
  localStorage.setItem('cajaGeneral', JSON.stringify(movements.value))
  newMovement.value = { type: '', amount: '', description: '' }
  showForm.value = false
}

const deleteMovement = (index) => {
  movements.value.splice(index, 1)
  localStorage.setItem('cajaGeneral', JSON.stringify(movements.value))
}

onMounted(loadMovements)
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

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
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

.movements-table {
  margin-top: 2rem;
}

.movements-table h3 {
  color: #333;
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #999;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f5f5f5;
}

th {
  padding: 1rem;
  text-align: left;
  color: #333;
  font-weight: 600;
  border-bottom: 2px solid #ddd;
}

td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #eee;
}

.badge {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.badge.ingreso {
  background: #e8f5e9;
  color: #003d99;
}

.badge.egreso {
  background: #fff3e0;
  color: #e65100;
}

.amount {
  font-weight: 700;
}

.amount.ingreso {
  color: #003d99;
}

.amount.egreso {
  color: #e65100;
}

.btn-delete {
  background: #c62828;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-delete:hover {
  background: #8e0000;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  table {
    font-size: 0.9rem;
  }

  th, td {
    padding: 0.5rem;
  }
}
</style>
