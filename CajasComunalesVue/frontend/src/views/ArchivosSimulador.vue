
<template>
  <div class="archivos-container">

    <!-- HEADER -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-icon"><i class="fas fa-folder-open"></i></div>
        <div class="header-text">
          <h1>Archivos de Simulador de Créditos</h1>
          <p class="subtitle">Historial de simulaciones guardadas</p>
        </div>
      </div>
      <div class="header-badge">
        <i class="fas fa-file-alt"></i>
        <span>{{ simulaciones.length }} simulacion(es)</span>
      </div>
    </div>

    <!-- FILTROS -->
    <div class="filtros-section">
      <div class="filtro-grupo">
        <label><i class="fas fa-search"></i> Nombre</label>
        <input v-model="filtroNombre" type="text" placeholder="Buscar por nombre del socio..." />
      </div>
      <div class="filtro-grupo">
        <label><i class="fas fa-calendar-alt"></i> Mes</label>
        <select v-model="filtroMes">
          <option value="">Todos los meses</option>
          <option v-for="mes in mesesDisponibles" :key="mes" :value="mes">{{ mes }}</option>
        </select>
      </div>
      <div class="filtro-grupo">
        <label><i class="fas fa-calendar"></i> Fecha exacta</label>
        <input v-model="filtroFecha" type="date" />
      </div>
      <button v-if="filtroNombre || filtroMes || filtroFecha" class="btn-limpiar" @click="limpiarFiltros">
        <i class="fas fa-times"></i> Limpiar
      </button>
      <span class="contador">{{ simulacionesFiltradas.length }} resultado(s)</span>
    </div>

    <!-- LISTA VACÍA TOTAL -->
    <div v-if="simulaciones.length === 0" class="empty-state">
      <i class="fas fa-folder-open"></i>
      <h3>No hay simulaciones guardadas</h3>
      <p>Ve al Simulador de Créditos y presiona "Guardar" para almacenar una simulación aquí.</p>
    </div>

    <!-- LISTA DE SIMULACIONES -->
    <div v-else class="lista-simulaciones">
      <!-- Sin resultados de filtro -->
      <div v-if="simulacionesFiltradas.length === 0" class="empty-state">
        <i class="fas fa-search"></i>
        <h3>Sin resultados</h3>
        <p>No se encontraron simulaciones con los filtros aplicados.</p>
      </div>

      <div v-for="sim in simulacionesFiltradas" :key="sim.id" class="simulacion-card">
        <div class="sim-header">
          <div class="sim-titulo">
            <i class="fas fa-file-invoice-dollar"></i>
            <span>{{ sim.socio || 'Sin nombre' }}</span>
            <span class="sim-numero">{{ sim.numeroCredito }}</span>
          </div>
          <div class="sim-acciones">
            <button class="btn-pdf" @click="descargarPDF(sim)">
              <i class="fas fa-file-pdf"></i> Descargar PDF
            </button>
            <button class="btn-eliminar" @click="eliminarSimulacion(sim.id)">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <div class="sim-datos">
          <div class="sim-dato">
            <span class="dato-label"><i class="fas fa-calendar"></i> Guardado</span>
            <span class="dato-valor">{{ sim.fechaGuardado }}</span>
          </div>
          <div class="sim-dato">
            <span class="dato-label"><i class="fas fa-money-bill-wave"></i> Monto</span>
            <span class="dato-valor">${{ format(sim.monto) }}</span>
          </div>
          <div class="sim-dato">
            <span class="dato-label"><i class="fas fa-clock"></i> Plazo</span>
            <span class="dato-valor">{{ sim.plazo }} mes(es)</span>
          </div>
          <div class="sim-dato">
            <span class="dato-label"><i class="fas fa-percentage"></i> Tasa</span>
            <span class="dato-valor">{{ sim.tasa }}%</span>
          </div>
          <div class="sim-dato">
            <span class="dato-label"><i class="fas fa-coins"></i> Total</span>
            <span class="dato-valor total-color">${{ format(sim.totalDesembolsado) }}</span>
          </div>
          <div class="sim-dato">
            <span class="dato-label"><i class="fas fa-calendar-check"></i> Cuota</span>
            <span class="dato-valor">${{ format(sim.cuotaMensual) }}</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const simulaciones = ref([])
const filtroNombre = ref('')
const filtroMes    = ref('')
const filtroFecha  = ref('')

const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const mesesDisponibles = computed(() => {
  const set = new Set()
  simulaciones.value.forEach(s => {
    if (s.fecha) {
      const m = new Date(s.fecha).getMonth()
      if (!isNaN(m)) set.add(meses[m])
    }
  })
  return [...set].sort((a, b) => meses.indexOf(a) - meses.indexOf(b))
})

const simulacionesFiltradas = computed(() => {
  return simulaciones.value.filter(s => {
    if (filtroNombre.value) {
      const nombre = (s.socio || '').toLowerCase()
      if (!nombre.includes(filtroNombre.value.toLowerCase())) return false
    }
    if (filtroMes.value && s.fecha) {
      const mesSim = meses[new Date(s.fecha).getMonth()]
      if (mesSim !== filtroMes.value) return false
    }
    if (filtroFecha.value && s.fecha) {
      if (s.fecha !== filtroFecha.value) return false
    }
    return true
  })
})

const limpiarFiltros = () => {
  filtroNombre.value = ''
  filtroMes.value    = ''
  filtroFecha.value  = ''
}

const cargarSimulaciones = () => {
  simulaciones.value = JSON.parse(localStorage.getItem('simulacionesGuardadas') || '[]')
}

const eliminarSimulacion = (id) => {
  simulaciones.value = simulaciones.value.filter(s => s.id !== id)
  localStorage.setItem('simulacionesGuardadas', JSON.stringify(simulaciones.value))
}

const format = (n) => {
  if (n === '-' || n === undefined || n === null) return '-'
  return new Intl.NumberFormat('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

const descargarPDF = async (sim) => {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  let y = 10
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20

  const centered = (text, yPos, size = 12) => {
    doc.setFontSize(size); doc.setFont('helvetica', 'normal')
    doc.text(text, (pageWidth - doc.getTextWidth(text)) / 2, yPos)
  }
  const txt = (text, x, yPos, size = 10) => {
    doc.setFontSize(size); doc.setFont('helvetica', 'normal'); doc.text(text, x, yPos)
  }
  const bld = (text, x, yPos, size = 10) => {
    doc.setFontSize(size); doc.setFont('helvetica', 'bold'); doc.text(text, x, yPos)
  }

  try {
    const resp = await fetch('/logoPdf.png')
    const blob = await resp.blob()
    await new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = e => {
        doc.addImage(e.target.result, 'PNG', (pageWidth - 185) / 2, 8, 185, 50)
        resolve()
      }
      reader.readAsDataURL(blob)
    })
  } catch { /* sin logo */ }

  doc.setTextColor(0, 0, 0)
  y = 65

  bld('INFORMACIÓN DEL CRÉDITO', margin, y, 12); y += 10
  txt(`Número de Crédito: ${sim.numeroCredito}`, margin, y); y += 8
  txt(`Fecha: ${sim.fecha}`, margin, y); y += 8
  txt(`Monto del Crédito: $${format(sim.monto)}`, margin, y); y += 8
  txt(`Plazo: ${sim.plazo} meses`, margin, y); y += 8
  txt(`Tasa de Interés: ${sim.tasa}% por mes`, margin, y); y += 8
  if (sim.encajeActivo) { txt(`Encaje 5%: $${format(sim.encaje)}`, margin, y); y += 8 }
  y += 10

  bld('INFORMACIÓN DEL SOCIO BENEFICIARIO', margin, y, 12); y += 10
  txt(`Nombre Completo: ${sim.socio}`, margin, y); y += 8
  txt(`Cédula de Identidad: ${sim.cedula}`, margin, y); y += 8
  y += 5

  bld('INFORMACIÓN DE APROBACIÓN', margin, y, 12); y += 10
  txt(`Aprobado Por: ${sim.aprobadoPor || 'No especificado'}`, margin, y); y += 8
  y += 10

  bld('RESUMEN DEL CRÉDITO', margin, y, 12); y += 10
  txt(`Total Capital a Pagar: $${format(sim.monto)}`, margin, y); y += 8
  txt(`Total Interés a Pagar: $${format(sim.totalInteres)}`, margin, y); y += 8
  if (sim.encajeActivo) { txt(`(-) Devolución de Encaje: -$${format(sim.encaje)}`, margin, y); y += 8 }
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y); y += 5
  bld(`TOTAL DESEMBOLSADO: $${format(sim.totalDesembolsado)}`, margin, y, 12); y += 10
  bld(`Cuota Mensual: $${format(sim.cuotaMensual)}`, margin, y, 12); y += 20

  if (y > 250) { doc.addPage(); y = 20 }

  bld('TABLA DE AMORTIZACIÓN', margin, y, 12); y += 10

  const headers = ['N°', 'Vencimiento', 'Saldo', 'Capital', 'Interés', 'Cuota', 'Saldo Final']
  const colW    = [15, 35, 25, 25, 25, 25, 25]

  const drawHeaders = () => {
    doc.setFontSize(8); doc.setFont('helvetica', 'bold')
    let x = margin
    headers.forEach((h, i) => { doc.text(h, x, y); x += colW[i] })
    y += 5; doc.line(margin, y, pageWidth - margin, y); y += 5
  }

  drawHeaders()
  doc.setFont('helvetica', 'normal')

  for (const fila of sim.tabla) {
    if (y > 270) { doc.addPage(); y = 20; drawHeaders() }
    let x = margin
    ;[String(fila.cuota), fila.mes, format(fila.saldoInicial), format(fila.capital),
      format(fila.interes), format(fila.cuotaValor),
      fila.saldoFinal === '-' ? '-' : format(fila.saldoFinal)
    ].forEach((d, i) => { doc.text(d, x, y); x += colW[i] })
    y += 6
  }

  const pages = doc.internal.pages.length - 1
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    const fy = doc.internal.pageSize.getHeight() - 20
    doc.setFontSize(8); doc.setFont('helvetica', 'italic')
    centered('Documento generado automáticamente por el Sistema de Cajas Comunales', fy, 8)
    centered(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`, fy + 5, 8)
    centered(`Página ${i} de ${pages}`, fy + 10, 8)
  }

  doc.save(`simulacion-${(sim.socio || 'credito').replace(/\s+/g, '-')}-${sim.fecha}.pdf`)
}

onMounted(cargarSimulaciones)
</script>

<style scoped>
.archivos-container {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* HEADER */
.header-section {
  background: white; border-radius: 12px; padding: 2rem; margin-bottom: 1.5rem;
  box-shadow: 0 8px 20px rgba(30,136,229,0.08);
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;
}
.header-content { display: flex; align-items: center; gap: 1.5rem; }
.header-icon {
  background: linear-gradient(135deg, #1e88e5, #42a5f5); color: white;
  width: 60px; height: 60px; border-radius: 16px;
  display: flex; align-items: center; justify-content: center; font-size: 1.5rem;
  box-shadow: 0 4px 12px rgba(30,136,229,0.3);
}
.header-text h1 { margin: 0; color: #1565c0; font-size: 2rem; font-weight: 700; }
.subtitle { margin: 0.5rem 0 0; color: #546e7a; font-size: 1rem; }
.header-badge {
  display: flex; align-items: center; gap: 0.5rem;
  background: linear-gradient(135deg, #1e88e5, #42a5f5);
  color: white; padding: 0.5rem 1.2rem; border-radius: 20px; font-weight: 600;
}

/* FILTROS */
.filtros-section {
  background: white; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  display: flex; align-items: flex-end; flex-wrap: wrap; gap: 1rem;
}
.filtro-grupo { display: flex; flex-direction: column; gap: 0.4rem; flex: 1; min-width: 180px; }
.filtro-grupo label {
  font-weight: 600; color: #455a64; font-size: 0.85rem;
  display: flex; align-items: center; gap: 0.4rem;
}
.filtro-grupo label i { color: #1e88e5; }
.filtro-grupo input,
.filtro-grupo select {
  padding: 0.7rem; border: 2px solid #e3f2fd; border-radius: 8px;
  font-size: 0.95rem; background: white; transition: border-color 0.2s;
}
.filtro-grupo input:focus,
.filtro-grupo select:focus { outline: none; border-color: #1e88e5; }

.btn-limpiar {
  background: #546e7a; color: white; border: none; padding: 0.7rem 1.2rem;
  border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.9rem;
  display: flex; align-items: center; gap: 0.4rem; transition: background 0.2s;
  align-self: flex-end;
}
.btn-limpiar:hover { background: #37474f; }

.contador {
  align-self: flex-end; color: #1e88e5; font-weight: 700;
  background: #e3f2fd; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem;
}

/* EMPTY STATE */
.empty-state {
  text-align: center; padding: 4rem 2rem; background: white; border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.06); color: #95a5a6; margin-top: 1rem;
}
.empty-state i { font-size: 3.5rem; margin-bottom: 1rem; display: block; color: #bdc3c7; }
.empty-state h3 { color: #546e7a; margin: 0 0 0.5rem; font-size: 1.3rem; }
.empty-state p { color: #95a5a6; font-size: 0.95rem; }

/* LISTA */
.lista-simulaciones { display: flex; flex-direction: column; gap: 1.2rem; }

.simulacion-card {
  background: white; border-radius: 14px; box-shadow: 0 6px 20px rgba(0,0,0,0.07);
  overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; border-left: 4px solid #1e88e5;
}
.simulacion-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.1); }

.sim-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 1.5rem; background: linear-gradient(135deg, #e3f2fd, #f8f9fa);
  border-bottom: 1px solid #e3f2fd;
}
.sim-titulo { display: flex; align-items: center; gap: 0.75rem; font-size: 1.05rem; font-weight: 700; color: #1565c0; }
.sim-titulo i { color: #1e88e5; }
.sim-numero {
  background: #1e88e5; color: white; padding: 0.2rem 0.7rem;
  border-radius: 12px; font-size: 0.8rem; font-weight: 600;
}
.sim-acciones { display: flex; gap: 0.5rem; }

.btn-pdf {
  background: linear-gradient(135deg, #c62828, #ef5350); color: white;
  border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; gap: 0.4rem;
  font-size: 0.9rem; transition: all 0.2s;
}
.btn-pdf:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(198,40,40,0.35); }

.btn-eliminar {
  background: #b0bec5; color: white; border: none; padding: 0.5rem 0.8rem;
  border-radius: 8px; cursor: pointer; font-size: 0.9rem; transition: all 0.2s;
}
.btn-eliminar:hover { background: #e53935; transform: translateY(-1px); }

.sim-datos {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}
.sim-dato {
  display: flex; flex-direction: column; gap: 0.2rem;
  padding: 0.9rem 1.2rem; border-right: 1px solid #f1f3f4;
}
.sim-dato:last-child { border-right: none; }
.dato-label { color: #95a5a6; font-size: 0.78rem; font-weight: 600; text-transform: uppercase; display: flex; align-items: center; gap: 0.3rem; }
.dato-label i { color: #1e88e5; }
.dato-valor { color: #2c3e50; font-size: 1rem; font-weight: 700; }
.total-color { color: #1565c0 !important; }

@media (max-width: 768px) {
  .archivos-container { padding: 1rem; }
  .filtros-section { flex-direction: column; }
  .filtro-grupo { min-width: 100%; }
  .sim-datos { grid-template-columns: repeat(2, 1fr); }
}
</style>
