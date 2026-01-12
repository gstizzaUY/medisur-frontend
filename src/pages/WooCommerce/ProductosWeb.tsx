import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { woocommerceService } from '../../services/woocommerceService';
import toast from 'react-hot-toast';
import Breadcrumb from '../../components/Breadcrumb';
import { FiPackage, FiPlus, FiRefreshCw, FiEdit, FiTrash2, FiCheck, FiXCircle } from 'react-icons/fi';
import { dataContext } from '../../hooks/DataContext';

const ProductosWeb = () => {
  const navigate = useNavigate();
  const context = useContext(dataContext) as any;
  const { articulosConStock } = context;
  
  const [productosWeb, setProductosWeb] = useState<any[]>([]);
  const [productosVariables, setProductosVariables] = useState<any[]>([]); // Productos variables
  const [articulosPreciosWeb, setArticulosPreciosWeb] = useState<any[]>([]); // Artículos con precios web
  const [articulosSeleccionados, setArticulosSeleccionados] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [mostrarModalSincronizar, setMostrarModalSincronizar] = useState(false);
  const [opcionesSincronizacion, setOpcionesSincronizacion] = useState({
    sincronizarStock: true,
    sincronizarPrecios: true
  });
  const [vistaActual, setVistaActual] = useState<'todos' | 'configurados'>('todos');
  const [filtros, setFiltros] = useState({
    page: 1,
    limit: 50,
    publicado: '',
    search: '',
    destacado: '',
  });

  useEffect(() => {
    cargarDatos();
  }, [filtros, vistaActual]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar productos configurados en WooCommerce
      const response = await woocommerceService.listarProductos({ limit: 1000 });
      setProductosWeb(response.data.productos);

      // Cargar productos variables
      const variablesResponse = await woocommerceService.listarProductosVariables({ limit: 1000 });
      setProductosVariables(variablesResponse.data.productos || []);

      // Cargar artículos con lista de precios "Precios Web" (código 201)
      const preciosWebResponse = await woocommerceService.obtenerArticulosPreciosWeb();
      
      // Filtrar solo artículos con precio mayor a 0
      const articulosConPrecio = preciosWebResponse.filter((art: any) => 
        parseFloat(art.PrecioSinIVA || 0) > 0
      );

      // Eliminar duplicados por código de artículo
      const articulosUnicos = articulosConPrecio.reduce((acc: any[], current: any) => {
        const existe = acc.find((item: any) => item.Codigo === current.Codigo);
        if (!existe) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      setArticulosPreciosWeb(articulosUnicos);
      
    } catch (error: any) {
      console.error('Error cargando datos:', error);
      toast.error(error.response?.data?.message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  // Combinar artículos de Precios Web con stock de Medisur y productos web configurados
  const getArticulosCombinados = () => {
    if (!articulosPreciosWeb || articulosPreciosWeb.length === 0) return [];
    
    let articulosFiltrados = articulosPreciosWeb;

    // Aplicar filtro de búsqueda
    if (filtros.search) {
      const searchLower = filtros.search.toLowerCase();
      articulosFiltrados = articulosFiltrados.filter((art: any) => 
        art?.Codigo?.toLowerCase().includes(searchLower) || 
        art?.Nombre?.toLowerCase().includes(searchLower)
      );
    }

    // Combinar con datos de productos web configurados y stock de Medisur
    return articulosFiltrados.map((articulo: any) => {
      const productoWeb = productosWeb.find(p => p.codigoArticulo === articulo.Codigo);
      const articuloStock = articulosConStock?.find((a: any) => a.Codigo === articulo.Codigo);
      
      // Calcular margen %
      const costo = parseFloat(String(articuloStock?.Costo || 0));
      const precioWeb = parseFloat(String(articulo.PrecioSinIVA || 0));
      const margen = costo > 0 ? ((precioWeb - costo) / precioWeb) * 100 : 0;
      
      // Obtener IVA código
      const ivaCodigo = articulo.IVACodigo || 2; // Por defecto 22%

      return {
        Codigo: String(articulo.Codigo || ''),
        Nombre: String(articulo.Nombre || ''),
        Costo: String(articuloStock?.Costo || '0'),
        Stock: String(articuloStock?.Stock || '0'),
        PrecioWeb: precioWeb,
        Margen: margen,
        IVACodigo: ivaCodigo,
        configuradoWeb: !!productoWeb,
        productoWeb: productoWeb || null,
      };
    });
  };

  const handleSeleccionarTodos = () => {
    const articulosCombinados = getArticulosCombinados();
    const articulosFiltrados = articulosCombinados.filter((art: any) => {
      if (vistaActual === 'configurados' && !art.configuradoWeb) return false;
      if (filtros.search) {
        const search = filtros.search.toLowerCase();
        return art.Codigo.toLowerCase().includes(search) || 
               art.Nombre.toLowerCase().includes(search);
      }
      return true;
    });
    const articulosPaginados = articulosFiltrados.slice(
      (filtros.page - 1) * filtros.limit,
      filtros.page * filtros.limit
    );
    
    if (articulosSeleccionados.size === articulosPaginados.length) {
      setArticulosSeleccionados(new Set());
    } else {
      const nuevosSeleccionados = new Set(articulosPaginados.map((a: any) => a.Codigo));
      setArticulosSeleccionados(nuevosSeleccionados);
    }
  };

  const handleSeleccionarArticulo = (codigo: string) => {
    const nuevosSeleccionados = new Set(articulosSeleccionados);
    if (nuevosSeleccionados.has(codigo)) {
      nuevosSeleccionados.delete(codigo);
    } else {
      nuevosSeleccionados.add(codigo);
    }
    setArticulosSeleccionados(nuevosSeleccionados);
  };

  const handleConfigurarSeleccionados = () => {
    if (articulosSeleccionados.size === 0) {
      toast.error('Selecciona al menos un artículo');
      return;
    }
    
    // Obtener los datos completos de los artículos seleccionados (con precios web)
    const articulosCompletos = Array.from(articulosSeleccionados).map(codigo => {
      const articulo = articulosPreciosWeb.find(art => art.Codigo === codigo);
      return {
        codigo: codigo,
        nombre: articulo?.Nombre || '',
        precioWeb: parseFloat(articulo?.PrecioSinIVA || 0),
        ivaCodigo: articulo?.IVACodigo || 2
      };
    });
    
    // Navegar al formulario con los datos completos
    navigate('/app/woocommerce/nuevo', { 
      state: { articulosSeleccionados: articulosCompletos } 
    });
  };

  const handleCrearProductoVariable = () => {
    if (articulosSeleccionados.size === 0) {
      toast.error('Selecciona al menos 2 artículos para crear un producto variable');
      return;
    }
    
    if (articulosSeleccionados.size < 2) {
      toast.error('Se necesitan al menos 2 artículos para crear variaciones');
      return;
    }

    // Validar que todos los artículos seleccionados estén configurados (pero no publicados)
    const articulosConConfiguracion = Array.from(articulosSeleccionados).filter(codigo => {
      const articulo = getArticulosCombinados().find((a: any) => a.Codigo === codigo);
      return articulo?.configuradoWeb;
    });

    if (articulosConConfiguracion.length !== articulosSeleccionados.size) {
      const faltantes = articulosSeleccionados.size - articulosConConfiguracion.length;
      toast.error(
        `${faltantes} artículo(s) no están configurados.\n\n` +
        'Primero configura cada artículo con su información (foto, descripción, precio) pero NO los publiques.\n' +
        'Luego podrás crear el producto variable.'
      );
      return;
    }

    // Validar que ninguno esté publicado
    const articulosPublicados = articulosConConfiguracion.filter(codigo => {
      const articulo = getArticulosCombinados().find((a: any) => a.Codigo === codigo);
      return articulo?.productoWeb?.publicado;
    });

    if (articulosPublicados.length > 0) {
      toast.error(
        `${articulosPublicados.length} artículo(s) ya están publicados individualmente.\n\n` +
        'Para crear un producto variable, los artículos deben estar configurados pero NO publicados.'
      );
      return;
    }
    
    // Obtener los códigos para enviar al formulario
    const codigosArticulos = Array.from(articulosSeleccionados);
    
    // Navegar al formulario de producto variable
    navigate('/app/woocommerce/producto-variable/nuevo', {
      state: { codigosArticulos }
    });
  };

  const handleFiltroChange = (campo: string, valor: any) => {
    // Solo resetear a página 1 si NO es un cambio de página
    if (campo === 'page') {
      setFiltros({ ...filtros, page: valor });
    } else {
      setFiltros({ ...filtros, [campo]: valor, page: 1 });
    }
  };

  const handlePublicar = async (codigoArticulo: string) => {
    if (!confirm('¿Deseas publicar este producto en WooCommerce?')) return;

    try {
      await woocommerceService.publicarProducto(codigoArticulo);
      toast.success('Producto publicado exitosamente');
      cargarDatos();
    } catch (error: any) {
      console.error('Error publicando producto:', error);
      toast.error(error.response?.data?.message || 'Error al publicar producto');
    }
  };

  const handleDespublicar = async (codigoArticulo: string) => {
    const eliminar = confirm(
      '¿Deseas eliminar el producto de WooCommerce?\n\nSí: Eliminar completamente\nNo: Solo marcar como no publicado'
    );

    try {
      await woocommerceService.despublicarProducto(codigoArticulo, eliminar);
      toast.success(eliminar ? 'Producto eliminado' : 'Producto despublicado');
      cargarDatos();
    } catch (error: any) {
      console.error('Error despublicando producto:', error);
      toast.error(error.response?.data?.message || 'Error al despublicar');
    }
  };

  const handleEliminar = async (codigoArticulo: string) => {
    if (!confirm('¿Deseas eliminar la configuración de este producto?')) return;

    try {
      await woocommerceService.eliminarProducto(codigoArticulo);
      toast.success('Producto eliminado');
      cargarDatos();
    } catch (error: any) {
      console.error('Error eliminando producto:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar');
    }
  };

  const handleAbrirModalSincronizar = () => {
    setMostrarModalSincronizar(true);
  };

  const handleSincronizarTodo = async () => {
    if (!opcionesSincronizacion.sincronizarStock && !opcionesSincronizacion.sincronizarPrecios) {
      toast.error('Selecciona al menos una opción de sincronización');
      return;
    }

    setMostrarModalSincronizar(false);

    try {
      setSyncing(true);
      const response = await woocommerceService.sincronizarTodo(opcionesSincronizacion);
      toast.success(`${response.data.totalSincronizados} productos sincronizados`);
      cargarDatos();
    } catch (error: any) {
      console.error('Error sincronizando:', error);
      toast.error(error.response?.data?.message || 'Error en sincronización');
    } finally {
      setSyncing(false);
    }
  };

  const handleRefrescarPrecios = async () => {
    if (!confirm('¿Actualizar lista de productos desde Zetasoftware?\n\nEsto puede tardar 1-2 minutos y traerá los últimos productos agregados.')) return;

    try {
      setRefreshing(true);
      toast('Actualizando listado... Esto puede tardar un momento.', { duration: 3000 });
      
      const response = await woocommerceService.refrescarCachePreciosWeb();
      
      if (response.success) {
        toast.success(`✅ ${response.data.totalArticulos} productos actualizados`);
        // Recargar datos
        cargarDatos();
      } else {
        toast.error(response.message || 'Error actualizando precios');
      }
    } catch (error: any) {
      console.error('Error refrescando caché:', error);
      if (error.response?.status === 409) {
        toast.error('Ya hay una actualización en progreso. Por favor espera.');
      } else {
        toast.error(error.response?.data?.message || 'Error actualizando listado');
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleEliminarTodo = async () => {
    // Primera confirmación
    const confirmar1 = confirm(
      '⚠️ ADVERTENCIA ⚠️\n\n' +
      'Esto eliminará TODOS los productos configurados:\n' +
      '• De la base de datos MongoDB\n' +
      '• De WooCommerce\n\n' +
      '¿Estás ABSOLUTAMENTE seguro?\n\n' +
      'Escribe "ELIMINAR TODO" en el siguiente cuadro para confirmar.'
    );

    if (!confirmar1) return;

    // Segunda confirmación con texto
    const textoConfirmacion = prompt(
      'Para confirmar, escribe exactamente:\nELIMINAR TODO'
    );

    if (textoConfirmacion !== 'ELIMINAR TODO') {
      toast.error('Cancelado. El texto no coincide.');
      return;
    }

    try {
      setLoading(true);
      const response = await woocommerceService.eliminarTodosProductos();
      
      toast.success(
        `✅ Eliminación completada:\n` +
        `• Productos en BD: ${response.data.totalProductos}\n` +
        `• Eliminados de WooCommerce: ${response.data.eliminadosWooCommerce}\n` +
        `• Eliminados de BD: ${response.data.eliminadosBD}`
      );
      
      // Recargar datos
      cargarDatos();
    } catch (error: any) {
      console.error('Error eliminando todos los productos:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar productos');
    } finally {
      setLoading(false);
    }
  };

  // Verificar si un producto es parte de un producto variable publicado
  const esVariacionDeProductoVariable = (codigoArticulo: string) => {
    return productosVariables.find((prodVar: any) => {
      if (!prodVar.publicado) return false;
      return prodVar.variaciones?.some((v: any) => v.codigoArticulo === codigoArticulo);
    });
  };

  const getEstadoBadge = (configurado: boolean, publicado: boolean, woocommerceId: number) => {
    // Solo mostrar tick verde si está publicado
    if (configurado && publicado && woocommerceId) {
      return (
        <FiCheck className="text-2xl text-success" />
      );
    }
    
    // No mostrar nada si no está publicado
    return null;
  };

  // Calcular artículos paginados
  const articulosCombinados = getArticulosCombinados();
  const articulosFiltrados = articulosCombinados.filter((art: any) => {
    if (vistaActual === 'configurados' && !art.configuradoWeb) return false;
    if (filtros.search) {
      const search = filtros.search.toLowerCase();
      return art.Codigo.toLowerCase().includes(search) || 
             art.Nombre.toLowerCase().includes(search);
    }
    return true;
  });
  
  const totalPaginas = Math.ceil(articulosFiltrados.length / filtros.limit);
  const articulosPaginados = articulosFiltrados.slice(
    (filtros.page - 1) * filtros.limit,
    filtros.page * filtros.limit
  );

  return (
    <>
      <Breadcrumb pageName="Productos Tienda CliniMarket" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Header */}
        <div className="border-b border-stroke px-4 py-4 dark:border-strokedark md:px-7">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <FiPackage className="text-2xl text-primary" />
              <h3 className="text-base font-medium text-black dark:text-white md:text-lg">
                
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/app/woocommerce/productos-variables')}
                className="inline-flex items-center justify-center gap-1.5 rounded bg-meta-5 px-3 py-2 text-sm font-medium text-white hover:bg-opacity-90 md:gap-2 md:px-4"
                title="Gestionar productos con variaciones (tallas, colores, etc.)"
              >
                <FiPackage className="text-base" />
                <span className="hidden sm:inline">Productos Variables</span>
                <span className="sm:hidden">Variables</span>
              </button>
              {articulosSeleccionados.size > 0 && (
                <>
                  <button
                    onClick={handleConfigurarSeleccionados}
                    className="inline-flex items-center justify-center gap-1.5 rounded bg-success px-3 py-2 text-sm font-medium text-white hover:bg-opacity-90 md:gap-2 md:px-4"
                  >
                    <FiEdit className="text-base" />
                    <span className="hidden sm:inline">Configurar {articulosSeleccionados.size}</span>
                    <span className="sm:hidden">Config. ({articulosSeleccionados.size})</span>
                  </button>
                  {articulosSeleccionados.size >= 2 && (
                    <button
                      onClick={handleCrearProductoVariable}
                      className="inline-flex items-center justify-center gap-1.5 rounded bg-meta-5 px-3 py-2 text-sm font-medium text-white hover:bg-opacity-90 md:gap-2 md:px-4"
                      title="Crear un producto con variaciones (tallas, colores, etc.)"
                    >
                      <FiPackage className="text-base" />
                      <span className="hidden sm:inline">Crear Variable</span>
                      <span className="sm:hidden">Variable</span>
                    </button>
                  )}
                </>
              )}
              <button
                onClick={handleRefrescarPrecios}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-1.5 rounded bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50 md:gap-2 md:px-4"
                title="Actualizar lista de productos desde Zetasoftware"
              >
                <FiRefreshCw className={`text-base ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{refreshing ? 'Actualizando...' : 'Actualizar Listado'}</span>
                <span className="sm:hidden">Actualizar</span>
              </button>
              <button
                onClick={handleAbrirModalSincronizar}
                disabled={syncing}
                className="inline-flex items-center justify-center gap-1.5 rounded bg-meta-3 px-3 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50 md:gap-2 md:px-4"
                title="Sincronizar stock y precios de productos publicados con Medisur"
              >
                <FiRefreshCw className={`text-base ${syncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{syncing ? 'Sincronizando...' : 'Sincronizar'}</span>
                <span className="sm:hidden">Sync</span>
              </button>
              <button
                onClick={handleEliminarTodo}
                disabled={loading}
                className="inline-flex items-center justify-center gap-1.5 rounded bg-danger px-3 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50 md:gap-2 md:px-4"
                title="Eliminar TODOS los productos de BD y WooCommerce"
              >
                <FiTrash2 className="text-base" />
                <span className="hidden sm:inline">Eliminar Todo</span>
                <span className="sm:hidden">Eliminar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Vista y Filtros */}
        <div className="border-b border-stroke px-4 py-4 dark:border-strokedark md:px-7">
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setVistaActual('todos')}
              className={`rounded px-4 py-2 font-medium ${
                vistaActual === 'todos'
                  ? 'bg-primary text-white'
                  : 'bg-gray text-black dark:bg-meta-4 dark:text-white'
              }`}
            >
              Todos los productos ({articulosPreciosWeb.length})
            </button>
            <button
              onClick={() => setVistaActual('configurados')}
              className={`rounded px-4 py-2 font-medium ${
                vistaActual === 'configurados'
                  ? 'bg-primary text-white'
                  : 'bg-gray text-black dark:bg-meta-4 dark:text-white'
              }`}
            >
              Configurados ({productosWeb.length})
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <input
                type="text"
                placeholder="Buscar por código o nombre..."
                value={filtros.search}
                onChange={(e) => handleFiltroChange('search', e.target.value)}
                className="w-full rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              />
            </div>
            <div>
              <button
                onClick={() => setFiltros({ page: 1, limit: 20, publicado: '', search: '', destacado: '' })}
                className="w-full rounded border border-stroke bg-gray px-4 py-2 text-black hover:bg-opacity-90 dark:border-strokedark dark:bg-meta-4 dark:text-white"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="p-4 md:p-7">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
            </div>
          ) : articulosPaginados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <FiPackage className="text-6xl text-bodydark" />
              <p className="mt-4 text-lg text-bodydark">
                {vistaActual === 'todos' 
                  ? 'No hay productos disponibles' 
                  : 'No hay productos configurados. Selecciona productos y configúralos para la tienda web.'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Paginación Superior */}
              {totalPaginas > 1 && (
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-bodydark">
                    Mostrando {((filtros.page - 1) * filtros.limit) + 1} a{' '}
                    {Math.min(filtros.page * filtros.limit, articulosFiltrados.length)} de{' '}
                    {articulosFiltrados.length} productos
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFiltroChange('page', filtros.page - 1)}
                      disabled={filtros.page === 1}
                      className="rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <span className="flex items-center px-3 text-sm text-bodydark">
                      Página {filtros.page} de {totalPaginas}
                    </span>
                    <button
                      onClick={() => handleFiltroChange('page', filtros.page + 1)}
                      disabled={filtros.page >= totalPaginas}
                      className="rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90 disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                      <th className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={articulosPaginados.every((art: any) => 
                            articulosSeleccionados.has(art.Codigo)
                          )}
                          onChange={handleSeleccionarTodos}
                          className="h-4 w-4"
                        />
                      </th>
                      <th className="px-4 py-4 font-medium text-black dark:text-white">Código</th>
                      <th className="px-4 py-4 font-medium text-black dark:text-white">Producto</th>
                      <th className="px-4 py-4 font-medium text-black dark:text-white text-right">Costo</th>
                      <th className="px-4 py-4 font-medium text-black dark:text-white text-right">Precio Venta Web</th>
                      <th className="px-4 py-4 font-medium text-black dark:text-white text-right">Margen %</th>
                      <th className="px-4 py-4 font-medium text-black dark:text-white text-center">IVA</th>
                      <th className="px-4 py-4 font-medium text-black dark:text-white text-right">Stock</th>
                      <th className="px-4 py-4 font-medium text-black dark:text-white text-center">Publicado</th>
                      <th className="px-4 py-4 font-medium text-black dark:text-white">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articulosPaginados.map((articulo: any) => {
                      const productoWeb = articulo.productoWeb;
                      const configurado = articulo.configuradoWeb;
                      const productoVariable = esVariacionDeProductoVariable(articulo.Codigo);
                      
                      return (
                        <tr
                          key={articulo.Codigo}
                          className={`border-b border-stroke dark:border-strokedark ${
                            productoVariable ? 'bg-meta-5 bg-opacity-5' : ''
                          }`}
                        >
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={articulosSeleccionados.has(articulo.Codigo)}
                              onChange={() => handleSeleccionarArticulo(articulo.Codigo)}
                              className="h-4 w-4"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-sm font-medium text-black dark:text-white">
                              {articulo.Codigo}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              {productoWeb?.imagenes?.[0]?.url && (
                                <img
                                  src={productoWeb.imagenes[0].url}
                                  alt={articulo.Nombre}
                                  className="h-12 w-12 rounded object-cover"
                                />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-black dark:text-white">
                                    {articulo.Nombre}
                                  </p>
                                  {productoVariable && (
                                    <span className="inline-flex items-center gap-1 rounded bg-meta-5 px-2 py-0.5 text-xs font-medium text-white" title={`Variación de: ${productoVariable.nombre}`}>
                                      <FiPackage className="text-xs" /> Variable
                                    </span>
                                  )}
                                </div>
                                {productoWeb?.nombreWeb && productoWeb.nombreWeb !== articulo.Nombre && (
                                  <p className="text-xs text-bodydark">
                                    Web: {productoWeb.nombreWeb}
                                  </p>
                                )}
                                {productoVariable && (
                                  <p className="text-xs text-meta-5">
                                    Parte de: {productoVariable.nombre}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          {/* Columna Costo */}
                          <td className="px-4 py-4 text-right">
                            <p className="text-sm text-bodydark">
                              ${parseFloat(articulo.Costo || 0).toFixed(2)}
                            </p>
                          </td>
                          {/* Columna Precio Venta Web */}
                          <td className="px-4 py-4 text-right">
                            <p className="text-sm font-medium text-black dark:text-white">
                              ${articulo.PrecioWeb?.toFixed(2) || '0.00'}
                            </p>
                          </td>
                          {/* Columna Margen % */}
                          <td className="px-4 py-4 text-right">
                            {(() => {
                              const margen = articulo.Margen || 0;
                              const colorClase = 
                                margen < 10 ? 'text-danger' : 
                                margen < 20 ? 'text-warning' : 
                                'text-success';
                              return (
                                <p className={`text-sm font-medium ${colorClase}`}>
                                  {margen.toFixed(1)}%
                                </p>
                              );
                            })()}
                          </td>
                          {/* Columna IVA */}
                          <td className="px-4 py-4 text-center">
                            {(() => {
                              const ivaCodigo = articulo.IVACodigo || productoWeb?.ivaCodigo || 2;
                              const ivaTexto = ivaCodigo === 1 ? '10%' : ivaCodigo === 3 ? '0%' : '22%';
                              const colorClase = 
                                ivaCodigo === 1 ? 'text-warning' : 
                                ivaCodigo === 3 ? 'text-meta-3' : 
                                'text-black dark:text-white';
                              return (
                                <p className={`text-sm font-medium ${colorClase}`}>
                                  {ivaTexto}
                                </p>
                              );
                            })()}
                          </td>
                          {/* Columna Stock */}
                          <td className="px-4 py-4 text-right">
                            {(() => {
                              const stock = Math.floor(parseFloat(articulo.Stock || 0));
                              const colorClase = 
                                stock === 0 ? 'text-danger' : 
                                stock < 10 ? 'text-warning' : 
                                'text-success';
                              return (
                                <p className={`text-sm font-medium ${colorClase}`}>
                                  {stock}
                                </p>
                              );
                            })()}
                          </td>
                          {/* Columna Publicado - Solo tick verde si está publicado */}
                          <td className="px-4 py-4 text-center">
                            {getEstadoBadge(
                              configurado,
                              productoWeb?.publicado || false,
                              productoWeb?.woocommerceId || 0
                            )}
                          </td>
                          <td className="px-2 py-4 md:px-4">
                            <div className="flex items-center justify-center gap-2">
                              {configurado ? (
                                <>
                                  <button
                                    onClick={() => navigate(`/app/woocommerce/editar/${encodeURIComponent(articulo.Codigo)}`)}
                                    className="flex h-8 w-8 items-center justify-center rounded bg-primary bg-opacity-10 text-primary hover:bg-opacity-20"
                                    title="Editar configuración web"
                                  >
                                    <FiEdit className="text-base" />
                                  </button>
                                  {!productoWeb.publicado ? (
                                    <>
                                      <button
                                        onClick={() => handlePublicar(articulo.Codigo)}
                                        className="flex h-8 w-8 items-center justify-center rounded bg-success bg-opacity-10 text-success hover:bg-opacity-20"
                                        title="Publicar en tienda"
                                      >
                                        <FiCheck className="text-base" />
                                      </button>
                                      <button
                                        onClick={() => handleEliminar(articulo.Codigo)}
                                        className="flex h-8 w-8 items-center justify-center rounded bg-danger bg-opacity-10 text-danger hover:bg-opacity-20"
                                        title="Eliminar configuración"
                                      >
                                        <FiTrash2 className="text-base" />
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => handleDespublicar(articulo.Codigo)}
                                      className="flex h-8 w-8 items-center justify-center rounded bg-warning bg-opacity-10 text-warning hover:bg-opacity-20"
                                      title="Despublicar"
                                    >
                                      <FiXCircle className="text-base" />
                                    </button>
                                  )}
                                </>
                              ) : (
                                <button
                                  onClick={() => {
                                    setArticulosSeleccionados(new Set([articulo.Codigo]));
                                    handleConfigurarSeleccionados();
                                  }}
                                  className="inline-flex items-center gap-1 rounded bg-primary px-2 py-1.5 text-xs font-medium text-white hover:bg-opacity-90 md:px-3 md:text-sm"
                                >
                                  <FiPlus className="text-sm" /> Configurar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Paginación Inferior */}
              {totalPaginas > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-bodydark">
                    Mostrando {((filtros.page - 1) * filtros.limit) + 1} a{' '}
                    {Math.min(filtros.page * filtros.limit, articulosFiltrados.length)} de{' '}
                    {articulosFiltrados.length} productos
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFiltroChange('page', filtros.page - 1)}
                      disabled={filtros.page === 1}
                      className="rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <span className="flex items-center px-3 text-sm text-bodydark">
                      Página {filtros.page} de {totalPaginas}
                    </span>
                    <button
                      onClick={() => handleFiltroChange('page', filtros.page + 1)}
                      disabled={filtros.page >= totalPaginas}
                      className="rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90 disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Sincronización */}
      {mostrarModalSincronizar && (
        <div
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setMostrarModalSincronizar(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-stroke bg-white p-6 shadow-lg dark:border-strokedark dark:bg-boxdark"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
              Sincronizar Productos con WooCommerce
            </h3>
            <p className="mb-6 text-sm text-bodydark">
              Selecciona qué información deseas sincronizar desde Medisur hacia WooCommerce:
            </p>
            <div className="mb-6 space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={opcionesSincronizacion.sincronizarStock}
                  onChange={(e) =>
                    setOpcionesSincronizacion({
                      ...opcionesSincronizacion,
                      sincronizarStock: e.target.checked,
                    })
                  }
                  className="h-5 w-5"
                />
                <span className="text-sm font-medium text-black dark:text-white">
                  Sincronizar Stock
                </span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={opcionesSincronizacion.sincronizarPrecios}
                  onChange={(e) =>
                    setOpcionesSincronizacion({
                      ...opcionesSincronizacion,
                      sincronizarPrecios: e.target.checked,
                    })
                  }
                  className="h-5 w-5"
                />
                <span className="text-sm font-medium text-black dark:text-white">
                  Sincronizar Precios
                </span>
              </label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setMostrarModalSincronizar(false)}
                className="flex-1 rounded border border-stroke px-4 py-2 font-medium text-black hover:bg-gray dark:border-strokedark dark:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleSincronizarTodo}
                disabled={!opcionesSincronizacion.sincronizarStock && !opcionesSincronizacion.sincronizarPrecios}
                className="flex-1 rounded bg-meta-3 px-4 py-2 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
              >
                Sincronizar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductosWeb;
