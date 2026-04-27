import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { woocommerceService } from '../../services/woocommerceService';
import { aiService } from '../../services/aiService';
import toast from 'react-hot-toast';
import Breadcrumb from '../../components/Breadcrumb';
import { FiSave, FiPackage, FiZap } from 'react-icons/fi';
import { dataContext } from '../../hooks/DataContext';

/** Redondea al entero más cercano si el valor es >= 1; conserva 2 decimales si es menor a 1. */
const roundPrecio = (valor: number): number =>
  valor >= 1 ? Math.round(valor) : parseFloat(valor.toFixed(2));

interface Atributo {
  nombre: string;
  valores: string[];
  visible: boolean;
  usarParaVariaciones: boolean;
}

interface Variacion {
  codigoArticulo: string;
  atributos: Record<string, string>;
  activo: boolean;
}

const ProductoVariableForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const context = useContext(dataContext) as any;
  const { articulosConStock } = context;
  
  const codigosArticulos = location.state?.codigosArticulos || [];
  const modoEdicion = !!id;

  const [formData, setFormData] = useState({
    nombre: '',
    nombreWeb: '',
    descripcion: '',
    descripcionCorta: '',
    atributos: [] as Atributo[],
    variaciones: [] as Variacion[],
    variacionPorDefecto: '', // Código del artículo que será la variación por defecto
    categorias: [] as number[],
    etiquetas: [] as number[],
    imagenes: [] as any[],
    destacado: false,
    gestionarStock: true,
    ivaCodigo: 2,
  });

  const [productosSimples, setProductosSimples] = useState<any[]>([]);
  const [preciosEditados, setPreciosEditados] = useState<Record<string, number>>({});
  const [categorias, setCategorias] = useState<any[]>([]);     // categorías disponibles en WooCommerce
  const [etiquetas, setEtiquetas] = useState<any[]>([]);       // etiquetas disponibles en WooCommerce
  const [nuevoAtributo, setNuevoAtributo] = useState({
    nombre: '',
    valor: ''
  });

  const [loading, setLoading] = useState(false);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [procesandoIA, setProcesandoIA] = useState(false);

  useEffect(() => {
    cargarCategorias();
    cargarEtiquetas();
    if (modoEdicion && id) {
      // Modo edición: cargar producto variable existente
      cargarProductoVariable(id);
    } else if (codigosArticulos.length > 0) {
      // Modo creación: cargar productos simples seleccionados
      cargarProductosConfigurados();
    } else {
      setLoadingProductos(false);
      toast.error('No se recibieron artículos para crear el producto variable');
    }
  }, [id]);

  const cargarCategorias = async () => {
    try {
      const response = await woocommerceService.obtenerCategorias();
      const lista = response?.data?.categorias;
      if (Array.isArray(lista)) {
        setCategorias(lista);
      } else {
        console.warn('[cargarCategorias] Respuesta inesperada:', response);
        toast.error('No se pudieron cargar las categorías de WooCommerce');
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
      toast.error('Error al cargar las categorías de WooCommerce');
    }
  };

  const cargarEtiquetas = async () => {
    try {
      const response = await woocommerceService.obtenerEtiquetas();
      const lista = response?.data?.etiquetas;
      if (Array.isArray(lista)) {
        setEtiquetas(lista);
      } else {
        console.warn('[cargarEtiquetas] Respuesta inesperada:', response);
      }
    } catch (error) {
      console.error('Error cargando etiquetas:', error);
    }
  };

  const cargarProductoVariable = async (idProducto: string) => {
    try {
      setLoadingProductos(true);
      
      // Cargar el producto variable desde el backend
      const response = await woocommerceService.obtenerProductoVariable(idProducto);
      const producto = response.data;
      
      // Cargar la configuración de cada producto simple para obtener imágenes y nombres
      const codigosVariaciones = producto.variaciones.map((v: any) => v.codigoArticulo);
      const promesas = codigosVariaciones.map((codigo: string) => 
        woocommerceService.obtenerProducto(codigo).catch(() => null)
      );
      
      const respuestas = await Promise.all(promesas);
      const productosSimplesCargados = respuestas
        .filter((resp: any) => resp !== null)
        .map((resp: any) => resp.data.data);
      
      setProductosSimples(productosSimplesCargados);

      // Inicializar precios editables desde los ProductoWeb hijos (con IVA 22% para mostrar en UI)
      const precios: Record<string, number> = {};
      productosSimplesCargados.forEach((p: any) => {
        precios[p.codigoArticulo] = roundPrecio((p.precioWeb ?? 0) * 1.22);
      });
      setPreciosEditados(precios);
      
      // Popular el formulario con los datos del producto variable
      setFormData({
        nombre: producto.nombre,
        nombreWeb: producto.nombreWeb || producto.nombre,
        descripcion: producto.descripcion || '',
        descripcionCorta: producto.descripcionCorta || '',
        atributos: producto.atributos || [],
        variaciones: producto.variaciones || [],
        variacionPorDefecto: producto.variacionPorDefecto || '',
        categorias: producto.categorias || [],
        etiquetas: producto.etiquetas || [],
        imagenes: producto.imagenes || [],
        destacado: producto.destacado || false,
        gestionarStock: producto.gestionarStock !== false,
        ivaCodigo: producto.ivaCodigo || 2,
      });
      
    } catch (error: any) {
      console.error('Error cargando producto variable:', error);
      toast.error('Error al cargar el producto variable');
      navigate('/app/woocommerce/productos-variables');
    } finally {
      setLoadingProductos(false);
    }
  };

  const cargarProductosConfigurados = async () => {
    try {
      setLoadingProductos(true);
      
      // Cargar la configuración de cada producto simple desde el backend
      const promesas = codigosArticulos.map((codigo: string) => 
        woocommerceService.obtenerProducto(codigo)
      );
      
      const respuestas = await Promise.all(promesas);
      const productos = respuestas.map(resp => resp.data.data);
      
      // Validar que todos tengan información completa
      const productosIncompletos = productos.filter((p: any) => 
        !p.nombreWeb || !p.imagenes || p.imagenes.length === 0
      );

      if (productosIncompletos.length > 0) {
        toast.error(
          `${productosIncompletos.length} producto(s) no tienen información completa.\n` +
          'Asegúrate de que todos tengan nombre, imagen y descripción.'
        );
        navigate('/app/woocommerce/productos');
        return;
      }

      setProductosSimples(productos);
      
      // Inicializar variaciones con los códigos
      const variacionesIniciales = productos.map((p: any) => ({
        codigoArticulo: p.codigoArticulo,
        atributos: {},
        activo: true
      }));
      
      // Usar info del primer producto como base
      const primerProducto = productos[0];
      
      setFormData(prev => ({
        ...prev,
        variaciones: variacionesIniciales,
        nombre: primerProducto.nombreWeb.split(' ')[0] || primerProducto.nombreWeb,
        descripcion: primerProducto.descripcion || '',
        descripcionCorta: '', // Dejar vacío para que el usuario escriba una descripción específica del producto variable
        imagenes: primerProducto.imagenes || [],
        categorias: primerProducto.categorias || [],
        etiquetas: primerProducto.etiquetas || [],
        ivaCodigo: primerProducto.ivaCodigo || 2,
      }));

    } catch (error: any) {
      console.error('Error cargando productos:', error);
      toast.error('Error al cargar la configuración de los productos');
      navigate('/app/woocommerce/productos');
    } finally {
      setLoadingProductos(false);
    }
  };

  const handleAgregarAtributo = () => {
    if (!nuevoAtributo.nombre || !nuevoAtributo.valor) {
      toast.error('Completa el nombre y valor del atributo');
      return;
    }

    const atributoExistente = formData.atributos.find(
      attr => attr.nombre.toLowerCase() === nuevoAtributo.nombre.toLowerCase()
    );

    if (atributoExistente) {
      // Agregar valor al atributo existente
      const nuevosAtributos = formData.atributos.map(attr => {
        if (attr.nombre.toLowerCase() === nuevoAtributo.nombre.toLowerCase()) {
          // Evitar duplicados
          if (!attr.valores.includes(nuevoAtributo.valor)) {
            return {
              ...attr,
              valores: [...attr.valores, nuevoAtributo.valor]
            };
          }
        }
        return attr;
      });
      
      setFormData(prev => ({ ...prev, atributos: nuevosAtributos }));
    } else {
      // Crear nuevo atributo
      const nuevoAttr: Atributo = {
        nombre: nuevoAtributo.nombre,
        valores: [nuevoAtributo.valor],
        visible: true,
        usarParaVariaciones: true
      };
      
      setFormData(prev => ({
        ...prev,
        atributos: [...prev.atributos, nuevoAttr]
      }));
    }

    setNuevoAtributo({ nombre: '', valor: '' });
  };

  const handleEliminarAtributo = (nombreAtributo: string) => {
    setFormData(prev => ({
      ...prev,
      atributos: prev.atributos.filter(attr => attr.nombre !== nombreAtributo)
    }));
  };

  const handleEliminarValorAtributo = (nombreAtributo: string, valor: string) => {
    setFormData(prev => ({
      ...prev,
      atributos: prev.atributos.map(attr => {
        if (attr.nombre === nombreAtributo) {
          return {
            ...attr,
            valores: attr.valores.filter(v => v !== valor)
          };
        }
        return attr;
      }).filter(attr => attr.valores.length > 0) // Eliminar atributos sin valores
    }));
  };

  const handleAsignarAtributoAVariacion = (
    codigoArticulo: string,
    nombreAtributo: string,
    valor: string
  ) => {
    setFormData(prev => ({
      ...prev,
      variaciones: prev.variaciones.map(variacion => {
        if (variacion.codigoArticulo === codigoArticulo) {
          return {
            ...variacion,
            atributos: {
              ...variacion.atributos,
              [nombreAtributo]: valor
            }
          };
        }
        return variacion;
      })
    }));
  };

  const obtenerNombreArticulo = (codigo: string) => {
    const producto = productosSimples.find((p: any) => p.codigoArticulo === codigo);
    return producto?.nombreWeb || codigo;
  };

  const obtenerImagenArticulo = (codigo: string) => {
    const producto = productosSimples.find((p: any) => p.codigoArticulo === codigo);
    return producto?.imagenes?.[0]?.url || '';
  };

  const autocompletarDescripcionesIA = async () => {
    if (!formData.nombre.trim()) {
      toast.error('Primero ingresa un nombre para el producto');
      return;
    }

    if (formData.atributos.length === 0) {
      toast.error('Define al menos un atributo antes de usar la IA');
      return;
    }

    setProcesandoIA(true);
    try {
      const response = await aiService.autocompletarProductoVariable(
        formData.nombreWeb || formData.nombre,
        formData.atributos,
        productosSimples,
        undefined // usar configuración por defecto
      );

      const datos = response.data;
      
      console.log('[autocompletarDescripcionesIA] Respuesta completa:', response);
      console.log('[autocompletarDescripcionesIA] datos.descripcionCorta:', datos.descripcionCorta);
      console.log('[autocompletarDescripcionesIA] datos.descripcionLarga:', datos.descripcionLarga);
      
      setFormData(prev => ({
        ...prev,
        descripcionCorta: datos.descripcionCorta || prev.descripcionCorta,
        descripcion: datos.descripcionLarga || prev.descripcion,
      }));

      console.log('[autocompletarDescripcionesIA] formData después de actualizar:', {
        descripcionCorta: datos.descripcionCorta || formData.descripcionCorta,
        descripcion: datos.descripcionLarga || formData.descripcion
      });

      toast.success('✅ Descripciones generadas con IA');
    } catch (error: any) {
      console.error('Error generando descripciones:', error);
      toast.error(error.response?.data?.message || 'Error al generar descripciones con IA');
    } finally {
      setProcesandoIA(false);
    }
  };

  const handleGuardar = async () => {
    // Validaciones
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (formData.atributos.length === 0) {
      toast.error('Debes definir al menos un atributo');
      return;
    }

    if (formData.variaciones.length === 0) {
      toast.error('Debes tener al menos una variación');
      return;
    }

    // Verificar que todas las variaciones tengan todos los atributos asignados
    const variacionesIncompletas = formData.variaciones.filter(variacion => {
      const atributosAsignados = Object.keys(variacion.atributos).length;
      return atributosAsignados !== formData.atributos.length;
    });

    if (variacionesIncompletas.length > 0) {
      toast.error(`Hay ${variacionesIncompletas.length} variaciones sin todos los atributos asignados`);
      return;
    }

    try {
      setLoading(true);

      // En modo edición, actualizar el precioWeb de cada hijo en MongoDB (sin tocar WooCommerce)
      if (modoEdicion && Object.keys(preciosEditados).length > 0) {
        const promesasPrecios = Object.entries(preciosEditados).map(([codigoArticulo, precio]) => {
          const original = productosSimples.find((p: any) => p.codigoArticulo === codigoArticulo);
          if (original && original.precioWeb !== precio) {
            return woocommerceService.guardarProducto({ ...original, codigoArticulo, precioWeb: precio / 1.22 });
          }
          return Promise.resolve();
        });
        await Promise.all(promesasPrecios);
      }

      const dataToSave = modoEdicion && id ? { ...formData, _id: id } : formData;
      const response = await woocommerceService.guardarProductoVariable(dataToSave);
      toast.success(modoEdicion ? 'Producto variable actualizado exitosamente' : 'Producto variable guardado exitosamente');
      if (modoEdicion) {
        toast('Usá el botón "Actualizar" en el listado para reflejar los precios en WooCommerce.', { icon: 'ℹ️', duration: 5000 });
      }
      navigate('/app/woocommerce/productos-variables');
    } catch (error: any) {
      console.error('Error guardando producto:', error);
      toast.error(error.response?.data?.message || 'Error al guardar producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb pageName={modoEdicion ? "Editar Producto Variable" : "Nuevo Producto Variable"} />

      {loadingProductos ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
      ) : (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Header */}
        <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiPackage className="text-2xl text-primary" />
              <h3 className="font-medium text-black dark:text-white">
                Configurar Producto Variable
              </h3>
            </div>
            <button
              onClick={handleGuardar}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
            >
              <FiSave /> {loading ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </div>
        </div>

        <div className="p-7">
          {/* Información General */}
          <div className="mb-6">
            <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">
              1. Información General
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  placeholder="Ej: Guantes Desechables"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Nombre para Web
                </label>
                <input
                  type="text"
                  value={formData.nombreWeb}
                  onChange={(e) => setFormData({ ...formData, nombreWeb: e.target.value })}
                  className="w-full rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  placeholder="Ej: Guantes Médicos Profesionales"
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-black dark:text-white">
                  Descripción
                </label>
                <button
                  type="button"
                  onClick={autocompletarDescripcionesIA}
                  disabled={procesandoIA || formData.atributos.length === 0}
                  className="inline-flex items-center gap-2 rounded bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                  title="Generar descripciones con IA basadas en los atributos"
                >
                  <FiZap size={14} />
                  {procesandoIA ? 'Generando...' : 'Generar con IA'}
                </button>
              </div>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={3}
                className="w-full rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                placeholder="Descripción detallada del producto..."
              />
              <p className="mt-1 text-xs text-bodydark">
                La IA generará una descripción que menciona las opciones disponibles (atributos y valores)
              </p>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Descripción Corta
              </label>
              <textarea
                value={formData.descripcionCorta}
                onChange={(e) => setFormData({ ...formData, descripcionCorta: e.target.value })}
                rows={2}
                className="w-full rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                placeholder="Resumen breve que aparece en la página del producto..."
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  IVA
                </label>
                <select
                  value={formData.ivaCodigo}
                  onChange={(e) => setFormData({ ...formData, ivaCodigo: parseInt(e.target.value) })}
                  className="w-full rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                >
                  <option value={2}>22% (IVA Básico)</option>
                  <option value={1}>10% (IVA Mínimo)</option>
                  <option value={3}>0% (Exento)</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.destacado}
                    onChange={(e) => setFormData({ ...formData, destacado: e.target.checked })}
                    className="h-5 w-5"
                  />
                  <span className="text-sm font-medium text-black dark:text-white">
                    Producto Destacado
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Categorías y Etiquetas */}
          <div className="mb-6 border-t border-stroke pt-6 dark:border-strokedark">
            <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">
              2. Categorías y Etiquetas
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
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
                  {categorias.length === 0 ? (
                    <option disabled value="">Cargando categorías...</option>
                  ) : (
                    categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
                <small className="text-bodydark">
                  Mantén presionado Ctrl (Cmd en Mac) para seleccionar múltiples
                </small>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
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
                  {etiquetas.length === 0 ? (
                    <option disabled value="">Cargando etiquetas...</option>
                  ) : (
                    etiquetas.map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Atributos */}
          <div className="mb-6 border-t border-stroke pt-6 dark:border-strokedark">
            <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">
              3. Atributos (Talla, Color, etc.)
            </h4>
            
            {/* Formulario para agregar atributos */}
            <div className="mb-4 rounded border border-stroke bg-gray-2 p-4 dark:border-strokedark dark:bg-meta-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <input
                    type="text"
                    value={nuevoAtributo.nombre}
                    onChange={(e) => setNuevoAtributo({ ...nuevoAtributo, nombre: e.target.value })}
                    className="w-full rounded border border-stroke bg-white px-4 py-2 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-boxdark dark:text-white"
                    placeholder="Nombre (ej: Talla, Color)"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={nuevoAtributo.valor}
                    onChange={(e) => setNuevoAtributo({ ...nuevoAtributo, valor: e.target.value })}
                    className="w-full rounded border border-stroke bg-white px-4 py-2 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-boxdark dark:text-white"
                    placeholder="Valor (ej: S, M, L, XL)"
                  />
                </div>
                <div>
                  <button
                    onClick={handleAgregarAtributo}
                    className="w-full rounded bg-primary px-4 py-2 font-medium text-white hover:bg-opacity-90"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de atributos */}
            {formData.atributos.length > 0 ? (
              <div className="space-y-3">
                {formData.atributos.map((attr, index) => (
                  <div
                    key={index}
                    className="rounded border border-stroke bg-white p-4 dark:border-strokedark dark:bg-boxdark"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-black dark:text-white">{attr.nombre}</h5>
                      <button
                        onClick={() => handleEliminarAtributo(attr.nombre)}
                        className="text-danger hover:text-opacity-80"
                      >
                        Eliminar atributo
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {attr.valores.map((valor, vIndex) => (
                        <span
                          key={vIndex}
                          className="inline-flex items-center gap-2 rounded bg-primary px-3 py-1 text-sm text-white"
                        >
                          {valor}
                          <button
                            onClick={() => handleEliminarValorAtributo(attr.nombre, valor)}
                            className="hover:text-danger"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-bodydark">
                No hay atributos definidos. Agrega atributos como Talla, Color, Material, etc.
              </p>
            )}
          </div>

          {/* Variaciones */}
          <div className="border-t border-stroke pt-6 dark:border-strokedark">
            <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">
              4. Asignar Atributos a Variaciones ({formData.variaciones.length} artículos)
            </h4>
            <p className="mb-4 text-sm text-bodydark">
              Selecciona cuál variación se mostrará por defecto cuando un cliente visite el producto en la tienda. 
              Esta será la variación preseleccionada automáticamente.
            </p>
            
            {formData.variaciones.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                      <th className="px-4 py-3 font-medium text-black dark:text-white text-center">Por Defecto</th>
                      <th className="px-4 py-3 font-medium text-black dark:text-white">Imagen</th>
                      <th className="px-4 py-3 font-medium text-black dark:text-white">SKU</th>
                      <th className="px-4 py-3 font-medium text-black dark:text-white">Nombre</th>
                      {modoEdicion && (
                        <th className="px-4 py-3 font-medium text-black dark:text-white">Precio $</th>
                      )}
                      {formData.atributos.map((attr, index) => (
                        <th key={index} className="px-4 py-3 font-medium text-black dark:text-white">
                          {attr.nombre}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {formData.variaciones.map((variacion, vIndex) => (
                      <tr
                        key={vIndex}
                        className="border-b border-stroke dark:border-strokedark"
                      >
                        <td className="px-4 py-3 text-center">
                          <input
                            type="radio"
                            name="variacionPorDefecto"
                            checked={formData.variacionPorDefecto === variacion.codigoArticulo}
                            onChange={() => setFormData({ ...formData, variacionPorDefecto: variacion.codigoArticulo })}
                            className="h-4 w-4"
                            title="Seleccionar como variación por defecto"
                          />
                        </td>
                        <td className="px-4 py-3">
                          {obtenerImagenArticulo(variacion.codigoArticulo) && (
                            <img
                              src={obtenerImagenArticulo(variacion.codigoArticulo)}
                              alt={variacion.codigoArticulo}
                              className="h-12 w-12 rounded object-cover"
                            />
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-black dark:text-white">
                          {variacion.codigoArticulo}
                        </td>
                        <td className="px-4 py-3 text-sm text-bodydark">
                          {obtenerNombreArticulo(variacion.codigoArticulo)}
                        </td>
                        {modoEdicion && (
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={preciosEditados[variacion.codigoArticulo] ?? ''}
                              onChange={(e) =>
                                setPreciosEditados(prev => ({
                                  ...prev,
                                  [variacion.codigoArticulo]: parseFloat(e.target.value) || 0
                                }))
                              }
                              className="w-28 rounded border border-stroke bg-gray px-3 py-1 text-sm text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                            />
                          </td>
                        )}
                        {formData.atributos.map((attr, aIndex) => (
                          <td key={aIndex} className="px-4 py-3">
                            <select
                              value={variacion.atributos[attr.nombre] || ''}
                              onChange={(e) =>
                                handleAsignarAtributoAVariacion(
                                  variacion.codigoArticulo,
                                  attr.nombre,
                                  e.target.value
                                )
                              }
                              className="w-full rounded border border-stroke bg-gray px-3 py-2 text-sm text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                            >
                              <option value="">Seleccionar...</option>
                              {attr.valores.map((valor, vIndex) => (
                                <option key={vIndex} value={valor}>
                                  {valor}
                                </option>
                              ))}
                            </select>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-bodydark">
                No hay variaciones seleccionadas. Vuelve a la lista de productos y selecciona artículos.
              </p>
            )}
          </div>

          {/* Botón final */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={() => navigate('/app/woocommerce/productos-variables')}
              className="rounded border border-stroke px-6 py-2 font-medium text-black hover:bg-gray dark:border-strokedark dark:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded bg-primary px-6 py-2 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
            >
              <FiSave /> {loading ? 'Guardando...' : 'Guardar Producto Variable'}
            </button>
          </div>
        </div>
      </div>
      )}
    </>
  );
};

export default ProductoVariableForm;
