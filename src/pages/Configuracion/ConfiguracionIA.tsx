import { useState, useEffect } from 'react';
import { FiSave, FiZap } from 'react-icons/fi';
import { aiService, type ConfiguracionIA as IConfiguracionIA } from '../../services/aiService';
import Breadcrumb from '../../components/Breadcrumb';
import toast from 'react-hot-toast';

const ConfiguracionIA = () => {
  const [config, setConfig] = useState<IConfiguracionIA>({
    descripcionCorta: {
      longitud: 160,
      tono: 'profesional',
      incluirBeneficios: true,
    },
    descripcionLarga: {
      longitud: 300,
      incluirCaracteristicas: true,
      incluirUsos: true,
      incluirAdvertencias: true,
    },
    seo: {
      metaTitleFormula: '{nombre} - Suministros Médicos | MediMarket',
      metaDescriptionLongitud: 155,
      keywordsCount: 5,
    },
    categorias: {
      autoAsignar: true,
      maximoCategorias: 3,
    },
    etiquetas: {
      autoGenerar: true,
      maximoEtiquetas: 5,
    },
  });

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    setCargando(true);
    try {
      const response = await aiService.obtenerConfiguracion();
      // El backend devuelve { data: { ... } }
      if (response?.data) {
        setConfig(response.data);
      }
    } catch (error: any) {
      console.error('Error al cargar configuración:', error);
      // Si no existe configuración, usar la por defecto
    } finally {
      setCargando(false);
    }
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await aiService.guardarConfiguracion(config);
      toast.success('Configuración guardada correctamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar configuración');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <>
        <Breadcrumb pageName="Configuración de Inteligencia Artificial" />
        <div className="flex items-center justify-center py-20">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb pageName="Configuración de Inteligencia Artificial" />

      {/* Header con info */}
      <div className="mb-6 rounded-sm border-2 border-purple-600 bg-gradient-to-r from-purple-50 to-blue-50 p-6 shadow-default dark:from-purple-900/20 dark:to-blue-900/20">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 text-white">
            <FiZap size={28} />
          </div>
          <div>
            <h2 className="mb-2 text-xl font-semibold text-black dark:text-white">
              Configuración de IA para Productos Web
            </h2>
            <p className="text-bodydark">
              Configura cómo la Inteligencia Artificial debe generar las descripciones, SEO y otros campos
              de los productos para la Tienda MediMarket. Esta configuración se aplicará a todos los productos.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Descripción Corta */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Descripción Corta
            </h3>
          </div>
          <div className="p-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Longitud máxima (caracteres)
                </label>
                <input
                  type="number"
                  value={config.descripcionCorta.longitud}
                  onChange={(e) => setConfig({
                    ...config,
                    descripcionCorta: {
                      ...config.descripcionCorta,
                      longitud: parseInt(e.target.value),
                    },
                  })}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
                <small className="text-bodydark">
                  Recomendado: 150-160 caracteres para mejor visualización
                </small>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Tono de escritura
                </label>
                <select
                  value={config.descripcionCorta.tono}
                  onChange={(e) => setConfig({
                    ...config,
                    descripcionCorta: {
                      ...config.descripcionCorta,
                      tono: e.target.value as 'profesional' | 'casual' | 'tecnico',
                    },
                  })}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="profesional">Profesional</option>
                  <option value="casual">Casual</option>
                  <option value="tecnico">Técnico</option>
                </select>
                <small className="text-bodydark">
                  Profesional: formal y confiable | Casual: amigable | Técnico: detallado y específico
                </small>
              </div>
              <div className="md:col-span-2">
                <label className="flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={config.descripcionCorta.incluirBeneficios}
                    onChange={(e) => setConfig({
                      ...config,
                      descripcionCorta: {
                        ...config.descripcionCorta,
                        incluirBeneficios: e.target.checked,
                      },
                    })}
                    className="sr-only"
                  />
                  <div className={`mr-3 flex h-5 w-5 items-center justify-center rounded border ${
                    config.descripcionCorta.incluirBeneficios ? 'border-primary bg-primary' : 'border-stroke dark:border-strokedark'
                  }`}>
                    {config.descripcionCorta.incluirBeneficios && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-black dark:text-white">
                    Incluir beneficios del producto en la descripción
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Descripción Larga */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Descripción Larga
            </h3>
          </div>
          <div className="p-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Longitud aproximada (palabras)
                </label>
                <input
                  type="number"
                  value={config.descripcionLarga.longitud}
                  onChange={(e) => setConfig({
                    ...config,
                    descripcionLarga: {
                      ...config.descripcionLarga,
                      longitud: parseInt(e.target.value),
                    },
                  })}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
                <small className="text-bodydark">
                  Recomendado: 250-350 palabras para contenido rico
                </small>
              </div>
              <div className="space-y-4">
                <label className="flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={config.descripcionLarga.incluirCaracteristicas}
                    onChange={(e) => setConfig({
                      ...config,
                      descripcionLarga: {
                        ...config.descripcionLarga,
                        incluirCaracteristicas: e.target.checked,
                      },
                    })}
                    className="sr-only"
                  />
                  <div className={`mr-3 flex h-5 w-5 items-center justify-center rounded border ${
                    config.descripcionLarga.incluirCaracteristicas ? 'border-primary bg-primary' : 'border-stroke dark:border-strokedark'
                  }`}>
                    {config.descripcionLarga.incluirCaracteristicas && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-black dark:text-white">
                    Incluir características técnicas
                  </span>
                </label>
                <label className="flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={config.descripcionLarga.incluirUsos}
                    onChange={(e) => setConfig({
                      ...config,
                      descripcionLarga: {
                        ...config.descripcionLarga,
                        incluirUsos: e.target.checked,
                      },
                    })}
                    className="sr-only"
                  />
                  <div className={`mr-3 flex h-5 w-5 items-center justify-center rounded border ${
                    config.descripcionLarga.incluirUsos ? 'border-primary bg-primary' : 'border-stroke dark:border-strokedark'
                  }`}>
                    {config.descripcionLarga.incluirUsos && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-black dark:text-white">
                    Incluir usos comunes y aplicaciones
                  </span>
                </label>
                <label className="flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={config.descripcionLarga.incluirAdvertencias}
                    onChange={(e) => setConfig({
                      ...config,
                      descripcionLarga: {
                        ...config.descripcionLarga,
                        incluirAdvertencias: e.target.checked,
                      },
                    })}
                    className="sr-only"
                  />
                  <div className={`mr-3 flex h-5 w-5 items-center justify-center rounded border ${
                    config.descripcionLarga.incluirAdvertencias ? 'border-primary bg-primary' : 'border-stroke dark:border-strokedark'
                  }`}>
                    {config.descripcionLarga.incluirAdvertencias && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-black dark:text-white">
                    Incluir advertencias y precauciones
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              SEO (Optimización para Motores de Búsqueda)
            </h3>
          </div>
          <div className="p-7">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Fórmula para Meta Title
                  <span className="ml-2 text-xs text-gray-500">(usa {'{nombre}'} para incluir el nombre del producto)</span>
                </label>
                <input
                  type="text"
                  value={config.seo.metaTitleFormula}
                  onChange={(e) => setConfig({
                    ...config,
                    seo: {
                      ...config.seo,
                      metaTitleFormula: e.target.value,
                    },
                  })}
                  placeholder="{nombre} - Suministros Médicos | MediMarket"
                  className="w-full rounded border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
                <small className="text-bodydark">
                  Ejemplo: "Guantes de Látex - Suministros Médicos | MediMarket"
                </small>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Longitud Meta Description (caracteres)
                  </label>
                  <input
                    type="number"
                    value={config.seo.metaDescriptionLongitud}
                    onChange={(e) => setConfig({
                      ...config,
                      seo: {
                        ...config.seo,
                        metaDescriptionLongitud: parseInt(e.target.value),
                      },
                    })}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                  <small className="text-bodydark">
                    Google muestra hasta 155-160 caracteres
                  </small>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Cantidad de Keywords a generar
                  </label>
                  <input
                    type="number"
                    value={config.seo.keywordsCount}
                    onChange={(e) => setConfig({
                      ...config,
                      seo: {
                        ...config.seo,
                        keywordsCount: parseInt(e.target.value),
                      },
                    })}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                  <small className="text-bodydark">
                    Recomendado: 3-7 keywords relevantes
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categorías y Etiquetas */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Categorías y Etiquetas
            </h3>
          </div>
          <div className="p-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-black dark:text-white">Categorías</h4>
                <label className="flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={config.categorias.autoAsignar}
                    onChange={(e) => setConfig({
                      ...config,
                      categorias: {
                        ...config.categorias,
                        autoAsignar: e.target.checked,
                      },
                    })}
                    className="sr-only"
                  />
                  <div className={`mr-3 flex h-5 w-5 items-center justify-center rounded border ${
                    config.categorias.autoAsignar ? 'border-primary bg-primary' : 'border-stroke dark:border-strokedark'
                  }`}>
                    {config.categorias.autoAsignar && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-black dark:text-white">
                    Auto-asignar categorías automáticamente
                  </span>
                </label>
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Máximo de categorías por producto
                  </label>
                  <input
                    type="number"
                    value={config.categorias.maximoCategorias}
                    onChange={(e) => setConfig({
                      ...config,
                      categorias: {
                        ...config.categorias,
                        maximoCategorias: parseInt(e.target.value),
                      },
                    })}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-black dark:text-white">Etiquetas</h4>
                <label className="flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={config.etiquetas.autoGenerar}
                    onChange={(e) => setConfig({
                      ...config,
                      etiquetas: {
                        ...config.etiquetas,
                        autoGenerar: e.target.checked,
                      },
                    })}
                    className="sr-only"
                  />
                  <div className={`mr-3 flex h-5 w-5 items-center justify-center rounded border ${
                    config.etiquetas.autoGenerar ? 'border-primary bg-primary' : 'border-stroke dark:border-strokedark'
                  }`}>
                    {config.etiquetas.autoGenerar && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-black dark:text-white">
                    Auto-generar etiquetas automáticamente
                  </span>
                </label>
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Máximo de etiquetas por producto
                  </label>
                  <input
                    type="number"
                    value={config.etiquetas.maximoEtiquetas}
                    onChange={(e) => setConfig({
                      ...config,
                      etiquetas: {
                        ...config.etiquetas,
                        maximoEtiquetas: parseInt(e.target.value),
                      },
                    })}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="inline-flex items-center gap-2 rounded bg-primary px-8 py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
          >
            <FiSave />
            {guardando ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </div>
    </>
  );
};

export default ConfiguracionIA;
