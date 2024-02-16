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
];

const routes = [...coreRoutes];
export default routes;
