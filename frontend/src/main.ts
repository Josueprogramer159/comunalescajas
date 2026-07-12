import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import { isAuthenticated, getAccessToken } from './utils/api'

// Importar vistas
import Home from './views/Home.vue'
import Login from './views/Login.vue'
import Dashboard from './views/Dashboard.vue'
import Directiva from './views/Directiva.vue'
import CajaGeneral from './views/CajaGeneral.vue'
import CajaChica from './views/CajaChica.vue'
import Prestamos from './views/Prestamos.vue'
import registrosUsuarios from './views/Registrarse.vue'

// Importar vistas
import ListadosSocios from './views/ListadosSocios.vue'
import CuerpoDirectivo from './views/CuerpoDirectivo.vue'
import RegistroAportes from './views/RegistroAportes.vue'
import Libretas from './views/registroPrestamos.vue'
import CuerpoNormativo from './views/CuerpoNormativo.vue'

import BalanceGeneral from './views/BalanceGeneral.vue'
import TotalEnCirculacion from './views/TotalEnCirculacion.vue'
import MovimientoIndividual from './views/MovimientoIndividual.vue'
import TestMovimiento from './views/TestMovimiento.vue'
import RegistroContable from './views/RegistroDeIntereses.vue'
import SimuladorCreditos from './views/SimuladorCreditos.vue'
import ArchivosSimulador from './views/ArchivosSimulador.vue'
import Backups from './views/Backups.vue'
import Rapa from './views/Rapa.vue'
import Intereses from './views/Intereses.vue'

// Crear router
const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/registros', name: 'registrosUsuarios', component: registrosUsuarios },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
    children: [
      // Gestión de Socios
      { path: '', name: 'DashboardHome', component: ListadosSocios },
      { path: 'listados-socios', name: 'ListadosSocios', component: ListadosSocios },
      { path: 'registro-aportes', name: 'RegistroAportes', component: RegistroAportes },
      { path: 'libretas', name: 'Libretas', component: Libretas },
      { path: 'cuerpo-directivo', name: 'CuerpoDirectivo', component: CuerpoDirectivo },
      { path: 'cuerpo-normativo', name: 'CuerpoNormativo', component: CuerpoNormativo },

      // Cálculos y Resultados
      { path: 'balance-general', name: 'BalanceGeneral', component: BalanceGeneral },
      { path: 'total-en-circulacion', name: 'TotalEnCirculacion', component: TotalEnCirculacion },
      { path: 'movimiento-individual', name: 'MovimientoIndividual', component: MovimientoIndividual },
      { path: 'test-movimiento', name: 'TestMovimiento', component: TestMovimiento },

      // Movimiento Financiero
      { path: 'registro-contable', name: 'RegistroContable', component: RegistroContable },
      { path: 'caja-chica', name: 'CajaChica', component: CajaChica },
      { path: 'simulador-creditos', name: 'SimuladorCreditos', component: SimuladorCreditos },
      { path: 'archivos-simulador', name: 'ArchivosSimulador', component: ArchivosSimulador },

      // Backups
      { path: 'backups', name: 'Backups', component: Backups },

      // Rapa
      { path: 'rapa', name: 'Rapa', component: Rapa },

      // Intereses
      { path: 'intereses', name: 'Intereses', component: Intereses },

      // Legacy routes (redirect to new ones)
      { path: 'directiva', redirect: '/dashboard/cuerpo-directivo' },
      { path: 'caja-general', redirect: '/dashboard/registro-contable' },
      { path: 'prestamos', redirect: '/dashboard/calculos-intereses' }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de autenticación con JWT
router.beforeEach((to, from, next) => {
  const authenticated = isAuthenticated()

  if (to.meta.requiresAuth && !authenticated) {
    // Redirigir a login si no tiene token
    next('/login')
  } else if (to.path === '/login' && authenticated) {
    // Si ya está autenticado y va a login, redirigir a dashboard
    next('/dashboard')
  } else {
    next()
  }
})

const app = createApp(App)
app.use(router)
app.mount('#app')
