export interface Alerta {
  tipo: 'sin-imagenes' | 'sin-descripcion' | 'sin-categoria' | 'listos-publicar';
  cantidad: number;
  mensaje: string;
  severidad: 'alta' | 'media' | 'baja' | 'info';
}

export interface UltimaSincronizacion {
  fecha: string;
  producto: string;
}

export interface CategoriaDistribucion {
  _id: number;
  count: number;
}

export interface Estadisticas {
  // Métricas principales
  totalProductos: number;
  productosPublicados: number;
  productosBorrador: number;
  productosDestacados: number;
  productosListosParaPublicar: number;
  
  // Calidad de productos
  productosConImagenes: number;
  productosConDescripcion: number;
  productosSinImagenes: number;
  productosSinDescripcion: number;
  productosSinCategoria: number;
  productosSinEtiquetas: number;
  
  // Porcentajes de calidad
  porcentajeConImagenes: number;
  porcentajeConDescripcion: number;
  porcentajeConCategoria: number;
  calidadPromedio: number;
  
  // Valor del inventario
  valorInventario: number;
  
  // Distribución por categorías
  topCategorias: CategoriaDistribucion[];
  
  // Problemas detectados
  alertas: Alerta[];
  
  // Última sincronización
  ultimaSincronizacion: UltimaSincronizacion | null;
  
  // Compatibilidad
  porcentajeCompletitud: number;
}
