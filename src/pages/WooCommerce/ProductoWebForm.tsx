import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { woocommerceService } from '../../services/woocommerceService';
import { aiService } from '../../services/aiService';
import toast from 'react-hot-toast';
import Breadcrumb from '../../components/Breadcrumb';
import { FiSave, FiCheckCircle, FiArrowLeft, FiPlus, FiTrash2, FiChevronLeft, FiChevronRight, FiZap } from 'react-icons/fi';
import { dataContext } from '../../hooks/DataContext';

const ProductoWebForm = () => {
  const { codigoArticulo: codigoArticuloParam } = useParams();
  const codigoArticulo = codigoArticuloParam ? decodeURIComponent(codigoArticuloParam) : undefined;
  const navigate = useNavigate();
  const location = useLocation();
  const context = useContext(dataContext) as any;
  const { articulosConStock } = context;

  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [publicando, setPublicando] = useState(false);
  const [articuloZsoftware, setArticuloZsoftware] = useState<any>(null);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [etiquetas, setEtiquetas] = useState<any[]>([]);
  const [busquedaArticulo, setBusquedaArticulo] = useState('');
  const [articulosDisponibles, setArticulosDisponibles] = useState<any[]>([]);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Nuevos estados para manejo de múltiples artículos
  const [articulosSeleccionados, setArticulosSeleccionados] = useState<Array<string | { codigo: string; nombre: string; precioWeb: number; ivaCodigo?: number }>>([]);
  const [indiceActual, setIndiceActual] = useState(0);

  // Estados para IA
  const [procesandoIA, setProcesandoIA] = useState<string | null>(null); // null | 'descripcionCorta' | 'descripcionLarga' | 'seo' | 'todo'
  const [vistaDescripcionLarga, setVistaDescripcionLarga] = useState<'editor' | 'preview'>('editor'); // Vista de descripción larga

  const [formData, setFormData] = useState({
    codigoArticulo: '',
    nombreWeb: '',
    slug: '',
    precioRegular: 0,
    precioWeb: 0,
    descuento: 0, // Campo renombrado de porcentajeDescuento a descuento
    ivaCodigo: 2, // 1=10%, 2=22%, 3=Exento
    imagenes: [] as any[],
    descripcionCorta: '',
    descripcionLarga: '',
    categorias: [] as number[],
    etiquetas: [] as number[],
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
    estado: 'borrador',
    notas: '',
  });

  useEffect(() => {
    cargarCategorias();
    cargarEtiquetas();

    // Verificar si vienen artículos pre-seleccionados desde la navegación
    if (location.state?.articulosSeleccionados && location.state.articulosSeleccionados.length > 0) {
      setArticulosSeleccionados(location.state.articulosSeleccionados);
      // Cargar el primer artículo seleccionado (ahora viene con datos completos)
      const primerArticulo = location.state.articulosSeleccionados[0];
      cargarArticuloDesdeDataContext(primerArticulo.codigo, primerArticulo.precioWeb, primerArticulo.ivaCodigo);
      setModoEdicion(false);
    } else if (codigoArticulo) {
      setModoEdicion(true);
      cargarProducto();
    }
  }, [codigoArticulo]);

  const cargarCategorias = async () => {
    try {
      const response = await woocommerceService.obtenerCategorias();
      setCategorias(response.data.categorias);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const cargarEtiquetas = async () => {
    try {
      const response = await woocommerceService.obtenerEtiquetas();
      console.log('[cargarEtiquetas] Respuesta completa:', response);
      console.log('[cargarEtiquetas] Etiquetas:', response.data.etiquetas);
      setEtiquetas(response.data.etiquetas);
    } catch (error) {
      console.error('Error cargando etiquetas:', error);
    }
  };

  const cargarArticuloDesdeDataContext = async (codigo: string, precioWebParam?: number, ivaCodigoParam?: number) => {
    const articulo = articulosConStock?.find((art: any) => art.Codigo === codigo);
    if (articulo) {
      // Usar el precio recibido como parámetro o obtenerlo de la API
      let precioWeb = precioWebParam || articulo.PrecioVenta || 0;
      let ivaCodigo = ivaCodigoParam || 2; // Por defecto 22%
      
      // Solo hacer petición si no se recibió el precio como parámetro
      if (!precioWebParam) {
        try {
          const preciosWebResponse = await woocommerceService.obtenerArticulosPreciosWeb();
          const articuloPrecioWeb = preciosWebResponse.find((art: any) => art.Codigo === codigo);
          if (articuloPrecioWeb) {
            precioWeb = parseFloat(articuloPrecioWeb.PrecioSinIVA || 0);
            ivaCodigo = articuloPrecioWeb.IVACodigo || 2;
          }
        } catch (error) {
          console.error('Error obteniendo precio web:', error);
        }
      }

      setArticuloZsoftware({
        codigo: articulo.Codigo,
        nombre: articulo.Nombre,
        precioVenta: precioWeb,
        costo: articulo.Costo || 0,
        stock: parseFloat(articulo.Stock || 0),
        descripcion: articulo.Descripcion || '',
      });

      setFormData({
        ...formData,
        codigoArticulo: articulo.Codigo,
        nombreWeb: articulo.Nombre,
        slug: generarSlug(articulo.Nombre),
        precioRegular: precioWeb,
        precioWeb: precioWeb,
        ivaCodigo: ivaCodigo,
        seo: {
          ...formData.seo,
          metaTitle: articulo.Nombre,
          metaDescription: `${articulo.Nombre} - Productos médicos de calidad`,
        },
      });
    }
  };

  const cargarProducto = async () => {
    try {
      setLoading(true);
      const response = await woocommerceService.obtenerProducto(codigoArticulo!);
      console.log('[ProductoWebForm] Respuesta recibida en cargarProducto:', response.data);
      const producto = response.data.data;
      if (!producto) {
        // Maneja el error, muestra mensaje, etc.
        setLoading(false);
        return;
      }

      setFormData({
        codigoArticulo: producto.codigoArticulo,
        nombreWeb: producto.nombreWeb || '',
        slug: producto.slug || '',
        precioRegular: producto.precioRegular || 0,
        precioWeb: producto.precioWeb || 0,
        descuento: producto.descuento || 0,
        ivaCodigo: producto.ivaCodigo || 2,
        imagenes: producto.imagenes || [],
        descripcionCorta: producto.descripcionCorta || '',
        descripcionLarga: producto.descripcionLarga || '',
        categorias: producto.categorias || [],
        etiquetas: producto.etiquetas || [],
        destacado: producto.destacado || false,
        gestionarStock: producto.gestionarStock !== false,
        sincronizacionAutomatica: producto.sincronizacionAutomatica || {
          stock: true,
          precios: false,
        },
        seo: producto.seo || {
          metaTitle: '',
          metaDescription: '',
          keywords: '',
          focusKeyword: '',
        },
        estado: producto.estado || 'borrador',
        notas: producto.notas || '',
      });

      // Inicializar articuloZsoftware con todas las propiedades necesarias
      const info = response.data.articuloInfo || {};
      console.log('[ProductoWebForm] articuloInfo recibido:', info);
      setArticuloZsoftware({
        codigo: info.codigo || producto.codigoArticulo || '',
        nombre: info.nombre || producto.nombreWeb || '',
        precioVenta: info.precioVenta ?? producto.precioWeb ?? 0,
        costo: info.costo ?? 0,
        stock: info.stock !== undefined ? parseFloat(info.stock) : 0,
        descripcion: info.descripcion || producto.descripcionCorta || '',
      });
    } catch (error: any) {
      console.error('Error cargando producto:', error);
      toast.error(error.response?.data?.message || 'Error cargando producto');
    } finally {
      setLoading(false);
    }
  };

  const buscarArticulos = async () => {
    if (!busquedaArticulo) return;

    try {
      const response = await woocommerceService.buscarArticulosDisponibles({
        search: busquedaArticulo,
        limit: 20,
      });
      setArticulosDisponibles(response.data.articulos);
    } catch (error: any) {
      console.error('Error buscando artículos:', error);
      toast.error(error.response?.data?.message || 'Error en búsqueda');
    }
  };

  const seleccionarArticulo = async (articulo: any) => {
    // Obtener precio de la lista "Precios Web" (código 201)
    let precioWeb = articulo.precioVenta || 0;
    try {
      const preciosWebResponse = await woocommerceService.obtenerArticulosPreciosWeb();
      const articuloPrecioWeb = preciosWebResponse.find((art: any) => art.Codigo === articulo.codigo);
      if (articuloPrecioWeb) {
        precioWeb = parseFloat(articuloPrecioWeb.PrecioSinIVA || 0);
      }
    } catch (error) {
      console.error('Error obteniendo precio web:', error);
    }

    setArticuloZsoftware({
      ...articulo,
      precioVenta: precioWeb,
    });
    
    setFormData({
      ...formData,
      codigoArticulo: articulo.codigo,
      nombreWeb: articulo.nombre,
      slug: generarSlug(articulo.nombre),
      precioRegular: precioWeb,
      precioWeb: precioWeb,
      seo: {
        ...formData.seo,
        metaTitle: articulo.nombre,
      },
    });
    setArticulosDisponibles([]);
    setBusquedaArticulo('');
  };

  const generarSlug = (texto: string) => {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const navegarSiguienteArticulo = () => {
    if (indiceActual < articulosSeleccionados.length - 1) {
      const nuevoIndice = indiceActual + 1;
      setIndiceActual(nuevoIndice);
      const siguienteArticulo = articulosSeleccionados[nuevoIndice];
      // Verificar si es un objeto con datos completos o solo un string
      const codigo = typeof siguienteArticulo === 'string' ? siguienteArticulo : siguienteArticulo.codigo;
      const precioWeb = typeof siguienteArticulo === 'string' ? undefined : siguienteArticulo.precioWeb;
      const ivaCodigo = typeof siguienteArticulo === 'string' ? undefined : siguienteArticulo.ivaCodigo;
      
      cargarArticuloDesdeDataContext(codigo, precioWeb, ivaCodigo);
      // Resetear algunos campos del formulario
      setFormData(prev => ({
        ...prev,
        imagenes: [],
        descripcionCorta: '',
        descripcionLarga: '',
        categorias: [],
        etiquetas: [],
        destacado: false,
        notas: '',
      }));
    }
  };

  const navegarAnteriorArticulo = () => {
    if (indiceActual > 0) {
      const nuevoIndice = indiceActual - 1;
      setIndiceActual(nuevoIndice);
      const anteriorArticulo = articulosSeleccionados[nuevoIndice];
      // Verificar si es un objeto con datos completos o solo un string
      const codigo = typeof anteriorArticulo === 'string' ? anteriorArticulo : anteriorArticulo.codigo;
      const precioWeb = typeof anteriorArticulo === 'string' ? undefined : anteriorArticulo.precioWeb;
      const ivaCodigo = typeof anteriorArticulo === 'string' ? undefined : anteriorArticulo.ivaCodigo;
      
      cargarArticuloDesdeDataContext(codigo, precioWeb, ivaCodigo);
    }
  };

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nombre = e.target.value;
    setFormData({
      ...formData,
      nombreWeb: nombre,
      slug: generarSlug(nombre),
      seo: {
        ...formData.seo,
        metaTitle: nombre,
      },
    });
  };

  const calcularDescuento = (regular: number, venta: number) => {
    if (regular <= 0) return 0;
    return Math.round(((regular - venta) / regular) * 100);
  };

  const handlePrecioRegularChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const precioRegular = parseFloat(e.target.value) || 0;
    setFormData({
      ...formData,
      precioRegular,
      descuento: calcularDescuento(precioRegular, formData.precioWeb),
    });
  };

  const handlePrecioWebChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const precioWeb = parseFloat(e.target.value) || 0;
    setFormData({
      ...formData,
      precioWeb,
      descuento: calcularDescuento(formData.precioRegular, precioWeb),
    });
  };

  const agregarImagen = () => {
    setFormData({
      ...formData,
      imagenes: [...formData.imagenes, { url: '', alt: '' }],
    });
  };

  const actualizarImagen = (index: number, campo: string, valor: string) => {
    const nuevasImagenes = [...formData.imagenes];
    nuevasImagenes[index] = { ...nuevasImagenes[index], [campo]: valor };
    setFormData({ ...formData, imagenes: nuevasImagenes });
  };

  const eliminarImagen = (index: number) => {
    setFormData({
      ...formData,
      imagenes: formData.imagenes.filter((_, i) => i !== index),
    });
  };

  // Funciones de IA
  const generarDescripcionCortaIA = async () => {
    if (!formData.nombreWeb) {
      toast.error('Primero ingresa un nombre para el producto');
      return;
    }

    setProcesandoIA('descripcionCorta');
    try {
      const response = await aiService.generarDescripcionCorta(formData.nombreWeb);
      setFormData({
        ...formData,
        descripcionCorta: response.data.descripcion,
      });
      toast.success('Descripción corta generada con IA');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error generando descripción');
    } finally {
      setProcesandoIA(null);
    }
  };

  const generarDescripcionLargaIA = async () => {
    if (!formData.nombreWeb) {
      toast.error('Primero ingresa un nombre para el producto');
      return;
    }

    setProcesandoIA('descripcionLarga');
    try {
      const response = await aiService.generarDescripcionLarga(
        formData.nombreWeb,
        formData.descripcionCorta
      );
      setFormData({
        ...formData,
        descripcionLarga: response.data.descripcion,
      });
      toast.success('Descripción larga generada con IA');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error generando descripción');
    } finally {
      setProcesandoIA(null);
    }
  };

  const generarSEOIA = async () => {
    if (!formData.nombreWeb) {
      toast.error('Primero ingresa un nombre para el producto');
      return;
    }

    setProcesandoIA('seo');
    try {
      const response = await aiService.generarSEO(
        formData.nombreWeb,
        formData.descripcionCorta || formData.descripcionLarga
      );
      const seoData = response.data;
      setFormData({
        ...formData,
        seo: {
          metaTitle: seoData.metaTitle || formData.seo.metaTitle,
          metaDescription: seoData.metaDescription || formData.seo.metaDescription,
          keywords: seoData.keywords || formData.seo.keywords,
          focusKeyword: seoData.focusKeyword || formData.seo.focusKeyword,
        },
      });
      toast.success('SEO generado con IA');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error generando SEO');
    } finally {
      setProcesandoIA(null);
    }
  };

  const autocompletarTodoIA = async () => {
    if (!formData.nombreWeb) {
      toast.error('Primero ingresa un nombre para el producto');
      return;
    }

    setProcesandoIA('todo');
    try {
      console.log('[autocompletarTodoIA] Categorías disponibles:', categorias?.length || 0);
      console.log('[autocompletarTodoIA] Etiquetas disponibles:', etiquetas?.length || 0);
      
      const response = await aiService.autocompletarProducto(
        formData.nombreWeb,
        formData.precioWeb, // precio
        articuloZsoftware?.Stock ? parseFloat(articuloZsoftware.Stock) : undefined, // stock
        undefined, // categoria (puede dejarse undefined por ahora)
        categorias, // categorias disponibles
        etiquetas, // etiquetas disponibles
        undefined // configuracion (usará la por defecto del backend)
      );

      console.log('Respuesta completa de autocompletar:', response);
      const datos = response.data;
      console.log('Datos recibidos:', datos);
      console.log('Etiquetas recibidas:', datos.etiquetas);
      console.log('Tipo de etiquetas:', typeof datos.etiquetas, Array.isArray(datos.etiquetas));

      // Verificar qué campos vienen
      const camposRecibidos = [];
      if (datos.nombreWeb) camposRecibidos.push('Nombre Web');
      if (datos.slug) camposRecibidos.push('Slug');
      if (datos.descripcionCorta) camposRecibidos.push('Descripción Corta');
      if (datos.descripcionLarga) camposRecibidos.push('Descripción Larga');
      if (datos.categorias && datos.categorias.length > 0) camposRecibidos.push(`${datos.categorias.length} Categorías`);
      if (datos.etiquetas && datos.etiquetas.length > 0) camposRecibidos.push(`${datos.etiquetas.length} Etiquetas`);
      if (datos.seo) camposRecibidos.push('SEO');

      setFormData({
        ...formData,
        // Actualizar nombre web si viene en la respuesta
        nombreWeb: datos.nombreWeb || formData.nombreWeb,
        slug: datos.slug || formData.slug,
        descripcionCorta: datos.descripcionCorta || formData.descripcionCorta,
        descripcionLarga: datos.descripcionLarga || formData.descripcionLarga,
        categorias: datos.categorias || formData.categorias,
        etiquetas: datos.etiquetas || formData.etiquetas,
        seo: {
          metaTitle: datos.seo?.metaTitle || formData.seo.metaTitle,
          metaDescription: datos.seo?.metaDescription || formData.seo.metaDescription,
          keywords: datos.seo?.keywords || formData.seo.keywords,
          focusKeyword: datos.seo?.focusKeyword || formData.seo.focusKeyword,
        },
      });

      if (camposRecibidos.length > 0) {
        toast.success(`✅ Completado: ${camposRecibidos.join(', ')}`);
      } else {
        toast.error('⚠️ El backend no devolvió ningún campo. Revisa la consola.');
      }
    } catch (error: any) {
      console.error('Error en autocompletar:', error);
      toast.error(error.response?.data?.message || 'Error en auto-completado');
    } finally {
      setProcesandoIA(null);
    }
  };

  const validarFormulario = () => {
    const errores = [];

    if (!formData.codigoArticulo) errores.push('Selecciona un artículo de Zsoftware');
    if (!formData.nombreWeb) errores.push('El nombre web es requerido');
    if (formData.precioWeb <= 0) errores.push('El precio debe ser mayor a 0');
    if (formData.imagenes.length === 0) errores.push('Agrega al menos una imagen');
    if (!formData.descripcionCorta) errores.push('La descripción corta es requerida');

    return errores;
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setGuardando(true);
      console.log('[handleGuardar] modoEdicion:', modoEdicion);
      console.log('[handleGuardar] formData enviado:', formData);

      let response;
      if (modoEdicion) {
        response = await woocommerceService.actualizarProductoPublicado(
          formData.codigoArticulo,
          formData
        );
        console.log('[handleGuardar] Respuesta actualizarProductoPublicado:', response);
        toast.success('Producto actualizado');
      } else {
        response = await woocommerceService.guardarProducto(formData);
        console.log('[handleGuardar] Respuesta guardarProducto:', response);
        toast.success('Producto guardado como borrador');

        // Si hay más artículos seleccionados, ir al siguiente
        if (articulosSeleccionados.length > 0 && indiceActual < articulosSeleccionados.length - 1) {
          navegarSiguienteArticulo();
          return;
        }
      }

      navigate('/app/woocommerce/productos');
    } catch (error: any) {
      console.error('[handleGuardar] Error guardando producto:', error);
      if (error.response) {
        console.error('[handleGuardar] error.response.data:', error.response.data);
      }
      toast.error(error.response?.data?.message || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const handlePublicar = async () => {
    const errores = validarFormulario();
    if (errores.length > 0) {
      toast.error(errores.join('\n'));
      return;
    }

    // Advertencia si el stock es 0
    if ((articuloZsoftware?.stock ?? 0) === 0) {
      const continuar = confirm('⚠️ El producto tiene stock 0. Se publicará con stock genérico 100 en WooCommerce. ¿Deseas continuar?');
      if (!continuar) return;
    } else {
      if (!confirm('¿Publicar este producto en Tienda MediMarket?')) return;
    }

    try {
      setPublicando(true);

      // Guardar como borrador primero
      let respGuardar;
      if (modoEdicion) {
        respGuardar = await woocommerceService.guardarProducto({ ...formData, estado: 'borrador' });
      } else {
        respGuardar = await woocommerceService.guardarProducto({ ...formData, estado: 'borrador' });
      }

      if (!respGuardar?.success) {
        toast.error('No se pudo guardar el producto.');
        setPublicando(false);
        return;
      }

  // Publicar después de guardar
  let stockParaPublicar = articuloZsoftware?.stock ?? 0;
  // Si el stock es 0, el backend lo convertirá a 100, pero lo enviamos igual para que el backend lo reciba
  const respPublicar = await woocommerceService.publicarProducto(formData.codigoArticulo, stockParaPublicar);
      if (respPublicar?.success) {
        toast.success('¡Producto publicado en Tienda MediMarket!');
        // Solo actualizar si la publicación fue exitosa y el producto está publicado
        const respActualizar = await woocommerceService.actualizarProductoPublicado(
          formData.codigoArticulo,
          { ...formData, estado: 'publicado' }
        );
        if (respActualizar?.success) {
          toast.success('Producto actualizado después de publicar');
        } else {
          toast.error(respActualizar?.message || 'Error al actualizar después de publicar');
        }
        navigate('/app/woocommerce/productos');
      } else {
        toast.error(respPublicar?.message || 'Error al publicar');
      }
    } catch (error: any) {
      console.error('Error publicando:', error);
      toast.error(error.response?.data?.message || 'Error al publicar');
    } finally {
      setPublicando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb pageName={modoEdicion ? 'Editar Producto Web' : 'Nuevo Producto Web'} />

      {/* Indicador de progreso para múltiples artículos */}
      {articulosSeleccionados.length > 1 && (
        <div className="mb-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between px-7 py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium text-black dark:text-white">
                  Producto {indiceActual + 1} de {articulosSeleccionados.length}
                </span>
                <span className="text-sm text-bodydark">
                  ({articuloZsoftware?.codigo})
                </span>
              </div>
              <div className="h-2 w-64 rounded-full bg-gray dark:bg-meta-4">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{ width: `${((indiceActual + 1) / articulosSeleccionados.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={navegarAnteriorArticulo}
                disabled={indiceActual === 0}
                className="inline-flex items-center gap-2 rounded border border-stroke px-4 py-2 text-black hover:bg-gray disabled:opacity-50 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
              >
                <FiChevronLeft /> Anterior
              </button>
              <button
                type="button"
                onClick={navegarSiguienteArticulo}
                disabled={indiceActual === articulosSeleccionados.length - 1}
                className="inline-flex items-center gap-2 rounded border border-stroke px-4 py-2 text-black hover:bg-gray disabled:opacity-50 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
              >
                Siguiente <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleGuardar}>
        {/* Sección: Seleccionar Artículo */}
        {!modoEdicion && !articuloZsoftware && articulosSeleccionados.length === 0 && (
          <div className="mb-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                1. Seleccionar Artículo de Zsoftware
              </h3>
            </div>
            <div className="p-7">
              <div className="mb-4 flex gap-3">
                <input
                  type="text"
                  value={busquedaArticulo}
                  onChange={(e) => setBusquedaArticulo(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), buscarArticulos())}
                  placeholder="Buscar por código o nombre..."
                  className="flex-1 rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                />
                <button
                  type="button"
                  onClick={buscarArticulos}
                  className="rounded bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90"
                >
                  Buscar
                </button>
              </div>

              {articulosDisponibles.length > 0 && (
                <div className="max-h-96 overflow-y-auto rounded border border-stroke dark:border-strokedark">
                  {articulosDisponibles.map((articulo, index) => (
                    <div
                      key={index}
                      onClick={() => seleccionarArticulo(articulo)}
                      className="cursor-pointer border-b border-stroke px-4 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-black dark:text-white">
                            {articulo.nombre}
                          </p>
                          <p className="text-sm text-bodydark">
                            Código: {articulo.codigo} | Stock: {articulo.stock} | Precio: ${articulo.precioVenta}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90"
                        >
                          Seleccionar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información del Artículo Seleccionado */}
        {articuloZsoftware && (
          <div className="mb-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Artículo de Zsoftware
              </h3>
            </div>
            <div className="p-7">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-bodydark">Código</p>
                  <p className="font-medium">{articuloZsoftware.codigo}</p>
                </div>
                <div>
                  <p className="text-sm text-bodydark">Nombre</p>
                  <p className="font-medium">{articuloZsoftware.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-bodydark">Stock Disponible</p>
                  <p className="font-medium">{articuloZsoftware.stock || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-bodydark">Precio Zsoftware</p>
                  <p className="font-medium">${articuloZsoftware.precioVenta || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Panel de Acciones Rápidas con IA */}
        {articuloZsoftware && (
          <div className="mb-6 rounded-sm border-2 border-purple-600 bg-gradient-to-r from-purple-50 to-blue-50 shadow-default dark:from-purple-900/20 dark:to-blue-900/20">
            <div className="px-7 py-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white">
                    <FiZap size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black dark:text-white">
                      Asistente de Inteligencia Artificial
                    </h3>
                    <p className="text-sm text-bodydark">
                      Completa automáticamente el formulario usando IA. Configura las reglas en Configuración → Inteligencia Artificial.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={autocompletarTodoIA}
                    disabled={procesandoIA === 'todo' || !formData.nombreWeb}
                    className="inline-flex items-center gap-2 rounded bg-purple-600 px-6 py-2 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                    title="Autocompletar todos los campos con IA"
                  >
                    <FiZap size={18} />
                    {procesandoIA === 'todo' ? 'Procesando...' : 'Autocompletar Todo'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Configuración del Producto Web */}
        {articuloZsoftware && (
          <>
            {/* Sección: Información Básica */}
            <div className="mb-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  2. Información Básica
                </h3>
              </div>
              <div className="p-7">
                <div className="mb-4">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Nombre Web *
                  </label>
                  <input
                    type="text"
                    value={formData.nombreWeb}
                    onChange={handleNombreChange}
                    required
                    placeholder="Nombre optimizado para la tienda online"
                    className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  />
                  <small className="text-bodydark">
                    Este nombre aparecerá en la tienda. Puede ser diferente al nombre en Zsoftware.
                  </small>
                </div>

                <div className="mb-4">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Slug (URL)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="url-amigable-del-producto"
                    className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  />
                  <small className="text-bodydark">
                    Se genera automáticamente del nombre. Ejemplo: tienda.com/producto/{formData.slug}
                  </small>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Precio Regular (Precio Web) *
                    </label>
                    <input
                      type="number"
                      value={formData.precioRegular}
                      onChange={handlePrecioRegularChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                    <small className="text-bodydark">
                      Precio de la lista "Precios Web" (código 201)
                    </small>
                  </div>

                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Precio de Venta *
                    </label>
                    <input
                      type="number"
                      value={formData.precioWeb}
                      onChange={handlePrecioWebChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      IVA *
                    </label>
                    <select
                      value={formData.ivaCodigo}
                      onChange={(e) => setFormData({ ...formData, ivaCodigo: parseInt(e.target.value) })}
                      required
                      className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    >
                      <option value={2}>22% (Estándar)</option>
                      <option value={1}>10% (Reducido)</option>
                      <option value={3}>0% (Exento)</option>
                    </select>
                    <small className="text-bodydark">
                      Tasa de IVA aplicable
                    </small>
                  </div>

                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Descuento
                    </label>
                    <input
                      type="text"
                      value={`${formData.descuento}%`}
                      disabled
                      className="w-full rounded border border-stroke bg-gray-2 px-4 py-3 text-black dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sección: Imágenes */}
            <div className="mb-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  3. Imágenes del Producto *
                </h3>
              </div>
              <div className="p-7">
                {formData.imagenes.map((imagen, index) => (
                  <div key={index} className="mb-4 rounded border border-stroke p-4 dark:border-strokedark">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-medium">Imagen {index + 1}</p>
                      <button
                        type="button"
                        onClick={() => eliminarImagen(index)}
                        className="text-danger hover:text-opacity-80"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium">URL de la imagen</label>
                        <input
                          type="url"
                          value={imagen.url}
                          onChange={(e) => actualizarImagen(index, 'url', e.target.value)}
                          placeholder="https://ejemplo.com/imagen.jpg"
                          className="w-full rounded border border-stroke bg-gray px-4 py-2 focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">Texto alternativo</label>
                        <input
                          type="text"
                          value={imagen.alt}
                          onChange={(e) => actualizarImagen(index, 'alt', e.target.value)}
                          placeholder="Descripción de la imagen"
                          className="w-full rounded border border-stroke bg-gray px-4 py-2 focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4"
                        />
                      </div>
                    </div>
                    {imagen.url && (
                      <div className="mt-3">
                        <img
                          src={imagen.url}
                          alt={imagen.alt}
                          className="h-32 w-32 rounded object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={agregarImagen}
                  className="inline-flex items-center gap-2 rounded bg-meta-3 px-4 py-2 text-white hover:bg-opacity-90"
                >
                  <FiPlus /> Agregar Imagen
                </button>
                <p className="mt-2 text-sm text-bodydark">
                  La primera imagen será la principal. Recomendado: 800x800px mínimo.
                </p>
              </div>
            </div>

            {/* Sección: Descripciones */}
            <div className="mb-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  4. Descripciones
                </h3>
              </div>
              <div className="p-7">
                <div className="mb-4">
                  <div className="mb-2.5 flex items-center justify-between">
                    <label className="block font-medium text-black dark:text-white">
                      Descripción Corta *
                    </label>
                    <button
                      type="button"
                      onClick={generarDescripcionCortaIA}
                      disabled={procesandoIA === 'descripcionCorta' || !formData.nombreWeb}
                      className="inline-flex items-center gap-2 rounded bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                      title="Generar con IA"
                    >
                      <FiZap size={14} />
                      {procesandoIA === 'descripcionCorta' ? 'Generando...' : 'IA'}
                    </button>
                  </div>
                  <textarea
                    value={formData.descripcionCorta}
                    onChange={(e) =>
                      setFormData({ ...formData, descripcionCorta: e.target.value })
                    }
                    required
                    rows={3}
                    placeholder="Resumen breve del producto (1-2 líneas)"
                    className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  />
                </div>

                <div className="mb-4">
                  <div className="mb-2.5 flex items-center justify-between">
                    <label className="block font-medium text-black dark:text-white">
                      Descripción Larga
                    </label>
                    <button
                      type="button"
                      onClick={generarDescripcionLargaIA}
                      disabled={procesandoIA === 'descripcionLarga' || !formData.nombreWeb}
                      className="inline-flex items-center gap-2 rounded bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                      title="Generar con IA"
                    >
                      <FiZap size={14} />
                      {procesandoIA === 'descripcionLarga' ? 'Generando...' : 'IA'}
                    </button>
                  </div>

                  {/* Pestañas */}
                  <div className="mb-3 flex gap-2 border-b border-stroke dark:border-strokedark">
                    <button
                      type="button"
                      onClick={() => setVistaDescripcionLarga('editor')}
                      className={`px-4 py-2 font-medium transition-colors ${vistaDescripcionLarga === 'editor'
                          ? 'border-b-2 border-primary text-primary'
                          : 'text-bodydark hover:text-primary'
                        }`}
                    >
                      Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => setVistaDescripcionLarga('preview')}
                      className={`px-4 py-2 font-medium transition-colors ${vistaDescripcionLarga === 'preview'
                          ? 'border-b-2 border-primary text-primary'
                          : 'text-bodydark hover:text-primary'
                        }`}
                    >
                      Vista Previa
                    </button>
                  </div>

                  {/* Contenido según pestaña */}
                  {vistaDescripcionLarga === 'editor' ? (
                    <textarea
                      value={formData.descripcionLarga}
                      onChange={(e) =>
                        setFormData({ ...formData, descripcionLarga: e.target.value })
                      }
                      rows={8}
                      placeholder="Descripción detallada del producto, características, beneficios, etc."
                      className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  ) : (
                    <div
                      className="preview-html min-h-[200px] w-full rounded border border-stroke bg-white px-6 py-4 dark:border-strokedark dark:bg-boxdark dark:text-white"
                      dangerouslySetInnerHTML={{
                        __html: formData.descripcionLarga || '<p style="color: #64748b; font-style: italic;">La vista previa aparecerá aquí...</p>'
                      }}
                      style={{
                        lineHeight: '1.7',
                        fontSize: '15px',
                      }}
                    />
                  )}

                  {/* Estilos para la vista previa */}
                  <style>{`
                    .preview-html h3 {
                      font-size: 1.25rem;
                      font-weight: 600;
                      margin-bottom: 0.75rem;
                      margin-top: 1.25rem;
                      color: inherit;
                    }
                    .preview-html h3:first-child {
                      margin-top: 0;
                    }
                    .preview-html h4 {
                      font-size: 1.1rem;
                      font-weight: 600;
                      margin-bottom: 0.5rem;
                      margin-top: 1rem;
                      color: inherit;
                    }
                    .preview-html p {
                      margin-bottom: 0.75rem;
                      color: inherit;
                    }
                    .preview-html ul {
                      margin-bottom: 0.75rem;
                      margin-left: 1.5rem;
                      list-style-type: disc;
                    }
                    .preview-html ul li {
                      margin-bottom: 0.375rem;
                      color: inherit;
                    }
                    .preview-html ol {
                      margin-bottom: 0.75rem;
                      margin-left: 1.5rem;
                      list-style-type: decimal;
                    }
                    .preview-html ol li {
                      margin-bottom: 0.375rem;
                      color: inherit;
                    }
                    .preview-html strong {
                      font-weight: 600;
                      color: inherit;
                    }
                    .preview-html em {
                      font-style: italic;
                    }
                  `}</style>
                </div>
              </div>
            </div>

            {/* Sección: Categorías y Etiquetas */}
            <div className="mb-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  5. Categorías y Etiquetas
                </h3>
              </div>
              <div className="p-7">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Categorías
                    </label>
                    <select
                      multiple
                      value={formData.categorias.map(String)}
                      onChange={(e) => {
                        const options = Array.from(e.target.selectedOptions);
                        setFormData({
                          ...formData,
                          categorias: options.map((opt) => parseInt(opt.value)),
                        });
                      }}
                      className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                      size={6}
                    >
                      {categorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <small className="text-bodydark">
                      Mantén presionado Ctrl (Cmd en Mac) para seleccionar múltiples
                    </small>
                  </div>

                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Etiquetas
                    </label>
                    <select
                      multiple
                      value={formData.etiquetas.map(String)}
                      onChange={(e) => {
                        const options = Array.from(e.target.selectedOptions);
                        setFormData({
                          ...formData,
                          etiquetas: options.map((opt) => parseInt(opt.value)),
                        });
                      }}
                      className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                      size={6}
                    >
                      {etiquetas.map((tag) => (
                        <option key={tag.id} value={tag.id}>
                          {tag.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección: SEO */}
            <div className="mb-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-black dark:text-white">
                    6. Optimización SEO
                  </h3>
                  <button
                    type="button"
                    onClick={generarSEOIA}
                    disabled={procesandoIA === 'seo' || !formData.nombreWeb}
                    className="inline-flex items-center gap-2 rounded bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                    title="Generar SEO completo con IA"
                  >
                    <FiZap size={14} />
                    {procesandoIA === 'seo' ? 'Generando SEO...' : 'Generar SEO con IA'}
                  </button>
                </div>
              </div>
              <div className="p-7">
                <div className="mb-4">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Título SEO
                  </label>
                  <input
                    type="text"
                    value={formData.seo.metaTitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: { ...formData.seo, metaTitle: e.target.value },
                      })
                    }
                    maxLength={60}
                    placeholder="Título optimizado para motores de búsqueda"
                    className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  />
                  <small className="text-bodydark">
                    {formData.seo.metaTitle.length}/60 caracteres
                  </small>
                </div>

                <div className="mb-4">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Meta Descripción
                  </label>
                  <textarea
                    value={formData.seo.metaDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: { ...formData.seo, metaDescription: e.target.value },
                      })
                    }
                    maxLength={160}
                    rows={3}
                    placeholder="Descripción que aparecerá en los resultados de búsqueda"
                    className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  />
                  <small className="text-bodydark">
                    {formData.seo.metaDescription.length}/160 caracteres
                  </small>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Palabra Clave Principal
                    </label>
                    <input
                      type="text"
                      value={formData.seo.focusKeyword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          seo: { ...formData.seo, focusKeyword: e.target.value },
                        })
                      }
                      placeholder="palabra clave principal"
                      className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Keywords (separadas por coma)
                    </label>
                    <input
                      type="text"
                      value={formData.seo.keywords}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          seo: { ...formData.seo, keywords: e.target.value },
                        })
                      }
                      placeholder="keyword1, keyword2, keyword3"
                      className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sección: Configuración Avanzada */}
            <div className="mb-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  7. Configuración Avanzada
                </h3>
              </div>
              <div className="p-7">
                <div className="mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.destacado}
                      onChange={(e) =>
                        setFormData({ ...formData, destacado: e.target.checked })
                      }
                      className="h-5 w-5"
                    />
                    <span className="font-medium">Producto Destacado</span>
                  </label>
                  <small className="ml-7 text-bodydark">
                    Aparecerá en la sección de productos destacados
                  </small>
                </div>

                <div className="mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.sincronizacionAutomatica.stock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sincronizacionAutomatica: {
                            ...formData.sincronizacionAutomatica,
                            stock: e.target.checked,
                          },
                        })
                      }
                      className="h-5 w-5"
                    />
                    <span className="font-medium">Sincronización Automática de Stock</span>
                  </label>
                  <small className="ml-7 text-bodydark">
                    El stock se actualizará automáticamente cada 6 horas desde Zsoftware (solo en producción)
                  </small>
                </div>

                <div className="mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.sincronizacionAutomatica.precios}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sincronizacionAutomatica: {
                            ...formData.sincronizacionAutomatica,
                            precios: e.target.checked,
                          },
                        })
                      }
                      className="h-5 w-5"
                    />
                    <span className="font-medium">Sincronización Automática de Precios</span>
                  </label>
                  <small className="ml-7 text-bodydark">
                    Los precios se actualizarán automáticamente cada 6 horas desde la lista "Precios Web" (solo en producción)
                  </small>
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Notas Internas
                  </label>
                  <textarea
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    rows={3}
                    placeholder="Notas privadas sobre este producto (no se muestran en la tienda)"
                    className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col gap-3 md:flex-row md:gap-4">
              <button
                type="button"
                onClick={() => navigate('/app/woocommerce/productos')}
                className="inline-flex w-full items-center justify-center gap-2 rounded border border-stroke px-6 py-3 font-medium text-black hover:bg-gray-2 dark:border-strokedark dark:text-white md:w-auto"
              >
                <FiArrowLeft /> Cancelar
              </button>

              <button
                type="submit"
                disabled={guardando}
                className="inline-flex w-full items-center justify-center gap-2 rounded bg-meta-3 px-6 py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50 md:w-auto"
              >
                <FiSave />
                {guardando
                  ? 'Guardando...'
                  : modoEdicion
                    ? 'Actualizar'
                    : articulosSeleccionados.length > 1 && indiceActual < articulosSeleccionados.length - 1
                      ? 'Guardar y Continuar'
                      : 'Guardar Borrador'
                }
              </button>

              <button
                type="button"
                onClick={handlePublicar}
                disabled={publicando || guardando}
                className="inline-flex w-full items-center justify-center gap-2 rounded bg-success px-6 py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50 md:w-auto"
              >
                <FiCheckCircle />
                {publicando ? 'Publicando...' : 'Guardar y Publicar'}
              </button>
            </div>
          </>
        )}
      </form>
    </>
  );
};

export default ProductoWebForm;
