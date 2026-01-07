import { lazy } from 'react';

const Chart = lazy(() => import('../pages/Chart'));
const FormElements = lazy(() => import('../pages/Form/FormElements'));
const FormLayout = lazy(() => import('../pages/Form/FormLayout'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));
const Tables = lazy(() => import('../pages/Tables'));
const Alerts = lazy(() => import('../pages/UiElements/Alerts'));
const Buttons = lazy(() => import('../pages/UiElements/Buttons'));
const ComprobantesPendientes = lazy(() => import('../pages/Comprobantes/ComprobantesPendientes'));
const VentasDetalladas = lazy(() => import('../pages/Informes/VentasDetalladas'));
const ListaClientes = lazy(() => import('../pages/Informes/ListaClientes'));
const NuevaCotizacion = lazy(() => import('../pages/Cotizador/NuevaCotizacion'));
const Cotizaciones = lazy(() => import('../pages/Cotizador/Cotizaciones'));
const Facturacion = lazy(() => import('../pages/Informes/Facturacion'));
const Margenes = lazy(() => import('../pages/Informes/Margenes'));
const ListaPrecios = lazy(() => import('../pages/Informes/ListaPrecios'));
const ComprasDetalladas = lazy(() => import('../pages/Informes/ComprasDetalladas'));
const GananciasPorArticulo = lazy(() => import('../pages/Informes/GananciasporArticulo'));
const Egresos = lazy(() => import('../pages/Informes/Egresos'));
const EgresosPorConcepto = lazy(() => import('../pages/Informes/EgresosPorConcepto'));

// WooCommerce
const ProductosWeb = lazy(() => import('../pages/WooCommerce/ProductosWeb'));
const ProductoWebForm = lazy(() => import('../pages/WooCommerce/ProductoWebForm'));
const EstadisticasWeb = lazy(() => import('../pages/WooCommerce/EstadisticasWeb'));

// Configuración
const ConfiguracionIA = lazy(() => import('../pages/Configuracion/ConfiguracionIA'));


const coreRoutes = [
  {
    path: '/app/comprobantes/comprobantes-pendientes',
    title: 'Comprobantes Pendientes',
    component: ComprobantesPendientes,
  },
  {
    path: '/app/informes/ventas-detalladas',
    title: 'Ventas Detalladas',
    component: VentasDetalladas,
  },
  {
    path: '/app/informes/compras-detalladas',
    title: 'Compras Detalladas',
    component: ComprasDetalladas,
  },
  {
    path: '/app/informes/lista-clientes',
    title: 'Clientes',
    component: ListaClientes,
  },
  {
    path: '/app/informes/facturacion',
    title: 'Facturacion',
    component: Facturacion,
  },
  {
    path: '/app/informes/margenes',
    title: 'Margenes',
    component: Margenes,
  },
  {
    path: '/app/informes/listas-precios',
    title: 'Lstas de Precios',
    component: ListaPrecios,
  },
  {
    path: '/app/informes/ganancias-por-articulo',
    title: 'Ganancias por Articulo',
    component: GananciasPorArticulo,
  },
  {
    path: '/app/informes/egresos',
    title: 'Egresos',
    component: Egresos,
  },
  {
    path: '/app/informes/egresos-por-concepto',
    title: 'Egresos Por Concepto',
    component: EgresosPorConcepto,
  },
  {
    path: '/app/cotizador/nueva-cotizacion',
    title: 'Nueva Cotizacion',
    component: NuevaCotizacion,
  },
  {
    path: '/app/cotizador/cotizaciones',
    title: 'Cotizaciones',
    component: Cotizaciones,
  },
  {
    path: '/app/profile',
    title: 'Profile',
    component: Profile,
  },
  {
    path: '/app/forms/form-elements',
    title: 'Forms Elements',
    component: FormElements,
  },
  {
    path: '/app/forms/form-layout',
    title: 'Form Layouts',
    component: FormLayout,
  },
  {
    path: '/app/tables',
    title: 'Tables',
    component: Tables,
  },
  {
    path: '/app/settings',
    title: 'Settings',
    component: Settings,
  },
  {
    path: '/app/chart',
    title: 'Chart',
    component: Chart,
  },
  {
    path: '/app/ui/alerts',
    title: 'Alerts',
    component: Alerts,
  },
  {
    path: '/app/ui/buttons',
    title: 'Buttons',
    component: Buttons,
  },
  // WooCommerce Routes
  {
    path: '/app/woocommerce/productos',
    title: 'Productos WooCommerce',
    component: ProductosWeb,
  },
  {
    path: '/app/woocommerce/nuevo',
    title: 'Nuevo Producto Web',
    component: ProductoWebForm,
  },
  {
    path: '/app/woocommerce/editar/:codigoArticulo',
    title: 'Editar Producto Web',
    component: ProductoWebForm,
  },
  {
    path: '/app/woocommerce/estadisticas',
    title: 'Estadísticas WooCommerce',
    component: EstadisticasWeb,
  },
  // Configuración Routes
  {
    path: '/app/configuracion/inteligencia-artificial',
    title: 'Configuración de IA',
    component: ConfiguracionIA,
  },
];

const routes = [...coreRoutes];
export default routes;
