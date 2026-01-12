import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { woocommerceService } from '../../services/woocommerceService';
import toast from 'react-hot-toast';
import Breadcrumb from '../../components/Breadcrumb';
import { FiPackage, FiPlus, FiEdit, FiTrash2, FiCheck, FiXCircle } from 'react-icons/fi';

const ProductosVariables = () => {
  const navigate = useNavigate();
  
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    page: 1,
    limit: 50,
    publicado: '',
    search: '',
  });

  useEffect(() => {
    cargarProductos();
  }, [filtros]);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const response = await woocommerceService.listarProductosVariables(filtros);
      setProductos(response.data.productos);
    } catch (error: any) {
      console.error('Error cargando productos variables:', error);
      toast.error(error.response?.data?.message || 'Error cargando productos');
    } finally {
      setLoading(false);
    }
  };

  const handlePublicar = async (id: string) => {
    if (!confirm('¿Deseas publicar este producto variable en WooCommerce?\n\nEsto creará el producto padre y todas sus variaciones.')) return;

    try {
      const toastId = toast.loading('Publicando producto y variaciones...');
      const response = await woocommerceService.publicarProductoVariable(id);
      toast.dismiss(toastId);
      toast.success(`✅ Producto publicado con ${response.data.totalVariaciones} variaciones`);
      cargarProductos();
    } catch (error: any) {
      console.error('Error publicando producto:', error);
      toast.error(error.response?.data?.message || 'Error al publicar producto');
    }
  };

  const handleDespublicar = async (id: string, nombre: string) => {
    if (!confirm(`⚠️ ¿Estás seguro de despublicar "${nombre}"?\n\nEsto eliminará:\n- El producto de WooCommerce\n- Todas las variaciones\n- Los IDs almacenados\n\nEl producto quedará como borrador y podrás volver a publicarlo.`)) return;

    try {
      const toastId = toast.loading('Despublicando producto...');
      await woocommerceService.despublicarProductoVariable(id);
      toast.dismiss(toastId);
      toast.success('✅ Producto despublicado correctamente');
      cargarProductos();
    } catch (error: any) {
      console.error('Error despublicando producto:', error);
      toast.error(error.response?.data?.message || 'Error al despublicar producto');
    }
  };

  const handleFiltroChange = (campo: string, valor: any) => {
    if (campo === 'page') {
      setFiltros({ ...filtros, page: valor });
    } else {
      setFiltros({ ...filtros, [campo]: valor, page: 1 });
    }
  };

  const totalVariaciones = (variaciones: any[]) => {
    return variaciones?.filter((v: any) => v.activo !== false).length || 0;
  };

  const obtenerAtributosTexto = (atributos: any[]) => {
    if (!atributos || atributos.length === 0) return '';
    return atributos.map((attr: any) => `${attr.nombre}: ${attr.valores.join(', ')}`).join(' | ');
  };

  return (
    <>
      <Breadcrumb pageName="Productos Variables WooCommerce" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Header */}
        <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiPackage className="text-2xl text-primary" />
              <h3 className="font-medium text-black dark:text-white">
                Productos Variables (con Variaciones)
              </h3>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/app/woocommerce/producto-variable/nuevo')}
                className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 font-medium text-white hover:bg-opacity-90"
              >
                <FiPlus /> Nuevo Producto Variable
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <input
                type="text"
                placeholder="Buscar por nombre o SKU..."
                value={filtros.search}
                onChange={(e) => handleFiltroChange('search', e.target.value)}
                className="w-full rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              />
            </div>
            <div>
              <select
                value={filtros.publicado}
                onChange={(e) => handleFiltroChange('publicado', e.target.value)}
                className="w-full rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              >
                <option value="">Todos los estados</option>
                <option value="true">Publicados</option>
                <option value="false">No publicados</option>
              </select>
            </div>
            <div>
              <button
                onClick={() => setFiltros({ page: 1, limit: 50, publicado: '', search: '' })}
                className="w-full rounded border border-stroke bg-gray px-4 py-2 text-black hover:bg-opacity-90 dark:border-strokedark dark:bg-meta-4 dark:text-white"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="p-7">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
            </div>
          ) : productos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <FiPackage className="text-6xl text-bodydark" />
              <p className="mt-4 text-lg text-bodydark">
                No hay productos variables configurados
              </p>
              <p className="mt-2 text-sm text-bodydark">
                Crea un producto variable para agrupar variaciones como tallas, colores, etc.
              </p>
              <button
                onClick={() => navigate('/app/woocommerce/producto-variable/nuevo')}
                className="mt-4 inline-flex items-center gap-2 rounded bg-primary px-4 py-2 font-medium text-white hover:bg-opacity-90"
              >
                <FiPlus /> Crear Primer Producto Variable
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="px-4 py-4 font-medium text-black dark:text-white">Producto</th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">Atributos</th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white text-center">Variaciones</th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white text-center">Estado</th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto: any) => (
                    <tr
                      key={producto._id}
                      className="border-b border-stroke dark:border-strokedark"
                    >
                      {/* Producto */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {producto.imagenes?.[0]?.url && (
                            <img
                              src={producto.imagenes[0].url}
                              alt={producto.nombre}
                              className="h-12 w-12 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-black dark:text-white">
                              {producto.nombreWeb || producto.nombre}
                            </p>
                            {producto.nombreWeb && producto.nombreWeb !== producto.nombre && (
                              <p className="text-xs text-bodydark">
                                Interno: {producto.nombre}
                              </p>
                            )}
                            {producto.destacado && (
                              <span className="inline-block rounded bg-warning px-2 py-0.5 text-xs text-white">
                                Destacado
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Atributos */}
                      <td className="px-4 py-4">
                        <p className="text-sm text-bodydark">
                          {obtenerAtributosTexto(producto.atributos)}
                        </p>
                      </td>

                      {/* Variaciones */}
                      <td className="px-4 py-4 text-center">
                        <span className="inline-block rounded-full bg-primary px-3 py-1 text-sm font-medium text-white">
                          {totalVariaciones(producto.variaciones)}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-4 text-center">
                        {producto.publicado ? (
                          <span className="inline-flex items-center gap-1 rounded bg-success px-3 py-1 text-sm text-white">
                            <FiCheck /> Publicado
                          </span>
                        ) : (
                          <span className="inline-block rounded bg-warning px-3 py-1 text-sm text-white">
                            Borrador
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {!producto.publicado ? (
                            <>
                              <button
                                onClick={() => navigate(`/app/woocommerce/producto-variable/editar/${producto._id}`)}
                                className="hover:text-primary"
                                title="Editar"
                              >
                                <FiEdit />
                              </button>
                              <button
                                onClick={() => handlePublicar(producto._id)}
                                className="inline-flex items-center gap-1 rounded bg-success px-3 py-1 text-sm text-white hover:bg-opacity-90"
                                title="Publicar"
                              >
                                <FiCheck /> Publicar
                              </button>
                              <button
                                className="hover:text-danger"
                                title="Eliminar"
                              >
                                <FiTrash2 />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => navigate(`/app/woocommerce/producto-variable/editar/${producto._id}`)}
                                className="hover:text-primary"
                                title="Editar"
                              >
                                <FiEdit />
                              </button>
                              <button
                                onClick={() => handlePublicar(producto._id)}
                                className="inline-flex items-center gap-1 rounded bg-meta-3 px-3 py-1 text-sm text-white hover:bg-opacity-90"
                                title="Actualizar en WooCommerce"
                              >
                                <FiCheck /> Actualizar
                              </button>
                              <button
                                onClick={() => handleDespublicar(producto._id, producto.nombreWeb || producto.nombre)}
                                className="inline-flex items-center gap-1 rounded bg-danger px-3 py-1 text-sm text-white hover:bg-opacity-90"
                                title="Despublicar (Eliminar de WooCommerce)"
                              >
                                <FiXCircle /> Despublicar
                              </button>
                              <span className="text-xs text-bodydark">
                                ID WC: {producto.woocommerceId}
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductosVariables;
