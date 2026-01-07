// Tipos para WooCommerce

export interface ProductoWeb {
  codigoArticulo: string;
  nombreWeb: string;
  slug: string;
  precioRegular: number;
  precioWeb: number;
  descuento: number; // Porcentaje de descuento calculado
  imagenes: Imagen[];
  descripcionCorta: string;
  descripcionLarga: string;
  categorias: number[];
  etiquetas: number[];
  destacado: boolean;
  gestionarStock: boolean;
  sincronizacionAutomatica: {
    stock: boolean;
    precios: boolean;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    focusKeyword: string;
  };
  estado: 'borrador' | 'publicado' | 'privado' | 'pendiente';
  publicado: boolean;
  woocommerceId?: number;
  notas: string;
  articuloInfo?: ArticuloZsoftware;
  ultimaSincronizacion?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Imagen {
  url: string;
  alt: string;
}

export interface ArticuloZsoftware {
  codigo: string;
  nombre: string;
  stock: number;
  precioVenta: number;
  costo?: number;
  categoria?: string;
  precioWeb?: number;
  margen?: number;
}

export interface Categoria {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent?: number;
  count?: number;
}

export interface Etiqueta {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
}

export interface Estadisticas {
  totalProductos: number;
  publicados: number;
  borradores: number;
  destacados: number;
  sincronizacionAutomatica: {
    stock: number;
    precios: number;
  };
  ultimaSincronizacion?: string;
}

export interface Paginacion {
  totalProductos: number;
  totalPaginas: number;
  paginaActual: number;
  limite: number;
  tieneSiguiente: boolean;
  tieneAnterior: boolean;
}

export interface FiltrosProductos {
  page: number;
  limit: number;
  publicado?: boolean | '';
  search?: string;
  destacado?: boolean | '';
  ordenarPor?: string;
  orden?: 'asc' | 'desc';
}

export interface RespuestaAPI<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface RespuestaListaProductos {
  productos: ProductoWeb[];
  paginacion: Paginacion;
}

export interface RespuestaProducto {
  producto: ProductoWeb;
  articuloInfo?: ArticuloZsoftware;
}

export interface RespuestaCategorias {
  categorias: Categoria[];
  total: number;
}

export interface RespuestaEtiquetas {
  etiquetas: Etiqueta[];
  total: number;
}

export interface RespuestaEstadisticas {
  estadisticas: Estadisticas;
}

export interface RespuestaSincronizacion {
  totalSincronizados: number;
  exitosos: number;
  fallidos: number;
  detalles: Array<{
    codigoArticulo: string;
    exito: boolean;
    mensaje?: string;
  }>;
}

export interface RespuestaArticulos {
  articulos: ArticuloZsoftware[];
  total: number;
  paginacion: Paginacion;
}
