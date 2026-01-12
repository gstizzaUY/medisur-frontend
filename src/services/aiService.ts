import clienteAxios from '../functions/clienteAxios';

const AI_BASE = '/api/ai';

// Obtener token del localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export interface ConfiguracionIA {
  descripcionCorta: {
    longitud: number; // caracteres
    tono: 'profesional' | 'casual' | 'tecnico' | 'comercial' | 'persuasivo';
    incluirBeneficios: boolean;
    incluirPrecio: boolean;
    destacarDisponibilidad: boolean;
    incluirCertificaciones: boolean;
    incluirGarantia: boolean;
    incluirUrgencia: boolean;
  };
  descripcionLarga: {
    longitud: number; // palabras
    incluirCaracteristicas: boolean;
    incluirUsos: boolean;
    incluirAdvertencias: boolean;
    incluirBeneficios: boolean;
    incluirEspecificacionesTecnicas: boolean;
    incluirComparacion: boolean;
    incluirTestimonios: boolean;
    incluirCallToAction: boolean;
    estructuraHTML: boolean;
    tono: 'profesional' | 'casual' | 'tecnico' | 'comercial' | 'persuasivo';
  };
  seo: {
    metaTitleFormula: string; // ej: "{nombre} - Suministros Médicos | MediMarket"
    metaDescriptionLongitud: number; // caracteres
    keywordsCount: number; // cantidad de keywords
    incluirPrecio: boolean;
    incluirUbicacion: boolean;
    incluirLlamadoAccion: boolean;
    ubicacion: string;
  };
  nombreWeb: {
    incluirTalla: boolean;
    incluirCantidad: boolean;
    incluirMarca: boolean;
    longitudMaxima: number;
    estilo: 'descriptivo' | 'conciso' | 'comercial';
  };
  categorias: {
    autoAsignar: boolean;
    maximoCategorias: number;
  };
  etiquetas: {
    autoGenerar: boolean;
    maximoEtiquetas: number;
  };
  general: {
    rubroTienda: 'suministros_medicos' | 'equipamiento_clinico' | 'material_descartable' | 'farmacia';
    ubicacion: string;
    nombreTienda: string;
  };
}

export const aiService = {
  // Generar descripción corta
  generarDescripcionCorta: async (
    nombreProducto: string,
    precio?: number,
    stock?: number,
    config?: Partial<ConfiguracionIA['descripcionCorta']>
  ) => {
    const response = await clienteAxios.post(
      `${AI_BASE}/generar-descripcion-corta`,
      { nombreProducto, precio, stock, config },
      getAuthHeaders()
    );
    return response.data;
  },

  // Generar descripción larga
  generarDescripcionLarga: async (
    nombreProducto: string, 
    descripcionCorta?: string,
    precio?: number,
    stock?: number,
    config?: Partial<ConfiguracionIA['descripcionLarga']>
  ) => {
    const response = await clienteAxios.post(
      `${AI_BASE}/generar-descripcion-larga`,
      { nombreProducto, descripcionCorta, precio, stock, config },
      getAuthHeaders()
    );
    return response.data;
  },

  // Generar SEO completo
  generarSEO: async (
    nombreProducto: string,
    descripcion?: string,
    precio?: number,
    categoria?: string,
    config?: Partial<ConfiguracionIA['seo']>
  ) => {
    const response = await clienteAxios.post(
      `${AI_BASE}/generar-seo`,
      { nombreProducto, descripcion, precio, categoria, config },
      getAuthHeaders()
    );
    return response.data;
  },

  // 🆕 NUEVO: Generar nombre web
  generarNombreWeb: async (
    nombreProducto: string,
    categoria?: string,
    config?: Partial<ConfiguracionIA['nombreWeb']>
  ) => {
    const response = await clienteAxios.post(
      `${AI_BASE}/generar-nombre-web`,
      { nombreProducto, categoria, config },
      getAuthHeaders()
    );
    return response.data;
  },

  // Sugerir categorías
  sugerirCategorias: async (
    nombreProducto: string,
    categoriasDisponibles: any[],
    config?: Partial<ConfiguracionIA['categorias']>
  ) => {
    const response = await clienteAxios.post(
      `${AI_BASE}/sugerir-categorias`,
      { nombreProducto, categoriasDisponibles, config },
      getAuthHeaders()
    );
    return response.data;
  },

  // Generar etiquetas
  generarEtiquetas: async (
    nombreProducto: string,
    descripcion?: string,
    config?: Partial<ConfiguracionIA['etiquetas']>
  ) => {
    const response = await clienteAxios.post(
      `${AI_BASE}/generar-etiquetas`,
      { nombreProducto, descripcion, config },
      getAuthHeaders()
    );
    return response.data;
  },

  // Autocompletar TODO (llamada maestra)
  autocompletarProducto: async (
    nombreProducto: string,
    precio?: number,
    stock?: number,
    categoria?: string,
    categoriasDisponibles?: any[],
    etiquetasDisponibles?: any[],
    configuracion?: Partial<ConfiguracionIA>
  ) => {
    const response = await clienteAxios.post(
      `${AI_BASE}/autocompletar-producto`,
      { 
        nombreProducto,
        precio,
        stock,
        categoria,
        categoriasDisponibles,
        etiquetasDisponibles,
        configuracion 
      },
      getAuthHeaders()
    );
    return response.data;
  },

  // Autocompletar producto variable con atributos
  autocompletarProductoVariable: async (
    nombreProducto: string,
    atributos: Array<{ nombre: string; valores: string[] }>,
    productosHijos?: any[],
    configuracion?: Partial<ConfiguracionIA>
  ) => {
    const response = await clienteAxios.post(
      `${AI_BASE}/autocompletar-producto-variable`,
      { 
        nombreProducto,
        atributos,
        productosHijos,
        configuracion 
      },
      getAuthHeaders()
    );
    return response.data;
  },

  // Obtener configuración de IA
  obtenerConfiguracion: async () => {
    const response = await clienteAxios.get(
      `${AI_BASE}/configuracion`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Guardar configuración de IA
  guardarConfiguracion: async (configuracion: ConfiguracionIA) => {
    const response = await clienteAxios.post(
      `${AI_BASE}/configuracion`,
      configuracion,
      getAuthHeaders()
    );
    return response.data;
  },
};
