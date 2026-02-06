<template>
  <div class="intereses-container">
    <!-- HEADER SECTION -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-icon">
          <i class="fas fa-chart-line"></i>
        </div>
        <div class="header-text">
          <h1>Resumen de Intereses</h1>
          <p class="subtitle">Consolidado automatico basado en el Registro de Prestamos</p>
        </div>
      </div>
      <div class="header-stats">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-dollar-sign"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Total Intereses</span>
            <span class="stat-value">${{ format(totales.entrada) }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-credit-card"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Total Pagos</span>
            <span class="stat-value">${{ format(totales.salida) }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-balance-scale"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Saldo Pendiente</span>
            <span class="stat-value">${{ format(totales.saldo) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- NOTIFICATION -->
    <div v-if="notification.show" class="notification" :class="notification.type">
      <div class="notification-content">
        <span class="notification-icon">{{ notification.icon }}</span>
        <span class="notification-message">{{ notification.message }}</span>
      </div>
      <button @click="notification.show = false" class="notification-close">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- ACTIONS BAR -->
    <div class="actions-bar">
      <button class="btn-primary" @click="calcularResumen">
        <i class="fas fa-sync-alt"></i>
        <span>Recalcular desde Prestamos</span>
      </button>
      <div class="last-update">
        <i class="fas fa-clock"></i>
        <span>Ultima actualizacion: {{ lastUpdate }}</span>
      </div>
    </div>

    <!-- TABLE SECTION -->
    <div class="table-section">
      <div class="table-header">
        <h3>Detalle por Mes</h3>
        <span class="table-subtitle">{{ resumen.length }} meses registrados</span>
      </div>

      <div class="table-container">
        <table class="modern-table">
          <thead>
            <tr>
              <th class="col-month">
                <i class="fas fa-calendar-alt"></i>
                Mes
              </th>
              <th class="col-description">
                <i class="fas fa-info-circle"></i>
                Detalle del Mes
              </th>
              <th class="col-entrada">
                <i class="fas fa-arrow-up"></i>
                Entrada (Intereses + Mora)
              </th>
              <th class="col-salida">
                <i class="fas fa-arrow-down"></i>
                Salida (Pagos)
              </th>
              <th class="col-saldo">
                <i class="fas fa-balance-scale"></i>
                Saldo Pendiente
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(fila, index) in resumen" :key="index" class="table-row">
              <td class="month-cell">
                <div class="month-badge">
                  <span class="month-text">{{ fila.mes }}</span>
                </div>
              </td>

              <td class="description-cell">
                <div class="description-content">
                  <div class="desc-item">
                    <i class="fas fa-hand-holding-usd"></i>
                    <span>Prestamos concedidos: <strong>${{ format(fila.concedido) }}</strong></span>
                  </div>
                  <div class="desc-item">
                    <i class="fas fa-percentage"></i>
                    <span>Intereses generados: <strong>${{ format(fila.interes) }}</strong></span>
                  </div>
                  <div class="desc-item">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Mora acumulada: <strong>${{ format(fila.mora) }}</strong></span>
                  </div>
                </div>
              </td>

              <td class="entrada-cell">
                <span class="amount-positive">+${{ format(fila.entrada) }}</span>
              </td>

              <td class="salida-cell">
                <span class="amount-negative">-${{ format(fila.salida) }}</span>
              </td>

              <td class="saldo-cell">
                <span :class="['amount-balance', fila.saldo >= 0 ? 'positive' : 'negative']">
                  ${{ format(fila.saldo) }}
                </span>
              </td>
            </tr>
          </tbody>

          <tfoot>
            <tr class="total-row">
              <td colspan="2" class="total-label">
                <div class="total-content">
                  <i class="fas fa-calculator"></i>
                  <span>TOTALES GENERALES</span>
                </div>
              </td>
              <td class="total-entrada">
                <span class="total-amount">+${{ format(totales.entrada) }}</span>
              </td>
              <td class="total-salida">
                <span class="total-amount">-${{ format(totales.salida) }}</span>
              </td>
              <td class="total-saldo">
                <span :class="['total-amount', totales.saldo >= 0 ? 'positive' : 'negative']">
                  ${{ format(totales.saldo) }}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const resumen = ref([])
const lastUpdate = ref('')

const notification = ref({
  show: false,
  type: 'success',
  icon: 'Estadisticas',
  message: ''
})

const showNotification = (type, icon, message) => {
  notification.value = { show: true, type, icon, message }
  setTimeout(() => (notification.value.show = false), 4000)
}

onMounted(() => {
  calcularResumen()
})

const calcularResumen = async () => {
  try {
    const response = await fetch('/api/registro-prestamos')
    const result = await response.json()

    if (!result.success || result.data.length === 0) {
      resumen.value = []
      showNotification('warning', 'Advertencia', 'No existen registros de préstamos')
      return
    }

    const agrupado = {}

    result.data.forEach(r => {
      const mes = r.mes || 'SIN MES'

      if (!agrupado[mes]) {
        agrupado[mes] = {
          mes,
          concedido: 0,
          interes: 0,
          mora: 0,
          entrada: 0,
          salida: 0,
          saldo: 0
        }
      }

      agrupado[mes].concedido += Number(r.concedido || 0)
      agrupado[mes].interes += Number(r.interes || 0)
      agrupado[mes].mora += Number(r.mora || 0)
      agrupado[mes].salida += Number(r.pago_prestamo || 0)
      agrupado[mes].saldo += Number(r.saldo || 0)
    })

    resumen.value = Object.values(agrupado).map(m => ({
      ...m,
      entrada: m.interes + m.mora
    }))

    // Update last update time
    lastUpdate.value = new Date().toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    showNotification('success', 'Exito', `Resumen calculado (${resumen.value.length} meses)`)

  } catch (error) {
    console.log('Backend no disponible, cargando resumen de ejemplo para intereses:', error.message)
    // Cargar datos de ejemplo cuando el backend no está disponible
    resumen.value = [
      {
        mes: 'JUNIO',
        concedido: 2500,
        interes: 125,
        mora: 25,
        entrada: 150,
        salida: 800,
        saldo: 1700
      },
      {
        mes: 'MAYO',
        concedido: 1800,
        interes: 90,
        mora: 15,
        entrada: 105,
        salida: 600,
        saldo: 1305
      },
      {
        mes: 'ABRIL',
        concedido: 3200,
        interes: 160,
        mora: 40,
        entrada: 200,
        salida: 1200,
        saldo: 2200
      }
    ]

    // Update last update time
    lastUpdate.value = new Date().toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    showNotification('info', 'Info', 'Resumen calculado con datos de ejemplo (backend no disponible)')
  }
}

const totales = computed(() => {
  return resumen.value.reduce(
    (acc, f) => {
      acc.entrada += f.entrada
      acc.salida += f.salida
      acc.saldo += f.saldo
      return acc
    },
    { entrada: 0, salida: 0, saldo: 0 }
  )
})

const format = (n) =>
  new Intl.NumberFormat('es-EC', {
    minimumFractionDigits: 2
  }).format(n)
</script>

<style scoped>
/* ===== MAIN CONTAINER ===== */
.intereses-container {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* ===== HEADER SECTION ===== */
.header-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 20px rgba(30, 136, 229, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-icon {
  background: linear-gradient(135deg, #1e88e5, #42a5f5);
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 12px rgba(30, 136, 229, 0.3);
}

.header-text h1 {
  margin: 0;
  color: #1565c0;
  font-size: 2.2rem;
  font-weight: 700;
}

.subtitle {
  margin: 0.5rem 0 0 0;
  color: #546e7a;
  font-size: 1.1rem;
  font-weight: 400;
}

/* ===== HEADER STATS ===== */
.header-stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  min-width: 160px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}

.stat-label {
  display: block;
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  display: block;
  color: #2c3e50;
  font-size: 1.4rem;
  font-weight: 700;
}

/* ===== NOTIFICATION ===== */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  min-width: 350px;
  animation: slideInRight 0.3s ease;
}

.notification.success {
  border-left: 4px solid #27ae60;
}

.notification.warning {
  border-left: 4px solid #f39c12;
}

.notification.error {
  border-left: 4px solid #e74c3c;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
}

.notification-icon {
  font-size: 1.5rem;
}

.notification-message {
  flex: 1;
  font-weight: 500;
  color: #2c3e50;
}

.notification-close {
  background: none;
  border: none;
  color: #7f8c8d;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.notification-close:hover {
  background-color: #f8f9fa;
}

/* ===== ACTIONS BAR ===== */
.actions-bar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #1e88e5, #42a5f5);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(30, 136, 229, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(30, 136, 229, 0.4);
}

.btn-primary i {
  font-size: 1rem;
}

.last-update {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #546e7a;
  font-size: 0.9rem;
}

.last-update i {
  color: #1e88e5;
}

/* ===== TABLE SECTION ===== */
.table-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.table-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: 600;
}

.table-subtitle {
  background: linear-gradient(135deg, #1e88e5, #42a5f5);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

/* ===== TABLE ===== */
.table-container {
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.modern-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.modern-table thead {
  background: linear-gradient(135deg, #1e88e5, #42a5f5);
}

.modern-table th {
  color: white;
  padding: 1.2rem 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  text-align: center;
  border: none;
}

.modern-table th i {
  margin-right: 0.5rem;
  opacity: 0.9;
}

.modern-table tbody tr {
  transition: all 0.2s ease;
}

.modern-table tbody tr:hover {
  background: linear-gradient(135deg, rgba(30, 136, 229, 0.05), rgba(66, 165, 245, 0.05));
  transform: scale(1.01);
}

/* ===== TABLE CELLS ===== */
.modern-table td {
  padding: 1.2rem 1rem;
  border-bottom: 1px solid #f1f3f4;
  vertical-align: middle;
}

/* Month Cell */
.month-cell {
  text-align: center;
  width: 120px;
}

.month-badge {
  background: linear-gradient(135deg, #1e88e5, #42a5f5);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  display: inline-block;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Description Cell */
.description-cell {
  width: 300px;
}

.description-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.desc-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #5a6c7d;
}

.desc-item i {
  color: #1e88e5;
  width: 16px;
}

.desc-item strong {
  color: #2c3e50;
}

/* Amount Cells */
.entrada-cell,
.salida-cell,
.saldo-cell {
  text-align: center;
  font-weight: 600;
  font-size: 1rem;
}

.amount-positive {
  color: #27ae60;
}

.amount-negative {
  color: #e74c3c;
}

.amount-balance.positive {
  color: #27ae60;
}

.amount-balance.negative {
  color: #e74c3c;
}

/* ===== TABLE FOOTER ===== */
.modern-table tfoot {
  background: linear-gradient(135deg, #2e7d32, #4caf50);
}

.total-row td {
  border: none;
  padding: 1.5rem 1rem;
  color: white;
  font-weight: 700;
  font-size: 1rem;
}

.total-label {
  text-align: left;
}

.total-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.total-content i {
  font-size: 1.2rem;
}

.total-amount {
  font-size: 1.1rem;
  font-weight: 800;
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 1024px) {
  .header-section {
    flex-direction: column;
    text-align: center;
  }

  .header-stats {
    justify-content: center;
  }

  .table-header {
    flex-direction: column;
    text-align: center;
  }

  .actions-bar {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .intereses-container {
    padding: 1rem;
  }

  .header-section,
  .actions-bar,
  .table-section {
    padding: 1.5rem;
  }

  .header-stats {
    flex-direction: column;
    width: 100%;
  }

  .stat-card {
    min-width: auto;
    width: 100%;
  }

  .modern-table {
    font-size: 0.8rem;
  }

  .modern-table th,
  .modern-table td {
    padding: 0.8rem 0.5rem;
  }

  .description-cell {
    width: 250px;
  }

  .notification {
    min-width: 300px;
    right: 10px;
    left: 10px;
  }
}

/* ===== ANIMATIONS ===== */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.header-section,
.actions-bar,
.table-section {
  animation: fadeInUp 0.6s ease;
}

/* ===== SCROLLBAR STYLING ===== */
.table-container::-webkit-scrollbar {
  height: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #1e88e5, #42a5f5);
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #1565c0, #1976d2);
}
</style>
