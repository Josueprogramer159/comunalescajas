<template>
  <div class="backups-content">
    <h3>Copias de seguridad</h3>
    <p class="description">Gestión de copias de seguridad de la base de datos PostgreSQL.</p>

    <!-- ESTADÍSTICAS -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total de Backups</div>
        <div class="stat-value">{{ backups.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Último Backup</div>
        <div class="stat-value">{{ lastBackupDate || 'Ninguno' }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Tamaño Total</div>
        <div class="stat-value">{{ totalSize }}</div>
      </div>
      <div class="stat-card" :class="{ 'stat-active': autoBackup.enabled }">
        <div class="stat-label">Backup Automático</div>
        <div class="stat-value">{{ autoBackup.enabled ? `Cada ${autoBackup.intervalHours}h` : 'Desactivado' }}</div>
      </div>
    </div>

    <!-- ACCIONES PRINCIPALES -->
    <div class="action-buttons">
      <button class="btn-primary" @click="createBackup" :disabled="loading">
        <span v-if="loading" class="spinner"></span>
        {{ loading ? 'Creando...' : '+ Crear Backup' }}
      </button>
      <button class="btn-info" @click="exportarDatos" :disabled="exportando">
        {{ exportando ? 'Exportando...' : 'Exportar JSON' }}
      </button>
      <div class="file-input-wrapper">
        <input type="file" id="import-file" @change="importarDatos" accept=".json" class="file-input" :disabled="importando" />
        <label for="import-file" class="btn-warning" :class="{ disabled: importando }">
          {{ importando ? 'Importando...' : 'Importar JSON' }}
        </label>
      </div>
      <button class="btn-secondary" @click="loadBackups" :disabled="loading">Actualizar</button>
    </div>

    <!-- BACKUP AUTOMÁTICO -->
    <div class="auto-backup-section">
      <div class="auto-backup-header">
        <h4>Backup Automático</h4>
        <span class="badge" :class="autoBackup.enabled ? 'badge-active' : 'badge-inactive'">
          {{ autoBackup.enabled ? 'Activo' : 'Inactivo' }}
        </span>
      </div>
      <div class="auto-backup-controls">
        <label>Intervalo (horas):</label>
        <input
          type="number"
          v-model.number="autoBackupHours"
          min="1"
          max="168"
          class="input-hours"
          :disabled="savingAutoConfig"
        />
        <button class="btn-success" @click="activarAutoBackup" :disabled="savingAutoConfig || autoBackup.enabled && autoBackup.intervalHours === autoBackupHours">
          {{ autoBackup.enabled ? 'Actualizar' : 'Activar' }}
        </button>
        <button v-if="autoBackup.enabled" class="btn-danger-outline" @click="desactivarAutoBackup" :disabled="savingAutoConfig">
          Desactivar
        </button>
      </div>
      <p class="auto-backup-hint">
        Se creará un backup automáticamente cada {{ autoBackupHours }} hora{{ autoBackupHours !== 1 ? 's' : '' }}.
        El servidor debe estar corriendo para que funcione.
      </p>
    </div>

    <!-- LISTA DE BACKUPS -->
    <div class="backups-list">
      <h4>Historial de Backups</h4>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Cargando backups...</p>
      </div>

      <div v-else-if="error" class="empty-state error-state">
        <p>{{ error }}</p>
        <button class="btn-secondary" @click="loadBackups">Reintentar</button>
      </div>

      <div v-else-if="backups.length === 0" class="empty-state">
        <p>No hay copias de seguridad disponibles.</p>
        <p class="hint">Crea tu primer backup para proteger los datos del sistema.</p>
        <button class="btn-primary" @click="createBackup">Crear primer backup</button>
      </div>

      <div v-else class="backups-table">
        <table>
          <thead>
            <tr>
              <th>Fecha y Hora</th>
              <th>Nombre</th>
              <th>Tamaño</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="backup in backups" :key="backup.id">
              <td>{{ formatDate(backup.fecha) }}</td>
              <td class="filename">{{ backup.nombre }}</td>
              <td>{{ backup.tamano_legible }}</td>
              <td><span class="status completado">{{ backup.estado }}</span></td>
              <td>
                <div class="action-buttons-row">
                  <button @click="downloadBackup(backup)" class="btn-download" title="Descargar">↓</button>
                  <button @click="confirmDelete(backup)" class="btn-delete" title="Eliminar">✕</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL DE CONFIRMACIÓN -->
    <div v-if="modal.show" class="modal-overlay" @click.self="modal.show = false">
      <div class="modal">
        <h4>{{ modal.title }}</h4>
        <p>{{ modal.message }}</p>
        <p v-if="modal.warning" class="modal-warning">⚠️ {{ modal.warning }}</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="modal.show = false">Cancelar</button>
          <button class="btn-danger" @click="modal.onConfirm">{{ modal.confirmText }}</button>
        </div>
      </div>
    </div>

    <!-- NOTIFICACIONES -->
    <div v-if="notification.show" class="notification" :class="notification.type">
      <span>{{ notification.message }}</span>
      <button @click="notification.show = false" class="notification-close">×</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { authenticatedFetch } from '../utils/api'

const backups = ref([])
const loading = ref(false)
const exportando = ref(false)
const importando = ref(false)
const savingAutoConfig = ref(false)
const error = ref('')
const autoBackupHours = ref(24)
const autoBackup = ref({ enabled: false, intervalHours: 24 })

const notification = ref({ show: false, type: '', message: '' })
const modal = ref({ show: false, title: '', message: '', warning: '', confirmText: 'Confirmar', onConfirm: () => {} })

const lastBackupDate = computed(() => {
  if (!backups.value.length) return null
  return formatDate(backups.value[0].fecha)
})

const totalSize = computed(() => {
  const total = backups.value.reduce((sum, b) => sum + (b.tamano || 0), 0)
  if (total < 1024) return `${total} B`
  if (total < 1024 * 1024) return `${(total / 1024).toFixed(1)} KB`
  return `${(total / (1024 * 1024)).toFixed(1)} MB`
})

function getToken() {
  return sessionStorage.getItem('accessToken') || ''
}

function showNotification(type, message) {
  notification.value = { show: true, type, message }
  setTimeout(() => (notification.value.show = false), 5000)
}

function formatDate(fecha) {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

async function loadBackups() {
  loading.value = true
  error.value = ''
  try {
    const res = await authenticatedFetch('/api/backups')
    const data = await res.json()
    if (data.success) {
      backups.value = data.data
      autoBackup.value = data.autoBackup || { enabled: false, intervalHours: 24 }
      autoBackupHours.value = autoBackup.value.intervalHours
    } else {
      error.value = data.message || 'Error al cargar backups'
    }
  } catch (e) {
    error.value = 'No se pudo conectar con el servidor'
  } finally {
    loading.value = false
  }
}

async function createBackup() {
  loading.value = true
  try {
    const res = await authenticatedFetch('/api/backups', { method: 'POST' })
    const data = await res.json()
    if (data.success) {
      showNotification('success', 'Backup creado correctamente')
      await loadBackups()
    } else {
      showNotification('error', data.message || 'Error al crear backup')
    }
  } catch (e) {
    showNotification('error', 'Error de conexión al crear backup')
  } finally {
    loading.value = false
  }
}

async function downloadBackup(backup) {
  try {
    const res = await authenticatedFetch(`/api/backups/${backup.nombre}/download`)
    if (!res.ok) { showNotification('error', 'Error al descargar backup'); return }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = backup.nombre
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
    showNotification('success', 'Backup descargado')
  } catch (e) {
    showNotification('error', 'Error al descargar backup')
  }
}

function confirmDelete(backup) {
  modal.value = {
    show: true,
    title: 'Eliminar Backup',
    message: `¿Eliminar el backup "${backup.nombre}"?`,
    warning: 'Esta acción no se puede deshacer.',
    confirmText: 'Eliminar',
    onConfirm: () => deleteBackup(backup)
  }
}

async function deleteBackup(backup) {
  modal.value.show = false
  try {
    const res = await authenticatedFetch(`/api/backups/${backup.nombre}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      showNotification('success', 'Backup eliminado')
      await loadBackups()
    } else {
      showNotification('error', data.message || 'Error al eliminar')
    }
  } catch (e) {
    showNotification('error', 'Error de conexión')
  }
}

async function activarAutoBackup() {
  savingAutoConfig.value = true
  try {
    const res = await authenticatedFetch('/api/backups/auto-config', {
      method: 'POST',
      body: JSON.stringify({ enabled: true, intervalHours: autoBackupHours.value })
    })
    const data = await res.json()
    if (data.success) {
      autoBackup.value = data.autoBackup
      showNotification('success', data.message)
    } else {
      showNotification('error', data.message)
    }
  } catch (e) {
    showNotification('error', 'Error al configurar backup automático')
  } finally {
    savingAutoConfig.value = false
  }
}

async function desactivarAutoBackup() {
  savingAutoConfig.value = true
  try {
    const res = await authenticatedFetch('/api/backups/auto-config', {
      method: 'POST',
      body: JSON.stringify({ enabled: false, intervalHours: autoBackupHours.value })
    })
    const data = await res.json()
    if (data.success) {
      autoBackup.value = data.autoBackup
      showNotification('success', 'Backup automático desactivado')
    } else {
      showNotification('error', data.message)
    }
  } catch (e) {
    showNotification('error', 'Error al desactivar backup automático')
  } finally {
    savingAutoConfig.value = false
  }
}

// Exportar todos los datos como JSON (mantiene funcionalidad existente)
async function exportarDatos() {
  exportando.value = true
  try {
    const endpoints = [
      'socios', 'directiva', 'caja-general', 'caja-chica', 'aportes', 'prestamos',
      'registro-aportes', 'registro-prestamos', 'libretas-prestamos', 'balance-general', 'cuerpo-normativo'
    ]
    const datosCompletos = {
      informacion: {
        fecha_exportacion: new Date().toISOString(),
        version: '1.0',
        sistema: 'Cajas Comunales Verdecocha'
      },
      tablas: {}
    }
    for (const endpoint of endpoints) {
      try {
        const res = await authenticatedFetch(`/api/${endpoint}`)
        const result = await res.json()
        datosCompletos.tablas[endpoint] = {
          datos: result.success ? result.data : [],
          cantidad: result.success ? result.data.length : 0,
          estado: result.success ? 'exitoso' : 'error'
        }
      } catch {
        datosCompletos.tablas[endpoint] = { datos: [], cantidad: 0, estado: 'error' }
      }
    }
    const blob = new Blob([JSON.stringify(datosCompletos, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `datos_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
    showNotification('success', 'Datos exportados correctamente')
  } catch (e) {
    showNotification('error', 'Error al exportar datos')
  } finally {
    exportando.value = false
  }
}

async function importarDatos(event) {
  const file = event.target.files[0]
  if (!file) return
  if (!file.name.endsWith('.json')) {
    showNotification('error', 'El archivo debe ser de tipo JSON')
    return
  }

  modal.value = {
    show: true,
    title: 'Importar Datos',
    message: `¿Importar datos desde "${file.name}"?`,
    warning: 'Esto sobrescribirá TODOS los datos actuales en todas las tablas. Esta acción no se puede deshacer.',
    confirmText: 'Importar',
    onConfirm: () => ejecutarImportacion(file, event)
  }
}

async function ejecutarImportacion(file, event) {
  modal.value.show = false
  importando.value = true
  try {
    const text = await file.text()
    const datosImportar = JSON.parse(text)
    if (!datosImportar.tablas) {
      showNotification('error', 'El archivo no tiene el formato correcto')
      return
    }
    let importadas = 0, errores = 0
    for (const [nombreTabla, datosTabla] of Object.entries(datosImportar.tablas)) {
      if (datosTabla.estado === 'exitoso' && Array.isArray(datosTabla.datos) && datosTabla.datos.length > 0) {
        try {
          const res = await authenticatedFetch(`/api/importar/${nombreTabla}`, {
            method: 'POST',
            body: JSON.stringify({ datos: datosTabla.datos, sobrescribir: true })
          })
          const result = await res.json()
          result.success ? importadas++ : errores++
        } catch { errores++ }
      }
    }
    showNotification(errores === 0 ? 'success' : 'warning',
      `Importación completada: ${importadas} tablas correctas, ${errores} con errores`)
  } catch (e) {
    showNotification('error', 'Error al leer o procesar el archivo')
  } finally {
    importando.value = false
    event.target.value = ''
  }
}

onMounted(loadBackups)
</script>

<style scoped>
.backups-content { padding: 1.5rem; max-width: 1100px; }
h3 { font-size: 1.5rem; font-weight: 700; color: #1f2937; margin: 0 0 0.25rem; }
h4 { font-size: 1rem; font-weight: 600; color: #374151; margin: 0 0 1rem; }
.description { color: #6b7280; margin: 0 0 1.5rem; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.stat-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
}
.stat-card.stat-active { border-color: #10b981; background: #f0fdf4; }
.stat-label { font-size: 0.75rem; color: #6b7280; margin-bottom: 0.25rem; }
.stat-value { font-size: 1.1rem; font-weight: 700; color: #1f2937; }

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  align-items: center;
}

.auto-backup-section {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}
.auto-backup-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
.auto-backup-controls { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.auto-backup-controls label { font-size: 0.875rem; color: #374151; }
.input-hours {
  width: 80px;
  padding: 0.4rem 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}
.auto-backup-hint { font-size: 0.8rem; color: #6b7280; margin: 0.75rem 0 0; }

.badge { padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
.badge-active { background: #d1fae5; color: #065f46; }
.badge-inactive { background: #f3f4f6; color: #6b7280; }

.backups-list { background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 1.25rem; }

.loading { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 2rem; color: #6b7280; }
.empty-state { text-align: center; padding: 2.5rem 1rem; color: #6b7280; }
.empty-state p { margin: 0 0 0.5rem; }
.hint { font-size: 0.85rem; }
.error-state { color: #dc2626; }

.backups-table { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
th { text-align: left; padding: 0.6rem 0.75rem; background: #f9fafb; color: #374151; font-weight: 600; border-bottom: 1px solid #e5e7eb; }
td { padding: 0.6rem 0.75rem; border-bottom: 1px solid #f3f4f6; color: #374151; }
tr:last-child td { border-bottom: none; }
.filename { font-family: monospace; font-size: 0.8rem; color: #6b7280; }

.status { padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
.status.completado { background: #d1fae5; color: #065f46; }

.action-buttons-row { display: flex; gap: 0.4rem; }

/* Botones */
button, .btn-warning {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
button:disabled, .btn-warning.disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: #0D47A1; color: white; }
.btn-success { background: #10b981; color: white; }
.btn-info { background: #3b82f6; color: white; }
.btn-warning { background: #f59e0b; color: white; }
.btn-secondary { background: #e5e7eb; color: #374151; }
.btn-danger { background: #dc2626; color: white; }
.btn-danger-outline { background: transparent; color: #dc2626; border: 1px solid #dc2626; }
.btn-download { background: #3b82f6; color: white; padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.8rem; }
.btn-delete { background: #fee2e2; color: #dc2626; padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.8rem; }

.file-input { display: none; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.modal h4 { margin: 0 0 0.75rem; font-size: 1.1rem; }
.modal p { color: #374151; margin: 0 0 0.5rem; font-size: 0.9rem; }
.modal-warning { color: #b45309; background: #fef3c7; padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.85rem; }
.modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.25rem; }

/* Notificación */
.notification {
  position: fixed; bottom: 1.5rem; right: 1.5rem;
  padding: 0.875rem 1.25rem;
  border-radius: 10px;
  display: flex; align-items: center; gap: 0.75rem;
  font-size: 0.9rem; font-weight: 500;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 2000;
  max-width: 380px;
}
.notification.success { background: #d1fae5; color: #065f46; }
.notification.error { background: #fee2e2; color: #991b1b; }
.notification.warning { background: #fef3c7; color: #92400e; }
.notification-close { background: none; border: none; font-size: 1.1rem; cursor: pointer; padding: 0; color: inherit; margin-left: auto; }

.spinner {
  width: 0.9rem; height: 0.9rem;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
