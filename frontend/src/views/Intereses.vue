<template>
  <div class="intereses-container">
    <!-- HEADER -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-icon"><i class="fas fa-percentage"></i></div>
        <div class="header-text">
          <h1>Intereses</h1>
          <p class="subtitle">Registro de intereses cobrados por socio por año</p>
        </div>
      </div>
    </div>

    <!-- ACCIONES -->
    <div class="acciones-top">
      <button class="btn-nueva-tabla" @click="showModal = true">+ Nueva Tabla</button>
    </div>

    <!-- MODAL NUEVO AÑO -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <h4>Nueva Tabla de Intereses</h4>
        <div class="form-group">
          <label>Año *</label>
          <select v-model="modalAnio">
            <option value="">Seleccionar año</option>
            <option v-for="a in aniosDisponibles" :key="a" :value="a">{{ a }}</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showModal = false">Cancelar</button>
          <button class="btn-accept" @click="crearTabla" :disabled="!modalAnio">Agregar</button>
        </div>
      </div>
    </div>

    <!-- TABLAS POR AÑO -->
    <div v-for="tabla in tablas" :key="tabla.anio" class="tabla-card">
      <div class="tabla-header">
        <div class="tabla-titulo">
          <h4>{{ tabla.anio }} —</h4>
          <select v-model="tabla.estado" class="select-estado" :class="tabla.estado === 'COBRADO' ? 'estado-cobrado' : 'estado-pendiente'">
            <option value="COBRADO">COBRADO</option>
            <option value="PENDIENTE">PENDIENTE</option>
          </select>
        </div>
        <div class="tabla-header-btns">
          <button class="btn-agregar-fila" @click="agregarFila(tabla)">+ Agregar socio</button>
          <button class="btn-guardar" @click="guardarTabla(tabla)" :disabled="tabla.guardando">
            {{ tabla.guardando ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>

      <div class="tabla-wrapper">
        <table>
          <thead>
            <tr>
              <th class="th-num">N°</th>
              <th class="th-socio">SOCIO</th>
              <th v-for="m in meses" :key="m">{{ m.label }}</th>
              <th class="th-total">TOTAL INTERÉS POR SOCIO</th>
              <th class="th-acc">ACC.</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(fila, i) in tabla.filas" :key="i" :class="{ 'fila-par': i % 2 === 0, 'fila-editando': fila.editando }">
              <td class="td-num">{{ i + 1 }}</td>
              <td class="td-socio">
                <select v-if="fila.editando" v-model="fila.socio_id" @change="onSocioChange(fila)">
                  <option value="">-- Socio --</option>
                  <option v-for="s in socios" :key="s.id" :value="s.id">{{ s.nombre_completo }}</option>
                </select>
                <span v-else class="td-texto">{{ fila.socio_nombre || '—' }}</span>
              </td>
              <td v-for="m in meses" :key="m.key">
                <input v-if="fila.editando" type="number" v-model.number="fila[m.key]" @input="calcularTotal(fila)" min="0" />
                <span v-else class="td-monto">{{ fila[m.key] > 0 ? fmt(fila[m.key]) : '' }}</span>
              </td>
              <td class="td-total-socio">{{ fmt(fila.total_anio) }}</td>
              <td class="td-acc">
                <button v-if="!fila.editando" class="btn-edit" @click="fila.editando = true" title="Editar">✏️</button>
                <button v-else class="btn-ok" @click="fila.editando = false" title="Confirmar">✔</button>
                <button class="btn-del" @click="eliminarFila(tabla, i)" title="Eliminar">✕</button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="tfoot-row">
              <td colspan="2"><strong>TOTAL INTERÉS</strong></td>
              <td v-for="m in meses" :key="m.key"><strong>{{ totalesMes(tabla, m.key) > 0 ? fmt(totalesMes(tabla, m.key)) : '' }}</strong></td>
              <td><strong>{{ fmt(totalGeneral(tabla)) }}</strong></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- VACÍO -->
    <div v-if="tablas.length === 0" class="estado-vacio">
      <i class="fas fa-calendar-plus"></i>
      <p>No hay tablas. Presione "+ Nueva Tabla" para comenzar.</p>
    </div>

    <!-- NOTIF -->
    <div v-if="notif.show" class="notif" :class="notif.type">{{ notif.msg }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const socios = ref([])
const tablas = ref([])
const showModal = ref(false)
const modalAnio = ref('')
const notif = ref({ show: false, type: 'success', msg: '' })

const meses = [
  { key: 'enero', label: 'ENERO' }, { key: 'febrero', label: 'FEBRERO' },
  { key: 'marzo', label: 'MARZO' }, { key: 'abril', label: 'ABRIL' },
  { key: 'mayo', label: 'MAYO' }, { key: 'junio', label: 'JUNIO' },
  { key: 'julio', label: 'JULIO' }, { key: 'agosto', label: 'AGOSTO' },
  { key: 'septiembre', label: 'SEPTIEMBRE' }, { key: 'octubre', label: 'OCTUBRE' },
  { key: 'noviembre', label: 'NOVIEMBRE' }, { key: 'diciembre', label: 'DICIEMBRE' }
]

const aniosDisponibles = Array.from({ length: 11 }, (_, i) => String(new Date().getFullYear() - 5 + i))

const mostrarNotif = (msg, type = 'success') => {
  notif.value = { show: true, type, msg }
  setTimeout(() => (notif.value.show = false), 3000)
}

const nuevaFila = () => ({
  socio_id: '', socio_nombre: '',
  enero: 0, febrero: 0, marzo: 0, abril: 0, mayo: 0, junio: 0,
  julio: 0, agosto: 0, septiembre: 0, octubre: 0, noviembre: 0, diciembre: 0,
  total_anio: 0, editando: true
})

const onSocioChange = (fila) => {
  const s = socios.value.find(x => x.id === fila.socio_id)
  fila.socio_nombre = s ? s.nombre_completo : ''
}

const calcularTotal = (fila) => {
  fila.total_anio = meses.reduce((s, m) => s + (Number(fila[m.key]) || 0), 0)
}

const totalesMes = (tabla, mes) =>
  tabla.filas.reduce((s, f) => s + (Number(f[mes]) || 0), 0)

const totalGeneral = (tabla) =>
  tabla.filas.reduce((s, f) => s + (Number(f.total_anio) || 0), 0)

const agregarFila = (tabla) => tabla.filas.push(nuevaFila())

const eliminarFila = (tabla, i) => tabla.filas.splice(i, 1)

const crearTabla = () => {
  if (tablas.value.find(t => t.anio === modalAnio.value)) {
    mostrarNotif('Ya existe una tabla para ese año', 'error')
    return
  }
  tablas.value.push({ anio: modalAnio.value, filas: [], guardando: false, estado: 'COBRADO' })
  showModal.value = false
  modalAnio.value = ''
}

const guardarTabla = async (tabla) => {
  tabla.guardando = true
  try {
    const token = sessionStorage.getItem('accessToken')
    const res = await fetch('/api/intereses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ anio: tabla.anio, estado: tabla.estado || 'COBRADO', filas: tabla.filas })
    })
    const data = await res.json()
    if (data.success) mostrarNotif(`Tabla ${tabla.anio} guardada correctamente`)
    else mostrarNotif(data.message || 'Error al guardar', 'error')
  } catch (e) {
    mostrarNotif('Error de conexión', 'error')
  } finally {
    tabla.guardando = false
  }
}

const fmt = (n) =>
  new Intl.NumberFormat('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0)

onMounted(async () => {
  try {
    const [resSocios, resAnios] = await Promise.all([
      fetch('/api/socios'),
      fetch('/api/intereses')
    ])
    const dataSocios = await resSocios.json()
    const dataAnios = await resAnios.json()
    if (dataSocios.success) socios.value = dataSocios.data.sort((a, b) => a.numero_socio - b.numero_socio)
    if (dataAnios.success) {
      for (const a of dataAnios.data) {
        const resFils = await fetch(`/api/intereses/${a.anio}`)
        const dataFils = await resFils.json()
        tablas.value.push({
          anio: a.anio, guardando: false,
          estado: dataFils.success && dataFils.data.length > 0 ? (dataFils.data[0].estado || 'COBRADO') : 'COBRADO',
          filas: dataFils.success ? dataFils.data.map(r => ({
            socio_id: r.socio_id || '',
            socio_nombre: r.socio_nombre || '',
            enero: Number(r.enero), febrero: Number(r.febrero), marzo: Number(r.marzo),
            abril: Number(r.abril), mayo: Number(r.mayo), junio: Number(r.junio),
            julio: Number(r.julio), agosto: Number(r.agosto), septiembre: Number(r.septiembre),
            octubre: Number(r.octubre), noviembre: Number(r.noviembre), diciembre: Number(r.diciembre),
            total_anio: Number(r.total_anio), editando: false
          })) : []
        })
      }
    }
  } catch (e) { console.error('Error inicializando intereses:', e) }
})
</script>

<style scoped>
.intereses-container {
  background: #f5f7fa; min-height: 100vh; padding: 1.5rem;
  font-family: 'Segoe UI', sans-serif;
}

.header-section {
  background: white; border-radius: 16px; padding: 2rem;
  margin-bottom: 1.5rem; box-shadow: 0 8px 20px rgba(33,150,243,0.1);
}
.header-content { display: flex; align-items: center; gap: 1.5rem; }
.header-icon {
  background: linear-gradient(135deg, #1565c0, #2196f3); color: white;
  width: 70px; height: 70px; border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem; box-shadow: 0 4px 16px rgba(33,150,243,0.3);
}
.header-text h1 { margin: 0; color: #1565c0; font-size: 2.2rem; font-weight: 700; }
.subtitle { margin: 0.4rem 0 0; color: #546e7a; font-size: 1rem; }

.acciones-top { margin-bottom: 1.5rem; }
.btn-nueva-tabla {
  background: linear-gradient(135deg, #1565c0, #2196f3); color: white;
  border: none; padding: 0.85rem 1.8rem; border-radius: 10px;
  font-weight: 700; font-size: 1rem; cursor: pointer;
  box-shadow: 0 4px 14px rgba(33,150,243,0.3); transition: transform 0.2s;
}
.btn-nueva-tabla:hover { transform: translateY(-2px); }

/* MODAL */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
}
.modal {
  background: white; border-radius: 14px; padding: 2rem;
  width: 360px; box-shadow: 0 20px 50px rgba(0,0,0,0.25);
}
.modal h4 { margin: 0 0 1.5rem; color: #1565c0; font-size: 1.3rem; font-weight: 700; text-align: center; }
.form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.2rem; }
.form-group label { font-weight: 600; color: #455a64; font-size: 0.9rem; }
.form-group select {
  padding: 0.8rem 1rem; border: 2px solid #e0e0e0; border-radius: 8px;
  font-size: 1rem; background: white;
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
  box-shadow: 0 6px 20px rgba(0,0,0,0.08); overflow: hidden; border-top: 4px solid #2196f3;
}
.tabla-header {
  padding: 1.2rem 1.5rem; display: flex; justify-content: space-between;
  align-items: center; border-bottom: 2px solid #e3f2fd; flex-wrap: wrap; gap: 1rem;
}
.tabla-titulo { display: flex; align-items: center; gap: 0.6rem; }
.tabla-header h4 { margin: 0; color: #1565c0; font-weight: 700; font-size: 1.1rem; }

.select-estado {
  border: none; border-radius: 20px; padding: 0.3rem 0.9rem;
  font-weight: 700; font-size: 0.9rem; cursor: pointer;
  outline: none; transition: all 0.2s;
}
.estado-cobrado { background: #e8f5e9; color: #2e7d32; }
.estado-pendiente { background: #fff3e0; color: #e65100; }
.tabla-header-btns { display: flex; gap: 0.8rem; align-items: center; }
.btn-agregar-fila {
  background: linear-gradient(135deg, #1976d2, #42a5f5); color: white;
  border: none; padding: 0.6rem 1.2rem; border-radius: 8px;
  font-weight: 600; cursor: pointer; font-size: 0.9rem; transition: transform 0.2s;
}
.btn-agregar-fila:hover { transform: translateY(-1px); }
.btn-guardar {
  background: linear-gradient(135deg, #0d47a1, #1565c0); color: white;
  border: none; padding: 0.6rem 1.4rem; border-radius: 8px;
  font-weight: 700; cursor: pointer; font-size: 0.9rem; transition: transform 0.2s;
}
.btn-guardar:hover:not(:disabled) { transform: translateY(-1px); }
.btn-guardar:disabled { opacity: 0.5; cursor: not-allowed; }

/* TABLA */
.tabla-wrapper { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; min-width: 1400px; }
thead th {
  background: linear-gradient(135deg, #1565c0, #2196f3); color: white;
  padding: 0.65rem 0.4rem; text-align: center; font-size: 0.72rem;
  font-weight: 700; border: 1px solid #1565c0; text-transform: uppercase; white-space: nowrap;
}
.th-num { background: #0d47a1 !important; width: 40px; }
.th-socio { background: #0d47a1 !important; min-width: 180px; }
.th-total { background: #0d47a1 !important; min-width: 120px; }
.th-acc { background: #0d47a1 !important; width: 70px; }

.fila-par td { background: #e3f2fd; }
tbody tr:not(.fila-par) td { background: #f8fbff; }
tbody tr:hover td { background: #bbdefb !important; }
.fila-editando td { background: #fff8e1 !important; }

td {
  padding: 0.3rem 0.35rem; border: 1px solid #bbdefb;
  text-align: center; font-size: 0.82rem; color: #2c3e50;
}
.td-num { color: #1565c0; font-weight: 700; }
.td-socio select {
  width: 100%; padding: 0.28rem; border: 1px solid #90caf9;
  border-radius: 4px; font-size: 0.78rem; background: white;
}
td input[type="number"] {
  width: 72px; padding: 0.25rem 0.3rem;
  border: 1px solid #90caf9; border-radius: 4px;
  text-align: right; font-size: 0.78rem; background: white;
}
td input[type="number"]:focus { outline: none; border-color: #1565c0; }
.td-texto { display: block; text-align: left; padding-left: 4px; font-size: 0.82rem; }
.td-monto { display: block; text-align: right; font-size: 0.82rem; }
.td-total-socio { background: #e8f4fd !important; font-weight: 700; color: #1565c0; }
.td-acc { white-space: nowrap; }

tfoot .tfoot-row td {
  background: linear-gradient(135deg, #1565c0, #2196f3) !important;
  color: white; padding: 0.6rem 0.4rem; font-size: 0.82rem; border: 1px solid #1565c0;
}

.btn-edit {
  background: #e3f2fd; color: #1565c0; border: 1px solid #90caf9;
  border-radius: 4px; padding: 0.18rem 0.45rem; cursor: pointer; font-size: 0.78rem; margin-right: 2px;
}
.btn-ok {
  background: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7;
  border-radius: 4px; padding: 0.18rem 0.45rem; cursor: pointer; font-weight: 700; font-size: 0.78rem; margin-right: 2px;
}
.btn-del {
  background: #ffebee; color: #c62828; border: 1px solid #ffcdd2;
  border-radius: 4px; padding: 0.18rem 0.45rem; cursor: pointer; font-size: 0.78rem;
}

.estado-vacio {
  text-align: center; padding: 4rem 2rem; background: white;
  border-radius: 16px; box-shadow: 0 6px 20px rgba(0,0,0,0.08);
}
.estado-vacio i { font-size: 4rem; color: #64b5f6; margin-bottom: 1rem; display: block; }
.estado-vacio p { color: #78909c; font-size: 1.1rem; }

.notif {
  position: fixed; bottom: 24px; right: 24px; padding: 1rem 1.5rem;
  border-radius: 10px; font-weight: 600; box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  animation: slideUp 0.3s ease; z-index: 999;
}
.notif.success { background: linear-gradient(135deg, #1565c0, #2196f3); color: white; }
.notif.error { background: #c62828; color: white; }

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
