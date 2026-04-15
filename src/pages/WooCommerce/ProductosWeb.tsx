import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { woocommerceService } from '../../services/woocommerceService';
import toast from 'react-hot-toast';
import Breadcrumb from '../../components/Breadcrumb';
import { FiPackage, FiPlus, FiRefreshCw, FiEdit, FiTrash2, FiCheck, FiXCircle, FiHelpCircle } from 'react-icons/fi';
import { dataContext } from '../../hooks/DataContext';

const roundPrecio = (valor: number): number =>
  valor >= 1 ? Math.round(valor) : parseFloat(valor.toFixed(2));

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
  const [mostrarModalAyuda, setMostrarModalAyuda] = useState(false);
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
      const precioWeb = roundPrecio(parseFloat(String(articulo.PrecioSinIVA || 0)) * 1.22);
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
        precioWeb: parseFloat(articulo?.PrecioSinIVA || 0) * 1.22,
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
    if (!confirm(
      '📋 ACTUALIZAR LISTADO\n\n' +
      'Consulta Zetasoftware y actualiza la lista de artículos con lista de precios "Precios Web" (201).\n\n' +
      '✅ Trae nuevos artículos agregados al sistema\n' +
      '✅ Actualiza precios de lista de Zetasoftware\n' +
      '❌ NO modifica ningún dato en WooCommerce\n' +
      '❌ NO cambia los precios publicados en la tienda\n\n' +
      'Puede tardar 1-2 minutos. ¿Continuar?'
    )) return;

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

  const handleRestablecerPrecio = async (codigo: string) => {
    if (!confirm(`¿Restablecer el precio de " ${codigo} " al valor actual de Zetasoftware?\nEsto eliminará el precio manual y actualizará WooCommerce.`)) return;
    try {
      await woocommerceService.restablecerPrecio(codigo);
      toast.success('Precio restablecido desde Zetasoftware');
      cargarDatos();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al restablecer precio');
    }
  };

  const handleImportarDesdeWooCommerce = async () => {
    if (!confirm(
      '🔄 IMPORTAR DESDE WOOCOMMERCE\n\n' +
      'Lee los datos reales de WooCommerce y los trae a la base de datos local.\n\n' +
      '✅ Actualiza precios publicados (si alguien editó en WooCommerce directamente)\n' +
      '✅ Actualiza stock real en tienda\n' +
      '✅ Detecta productos eliminados en WooCommerce y los marca como no publicados\n' +
      '✅ Marca como "Manual" los productos cuyo precio publicado difiere de lista\n' +
      '❌ NO modifica ningún precio en WooCommerce\n' +
      '❌ NO consulta Zetasoftware\n\n' +
      'Ideal para sincronizar después de ediciones manuales en WooCommerce. ¿Continuar?'
    )) return;
    try {
      setSyncing(true);
      toast('Importando desde WooCommerce...', { duration: 3000 });
      const response = await woocommerceService.importarDesdeWooCommerce();
      const { simples, variaciones } = response.data;
      const desincronizados = (simples.desincronizados || 0) + (variaciones.desincronizados || 0);
      toast.success(
        `Importación completada: ${simples.actualizados} simples + ${variaciones.actualizadas} variaciones actualizadas` +
        (simples.marcadosManuales > 0 ? ` · ${simples.marcadosManuales} marcados como manuales` : '') +
        (desincronizados > 0 ? ` · ⚠️ ${desincronizados} no encontrados en WC (despublicados localmente)` : '')
      );
      cargarDatos();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al importar desde WooCommerce');
    } finally {
      setSyncing(false);
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
                title="Actualizar Listado&#10;&#10;Consulta Zetasoftware y trae los artículos con lista de precios Web (201).&#10;&#10;✅ Trae nuevos productos&#10;✅ Actualiza precios de lista&#10;❌ No modifica WooCommerce"
              >
                <FiRefreshCw className={`text-base ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{refreshing ? 'Actualizando...' : 'Actualizar Listado'}</span>
                <span className="sm:hidden">Actualizar</span>
              </button>
              <button
                onClick={handleImportarDesdeWooCommerce}
                disabled={syncing}
                className="inline-flex items-center justify-center gap-1.5 rounded bg-meta-5 px-3 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50 md:gap-2 md:px-4"
                title="Importar desde WooCommerce&#10;&#10;Lee los datos reales de WooCommerce y los trae a la base de datos.&#10;&#10;✅ Actualiza precios y stock publicados&#10;✅ Detecta productos eliminados en WC&#10;❌ No modifica WooCommerce"
              >
                <FiRefreshCw className={`text-base ${syncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{syncing ? 'Importando...' : 'Importar desde WC'}</span>
                <span className="sm:hidden">Importar</span>
              </button>
              <button
                onClick={handleAbrirModalSincronizar}
                disabled={syncing}
                className="inline-flex items-center justify-center gap-1.5 rounded bg-meta-3 px-3 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50 md:gap-2 md:px-4"
                title="Sincronizar stock y precios desde Zetasoftware hacia WooCommerce"
              >
                <FiRefreshCw className={`text-base ${syncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{syncing ? 'Sincronizando...' : 'Sincronizar'}</span>
                <span className="sm:hidden">Sync</span>
              </button>
              <button
                onClick={() => setMostrarModalAyuda(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stroke text-bodydark hover:bg-gray dark:border-strokedark dark:hover:bg-meta-4"
                title="Ayuda: cómo funciona esta página"
              >
                <FiHelpCircle className="text-lg" />
              </button>
              <button
                onClick={handleEliminarTodo}
                disabled={loading}
                className="hidden inline-flex items-center justify-center gap-1.5 rounded bg-danger px-3 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50 md:gap-2 md:px-4"
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
                      <th className="hidden px-4 py-4 font-medium text-black dark:text-white text-right">Costo</th>
                      <th className="px-4 py-4 font-medium text-black dark:text-white text-right">Precio Lista Web</th>
                      <th className="px-4 py-4 font-medium text-black dark:text-white text-right">Precio Publicado</th>
                      <th className="hidden px-4 py-4 font-medium text-black dark:text-white text-right">Margen %</th>
                      <th className="hidden px-4 py-4 font-medium text-black dark:text-white text-center">IVA</th>
                      <th className="hidden px-4 py-4 font-medium text-black dark:text-white text-right">Stock</th>
                      <th className="px-4 py-4 font-medium text-black dark:text-white text-center">Sync</th>
                      <th className="px-4 py-4 font-medium text-black dark:text-white text-center">Publicado</th>
                      <th className="px-4 py-4 font-medium text-black dark:text-white text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articulosPaginados.map((articulo: any) => {
                      const productoWeb = articulo.productoWeb;
                      const configurado = articulo.configuradoWeb;
                      const productoVariable = esVariacionDeProductoVariable(articulo.Codigo);
                      const precioPublicado = configurado ? roundPrecio((productoWeb.precioWeb || 0) * 1.22) : 0;
                      const difierePrecio = configurado && Math.abs(articulo.PrecioWeb - precioPublicado) > 0.5;
                      
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
                          <td className="hidden px-4 py-4 text-right">
                            <p className="text-sm text-bodydark">
                              ${parseFloat(articulo.Costo || 0).toFixed(2)}
                            </p>
                          </td>
                          {/* Columna Precio Lista Web (Zetasoftware lista 201) */}
                          <td className="px-4 py-4 text-right">
                            <p className="text-sm font-medium text-black dark:text-white">
                              ${articulo.PrecioWeb?.toFixed(articulo.PrecioWeb >= 1 ? 0 : 2) || '0'}
                            </p>
                          </td>
                          {/* Columna Precio Publicado (precio real en WooCommerce) */}
                          <td className="px-4 py-4 text-right">
                            {configurado ? (
                              <>
                                <p className={`text-sm font-medium ${
                                  difierePrecio ? 'text-warning' : 'text-black dark:text-white'
                                }`}>
                                  ${precioPublicado.toFixed(precioPublicado >= 1 ? 0 : 2)}
                                </p>
                                {difierePrecio && (
                                  <span className="mt-0.5 inline-block rounded bg-warning bg-opacity-15 px-1.5 py-0.5 text-xs font-medium text-warning">
                                    {productoWeb?.precioManual ? 'Manual' : '≠ Lista'}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-bodydark">—</span>
                            )}
                          </td>
                          {/* Columna Margen % */}
                          <td className="hidden px-4 py-4 text-right">
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
                          <td className="hidden px-4 py-4 text-center">
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
                          <td className="hidden px-4 py-4 text-right">
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
                          {/* Columna Sync */}
                          <td className="px-4 py-4">
                            {configurado ? (
                              <div className="flex flex-col items-start gap-1 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-9 text-bodydark">Stock</span>
                                  <span className={`rounded px-1.5 py-0.5 font-medium ${
                                    productoWeb?.sincronizacionAutomatica?.stock !== false
                                      ? 'bg-success bg-opacity-15 text-success'
                                      : 'bg-danger bg-opacity-10 text-danger'
                                  }`}>
                                    {productoWeb?.sincronizacionAutomatica?.stock !== false ? 'Auto' : 'Off'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="w-9 text-bodydark">Precio</span>
                                  <span className={`rounded px-1.5 py-0.5 font-medium ${
                                    difierePrecio
                                      ? 'bg-warning bg-opacity-15 text-warning'
                                      : 'bg-success bg-opacity-15 text-success'
                                  }`}>
                                    {difierePrecio
                                      ? (productoWeb?.precioManual ? 'Manual' : '≠ Lista')
                                      : 'Auto'}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-bodydark">—</span>
                            )}
                          </td>
                          {/* Columna Publicado - Solo tick verde si está publicado */}
                          <td className="px-4 py-4 text-center">
                            {getEstadoBadge(
                              configurado,
                              productoWeb?.publicado || false,
                              productoWeb?.woocommerceId || 0
                            )}
                          </td>
                          <td className="px-4 py-4 text-center">
                            {/* Grid fijo de 3 slots: [editar] [publicar/despublicar] [eliminar] */}
                            <div className="inline-grid grid-cols-3 gap-1.5">
                              {configurado ? (
                                <>
                                  {/* Slot 1: Editar */}
                                  <button
                                    onClick={() => navigate(`/app/woocommerce/editar/${encodeURIComponent(articulo.Codigo)}`)}
                                    className="flex h-8 w-8 items-center justify-center rounded bg-primary bg-opacity-10 text-primary hover:bg-opacity-20"
                                    title="Editar configuración web"
                                  >
                                    <FiEdit className="text-base" />
                                  </button>
                                  {/* Slot 2: Publicar o Despublicar */}
                                  {!productoWeb.publicado ? (
                                    <button
                                      onClick={() => handlePublicar(articulo.Codigo)}
                                      className="flex h-8 w-8 items-center justify-center rounded bg-success bg-opacity-10 text-success hover:bg-opacity-20"
                                      title="Publicar en tienda"
                                    >
                                      <FiCheck className="text-base" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleDespublicar(articulo.Codigo)}
                                      className="flex h-8 w-8 items-center justify-center rounded bg-warning bg-opacity-10 text-warning hover:bg-opacity-20"
                                      title="Despublicar"
                                    >
                                      <FiXCircle className="text-base" />
                                    </button>
                                  )}
                                  {/* Slot 3: Restablecer si precio difiere (prioridad) | Eliminar si no publicado | vacío si no */}
                                  {difierePrecio ? (
                                    <button
                                      onClick={() => handleRestablecerPrecio(articulo.Codigo)}
                                      className="flex h-8 w-8 items-center justify-center rounded bg-warning bg-opacity-10 text-warning hover:bg-opacity-20"
                                      title={productoWeb?.precioManual ? 'Precio manual — Restablecer desde lista web' : 'Precio desactualizado — Sincronizar con lista web'}
                                    >
                                      <FiRefreshCw className="text-base" />
                                    </button>
                                  ) : !productoWeb.publicado ? (
                                    <button
                                      onClick={() => handleEliminar(articulo.Codigo)}
                                      className="flex h-8 w-8 items-center justify-center rounded bg-danger bg-opacity-10 text-danger hover:bg-opacity-20"
                                      title="Eliminar configuración"
                                    >
                                      <FiTrash2 className="text-base" />
                                    </button>
                                  ) : (
                                    <span className="h-8 w-8" />
                                  )}
                                </>
                              ) : (
                                <>
                                  {/* Slots 1 y 2 vacíos + slot 3: botón Configurar que los ocupa todos */}
                                  <div className="col-span-3 flex justify-center">
                                    <button
                                      onClick={() => {
                                        setArticulosSeleccionados(new Set([articulo.Codigo]));
                                        handleConfigurarSeleccionados();
                                      }}
                                      className="inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-opacity-90"
                                    >
                                      <FiPlus className="text-sm" /> Configurar
                                    </button>
                                  </div>
                                </>
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
      {mostrarModalAyuda && (
        <div
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setMostrarModalAyuda(false)}
        >
          <div
            className="w-full max-w-2xl rounded-lg border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-strokedark">
              <div className="flex items-center gap-2">
                <FiHelpCircle className="text-xl text-primary" />
                <h3 className="text-lg font-semibold text-black dark:text-white">Cómo mantener el listado actualizado</h3>
              </div>
              <button onClick={() => setMostrarModalAyuda(false)} className="text-bodydark hover:text-black dark:hover:text-white">
                <FiXCircle className="text-xl" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-6 py-5" style={{ maxHeight: '70vh' }}>

              {/* Botones explicados */}
              <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-stroke p-4 dark:border-strokedark">
                  <p className="mb-1 font-semibold text-black dark:text-white">📋 Actualizar Listado</p>
                  <p className="mb-2 text-xs text-bodydark">Zetasoftware → Base de datos</p>
                  <ul className="space-y-1 text-sm">
                    <li className="text-success">✅ Trae nuevos productos de Zetasoftware</li>
                    <li className="text-success">✅ Actualiza precios de lista (Lista 201)</li>
                    <li className="text-danger">❌ No modifica WooCommerce</li>
                    <li className="text-danger">❌ No cambia precios publicados</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-stroke p-4 dark:border-strokedark">
                  <p className="mb-1 font-semibold text-black dark:text-white">🔄 Importar desde WC</p>
                  <p className="mb-2 text-xs text-bodydark">WooCommerce → Base de datos</p>
                  <ul className="space-y-1 text-sm">
                    <li className="text-success">✅ Trae precios y stock reales de WooCommerce</li>
                    <li className="text-success">✅ Detecta productos eliminados en WC</li>
                    <li className="text-success">✅ Marca como manual los precios editados en WC</li>
                    <li className="text-danger">❌ No modifica WooCommerce</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-stroke p-4 dark:border-strokedark">
                  <p className="mb-1 font-semibold text-black dark:text-white">⚡ Sincronizar</p>
                  <p className="mb-2 text-xs text-bodydark">Base de datos → WooCommerce</p>
                  <ul className="space-y-1 text-sm">
                    <li className="text-success">✅ Envía stock actualizado a WooCommerce</li>
                    <li className="text-success">✅ Envía precios de lista a WooCommerce</li>
                    <li className="text-warning">⚠️ Omite productos con precio manual</li>
                    <li className="text-danger">❌ No consulta Zetasoftware</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-stroke bg-gray p-4 dark:border-strokedark dark:bg-meta-4">
                  <p className="mb-1 font-semibold text-black dark:text-white">🕐 Cron automático</p>
                  <p className="mb-2 text-xs text-bodydark">Cada 6 horas (si el servidor corre)</p>
                  <ul className="space-y-1 text-sm">
                    <li className="text-success">✅ Sincroniza stock y precios automáticamente</li>
                    <li className="text-success">✅ Aplica a simples y variaciones</li>
                    <li className="text-warning">⚠️ Omite productos con precio manual</li>
                  </ul>
                </div>
              </div>

              {/* Secuencias */}
              <h4 className="mb-3 font-semibold text-black dark:text-white">Secuencias recomendadas</h4>
              <div className="space-y-3">
                <div className="rounded-lg border-l-4 border-primary bg-primary bg-opacity-5 p-4">
                  <p className="mb-1 text-sm font-semibold text-black dark:text-white">Cambiaron precios en Zetasoftware</p>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded bg-primary px-2 py-0.5 text-white">Actualizar Listado</span>
                    <span className="text-bodydark">→</span>
                    <span className="rounded bg-meta-3 px-2 py-0.5 text-white">Sincronizar</span>
                    <span className="text-xs text-bodydark">(solo productos sin precio manual)</span>
                  </div>
                </div>
                <div className="rounded-lg border-l-4 border-meta-5 bg-meta-5 bg-opacity-5 p-4">
                  <p className="mb-1 text-sm font-semibold text-black dark:text-white">Alguien editó directamente en WooCommerce</p>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded bg-meta-5 px-2 py-0.5 text-white">Importar desde WC</span>
                    <span className="text-xs text-bodydark">(actualiza la base de datos con los valores reales)</span>
                  </div>
                </div>
                <div className="rounded-lg border-l-4 border-success bg-success bg-opacity-5 p-4">
                  <p className="mb-1 text-sm font-semibold text-black dark:text-white">Se agregaron productos nuevos en Zetasoftware</p>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded bg-primary px-2 py-0.5 text-white">Actualizar Listado</span>
                    <span className="text-bodydark">→</span>
                    <span className="rounded bg-success px-2 py-0.5 text-white">Configurar</span>
                    <span className="text-bodydark">→</span>
                    <span className="rounded bg-success px-2 py-0.5 text-white">Publicar</span>
                  </div>
                </div>
                <div className="rounded-lg border-l-4 border-warning bg-warning bg-opacity-5 p-4">
                  <p className="mb-1 text-sm font-semibold text-black dark:text-white">Mantenimiento rutinario (inicio de jornada)</p>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded bg-primary px-2 py-0.5 text-white">Actualizar Listado</span>
                    <span className="text-bodydark">→</span>
                    <span className="rounded bg-meta-3 px-2 py-0.5 text-white">Sincronizar</span>
                    <span className="text-xs text-bodydark">(el cron ya lo hace cada 6 h si el servidor corre)</span>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <h4 className="mb-3 mt-6 font-semibold text-black dark:text-white">Significado de los badges</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <span className="rounded bg-success bg-opacity-15 px-2 py-0.5 font-medium text-success">Auto</span>
                  <span className="text-bodydark">El precio publicado coincide con la lista de Zetasoftware. El cron lo actualiza automáticamente.</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded bg-warning bg-opacity-15 px-2 py-0.5 font-medium text-warning">Manual</span>
                  <span className="text-bodydark">El precio fue editado manualmente. El cron NO lo sobreescribe. Usar ↻ para restablecer.</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded bg-warning bg-opacity-15 px-2 py-0.5 font-medium text-warning">≠ Lista</span>
                  <span className="text-bodydark">El precio publicado difiere de la lista actual (posiblemente desactualizado). Usar ↻ para corregir.</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-stroke px-6 py-4 dark:border-strokedark">
              <button
                onClick={() => setMostrarModalAyuda(false)}
                className="w-full rounded bg-primary px-4 py-2 font-medium text-white hover:bg-opacity-90"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

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
