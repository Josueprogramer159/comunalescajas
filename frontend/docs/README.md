# Documentación del Sistema de Cajas Comunales - Frontend

## 📁 Estructura de Documentación

### Componentes Documentados:

1. **`ListadosSocios.vue`** - [Documentación completa](ListadosSocios.md)
   - Gestión completa de socios
   - CRUD con validaciones
   - Exportación PDF/CSV
   - Sistema de filtrado y búsqueda
   - Estadísticas en tiempo real

### Archivos de Documentación:

- `ListadosSocios.md` - Documentación detallada del componente Listado de Socios
- `README.md` - Este archivo, guía de documentación

## 🎨 Guía de Estilos

### Paleta de Colores Azul Aplicada:
- **Azul Primario:** `#1976d2` - Encabezados, botones principales
- **Azul Secundario:** `#2196f3` - Gradientes, efectos hover
- **Azul Claro:** `#e3f2fd` - Fondos, bordes suaves
- **Azul Oscuro:** `#1565c0` - Bordes, contornos
- **Azul Muy Oscuro:** `#0d47a1` - Textos destacados

### Convenciones de Código:
- **Variables Reactivas:** Prefijo descriptivo (`socios`, `searchQuery`, etc.)
- **Funciones:** Nombres descriptivos en camelCase
- **Comentarios:** Documentación JSDoc para funciones públicas
- **CSS:** Clases descriptivas con BEM-like naming

## 📚 Estructura de Componentes Vue

### Template:
```vue
<template>
  <!-- 1. Cabecera con título y acciones -->
  <!-- 2. Filtros y búsqueda -->
  <!-- 3. Estadísticas -->
  <!-- 4. Tabla principal -->
  <!-- 5. Paginación -->
  <!-- 6. Modales -->
  <!-- 7. Notificaciones -->
</template>
```

### Script (Composition API):
```javascript
<script setup>
// 1. Imports y configuración
// 2. Variables reactivas
// 3. Propiedades computadas
// 4. Funciones de utilidad
// 5. Funciones de API
// 6. Control de ciclo de vida
</script>
```

### Estilos:
```css
<style scoped>
/* 1. Layout general */
/* 2. Componentes específicos */
/* 3. Estados y variantes */
/* 4. Responsive design */
</style>
```

## 🔧 Configuración de Desarrollo

### Prerrequisitos:
- Node.js 16+
- Vue 3.3+
- Vite 4+
- TypeScript (opcional)

### Scripts Disponibles:
```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build para producción
npm run preview    # Preview de build
npm run lint       # Linting del código
```

## 📱 Responsive Design

### Breakpoints Implementados:
- **Desktop (> 1024px):** Layout completo
- **Tablet (768px-1024px):** 1 columna en formularios
- **Móvil (< 768px):** Flexbox column, tablas con scroll

### Adaptaciones Comunes:
- Formularios: 2 columnas → 1 columna
- Cabeceras: Flex row → Flex column
- Tablas: Scroll horizontal en móviles
- Botones: Full width en móviles

## 🔌 Integración con Backend

### API Endpoints:
- **Base URL:** `/api/`
- **Autenticación:** JWT tokens
- **Formato de Datos:** JSON
- **Manejo de Errores:** Respuestas estandarizadas

### Estructura de Respuesta:
```json
{
  "success": true,
  "data": [],
  "message": "Operación exitosa",
  "timestamp": "2026-07-15T10:30:00Z"
}
```

## 🧪 Testing

### Tipos de Pruebas:
1. **Unitarias:** Funciones individuales
2. **Integración:** Componentes Vue
3. **E2E:** Flujos completos de usuario
4. **Performance:** Tiempos de carga y respuesta

### Herramientas Recomendadas:
- **Vitest:** Unit testing
- **Vue Test Utils:** Testing de componentes
- **Playwright:** E2E testing
- **Lighthouse:** Performance testing

## 📈 Mejores Prácticas

### Performance:
- Lazy loading de componentes
- Memoización de propiedades computadas
- Paginación para grandes datasets
- Optimización de imágenes

### Accesibilidad:
- Etiquetas ARIA apropiadas
- Contraste de colores adecuado
- Navegación por teclado
- Textos alternativos

### Seguridad:
- Validación de entrada del usuario
- Sanitización de datos
- Protección XSS
- Headers de seguridad HTTP

## 🔄 Mantenimiento

### Checklist de Actualizaciones:
- [ ] Actualizar dependencias
- [ ] Ejecutar tests
- [ ] Verificar compatibilidad
- [ ] Documentar cambios
- [ ] Actualizar README

### Versionado:
- **SemVer:** MAJOR.MINOR.PATCH
- **Changelog:** Documentación de cambios
- **Git tags:** Releases etiquetados

## 🆘 Soporte

### Recursos Adicionales:
- [Documentación Vue 3](https://vuejs.org/guide/)
- [Vite Documentation](https://vitejs.dev/guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Problemas Comunes:
1. **CORS issues:** Configurar proxy en vite.config.ts
2. **Hot reload no funciona:** Verificar configuración de Vite
3. **Import errors:** Verificar paths y alias
4. **Build errors:** Limpiar cache y reinstalar dependencias

---

**Última Actualización:** 2026-07-15  
**Versión de Documentación:** 1.0.0  
**Mantenedor:** Equipo de Desarrollo Cajas Comunales