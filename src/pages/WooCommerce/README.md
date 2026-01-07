# 🛒 Módulo WooCommerce - Frontend

## 📋 Resumen

Implementación completa del frontend para administrar productos de WooCommerce desde la aplicación Medisur. Este módulo se integra perfectamente con el backend existente y mantiene 100% de retrocompatibilidad.

## ✨ Características Implementadas

### 📦 Gestión de Productos
- ✅ Lista de productos con filtros y paginación
- ✅ Creación de nuevos productos desde artículos de Zsoftware
- ✅ Edición de productos existentes
- ✅ Publicación/despublicación en WooCommerce
- ✅ Eliminación de configuraciones
- ✅ Sincronización masiva de stock

### 🎨 Formulario Completo
- ✅ Búsqueda de artículos de Zsoftware
- ✅ Configuración de nombres optimizados para web
- ✅ Gestión de precios (regular, venta, descuentos automáticos)
- ✅ Administración de múltiples imágenes
- ✅ Descripciones (corta y larga)
- ✅ Categorías y etiquetas de WooCommerce
- ✅ Optimización SEO (meta título, descripción, keywords)
- ✅ Productos destacados
- ✅ Configuración de sincronización automática
- ✅ Notas internas

### 📊 Dashboard
- ✅ Estadísticas generales
- ✅ Productos totales, publicados, borradores
- ✅ Productos destacados
- ✅ Estado de sincronización automática

## 🏗️ Estructura de Archivos

```
src/
├── services/
│   └── woocommerceService.ts          # Servicio API completo
│
├── pages/
│   └── WooCommerce/
│       ├── ProductosWeb.tsx           # Lista de productos
│       ├── ProductoWebForm.tsx        # Formulario (crear/editar)
│       └── EstadisticasWeb.tsx        # Dashboard de estadísticas
│
├── routes/
│   └── index.ts                        # Rutas actualizadas
│
└── components/
    └── Sidebar.tsx                     # Menú lateral actualizado
```

## 🚀 Rutas Implementadas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/app/woocommerce/productos` | ProductosWeb | Lista principal de productos |
| `/app/woocommerce/nuevo` | ProductoWebForm | Crear nuevo producto |
| `/app/woocommerce/editar/:codigoArticulo` | ProductoWebForm | Editar producto existente |
| `/app/woocommerce/estadisticas` | EstadisticasWeb | Dashboard de estadísticas |

## 📡 Servicio de API

El archivo `woocommerceService.ts` proporciona todos los métodos necesarios:

### Productos
- `listarProductos(params)` - Lista con filtros
- `obtenerProducto(codigo)` - Obtener uno específico
- `guardarProducto(data)` - Crear/actualizar sin publicar
- `actualizarProductoPublicado(codigo, data)` - Actualizar publicado
- `eliminarProducto(codigo)` - Eliminar configuración

### Publicación
- `publicarProducto(codigo)` - Publicar en WooCommerce
- `despublicarProducto(codigo, eliminar)` - Despublicar/eliminar

### Sincronización
- `sincronizarStock(codigo)` - Stock individual
- `sincronizarPrecio(codigo)` - Precio individual
- `sincronizarTodo(params)` - Sincronización masiva

### Auxiliares
- `obtenerCategorias()` - Categorías de WooCommerce
- `crearCategoria(data)` - Nueva categoría
- `obtenerEtiquetas()` - Etiquetas de WooCommerce
- `crearEtiqueta(data)` - Nueva etiqueta
- `buscarArticulosDisponibles(params)` - Buscar en Zsoftware
- `obtenerEstadisticas()` - Dashboard

## 💻 Uso

### Crear un Nuevo Producto

1. Navega a "WooCommerce > Productos Web"
2. Haz clic en "Nuevo Producto"
3. Busca el artículo de Zsoftware por código o nombre
4. Configura:
   - Nombre web optimizado
   - Precios (se calcula descuento automáticamente)
   - Imágenes (mínimo 1 requerida)
   - Descripción corta (requerida)
   - Descripción larga (opcional)
   - Categorías y etiquetas
   - SEO (meta título, descripción, keywords)
   - Opciones avanzadas (destacado, sincronización)
5. Haz clic en "Guardar Borrador" o "Guardar y Publicar"

### Editar un Producto

1. En la lista de productos, haz clic en el ícono de editar
2. Modifica los campos deseados
3. Haz clic en "Actualizar"

### Publicar un Producto

**Requisitos:**
- ✅ Nombre web
- ✅ Precio mayor a 0
- ✅ Al menos una imagen
- ✅ Descripción corta

**Formas de publicar:**
1. Desde el formulario: "Guardar y Publicar"
2. Desde la lista: Ícono de publicar (✓)

### Sincronizar Stock

**Individual:**
- Desde la lista de productos, haz clic en el producto
- (Funcionalidad de sincronización individual se puede agregar)

**Masiva:**
- En la lista de productos, haz clic en "Sincronizar Todo"
- Se sincronizarán todos los productos con sincronización automática habilitada

## 🎨 Componentes Principales

### ProductosWeb.tsx

Lista principal con:
- Tabla responsive
- Filtros (búsqueda, estado, destacado)
- Paginación
- Acciones rápidas (editar, publicar, despublicar, eliminar)
- Vista de imagen miniatura
- Badges de estado
- Indicador de productos destacados

### ProductoWebForm.tsx

Formulario multi-sección:
1. **Selección de Artículo** (solo al crear)
2. **Información Básica** (nombre, slug, precios)
3. **Imágenes** (múltiples con preview)
4. **Descripciones** (corta y larga)
5. **Categorías y Etiquetas** (selección múltiple)
6. **SEO** (optimización para buscadores)
7. **Configuración Avanzada** (destacado, sincronización, notas)

Características:
- Generación automática de slug
- Cálculo automático de descuentos
- Preview de imágenes
- Validación de formulario
- Límites de caracteres para SEO
- Guardado como borrador o publicación directa

### EstadisticasWeb.tsx

Dashboard con:
- Total de productos configurados
- Productos publicados
- Productos en borrador
- Productos destacados
- Estado de sincronización automática
- Última fecha de sincronización

## 🔧 Configuración Inicial

### 1. Variables de Entorno

Asegúrate de que el archivo `.env` tenga:

```env
VITE_API_URL=http://localhost:4000
```

### 2. Dependencias

Todas las dependencias necesarias ya están instaladas:
- `react-router-dom` - Enrutamiento
- `axios` - Cliente HTTP (a través de clienteAxios)
- `react-hot-toast` - Notificaciones
- `react-icons` - Iconos (fi)
- `@mui/material` - Iconos Material UI

## 🎯 Flujo de Trabajo Recomendado

### Primer Uso

1. Ir a "WooCommerce > Estadísticas" para ver el estado general
2. Crear categorías en WooCommerce si es necesario
3. Crear primer producto desde "Nuevo Producto"
4. Buscar artículo de Zsoftware
5. Configurar completamente el producto
6. Guardar como borrador para revisar
7. Publicar cuando esté listo

### Trabajo Diario

1. Revisar productos publicados
2. Sincronizar stock con "Sincronizar Todo"
3. Crear nuevos productos según necesidad
4. Actualizar precios/descripciones según estrategia de marketing
5. Marcar productos como destacados para promociones

## ⚠️ Validaciones

El formulario valida:
- ✅ Artículo de Zsoftware seleccionado
- ✅ Nombre web no vacío
- ✅ Precio mayor a 0
- ✅ Al menos una imagen
- ✅ Descripción corta no vacía
- ✅ URLs de imágenes válidas
- ✅ Límites de caracteres para SEO

## 🔄 Sincronización Automática

### Stock
- Se ejecuta cada 6 horas (backend)
- Solo productos con `sincronizacionAutomatica.stock = true`
- Actualiza desde Zsoftware a WooCommerce

### Precios
- Opcional (desactivado por defecto)
- Solo productos con `sincronizacionAutomatica.precios = true`
- Actualiza desde Zsoftware a WooCommerce

## 🎨 Estilos

Utiliza las clases de Tailwind CSS existentes en el proyecto:
- `bg-primary` - Color primario
- `bg-success` - Color de éxito (verde)
- `bg-warning` - Color de advertencia (amarillo)
- `bg-danger` - Color de peligro (rojo)
- `bg-meta-3` - Color meta 3
- `text-bodydark` - Texto secundario
- `dark:*` - Variantes para modo oscuro

## 📱 Responsive

Todos los componentes son completamente responsive:
- Móvil: Vista de lista simplificada
- Tablet: Vista de tabla con scroll horizontal
- Desktop: Vista completa con todas las columnas

## 🐛 Manejo de Errores

- Toast notifications para todos los errores
- Mensajes de error descriptivos del backend
- Loading states durante operaciones
- Confirmaciones antes de acciones destructivas

## 🔒 Seguridad

- Todas las peticiones incluyen token JWT automáticamente
- Validación en cliente antes de enviar al servidor
- Confirmaciones para acciones críticas (publicar, eliminar)

## 🚀 Próximas Mejoras Sugeridas

### Funcionalidades
- [ ] Vista previa del producto como se verá en la tienda
- [ ] Carga de imágenes desde el ordenador (integrar con Cloudinary)
- [ ] Editor WYSIWYG para descripciones (react-quill)
- [ ] Productos variables (tallas, colores, etc.)
- [ ] Importación/exportación CSV
- [ ] Historial de cambios por producto
- [ ] Programar publicaciones futuras

### UX
- [ ] Drag & drop para reordenar imágenes
- [ ] Búsqueda en tiempo real de artículos
- [ ] Autocompletado de categorías
- [ ] Sugerencias de SEO
- [ ] Preview de meta tags en Google
- [ ] Modo de edición rápida (inline)

### Optimización
- [ ] Caché de categorías/etiquetas
- [ ] Lazy loading de imágenes
- [ ] Paginación infinita
- [ ] Optimistic updates

## 📞 Soporte

Para problemas o preguntas:
1. Verificar que el backend esté corriendo
2. Verificar variables de entorno
3. Revisar la consola del navegador para errores
4. Verificar que tengas token de autenticación válido

## ✅ Retrocompatibilidad

Este módulo:
- ✅ No modifica ninguna funcionalidad existente
- ✅ Usa el mismo sistema de autenticación
- ✅ Usa el mismo clienteAxios configurado
- ✅ Sigue los mismos patrones de diseño
- ✅ Usa los mismos componentes base (Breadcrumb, Sidebar)
- ✅ Mantiene el mismo sistema de rutas

---

**Versión**: 1.0.0  
**Fecha**: Octubre 2025  
**Estado**: ✅ Listo para producción
