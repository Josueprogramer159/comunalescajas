<template>
  <div class="cuerpo-normativo-content">
    <h3>Cuerpo Normativo</h3>
    <p class="description">Gestión de documentos normativos de la organización. Agregue secciones y PDFs según sea necesario.</p>

    <!-- Add New Section Form -->
    <div v-if="showAddModal" class="modal-overlay" @click="cancelForm">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Agregar Nueva Sección</h3>
          <button @click="cancelForm" class="close-btn">&times;</button>
        </div>

        <form @submit.prevent="addSection" class="form-section">
          <div class="form-group">
            <label for="section-title">Título de la Sección:</label>
            <input
              id="section-title"
              v-model="newSection.titulo"
              type="text"
              placeholder="Ej: Estatutos 2025"
              required
            />
          </div>

          <div class="form-group">
            <label for="section-description">Descripción:</label>
            <textarea
              id="section-description"
              v-model="newSection.descripcion"
              placeholder="Descripción breve de la sección"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="section-type">Tipo de Documento:</label>
            <select
              id="section-type"
              v-model="newSection.tipo_documento"
              required
            >
              <option value="">Seleccionar tipo</option>
              <option value="estatuto">Estatuto</option>
              <option value="reglamento">Reglamento</option>
              <option value="norma">Norma</option>
              <option value="politica">Política</option>
              <option value="procedimiento">Procedimiento</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div class="form-group">
            <label for="section-pdf">Archivo PDF:</label>
            <div class="file-input-wrapper">
              <label for="section-pdf" class="file-select-btn">Escoja su archivo</label>
              <input
                id="section-pdf"
                type="file"
                @change="handleFileSelect"
                accept=".pdf"
                required
                class="file-input-hidden"
              />
              <small class="file-status">
                {{ selectedFile ? `Archivo seleccionado: ${selectedFile.name}` : 'No seleccionado aún' }}
              </small>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="cancelForm" class="btn-cancel-action">
              Cancelar
            </button>
            <button type="submit" class="btn-add-action" :disabled="!selectedFile || loading">
              {{ loading ? 'Agregando...' : 'Agregar Sección' }}
            </button>
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

    <!-- Add Section Button -->
    <div class="add-section-button" v-if="!showAddModal">
      <button @click="showAddModal = true" class="btn-add-new-action">
        Agregar Nueva Sección
      </button>
    </div>

    <!-- Sections List -->
    <div class="sections-list">
      <h4>Secciones Disponibles</h4>

      <div v-if="sections.length === 0" class="no-sections">
        <p>No hay secciones agregadas aún. Haga clic en "Agregar Nueva Sección" para comenzar.</p>
      </div>

      <div v-else class="sections-grid">
        <div
          v-for="section in sections"
          :key="section.id"
          class="section-card"
        >
          <div class="section-header">
            <h5>{{ section.titulo }}</h5>
            <div class="section-actions">
              <button @click="downloadSection(section)" class="btn-download-action" title="Descargar PDF">
                Descargar PDF
              </button>
              <button @click="deleteSection(section.id)" class="btn-delete-action" title="Eliminar Sección">
                Eliminar
              </button>
            </div>
          </div>

          <div class="section-content">
            <p v-if="section.descripcion" class="section-description">
              {{ section.descripcion }}
            </p>
            <div class="section-info">
              <span class="info-item">
                Fecha: {{ formatDate(section.fecha_creacion) }}
              </span>
              <span class="info-item">
                {{ section.archivo_url ? 'PDF disponible' : 'Sin archivo' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Additional Information Section -->
    <div class="additional-info">
      <h4>Información Importante</h4>
      <div class="info-cards">
        <div class="info-card">
          <div class="card-content">
            <h5>Gestión de Documentos</h5>
            <ul>
              <li>Agregue nuevas secciones según necesite</li>
              <li>Suba archivos PDF actualizados</li>
              <li>Mantenga organizados los documentos normativos</li>
              <li>Facilite el acceso a información importante</li>
            </ul>
          </div>
        </div>

        <div class="info-card">
          <div class="card-content">
            <h5>Marco Legal</h5>
            <ul>
              <li>Ley de Cooperativas</li>
              <li>Regulaciones financieras</li>
              <li>Normas contables</li>
              <li>Código de ética</li>
            </ul>
          </div>
        </div>

        <div class="info-card">
          <div class="card-content">
            <h5>Órganos Directivos</h5>
            <ul>
              <li>Asamblea General</li>
              <li>Junta Directiva</li>
              <li>Comité de Vigilancia</li>
              <li>Gerencia</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

// Estado de las secciones
const sections = ref([])
const showAddModal = ref(false)
const loading = ref(false)
const selectedFile = ref(null)

// Formulario para nueva sección
const newSection = reactive({
  titulo: '',
  descripcion: '',
  tipo_documento: ''
})

// Cargar secciones al montar el componente
onMounted(async () => {
  await loadSections()
})

// Función para cargar secciones desde backend
async function loadSections() {
  // Comenzar vacío - solo cargar desde backend si está disponible
  sections.value = []

  // Intentar cargar desde backend si está disponible (sin mostrar errores)
  try {
    const xhr = new XMLHttpRequest()
    xhr.timeout = 1000

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

      xhr.open('GET', '/api/normativa', true)
      xhr.send()
    })

    const data = await responsePromise

    if (data.success && data.data && data.data.length > 0) {
      // Si hay datos del backend, usarlos
      sections.value = data.data
    }
  } catch (error) {
    // Backend no disponible - mantener vacío
  }
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file && file.type === 'application/pdf') {
    selectedFile.value = file
  } else {
    showCustomNotification('Por favor seleccione un archivo PDF válido.', 'error')
    event.target.value = ''
    selectedFile.value = null
  }
}

async function addSection() {
  if (!selectedFile.value) {
    showCustomNotification('Por favor seleccione un archivo PDF.', 'error')
    return
  }

  loading.value = true

  try {
    // Crear FormData para enviar archivo y datos
    const formData = new FormData()
    formData.append('titulo', newSection.titulo)
    formData.append('descripcion', newSection.descripcion || '')
    formData.append('tipo_documento', newSection.tipo_documento)
    formData.append('pdf', selectedFile.value)
    formData.append('usuario_creador', 'Usuario Frontend')

    const response = await fetch('/api/normativa', {
      method: 'POST',
      body: formData
    })

    const data = await response.json()

    if (data.success) {
      // Eliminado: alert('Sección agregada correctamente.')
      // Recargar secciones desde el backend
      await loadSections()

      // Limpiar formulario
      newSection.titulo = ''
      newSection.descripcion = ''
      newSection.tipo_documento = ''
      selectedFile.value = null
      document.getElementById('section-pdf').value = ''
      showAddModal.value = false
    } else {
      showCustomNotification('Error al agregar sección: ' + data.message, 'error')
    }
  } catch (error) {
    console.error('Error al agregar sección:', error.message)
    showCustomNotification('Error de conexión. Verifica que el servidor esté corriendo.', 'error')
  } finally {
    loading.value = false
  }
}

function cancelForm() {
  newSection.titulo = ''
  newSection.descripcion = ''
  newSection.tipo_documento = ''
  selectedFile.value = null
  document.getElementById('section-pdf').value = ''
  showAddModal.value = false
}

async function downloadSection(section) {
  if (!section.archivo_url) {
    alert('No hay archivo disponible para descargar.')
    return
  }

  try {
    const filename = section.archivo_original || section.archivo_url.split('/').pop() || 'documento'
    
    console.log('📥 Intentando descargar:', section.archivo_url)
    
    // Intentar descargar desde la URL directa
    try {
      const response = await fetch(section.archivo_url)
      
      if (response.ok) {
        const blob = await response.blob()
        console.log('📊 Blob descargado:', {
          size: blob.size,
          type: blob.type,
          contentType: response.headers.get('content-type')
        })
        
        // Validar que sea un PDF o al menos tenga un tamaño razonable
        if (blob.size > 500) { // Reducido a 500 bytes para PDFs pequeños
          // Verificar si es PDF por el contenido
          const arrayBuffer = await blob.arrayBuffer()
          const uint8Array = new Uint8Array(arrayBuffer)
          
          // Verificar firma PDF (%PDF-)
          const pdfSignature = String.fromCharCode(...uint8Array.slice(0, 5))
          if (pdfSignature === '%PDF-') {
            console.log('✅ Firma PDF válida encontrada')
            
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            return
          } else {
            console.error('❌ El archivo no tiene firma PDF válida')
            console.log('📄 Primeros 20 bytes:', Array.from(uint8Array.slice(0, 20)).map(b => b.toString(16).padStart(2, '0')).join(' '))
            throw new Error('El archivo descargado no es un PDF válido')
          }
        } else {
          console.error('❌ Archivo demasiado pequeño:', blob.size)
          // Mostrar contenido para debug
          const arrayBuffer = await blob.arrayBuffer()
          const uint8Array = new Uint8Array(arrayBuffer)
          console.log('📄 Contenido (hex):', Array.from(uint8Array.slice(0, 20)).map(b => b.toString(16).padStart(2, '0')).join(' '))
          console.log('📄 Contenido (texto):', new TextDecoder().decode(uint8Array.slice(0, 100)))
          throw new Error('El archivo está vacío o es demasiado pequeño')
        }
      }
    } catch (directError) {
      console.log('❌ No se pudo descargar desde URL directa:', directError.message)
    }
    
    // Fallback: intentar desde endpoint /api/download
    console.log('🔄 Intentando descargar desde API fallback...')
    const apiFilename = section.archivo_url.split('/').pop()
    const response = await fetch(`/api/download/${apiFilename}`)
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }
    
    const blob = await response.blob()
    console.log('📊 Blob desde API:', {
      size: blob.size,
      type: blob.type,
      contentType: response.headers.get('content-type')
    })
    
    if (blob.size < 1000) {
      throw new Error('El archivo descargado está vacío o es demasiado pequeño')
    }
    
    // Verificar firma PDF
    const arrayBuffer = await blob.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    const pdfSignature = String.fromCharCode(...uint8Array.slice(0, 5))
    
    if (pdfSignature !== '%PDF-') {
      throw new Error('El archivo descargado no es un PDF válido')
    }
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    console.log('✅ PDF descargado exitosamente')
  } catch (error) {
    console.error('❌ Error descargando archivo:', error)
    showCustomNotification(`Error al descargar el archivo: ${error.message}`, 'error')
  }
}

// Estado para el modal de confirmación
const showConfirmModal = ref(false)
const confirmAction = ref(null)
const confirmMessage = ref('')

// Estado para notificaciones (reemplaza alert())
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref('success') // success, error, info

// Función para mostrar confirmación personalizada
function showCustomConfirm(message, onConfirm) {
  console.log('🔔 Mostrando confirmación:', message)
  confirmMessage.value = message
  confirmAction.value = onConfirm
  showConfirmModal.value = true
  console.log('🔔 Estado del modal:', showConfirmModal.value)
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

async function deleteSection(sectionId) {
  showCustomConfirm(
    '¿Está seguro de que desea eliminar esta sección? Esta acción no se puede deshacer.',
    async () => {
      try {
        const response = await fetch(`/api/normativa/${sectionId}`, {
          method: 'DELETE'
        })

        const data = await response.json()

        if (data.success) {
          // Eliminado: alert('Sección eliminada correctamente.')
          // Recargar secciones desde el backend
          await loadSections()
        } else {
          showCustomNotification('Error al eliminar sección: ' + data.message, 'error')
        }
      } catch (error) {
        console.error('Error al eliminar sección:', error.message)
        showCustomNotification('Error de conexión. Verifica que el servidor esté corriendo.', 'error')
      }
    }
  )
}

function formatDate(dateString) {
  if (!dateString) return 'Fecha no disponible'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
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
  max-width: 90vw;
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

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
}

.cuerpo-normativo-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.cuerpo-normativo-content h3 {
  color: #667eea;
  font-size: 1.4rem;
}

.description {
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
}

/* Formulario para agregar sección */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #455a64;
  font-size: 0.95rem;
}

.form-group input,
.form-group textarea {
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  background: white;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.file-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-select-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #0f0d0d;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  text-align: center;
  display: inline-block;
}

.file-select-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.file-input-hidden {
  display: none;
}

.file-status {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
}

.file-info {
  color: #28a745;
  font-size: 0.9rem;
  font-weight: 500;
}

.btn-add-action,
.btn-cancel-action {
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

.btn-add-action {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-add-action:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-add-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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

/* Botón para agregar nueva sección */
.add-section-button {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.btn-add-new-action {
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-add-new-action:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

/* Lista de secciones */
.sections-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 2rem;
}

.sections-list h4 {
  color: #667eea;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.no-sections {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.no-sections p {
  font-size: 1.1rem;
  margin: 0;
}

.sections-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
}

.section-card {
  background: #f8fafc;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.section-header h5 {
  color: #667eea;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  flex: 1;
  margin-right: 1rem;
}

.section-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-download-action,
.btn-delete-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  font-weight: 600;
}

.btn-download-action {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-download-action:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
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

.section-content {
  margin-bottom: 1rem;
}

.section-description {
  color: #6c757d;
  margin-bottom: 1rem;
  line-height: 1.5;
  font-size: 0.95rem;
}

.section-info {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.info-item {
  color: #6c757d;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Información adicional */
.additional-info {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  padding: 2rem;
}

.additional-info h4 {
  color: #667eea;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.info-card {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  border-color: #667eea;
}

.card-content h5 {
  color: #667eea;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

.card-content ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.card-content li {
  color: #6b7280;
  margin-bottom: 0.5rem;
  padding-left: 1rem;
  position: relative;
}

.card-content li:before {
  content: '✓';
  color: #10b981;
  font-weight: bold;
  position: absolute;
  left: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .cuerpo-normativo-content {
    gap: 1.5rem;
  }

  .sections-list,
  .additional-info {
    padding: 1.5rem;
  }

  .sections-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .section-actions {
    align-self: flex-end;
  }

  .info-cards {
    grid-template-columns: 1fr;
  }

  .info-card {
    flex-direction: column;
    text-align: center;
  }

  .card-content ul {
    text-align: left;
  }
}

@media (max-width: 480px) {
  .sections-list,
  .additional-info {
    padding: 1rem;
  }

  .btn-add-new {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
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
</style>
