<template>
  <div class="simulador-container">
    <div class="titulo">SIMULADOR DE CREDITO</div>

    <!-- INFORMACIÓN DEL SOCIO -->
    <div class="socio-info">
      <h3>Información del Socio</h3>
      <div class="socio-grid">
        <div class="form-group">
          <label for="socio-select">Nombre del Socio:</label>
          <select id="socio-select" v-model="selectedSocioId">
            <option value="">Seleccionar socio...</option>
            <option v-for="socio in socios" :key="socio.id" :value="socio.id">
              {{ socio.nombre_completo }} (N° {{ socio.numero_socio }})
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="cedula">Cédula de Identidad:</label>
          <input id="cedula" type="text" v-model="cedulaIdentidad" />
        </div>

        <div class="form-group">
          <label for="aprobado-por">Aprobado Por:</label>
          <select id="aprobado-por" v-model="aprobadoPor">
            <option value="">Seleccionar socio...</option>
            <option v-for="socio in socios" :key="socio.id" :value="socio.nombre_completo">
              {{ socio.nombre_completo }} (N° {{ socio.numero_socio }})
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- CABECERA -->
    <div class="cabecera">
      <div><strong>N° CRÉDITO:</strong> {{ numeroCredito }}</div>
    </div>

    <!-- DATOS -->
    <div class="grid-datos">
      <div class="datos">
        <div class="form-group">
          <label>Fecha:</label>
          <div class="fecha-display">{{ fecha }}</div>
          <small class="fecha-info">(La fecha se generará automáticamente)</small>
        </div>

        <div class="form-group">
          <label>Monto del Crédito ($):</label>
          <input type="number" v-model.number="credito.monto" @input="calcularAutomatico" />
        </div>

        <div class="form-group">
          <label>Plazo</label>
          <input type="number" v-model.number="credito.plazo" @input="calcularAutomatico" />
        </div>

        <div class="form-group">
          <label>Tasa de Interés (% por cuota):</label>
          <input type="number" v-model.number="credito.tasa" @input="calcularAutomatico" />
        </div>

        <div class="form-group encaje-control">
          <label class="encaje-label">
            <input type="checkbox" v-model="encajeActivo" @change="calcularAutomatico" />
            <span class="checkmark"></span>
            Aplicar Encaje (5%)
          </label>
        </div>

        <div v-if="encajeActivo" class="resultado">
          <strong>ENCAJE 5%:</strong> $ {{ format(encaje) }}
        </div>
      </div>

      <!-- RESUMEN -->
      <div class="resumen">
        <h4>RESUMEN DEL CREDITO</h4>
        <p>Total Capital a Pagar: <span class="amount">${{ format(credito.monto) }}</span></p>
        <p>Total Interés a Pagar: <span class="amount">${{ format(totalInteres) }}</span></p>
        <p v-if="encajeActivo">(-) Devolución de Encaje: <span class="amount-negative">-${{ format(encaje) }}</span></p>
        <div class="divider"></div>
        <p class="total">TOTAL DESEMBOLSADO: ${{ format(totalDesembolsado) }}</p>
        <p class="cuota-mensual">Cuota Mensual: ${{ format(cuotaDiaria) }}</p>
      </div>
    </div>

    <!-- BOTONES -->
    <div class="botones-container">
      <button class="btn-download" @click="generarPDF" :disabled="!tabla.length" v-if="tabla.length">
        Descargar PDF
      </button>
    </div>

    <!-- TABLA -->
    <div v-if="tabla.length" class="table-container">
      <table>
        <thead>
          <tr>
            <th>N°</th>
            <th>VENCIMIENTO</th>
            <th>SALDO</th>
            <th>CAPITAL</th>
            <th>INTERÉS</th>
            <th>CUOTA</th>
            <th>SALDO FINAL</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="fila in tabla" :key="fila.cuota">
            <td>{{ fila.cuota }}</td>
            <td>{{ fila.mes }}</td>
            <td>${{ format(fila.saldoInicial) }}</td>
            <td>${{ format(fila.capital) }}</td>
            <td>${{ format(fila.interes) }}</td>
            <td class="cuota-total">${{ format(fila.cuotaValor) }}</td>
            <td>{{ format(fila.saldoFinal) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL DE VALIDACIÓN -->
    <div v-if="mostrarModalError" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-icon">!</div>
          <h2>Campos Requeridos</h2>
        </div>
        <div class="modal-body">
          <p class="modal-description">Por favor, completa los siguientes campos antes de descargar el PDF:</p>
          <ul class="campos-list">
            <li v-for="campo in camposIncompletos" :key="campo" class="campo-item">
              <span class="campo-check">-</span>
              {{ campo }}
            </li>
          </ul>
        </div>
        <div class="modal-footer">
          <button class="btn-cerrar" @click="cerrarModal">Entendido</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'

/* ===== DATOS BASE ===== */
const numeroCredito = 'CR-2026-001'
const fecha = computed(() => new Date().toISOString().split('T')[0])

const credito = reactive({
  monto: 0,
  plazo: 0,
  tasa: 0
})

/* ===== SOCIOS ===== */
const selectedSocioId = ref('')
const cedulaIdentidad = ref('')
const aprobadoPor = ref('')
const socios = ref([])

// Control de encaje
const encajeActivo = ref(true)

// Control del modal
const mostrarModalError = ref(false)
const camposIncompletos = ref([])

const tabla = ref([])

// Watcher para actualizar cédula automáticamente cuando se selecciona un socio
watch(selectedSocioId, (newSocioId) => {
  const socioSeleccionado = socios.value.find(s => s.id === newSocioId)
  if (socioSeleccionado) {
    cedulaIdentidad.value = socioSeleccionado.cedula
  } else {
    cedulaIdentidad.value = ''
  }
})

// Función para obtener la cédula del aprobador
const getCedulaAprobador = () => {
  const aprobador = socios.value.find(s => s.nombre_completo === aprobadoPor.value)
  return aprobador ? aprobador.cedula : ''
}

/* ===== CÁLCULOS EXACTOS ===== */
const encaje = computed(() => encajeActivo.value ? credito.monto * 0.05 : 0)

const interesPorCuota = computed(() =>
  credito.monto * (credito.tasa / 100)
)

const capitalPorCuota = computed(() =>
  credito.plazo > 0 ? credito.monto / credito.plazo : 0
)

const totalInteres = computed(() =>
  interesPorCuota.value * credito.plazo
)

const totalDesembolsado = computed(() =>
  credito.monto + totalInteres.value - encaje.value
)

const cuotaDiaria = computed(() =>
  capitalPorCuota.value + interesPorCuota.value
)

const canCalculate = computed(() =>
  credito.monto > 0 && credito.plazo > 0 && credito.tasa >= 0
)

/* ===== API ===== */
onMounted(async () => {
  try {
    const res = await fetch('/api/socios')
    const json = await res.json()
    if (json.success) socios.value = json.data
  } catch (e) {
    console.error(e)
  }
})

/* ===== CÁLCULO ===== */
const calcularAutomatico = () => {
  canCalculate.value ? calcular() : (tabla.value = [])
}

// Función para convertir número de mes a nombre
const numeroMesANombre = (numeroMes) => {
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  return meses[numeroMes - 1] || 'Desconocido'
}

// Función para cerrar el modal
const cerrarModal = () => {
  mostrarModalError.value = false
  camposIncompletos.value = []
}

const calcular = () => {
  tabla.value = []

  let saldo = credito.monto
  let fechaBase = new Date(fecha.value)
  
  // Obtener el día actual del sistema
  const hoy = new Date()
  const diaFijo = hoy.getDate()
  const diaFormato = String(diaFijo).padStart(2, '0')
  const mesInicial = fechaBase.getMonth() // 0 para enero, 11 para diciembre
  const anioInicial = fechaBase.getFullYear()

  for (let i = 1; i <= credito.plazo; i++) {
    // Calcular el mes y año basado en el número de cuota
    let mesActual = mesInicial + (i - 1)
    let anioActual = anioInicial
    
    // Ajustar si el mes supera diciembre
    while (mesActual > 11) {
      mesActual -= 12
      anioActual += 1
    }
    
    const numeroMes = mesActual + 1 // Convertir a 1-12
    const nombreMes = numeroMesANombre(numeroMes)
    const mesYAnio = `${nombreMes}/${diaFormato}/${anioActual}`

    tabla.value.push({
      cuota: i,
      fecha: `${diaFormato}/${numeroMes}/${anioActual}`,
      mes: mesYAnio,
      saldoInicial: saldo,
      capital: capitalPorCuota.value,
      interes: interesPorCuota.value,
      cuotaValor: cuotaDiaria.value,
      saldoFinal: i === credito.plazo ? '-' : saldo - capitalPorCuota.value
    })

    saldo -= capitalPorCuota.value
  }
}

/* ===== FORMAT ===== */
const format = (n) => {
  if (n === '-') return '-'
  return new Intl.NumberFormat('es-EC', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(n)
}

/* ===== PDF GENERATION ===== */
const generarPDF = async () => {
  // Validar campos requeridos
  const campos = []
  
  if (!selectedSocioId.value) {
    campos.push('Nombre del Socio')
  }
  
  if (!aprobadoPor.value) {
    campos.push('Aprobado Por')
  }
  
  if (!credito.tasa || credito.tasa <= 0) {
    campos.push('Tasa de Interés')
  }
  
  if (campos.length > 0) {
    camposIncompletos.value = campos
    mostrarModalError.value = true
    return
  }

  // Importar jsPDF dinámicamente
  const { jsPDF } = await import('jspdf')

  const doc = new jsPDF()

  // Configuración inicial
  let yPosition = 10
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20

  // Función helper para agregar texto centrado
  const addCenteredText = (text, y, size = 12, bold = false) => {
    doc.setFontSize(size)
    if (bold) doc.setFont('helvetica', 'bold')
    else doc.setFont('helvetica', 'normal')
    const textWidth = doc.getTextWidth(text)
    const x = (pageWidth - textWidth) / 2
    doc.text(text, x, y)
  }

  // Función helper para agregar texto normal
  const addText = (text, x, y, size = 10) => {
    doc.setFontSize(size)
    doc.setFont('helvetica', 'normal')
    doc.text(text, x, y)
  }

  // Función helper para agregar texto en negrita
  const addBoldText = (text, x, y, size = 10) => {
    doc.setFontSize(size)
    doc.setFont('helvetica', 'bold')
    doc.text(text, x, y)
  }

  // ===== AGREGAR LOGO EN LA PARTE SUPERIOR =====
  // Agregar logo
  try {
    const logoUrl = '/logoPdf.png' // Ruta del logo en public/
    const response = await fetch(logoUrl)
    const blob = await response.blob()
    const reader = new FileReader()
    
    await new Promise((resolve) => {
      reader.onload = (e) => {
        const imgData = e.target.result
        // Agregar logo al PDF (centrado en la parte superior)
        const logoWidth = 185 // Ancho del logo en mm
        const logoHeight = 50 // Alto del logo en mm
        const logoX = (pageWidth - logoWidth) / 2 // Centrado horizontalmente
        doc.addImage(imgData, 'PNG', logoX, 8, logoWidth, logoHeight)
        resolve()
      }
      reader.readAsDataURL(blob)
    })
  } catch (e) {
    console.log('Logo no encontrado:', e)
  }

  doc.setTextColor(0, 0, 0) // Texto negro
  yPosition = 65

  // Información del Crédito
  addBoldText('INFORMACIÓN DEL CRÉDITO', margin, yPosition, 12)
  yPosition += 10

  addText(`Número de Crédito: ${numeroCredito}`, margin, yPosition)
  yPosition += 8
  addText(`Fecha: ${fecha.value}`, margin, yPosition)
  yPosition += 8
  addText(`Monto del Crédito: $${format(credito.monto)}`, margin, yPosition)
  yPosition += 8
  addText(`Plazo: ${credito.plazo} meses`, margin, yPosition)
  yPosition += 8
  addText(`Tasa de Interés: ${credito.tasa}% por mes`, margin, yPosition)
  yPosition += 8
  if (encajeActivo.value) {
    addText(`Encaje 5%: $${format(encaje.value)}`, margin, yPosition)
    yPosition += 8
  }
  yPosition += 15

  // Información del Socio Beneficiario
  addBoldText('INFORMACIÓN DEL SOCIO BENEFICIARIO', margin, yPosition, 12)
  yPosition += 10

  const socioSeleccionado = socios.value.find(s => s.id === selectedSocioId.value)
  if (socioSeleccionado) {
    addText(`Nombre Completo: ${socioSeleccionado.nombre_completo}`, margin, yPosition)
    yPosition += 8
    addText(`Número de Socio: ${socioSeleccionado.numero_socio}`, margin, yPosition)
    yPosition += 8
    addText(`Cédula de Identidad: ${socioSeleccionado.cedula}`, margin, yPosition)
    yPosition += 8
    if (socioSeleccionado.telefono) {
      addText(`Teléfono: ${socioSeleccionado.telefono}`, margin, yPosition)
      yPosition += 8
    }
    if (socioSeleccionado.mes_ingreso) {
      addText(`Mes de Ingreso: ${socioSeleccionado.mes_ingreso}`, margin, yPosition)
      yPosition += 8
    }
    addText(`Ahorro Mensual: $${format(socioSeleccionado.ahorro_mensual)}`, margin, yPosition)
    yPosition += 8
  }

  // Información de Aprobación
  addBoldText('INFORMACIÓN DE APROBACIÓN', margin, yPosition, 12)
  yPosition += 10
  
  addText(`Aprobado Por: ${aprobadoPor.value || 'No especificado'}`, margin, yPosition)
  yPosition += 8
  addText(`Cédula del Aprobador: ${getCedulaAprobador() || 'No especificada'}`, margin, yPosition)
  yPosition += 15

  // Resumen del Crédito
  addBoldText('RESUMEN DEL CRÉDITO', margin, yPosition, 12)
  yPosition += 10

  addText(`Total Capital a Pagar: $${format(credito.monto)}`, margin, yPosition)
  yPosition += 8
  addText(`Total Interés a Pagar: $${format(totalInteres.value)}`, margin, yPosition)
  yPosition += 8
  if (encajeActivo.value) {
    addText(`(-) Devolución de Encaje: -$${format(encaje.value)}`, margin, yPosition)
    yPosition += 8
  }

  // Línea divisoria
  doc.setLineWidth(0.5)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 5

  addBoldText(`TOTAL DESEMBOLSADO: $${format(totalDesembolsado.value)}`, margin, yPosition, 12)
  yPosition += 10
  addBoldText(`Cuota Diaria: $${format(cuotaDiaria.value)}`, margin, yPosition, 12)
  yPosition += 20

  // Verificar si necesitamos una nueva página para la tabla
  if (yPosition > 250) {
    doc.addPage()
    yPosition = 20
  }

  // Tabla de Amortización
  addBoldText('TABLA DE AMORTIZACIÓN', margin, yPosition, 12)
  yPosition += 10

  // Encabezados de tabla
  const tableHeaders = ['N°', 'Vencimiento', 'Saldo', 'Capital', 'Interés', 'Cuota', 'Saldo Final']
  const columnWidths = [15, 35, 25, 25, 25, 25, 25]
  let currentX = margin

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')

  tableHeaders.forEach((header, index) => {
    doc.text(header, currentX, yPosition)
    currentX += columnWidths[index]
  })

  yPosition += 5
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 5

  // Datos de la tabla
  doc.setFont('helvetica', 'normal')

  tabla.value.forEach((fila, index) => {
    // Verificar si necesitamos una nueva página
    if (yPosition > 270) {
      doc.addPage()
      yPosition = 20

      // Repetir encabezados en nueva página
      currentX = margin
      doc.setFont('helvetica', 'bold')
      tableHeaders.forEach((header, headerIndex) => {
        doc.text(header, currentX, yPosition)
        currentX += columnWidths[headerIndex]
      })
      yPosition += 5
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 5
      doc.setFont('helvetica', 'normal')
    }

    currentX = margin
    const rowData = [
      fila.cuota.toString(),
      fila.mes,
      format(fila.saldoInicial),
      format(fila.capital),
      format(fila.interes),
      format(fila.cuotaValor),
      fila.saldoFinal === '-' ? '-' : format(fila.saldoFinal)
    ]

    rowData.forEach((data, dataIndex) => {
      doc.text(data, currentX, yPosition)
      currentX += columnWidths[dataIndex]
    })

    yPosition += 6
  })

  // Pie de página
  const pageCount = doc.internal.pages.length - 1
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    // Agregar información adicional en el pie
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    const footerY = doc.internal.pageSize.getHeight() - 20

    addCenteredText('Documento generado automáticamente por el Sistema de Cajas Comunales Verdecocha', footerY, 8)
    addCenteredText(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`, footerY + 5, 8)
    addCenteredText(`Página ${i} de ${pageCount}`, footerY + 10, 8)
  }

  // Descargar el PDF
  doc.save(`simulador-credito-${numeroCredito}-${new Date().toISOString().split('T')[0]}.pdf`)
}
</script>

<style scoped>
.simulador-container {
  background-color: #f5f7fa;
  padding: 2rem;
  border-radius: 12px;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.titulo {
  background: linear-gradient(135deg, #1e88e5, #42a5f5);
  color: white;
  font-weight: 700;
  text-align: center;
  padding: 1rem;
  font-size: 1.8rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(30, 136, 229, 0.4);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* INFORMACIÓN DEL SOCIO */
.socio-info {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 20px rgba(30, 136, 229, 0.08);
}

.socio-info h3 {
  color: #1e88e5;
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
  font-weight: 600;
  border-bottom: 2px solid #1e88e5;
  padding-bottom: 0.5rem;
}

.socio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
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

.form-group select,
.form-group input {
  padding: 0.75rem;
  border: 1px solid #bbdefb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-group select:focus,
.form-group input:focus {
  outline: none;
  border-color: #1e88e5;
  box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.1);
  transform: translateY(-1px);
}

.form-group select:hover,
.form-group input:hover {
  border-color: #42a5f5;
}

.fecha-display {
  padding: 0.75rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  color: #495057;
  text-align: center;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.075);
}

.fecha-info {
  color: #6c757d;
  font-size: 0.85rem;
  font-style: italic;
  margin-top: 0.25rem;
  text-align: center;
}

.cabecera {
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(30, 136, 229, 0.05);
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.cabecera strong {
  color: #1e88e5;
  font-size: 1.1rem;
}

.grid-datos {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.datos {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(30, 136, 229, 0.08);
}

.datos .form-group {
  margin-bottom: 1.5rem;
}

.datos .form-group:last-child {
  margin-bottom: 0;
}

.datos .resultado {
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  color: #856404;
  border: 1px solid #f6e05e;
}

/* ===== CONTROL DE ENCAJE ===== */
.encaje-control {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
}

.encaje-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 600;
  color: #455a64;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.encaje-label:hover {
  color: #1e88e5;
}

.encaje-label input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 24px;
  height: 24px;
  border: 2px solid #1e88e5;
  border-radius: 6px;
  background-color: white;
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.encaje-label input[type="checkbox"]:checked + .checkmark {
  background-color: #1e88e5;
  border-color: #1e88e5;
}

.encaje-label input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.checkmark:hover {
  border-color: #42a5f5;
  box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.1);
}

.resumen {
  background: white;
  border: 2px solid #1e88e5;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 20px rgba(30, 136, 229, 0.08);
}

.resumen h4 {
  background: linear-gradient(135deg, #1e88e5, #42a5f5);
  color: white;
  padding: 0.75rem;
  text-align: center;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.resumen p {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  font-weight: 500;
}

.resumen .amount {
  font-weight: 700;
  color: #1e88e5;
}

.resumen .amount-negative {
  font-weight: 700;
  color: #e53935;
}

.resumen .divider {
  height: 2px;
  background: linear-gradient(90deg, #1e88e5, #42a5f5, #1e88e5);
  margin: 1rem 0;
  border-radius: 1px;
}

.resumen .total {
  background: linear-gradient(135deg, #1e88e5, #42a5f5);
  color: white;
  font-weight: 700;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-size: 1.1rem;
  margin-bottom: 0.5rem !important;
}

.resumen .cuota-mensual {
  background: linear-gradient(135deg, #1565c0, #1e88e5);
  color: white;
  font-weight: 600;
  padding: 0.75rem;
  border-radius: 8px;
  text-align: center;
  font-size: 1rem;
}

.btn {
  background: linear-gradient(135deg, #1e88e5, #42a5f5);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(30, 136, 229, 0.4);
  margin: 1rem 0;
  width: 100%;
  max-width: 200px;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(30, 136, 229, 0.6);
  background: linear-gradient(135deg, #1565c0, #1e88e5);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-download {
  background: linear-gradient(135deg, #2e7d32, #4caf50);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(46, 125, 50, 0.4);
  width: 100%;
  max-width: 200px;
}

.btn-download:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(46, 125, 50, 0.6);
  background: linear-gradient(135deg, #1b5e20, #2e7d32);
}

.btn-download:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.table-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 20px rgba(30, 136, 229, 0.08);
  overflow-x: auto;
  margin-top: 2rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(30, 136, 229, 0.05);
}

th {
  background: linear-gradient(135deg, #1e88e5, #42a5f5);
  color: white;
  padding: 1rem 0.75rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

td {
  padding: 0.75rem;
  text-align: center;
  border-bottom: 1px solid #e3f2fd;
  color: #455a64;
  font-weight: 500;
}

tbody tr:nth-child(even) {
  background: #f8fafc;
}

tbody tr:hover {
  background: #e3f2fd;
  transform: scale(1.01);
  transition: all 0.2s ease;
}

.cuota-total {
  font-weight: 700;
  color: #1e88e5;
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  padding: 0.5rem;
  border-radius: 6px;
  margin: -0.25rem -0.5rem;
  border: 1px solid #f6e05e;
}

/* Responsive Design */
@media (max-width: 768px) {
  .simulador-container {
    padding: 1rem;
  }

  .titulo {
    font-size: 1.5rem;
    padding: 0.75rem;
  }

  .socio-grid {
    grid-template-columns: 1fr;
  }

  .grid-datos {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .resumen p {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .table-container {
    padding: 1rem;
  }

  table {
    font-size: 0.8rem;
  }

  th,
  td {
    padding: 0.5rem 0.25rem;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .simulador-container {
    padding: 0.75rem;
  }

  .titulo {
    font-size: 1.3rem;
  }

  .socio-info,
  .datos,
  .resumen {
    padding: 1rem;
  }

  .resumen h4 {
    font-size: 1.1rem;
  }

  .table-container {
    padding: 0.75rem;
  }
}

/* ===== MODAL DE VALIDACIÓN ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 450px;
  width: 90%;
  animation: slideUp 0.3s ease;
  overflow: hidden;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  background: linear-gradient(135deg, #ff6b6b, #ff8a80);
  padding: 2rem;
  text-align: center;
  color: white;
}

.modal-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
  animation: bounce 0.5s ease;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.modal-body {
  padding: 2rem;
}

.modal-description {
  color: #455a64;
  font-size: 0.95rem;
  margin: 0 0 1.5rem 0;
  font-weight: 500;
}

.campos-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.campo-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #fff3e0;
  border-left: 4px solid #ff9800;
  border-radius: 6px;
  margin-bottom: 0.75rem;
  color: #e65100;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.campo-check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #ff9800;
  color: white;
  border-radius: 50%;
  font-weight: bold;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.modal-footer {
  padding: 1.5rem 2rem;
  background: #f8f9fa;
  display: flex;
  justify-content: center;
}

.btn-cerrar {
  background: linear-gradient(135deg, #1e88e5, #42a5f5);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(30, 136, 229, 0.3);
}

.btn-cerrar:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(30, 136, 229, 0.4);
  background: linear-gradient(135deg, #1565c0, #1e88e5);
}

.btn-cerrar:active {
  transform: translateY(0);
}
</style>
