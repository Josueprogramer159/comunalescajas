<template>
  <div class="aportes-content">
    <!-- ENCABEZADO Y CONTROLES -->
    <div class="header-section">
      <div class="header-title">
        <h3>Registro de Aportes</h3>
        <p class="subtitle">Gestión de aportes mensuales de los socios</p>
      </div>
      <button class="btn-registrar" @click="showModal = true">+ Registro de aportes</button>
    </div>

    <!-- FILTROS DE BÚSQUEDA -->
    <div class="filtros-section">
      <div class="filtro-grupo">
        <label for="filtro-mes">Filtrar por Mes:</label>
        <select v-model="filtroMes" id="filtro-mes">
          <option value="">Todos los meses</option>
          <option v-for="mes in meses" :key="mes" :value="mes">{{ mes }}</option>
        </select>
      </div>
      <div class="filtro-grupo">
        <label for="filtro-anio">Filtrar por Año:</label>
        <select v-model="filtroAnio" id="filtro-anio">
          <option value="">Todos los años</option>
          <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">{{ anio }}</option>
        </select>
      </div>
      <button v-if="filtroMes || filtroAnio" class="btn-limpiar-filtros" @click="limpiarFiltros">
        Limpiar Filtros
      </button>
      <span class="contador-registros">{{ libretasFiltradas.length }} registro(s)</span>
    </div>

    <!-- MODAL -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h4>Nueva Libreta de Aportes</h4>
        <form @submit.prevent="crearLibreta">
          <div class="form-group">
            <label>Mes *</label>
            <select v-model="form.mes" required>
              <option value="">Seleccionar Mes</option>
              <option v-for="mes in meses" :key="mes" :value="mes">{{ mes }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Año *</label>
            <input type="number" v-model.number="form.anio" :max="new Date().getFullYear()" required />
          </div>
          <div class="modal-actions">
            <button class="btn-accept">Aceptar</button>
            <button type="button" class="btn-cancel" @click="closeModal">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MENSAJE CUANDO NO HAY REGISTROS -->
    <div v-if="libretasFiltradas.length === 0" class="sin-registros">
      <div class="sin-registros-content">
        <div class="sin-registros-icon">📋</div>
        <h4>No hay registros de aportes</h4>
        <p>{{ filtroMes || filtroAnio ? 'No se encontraron aportes para los filtros seleccionados.' : 'Comienza agregando el primer registro de aportes.' }}</p>
        <button class="btn-registrar" @click="showModal = true">+ Crear Registro</button>
      </div>
    </div>

    <!-- LIBRETAS -->
    <div v-for="(libreta, index) in libretasFiltradas" :key="index" class="libreta">
      <div class="libreta-header">
        <div>
          <h4>REGISTRO DE APORTES</h4>
          <p><b>Mes:</b> {{ libreta.mes }} {{ libreta.anio }}</p>
        </div>
        <div class="header-buttons">
          <button class="btn-guardar" @click="guardarLibreta(libreta)">Guardar</button>
          <button class="btn-agregar-fila" @click="agregarFila(libreta)">Agregar fila</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>N°</th>
            <th>SOCIO</th>
            <th>SALDO ACTUAL</th>
            <th>DEPOSITO</th>
            <th>APORTE INICIAL</th>
            <th>RETIRO</th>
            <th>SALDO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(fila, i) in libreta.filas"
            :key="i"
            :class="{ 'fila-guardada': fila.guardado }"
          >
            <td>{{ i + 1 }}</td>
            <td>
              <select
                v-model="fila.socio_id"
                :disabled="fila.guardado && !fila.editando"
                @change="cargarDatosSocio(fila)"
              >
                <option value="">Seleccionar socio</option>
                <option v-for="socio in socios" :key="socio.id" :value="socio.id">
                  {{ socio.numero_socio }} - {{ socio.nombre_completo }}
                </option>
              </select>
            </td>
            <td>
              <input
                type="number"
                v-model.number="fila.saldo_actual"
                @input="calcularFila(fila)"
                :disabled="fila.guardado && !fila.editando"
                step="0.01"
              />
            </td>
            <td>
              <input
                type="number"
                v-model.number="fila.deposito"
                @input="calcularFila(fila)"
                :disabled="fila.guardado && !fila.editando"
                step="0.01"
              />
            </td>
            <td>
              <input
                type="number"
                v-model.number="fila.aporte_inicial"
                @input="calcularFila(fila)"
                :disabled="fila.guardado && !fila.editando"
                step="0.01"
              />
            </td>
            <td>
              <input
                type="number"
                v-model.number="fila.retiro"
                @input="calcularFila(fila)"
                :disabled="fila.guardado && !fila.editando"
                step="0.01"
              />
            </td>
            <td>{{ format(fila.saldo_ahorros) }}</td>
            <td>
              <div class="action-buttons">
                <button
                  v-if="!fila.guardado"
                  @click="eliminarFila(libreta, i)"
                  class="btn-delete-action"
                  title="Eliminar Registro"
                >
                  Eliminar
                </button>
                <button
                  v-if="fila.guardado"
                  @click="editarRegistroGuardado(fila)"
                  class="btn-edit-action"
                  title="Editar Registro"
                >
                  {{ fila.editando ? 'Cancelar' : 'Editar' }}
                </button>
                <button
                  v-if="fila.guardado"
                  @click="eliminarRegistroGuardado(fila, libreta)"
                  class="btn-delete-action"
                  title="Eliminar Registro"
                >
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th colspan="2">TOTALES</th>
            <th>{{ format(total(libreta, 'saldo_actual')) }}</th>
            <th>{{ format(total(libreta, 'deposito')) }}</th>
            <th>{{ format(total(libreta, 'aporte_inicial')) }}</th>
            <th>{{ format(total(libreta, 'retiro')) }}</th>
            <th>{{ format(total(libreta, 'saldo_ahorros')) }}</th>
            <th></th>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Toast de Éxito Centrado -->
    <div v-if="showSuccessToast" class="success-toast-overlay">
      <div class="success-toast-content">
        <div class="success-toast-icon"><span>✓</span></div>
        <div class="success-toast-message">{{ successToastMessage }}</div>
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
import { ref, onMounted, computed } from 'vue'

const showModal = ref(false)
const socios = ref([])
const libretas = ref([])
const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO','JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE']
const form = ref({
  mes: '',
  anio: new Date().getFullYear()
})

// Filtros
const filtroMes = ref('')
const filtroAnio = ref('')

// Estado para notificaciones (reemplaza alert())
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref('success') // success, error, info

// Estado para toast de éxito centrado
const showSuccessToast = ref(false)
const successToastMessage = ref('')

// Estado para el modal de confirmación
const showConfirmModal = ref(false)
const confirmAction = ref(null)
const confirmMessage = ref('')

// Computed: Años disponibles para filtro
const aniosDisponibles = computed(() => {
  const anios = new Set()
  libretas.value.forEach(libreta => {
    anios.add(libreta.anio)
  })
  const aniosArray = Array.from(anios).sort((a, b) => b - a)
  
  // Si no hay años en libretas, mostrar años de la base de datos
  if (aniosArray.length === 0) {
    const currentYear = new Date().getFullYear()
    return [currentYear, currentYear - 1, currentYear - 2]
  }
  return aniosArray
})

// Computed: Libretas filtradas
const libretasFiltradas = computed(() => {
  return libretas.value.filter(libreta => {
    const mesCoincide = !filtroMes.value || libreta.mes === filtroMes.value
    const anioCoincide = !filtroAnio.value || libreta.anio === parseInt(filtroAnio.value)
    return mesCoincide && anioCoincide
  })
})

// Función para limpiar filtros
const limpiarFiltros = () => {
  filtroMes.value = ''
  filtroAnio.value = ''
}

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

// Función para mostrar toast de éxito centrado
function showSuccessToastMessage(message) {
  successToastMessage.value = message
  showSuccessToast.value = true
  
  // Auto-cerrar después de 2 segundos
  setTimeout(() => {
    showSuccessToast.value = false
  }, 2000)
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

onMounted(async () => {
  await loadSocios()
  await loadRegistrosAportes()
})

// ===== CARGAR SOCIOS =====
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

// ===== CARGAR REGISTROS DE APORTES =====
const loadRegistrosAportes = async () => {
  try {
    const response = await fetch('/api/registro-aportes')
    const result = await response.json()
    if (result.success && result.data.length > 0) {
      // Agrupar registros por mes y año
      const registrosPorMes = {}
      
      result.data.forEach(registro => {
        const mes = registro.reporte_mes || 'SIN MES'
        const anio = registro.reporte_anio || new Date().getFullYear()
        const key = `${mes}_${anio}`
        
        if (!registrosPorMes[key]) {
          registrosPorMes[key] = {
            mes: getMesNombre(mes),
            anio: anio,
            filas: []
          }
        }
        
        registrosPorMes[key].filas.push({
          id: registro.id,
          socio_id: registro.socio_id,
          saldo_actual: Number(registro.saldo_actual),
          deposito: Number(registro.deposito),
          aporte_inicial: Number(registro.aporte_inicial),
          retiro: Number(registro.retiro),
          saldo_ahorros: Number(registro.saldo_ahorros),
          guardado: true,
          editando: false
        })
      })
      
      // Convertir a array y ordenar por mes y año (más reciente primero)
      const libretasCargadas = Object.values(registrosPorMes).sort((a, b) => {
        if (b.anio !== a.anio) return b.anio - a.anio
        return meses.indexOf(b.mes) - meses.indexOf(a.mes)
      })
      libretas.value = libretasCargadas
    }
  } catch (error) {
    console.log('Backend no disponible, empezando con libretas vacías:', error.message)
    libretas.value = []
  }
}

const getMesNombre = (numMes) => {
  const mesesNombres = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE']
  if (typeof numMes === 'number' && numMes >= 1 && numMes <= 12) {
    return mesesNombres[numMes - 1]
  }
  return numMes
}

const nuevaFila = () => ({
  socio_id: '',
  saldo_actual: 0,
  deposito: 0,
  aporte_inicial: 0,
  retiro: 0,
  saldo_ahorros: 0,
  guardado: false,
  editando: false
})

const crearLibreta = () => {
  libretas.value.push({
    mes: form.value.mes,
    anio: form.value.anio,
    filas: [nuevaFila()]
  })
  closeModal()
}

// ===== NUEVA FUNCIÓN: CARGAR DATOS DEL SOCIO ANTERIOR =====
const cargarDatosSocio = (fila) => {
  if (!fila.socio_id) {
    // Si se borra el socio, limpiar campos
    fila.saldo_actual = 0
    fila.saldo_ahorros = 0
    return
  }
  
  // Buscar el último saldo de este socio en meses anteriores
  let ultimoSaldo = 0
  let encontrado = false
  
  // Recorremos las libretas de la más reciente a la más antigua
  for (let i = libretas.value.length - 1; i >= 0; i--) {
    const libreta = libretas.value[i]
    // Buscar en las filas de esa libreta
    for (let j = libreta.filas.length - 1; j >= 0; j--) {
      const f = libreta.filas[j]
      if (f.socio_id === fila.socio_id && f.guardado) {
        // Encontramos el registro más reciente de este socio
        ultimoSaldo = f.saldo_ahorros || 0
        encontrado = true
        break
      }
    }
    if (encontrado) break
  }
  
  // Si encontramos historial, cargamos los datos
  if (encontrado && ultimoSaldo > 0) {
    fila.saldo_actual = ultimoSaldo
    fila.deposito = 0
    fila.aporte_inicial = 0
    fila.retiro = 0
    fila.saldo_ahorros = ultimoSaldo
    showCustomNotification(`Socio encontrado. Saldo anterior cargado: ${format(ultimoSaldo)}`, 'info')
  } else {
    // Si es la primera vez que el socio hace un aporte
    fila.saldo_actual = 0
    fila.saldo_ahorros = 0
  }
}

// ===== FUNCIÓN CALCULAR CORREGIDA =====
const calcularFila = (fila) => {
  // Convertir todos los valores a números explícitamente
  const saldoActual = Number(fila.saldo_actual) || 0
  const deposito = Number(fila.deposito) || 0
  const aporteInicial = Number(fila.aporte_inicial) || 0
  const retiro = Number(fila.retiro) || 0
  
  console.log('Calcular fila:', { saldoActual, deposito, aporteInicial, retiro })
  
  // FÓRMULA: Saldo Actual + Deposito + Aporte Inicial - Retiro
  fila.saldo_ahorros = saldoActual + deposito + aporteInicial - retiro
  
  console.log('Resultados:', { saldoAhorros: fila.saldo_ahorros })
}

const agregarFila = (libreta) => {
  libreta.filas.push(nuevaFila())
}

const guardarLibreta = async (libreta) => {
  // Obtener filas nuevas Y filas editadas
  const filasNuevas = libreta.filas.filter(f => !f.guardado && f.socio_id)
  const filasEditadas = libreta.filas.filter(f => f.guardado && f.editando && f.socio_id)
  const todasLasFilas = [...filasNuevas, ...filasEditadas]
  
  if (todasLasFilas.length === 0) {
    showCustomNotification('No hay registros nuevos o editados para guardar', 'info')
    return
  }
  
  // Validar que todas las filas tengan socio
  const filaIncompleta = todasLasFilas.find(f => !f.socio_id)
  if (filaIncompleta) {
    showCustomNotification('Todos los registros deben tener un socio seleccionado', 'error')
    return
  }
  
  // Calcular valores para todas las filas
  todasLasFilas.forEach(calcularFila)
  
  try {
    const mesNum = meses.indexOf(libreta.mes) + 1
    
    const response = await fetch(`/api/registro-aportes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filas: todasLasFilas.map(f => ({
          socio_id: f.socio_id,
          reporte_mes: mesNum,
          reporte_anio: libreta.anio,
          saldo_actual: f.saldo_actual,
          deposito: f.deposito,
          aporte_inicial: f.aporte_inicial,
          retiro: f.retiro,
          saldo_ahorros: f.saldo_ahorros,
          id: f.id
        }))
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      showSuccessToastMessage(`Registros guardados correctamente (${result.filasGuardadas} registros)`)
      
      // Actualizar solo el estado editando sin recargar
      filasNuevas.forEach(fila => {
        fila.guardado = true
        fila.editando = false
      })
      filasEditadas.forEach(fila => {
        fila.editando = false
      })
    } else {
      showCustomNotification(`Error al guardar: ${result.message}`, 'error')
    }
  } catch (error) {
    console.log('Backend no disponible, simulando guardado exitoso:', error.message)
    
    // Simular guardado exitoso cuando el backend no está disponible
    filasNuevas.forEach(fila => {
      fila.id = Date.now() + Math.random() // Asignar ID temporal
      fila.guardado = true
      fila.editando = false
    })
    filasEditadas.forEach(fila => {
      fila.editando = false
    })
    
    showSuccessToastMessage(`Registros guardados localmente (${todasLasFilas.length} registros)`)
  }
}

const eliminarFila = (libreta, index) => {
  libreta.filas.splice(index, 1)
}

const editarRegistroGuardado = async (fila) => {
  if (!fila.id) {
    showCustomNotification('No se puede editar: registro sin ID', 'error')
    return
  }
  
  // Marcar como en edición
  fila.editando = !fila.editando
  
  if (fila.editando === false) {
    // Si salimos de edición, guardar cambios
    try {
      const response = await fetch(`/api/registro-aportes/${fila.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          saldo_actual: fila.saldo_actual,
          deposito: fila.deposito,
          aporte_inicial: fila.aporte_inicial,
          retiro: fila.retiro
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        showSuccessToastMessage('Registro actualizado correctamente')
      } else {
        showCustomNotification(`Error al actualizar: ${result.message}`, 'error')
        fila.editando = true
      }
    } catch (error) {
      console.log('Backend no disponible, cambios guardados localmente')
    }
  }
}

const eliminarRegistroGuardado = async (fila, libreta) => {
  if (!fila.id) {
    showCustomNotification('No se puede eliminar: registro sin ID', 'error')
    return
  }
  
  showCustomConfirm('¿Está seguro de que desea eliminar este registro de la base de datos? Esta acción no se puede deshacer.', async () => {
    try {
      const response = await fetch(`/api/registro-aportes/${fila.id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        await loadRegistrosAportes()
      } else {
        showCustomNotification(`Error al eliminar el registro: ${result.message}`, 'error')
      }
    } catch (error) {
      console.log('Backend no disponible, simulando eliminación exitosa:', error.message)
      
      // Simular eliminación exitosa cuando el backend no está disponible
      const index = libreta.filas.findIndex(f => f.id === fila.id)
      if (index !== -1) {
        libreta.filas.splice(index, 1)
      }
      
      showCustomNotification('Registro eliminado localmente (backend no disponible)', 'info')
    }
  })
}

const total = (libreta, campo) => {
  return libreta.filas.filter(f => f.guardado).reduce((sum, f) => sum + Number(f[campo] || 0), 0)
}

const format = (n) => new Intl.NumberFormat('es-EC', { minimumFractionDigits: 2 }).format(n)

const closeModal = () => {
  showModal.value = false
  form.value = { mes: '', anio: new Date().getFullYear() }
}
</script>

<style scoped>
/* ===== CONTENEDOR GENERAL ===== */
.aportes-content {
  background-color: #f5f7fa;
  padding: 2rem;
  border-radius: 12px;
  min-height: 100vh;
}

/* ===== ENCABEZADO Y TÍTULO ===== */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(30, 136, 229, 0.1);
}

.header-title h3 {
  color: #1565c0;
  font-weight: 700;
  margin: 0;
  font-size: 1.8rem;
}

.header-title .subtitle {
  color: #546e7a;
  margin: 0.5rem 0 0 0;
  font-size: 0.95rem;
}

/* ===== FILTROS DE BÚSQUEDA ===== */
.filtros-section {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(30, 136, 229, 0.08);
  flex-wrap: wrap;
}

.filtro-grupo {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 200px;
}

.filtro-grupo label {
  font-weight: 600;
  color: #455a64;
  font-size: 0.9rem;
}

.filtro-grupo select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e3f2fd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  color: #333;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.filtro-grupo select:hover {
  border-color: #1e88e5;
}

.filtro-grupo select:focus {
  outline: none;
  border-color: #1e88e5;
  box-shadow: 0 0 0 2px rgba(30, 136, 229, 0.2);
}

/* ===== BOTÓN LIMPIAR FILTROS ===== */
.btn-limpiar-filtros {
  align-self: flex-end;
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(107, 114, 128, 0.3);
  font-size: 0.9rem;
}

.btn-limpiar-filtros:hover {
  background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(107, 114, 128, 0.4);
}

/* ===== CONTADOR DE REGISTROS ===== */
.contador-registros {
  align-self: flex-end;
  color: #1e88e5;
  font-weight: 600;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #e3f2fd 0%, #f1f8e9 100%);
  border-radius: 20px;
  font-size: 0.9rem;
}

/* ===== MENSAJE SIN REGISTROS ===== */
.sin-registros {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.sin-registros-content {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(30, 136, 229, 0.08);
  max-width: 400px;
}

.sin-registros-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.sin-registros-content h4 {
  color: #1565c0;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
}

.sin-registros-content p {
  color: #546e7a;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

.sin-registros-content .btn-registrar {
  margin-top: 1rem;
}

/* ===== BOTÓN REGISTRAR ===== */
.btn-registrar {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-registrar:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

/* ===== LIBRETAS ===== */
.libreta {
  background: white;
  padding: 1.75rem;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(30, 136, 229, 0.08);
  margin-bottom: 2rem;
}

.libreta-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e3f2fd;
}

.libreta-header h4 {
  color: #1565c0;
  font-weight: 700;
  margin: 0;
}

.libreta-header p {
  color: #546e7a;
  margin: 0.5rem 0 0 0;
}

.header-buttons {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* ===== BOTÓN GUARDAR ===== */
.btn-guardar {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-guardar:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

/* ===== BOTÓN AGREGAR FILA ===== */
.btn-agregar-fila {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-agregar-fila:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

/* ===== TABLAS ===== */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
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
  position: sticky;
  top: 0;
  z-index: 10;
}

thead tr:first-child th {
  background: #1565c0;
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

/* ===== FILAS GUARDADAS ===== */
.fila-guardada {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%) !important;
  border-left: 3px solid #10b981;
}

.fila-guardada td {
  opacity: 0.8;
  font-weight: 500;
}

.fila-guardada input,
.fila-guardada select {
  background-color: #f8fafc;
  border-color: #10b981;
  opacity: 0.7;
}

/* ===== INPUTS Y SELECTS ===== */
input, select {
  width: 100%;
  border: 1px solid #bbdefb;
  border-radius: 4px;
  padding: 0.3rem;
  text-align: center;
  background-color: white;
  font-size: 0.85rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus, select:focus {
  outline: none;
  border-color: #1e88e5;
  box-shadow: 0 0 0 2px rgba(30, 136, 229, 0.2);
}

input:disabled, select:disabled {
  background-color: #f8fafc;
  border-color: #cbd5e0;
  cursor: not-allowed;
  opacity: 0.6;
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

.modal {
  background: white;
  padding: 2rem;
  width: 400px;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal h4 {
  color: #1e88e5;
  margin-bottom: 1.5rem;
  text-align: center;
}

/* ===== FORMULARIO ===== */
.modal form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.modal input,
.modal select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #bbdefb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.modal input:focus,
.modal select:focus {
  outline: none;
  border-color: #1e88e5;
  box-shadow: 0 0 0 2px rgba(30, 136, 229, 0.2);
}

/* ===== ACCIONES MODAL ===== */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-accept {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-accept:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-cancel {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(107, 114, 128, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-cancel:hover {
  background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(107, 114, 128, 0.4);
}

/* ===== BOTONES DE ACCIÓN ===== */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-edit-action,.btn-delete-action {
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

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .header-section {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .filtros-section {
    flex-direction: column;
  }

  .filtro-grupo {
    width: 100%;
  }

  .btn-limpiar-filtros,
  .contador-registros {
    align-self: auto;
    width: 100%;
  }

  .btn-limpiar-filtros {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .aportes-content {
    padding: 1rem;
  }

  .header-section,
  .filtros-section {
    padding: 1rem;
  }

  .libreta-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  table {
    font-size: 0.75rem;
  }

  th, td {
    padding: 0.25rem;
  }

  .modal {
    width: 90%;
    padding: 1.5rem;
  }

  .header-title h3 {
    font-size: 1.4rem;
  }

  .filtro-grupo {
    min-width: 150px;
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

/* Toast de Éxito Centrado (Pequeño) */
.success-toast-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10002;
  pointer-events: none;
}

.success-toast-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: white;
  color: #10b981;
  border: 2px solid #10b981;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  animation: successToastSlideIn 0.3s ease-out;
  pointer-events: auto;
  min-width: 250px;
  max-width: 400px;
}

@keyframes successToastSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.success-toast-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #10b981;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  flex-shrink: 0;
  animation: successIconCheck 0.3s ease-out;
}

@keyframes successIconCheck {
  0% {
    transform: scale(0) rotate(-180deg);
  }
  50% {
    transform: scale(1.1) rotate(10deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

.success-toast-message {
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.4;
}
</style>
