import clienteAxios from '../functions/clienteAxios';

const WOO_BASE = '/woocommerce';

// Obtener token del localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const woocommerceService = {
  // ==================== PRODUCTOS ====================
  
  // Listar productos web
  listarProductos: async (params = {}) => {
    const response = await clienteAxios.get(`${WOO_BASE}/productos`, {
      ...getAuthHeaders(),
      params,
    });
    return response.data;
  },

  // Obtener producto específico
  obtenerProducto: async (codigoArticulo: string) => {
    const response = await clienteAxios.get(
      `${WOO_BASE}/productos/${encodeURIComponent(codigoArticulo)}`,
      getAuthHeaders()
    );
    return response;
  },

  // Crear/actualizar producto (sin publicar)
  guardarProducto: async (data: any) => {
    const response = await clienteAxios.post(
      `${WOO_BASE}/productos`,
      data,
      getAuthHeaders()
    );
    return response.data;
  },

  // Actualizar producto ya publicado
  actualizarProductoPublicado: async (codigoArticulo: string, data: any) => {
    const response = await clienteAxios.put(
      `${WOO_BASE}/productos/${encodeURIComponent(codigoArticulo)}`,
      data
    );
    return response.data;
  },

  // Eliminar configuración de producto
  eliminarProducto: async (codigoArticulo: string) => {
    const response = await clienteAxios.delete(
      `${WOO_BASE}/productos/${codigoArticulo}`,
      getAuthHeaders()
    );
    return response.data;
  },

  // ==================== PUBLICACIÓN ====================

  // Publicar producto en WooCommerce
  publicarProducto: async (codigoArticulo: string, stock?: number) => {
    const body: any = {};
    if (typeof stock === 'number') {
      body.stock = stock;
    }
    const response = await clienteAxios.post(
      `${WOO_BASE}/productos/${encodeURIComponent(codigoArticulo)}/publicar`,
      body
    );
    return response.data;
  },

  // Despublicar producto
  despublicarProducto: async (codigoArticulo: string, eliminarDeWooCommerce = false) => {
    const response = await clienteAxios.post(
      `${WOO_BASE}/productos/${encodeURIComponent(codigoArticulo)}/despublicar`,
      { eliminarDeWooCommerce }
    );
    return response.data;
  },

  // ==================== SINCRONIZACIÓN ====================

  // Sincronizar stock individual
  sincronizarStock: async (codigoArticulo: string) => {
    const response = await clienteAxios.post(
      `${WOO_BASE}/productos/${codigoArticulo}/sincronizar-stock`,
      {},
      getAuthHeaders()
    );
    return response.data;
  },

  // Sincronizar precio individual
  sincronizarPrecio: async (codigoArticulo: string) => {
    const response = await clienteAxios.post(
      `${WOO_BASE}/productos/${codigoArticulo}/sincronizar-precio`,
      {},
      getAuthHeaders()
    );
    return response.data;
  },

  // Sincronización masiva
  sincronizarTodo: async (params = {}) => {
    const response = await clienteAxios.post(
      `${WOO_BASE}/sincronizar-todo`,
      params,
      getAuthHeaders()
    );
    return response.data;
  },

  // ==================== CATEGORÍAS ====================

  // Obtener categorías
  obtenerCategorias: async () => {
    const response = await clienteAxios.get(
      `${WOO_BASE}/categorias`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Crear categoría
  crearCategoria: async (data: any) => {
    const response = await clienteAxios.post(
      `${WOO_BASE}/categorias`,
      data,
      getAuthHeaders()
    );
    return response.data;
  },

  // ==================== ETIQUETAS ====================

  // Obtener etiquetas
  obtenerEtiquetas: async () => {
    const response = await clienteAxios.get(
      `${WOO_BASE}/etiquetas`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Crear etiqueta
  crearEtiqueta: async (data: any) => {
    const response = await clienteAxios.post(
      `${WOO_BASE}/etiquetas`,
      data,
      getAuthHeaders()
    );
    return response.data;
  },

  // ==================== AUXILIARES ====================

  // Buscar artículos de Zsoftware
  buscarArticulosDisponibles: async (params = {}) => {
    const response = await clienteAxios.get(
      `${WOO_BASE}/articulos-disponibles`,
      {
        ...getAuthHeaders(),
        params,
      }
    );
    return response.data;
  },

  // Obtener estadísticas
  obtenerEstadisticas: async () => {
    const response = await clienteAxios.get(
      `${WOO_BASE}/productos/estadisticas`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Obtener artículos con lista de precios Web (código 201)
  obtenerArticulosPreciosWeb: async () => {
    const response = await clienteAxios.post(
      '/facturas/lista-precios',
      { listaDePrecios: '201' },
      getAuthHeaders()
    );
    return response.data;
  },

  // Refrescar caché de precios web
  refrescarCachePreciosWeb: async () => {
    const response = await clienteAxios.post(
      '/facturas/lista-precios/refrescar-cache',
      {},
      getAuthHeaders()
    );
    return response.data;
  },

  // Obtener estado del caché
  obtenerEstadoCache: async () => {
    const response = await clienteAxios.get(
      '/facturas/lista-precios/estado-cache',
      getAuthHeaders()
    );
    return response.data;
  },

  // ⚠️ ELIMINAR TODOS LOS PRODUCTOS (usar con precaución)
  eliminarTodosProductos: async () => {
    const response = await clienteAxios.delete(
      `${WOO_BASE}/productos-todos`,
      getAuthHeaders()
    );
    return response.data;
  },
};
