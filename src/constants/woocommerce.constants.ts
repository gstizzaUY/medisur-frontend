/**
 * Constantes para el módulo WooCommerce
 */

// Estados de publicación
export const ESTADOS_PUBLICACION = {
  BORRADOR: 'borrador',
  PUBLICADO: 'publicado',
  PRIVADO: 'privado',
  PENDIENTE: 'pendiente',
} as const;

// Labels de estados
export const ESTADOS_LABELS = {
  borrador: 'Borrador',
  publicado: 'Publicado',
  privado: 'Privado',
  pendiente: 'Pendiente',
} as const;

// Colores de badges por estado
export const ESTADOS_COLORS = {
  borrador: 'warning',
  publicado: 'success',
  privado: 'danger',
  pendiente: 'meta-3',
} as const;

// Límites de caracteres para SEO
export const SEO_LIMITS = {
  META_TITLE: 60,
  META_DESCRIPTION: 160,
  SLUG: 100,
} as const;

// Tamaños de imagen recomendados
export const IMAGE_SIZES = {
  MIN_WIDTH: 800,
  MIN_HEIGHT: 800,
  RECOMMENDED_WIDTH: 1200,
  RECOMMENDED_HEIGHT: 1200,
  MAX_SIZE_MB: 5,
} as const;

// Opciones de paginación
export const PAGINATION_OPTIONS = [10, 20, 50, 100] as const;

// Intervalo de sincronización automática (en horas)
export const SYNC_INTERVAL_HOURS = 6;

// Mensajes de validación
export const VALIDATION_MESSAGES = {
  CODIGO_REQUIRED: 'Selecciona un artículo de Zsoftware',
  NOMBRE_REQUIRED: 'El nombre web es requerido',
  PRECIO_INVALID: 'El precio debe ser mayor a 0',
  IMAGEN_REQUIRED: 'Agrega al menos una imagen',
  DESCRIPCION_CORTA_REQUIRED: 'La descripción corta es requerida',
  URL_INVALID: 'URL de imagen inválida',
} as const;

// Configuración por defecto de producto nuevo
export const DEFAULT_PRODUCTO = {
  codigoArticulo: '',
  nombreWeb: '',
  slug: '',
  precioRegular: 0,
  precioWeb: 0,
  descuento: 0, // Cambiado de porcentajeDescuento
  imagenes: [],
  descripcionCorta: '',
  descripcionLarga: '',
  categorias: [],
  etiquetas: [],
  destacado: false,
  gestionarStock: true,
  sincronizacionAutomatica: {
    stock: true,
    precios: false,
  },
  seo: {
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    focusKeyword: '',
  },
  estado: 'borrador' as const,
  notas: '',
};

// Filtros por defecto
export const DEFAULT_FILTROS = {
  page: 1,
  limit: 20,
  publicado: '',
  search: '',
  destacado: '',
  ordenarPor: 'createdAt',
  orden: 'desc' as const,
};

// Textos de ayuda
export const HELP_TEXTS = {
  NOMBRE_WEB: 'Este nombre aparecerá en la tienda. Puede ser diferente al nombre en Zsoftware.',
  SLUG: 'Se genera automáticamente del nombre. Es la URL del producto.',
  PRECIO_REGULAR: 'Precio normal del producto (antes de descuento)',
  PRECIO_WEB: 'Precio final de venta en la tienda online',
  IMAGEN: 'La primera imagen será la principal. Recomendado: 800x800px mínimo.',
  DESCRIPCION_CORTA: 'Resumen breve que aparece en listados de productos (1-2 líneas)',
  DESCRIPCION_LARGA: 'Descripción completa con detalles, características y beneficios',
  CATEGORIAS: 'Mantén presionado Ctrl (Cmd en Mac) para seleccionar múltiples',
  META_TITLE: 'Título que aparecerá en resultados de búsqueda de Google',
  META_DESCRIPTION: 'Descripción que aparecerá en resultados de búsqueda',
  FOCUS_KEYWORD: 'Palabra clave principal para SEO',
  DESTACADO: 'El producto aparecerá en la sección de productos destacados',
  SYNC_STOCK: 'El stock se actualizará automáticamente cada 6 horas desde Zsoftware',
  SYNC_PRECIOS: 'Los precios se actualizarán automáticamente desde Zsoftware',
  NOTAS: 'Notas privadas sobre este producto (no se muestran en la tienda)',
} as const;

// Tooltips
export const TOOLTIPS = {
  PUBLICAR: 'Publicar producto en WooCommerce',
  DESPUBLICAR: 'Despublicar producto de WooCommerce',
  EDITAR: 'Editar configuración del producto',
  ELIMINAR: 'Eliminar configuración (solo borradores)',
  SINCRONIZAR: 'Sincronizar stock y precios',
  VER: 'Ver detalles del producto',
} as const;

// URLs de documentación
export const DOCS_URLS = {
  WOOCOMMERCE: 'https://woocommerce.com/documentation/',
  SEO_GUIDE: 'https://yoast.com/complete-guide-seo/',
  IMAGE_OPTIMIZATION: 'https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/image-optimization',
} as const;
