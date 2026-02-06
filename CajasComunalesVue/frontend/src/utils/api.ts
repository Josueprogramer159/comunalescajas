/**
 * Utilidades para requests autenticados
 */

// API_BASE_URL se construye dinámicamente para trabajar en desarrollo y producción
// En Docker, el frontend siempre usa rutas relativas y nginx actúa como proxy
const API_BASE_URL = '' // Usar rutas relativas - nginx redirige /api/ al backend

/**
 * Obtiene el access token del sessionStorage
 */
export function getAccessToken(): string | null {
  return sessionStorage.getItem('accessToken')
}

/**
 * Realiza un fetch autenticado con JWT
 */
export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const accessToken = getAccessToken()

  if (!accessToken) {
    // Intentar renovar el token
    const refreshed = await refreshAccessToken()
    if (!refreshed) {
      // Redirigir a login
      window.location.href = '/login'
      throw new Error('No access token available')
    }
    return authenticatedFetch(endpoint, options)
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      'Authorization': `Bearer ${accessToken}`
    },
    credentials: 'include'
  })

  // Si el token expiró (401), intentar renovarlo
  if (response.status === 401) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      return authenticatedFetch(endpoint, options)
    } else {
      // Token no pudo renovarse, ir a login
      sessionStorage.removeItem('accessToken')
      sessionStorage.removeItem('authUser')
      window.location.href = '/login'
    }
  }

  return response
}

/**
 * Intenta renovar el access token usando el refresh token (en cookie)
 */
export async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })

    if (response.ok) {
      const data = await response.json()
      if (data.accessToken) {
        sessionStorage.setItem('accessToken', data.accessToken)
        return true
      }
    }

    return false
  } catch (error) {
    console.error('Error refreshing token:', error)
    return false
  }
}

/**
 * Verifica si el usuario está autenticado
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken() && !!sessionStorage.getItem('authUser')
}

/**
 * Obtiene la información del usuario autenticado
 */
export function getAuthUser(): any {
  const userStr = sessionStorage.getItem('authUser')
  return userStr ? JSON.parse(userStr) : null
}

/**
 * Limpia la sesión del usuario
 */
export function clearSession(): void {
  sessionStorage.removeItem('accessToken')
  sessionStorage.removeItem('authUser')
}
