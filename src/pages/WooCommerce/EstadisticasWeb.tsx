import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { woocommerceService } from '../../services/woocommerceService';
import toast from 'react-hot-toast';
import Breadcrumb from '../../components/Breadcrumb';
import { 
  FiPackage, 
  FiCheckCircle, 
  FiEdit, 
  FiStar, 
  FiRefreshCw, 
  FiAlertTriangle,
  FiImage,
  FiFileText,
  FiTag,
  FiDollarSign,
  FiTrendingUp
} from 'react-icons/fi';
import { Estadisticas } from '../../types/estadisticas';

const EstadisticasWeb = () => {
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const response = await woocommerceService.obtenerEstadisticas();
      setEstadisticas(response.data);
    } catch (error: any) {
      console.error('Error cargando estadísticas:', error);
      toast.error(error.response?.data?.message || 'Error cargando estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const getSeveridadColor = (severidad: string) => {
    switch (severidad) {
      case 'alta':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'media':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSeveridadIcon = (severidad: string) => {
    switch (severidad) {
      case 'alta':
        return <FiAlertTriangle className="text-red-600 dark:text-red-400" />;
      case 'media':
        return <FiAlertTriangle className="text-yellow-600 dark:text-yellow-400" />;
      case 'info':
        return <FiCheckCircle className="text-blue-600 dark:text-blue-400" />;
      default:
        return <FiAlertTriangle className="text-gray-600 dark:text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!estadisticas) {
    return null;
  }

  return (
    <>
      <Breadcrumb pageName="Estadísticas Publicaciones Clinimarket" />

      {/* Métricas principales */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        {/* Total de Productos */}
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <FiPackage className="text-primary" size={22} />
              </div>
            </div>
            <div className="text-right">
              <h4 className="text-title-md font-bold text-black dark:text-white">
                {estadisticas.totalProductos}
              </h4>
              <span className="text-sm font-medium">Total Productos</span>
            </div>
          </div>
        </div>

        {/* Publicados */}
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <FiCheckCircle className="text-success" size={22} />
              </div>
            </div>
            <div className="text-right">
              <h4 className="text-title-md font-bold text-black dark:text-white">
                {estadisticas.productosPublicados}
              </h4>
              <span className="text-sm font-medium">Publicados</span>
              <div className="mt-1 text-xs text-meta-3">
                {estadisticas.totalProductos > 0
                  ? Math.round((estadisticas.productosPublicados / estadisticas.totalProductos) * 100)
                  : 0}% del total
              </div>
            </div>
          </div>
        </div>

        {/* Borradores */}
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <FiEdit className="text-warning" size={22} />
              </div>
            </div>
            <div className="text-right">
              <h4 className="text-title-md font-bold text-black dark:text-white">
                {estadisticas.productosBorrador}
              </h4>
              <span className="text-sm font-medium">Borradores</span>
            </div>
          </div>
        </div>

        {/* Valor del Inventario */}
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <FiDollarSign className="text-meta-3" size={22} />
              </div>
            </div>
            <div className="text-right">
              <h4 className="text-title-md font-bold text-black dark:text-white">
                ${estadisticas.valorInventario.toLocaleString()}
              </h4>
              <span className="text-sm font-medium">Valor Inventario</span>
              <div className="mt-1 text-xs text-bodydark">
                productos publicados
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas y Problemas */}
      {estadisticas.alertas && estadisticas.alertas.length > 0 && (
        <div className="mt-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
            <h3 className="flex items-center gap-2 font-medium text-black dark:text-white">
              <FiAlertTriangle size={20} />
              Alertas y Acciones Recomendadas
            </h3>
          </div>
          <div className="p-7">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {estadisticas.alertas.map((alerta, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 rounded-lg p-4 ${getSeveridadColor(alerta.severidad)}`}
                >
                  <div className="mt-0.5">{getSeveridadIcon(alerta.severidad)}</div>
                  <div className="flex-1">
                    <p className="font-medium">{alerta.mensaje}</p>
                    {alerta.tipo === 'listos-publicar' && (
                      <button
                        onClick={() => navigate('/woocommerce/productos')}
                        className="mt-2 text-xs font-semibold underline hover:no-underline"
                      >
                        Ver productos →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Métricas de Calidad */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:gap-7.5">
        {/* Calidad Promedio */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
            <h3 className="flex items-center gap-2 font-medium text-black dark:text-white">
              <FiTrendingUp size={18} />
              Calidad Promedio
            </h3>
          </div>
          <div className="p-7">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-3xl font-bold text-black dark:text-white">
                {estadisticas.calidadPromedio}%
              </span>
              <div className={`text-sm font-semibold ${
                estadisticas.calidadPromedio >= 80 ? 'text-success' :
                estadisticas.calidadPromedio >= 60 ? 'text-warning' : 'text-danger'
              }`}>
                {estadisticas.calidadPromedio >= 80 ? 'Excelente' :
                 estadisticas.calidadPromedio >= 60 ? 'Bueno' : 'Necesita mejora'}
              </div>
            </div>
            <div className="relative h-2 w-full rounded-full bg-gray-200 dark:bg-meta-4">
              <div
                className={`h-2 rounded-full ${
                  estadisticas.calidadPromedio >= 80 ? 'bg-success' :
                  estadisticas.calidadPromedio >= 60 ? 'bg-warning' : 'bg-danger'
                }`}
                style={{ width: `${estadisticas.calidadPromedio}%` }}
              ></div>
            </div>
            <p className="mt-3 text-xs text-bodydark">
              Basado en completitud de imágenes, descripciones y categorías
            </p>
          </div>
        </div>

        {/* Productos con Imágenes */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
            <h3 className="flex items-center gap-2 font-medium text-black dark:text-white">
              <FiImage size={18} />
              Imágenes
            </h3>
          </div>
          <div className="p-7">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xl font-bold text-black dark:text-white">
                {estadisticas.productosConImagenes} / {estadisticas.totalProductos}
              </span>
              <span className="text-sm font-semibold text-meta-3">
                {estadisticas.porcentajeConImagenes}%
              </span>
            </div>
            <div className="relative h-2 w-full rounded-full bg-gray-200 dark:bg-meta-4">
              <div
                className="h-2 rounded-full bg-meta-3"
                style={{ width: `${estadisticas.porcentajeConImagenes}%` }}
              ></div>
            </div>
            {estadisticas.productosSinImagenes > 0 && (
              <p className="mt-3 text-xs text-danger">
                {estadisticas.productosSinImagenes} producto{estadisticas.productosSinImagenes > 1 ? 's' : ''} sin imágenes
              </p>
            )}
          </div>
        </div>

        {/* Productos con Descripción */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
            <h3 className="flex items-center gap-2 font-medium text-black dark:text-white">
              <FiFileText size={18} />
              Descripciones
            </h3>
          </div>
          <div className="p-7">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xl font-bold text-black dark:text-white">
                {estadisticas.productosConDescripcion} / {estadisticas.totalProductos}
              </span>
              <span className="text-sm font-semibold text-meta-3">
                {estadisticas.porcentajeConDescripcion}%
              </span>
            </div>
            <div className="relative h-2 w-full rounded-full bg-gray-200 dark:bg-meta-4">
              <div
                className="h-2 rounded-full bg-meta-3"
                style={{ width: `${estadisticas.porcentajeConDescripcion}%` }}
              ></div>
            </div>
            {estadisticas.productosSinDescripcion > 0 && (
              <p className="mt-3 text-xs text-danger">
                {estadisticas.productosSinDescripcion} producto{estadisticas.productosSinDescripcion > 1 ? 's' : ''} sin descripción
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Detalles de Productos */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Detalles de Productos
            </h3>
          </div>
          <div className="p-7">
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-sm border border-stroke bg-gray-2 p-4 dark:border-strokedark dark:bg-meta-4">
                <div className="flex items-center gap-3">
                  <FiStar className="text-meta-6" size={20} />
                  <span className="font-medium text-black dark:text-white">Destacados</span>
                </div>
                <span className="text-xl font-bold text-black dark:text-white">
                  {estadisticas.productosDestacados}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-sm border border-stroke bg-gray-2 p-4 dark:border-strokedark dark:bg-meta-4">
                <div className="flex items-center gap-3">
                  <FiCheckCircle className="text-success" size={20} />
                  <span className="font-medium text-black dark:text-white">Listos para Publicar</span>
                </div>
                <span className="text-xl font-bold text-black dark:text-white">
                  {estadisticas.productosListosParaPublicar}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-sm border border-stroke bg-gray-2 p-4 dark:border-strokedark dark:bg-meta-4">
                <div className="flex items-center gap-3">
                  <FiTag className="text-warning" size={20} />
                  <span className="font-medium text-black dark:text-white">Sin Categoría</span>
                </div>
                <span className="text-xl font-bold text-black dark:text-white">
                  {estadisticas.productosSinCategoria}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Última Sincronización */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
            <h3 className="flex items-center gap-2 font-medium text-black dark:text-white">
              <FiRefreshCw size={18} />
              Sincronización
            </h3>
          </div>
          <div className="p-7">
            {estadisticas.ultimaSincronizacion ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-bodydark">Último producto sincronizado:</p>
                  <p className="mt-1 font-semibold text-black dark:text-white">
                    {estadisticas.ultimaSincronizacion.producto}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-bodydark">Fecha:</p>
                  <p className="mt-1 font-medium text-black dark:text-white">
                    {new Date(estadisticas.ultimaSincronizacion.fecha).toLocaleString('es-UY', {
                      dateStyle: 'full',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <button
                  onClick={cargarEstadisticas}
                  className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-opacity-90"
                >
                  <FiRefreshCw size={16} />
                  Actualizar Estadísticas
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FiRefreshCw className="mb-3 text-bodydark" size={40} />
                <p className="text-bodydark">No hay sincronizaciones registradas</p>
                <button
                  onClick={cargarEstadisticas}
                  className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-opacity-90"
                >
                  <FiRefreshCw size={16} />
                  Actualizar Estadísticas
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EstadisticasWeb;
