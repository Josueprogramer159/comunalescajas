<template>
  <div class="caja-chica-content">
    <h3>Caja Chica</h3>
    <p class="description">Resumen de Caja Chica</p>

    <!-- NOTIFICACIONES -->
    <div v-if="notification.show" class="notification" :class="notification.type">
      <span class="notification-icon">{{ notification.icon }}</span>
      <span class="notification-message">{{ notification.message }}</span>
      <button @click="closeNotification" class="notification-close">×</button>
    </div>

    <!-- BOTÓN REGISTRAR -->
    <button class="btn-registrar" @click="agregarFila">Registrar</button>

    <div class="tabla-container">
      <table>
        <thead>
          <tr>
            <th>Reunión</th>
            <th>Fecha</th>
            <th>Descripción</th>
            <th>Ingresos</th>
            <th>Egresos</th>
            <th>Saldo</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(fila, index) in filasOrdenadas"
            :key="fila.id ?? index"
            :class="{ 'registro-guardado': fila.guardado }"
          >
            <td><input type="number" v-model.number="fila.reunion" /></td>

            <td>
              <input type="date" v-model="fila.fecha" />
            </td>

            <td><input type="text" v-model="fila.descripcion" /></td>

            <td><input type="number" min="0" v-model.number="fila.ingresos" /></td>

            <td><input type="number" min="0" v-model.number="fila.egresos" /></td>

            <td>
              <input type="number" :value="fila.saldo.toFixed(2)" disabled />
            </td>

            <td>
              <button @click="eliminarRegistroPorId(fila)" class="btn-delete">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- SALDO ACTUAL -->
      <div style="text-align:right; font-weight:bold; font-size:1.1rem; margin-bottom:1rem;">
        Saldo Actual en Caja: ${{ saldoActual.toFixed(2) }}
      </div>

      <!-- BOTÓN GUARDAR -->
      <button class="btn-save" @click="guardar">Guardar</button>
    </div>
  </div>

  <!-- Modal de Confirmación Personalizado -->
  <div v-if="showConfirmModal" class="confirm-modal-overlay" @click="closeConfirmModal">
    <div class="confirm-modal-content" @click.stop>
      <div class="confirm-modal-header">
        <h4>Confirmar Acción</h4>
      </div>
      <div class="confirm-modal-body">
        <p>{{ confirmMessage }}</p>
      </div>
      <div class="confirm-modal-actions">
        <button @click="closeConfirmModal" class="btn-cancel-confirm">
          Cancelar
        </button>
        <button @click="handleConfirm" class="btn-confirm-action">
          Aceptar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'

const filas = ref([
  { reunion: '', fecha: '', descripcion: '', ingresos: 0, egresos: 0, saldo: 0 }
])

const saldoActual = ref(0)

// Estado para el modal de confirmación
const showConfirmModal = ref(false)
const confirmAction = ref(null)
const confirmMessage = ref('')

// Función para mostrar confirmación personalizada
function showCustomConfirm(message, onConfirm) {
  console.log('🔔 Mostrando confirmación:', message)
  confirmMessage.value = message
  confirmAction.value = onConfirm
  showConfirmModal.value = true
  console.log('🔔 Estado del modal:', showConfirmModal.value)
}

// Función para confirmar acción
function handleConfirm() {
  console.log('✅ Confirmado, ejecutando acción')
  if (confirmAction.value) {
    confirmAction.value()
  }
  closeConfirmModal()
}

// Función para cancelar
function closeConfirmModal() {
  console.log('❌ Cerrando modal')
  showConfirmModal.value = false
  confirmAction.value = null
  confirmMessage.value = ''
}

// ===== ORDENAR POR REUNIÓN =====
const filasOrdenadas = computed(() => {
  return [...filas.value].sort((a, b) => {
    const r1 = Number(a.reunion) || 0
    const r2 = Number(b.reunion) || 0
    return r1 - r2
  })
})

// ===== FORMATO FECHA =====
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// ===== CÁLCULO DE SALDOS =====
const calcularSaldos = () => {
  let acumulado = 0
  filasOrdenadas.value.forEach(f => {
    const ingresos = Number(f.ingresos) || 0
    const egresos = Number(f.egresos) || 0
    acumulado += ingresos - egresos
    f.saldo = acumulado
  })
  saldoActual.value = acumulado
}

// Recalcular automáticamente
watch(
  filas,
  () => {
    calcularSaldos()
  },
  { deep: true }
)

// ===== CARGAR DATOS =====
onMounted(async () => {
  await cargarRegistrosGuardados()
  calcularSaldos()
})

const cargarRegistrosGuardados = async () => {
  try {
    const response = await fetch('/api/caja-chica')
    const result = await response.json()

    if (result.success && result.data.length > 0) {
      filas.value = result.data.map(r => ({
        id: r.id,
        reunion: Number(r.reunion),
        fecha: formatearFechaParaInput(r.fecha),
        descripcion: r.descripcion,
        ingresos: Number(r.ingresos),
        egresos: Number(r.egresos),
        saldo: Number(r.saldo),
        guardado: true
      }))
    }
  } catch (e) {
    console.log('Backend no disponible, empezando con registros vacíos para caja chica:', e.message)
    // Mantener datos vacíos cuando el backend no está disponible (como solicitó el usuario)
    filas.value = [
      { reunion: '', fecha: '', descripcion: '', ingresos: 0, egresos: 0, saldo: 0 }
    ]
  }
}

// Función simple y robusta para formatear la fecha
const formatearFechaParaInput = (fecha) => {
  if (!fecha) return ''
  
  console.log('Fecha original del backend:', fecha, typeof fecha)
  
  try {
    // Crear objeto Date
    let date
    
    if (fecha instanceof Date) {
      date = fecha
    } else if (typeof fecha === 'string') {
      // Para strings, usar el constructor Date con formato estandarizado
      // Reemplazar / por - para consistencia
      const fechaLimpia = fecha.replace(/\//g, '-')
      
      // Si parece ser DD/MM/YYYY, convertir a YYYY-MM-DD
      if (fechaLimpia.match(/^\d{2}-\d{2}-\d{4}$/)) {
        const [dia, mes, anio] = fechaLimpia.split('-')
        date = new Date(`${anio}-${mes}-${dia}`)
      } else {
        // Para otros formatos, dejar que JavaScript intente parsear
        date = new Date(fechaLimpia)
      }
    } else if (typeof fecha === 'number') {
      date = new Date(fecha)
    } else {
      date = new Date(fecha)
    }
    
    // Verificar si es válida
    if (isNaN(date.getTime())) {
      console.log('Fecha inválida:', fecha)
      return ''
    }
    
    // Formatear a YYYY-MM-DD para el input
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const resultado = `${year}-${month}-${day}`
    
    console.log('Fecha formateada:', resultado)
    return resultado
    
  } catch (error) {
    console.error('Error formateando fecha:', error, fecha)
    return ''
  }
}

// ===== NOTIFICACIONES =====
const notification = ref({ show: false, type: '', icon: '', message: '' })

const showNotification = (type, icon, message) => {
  notification.value = { show: true, type, icon, message }
  setTimeout(() => (notification.value.show = false), 5000)
}

const closeNotification = () => (notification.value.show = false)

// ===== VALIDACIÓN =====
const filaValida = (f) =>
  f.reunion !== '' &&
  f.fecha !== '' &&
  f.descripcion.trim() !== ''

const agregarFila = () => {
  if (!filaValida(filas.value[filas.value.length - 1])) {
    showNotification('warning', 'Complete el registro antes de agregar otro')
    return
  }

  filas.value.push({
    reunion: '',
    fecha: '',
    descripcion: '',
    ingresos: 0,
    egresos: 0,
    saldo: saldoActual.value
  })
}

// ===== GUARDAR =====
const guardar = async () => {
  const nuevas = filas.value.filter(f => !f.guardado)

  if (nuevas.length === 0) {
    showNotification('warning', 'No hay registros nuevos')
    return
  }

  try {
    const res = await fetch('/api/caja-chica', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filas: nuevas })
    })

    const result = await res.json()

    if (result.success) {
      showNotification('success', 'Caja chica guardada correctamente')
      await cargarRegistrosGuardados()
      calcularSaldos()
    }
  } catch {
    showNotification('error', 'Error al guardar')
  }
}

// ===== ELIMINAR =====
const eliminarRegistroPorId = async (fila) => {
  if (fila.guardado && fila.id) {
    showCustomConfirm(
      '¿Está seguro de que desea eliminar este registro? Esta acción no se puede deshacer.',
      async () => {
        await fetch(`/api/caja-chica/${fila.id}`, {
          method: 'DELETE'
        })

        await cargarRegistrosGuardados()
        calcularSaldos()
      }
    )
  } else {
    showCustomConfirm(
      '¿Está seguro de que desea eliminar este registro?',
      () => {
        const index = filas.value.indexOf(fila)
        filas.value.splice(index, 1)
        calcularSaldos()
      }
    )
  }
}
</script>



<style scoped>
/* ===== CONTENEDOR GENERAL ===== */
.caja-chica-content {
  background-color: #f5f7fa;
  padding: 2rem;
  border-radius: 12px;
  min-height: 100vh;
}

h3 {
  color: #1e88e5;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.description {
  color: #546e7a;
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

/* ===== BOTÓN REGISTRAR ===== */
.btn-registrar {
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
  box-shadow: 0 4px 12px rgba(30, 136, 229, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
  margin-bottom: 2rem;
}

.btn-registrar:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(30, 136, 229, 0.4);
}

/* ===== TABLA ===== */
.tabla-container {
  background: white;
  padding: 1.75rem;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(30, 136, 229, 0.08);
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
  font-size: 0.85rem;
  background-color: #e3f2fd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(30, 136, 229, 0.1);
}

/* ===== ENCABEZADOS ===== */
th {
  background: linear-gradient(135deg, #1e88e5, #42a5f5);
  color: white;
  padding: 0.75rem 0.5rem;
  text-align: center;
  font-weight: 600;
  border: 1px solid #1565c0;
}

/* ===== CUERPO DE TABLA ===== */
td {
  padding: 0.5rem;
  text-align: center;
  border: 1px solid #bbdefb;
  background-color: #f9fcff;
}

tbody tr:nth-child(even) {
  background-color: #e1f5fe;
}

tbody tr:hover {
  background-color: #bbdefb;
  transition: background-color 0.2s;
}

/* ===== REGISTROS GUARDADOS ===== */
.registro-guardado {
  background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%);
  border: 1px solid #c8e6c9;
}

.registro-guardado td {
  background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%);
}

.registro-guardado:hover td {
  background: linear-gradient(135deg, #dcedc8 0%, #e8f5e8 100%);
}

/* ===== INPUTS ===== */
input {
  width: 100%;
  border: 1px solid #bbdefb;
  border-radius: 4px;
  padding: 0.4rem;
  text-align: center;
  background-color: white;
  font-size: 0.85rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus {
  outline: none;
  border-color: #1e88e5;
  box-shadow: 0 0 0 2px rgba(30, 136, 229, 0.2);
}

/* ===== FECHA DISPLAY ===== */
.fecha-display {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #546e7a;
  font-weight: 500;
  padding: 0.2rem 0.4rem;
  background-color: rgba(30, 136, 229, 0.08);
  border-radius: 3px;
  border: 1px solid rgba(30, 136, 229, 0.15);
}

/* ===== BOTÓN GUARDAR ===== */
.btn-save {
  background: linear-gradient(135deg, #2e7d32, #4caf50);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
  font-size: 1rem;
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
}

/* ===== BOTÓN ELIMINAR ===== */
.btn-delete {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #DC143C 0%, #AA0000 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
}

.btn-delete:hover {
  background: linear-gradient(135deg, #AA0000 0%, #991b1b 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
}

/* ===== NOTIFICACIONES ===== */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  min-width: 350px;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 1000;
  animation: slideInRight 0.3s ease-out;
  backdrop-filter: blur(10px);
}

.notification.success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border-left: 4px solid #047857;
}

.notification.error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border-left: 4px solid #b91c1c;
}

.notification.warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border-left: 4px solid #b45309;
}

.notification-icon {
  font-size: 1.5rem;
  font-weight: bold;
}

.notification-message {
  flex: 1;
  font-weight: 500;
  font-size: 0.95rem;
}

.notification-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.notification-close:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

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

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .caja-chica-content {
    padding: 1rem;
  }

  .tabla-container {
    padding: 1rem;
  }

  table {
    font-size: 0.75rem;
  }

  th, td {
    padding: 0.25rem;
  }

  .btn-registrar,
  .btn-save {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }

  .notification {
    min-width: 300px;
    right: 10px;
    left: 10px;
    margin: 0 auto;
  }
}

/* Modal de Confirmación Personalizado */
.confirm-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.confirm-modal-content {
  background: white;
  border-radius: 12px;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  animation: confirmModalSlideIn 0.3s ease-out;
  overflow: hidden;
  position: relative;
  z-index: 10000;
}

@keyframes confirmModalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.confirm-modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

.confirm-modal-header h4 {
  margin: 0;
  color: #495057;
  font-size: 1.1rem;
  font-weight: 600;
}

.confirm-modal-body {
  padding: 1.5rem;
}

.confirm-modal-body p {
  margin: 0;
  color: #6c757d;
  font-size: 1rem;
  line-height: 1.5;
}

.confirm-modal-actions {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-cancel-confirm {
  padding: 0.6rem 1.2rem;
  border: 2px solid #6c757d;
  background: white;
  color: #6c757d;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel-confirm:hover {
  background: #6c757d;
  color: white;
  transform: translateY(-1px);
}

.btn-confirm-action {
  padding: 0.6rem 1.2rem;
  border: none;
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-confirm-action:hover {
  background: linear-gradient(135deg, #c82333, #bd2130);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}
</style>
