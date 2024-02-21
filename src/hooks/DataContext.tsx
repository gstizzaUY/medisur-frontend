import React, { ReactNode } from "react";
import { useState, useEffect } from "react";
import clienteAxios from '../functions/clienteAxios';

export const dataContext = React.createContext({});

type DataContextProviderProps = {
    children: ReactNode;
};
type Cliente = {
    "AbreviacionMoneda": String,
    "Activo": String,
    "CategoriaCodigo": String,
    "CategoriaNombre": String,
    "Codigo": String,
    "CodigoContable": String,
    "ComprobantesPorCliente": String,
    "CondicionCodigo": String,
    "CondicionNombre": String,
    "EmailAdministracion": String,
    "ExentoIVA": String,
    "FechaRegistro": String,
    "LocalCodigo": Number,
    "LocalNombre": String,
    "MonedaCodigo": Number,
    "Nombre": String,
    "PorcentajeDto1": Number,
    "PorcentajeDto2": Number,
    "PorcentajeDto3": Number,
    "PrecioVentaCodigo": String,
    "PrecioVentaNombre": String,
    "SimboloMoneda": String,
    "TextoPredefinidoAbreviacion": String,
    "TextoPredefinidoCodigo": String,
    "TextoPredefinidoNombre": String,
    "TopACreditoDias": Number
    "TopeCreditoMonto": String,
    "VendedorCodigo": String,
    "VendedorNombre": String,
};
type Item = {
    "ArticuloAbrevia": String,
    "ArticuloCodigo": String,
    "ArticuloNombre": String,
    "DepositoAbrevia": String,
    "DepositoCodigo": Number,
    "DepositoNombre": String
    "LocalCodigo": Number,
    "Lote": String,
    "StockActual": String,
    "Vencimiento": String,
}
type Comprobantes = {
    "Abreviacion": String,
    "Activo": String,
    "CFE": String,
    "Codigo": Number,
    "ComprobanteGastos": String,
    "ComprobanteResguardo": String,
    "ConceptoOgligatorio": String,
    "Contingencia": String,
    "DepositoDestinoCodigo": Number,
    "DepositoDestinoNombre": String,
    "DepositoOrigenCodigo": Number,
    "DepositoOrigenNombre": String,
    "Exportacion": String,
    "FormaPagoCodigo": Number,
    "FormatoCodigo": String,
    "FormatoNombre": String,
    "IVA": String,
    "IncluirEnFichaComprobantes": String,
    "IncluirEnLibros": String,
    "LocalCodigo": Number,
    "LocalNombre": String,
    "Nombre": String,
    "NotaDebito": String,
    "Notas": String,
    "NumeradorCodigo": String,
    "NumeradorNombre": String,
    "PendienteFacturacionRemision": String,
    "PermiteSalidasSinStock": String,
    "RemitoInterno": String,
    "SolicitaDatosReparto": String,
    "Tipo": Number,
    "TipoNombre": String,
    "TomarParaActualizarCostos": String,
}

const DataContextProvider = ({ children }: DataContextProviderProps) => {
    const [usuario, setUsuario] = useState({} as any);
    const [diaActual, setDiaActual] = React.useState(new Date());
    const [diaVencimiento, setDiaVencimiento] = React.useState(new Date());
    const mesActual = new Date().getMonth() + 1;
    const anioActual = new Date().getFullYear();
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [comprobantes, setComprobantes] = useState<Comprobantes[]>([]);
    const [precioCosto, setPrecioCosto] = useState(0);
    const [precioVenta, setPrecioVenta] = useState(0);
    const [ultimoPrecio, setUltimoPrecio] = useState(0);
    const [articulos, setArticulos] = useState([]);
    const [notas, setNotas] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedCliente, setSelectedCliente] = useState('');
    const [selectedCantidad, setSelectedCantidad] = useState(1);
    const [selectedComprobante, setSelectedComprobante] = useState('');
    const [selectedFechaFactura, setSelectedFechaFactura] = useState('');
    const [movimiento, setMovimiento] = useState({});
    const [facturasClientes, setFacturasClientes] = useState([]);
    const [totalFacturadoMesActual, setTotalFacturadoMesActual] = useState(0);
    const [totalFacturadoMesAnterior, setTotalFacturadoMesAnterior] = useState(0);
    const [comprobantesPendientes, setComprobantesPendientes] = useState([]);
    const [listaArticulos, setListaArticulos] = useState([]);
    const [ventasDetalladas, setVentasDetalladas] = useState([]);
    const [facturasVencidas, setFacturasVencidas] = useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    //* AUTENTICAR USUARIO
    useEffect(() => {
        const autenticarUsuario = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const { data } = await clienteAxios.get(`${import.meta.env.VITE_API_URL}/auth/perfil`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setUsuario(data.usuario);
            } catch (error) {
                console.log(error);
            }
        }
            autenticarUsuario();
    }, []);


    //* ESTABLECER EL DÍA ACTUAL Y DÍA VENCIMIENTO EN FORMATO YYYY-MM-DD
    useEffect(() => {
        setDiaActual(new Date().toISOString().split('T')[0]);
        // Establecer fecha de vencimiento en formato YYYY-MM-DD como la fecha actual menos 30 días
        setDiaVencimiento(new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    }, []);

    //* OBTENER CLIENTES //
    useEffect(() => {
        const obtenerClientes = async () => {
            try {
                const clientes = await clienteAxios.get(`${import.meta.env.VITE_API_URL}/facturas/clientes`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setClientes([...clientes.data as Cliente[]]);
            } catch (error) {
                console.log(error);
            }
        }
        obtenerClientes();
    }, []);

    //* OBTENER LISTA DE ARTÍCULOS //
    useEffect(() => {
        const obtenerArticulos = async () => {
            try {
                const { data } = await clienteAxios.get(`${import.meta.env.VITE_API_URL}/facturas/listaArticulos`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setListaArticulos(data);
            } catch (error) {
                console.log(error);
            }
        }
        obtenerArticulos();
    }, []);

    //* Obtener items y agregar PrecioCosto de cada item con el costo del artículo
    useEffect(() => {
        const obtenerItems = async () => {
            try {
                const { data } = await clienteAxios.get(`${import.meta.env.VITE_API_URL}/facturas/items`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const itemsConCosto = data.map(item => {
                    const articulo = listaArticulos.find(articulo => articulo.Codigo === item.ArticuloCodigo);
                    // Crear una nueva copia de item y modificar PrecioCosto
                    return articulo ? { ...item, PrecioCosto: articulo.Costo } : { ...item, PrecioCosto: "0.00000" };
                });
                setItems(itemsConCosto);
            } catch (error) {
                console.log(error);
            }
        }
        if (listaArticulos.length > 0) {
            obtenerItems();
        }
    }, [listaArticulos]);

    //* Obtener comprobantes
    useEffect(() => {
        const obtenerComprobantes = async () => {
            try {
                const listaComprobantes = await clienteAxios.get(`${import.meta.env.VITE_API_URL}/facturas/comprobantes`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setComprobantes([...listaComprobantes.data as Comprobantes[]]);
            } catch (error) {
                console.log(error);
            }
        }
        obtenerComprobantes();
    }, []);


    //* Obtener las facturas de los clientes de los últimos 6 meses
    useEffect(() => {
        const obtenerFacturas = async () => {
            try {
                const datos = {Mes: mesActual, Anio: anioActual};
                const config = {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                };
                const { data } = await clienteAxios.post(`${import.meta.env.VITE_API_URL}/facturas/facturas-clientes`, datos, config);

                setFacturasClientes(data);

                //* FACTURAS MES ACTUAL
                const facturasClientesMesActual = data.filter(factura => factura.Fecha.substring(5, 7) == mesActual && factura.Fecha.substring(0, 4) == anioActual);

                // Filtrar las facturas del mes actual donde ComprobanteCodigo = 701, (Venta Crédito) y ComprobanteCodigo = 702, (Venta Contado)
                const ventasMesActual = facturasClientesMesActual.filter(factura => factura.ComprobanteCodigo === 701 || factura.ComprobanteCodigo === 702);
                const totalVentasMesActual = ventasMesActual.reduce((total, factura) => total + Number(factura.Total), 0);

                // Filtrar las facturas del mes actual donde ComprobanteCodigo = 702, (Nota de Crédito) y ComprobanteCodigo = 704, (Devolución Contado)
                const devolucionesMesActual = facturasClientesMesActual.filter(factura => factura.ComprobanteCodigo === 702 || factura.ComprobanteCodigo === 704);
                const totalDevolucionesMesActual = devolucionesMesActual.reduce((total, factura) => total + Number(factura.Total), 0);

                // Restar las devoluciones de las ventas para obtener el total facturado del mes actual
                const totalMesActual = totalVentasMesActual - totalDevolucionesMesActual;
                setTotalFacturadoMesActual(totalMesActual);


                 //* FACTURAS MES ANTERIOR
                const facturasClientesMesAnterior = data.filter(factura => factura.Fecha.substring(5, 7) == (mesActual === 1 ? 12 : mesActual - 1) && factura.Fecha.substring(0, 4) == (mesActual === 1 ? anioActual - 1 : anioActual));

                // Filtrar las facturas del mes anterior donde ComprobanteCodigo = 701, (Venta Crédito) y ComprobanteCodigo = 702, (Venta Contado)
                const ventasMesAnterior = facturasClientesMesAnterior.filter(factura => factura.ComprobanteCodigo === 701 || factura.ComprobanteCodigo === 702);
                const totalVentasMesAnterior = ventasMesAnterior.reduce((total, factura) => total + Number(factura.Total), 0);

                // Filtrar las facturas del mes anterior donde ComprobanteCodigo = 702, (Nota de Crédito) y ComprobanteCodigo = 704, (Devolución Contado)
                const devolucionesMesAnterior = facturasClientesMesAnterior.filter(factura => factura.ComprobanteCodigo === 702 || factura.ComprobanteCodigo === 704);
                const totalDevolucionesMesAnterior = devolucionesMesAnterior.reduce((total, factura) => total + Number(factura.Total), 0);

                // Restar las devoluciones de las ventas para obtener el total facturado del mes anterior
                const totalMesAnterior = totalVentasMesAnterior - totalDevolucionesMesAnterior;
                setTotalFacturadoMesAnterior(totalMesAnterior);

            } catch (error) {
                console.log(error);
            }
        }
        obtenerFacturas();
    }, []);


    //* Obtener los comprobantes pendientes
    useEffect(() => {
        const obtenerComprobantesPendientes = async () => {
            try {
                const { data } = await clienteAxios.post(`${import.meta.env.VITE_API_URL}/facturas/comprobantes-pendientes`, null, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setComprobantesPendientes(data);
                // Agregar a cada comprobante la zona del cliente, tomada del estado facturasClientes. Comparar por CodigoCliente y agregar la propiedad ClienteZona a cada comprobante7
                const comprobantesPendientes = data.map(comprobante => {
                    const facturaCliente = facturasClientes.find(factura => factura.ClienteCodigo === comprobante.ClienteCodigo);
                    return facturaCliente ? { ...comprobante, ClienteZona: facturaCliente.ClienteZonaCodigo } : { ...comprobante, ClienteZona: '' };
                });
                setComprobantesPendientes(comprobantesPendientes);

                // Filtrar los comprobantes vencidos, donde un comprobante vencido es aquel que comprobante.Fecha < diaVencimiento
                const comprobantesVencidos = comprobantesPendientes.filter(comprobante => new Date(comprobante.Fecha) < new Date(diaVencimiento));
                // Agregar a cada comprobante vencido la zona del cliente, tomada del estado facturasClientes. Comparar por CodigoCliente y agregar la propiedad ClienteZona a cada comprobante7
                const comprobantesVencidosConZona = comprobantesVencidos.map(comprobante => {
                    const facturaCliente = facturasClientes.find(factura => factura.ClienteCodigo === comprobante.ClienteCodigo);
                    return facturaCliente ? { ...comprobante, ClienteZona: facturaCliente.ClienteZonaCodigo } : { ...comprobante, ClienteZona: '' };
                });
                setFacturasVencidas(comprobantesVencidosConZona);
                setIsLoading(false);
            } catch (error) {
                console.log(error);
            }
        }
        obtenerComprobantesPendientes();
    }, [facturasClientes]);


    // * Obtener ventas detalladas
    useEffect(() => {
        const obtenerVentasDetalladas = async () => {
            try {
                const datos = {Mes: mesActual, Anio: anioActual};
                const config = {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                };
                const { data } = await clienteAxios.post(`${import.meta.env.VITE_API_URL}/facturas/informes/ventas-detalladas`, datos, config);
                setVentasDetalladas(data);
            } catch (error) {
                console.log(error);
            }
        }
        obtenerVentasDetalladas();
    }, []);





    return (
        <dataContext.Provider value={{
            mesActual,
            anioActual,
            clientes,
            setClientes,
            items,
            setItems,
            selectedItem,
            setSelectedItem,
            selectedCliente,
            setSelectedCliente,
            selectedCantidad,
            setSelectedCantidad,
            precioCosto,
            setPrecioCosto,
            precioVenta,
            setPrecioVenta,
            ultimoPrecio,
            setUltimoPrecio,
            comprobantes,
            setComprobantes,
            selectedComprobante,
            setSelectedComprobante,
            selectedFechaFactura,
            setSelectedFechaFactura,
            articulos,
            setArticulos,
            notas,
            setNotas,
            movimiento,
            setMovimiento,
            facturasClientes,
            setFacturasClientes,
            totalFacturadoMesActual,
            setTotalFacturadoMesActual,
            totalFacturadoMesAnterior,
            setTotalFacturadoMesAnterior,
            comprobantesPendientes,
            setComprobantesPendientes,
            listaArticulos,
            setListaArticulos,
            ventasDetalladas,
            setVentasDetalladas,
            diaActual,
            setDiaActual,
            diaVencimiento,
            setDiaVencimiento,
            facturasVencidas,
            setFacturasVencidas,
            isLoading,
            setIsLoading,
            usuario,
            setUsuario,
        }}>
            {children}
        </dataContext.Provider>
    );
};

export default DataContextProvider;