  <template>
  <div class="directivo-content">
    <h3>Cuerpo Directivo</h3>
    <p class="description">
      Gestión de la imagen del cuerpo directivo de la organización.
    </p>

    <!-- Image uploader -->
    <div class="directivo-image-uploader">
      <div class="image-preview-wrap">
        <img
          :src="previewImage || directivoImage || defaultImage"
          alt="Cuerpo Directivo"
          class="image-preview image-large"
          @error="handleImageError"
        />

        <div class="image-actions" v-if="previewImage">
          <button @click="removePreview" class="btn-cancel-action">
            Cancelar
          </button>
        </div>

        <div class="image-actions" v-else-if="directivoImage">
          <button @click="deleteDirectivoImage" class="btn-delete-action" title="Eliminar Imagen">
            Eliminar
          </button>
        </div>
      </div>

      <div class="upload-section">
        <div class="upload-controls">
          <label for="directivo-file-input" class="file-upload-label">
            Seleccionar Imagen
          </label>

          <input
            type="file"
            id="directivo-file-input"
            accept="image/*"
            @change="handleDirectivoImageChange"
            ref="fileInput"
            class="file-input"
          />

          <button
            class="btn-save-action"
            :disabled="!previewImage"
            @click="saveDirectivoImage"
          >
            Guardar
          </button>
        </div>

        <p class="upload-hint">
          Formatos: JPG, PNG, GIF · Máx 5MB
        </p>
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
import { ref, onMounted } from 'vue'

const directivoImage = ref(null)
const previewImage = ref(null)
const fileInput = ref(null)

const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QkE0IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCI+Q291cnAgRGlyZWN0aXZlPC90ZXh0Pgo8L3N2Zz4=' // Placeholder SVG as base64

// Cargar imagen guardada localmente al iniciar
const loadLocalImage = () => {
  const savedImage = localStorage.getItem('directivoImage')
  if (savedImage) {
    directivoImage.value = savedImage
  }
}

// Cargar imagen al iniciar (primero local, luego del backend si está disponible)
onMounted(async () => {
  // Cargar imagen guardada localmente primero
  loadLocalImage()

  // Solo intentar cargar del backend si no hay imagen local
  if (!directivoImage.value) {
    try {
      const response = await fetch('/api/directiva-image', {
        signal: AbortSignal.timeout(2000) // timeout de 2 segundos
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.url) {
          directivoImage.value = data.url
        }
      }
    } catch (error) {
      // Backend no disponible - usar imagen local si existe
      // No mostrar ningún error en consola del navegador
    }
  }
})

// 📸 Seleccionar imagen
const handleDirectivoImageChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const allowed = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowed.includes(file.type)) {
    alert('Formato inválido')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('Máximo 5MB')
    return
  }

  previewImage.value = URL.createObjectURL(file)
}

// Cancelar preview
const removePreview = () => {
  URL.revokeObjectURL(previewImage.value)
  previewImage.value = null
  fileInput.value.value = ''
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

// Eliminar imagen guardada
const deleteDirectivoImage = () => {
  showCustomConfirm(
    '¿Está seguro de que desea eliminar la imagen del cuerpo directivo?',
    () => {
      directivoImage.value = null
      localStorage.removeItem('directivoImage')
      // Eliminado: showCustomNotification('Imagen eliminada correctamente', 'success')
    }
  )
}

// Manejar error de carga de imagen
const handleImageError = (e) => {
  // Solo cambiar a placeholder si es URL del backend que falla
  if (e.target.src.includes('/uploads/') && !e.target.src.includes('data:')) {
    e.target.src = defaultImage
  }
}

// Guardar imagen
const saveDirectivoImage = async () => {
  if (!previewImage.value) {
    showCustomNotification('Por favor, selecciona una imagen primero', 'error')
    return
  }

  const file = fileInput.value?.files?.[0]
  if (!file) {
    showCustomNotification('Error: No se encontró el archivo', 'error')
    return
  }

  // Mostrar confirmación antes de guardar
  showCustomConfirm(
    '¿Está seguro de que desea guardar esta imagen como el cuerpo directivo?',
    async () => {
      try {
        // Convertir a data URL para guardar localmente (siempre funciona)
        const dataUrl = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.readAsDataURL(file)
        })

        // Guardar en localStorage primero (esto siempre funciona)
        localStorage.setItem('directivoImage', dataUrl)
        directivoImage.value = dataUrl

        // Limpiar el input y el preview
        fileInput.value.value = ''
        previewImage.value = null

        // Intentar guardar en backend en background (opcional)
        try {
          const formData = new FormData()
          formData.append('image', file)

          const response = await fetch('/api/upload-directiva-image', {
            method: 'POST',
            body: formData
          })

          const data = await response.json()

          if (data.success && data.url) {
            console.log('Imagen sincronizada con backend:', data.url)
          }
        } catch (backendError) {
          console.log('Backend no disponible, usando localStorage')
        }

        // Eliminado: showCustomNotification('✓ Imagen guardada correctamente', 'success')
      } catch (error) {
        console.error('Error al procesar la imagen:', error)
        showCustomNotification('✗ Error al procesar la imagen: ' + error.message, 'error')
      }
    }
  )
}
</script>

<style scoped>
.directivo-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.description {
  color: #666;
}

.directivo-image-uploader {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  border: 2px dashed #e5e7eb;
  text-align: center;
}

.image-preview {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
  border-radius: 8px;
}

.image-actions {
  margin-top: 1rem;
}

.btn-cancel-action,
.btn-delete-action,
.btn-save-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
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

.file-upload-label {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: inline-block;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.file-upload-label:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.file-input {
  display: none;
}

.btn-save-action {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-save-action:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-save-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.upload-hint {
  margin-top: 1rem;
  color: #6b7280;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upload-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.directivo-info-section {
  background: white;
  padding: 2rem;
  border-radius: 10px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #667eea;
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
