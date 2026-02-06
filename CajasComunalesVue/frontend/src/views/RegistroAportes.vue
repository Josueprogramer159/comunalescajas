<template>
  <div class="aportes-content">
    <h3>Reportes Mensuales</h3>
    <p class="description">Gestión de reportes mensuales detallados de los socios.</p>

    <!-- Tabla de Reportes Mensuales -->
    <div v-for="(reporte, index) in reportes" :key="index" class="reporte-mensual-section">
      <div class="table-header">
        <h4>Reporte Mensual - {{ reporte.titulo }}</h4>
        <div class="header-buttons">
          <button @click="openAddDataModal(index)" class="btn-add-data-action">
            <span class="btn-icon">+</span>
            Agregar Datos del Socio
          </button>
          <button v-if="index === 0" @click="openNewMesModal" class="btn-add-reporte-action">
            <span class="btn-icon">+</span>
            Registrar Nuevo Mes
          </button>
        </div>
      </div>
      <div class="table-container">
        <table class="reporte-table">
          <thead>
            <tr>
              <th rowspan="2">NOMBRES</th>
              <th colspan="5">AHORROS</th>
              <th rowspan="2">Acciones</th>
            </tr>
            <tr>
              <!-- AHORROS -->
              <th>SALDO ACTUAL</th>
              <th>DEPOSITO</th>
              <th>APORTE INICIAL</th>
              <th>RETIRO</th>
              <th>SALDO</th>
            </tr>
          </thead>
          <tbody>
            <!-- Ejemplo de filas (puedes mapear datos reales aquí) -->
            <tr v-for="(socio, idx) in reporte.data" :key="idx" :class="{ 'registro-guardado': socio.guardado }">
              <td>{{ socio.nombre }}</td>
              <td>${{ (Number(socio.saldo_actual) || 0).toFixed(2) }}</td>
              <td>${{ (Number(socio.deposito) || 0).toFixed(2) }}</td>
              <td>${{ (Number(socio.aporte_inicial) || 0).toFixed(2) }}</td>
              <td>${{ (Number(socio.retiro) || 0).toFixed(2) }}</td>
              <td>${{ (Number(socio.saldo_ahorros) || 0).toFixed(2) }}</td>
              <td>
                <button @click="editData(index, idx)" class="btn-edit-action" title="Editar Datos">Editar</button>
                <button @click="deleteData(index, idx)" class="btn-delete-action" title="Eliminar Datos">Eliminar</button>
              </td>
            </tr>
            <!-- Si no hay datos -->
            <tr v-if="reporte.data.length === 0">
              <td colspan="7" style="text-align: center; padding: 2rem; color: #666;">
                No hay datos disponibles para este mes.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal para Registrar Nuevo Mes -->
    <div v-if="showNewMesModal" class="modal-overlay" @click="closeNewMesModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>Registrar Nuevo Mes</h4>
          <button @click="closeNewMesModal" class="btn-close">✕</button>
        </div>
        <form @submit.prevent="addNewReporte" class="aporte-form">
          <div class="form-row">
            <div class="form-group">
              <label for="new_mes">Mes *</label>
              <select v-model="newMesForm.mes" id="new_mes" required>
                <option value="">Seleccionar Mes</option>
                <option value="Enero">Enero</option>
                <option value="Febrero">Febrero</option>
                <option value="Marzo">Marzo</option>
                <option value="Abril">Abril</option>
                <option value="Mayo">Mayo</option>
                <option value="Junio">Junio</option>
                <option value="Julio">Julio</option>
                <option value="Agosto">Agosto</option>
                <option value="Septiembre">Septiembre</option>
                <option value="Octubre">Octubre</option>
                <option value="Noviembre">Noviembre</option>
                <option value="Diciembre">Diciembre</option>
              </select>
            </div>
            <div class="form-group">
              <label for="new_anio">Año *</label>
              <input
                v-model="newMesForm.anio"
                type="number"
                id="new_anio"
                min="2020"
                :max="new Date().getFullYear()"
                required
              />
            </div>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeNewMesModal" class="btn-cancel-action">Cancelar</button>
            <button type="submit" class="btn-save-action">Aceptar</button>
          </div>
        </form>
      </div>
    </div>



    <!-- Modal para Agregar Datos del Socio -->
    <div v-if="showAddDataModal" class="modal-overlay" @click="closeAddDataModal">
      <div class="modal-content" @click.stop style="width: 650px;">
        <div class="modal-header">
          <h4>{{ editingIndex !== null ? 'Editar Datos del Socio' : 'Agregar Datos del Socio' }}</h4>
          <button @click="closeAddDataModal" class="btn-close">✕</button>
        </div>
        <form @submit.prevent="addData" class="aporte-form">
          <div class="form-row full">
            <div class="form-group">
              <label for="data_socio_id">Socio *</label>
              <select v-model="dataForm.socio_id" id="data_socio_id" required>
                <option value="">Seleccionar Socio</option>
                <option v-for="socio in socios" :key="socio.id" :value="socio.id">
                  {{ socio.numero_socio }} - {{ socio.nombre_completo }}
                </option>
              </select>
            </div>
          </div>
          <h5>Ahorros</h5>
          <div class="form-row">
            <div class="form-group">
              <label for="saldo_actual">Saldo Actual</label>
              <input v-model.number="dataForm.saldo_actual" type="number" id="saldo_actual" step="0.01" />
            </div>
            <div class="form-group">
              <label for="deposito">Deposito</label>
              <input 
                v-model.number="dataForm.deposito" 
                type="number" 
                id="deposito" 
                step="0.01"
                @input="(e) => console.log('Input deposito:', e.target.value, 'dataForm.deposito:', dataForm.deposito)"
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="aporte_inicial">Aporte Inicial</label>
              <input v-model.number="dataForm.aporte_inicial" type="number" id="aporte_inicial" step="0.01" />
            </div>
            <div class="form-group">
              <label for="retiro">Retiro</label>
              <input v-model.number="dataForm.retiro" type="number" id="retiro" step="0.01" />
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeAddDataModal" class="btn-cancel-action">Cancelar</button>
            <button type="submit" class="btn-save-action">{{ editingIndex !== null ? 'Actualizar' : 'Agregar' }}</button>
          </div>
        </form>
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

    <!-- Notificaciones Personalizadas -->
    <div v-if="showNotification" class="notification-overlay">
      <div :class="['notification-content', `notification-${notificationType}`]">
        <div class="notification-icon">
          <span v-if="notificationType === 'success'">✓</span>
          <span v-else-if="notificationType === 'error'">✗</span>
          <span v-else>ℹ</span>
        </div>
        <div class="notification-message">
          {{ notificationMessage }}
        </div>
        <button @click="showNotification = false" class="notification-close">
          ×
        </button>
      </div>
    </div>


  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

// Estado para el reporte mensual (datos estáticos, sin persistencia)
const socios = ref([])
const reportes = ref([
  {
    id: 1,
    titulo: 'JUNIO DE 2024',
    mes: 'Junio',
    anio: 2024,
    data: []
  }
])

// Cargar socios desde la API para que coincida con ListadosSocios.vue
const loadSocios = async () => {
  try {
    const response = await fetch('/api/socios')
    const result = await response.json()
    if (result.success) {
      socios.value = result.data
    } else {
      console.error('Error loading socios:', result.message)
      socios.value = []
    }
  } catch (error) {
    console.error('Error cargando socios:', error.message)
    socios.value = []
  }
}

// Función para convertir número del mes a nombre
const numeroMesANombre = (numeroMes) => {
  const meses = {
    1: 'Enero',
    2: 'Febrero',
    3: 'Marzo',
    4: 'Abril',
    5: 'Mayo',
    6: 'Junio',
    7: 'Julio',
    8: 'Agosto',
    9: 'Septiembre',
    10: 'Octubre',
    11: 'Noviembre',
    12: 'Diciembre'
  }
  return meses[numeroMes] || 'Desconocido'
}

const loadRegistrosAportes = async () => {
  try {
    const response = await fetch('/api/registro-aportes')
    const result = await response.json()
    if (result.success) {
      // Agrupar registros por mes y año
      const registrosPorMes = {}

      result.data.forEach(registro => {
        // Convertir el número de mes a nombre
        const nombreMes = numeroMesANombre(registro.reporte_mes)
        const key = `${registro.reporte_mes}_${registro.reporte_anio}`
        if (!registrosPorMes[key]) {
          registrosPorMes[key] = {
            titulo: `${nombreMes.toUpperCase()} DE ${registro.reporte_anio}`,
            mes: nombreMes,
            anio: registro.reporte_anio,
            data: []
          }
        }

        registrosPorMes[key].data.push({
          id: registro.id,
          socio_id: registro.socio_id,
          nombre: registro.socio_nombre,
          saldo_actual: registro.saldo_actual,
          deposito: registro.deposito || 0,
          aporte_inicial: registro.aporte_inicial,
          retiro: registro.retiro,
          saldo_ahorros: registro.saldo_ahorros,
          guardado: true // Marcar como guardado en BD
        })
      })

      // Convertir el objeto agrupado a array y reemplazar los reportes iniciales
      const reportesGuardados = Object.values(registrosPorMes)

      // Si hay reportes guardados, reemplazar los reportes iniciales
      if (reportesGuardados.length > 0) {
        reportes.value = reportesGuardados
      }
    } else {
      console.error('Error loading registros de aportes:', result.message)
    }
  } catch (error) {
    console.error('Error cargando registros de aportes:', error.message)
    reportes.value = []
  }
}

onMounted(() => {
  loadSocios()
  loadRegistrosAportes()
})

const showNewMesModal = ref(false)
const newMesForm = ref({
  mes: '',
  anio: new Date().getFullYear()
})
const showAddDataModal = ref(false)
const currentReporteIndex = ref(0)
const editingIndex = ref(null)
const dataForm = ref({
  socio_id: '',
  nombre: '',
  saldo_actual: 0,
  deposito: 0,
  aporte_inicial: 0,
  retiro: 0,
  saldo_ahorros: 0
})

// Estado para notificaciones (reemplaza alert())
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref('success') // success, error, info

// Estado para el modal de confirmación
const showConfirmModal = ref(false)
const confirmAction = ref(null)
const confirmMessage = ref('')

// Función para mostrar notificación personalizada (reemplaza alert)
function showCustomNotification(message, type = 'success') {
  notificationMessage.value = message
  notificationType.value = type
  showNotification.value = true
  
  // Auto-cerrar después de 3 segundos
  setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

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


const closeNewMesModal = () => {
  showNewMesModal.value = false
  newMesForm.value = { mes: '', anio: new Date().getFullYear() }
}

const addNewReporte = () => {
  // Simular agregar reporte sin guardar en DB
  const newReporte = {
    id: reportes.value.length + 1,
    titulo: `${newMesForm.value.mes.toUpperCase()} DE ${newMesForm.value.anio}`,
    mes: newMesForm.value.mes,
    anio: newMesForm.value.anio,
    data: []
  }
  reportes.value.push(newReporte)
  closeNewMesModal()
}

const openNewMesModal = () => {
  showNewMesModal.value = true
}

const openAddDataModal = (index) => {
  currentReporteIndex.value = index
  editingIndex.value = null
  // Resetear el formulario
  dataForm.value = {
    socio_id: '',
    nombre: '',
    saldo_actual: 0,
    deposito: 0,
    aporte_inicial: 0,
    retiro: 0,
    saldo_ahorros: 0
  }
  showAddDataModal.value = true
}

const editData = (reporteIdx, dataIdx) => {
  currentReporteIndex.value = reporteIdx
  editingIndex.value = dataIdx
  const registro = reportes.value[reporteIdx].data[dataIdx]
  dataForm.value = {
    ...registro,
    editing: true, // Marcar que estamos editando
    registroId: registro.id // Guardar el ID del registro para actualizar
  }
  showAddDataModal.value = true
}

// Función para convertir nombre del mes a número
const mesNombreANumero = (mesNombre) => {
  const meses = {
    'Enero': 1,
    'Febrero': 2,
    'Marzo': 3,
    'Abril': 4,
    'Mayo': 5,
    'Junio': 6,
    'Julio': 7,
    'Agosto': 8,
    'Septiembre': 9,
    'Octubre': 10,
    'Noviembre': 11,
    'Diciembre': 12
  }
  return meses[mesNombre] || 1
}

const addData = async () => {
  const selectedSocio = socios.value.find(s => s.id == dataForm.value.socio_id)
  if (!selectedSocio) {
    alert('Socio no encontrado')
    return
  }

  dataForm.value.nombre = selectedSocio.nombre_completo

  // Calcular saldo JUSTO ANTES DE GUARDAR
  const saldoActual = parseFloat(dataForm.value.saldo_actual) || 0
  const deposito = parseFloat(dataForm.value.deposito) || 0
  const aporteInicial = parseFloat(dataForm.value.aporte_inicial) || 0
  const retiro = parseFloat(dataForm.value.retiro) || 0
  const saldoFinal = saldoActual + deposito + aporteInicial - retiro
  
  // Debug: verificar el valor de deposito
  console.log('Valor de deposito en addData:', dataForm.value.deposito)
  console.log('Tipo de dato deposito:', typeof dataForm.value.deposito)
  console.log('Deposito parseado:', deposito)
  console.log('DataForm completo:', dataForm.value)
  console.log('Saldo calculado:', saldoFinal)

  const currentReporte = reportes.value[currentReporteIndex.value]

  console.log('🔍 Debug - Estado de edición:')
  console.log('- editingIndex.value:', editingIndex.value)
  console.log('- currentReporteIndex.value:', currentReporteIndex.value)
  console.log('- Es edición:', editingIndex.value !== null)

  try {
    console.log('📤 Enviando datos al servidor:', {
      socio_id: dataForm.value.socio_id,
      reporte_mes: mesNombreANumero(currentReporte.mes),
      reporte_anio: currentReporte.anio,
      socio_nombre: dataForm.value.nombre,
      saldo_actual: dataForm.value.saldo_actual,
      deposito: deposito,
      aporte_inicial: dataForm.value.aporte_inicial,
      retiro: dataForm.value.retiro,
      saldo_ahorros: dataForm.value.saldo_ahorros
    })

    let response
    const requestData = {
      socio_id: dataForm.value.socio_id,
      reporte_mes: mesNombreANumero(currentReporte.mes),
      reporte_anio: currentReporte.anio,
      socio_nombre: dataForm.value.nombre,
      saldo_actual: dataForm.value.saldo_actual,
      deposito: deposito,
      aporte_inicial: dataForm.value.aporte_inicial,
      retiro: dataForm.value.retiro,
      saldo_ahorros: saldoFinal
    }

    // Si estamos editando, usar PUT para actualizar
    if (editingIndex.value !== null) {
      const registroId = reportes.value[currentReporteIndex.value].data[editingIndex.value].id
      console.log('🔄 Actualizando registro existente con ID:', registroId)
      
      response = await fetch(`/api/registro-aportes/${registroId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
    } else {
      console.log('➕ Creando nuevo registro')
      response = await fetch('/api/registro-aportes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
    }

    console.log('Respuesta del servidor - Status:', response.status)
    console.log('Respuesta del servidor - Headers:', response.headers)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error HTTP:', response.status, errorText)
      throw new Error(`Error HTTP ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    console.log(' Respuesta JSON del servidor:', result)
    console.log(' Datos guardados:', result.data)
    console.log(' Valor deposito guardado:', result.data?.deposito)

    if (result.success) {
      // Eliminado: alert('Registro guardado correctamente')
      // Recargar los registros para mostrar los datos actualizados
      await loadRegistrosAportes()
      closeAddDataModal()
    } else {
      console.error(' Error del servidor:', result.message)
      showCustomNotification(`Error al guardar el registro: ${result.message}`, 'error')
    }
  } catch (error) {
    console.error(' Error completo en addData:', error)
    console.error(' Stack trace:', error.stack)
    
    // Debug: verificar el valor de deposito en simulación
    console.log('Valor de deposito (simulación):', dataForm.value.deposito)
    console.log('Tipo de dato deposito (simulación):', typeof dataForm.value.deposito)
    console.log('Deposito convertido (simulación):', deposito)
    
    // Simular guardado exitoso cuando el backend no está disponible
    const updatedData = {
      id: editingIndex.value !== null ? reportes.value[currentReporteIndex.value].data[editingIndex.value].id : Date.now(),
      socio_id: dataForm.value.socio_id,
      nombre: dataForm.value.nombre,
      saldo_actual: dataForm.value.saldo_actual,
      deposito: deposito,
      aporte_inicial: dataForm.value.aporte_inicial,
      retiro: dataForm.value.retiro,
      saldo_ahorros: dataForm.value.saldo_ahorros,
      guardado: false // Marcar como no guardado en BD
    }
    
    console.log('Datos a actualizar/guardar:', updatedData)

    // Si estamos editando, reemplazar el registro existente
    if (editingIndex.value !== null) {
      console.log('Actualizando registro existente en índice:', editingIndex.value)
      reportes.value[currentReporteIndex.value].data[editingIndex.value] = updatedData
    } else {
      // Si no, agregar nuevo registro
      console.log('Agregando nuevo registro')
      reportes.value[currentReporteIndex.value].data.push(updatedData)
    }

    showCustomNotification('Registro guardado localmente (backend no disponible)', 'info')
    closeAddDataModal()
  }
}

const closeAddDataModal = () => {
  showAddDataModal.value = false
  currentReporteIndex.value = null
  editingIndex.value = null
  dataForm.value = {
    socio_id: '',
    nombre: '',
    saldo_actual: 0,
    deposito: 0,
    aporte_inicial: 0,
    retiro: 0,
    saldo_ahorros: 0
  }
}

const deleteData = async (reporteIdx, dataIdx) => {
  const registro = reportes.value[reporteIdx].data[dataIdx]

  // Si el registro está guardado en BD, eliminar de la base de datos
  if (registro.guardado && registro.id) {
    showCustomConfirm(
      '¿Está seguro de que desea eliminar este registro de la base de datos? Esta acción no se puede deshacer.',
      async () => {
        try {
          const response = await fetch(`/api/registro-aportes/${registro.id}`, {
            method: 'DELETE'
          })

          const result = await response.json()

          if (result.success) {
            // Eliminado: alert('Registro eliminado correctamente de la base de datos')
            // Recargar los registros para actualizar la vista
            await loadRegistrosAportes()
          } else {
            showCustomNotification(`Error al eliminar el registro: ${result.message}`, 'error')
          }
        } catch (error) {
          console.error('Error eliminando registro:', error)
          showCustomNotification('Error de conexión al eliminar el registro', 'error')
        }
      }
    )
  } else {
    // Si no está guardado, solo eliminar del array local
    showCustomConfirm(
      '¿Está seguro de que desea eliminar este registro?',
      () => {
        reportes.value[reporteIdx].data.splice(dataIdx, 1)
      }
    )
  }
}

// MOVER TODOS LOS WATCHERS AL FINAL DESPUÉS DE TODAS LAS DECLARACIONES
// Función para calcular el saldo automáticamente
const calcularSaldo = () => {
  if (dataForm.value) {
    const saldoActual = parseFloat(dataForm.value.saldo_actual) || 0
    const deposito = parseFloat(dataForm.value.deposito) || 0
    const aporteInicial = parseFloat(dataForm.value.aporte_inicial) || 0
    const retiro = parseFloat(dataForm.value.retiro) || 0
    
    // Saldo = Saldo Actual + Deposito + Aporte Inicial - Retiro
    dataForm.value.saldo_ahorros = saldoActual + deposito + aporteInicial - retiro
  }
}

// Watcher para actualizar aporte inicial cuando se selecciona un socio
watch(() => dataForm.value?.socio_id, (newSocioId) => {
  if (newSocioId && socios.value && socios.value.length > 0) {
    const selectedSocio = socios.value.find(s => s.id == newSocioId)
    if (selectedSocio) {
      // Auto-llenar aporte inicial con el ahorro mensual del socio (asegurando que sea número)
      dataForm.value.aporte_inicial = parseFloat(selectedSocio.ahorro_mensual) || 0
    }
  } else {
    if (dataForm.value) {
      dataForm.value.aporte_inicial = 0
    }
  }
})
</script>

<style scoped>
/* ===== CONTENEDOR GENERAL ===== */
.aportes-content {
  background-color: #f5f7fa;
  padding: 2rem;
  border-radius: 12px;
}

h3 {
  color: #1e88e5;
  font-weight: 700;
}

.description {
  color: #546e7a;
  margin-bottom: 1.5rem;
}

/* ===== SECCIONES ===== */
.aportes-table-section,
.reporte-mensual-section {
  background: white;
  padding: 1.75rem;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(30, 136, 229, 0.08);
  margin-bottom: 2rem;
}

/* ===== HEADER DE TABLAS ===== */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.table-header h4 {
  color: #1565c0;
  font-weight: 600;
}

/* ===== BOTONES DE ACCIÓN ===== */
.btn-add-data-action,
.btn-add-reporte-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-add-data-action:hover,
.btn-add-reporte-action:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

/* ===== BOTONES EN TABLA ===== */
.btn-edit-action,
.btn-delete-action {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 0.25rem;
}

.btn-edit-action {
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 82, 204, 0.3);
}

.btn-edit-action:hover {
  background: linear-gradient(135deg, #357abd 0%, #2c5aa0 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 82, 204, 0.4);
}

.btn-delete-action {
  background: linear-gradient(135deg, #DC143C 0%, #AA0000 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
}

.btn-delete-action:hover {
  background: linear-gradient(135deg, #AA0000 0%, #991b1b 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
}

/* ===== TABLAS GENERALES ===== */
.table-container {
  overflow-x: auto;
}

.aportes-table,
.reporte-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

/* ===== ENCABEZADOS ===== */
.aportes-table th,
.reporte-table th {
  background: #1e88e5;
  color: white;
  padding: 0.75rem;
  text-align: center;
  font-weight: 600;
  border: 1px solid #1565c0;
}

/* Subencabezados reporte */
.reporte-table thead tr:first-child th {
  background: #1565c0;
  font-size: 1rem;
}

/* ===== CUERPO DE TABLAS ===== */
.aportes-table td,
.reporte-table td {
  padding: 0.65rem;
  text-align: center;
  border: 1px solid #dbeafe;
  background-color: #e3f2fd;
}

.aportes-table tbody tr:hover,
.reporte-table tbody tr:hover {
  background-color: #bbdefb;
}

/* ===== REGISTROS GUARDADOS ===== */
.reporte-mensual-section:has(.registro-guardado) {
  border-left: 4px solid #4caf50;
  background: linear-gradient(135deg, #f1f8e9 0%, #ffffff 100%);
}

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

/* ===== ESTADOS ===== */
.status-Pagado {
  color: #2e7d32;
  font-weight: 600;
}

.status-Pendiente {
  color: #f9a825;
  font-weight: 600;
}

.status-Atrasado {
  color: #c62828;
  font-weight: 600;
}

/* ===== TEXTO VERTICAL REPORTE ===== */
.reporte-table th[rowspan] {
  vertical-align: middle;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  white-space: nowrap;
  background: #1565c0;
}

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(30, 136, 229, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 14px;
  width: 520px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 2px solid #e3f2fd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h4 {
  color: #1e88e5;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #1e88e5;
}

/* ===== FORMULARIO ===== */
.aporte-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-row.full {
  grid-template-columns: 1fr;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #455a64;
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #bbdefb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #1e88e5;
  box-shadow: 0 0 0 2px rgba(30, 136, 229, 0.2);
  background: #f8f9fa;
}

.form-group input[readonly] {
  background-color: #f5f5f5;
  color: #666;
  cursor: not-allowed;
}

.form-group input[readonly]:focus {
  background-color: #f5f5f5;
  box-shadow: none;
}

.aporte-form h5 {
  color: #1e88e5;
  font-weight: 700;
  margin: 0.5rem 0 1rem 0;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e3f2fd;
  padding-bottom: 0.5rem;
}

/* ===== ACCIONES FORM ===== */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e3f2fd;
}

.btn-cancel-action,
.btn-save-action {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-cancel-action {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(107, 114, 128, 0.3);
}

.btn-cancel-action:hover {
  background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(107, 114, 128, 0.4);
}

.btn-save-action {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-save-action:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.header-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-add-data,
.btn-add-reporte {
  background: linear-gradient(135deg, #1e88e5, #42a5f5);
  color: white;
  border: none;
  padding: 0.6rem 1.1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: transform 0.2s, box-shadow 0.2s;
  font-size: 0.9rem;
}

.btn-add-data:hover,
.btn-add-reporte:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(30, 136, 229, 0.35);
}

/* Notificaciones Personalizadas */
.notification-overlay {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10001;
  animation: notificationSlideIn 0.3s ease-out;
}

@keyframes notificationSlideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  max-width: 500px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.notification-success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.notification-error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.notification-info {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.notification-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
}

.notification-message {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.4;
}

.notification-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.notification-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
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
