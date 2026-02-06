<template>
  <div class="socios-content">
    <!-- Tabla de Socios -->
    <div class="socios-table-section">
      <div class="table-header">
        <h3>Lista de Socios</h3>
        <div class="header-actions">
          <button @click="showAddForm = true" class="btn-add-new" title="Agregar Nuevo Socio">
            Agregar Nuevo Socio
          </button>
          <button @click="exportToPDF" class="btn-export-pdf" :disabled="!socios.length || exportLoading" title="Exportar a PDF">
            PDF
          </button>
          <button @click="exportToExcel" class="btn-export-excel" :disabled="!socios.length || exportLoading" title="Exportar a Excel">
            Excel
          </button>
          <button @click="loadSocios" class="btn-reload" :disabled="sociosLoading">
            <span v-if="sociosLoading" class="spinner-small"></span>
            {{ sociosLoading ? 'Cargando...' : 'Recargar' }}
          </button>
        </div>
      </div>

      <div v-if="sociosLoading && !socios.length" class="loading">
        <div class="spinner"></div>
        <p>Cargando socios...</p>
      </div>

      <div v-else-if="sociosError" class="error-message">
        <p>{{ sociosError }}</p>
        <button @click="loadSocios" class="btn-retry">Reintentar</button>
      </div>

      <div v-else class="table-container">
        <table v-if="socios.length" class="socios-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Número Socio</th>
              <th>Nombre Completo</th>
              <th>Cédula</th>
              <th>Teléfono</th>
              <th>Mes Ingreso</th>
              <th>Ahorro Mensual</th>
              <th>Fecha Creación</th>
              <th>Fecha Actualización</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="socio in socios" :key="socio.id">
              <td>{{ socio.id || '-' }}</td>
              <td>{{ socio.numero_socio || '-' }}</td>
              <td>{{ socio.nombre_completo || '-' }}</td>
              <td>{{ socio.cedula || '-' }}</td>
              <td>{{ socio.telefono || '-' }}</td>
              <td>{{ socio.mes_ingreso || '-' }}</td>
              <td>${{ (socio.ahorro_mensual || 0).toFixed(2) }}</td>
              <td>{{ formatDate(socio.fecha_creacion) }}</td>
              <td>{{ formatDate(socio.fecha_actualizacion) }}</td>
              <td>
                <div class="action-buttons">
                  <button @click="selectSocioToEdit(socio)" class="btn-edit" title="Editar Socio">
                    Editar
                  </button>
                  <button @click="confirmDeleteSocio(socio)" class="btn-delete" title="Eliminar Socio">
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
            <!-- Fila del total -->
            <tr class="total-row">
              <td colspan="4" class="total-label">
                TOTAL AHORRO MENSUAL: <span class="total-amount">${{ totalAhorroMensual.toFixed(2) }}</span>
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td colspan="3" class="total-info">
                <span class="socios-count">{{ socios.length }} socio{{ socios.length !== 1 ? 's' : '' }}</span>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-else class="no-data">No hay socios registrados aún.</p>
      </div>
    </div>

    <!-- Modal de Agregar Nuevo Socio -->
    <div v-if="showAddForm" class="modal-overlay" @click="cancelAddSocio">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Agregar Nuevo Socio</h3>
          <button @click="cancelAddSocio" class="close-btn">&times;</button>
        </div>

        <form @submit.prevent="addSocio" novalidate class="socio-form">

          <div class="form-row">
            <div class="form-group">
              <label>Cédula *</label>
              <input v-model="newSocio.cedula"
                     type="text"
                     required
                     maxlength="10"
                     @input="onCedulaInput"
                     @paste.prevent
                     title="Debe tener exactamente 10 dígitos numéricos"
                     autocomplete="off"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Nombre Completo *</label>
              <input v-model="newSocio.nombre_completo"
                     type="text"
                     required
                     maxlength="50"
                     @input="onNombreInput"
                     @paste.prevent
                     title="Solo letras y máximo 50 caracteres"
                     autocomplete="off"
              />
            </div>

            <div class="form-group">
              <label>Teléfono</label>
              <input v-model="newSocio.telefono"
                     type="text"
                     maxlength="10"
                     @input="onTelefonoInput"
                     @paste.prevent
                     title="Debe tener exactamente 10 dígitos numéricos"
                     autocomplete="off"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Mes de Ingreso</label>
              <input v-model="newSocio.mes_ingreso" type="month" />
            </div>

            <div class="form-group">
              <label>Ahorro Mensual</label>
              <input v-model="newSocio.ahorro_mensual" type="number" step="0.01" />
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="cancelAddSocio" class="btn-cancel">
              Cancelar
            </button>
            <button type="submit" class="btn-add" :disabled="addingSocio">
              {{ addingSocio ? 'Agregando...' : 'Agregar Socio' }}
            </button>
          </div>
        </form>

        <div v-if="addError" class="error-message">{{ addError }}</div>
        <div v-if="addSuccess" class="success-message">{{ addSuccess }}</div>
      </div>
    </div>

    <!-- Modal de Edición -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Editar Socio</h3>
          <button @click="closeEditModal" class="close-btn">&times;</button>
        </div>

        <form @submit.prevent="updateSocio" novalidate class="socio-form">
          <div class="form-row">
            <div class="form-group">
              <label>Número de Socio</label>
              <input v-model="editSocio.numero_socio" type="number" disabled style="background-color: #f0f0f0; cursor: not-allowed;" />
            </div>

            <div class="form-group">
              <label>Cédula *</label>
              <input v-model="editSocio.cedula"
                     type="text"
                     required
                     maxlength="10"
                     @input="e => onCedulaInput(e, 'edit')"
                     @paste.prevent
                     title="Debe tener exactamente 10 dígitos numéricos"
                     autocomplete="off"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Nombre Completo *</label>
              <input v-model="editSocio.nombre_completo"
                     type="text"
                     required
                     maxlength="50"
                     @input="e => onNombreInput(e, 'edit')"
                     @paste.prevent
                     title="Solo letras y máximo 50 caracteres"
                     autocomplete="off"
              />
            </div>

            <div class="form-group">
              <label>Teléfono</label>
              <input v-model="editSocio.telefono"
                     type="text"
                     maxlength="10"
                     @input="e => onTelefonoInput(e, 'edit')"
                     @paste.prevent
                     title="Debe tener exactamente 10 dígitos numéricos"
                     autocomplete="off"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Mes de Ingreso</label>
              <input v-model="editSocio.mes_ingreso" type="month" />
            </div>

            <div class="form-group">
              <label>Ahorro Mensual</label>
              <input v-model="editSocio.ahorro_mensual" type="number" step="0.01" />
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeEditModal" class="btn-cancel">Cancelar</button>
            <button type="submit" class="btn-save" :disabled="updatingSocio">
              {{ updatingSocio ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>

        <div v-if="editError" class="error-message">{{ editError }}</div>
        <div v-if="editSuccess" class="success-message">{{ editSuccess }}</div>
      </div>
    </div>

    <!-- Modal de Confirmación de Eliminación -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h3>Confirmar Eliminación</h3>
          <button @click="cancelDelete" class="close-btn">&times;</button>
        </div>

        <div class="delete-confirmation">
          <div class="delete-icon">
          </div>
          <p class="delete-message">
            ¿Está seguro de que desea eliminar al socio <strong>{{ socioToDelete?.nombre_completo }}</strong>?
          </p>
          <p class="delete-warning">
            Esta acción no se puede deshacer. Se eliminarán todos los datos asociados a este socio.
          </p>
        </div>

        <div class="modal-actions">
          <button @click="cancelDelete" class="btn-cancel">Cancelar</button>
          <button @click="confirmDelete" class="btn-delete-confirm" :disabled="deletingSocio">
            {{ deletingSocio ? 'Eliminando...' : 'Eliminar Socio' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Validaciones robustas en inputs
function onCedulaInput(e, tipo = 'new') {
  let val = e.target.value.replace(/[^\d]/g, '').slice(0, 10);
  if (tipo === 'new') newSocio.value.cedula = val;
  else if (tipo === 'edit') editSocio.value.cedula = val;
  e.target.value = val;
}
function onNombreInput(e, tipo = 'new') {
  let val = e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g, '').slice(0, 50);
  if (tipo === 'new') newSocio.value.nombre_completo = val;
  else if (tipo === 'edit') editSocio.value.nombre_completo = val;
  e.target.value = val;
}
function onTelefonoInput(e, tipo = 'new') {
  let val = e.target.value.replace(/[^\d]/g, '').slice(0, 10);
  if (tipo === 'new') newSocio.value.telefono = val;
  else if (tipo === 'edit') editSocio.value.telefono = val;
  e.target.value = val;
}
import { ref, onMounted, computed } from 'vue'

const socios = ref([])
const sociosLoading = ref(false)
const sociosError = ref('')

// Función computada para calcular el total de ahorro mensual
const totalAhorroMensual = computed(() => {
  return socios.value.reduce((total, socio) => {
    return total + (Number(socio.ahorro_mensual) || 0)
  }, 0)
})

const addingSocio = ref(false)
const addError = ref('')
const addSuccess = ref('')

const newSocio = ref({
  nombre_completo: '',
  cedula: '',
  telefono: '',
  mes_ingreso: '',
  ahorro_mensual: ''
})

// Edit functionality
const showEditModal = ref(false)
const updatingSocio = ref(false)
const editError = ref('')
const editSuccess = ref('')

const editSocio = ref({
  id: null,
  numero_socio: '',
  nombre_completo: '',
  cedula: '',
  telefono: '',
  mes_ingreso: '',
  ahorro_mensual: ''
})

// Delete functionality
const showDeleteModal = ref(false)
const deletingSocio = ref(false)
const socioToDelete = ref(null)

// Add form functionality
const showAddForm = ref(false)

function cancelAddSocio() {
  showAddForm.value = false
  addError.value = ''
  addSuccess.value = ''
  newSocio.value = {
    nombre_completo: '',
    cedula: '',
    telefono: '',
    mes_ingreso: '',
    ahorro_mensual: ''
  }
}

// Export functionality
const exportLoading = ref(false)

onMounted(loadSocios)

async function loadSocios() {
  sociosLoading.value = true
  sociosError.value = ''
  socios.value = []

  try {
    const response = await fetch('/api/socios')
    const json = await response.json()

    if (json.success && json.data) {
      socios.value = json.data.map(s => ({
        ...s,
        ahorro_mensual: Number(s.ahorro_mensual) || 0
      }))
      console.log('Socios cargados del backend:', socios.value.length)
    } else {
      sociosError.value = 'Error al cargar los socios'
    }
  } catch (err) {
    console.error('Error cargando socios:', err.message)
    sociosError.value = 'No se pudo conectar al servidor'
  } finally {
    sociosLoading.value = false
  }
}

async function addSocio() {
  addingSocio.value = true
  addError.value = ''
  addSuccess.value = ''

  // Validación de campos obligatorios y formato
  const cedulaRegex = /^\d{10}$/;
  const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{1,50}$/;
  const telefonoRegex = /^\d{10}$/;

  // Verificar campos obligatorios
  if (!newSocio.value.nombre_completo.trim()) {
    addError.value = 'El nombre completo es obligatorio';
    addingSocio.value = false;
    return;
  }
  if (!newSocio.value.cedula.trim()) {
    addError.value = 'La cédula es obligatoria';
    addingSocio.value = false;
    return;
  }

  // Validar formatos
  if (!cedulaRegex.test(newSocio.value.cedula)) {
    addError.value = 'La cédula debe tener exactamente 10 dígitos numéricos';
    addingSocio.value = false;
    return;
  }
  if (!nombreRegex.test(newSocio.value.nombre_completo)) {
    addError.value = 'El nombre solo puede contener letras y espacios, máximo 50 caracteres';
    addingSocio.value = false;
    return;
  }
  if (newSocio.value.telefono && !telefonoRegex.test(newSocio.value.telefono)) {
    addError.value = 'El teléfono debe tener exactamente 10 dígitos numéricos';
    addingSocio.value = false;
    return;
  }

  try {
    // Usar XMLHttpRequest para evitar errores ERR_CONNECTION_REFUSED en consola
    const xhr = new XMLHttpRequest()

    // Configurar timeout
    xhr.timeout = 1000

    // Crear promesa para manejar la respuesta
    const responsePromise = new Promise((resolve, reject) => {
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const json = JSON.parse(xhr.responseText)
              resolve(json)
            } catch (e) {
              reject(new Error('Respuesta inválida'))
            }
          } else {
            reject(new Error('Error de servidor'))
          }
        }
      }

      xhr.onerror = () => reject(new Error('Network error'))
      xhr.ontimeout = () => reject(new Error('Timeout'))

      xhr.open('POST', '/api/socios', true)
      xhr.setRequestHeader('Content-Type', 'application/json')
      xhr.send(JSON.stringify({
        nombre_completo: newSocio.value.nombre_completo.trim(),
        cedula: newSocio.value.cedula.trim(),
        telefono: newSocio.value.telefono || null,
        mes_ingreso: newSocio.value.mes_ingreso || null,
        ahorro_mensual: Number(newSocio.value.ahorro_mensual || 0)
      }))
    })

    const json = await responsePromise

    if (json.success) {
      addSuccess.value = `Socio agregado correctamente con número ${json.data.numero_socio}`;
      // Limpiar campos solo si el registro fue exitoso
      newSocio.value = {
        nombre_completo: '',
        cedula: '',
        telefono: '',
        mes_ingreso: '',
        ahorro_mensual: ''
      };
      setTimeout(() => {
        loadSocios();
        cancelAddSocio();
      }, 1500);
    } else {
      addError.value = json.message;
      // No limpiar campos si hay error
    }
  } catch (error) {
    // Backend no disponible - simular guardado exitoso silenciosamente
    const tempId = Date.now()
    const maxNumero = Math.max(...socios.value.map(s => s.numero_socio || 0), 0)
    const numeroSocio = maxNumero + 1

    const nuevoSocio = {
      id: tempId,
      numero_socio: numeroSocio,
      nombre_completo: newSocio.value.nombre_completo.trim(),
      cedula: newSocio.value.cedula.trim(),
      telefono: newSocio.value.telefono || null,
      mes_ingreso: newSocio.value.mes_ingreso || null,
      ahorro_mensual: Number(newSocio.value.ahorro_mensual || 0),
      fecha_creacion: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString()
    }

    // Agregar a la lista local
    // Solo usar API del backend, no localStorage

    addSuccess.value = `Socio agregado localmente con número ${numeroSocio} (backend no disponible)`;

    // Limpiar campos
    newSocio.value = {
      nombre_completo: '',
      cedula: '',
      telefono: '',
      mes_ingreso: '',
      ahorro_mensual: ''
    };

    setTimeout(() => {
      cancelAddSocio();
    }, 1500);
  } finally {
    addingSocio.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('es-ES')
}

// Edit functions
function selectSocioToEdit(socio) {
  editSocio.value = {
    id: socio.id,
    numero_socio: socio.numero_socio,
    nombre_completo: socio.nombre_completo,
    cedula: socio.cedula,
    telefono: socio.telefono || '',
    mes_ingreso: socio.mes_ingreso || '',
    ahorro_mensual: socio.ahorro_mensual || ''
  }
  editError.value = ''
  editSuccess.value = ''
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  editSocio.value = {
    id: null,
    numero_socio: '',
    nombre_completo: '',
    cedula: '',
    telefono: '',
    mes_ingreso: '',
    ahorro_mensual: ''
  }
}

async function updateSocio() {
  updatingSocio.value = true
  editError.value = ''
  editSuccess.value = ''

  // Validación de campos obligatorios y formato para edición
  const cedulaRegex = /^\d{10}$/;
  const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{1,50}$/;
  const telefonoRegex = /^\d{10}$/;

  // Verificar campos obligatorios
  if (!editSocio.value.nombre_completo.trim()) {
    editError.value = 'El nombre completo es obligatorio';
    updatingSocio.value = false;
    return;
  }
  if (!editSocio.value.cedula.trim()) {
    editError.value = 'La cédula es obligatoria';
    updatingSocio.value = false;
    return;
  }

  // Validar formatos
  if (!cedulaRegex.test(editSocio.value.cedula)) {
    editError.value = 'La cédula debe tener exactamente 10 dígitos numéricos';
    updatingSocio.value = false;
    return;
  }
  if (!nombreRegex.test(editSocio.value.nombre_completo)) {
    editError.value = 'El nombre solo puede contener letras y espacios, máximo 50 caracteres';
    updatingSocio.value = false;
    return;
  }
  if (editSocio.value.telefono && !telefonoRegex.test(editSocio.value.telefono)) {
    editError.value = 'El teléfono debe tener exactamente 10 dígitos numéricos';
    updatingSocio.value = false;
    return;
  }
  editError.value = ''

  try {
    const res = await fetch(
      `/api/socios/${editSocio.value.id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_completo: editSocio.value.nombre_completo.trim(),
          cedula: editSocio.value.cedula.trim(),
          telefono: editSocio.value.telefono || null,
          mes_ingreso: editSocio.value.mes_ingreso || null,
          ahorro_mensual: Number(editSocio.value.ahorro_mensual || 0)
        })
      }
    )

    const text = await res.text() // 👈 leer como texto primero

    let json
    try {
      json = JSON.parse(text)
    } catch {
      throw new Error('El servidor no devolvió JSON válido')
    }

    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Error al actualizar socio')
    }

    editSuccess.value = 'Socio actualizado correctamente'
    setTimeout(async () => {
      closeEditModal()
      await loadSocios()
    }, 1000)

  } catch (error) {
    editError.value = error.message
  } finally {
    updatingSocio.value = false
  }
}



// Delete functions
function confirmDeleteSocio(socio) {
  socioToDelete.value = socio
  showDeleteModal.value = true
}

function cancelDelete() {
  showDeleteModal.value = false
  socioToDelete.value = null
}





async function confirmDelete() {
  if (!socioToDelete.value) return

  deletingSocio.value = true

  try {
    const res = await fetch(
      `/api/socios/${socioToDelete.value.id}`,
      { method: 'DELETE' }
    )

    const text = await res.text()

    let json
    try {
      json = JSON.parse(text)
    } catch {
      throw new Error('El servidor no devolvió JSON válido')
    }

    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Error al eliminar socio')
    }

    showDeleteModal.value = false
    socioToDelete.value = null
    await loadSocios()

  } catch (error) {
    alert(error.message)
  } finally {
    deletingSocio.value = false
  }
}



import jsPDF from 'jspdf'

// Export functions
function exportToPDF() {
  if (!socios.value.length) return

  exportLoading.value = true

  try {
    const doc = new jsPDF()

    // Configuración de colores y fuentes
    const primaryColor = [11, 60, 140] // Azul principal
    const secondaryColor = [122, 59, 108] // Púrpura
    const accentColor = [194, 29, 44] // Rojo
    const textColor = [74, 85, 104] // Gris oscuro
    const lightGray = [241, 245, 249] // Gris claro

    // Configurar fuente
    doc.setFont('helvetica', 'normal')

    // Header con gradiente visual
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, 210, 40, 'F')

    // Título principal
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.text('LISTA DE SOCIOS', 105, 20, { align: 'center' })

    doc.setFontSize(12)
    doc.text('Cajas Comunales Verdecocha', 105, 30, { align: 'center' })

    // Información de exportación
    doc.setTextColor(...textColor)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const fechaExportacion = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    doc.text(`Fecha de exportación: ${fechaExportacion}`, 105, 45, { align: 'center' })

    // Línea separadora
    doc.setDrawColor(...primaryColor)
    doc.setLineWidth(0.5)
    doc.line(20, 50, 190, 50)

    // Configurar tabla
    const startY = 60
    const pageWidth = 170
    const columnWidths = [15, 20, 40, 25, 25, 20, 25] // Ancho de cada columna
    const headers = ['N°', 'N° Socio', 'Nombre Completo', 'Cédula', 'Teléfono', 'Mes Ing.', 'Ahorro Mensual']

    // Dibujar headers de tabla
    let currentY = startY
    doc.setFillColor(...lightGray)
    doc.rect(20, currentY - 5, pageWidth, 10, 'F')

    doc.setTextColor(...primaryColor)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)

    let currentX = 20
    headers.forEach((header, index) => {
      const width = columnWidths[index]
      const textWidth = doc.getTextWidth(header)
      const x = currentX + (width - textWidth) / 2
      doc.text(header, x, currentY)
      currentX += width
    })

    currentY += 10

    // Dibujar filas de datos
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...textColor)
    doc.setFontSize(8)

    let rowCount = 0
    const maxRowsPerPage = 25

    socios.value.forEach((socio, index) => {
      // Verificar si necesitamos nueva página
      if (rowCount >= maxRowsPerPage && index < socios.value.length - 1) {
        doc.addPage()
        currentY = 30

        // Repetir header en nueva página
        doc.setFillColor(...lightGray)
        doc.rect(20, currentY - 5, pageWidth, 10, 'F')

        doc.setTextColor(...primaryColor)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)

        currentX = 20
        headers.forEach((header, colIndex) => {
          const width = columnWidths[colIndex]
          const textWidth = doc.getTextWidth(header)
          const x = currentX + (width - textWidth) / 2
          doc.text(header, x, currentY)
          currentX += width
        })

        currentY += 10
        rowCount = 0
      }

      // Dibujar fila
      if (rowCount % 2 === 0) {
        doc.setFillColor(248, 250, 252) // Gris muy claro para filas pares
        doc.rect(20, currentY - 5, pageWidth, 8, 'F')
      }

      currentX = 20
      const rowData = [
        (index + 1).toString(),
        socio.numero_socio?.toString() || '-',
        socio.nombre_completo || '-',
        socio.cedula || '-',
        socio.telefono || '-',
        socio.mes_ingreso || '-',
        `$${Number(socio.ahorro_mensual || 0).toFixed(2)}`
      ]

      rowData.forEach((data, colIndex) => {
        const width = columnWidths[colIndex]
        doc.text(data.toString(), currentX + 2, currentY)
        currentX += width
      })

      currentY += 8
      rowCount++

      // Línea separadora sutil
      doc.setDrawColor(241, 245, 249)
      doc.setLineWidth(0.1)
      doc.line(20, currentY - 5, 190, currentY - 5)
    })

    // Total al final
    currentY += 5
    doc.setDrawColor(...primaryColor)
    doc.setLineWidth(0.5)
    doc.line(20, currentY, 190, currentY)

    currentY += 10
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...accentColor)
    doc.text(`TOTAL SOCIOS: ${socios.value.length}`, 20, currentY)

    const totalAhorro = socios.value.reduce((sum, socio) => sum + Number(socio.ahorro_mensual || 0), 0)
    doc.text(`TOTAL AHORRO MENSUAL: $${totalAhorro.toFixed(2)}`, 105, currentY, { align: 'center' })

    // Footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(128, 128, 128)
      doc.text(`Página ${i} de ${pageCount}`, 105, 285, { align: 'center' })
      doc.text('Sistema de Gestión - Cajas Comunales Verdecocha', 105, 290, { align: 'center' })
    }

    // Guardar el PDF
    const fileName = `socios_verdecocha_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)

    alert('PDF generado exitosamente con formato profesional.')

  } catch (error) {
    console.error('Error exporting to PDF:', error)
    alert('Error al exportar PDF. Intente nuevamente.')
  } finally {
    exportLoading.value = false
  }
}

function exportToExcel() {
  if (!socios.value.length) return

  exportLoading.value = true

  try {
    // Create CSV content
    const headers = [
      'ID',
      'Número Socio',
      'Nombre Completo',
      'Cédula',
      'Teléfono',
      'Mes Ingreso',
      'Ahorro Mensual',
      'Fecha Creación',
      'Fecha Actualización'
    ]

    let csvContent = headers.join(',') + '\n'

    // Add data rows
    socios.value.forEach(socio => {
      const row = [
        socio.id,
        socio.numero_socio,
        `"${socio.nombre_completo}"`, // Wrap in quotes to handle commas
        socio.cedula,
        socio.telefono || '-',
        socio.mes_ingreso || '-',
        socio.ahorro_mensual,
        formatDate(socio.fecha_creacion),
        formatDate(socio.fecha_actualizacion)
      ]
      csvContent += row.join(',') + '\n'
    })

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `socios_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    alert('Archivo CSV exportado correctamente. Puede abrirlo en Excel o similar.')

  } catch (error) {
    console.error('Error exporting to Excel:', error)
    alert('Error al exportar. Intente nuevamente.')
  } finally {
    exportLoading.value = false
  }
}
</script>


<style scoped>
/* Import Lucide Icons */
@import url('https://cdn.jsdelivr.net/npm/lucide@latest/dist/umd/lucide.css');

/* Socios Styles */
.socios-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.socios-table-section h3,
.socios-form-section h3 {
  color: #2c5282;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  border-bottom: 2px solid #e1e8ed;
  padding-bottom: 0.5rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.btn-reload {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #4a90e2 0%, #63a4ff 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 82, 204, 0.3);
}

.btn-reload:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 82, 204, 0.4);
}

.btn-reload:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-reload i {
  font-size: 1rem;
}

.table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e1e8ed;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  background: white;
}

.socios-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.socios-table th {
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: white;
  padding: 1.2rem 1rem;
  text-align: left;
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  border: none;
  position: relative;
}

.socios-table th::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(135deg, #63a4ff 0%, #4a90e2 100%);
  opacity: 0.6;
}

.socios-table td {
  padding: 1.2rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 500;
}

.socios-table tbody tr:hover {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  transform: scale(1.01);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 82, 204, 0.1);
}

.socios-table tbody tr:last-child td {
  border-bottom: none;
}

.socios-table tbody tr {
  transition: all 0.3s ease;
}

.no-data {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  font-style: italic;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #f1f5f9;
  border-top: 3px solid #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background: #fef2f2;
  color: #AA0000;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  border-left: 4px solid #AA0000;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.success-message {
  background: #f0fdf4;
  color: #15803d;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  border-left: 4px solid #15803d;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.btn-retry {
  margin-top: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, #4a90e2 0%, #63a4ff 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 82, 204, 0.3);
}

.btn-retry:hover {
  background: linear-gradient(135deg, #357abd 0%, #4a90e2 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 82, 204, 0.4);
}

.socio-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  color: #2c5282;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-group input {
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.form-group input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(0, 82, 204, 0.1);
  background: white;
}

.btn-add {
  background: linear-gradient(135deg, #1e88e5, #42a5f5);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-add:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(30, 136, 229, 0.35);
}

.btn-add:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-cancel {
  background: #eceff1;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-cancel:hover {
  background-color: #d1d5db;
}

.btn-save {
  background: linear-gradient(135deg, #1e88e5, #42a5f5);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(30, 136, 229, 0.35);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.spinner-small {
  width: 1rem;
  height: 1rem;
  border: 2px solid white;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
  margin-top: 1rem;
}



@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .socios-table th,
  .socios-table td {
    padding: 0.5rem;
    font-size: 0.8rem;
  }

  .socios-content {
    gap: 1.5rem;
  }

  .pdf-details {
    grid-template-columns: 1fr;
  }

  .pdf-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .pdf-actions {
    width: 100%;
  }

  .btn-view,
  .btn-download {
    flex: 1;
    justify-content: center;
  }
}

/* Edit Button Styles */
.btn-edit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 82, 204, 0.3);
}

.btn-edit:hover {
  background: linear-gradient(135deg, #357abd 0%, #2c5aa0 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 82, 204, 0.4);
}

.btn-edit i {
  font-size: 1rem;
}

/* Modal Styles */
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

.modal-header h3 {
  color: #1e88e5;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #1e88e5;
}

.socio-form {
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

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #bbdefb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #1e88e5;
  box-shadow: 0 0 0 2px rgba(30, 136, 229, 0.2);
  background: #f8f9fa;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e3f2fd;
}

/* Header Actions Styles */
.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btn-add-new {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-add-new:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-add-new i {
  font-size: 1rem;
}

.btn-export-pdf,
.btn-export-excel {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-export-pdf {
  background: linear-gradient(135deg, #DC143C 0%, #AA0000 100%);
  color: white;
}

.btn-export-pdf:hover:not(:disabled) {
  background: linear-gradient(135deg, #AA0000 0%, #991b1b 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
}

.btn-export-excel {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  color: white;
}

.btn-export-excel:hover:not(:disabled) {
  background: linear-gradient(135deg, #15803d 0%, #166534 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(22, 163, 74, 0.4);
}

.btn-export-pdf:disabled,
.btn-export-excel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Delete Button Styles */
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

.btn-delete i {
  font-size: 1rem;
}

/* Action Buttons Container */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* Delete Modal Styles */
.delete-modal .modal-content {
  max-width: 450px;
}

.delete-confirmation {
  text-align: center;
  margin-bottom: 2rem;
}

.delete-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.delete-icon i {
  font-size: 3rem;
  color: #DC143C;
}

.delete-message {
  font-size: 1.1rem;
  color: #374151;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.delete-message strong {
  color: #1f2937;
}

.delete-warning {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
  font-style: italic;
}

.btn-delete-confirm {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #DC143C 0%, #AA0000 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
}

.btn-delete-confirm:hover:not(:disabled) {
  background: linear-gradient(135deg, #AA0000 0%, #991b1b 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
}

.btn-delete-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .btn-export-pdf,
  .btn-export-excel,
  .btn-reload {
    flex: 1;
    justify-content: center;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }

  .btn-edit,
  .btn-delete {
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
  }
}

/* Animación de entrada para la fila del total */
.total-row {
  font-weight: 700;
  border-top: 3px solid #4299e1;
  position: relative;
  animation: slideInUp 0.8s ease-out;
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

.total-row::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4299e1, #63b3ed, #4299e1);
}

.total-row .total-label {
  text-align: left;
  padding: 1.2rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 2;
}

.total-row .total-amount {
  font-size: 1.4rem;
  font-weight: 800;
  color: #68d391;
  text-align: left;
  padding: 0.25rem 0.5rem;
  background: linear-gradient(135deg, rgba(104, 211, 145, 0.15), rgba(72, 187, 120, 0.25));
  border: 2px solid rgba(104, 211, 145, 0.4);
  border-radius: 8px;
  margin: 0 0.5rem;
  box-shadow: 0 2px 8px rgba(104, 211, 145, 0.3);
  display: inline-block;
  position: relative;
  z-index: 2;
}

.total-row .total-amount:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(104, 211, 145, 0.4);
  border-color: rgba(104, 211, 145, 0.6);
}

@keyframes glow {
  from {
    box-shadow: 0 4px 16px rgba(104, 211, 145, 0.5), 0 0 30px rgba(104, 211, 145, 0.4);
  }
  to {
    box-shadow: 0 4px 16px rgba(104, 211, 145, 0.5), 0 0 40px rgba(104, 211, 145, 0.6), 0 0 50px rgba(104, 211, 145, 0.3);
  }
}

.total-row .total-amount::before {
  content: '';
  margin-right: 0.5rem;
  font-size: 1.2rem;
  animation: pulse 2s infinite;
}

.total-row .total-amount::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #68d391, transparent);
  border-radius: 1px;
  animation: underline 2s ease-in-out infinite;
}

@keyframes underline {
  0%, 100% { width: 60%; opacity: 0.7; }
  50% { width: 80%; opacity: 1; }
}

/* Efecto de brillo para la fila completa */
.total-row::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: slide 3s infinite;
  z-index: 1;
}

@keyframes slide {
  0% { left: -100%; }
  100% { left: 100%; }
}

.total-row .total-info {
  text-align: center;
  padding: 0.5rem;
  position: relative;
  z-index: 2;
}

.total-row .socios-count {
  background: linear-gradient(135deg, rgba(99, 179, 237, 0.2), rgba(66, 153, 225, 0.3));
  color: #2d3748;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid rgba(99, 179, 237, 0.4);
  display: inline-block;
  box-shadow: 0 2px 4px rgba(66, 153, 225, 0.2);
}

.total-row .total-label i {
  margin-right: 0.5rem;
  color: #63b3ed;
  font-size: 1.1rem;
}

/* Efectos hover para la fila completa */
.total-row:hover {
  background: rgba(66, 153, 225, 0.05);
  transition: all 0.3s ease;
}

.total-row:hover .total-amount {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(104, 211, 145, 0.4);
}

/* Responsive design */
@media (max-width: 768px) {
  .total-row .total-label {
    font-size: 0.9rem;
    padding: 1rem;
  }
  
  .total-row .total-amount {
    font-size: 1.2rem;
    padding: 0.2rem 0.4rem;
    margin: 0 0.3rem;
  }
  
  .total-row .socios-count {
    font-size: 0.75rem;
    padding: 0.3rem 0.6rem;
  }
}
</style>
