<template>
  <div class="socios-content">

    <!-- CABECERA -->
    <div class="page-header">
      <div>
        <h3>Lista de Socios</h3>
        <p class="page-subtitle">{{ socios.length }} socio{{ socios.length !== 1 ? 's' : '' }} registrados</p>
      </div>
      <div class="header-actions">
        <button @click="showAddForm = true" class="btn-primary">+ Agregar Socio</button>
        <button @click="exportToPDF" class="btn-outline" :disabled="!socios.length || exportLoading">PDF</button>
        <button @click="exportToExcel" class="btn-outline" :disabled="!socios.length || exportLoading">CSV</button>
        <button @click="loadSocios" class="btn-ghost" :disabled="sociosLoading">
          <span v-if="sociosLoading" class="spinner-sm"></span>
          {{ sociosLoading ? 'Cargando...' : 'Recargar' }}
        </button>
      </div>
    </div>

    <!-- BARRA DE BÚSQUEDA Y FILTROS -->
    <div class="filters-bar">
      <div class="search-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nombre, cédula o N° socio..."
          class="search-input"
        />
        <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search">×</button>
      </div>
      <div class="filter-info" v-if="searchQuery">
        {{ filteredSocios.length }} resultado{{ filteredSocios.length !== 1 ? 's' : '' }} para "{{ searchQuery }}"
      </div>
    </div>

    <!-- STATS -->
    <div class="stats-row">
      <div class="stat-chip">
        <span class="stat-label">Total socios</span>
        <span class="stat-val">{{ socios.length }}</span>
      </div>
      <div class="stat-chip">
        <span class="stat-label">Ahorro mensual total</span>
        <span class="stat-val">${{ totalAhorroMensual.toFixed(2) }}</span>
      </div>
      <div class="stat-chip">
        <span class="stat-label">Promedio ahorro</span>
        <span class="stat-val">${{ promedioAhorro.toFixed(2) }}</span>
      </div>
    </div>

    <!-- TABLA -->
    <div class="table-section">
      <div v-if="sociosLoading && !socios.length" class="state-box">
        <div class="spinner"></div>
        <p>Cargando socios...</p>
      </div>

      <div v-else-if="sociosError" class="state-box error-state">
        <p>{{ sociosError }}</p>
        <button @click="loadSocios" class="btn-primary">Reintentar</button>
      </div>

      <div v-else-if="!socios.length" class="state-box">
        <p>No hay socios registrados aún.</p>
        <button @click="showAddForm = true" class="btn-primary">Agregar primer socio</button>
      </div>

      <div v-else-if="filteredSocios.length === 0" class="state-box">
        <p>No se encontraron socios con "{{ searchQuery }}".</p>
        <button @click="searchQuery = ''" class="btn-ghost">Limpiar búsqueda</button>
      </div>

      <template v-else>
        <div class="table-wrapper">
          <table class="socios-table">
            <thead>
              <tr>
                <th @click="sortBy('numero_socio')" class="sortable">
                  N° Socio <span class="sort-icon">{{ getSortIcon('numero_socio') }}</span>
                </th>
                <th @click="sortBy('nombre_completo')" class="sortable">
                  Nombre Completo <span class="sort-icon">{{ getSortIcon('nombre_completo') }}</span>
                </th>
                <th>Cédula</th>
                <th>Teléfono</th>
                <th @click="sortBy('mes_ingreso')" class="sortable">
                  Mes Ingreso <span class="sort-icon">{{ getSortIcon('mes_ingreso') }}</span>
                </th>
                <th @click="sortBy('ahorro_mensual')" class="sortable">
                  Ahorro Mensual <span class="sort-icon">{{ getSortIcon('ahorro_mensual') }}</span>
                </th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="socio in paginatedSocios" :key="socio.id">
                <td><span class="badge-numero">{{ socio.numero_socio }}</span></td>
                <td class="nombre-cell">{{ socio.nombre_completo }}</td>
                <td class="mono">{{ socio.cedula }}</td>
                <td>{{ socio.telefono || '—' }}</td>
                <td>{{ formatMesIngreso(socio.mes_ingreso) }}</td>
                <td class="monto">${{ Number(socio.ahorro_mensual || 0).toFixed(2) }}</td>
                <td>
                  <div class="row-actions">
                    <button @click="selectSocioToEdit(socio)" class="btn-icon btn-edit-icon" title="Editar">✎</button>
                    <button @click="confirmDeleteSocio(socio)" class="btn-icon btn-delete-icon" title="Eliminar">✕</button>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="5" class="total-label">Total ahorro mensual</td>
                <td class="monto total-amount">${{ totalAhorroFiltrado.toFixed(2) }}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- PAGINACIÓN -->
        <div class="pagination" v-if="totalPages > 1">
          <button @click="currentPage = 1" :disabled="currentPage === 1" class="page-btn">«</button>
          <button @click="currentPage--" :disabled="currentPage === 1" class="page-btn">‹</button>
          <span class="page-info">Página {{ currentPage }} de {{ totalPages }}</span>
          <button @click="currentPage++" :disabled="currentPage === totalPages" class="page-btn">›</button>
          <button @click="currentPage = totalPages" :disabled="currentPage === totalPages" class="page-btn">»</button>
          <select v-model.number="pageSize" class="page-size-select">
            <option :value="10">10 por página</option>
            <option :value="25">25 por página</option>
            <option :value="50">50 por página</option>
          </select>
        </div>
      </template>
    </div>

    <!-- MODAL AGREGAR -->
    <div v-if="showAddForm" class="modal-overlay" @click.self="cancelAddSocio">
      <div class="modal">
        <div class="modal-header">
          <h4>Agregar Nuevo Socio</h4>
          <button @click="cancelAddSocio" class="close-btn">×</button>
        </div>
        <form @submit.prevent="addSocio" novalidate class="socio-form">
          <div class="form-row">
            <div class="form-group">
              <label>Cédula *</label>
              <input v-model="newSocio.cedula" type="text" maxlength="10"
                @input="e => filterInput(e, 'digits', newSocio, 'cedula')" @paste.prevent autocomplete="off" />
              <span class="field-hint">10 dígitos numéricos</span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Nombre Completo *</label>
              <input v-model="newSocio.nombre_completo" type="text" maxlength="50"
                @input="e => filterInput(e, 'letters', newSocio, 'nombre_completo')" @paste.prevent autocomplete="off" />
            </div>
            <div class="form-group">
              <label>Teléfono</label>
              <input v-model="newSocio.telefono" type="text" maxlength="10"
                @input="e => filterInput(e, 'digits', newSocio, 'telefono')" @paste.prevent autocomplete="off" />
              <span class="field-hint">10 dígitos (opcional)</span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Mes de Ingreso</label>
              <input v-model="newSocio.mes_ingreso" type="month" />
            </div>
            <div class="form-group">
              <label>Ahorro Mensual ($)</label>
              <input v-model="newSocio.ahorro_mensual" type="number" step="0.01" min="0" />
            </div>
          </div>
          <div v-if="formError" class="form-error">{{ formError }}</div>
          <div class="modal-actions">
            <button type="button" @click="cancelAddSocio" class="btn-ghost">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="addingSocio">
              <span v-if="addingSocio" class="spinner-sm"></span>
              {{ addingSocio ? 'Guardando...' : 'Agregar Socio' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL EDITAR -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal">
        <div class="modal-header">
          <h4>Editar Socio</h4>
          <button @click="closeEditModal" class="close-btn">×</button>
        </div>
        <form @submit.prevent="updateSocio" novalidate class="socio-form">
          <div class="form-row">
            <div class="form-group">
              <label>N° Socio</label>
              <input :value="editSocio.numero_socio" type="text" disabled class="input-disabled" />
            </div>
            <div class="form-group">
              <label>Cédula *</label>
              <input v-model="editSocio.cedula" type="text" maxlength="10"
                @input="e => filterInput(e, 'digits', editSocio, 'cedula')" @paste.prevent autocomplete="off" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Nombre Completo *</label>
              <input v-model="editSocio.nombre_completo" type="text" maxlength="50"
                @input="e => filterInput(e, 'letters', editSocio, 'nombre_completo')" @paste.prevent autocomplete="off" />
            </div>
            <div class="form-group">
              <label>Teléfono</label>
              <input v-model="editSocio.telefono" type="text" maxlength="10"
                @input="e => filterInput(e, 'digits', editSocio, 'telefono')" @paste.prevent autocomplete="off" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Mes de Ingreso</label>
              <input v-model="editSocio.mes_ingreso" type="month" />
            </div>
            <div class="form-group">
              <label>Ahorro Mensual ($)</label>
              <input v-model="editSocio.ahorro_mensual" type="number" step="0.01" min="0" />
            </div>
          </div>
          <div class="form-meta">
            <span>Creado: {{ formatDate(editSocio.fecha_creacion) }}</span>
            <span>Actualizado: {{ formatDate(editSocio.fecha_actualizacion) }}</span>
          </div>
          <div v-if="formError" class="form-error">{{ formError }}</div>
          <div class="modal-actions">
            <button type="button" @click="closeEditModal" class="btn-ghost">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="updatingSocio">
              <span v-if="updatingSocio" class="spinner-sm"></span>
              {{ updatingSocio ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL ELIMINAR -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="cancelDelete">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h4>Eliminar Socio</h4>
          <button @click="cancelDelete" class="close-btn">×</button>
        </div>
        <p class="delete-msg">
          ¿Eliminar a <strong>{{ socioToDelete?.nombre_completo }}</strong>?
        </p>
        <p class="delete-warning">⚠️ Se eliminarán todos los registros asociados. Esta acción no se puede deshacer.</p>
        <div class="modal-actions">
          <button @click="cancelDelete" class="btn-ghost">Cancelar</button>
          <button @click="deleteSocio" class="btn-danger" :disabled="deletingSocio">
            <span v-if="deletingSocio" class="spinner-sm"></span>
            {{ deletingSocio ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- NOTIFICACIÓN -->
    <transition name="notif">
      <div v-if="notification.show" class="notification" :class="notification.type">
        {{ notification.message }}
        <button @click="notification.show = false" class="notif-close">×</button>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import jsPDF from 'jspdf'

// ── Estado principal ──────────────────────────────────────────────────────────
const socios = ref([])
const sociosLoading = ref(false)
const sociosError = ref('')
const exportLoading = ref(false)

// ── Búsqueda y ordenamiento ───────────────────────────────────────────────────
const searchQuery = ref('')
const sortKey = ref('numero_socio')
const sortDir = ref('asc')
const currentPage = ref(1)
const pageSize = ref(25)

// ── Modales ───────────────────────────────────────────────────────────────────
const showAddForm = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const addingSocio = ref(false)
const updatingSocio = ref(false)
const deletingSocio = ref(false)
const formError = ref('')
const socioToDelete = ref(null)

const notification = ref({ show: false, type: '', message: '' })

const emptyForm = () => ({
  nombre_completo: '', cedula: '', telefono: '', mes_ingreso: '', ahorro_mensual: ''
})

const newSocio = ref(emptyForm())
const editSocio = ref({ id: null, numero_socio: '', fecha_creacion: '', fecha_actualizacion: '', ...emptyForm() })

// ── Computed ──────────────────────────────────────────────────────────────────
const filteredSocios = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  let list = q
    ? socios.value.filter(s =>
        s.nombre_completo?.toLowerCase().includes(q) ||
        s.cedula?.includes(q) ||
        String(s.numero_socio).includes(q)
      )
    : [...socios.value]

  list.sort((a, b) => {
    let va = a[sortKey.value] ?? ''
    let vb = b[sortKey.value] ?? ''
    if (typeof va === 'string') va = va.toLowerCase()
    if (typeof vb === 'string') vb = vb.toLowerCase()
    if (va < vb) return sortDir.value === 'asc' ? -1 : 1
    if (va > vb) return sortDir.value === 'asc' ? 1 : -1
    return 0
  })

  return list
})

const totalPages = computed(() => Math.ceil(filteredSocios.value.length / pageSize.value))

const paginatedSocios = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredSocios.value.slice(start, start + pageSize.value)
})

const totalAhorroMensual = computed(() =>
  socios.value.reduce((sum, s) => sum + Number(s.ahorro_mensual || 0), 0)
)

const totalAhorroFiltrado = computed(() =>
  filteredSocios.value.reduce((sum, s) => sum + Number(s.ahorro_mensual || 0), 0)
)

const promedioAhorro = computed(() =>
  socios.value.length ? totalAhorroMensual.value / socios.value.length : 0
)

// Resetear página al buscar o cambiar tamaño
watch([searchQuery, pageSize], () => { currentPage.value = 1 })

// ── Helpers ───────────────────────────────────────────────────────────────────
function showNotif(type, message) {
  notification.value = { show: true, type, message }
  setTimeout(() => { notification.value.show = false }, 4000)
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatMesIngreso(val) {
  if (!val) return '—'
  // Soporta tanto "YYYY-MM" como fechas completas
  const parts = val.split('-')
  if (parts.length >= 2) {
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1)
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  }
  return val
}

function sortBy(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

function getSortIcon(key) {
  if (sortKey.value !== key) return '↕'
  return sortDir.value === 'asc' ? '↑' : '↓'
}

// Filtro de input unificado
function filterInput(e, type, obj, field) {
  const patterns = {
    digits: /[^\d]/g,
    letters: /[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g
  }
  const val = e.target.value.replace(patterns[type], '')
  obj[field] = val
  e.target.value = val
}

// Validación de formulario
function validateForm(data) {
  if (!data.cedula?.trim()) return 'La cédula es obligatoria'
  if (!/^\d{10}$/.test(data.cedula)) return 'La cédula debe tener exactamente 10 dígitos'
  if (!data.nombre_completo?.trim()) return 'El nombre completo es obligatorio'
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,50}$/.test(data.nombre_completo.trim()))
    return 'El nombre solo puede contener letras y espacios (2-50 caracteres)'
  if (data.telefono && !/^\d{10}$/.test(data.telefono))
    return 'El teléfono debe tener exactamente 10 dígitos'
  return null
}

// ── API ───────────────────────────────────────────────────────────────────────
async function loadSocios() {
  sociosLoading.value = true
  sociosError.value = ''
  try {
    const res = await fetch('/api/socios')
    const json = await res.json()
    if (json.success) {
      socios.value = json.data.map(s => ({ ...s, ahorro_mensual: Number(s.ahorro_mensual) || 0 }))
    } else {
      sociosError.value = json.message || 'Error al cargar socios'
    }
  } catch {
    sociosError.value = 'No se pudo conectar al servidor'
  } finally {
    sociosLoading.value = false
  }
}

async function addSocio() {
  formError.value = ''
  const err = validateForm(newSocio.value)
  if (err) { formError.value = err; return }

  addingSocio.value = true
  try {
    const res = await fetch('/api/socios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_completo: newSocio.value.nombre_completo.trim(),
        cedula: newSocio.value.cedula.trim(),
        telefono: newSocio.value.telefono || null,
        mes_ingreso: newSocio.value.mes_ingreso || null,
        ahorro_mensual: Number(newSocio.value.ahorro_mensual || 0)
      })
    })
    const json = await res.json()
    if (json.success) {
      showNotif('success', `Socio N° ${json.data.numero_socio} agregado correctamente`)
      cancelAddSocio()
      await loadSocios()
    } else {
      formError.value = json.message || 'Error al agregar socio'
    }
  } catch {
    formError.value = 'Error de conexión con el servidor'
  } finally {
    addingSocio.value = false
  }
}

async function updateSocio() {
  formError.value = ''
  const err = validateForm(editSocio.value)
  if (err) { formError.value = err; return }

  updatingSocio.value = true
  try {
    const res = await fetch(`/api/socios/${editSocio.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_completo: editSocio.value.nombre_completo.trim(),
        cedula: editSocio.value.cedula.trim(),
        telefono: editSocio.value.telefono || null,
        mes_ingreso: editSocio.value.mes_ingreso || null,
        ahorro_mensual: Number(editSocio.value.ahorro_mensual || 0)
      })
    })
    const json = await res.json()
    if (json.success) {
      showNotif('success', 'Socio actualizado correctamente')
      closeEditModal()
      await loadSocios()
    } else {
      formError.value = json.message || 'Error al actualizar socio'
    }
  } catch {
    formError.value = 'Error de conexión con el servidor'
  } finally {
    updatingSocio.value = false
  }
}

async function deleteSocio() {
  if (!socioToDelete.value) return
  deletingSocio.value = true
  try {
    const res = await fetch(`/api/socios/${socioToDelete.value.id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.success) {
      showNotif('success', 'Socio eliminado correctamente')
      cancelDelete()
      await loadSocios()
    } else {
      showNotif('error', json.message || 'Error al eliminar socio')
      cancelDelete()
    }
  } catch {
    showNotif('error', 'Error de conexión con el servidor')
    cancelDelete()
  } finally {
    deletingSocio.value = false
  }
}

// ── Acciones de modal ─────────────────────────────────────────────────────────
function cancelAddSocio() {
  showAddForm.value = false
  formError.value = ''
  newSocio.value = emptyForm()
}

function selectSocioToEdit(socio) {
  editSocio.value = { ...socio, mes_ingreso: socio.mes_ingreso || '' }
  formError.value = ''
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  formError.value = ''
}

function confirmDeleteSocio(socio) {
  socioToDelete.value = socio
  showDeleteModal.value = true
}

function cancelDelete() {
  showDeleteModal.value = false
  socioToDelete.value = null
}

// ── Exportación ───────────────────────────────────────────────────────────────
function exportToPDF() {
  if (!socios.value.length) return
  exportLoading.value = true
  try {
    const doc = new jsPDF()
    const primary = [13, 71, 161]
    const gray = [100, 116, 139]
    const lightBg = [241, 245, 249]
    const pageW = doc.internal.pageSize.getWidth()
    const margin = 15
    const colW = [18, 55, 28, 28, 28, 28]
    const headers = ['N° Socio', 'Nombre Completo', 'Cédula', 'Teléfono', 'Mes Ingreso', 'Ahorro $']

    const drawHeader = (y) => {
      doc.setFillColor(...primary)
      doc.rect(0, 0, pageW, 35, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text('LISTA DE SOCIOS', pageW / 2, 16, { align: 'center' })
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('Cajas Comunales Verdecocha', pageW / 2, 25, { align: 'center' })
      doc.setTextColor(...gray)
      doc.setFontSize(8)
      doc.text(`Exportado: ${new Date().toLocaleString('es-ES')}`, pageW / 2, 32, { align: 'center' })
    }

    const drawTableHeader = (y) => {
      doc.setFillColor(...lightBg)
      doc.rect(margin, y - 4, pageW - margin * 2, 8, 'F')
      doc.setTextColor(...primary)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      let x = margin
      headers.forEach((h, i) => { doc.text(h, x + 1, y); x += colW[i] })
      return y + 8
    }

    drawHeader(0)
    let y = 45
    y = drawTableHeader(y)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)

    filteredSocios.value.forEach((s, idx) => {
      if (y > 270) {
        doc.addPage()
        y = 15
        y = drawTableHeader(y)
      }
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252)
        doc.rect(margin, y - 4, pageW - margin * 2, 7, 'F')
      }
      doc.setTextColor(55, 65, 81)
      const row = [
        String(s.numero_socio),
        s.nombre_completo,
        s.cedula,
        s.telefono || '—',
        formatMesIngreso(s.mes_ingreso),
        `$${Number(s.ahorro_mensual || 0).toFixed(2)}`
      ]
      let x = margin
      row.forEach((val, i) => {
        const maxW = colW[i] - 2
        const text = doc.splitTextToSize(val, maxW)[0] || ''
        doc.text(text, x + 1, y)
        x += colW[i]
      })
      y += 7
    })

    // Totales
    y += 4
    doc.setDrawColor(...primary)
    doc.setLineWidth(0.4)
    doc.line(margin, y, pageW - margin, y)
    y += 6
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...primary)
    doc.text(`Total socios: ${socios.value.length}`, margin, y)
    doc.text(`Total ahorro mensual: $${totalAhorroMensual.value.toFixed(2)}`, pageW - margin, y, { align: 'right' })

    // Pie de página
    const pages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(150, 150, 150)
      doc.text(`Página ${i} de ${pages}`, pageW / 2, 290, { align: 'center' })
    }

    doc.save(`socios_${new Date().toISOString().split('T')[0]}.pdf`)
    showNotif('success', 'PDF exportado correctamente')
  } catch (e) {
    showNotif('error', 'Error al generar el PDF')
  } finally {
    exportLoading.value = false
  }
}

function exportToExcel() {
  if (!socios.value.length) return
  exportLoading.value = true
  try {
    const headers = ['N° Socio', 'Nombre Completo', 'Cédula', 'Teléfono', 'Mes Ingreso', 'Ahorro Mensual', 'Fecha Creación']
    const rows = filteredSocios.value.map(s => [
      s.numero_socio,
      `"${s.nombre_completo}"`,
      s.cedula,
      s.telefono || '',
      formatMesIngreso(s.mes_ingreso),
      s.ahorro_mensual,
      formatDate(s.fecha_creacion)
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `socios_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showNotif('success', 'CSV exportado correctamente')
  } catch {
    showNotif('error', 'Error al exportar CSV')
  } finally {
    exportLoading.value = false
  }
}

onMounted(loadSocios)
</script>

<style scoped>
/* ── Layout ─────────────────────────────────────────────────────────────────── */
.socios-content { display: flex; flex-direction: column; gap: 1.25rem; font-family: 'Segoe UI', sans-serif; }

.page-header {
  display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;
}
.page-header h3 { font-size: 1.5rem; font-weight: 700; color: #1f2937; margin: 0; }
.page-subtitle { font-size: 0.85rem; color: #6b7280; margin: 0.2rem 0 0; }

.header-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }

/* ── Filtros ─────────────────────────────────────────────────────────────────── */
.filters-bar { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }

.search-wrapper {
  position: relative; display: flex; align-items: center;
  flex: 1; min-width: 240px; max-width: 420px;
}
.search-icon {
  position: absolute; left: 0.75rem; width: 1rem; height: 1rem;
  color: #9ca3af; pointer-events: none;
}
.search-input {
  width: 100%; padding: 0.55rem 2.5rem 0.55rem 2.25rem;
  border: 1px solid #d1d5db; border-radius: 8px;
  font-size: 0.875rem; background: #f9fafb;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.search-input:focus {
  outline: none; border-color: #0D47A1;
  box-shadow: 0 0 0 3px rgba(13,71,161,0.1); background: white;
}
.clear-search {
  position: absolute; right: 0.6rem;
  background: none; border: none; font-size: 1.1rem;
  color: #9ca3af; cursor: pointer; padding: 0; line-height: 1;
}
.filter-info { font-size: 0.8rem; color: #6b7280; }

/* ── Stats ───────────────────────────────────────────────────────────────────── */
.stats-row { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.stat-chip {
  display: flex; flex-direction: column; gap: 0.15rem;
  background: #f9fafb; border: 1px solid #e5e7eb;
  border-radius: 8px; padding: 0.6rem 1rem;
}
.stat-label { font-size: 0.72rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; }
.stat-val { font-size: 1rem; font-weight: 700; color: #1f2937; }

/* ── Tabla ───────────────────────────────────────────────────────────────────── */
.table-section {
  background: white; border: 1px solid #e5e7eb;
  border-radius: 12px; overflow: hidden;
}
.table-wrapper { overflow-x: auto; }

.socios-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.socios-table thead { background: #f9fafb; }
.socios-table th {
  padding: 0.7rem 0.9rem; text-align: left;
  font-weight: 600; color: #374151; font-size: 0.8rem;
  border-bottom: 1px solid #e5e7eb; white-space: nowrap;
}
.socios-table th.sortable { cursor: pointer; user-select: none; }
.socios-table th.sortable:hover { color: #0D47A1; }
.sort-icon { font-size: 0.7rem; color: #9ca3af; margin-left: 0.2rem; }

.socios-table td {
  padding: 0.65rem 0.9rem; color: #374151;
  border-bottom: 1px solid #f3f4f6;
}
.socios-table tbody tr:last-child td { border-bottom: none; }
.socios-table tbody tr:hover { background: #f9fafb; }

.badge-numero {
  display: inline-block; background: #eff6ff; color: #1d4ed8;
  border-radius: 999px; padding: 0.15rem 0.55rem;
  font-size: 0.78rem; font-weight: 600;
}
.nombre-cell { font-weight: 500; }
.mono { font-family: monospace; font-size: 0.82rem; }
.monto { font-weight: 600; color: #065f46; }

.total-row { background: #f0fdf4; }
.total-row td { padding: 0.7rem 0.9rem; font-weight: 700; font-size: 0.85rem; color: #065f46; }
.total-label { color: #374151; }
.total-amount { color: #065f46; }

.row-actions { display: flex; gap: 0.35rem; }
.btn-icon {
  width: 1.8rem; height: 1.8rem; border: none; border-radius: 6px;
  cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; justify-content: center;
  transition: opacity 0.15s;
}
.btn-icon:hover { opacity: 0.8; }
.btn-edit-icon { background: #dbeafe; color: #1d4ed8; }
.btn-delete-icon { background: #fee2e2; color: #dc2626; }

/* ── Paginación ──────────────────────────────────────────────────────────────── */
.pagination {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.75rem 1rem; border-top: 1px solid #f3f4f6;
  flex-wrap: wrap;
}
.page-btn {
  padding: 0.3rem 0.6rem; border: 1px solid #d1d5db;
  border-radius: 6px; background: white; cursor: pointer;
  font-size: 0.85rem; color: #374151;
  transition: background 0.15s;
}
.page-btn:hover:not(:disabled) { background: #f3f4f6; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { font-size: 0.82rem; color: #6b7280; padding: 0 0.25rem; }
.page-size-select {
  margin-left: auto; padding: 0.3rem 0.5rem;
  border: 1px solid #d1d5db; border-radius: 6px;
  font-size: 0.82rem; background: white; cursor: pointer;
}

/* ── Estados vacíos ──────────────────────────────────────────────────────────── */
.state-box {
  display: flex; flex-direction: column; align-items: center;
  gap: 0.75rem; padding: 3rem 1rem; color: #6b7280; text-align: center;
}
.error-state { color: #dc2626; }

/* ── Modales ─────────────────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal {
  background: white; border-radius: 14px; padding: 1.5rem;
  width: 90%; max-width: 520px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  max-height: 90vh; overflow-y: auto;
}
.modal-sm { max-width: 400px; }
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1.25rem;
}
.modal-header h4 { font-size: 1.1rem; font-weight: 700; color: #1f2937; margin: 0; }
.close-btn {
  background: none; border: none; font-size: 1.4rem;
  color: #9ca3af; cursor: pointer; padding: 0; line-height: 1;
}
.close-btn:hover { color: #374151; }

.socio-form { display: flex; flex-direction: column; gap: 1rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.form-row:has(.form-group:only-child) { grid-template-columns: 1fr; }
.form-group { display: flex; flex-direction: column; gap: 0.3rem; }
.form-group label { font-size: 0.8rem; font-weight: 600; color: #374151; }
.form-group input {
  padding: 0.55rem 0.75rem; border: 1px solid #d1d5db;
  border-radius: 8px; font-size: 0.875rem; background: #f9fafb;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.form-group input:focus {
  outline: none; border-color: #0D47A1;
  box-shadow: 0 0 0 3px rgba(13,71,161,0.1); background: white;
}
.input-disabled { background: #f3f4f6 !important; color: #6b7280; cursor: not-allowed; }
.field-hint { font-size: 0.72rem; color: #9ca3af; }

.form-meta {
  display: flex; gap: 1rem; font-size: 0.75rem; color: #9ca3af;
  padding-top: 0.25rem; flex-wrap: wrap;
}

.form-error {
  background: #fef2f2; color: #991b1b; border: 1px solid #fecaca;
  border-radius: 8px; padding: 0.6rem 0.75rem; font-size: 0.85rem;
}

.modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 0.5rem; }

.delete-msg { color: #374151; margin: 0 0 0.5rem; font-size: 0.95rem; }
.delete-warning {
  background: #fef3c7; color: #92400e; border-radius: 8px;
  padding: 0.6rem 0.75rem; font-size: 0.85rem; margin: 0 0 1rem;
}

/* ── Botones ─────────────────────────────────────────────────────────────────── */
.btn-primary, .btn-ghost, .btn-outline, .btn-danger {
  padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.875rem;
  font-weight: 600; cursor: pointer; border: none;
  display: inline-flex; align-items: center; gap: 0.4rem;
  transition: opacity 0.15s, transform 0.1s;
}
.btn-primary:disabled, .btn-ghost:disabled, .btn-outline:disabled, .btn-danger:disabled {
  opacity: 0.5; cursor: not-allowed;
}
.btn-primary { background: #0D47A1; color: white; }
.btn-primary:hover:not(:disabled) { opacity: 0.9; }
.btn-ghost { background: #f3f4f6; color: #374151; }
.btn-ghost:hover:not(:disabled) { background: #e5e7eb; }
.btn-outline { background: white; color: #374151; border: 1px solid #d1d5db; }
.btn-outline:hover:not(:disabled) { background: #f9fafb; }
.btn-danger { background: #dc2626; color: white; }
.btn-danger:hover:not(:disabled) { opacity: 0.9; }

/* ── Notificación ────────────────────────────────────────────────────────────── */
.notification {
  position: fixed; bottom: 1.5rem; right: 1.5rem;
  padding: 0.875rem 1.25rem; border-radius: 10px;
  display: flex; align-items: center; gap: 0.75rem;
  font-size: 0.875rem; font-weight: 500;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15); z-index: 2000;
  max-width: 360px;
}
.notification.success { background: #d1fae5; color: #065f46; }
.notification.error { background: #fee2e2; color: #991b1b; }
.notif-close { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: inherit; margin-left: auto; }

.notif-enter-active, .notif-leave-active { transition: all 0.3s ease; }
.notif-enter-from, .notif-leave-to { opacity: 0; transform: translateY(10px); }

/* ── Spinner ─────────────────────────────────────────────────────────────────── */
.spinner {
  width: 2rem; height: 2rem; border: 3px solid #e5e7eb;
  border-top-color: #0D47A1; border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
.spinner-sm {
  width: 0.85rem; height: 0.85rem; border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white; border-radius: 50%;
  animation: spin 0.7s linear infinite; display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Responsive ──────────────────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .page-header { flex-direction: column; }
  .form-row { grid-template-columns: 1fr; }
  .stats-row { gap: 0.5rem; }
  .stat-chip { flex: 1; min-width: 120px; }
}
</style>
