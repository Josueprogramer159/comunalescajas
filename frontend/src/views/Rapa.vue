<template>
  <div class="rapa-container">
    <!-- HEADER -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-icon"><i class="fas fa-table"></i></div>
        <div class="header-text">
          <h1>Rapa</h1>
          <p class="subtitle">Registro de movimientos mensuales por socio</p>
        </div>
      </div>
    </div>

    <!-- BOTÓN AGREGAR TABLA -->
    <div class="acciones-top">
      <button class="btn-nueva-tabla" @click="showModal = true">
        + Nueva Tabla
      </button>
    </div>

    <!-- MODAL NUEVA TABLA -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <h4>Nueva Tabla</h4>
        <div class="form-group">
          <label>Mes *</label>
          <select v-model="modalForm.mes">
            <option value="">Seleccionar mes</option>
            <option v-for="m in meses" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Año *</label>
          <select v-model="modalForm.anio">
            <option value="">Seleccionar año</option>
            <option v-for="a in anios" :key="a" :value="a">{{ a }}</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showModal = false">Cancelar</button>
          <button class="btn-accept" @click="crearTabla" :disabled="!modalForm.mes || !modalForm.anio">Agregar</button>
        </div>
      </div>
    </div>

    <!-- TABLAS -->
    <div v-for="tabla in tablas" :key="tabla.key" class="tabla-card">
      <!-- Cabecera de la tabla -->
      <div class="tabla-header">
        <div>
          <h4>REGISTRO RAPA</h4>
          <p>{{ tabla.mes }} {{ tabla.anio }}</p>
        </div>
        <div class="tabla-header-btns">
          <div class="search-group">
            <i class="fas fa-search search-icon"></i>
            <input
              v-model="tabla.filtro"
              type="text"
              placeholder="Buscar socio..."
              class="input-buscar"
            />
          </div>
          <button class="btn-agregar-fila" @click="agregarFila(tabla)">+ Agregar socio</button>
          <button class="btn-guardar" @click="guardarTabla(tabla)" :disabled="tabla.guardando">
            {{ tabla.guardando ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>

      <!-- Tabla de datos -->
      <div class="tabla-wrapper">
        <table>
          <thead>
            <tr class="thead-group">
              <th rowspan="2" class="th-socio">SOCIO</th>
              <th rowspan="2" class="th-asist">ASIST.</th>
              <th colspan="3" class="th-group ahorros">AHORROS</th>
              <th colspan="5" class="th-group prestamos">PRÉSTAMOS</th>
              <th rowspan="2" class="th-accion">ACC.</th>
            </tr>
            <tr class="thead-cols">
              <th>AHORRO</th>
              <th>RETIRO</th>
              <th>SALDO</th>
              <th>CONCEDIDO</th>
              <th>INTERÉS</th>
              <th>TOTAL ADEUDADO</th>
              <th>PAGO P+I</th>
              <th>SALDO PRÉSTAMO</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(fila, i) in filasFiltradas(tabla)"
              :key="i"
              :class="{ 'fila-par': i % 2 === 0, 'fila-editando': fila.editando }"
            >
              <!-- SOCIO -->
              <td class="td-socio">
                <select v-if="fila.editando" v-model="fila.socio_id" @change="onSocioFilaChange(fila)">
                  <option value="">-- Socio --</option>
                  <option v-for="s in socios" :key="s.id" :value="s.id">{{ s.nombre_completo }}</option>
                </select>
                <span v-else class="td-texto">{{ fila.socio_nombre || '—' }}</span>
              </td>
              <!-- ASISTENCIA -->
              <td>
                <input type="checkbox" v-model="fila.asistencia" :disabled="!fila.editando" />
              </td>
              <!-- AHORRO -->
              <td>
                <input v-if="fila.editando" type="number" v-model.number="fila.ahorro" @input="calcularPorFila(tabla, fila)" min="0" />
                <span v-else class="td-texto">{{ fmt(fila.ahorro) }}</span>
              </td>
              <!-- RETIRO -->
              <td>
                <input v-if="fila.editando" type="number" v-model.number="fila.retiro" @input="calcularPorFila(tabla, fila)" min="0" />
                <span v-else class="td-texto">{{ fmt(fila.retiro) }}</span>
              </td>
              <!-- SALDO (calculado) -->
              <td class="td-calc">{{ fmt(fila.saldo) }}</td>
              <!-- CONCEDIDO -->
              <td>
                <input v-if="fila.editando" type="number" v-model.number="fila.concedido" @input="calcularPorFila(tabla, fila)" min="0" />
                <span v-else class="td-texto">{{ fmt(fila.concedido) }}</span>
              </td>
              <!-- INTERÉS -->
              <td>
                <input v-if="fila.editando" type="number" v-model.number="fila.interes" @input="calcularPorFila(tabla, fila)" min="0" />
                <span v-else class="td-texto">{{ fmt(fila.interes) }}</span>
              </td>
              <!-- TOTAL ADEUDADO (calculado) -->
              <td class="td-calc">{{ fmt(fila.totalAdeudado) }}</td>
              <!-- PAGO -->
              <td>
                <input v-if="fila.editando" type="number" v-model.number="fila.pagoPrestamo" @input="calcularPorFila(tabla, fila)" min="0" />
                <span v-else class="td-texto">{{ fmt(fila.pagoPrestamo) }}</span>
              </td>
              <!-- SALDO PRÉSTAMO (calculado) -->
              <td class="td-calc">{{ fmt(fila.saldoPrestamo) }}</td>
              <!-- ACCIONES -->
              <td class="td-acciones">
                <button
                  v-if="!fila.editando"
                  class="btn-edit-fila"
                  @click="fila.editando = true"
                  title="Editar"
                >✏️</button>
                <button
                  v-else
                  class="btn-ok-fila"
                  @click="fila.editando = false"
                  title="Confirmar"
                >✔</button>
                <button class="btn-del-fila" @click="eliminarFilaPorReferencia(tabla, fila)" title="Eliminar">✕</button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="tfoot-row">
              <td colspan="2"><strong>TOTALES</strong></td>
              <td><strong>{{ fmt(totales(tabla).ahorro) }}</strong></td>
              <td><strong>{{ fmt(totales(tabla).retiro) }}</strong></td>
              <td><strong>{{ fmt(totales(tabla).saldo) }}</strong></td>
              <td><strong>{{ fmt(totales(tabla).concedido) }}</strong></td>
              <td><strong>{{ fmt(totales(tabla).interes) }}</strong></td>
              <td><strong>{{ fmt(totales(tabla).totalAdeudado) }}</strong></td>
              <td><strong>{{ fmt(totales(tabla).pagoPrestamo) }}</strong></td>
              <td><strong>{{ fmt(totales(tabla).saldoPrestamo) }}</strong></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- ESTADO VACÍO -->
    <div v-if="tablas.length === 0" class="estado-vacio">
      <i class="fas fa-calendar-plus"></i>
      <p>No hay tablas creadas. Presione "+ Nueva Tabla" para comenzar.</p>
    </div>

    <!-- NOTIFICACIÓN -->
    <div v-if="notif.show" class="notif" :class="notif.type">{{ notif.msg }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const socios = ref([])
const tablas = ref([])
const showModal = ref(false)
const modalForm = ref({ mes: '', anio: '' })

const meses = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE']
const anios = Array.from({ length: 11 }, (_, i) => String(new Date().getFullYear() - 5 + i))

const notif = ref({ show: false, type: 'success', msg: '' })

const mostrarNotif = (msg, type = 'success') => {
  notif.value = { show: true, type, msg }
  setTimeout(() => (notif.value.show = false), 3000)
}

const nuevaFila = () => ({
  socio_id: '',
  socio_nombre: '',
  asistencia: false,
  ahorro: 0, retiro: 0, saldo: 0,
  concedido: 0, interes: 0, totalAdeudado: 0,
  pagoPrestamo: 0, saldoPrestamo: 0,
  editando: true
})

const onSocioFilaChange = (fila) => {
  const s = socios.value.find(x => x.id === fila.socio_id)
  fila.socio_nombre = s ? s.nombre_completo : ''
}

const filasFiltradas = (tabla) => {
  if (!tabla.filtro || !tabla.filtro.trim()) return tabla.filas
  const q = tabla.filtro.trim().toLowerCase()
  return tabla.filas.filter(f => (f.socio_nombre || '').toLowerCase().includes(q))
}

const calcularPorFila = (tabla, fila) => {
  const i = tabla.filas.indexOf(fila)
  if (i !== -1) calcular(tabla, i)
}

const eliminarFilaPorReferencia = (tabla, fila) => {
  const i = tabla.filas.indexOf(fila)
  if (i !== -1) eliminarFila(tabla, i)
}

const calcular = (tabla, i) => {
  const f = tabla.filas[i]
  const saldoAnt = i > 0 ? tabla.filas[i - 1].saldo : 0
  const saldoPresAnt = i > 0 ? tabla.filas[i - 1].saldoPrestamo : 0

  f.saldo = saldoAnt + (Number(f.ahorro) || 0) - (Number(f.retiro) || 0)
  f.totalAdeudado = saldoPresAnt + (Number(f.concedido) || 0) + (Number(f.interes) || 0)
  f.saldoPrestamo = f.totalAdeudado - (Number(f.pagoPrestamo) || 0)

  for (let j = i + 1; j < tabla.filas.length; j++) calcular(tabla, j)
}

const totales = (tabla) =>
  tabla.filas.reduce((acc, f) => ({
    ahorro: acc.ahorro + (Number(f.ahorro) || 0),
    retiro: acc.retiro + (Number(f.retiro) || 0),
    saldo: acc.saldo + (Number(f.saldo) || 0),
    concedido: acc.concedido + (Number(f.concedido) || 0),
    interes: acc.interes + (Number(f.interes) || 0),
    totalAdeudado: acc.totalAdeudado + (Number(f.totalAdeudado) || 0),
    pagoPrestamo: acc.pagoPrestamo + (Number(f.pagoPrestamo) || 0),
    saldoPrestamo: acc.saldoPrestamo + (Number(f.saldoPrestamo) || 0),
  }), { ahorro:0, retiro:0, saldo:0, concedido:0, interes:0, totalAdeudado:0, pagoPrestamo:0, saldoPrestamo:0 })

const agregarFila = (tabla) => {
  tabla.filas.push(nuevaFila())
}

const eliminarFila = (tabla, i) => {
  tabla.filas.splice(i, 1)
  for (let j = i; j < tabla.filas.length; j++) calcular(tabla, j)
}

const crearTabla = () => {
  const key = `${modalForm.value.mes}_${modalForm.value.anio}`
  if (tablas.value.find(t => t.key === key)) {
    mostrarNotif('Ya existe una tabla para ese mes y año', 'error')
    return
  }
  tablas.value.push({
    key,
    mes: modalForm.value.mes,
    anio: modalForm.value.anio,
    filas: [nuevaFila()],
    guardando: false,
    filtro: ''
  })
  showModal.value = false
  modalForm.value = { mes: '', anio: '' }
}

const guardarTabla = async (tabla) => {
  tabla.guardando = true
  try {
    const token = sessionStorage.getItem('accessToken')
    const res = await fetch('/api/rapa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ mes: tabla.mes, anio: tabla.anio, filas: tabla.filas })
    })
    const data = await res.json()
    if (data.success) {
      mostrarNotif(`Tabla ${tabla.mes} ${tabla.anio} guardada correctamente`)
    } else {
      mostrarNotif(data.message || 'Error al guardar', 'error')
    }
  } catch (e) {
    console.error(e)
    mostrarNotif('Error de conexión', 'error')
  } finally {
    tabla.guardando = false
  }
}

const fmt = (n) =>
  new Intl.NumberFormat('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0)

onMounted(async () => {
  try {
    // Cargar socios
    const resSocios = await fetch('/api/socios')
    const dataSocios = await resSocios.json()
    if (dataSocios.success) socios.value = dataSocios.data.sort((a, b) => a.numero_socio - b.numero_socio)

    // Cargar tablas existentes
    const resTablas = await fetch('/api/rapa')
    const dataTablas = await resTablas.json()
    if (dataTablas.success && dataTablas.data.length > 0) {
      for (const t of dataTablas.data) {
        const resFils = await fetch(`/api/rapa/${t.mes}/${t.anio}`)
        const dataFils = await resFils.json()
        tablas.value.push({
          key: `${t.mes}_${t.anio}`,
          mes: t.mes,
          anio: t.anio,
          guardando: false,
          filtro: '',
          filas: dataFils.success ? dataFils.data.map(r => ({
            socio_id: r.socio_id || '',
            socio_nombre: r.socio_nombre || '',
            asistencia: r.asistencia,
            ahorro: Number(r.ahorro), retiro: Number(r.retiro), saldo: Number(r.saldo),
            concedido: Number(r.concedido), interes: Number(r.interes),
            totalAdeudado: Number(r.total_adeudado),
            pagoPrestamo: Number(r.pago_prestamo), saldoPrestamo: Number(r.saldo_prestamo),
            editando: false
          })) : []
        })
      }
    }
  } catch (e) {
    console.error('Error inicializando rapa:', e)
  }
})
</script>

<style scoped>
.rapa-container {
  background: #f5f7fa;
  min-height: 100vh;
  padding: 1.5rem;
  font-family: 'Segoe UI', sans-serif;
}

/* HEADER */
.header-section {
  background: white; border-radius: 16px; padding: 2rem;
  margin-bottom: 1.5rem; box-shadow: 0 8px 20px rgba(33,150,243,0.1);
}
.header-content { display: flex; align-items: center; gap: 1.5rem; }
.header-icon {
  background: linear-gradient(135deg, #1565c0, #2196f3);
  color: white; width: 70px; height: 70px; border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem; box-shadow: 0 4px 16px rgba(33,150,243,0.3);
}
.header-text h1 { margin: 0; color: #1565c0; font-size: 2.2rem; font-weight: 700; }
.subtitle { margin: 0.4rem 0 0; color: #546e7a; font-size: 1rem; }

/* BOTÓN NUEVA TABLA */
.acciones-top { margin-bottom: 1.5rem; }
.btn-nueva-tabla {
  background: linear-gradient(135deg, #1565c0, #2196f3);
  color: white; border: none; padding: 0.85rem 1.8rem;
  border-radius: 10px; font-weight: 700; font-size: 1rem; cursor: pointer;
  box-shadow: 0 4px 14px rgba(33,150,243,0.3); transition: transform 0.2s, box-shadow 0.2s;
}
.btn-nueva-tabla:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(33,150,243,0.4); }

/* MODAL */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
}
.modal {
  background: white; border-radius: 14px; padding: 2rem;
  width: 380px; box-shadow: 0 20px 50px rgba(0,0,0,0.25);
}
.modal h4 { margin: 0 0 1.5rem; color: #1565c0; font-size: 1.3rem; font-weight: 700; text-align: center; }
.form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.2rem; }
.form-group label { font-weight: 600; color: #455a64; font-size: 0.9rem; }
.form-group select {
  padding: 0.8rem 1rem; border: 2px solid #e0e0e0; border-radius: 8px;
  font-size: 1rem; background: white; transition: border-color 0.2s;
}
.form-group select:focus { outline: none; border-color: #2196f3; }
.modal-actions { display: flex; gap: 0.8rem; justify-content: flex-end; margin-top: 1.5rem; }
.btn-accept {
  background: linear-gradient(135deg, #1565c0, #2196f3); color: white;
  border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer;
}
.btn-accept:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-cancel {
  background: #f5f5f5; color: #546e7a; border: none;
  padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer;
}

/* TABLA CARD */
.tabla-card {
  background: white; border-radius: 16px; margin-bottom: 2rem;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08); overflow: hidden;
  border-top: 4px solid #2196f3;
}
.tabla-header {
  padding: 1.2rem 1.5rem; display: flex; justify-content: space-between;
  align-items: center; border-bottom: 2px solid #e3f2fd; flex-wrap: wrap; gap: 1rem;
}
.tabla-header h4 { margin: 0; color: #1565c0; font-weight: 700; }
.tabla-header p { margin: 0.3rem 0 0; color: #546e7a; font-size: 0.95rem; }
.tabla-header-btns { display: flex; gap: 0.8rem; align-items: center; flex-wrap: wrap; }

.search-group {
  position: relative; display: flex; align-items: center;
}
.search-icon {
  position: absolute; left: 0.7rem; color: #90caf9; font-size: 0.85rem; pointer-events: none;
}
.input-buscar {
  padding: 0.6rem 0.8rem 0.6rem 2rem;
  border: 2px solid #e0e0e0; border-radius: 8px;
  font-size: 0.9rem; background: white; color: #2c3e50;
  transition: border-color 0.2s; width: 180px;
}
.input-buscar:focus { outline: none; border-color: #2196f3; box-shadow: 0 0 0 3px rgba(33,150,243,0.1); }

.btn-agregar-fila {
  background: linear-gradient(135deg, #1976d2, #42a5f5); color: white;
  border: none; padding: 0.65rem 1.2rem; border-radius: 8px; font-weight: 600;
  cursor: pointer; font-size: 0.9rem; transition: transform 0.2s;
}
.btn-agregar-fila:hover { transform: translateY(-1px); }

.btn-guardar {
  background: linear-gradient(135deg, #0d47a1, #1565c0); color: white;
  border: none; padding: 0.65rem 1.4rem; border-radius: 8px; font-weight: 700;
  cursor: pointer; font-size: 0.9rem; transition: transform 0.2s;
}
.btn-guardar:hover:not(:disabled) { transform: translateY(-1px); }
.btn-guardar:disabled { opacity: 0.5; cursor: not-allowed; }

/* TABLA */
.tabla-wrapper { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; min-width: 1000px; }

.thead-group th {
  background: linear-gradient(135deg, #1565c0, #2196f3); color: white;
  padding: 0.7rem 0.5rem; text-align: center; font-size: 0.75rem;
  font-weight: 700; border: 1px solid #1565c0; text-transform: uppercase;
}
.thead-cols th {
  background: linear-gradient(135deg, #1976d2, #42a5f5); color: white;
  padding: 0.6rem 0.4rem; text-align: center; font-size: 0.72rem;
  font-weight: 700; border: 1px solid #1565c0; text-transform: uppercase;
}
.th-socio { background: #0d47a1 !important; min-width: 150px; }
.th-asist { background: #0d47a1 !important; }
.th-group.ahorros { background: #1565c0 !important; }
.th-group.prestamos { background: #0d47a1 !important; }
.th-accion { background: #0d47a1 !important; }

.fila-par td { background: #e3f2fd; }
tbody tr:not(.fila-par) td { background: #f8fbff; }
tbody tr:hover td { background: #bbdefb !important; }

td {
  padding: 0.35rem 0.4rem; border: 1px solid #bbdefb;
  text-align: center; font-size: 0.83rem; color: #2c3e50;
}

.td-socio { min-width: 150px; }
.td-socio select {
  width: 100%; padding: 0.3rem 0.4rem; border: 1px solid #90caf9;
  border-radius: 4px; font-size: 0.8rem; background: white;
}

td input[type="number"] {
  width: 78px; padding: 0.28rem 0.35rem;
  border: 1px solid #90caf9; border-radius: 4px;
  text-align: right; font-size: 0.8rem; background: white;
}
td input[type="number"]:focus { outline: none; border-color: #1565c0; }
td input[type="checkbox"] { width: 15px; height: 15px; accent-color: #1565c0; cursor: pointer; }

.td-calc { background: #e8f4fd !important; font-weight: 700; color: #1565c0; min-width: 85px; }

.btn-del-fila {
  background: #ffebee; color: #c62828; border: 1px solid #ffcdd2;
  border-radius: 4px; padding: 0.2rem 0.5rem; cursor: pointer; font-size: 0.8rem;
  transition: background 0.2s;
}
.btn-del-fila:hover { background: #ffcdd2; }

.btn-edit-fila {
  background: #e3f2fd; color: #1565c0; border: 1px solid #90caf9;
  border-radius: 4px; padding: 0.2rem 0.5rem; cursor: pointer; font-size: 0.8rem;
  transition: background 0.2s; margin-right: 3px;
}
.btn-edit-fila:hover { background: #bbdefb; }

.btn-ok-fila {
  background: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7;
  border-radius: 4px; padding: 0.2rem 0.5rem; cursor: pointer; font-size: 0.8rem;
  font-weight: 700; transition: background 0.2s; margin-right: 3px;
}
.btn-ok-fila:hover { background: #c8e6c9; }

.td-acciones { white-space: nowrap; }
.td-texto { display: block; text-align: center; font-size: 0.83rem; color: #2c3e50; }

.fila-editando td { background: #fff8e1 !important; }

tfoot .tfoot-row td {
  background: linear-gradient(135deg, #1565c0, #2196f3) !important;
  color: white; padding: 0.6rem 0.4rem; font-size: 0.83rem; border: 1px solid #1565c0;
}

/* VACÍO */
.estado-vacio {
  text-align: center; padding: 4rem 2rem; background: white;
  border-radius: 16px; box-shadow: 0 6px 20px rgba(0,0,0,0.08);
}
.estado-vacio i { font-size: 4rem; color: #64b5f6; margin-bottom: 1rem; display: block; }
.estado-vacio p { color: #78909c; font-size: 1.1rem; }

/* NOTIF */
.notif {
  position: fixed; bottom: 24px; right: 24px;
  padding: 1rem 1.5rem; border-radius: 10px; font-weight: 600;
  box-shadow: 0 6px 20px rgba(0,0,0,0.15); animation: slideUp 0.3s ease; z-index: 999;
}
.notif.success { background: linear-gradient(135deg, #1565c0, #2196f3); color: white; }
.notif.error { background: #c62828; color: white; }

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@media (max-width: 768px) {
  .rapa-container { padding: 1rem; }
  .tabla-header { flex-direction: column; align-items: flex-start; }
}
</style>
