import React, { ReactNode } from "react";
import { useState, useEffect } from "react";
import clienteAxios from '../functions/clienteAxios';
import dayjs from 'dayjs';

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
    const [comprobantes, setComprobantes] = useState<Comprobantes[]>([]);
    const [precioCosto, setPrecioCosto] = useState(0);
    const [precioVenta, setPrecioVenta] = useState(0);
    const [ultimoPrecio, setUltimoPrecio] = useState(0);
    const [articulos, setArticulos] = useState([]);
    const [notas, setNotas] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedCliente, setSelectedCliente] = useState('');
    const [selectedCantidad, setSelectedCantidad] = useState('');
    const [selectedComprobante, setSelectedComprobante] = useState('');
    const [selectedFechaFactura, setSelectedFechaFactura] = useState('');
    const [movimiento, setMovimiento] = useState({});
    const [facturasClientes, setFacturasClientes] = useState([]);
    const [totalFacturadoMesActual, setTotalFacturadoMesActual] = useState(0);
    const [totalFacturadoMesAnterior, setTotalFacturadoMesAnterior] = useState(0);
    const [comprobantesPendientes, setComprobantesPendientes] = useState([]);
    const [listaArticulos, setListaArticulos] = useState([]);
    const [ventasDetalladas, setVentasDetalladas] = useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [contadorCotizaciones, setContadorCotizaciones] = React.useState('');
    const [cotizaciones, setCotizaciones] = React.useState([]);
    const [contactos, setContactos] = React.useState([]);
    const [listasDePrecios, setListasDePrecios] = React.useState([] as any);
    const [comprasDetalladas, setComprasDetalladas] = React.useState([] as any);
    const [articulosConStock, setArticulosConStock] = React.useState([{}]);
    const [valorTotalStock, setValorTotalStock] = React.useState(0);
    const [totalGananciasMensual, setTotalGananciasMensual] = React.useState(0);
    const [porentajeGananciasMensual, setPorcentajeGananciasMensual] = React.useState(0);
    const [egresos, setEgresos] = React.useState([]);
    const [egresosMesActual, setEgresosMesActual] = React.useState([]);
    const [egresosMesAnterior, setEgresosMesAnterior] = React.useState([]);
    const [totalEgresosMesActual, setTotalEgresosMesActual] = React.useState(0);
    const [totalEgresosMesAnterior, setTotalEgresosMesAnterior] = React.useState(0);


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

    //* OBTENER COMPRAS DETALLADAS
    useEffect(() => {
        const obtenerComprasDetalladas = async () => {
            try {
                const datos = { Mes: mesActual, Anio: anioActual };
                const config = {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                };
                const { data } = await clienteAxios.post(`${import.meta.env.VITE_API_URL}/facturas/compras`, datos, config);
                setComprasDetalladas(data);
            } catch (error) {
                console.log(error);
            }
        }
        obtenerComprasDetalladas();
    }, []);



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

    //* Obtener listas de precios
    useEffect(() => {
        const obtenerListasPrecios = async () => {
            try {
                const { data } = await clienteAxios.get(`${import.meta.env.VITE_API_URL}/facturas/listasPrecios`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setListasDePrecios(data);
            } catch (error) {
                console.log(error);
            }
        }
        obtenerListasPrecios();
    }, []);


    //* Obtener las facturas de los clientes de los últimos 6 meses
    useEffect(() => {
        const obtenerFacturas = async () => {
            try {
                const datos = { Mes: mesActual, Anio: anioActual };
                const config = {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                };
                const { data } = await clienteAxios.post(`${import.meta.env.VITE_API_URL}/facturas/facturas-clientes`, datos, config);
                setFacturasClientes(data);
                //* FACTURAS MES ACTUAL
                const facturasClientesMesActual = data.filter(factura => factura.Fecha.substring(5, 7) == mesActual && factura.Fecha.substring(0, 4) == anioActual);
                // Filtrar las facturas del mes actual donde ComprobanteCodigo = 701, (Venta Crédito) y ComprobanteCodigo = 703, (Venta Contado)
                const ventasMesActual = facturasClientesMesActual.filter(factura => factura.ComprobanteCodigo === 701 || factura.ComprobanteCodigo === 703);
                const totalVentasMesActual = ventasMesActual.reduce((total, factura) => total + Number(factura.Total), 0);
                // Filtrar las facturas del mes actual donde ComprobanteCodigo = 702, (Nota de Crédito) y ComprobanteCodigo = 704, (Devolución Contado)
                const devolucionesMesActual = facturasClientesMesActual.filter(factura => factura.ComprobanteCodigo === 702 || factura.ComprobanteCodigo === 704);
                const totalDevolucionesMesActual = devolucionesMesActual.reduce((total, factura) => total + Number(factura.Total), 0);
                // Restar las devoluciones de las ventas para obtener el total facturado del mes actual
                const totalMesActual = totalVentasMesActual - totalDevolucionesMesActual;
                setTotalFacturadoMesActual(totalMesActual);
                //* FACTURAS MES ANTERIOR
                const facturasClientesMesAnterior = data.filter(factura => factura.Fecha.substring(5, 7) == (mesActual === 1 ? 12 : mesActual - 1) && factura.Fecha.substring(0, 4) == (mesActual === 1 ? anioActual - 1 : anioActual));
                // Filtrar las facturas del mes anterior donde ComprobanteCodigo = 701, (Venta Crédito) y ComprobanteCodigo = 703, (Venta Contado)
                const ventasMesAnterior = facturasClientesMesAnterior.filter(factura => factura.ComprobanteCodigo === 701 || factura.ComprobanteCodigo === 703);
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
                // Por cada comprobantePendiente verificar extraer la Fecha del comprobante y el número de días de crédito del cliente obtenido de CondicionCodigo (string)
                // Si la Fecha + días de crédito < hoy, agregar la propiedad Vencido: true, sino agregar la propiedad Vencido: false
                const hoy = dayjs().format('YYYY-MM-DD');
                const comprobantesPendientesConVencimiento = comprobantesPendientes.map(comprobante => {
                    const fechaVencimiento = dayjs(comprobante.Fecha).add(comprobante.CondicionCodigo, 'day').format('YYYY-MM-DD');
                    const vencido = fechaVencimiento < hoy;
                    if (vencido) {
                        return { ...comprobante, Vencido: true };
                    } else {
                        return { ...comprobante, Vencido: false };
                    }
                }
                );
                setComprobantesPendientes(comprobantesPendientesConVencimiento);
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
                const datos = { Mes: mesActual, Anio: anioActual };
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



    //* Obtener contador de Cotizaciones
    useEffect(() => {
        const obtenerContadorCotizaciones = async () => {
            try {
                const { data } = await clienteAxios.get(`${import.meta.env.VITE_API_URL}/cotizador/obtener-contador`);
                const ultimoNumero = data.contador;
                const nuevoNumero = String(parseInt(ultimoNumero, 10)).padStart(7, '0');
                setContadorCotizaciones(nuevoNumero);
            } catch (error) {
                console.log(error);
            }
        }
        obtenerContadorCotizaciones();
    }, []);

    //* Obterner Cotizaciones
    useEffect(() => {
        const obtenerCotizaciones = async () => {
            try {
                const { data } = await clienteAxios.get(`${import.meta.env.VITE_API_URL}/cotizador/cotizaciones`);
                setCotizaciones(data);
            } catch (error) {
                console.log(error);
            }
        }
        obtenerCotizaciones();
    }, []);

    //* OBTENER CONTACTOS
    useEffect(() => {
        const obtenerContactos = async () => {
            try {
                const { data } = await clienteAxios.get(`${import.meta.env.VITE_API_URL}/facturas/contactos`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setContactos(data);
            } catch (error) {
                console.log(error);
            }
        }
        obtenerContactos();
    }, []);



    //* STOCK VALORIZADO DE ARTÍCULOS
    useEffect(() => {
        const obtenerItems = async () => {
            try {
                const { data } = await clienteAxios.get(`${import.meta.env.VITE_API_URL}/facturas/items`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                // Transformar data en un Map para acceso rápido
                const dataMap = new Map(data.map(item => [item.ArticuloCodigo, item]));

                let articulosMap = new Map();
                listaArticulos.filter(articulo => articulo !== null).forEach(articulo => {
                    const item = dataMap.get(articulo.Codigo);
                    const articuloConStock = item ? { ...articulo, Stock: item.StockActual } : { ...articulo, Stock: "0.00000" };
                    articulosMap.set(articulo.Codigo, articuloConStock);
                });

                articulosMap.forEach((articulo, codigo) => {
                    const comprasFiltradas = comprasDetalladas.filter(compra => compra.ArticuloCodigo === codigo);
                    if (comprasFiltradas.length > 0) {
                        const fechaUltimaCompra = comprasFiltradas.reduce((acumulador, compra) => {
                            const fecha = new Date(compra.FacturaFecha);
                            return fecha > acumulador ? fecha : acumulador;
                        }, new Date(0));
                        articulo.FechaRegistro = fechaUltimaCompra.toISOString().split('T')[0];
                        articulo.ProveedorNombre = comprasFiltradas[0].ProveedorNombre;
                    } else {
                        articulo.FechaRegistro = "";
                        articulo.ProveedorNombre = "";
                    }
                    const stock = parseFloat(articulo.Stock);
                    const costo = parseFloat(articulo.Costo);
                    articulo.StockValorizado = stock * costo;
                });
                setArticulosConStock([...articulosMap.values()]);

            } catch (error) {
                console.log(error);
            }
        };
        obtenerItems();
    }, [listaArticulos, comprasDetalladas]);


    // Calcular el valor total del stock
    useEffect(() => {
        const valorTotal = articulosConStock.reduce((total, articulo) => total + Number(articulo.StockValorizado), 0);
        setValorTotalStock(valorTotal);
    }, [articulosConStock]);



    //* GANAANCIAS POR ARTÍCULO
    useEffect(() => {
        const obtenerGananciaTotalMes = async () => {
            const ventasDelMes = ventasDetalladas.filter(
                venta => venta.FacturaMes === mesActual && venta.FacturaAnio === anioActual
            );
    
            const agrupadasPorArticulo = ventasDelMes.reduce((acc, venta) => {
                const codigo = venta.ArticuloCodigo;
                if (!acc[codigo]) {
                    acc[codigo] = { CantidadTotal: 0, PrecioVentaTotal: 0 };
                }
                acc[codigo].CantidadTotal += parseFloat(venta.LineaCantidad);
                acc[codigo].PrecioVentaTotal += parseFloat(venta.LineaCantidad) * parseFloat(venta.LineaPrecio);
                return acc;
            }, {});
    
            const dataFinal = Object.keys(agrupadasPorArticulo).map(codigo => {
                const venta = agrupadasPorArticulo[codigo];
                const articulo = listaArticulos.find(art => art.Codigo === codigo);
                const costoUnitario = parseFloat(articulo?.Costo || 0);
                const costoTotal = costoUnitario * venta.CantidadTotal;
                const precioVentaTotal = venta.PrecioVentaTotal;
                const gananciaTotal = precioVentaTotal - costoTotal;

                return {
                    Codigo: codigo,
                    Nombre: articulo?.Nombre || '',
                    Cantidad: venta.CantidadTotal,
                    Costo: costoTotal,
                    Precio: precioVentaTotal,
                    Ganancia: gananciaTotal,
                    Porcentaje: ((gananciaTotal / costoTotal) * 100).toFixed(2) + '%'
                };
            });
    
            const totalGanancias = dataFinal.reduce((total, articulo) => total + articulo.Ganancia, 0);
            setTotalGananciasMensual(totalGanancias);

            const totalCostos = dataFinal.reduce((total, articulo) => total + articulo.Costo, 0);

            const porcentajeGanancias = (totalGanancias / totalCostos) * 100;
            setPorcentajeGananciasMensual(porcentajeGanancias);

            
        }
        obtenerGananciaTotalMes();
    }, [mesActual, anioActual, ventasDetalladas, listaArticulos]);


    //* OBTENER COMPROBANTES DE EGRESOS
    useEffect(() => {
        const obtenerComprobantesEgresos = async () => {
            const datos = { Mes: mesActual, Anio: anioActual };
            try {
                const { data } = await clienteAxios.post(`${import.meta.env.VITE_API_URL}/facturas/informes/egresos`, datos);
                setEgresos(data);

                // Filtrar los egresos del mes actual y guardarlos en egresosMesActual
                const egresosMesActual = data.filter(
                    egreso => egreso.Fecha.includes(`${anioActual}-${mesActual.toString().padStart(2, '0')}`)
                ).map(egreso => ({
                    ...egreso,
                    Total: parseFloat(egreso.Total),
                    CotizacionEspecial: egreso.CajaCodigo === 2 ? parseFloat(egreso.CotizacionEspecial) : egreso.CotizacionEspecial
                }));

                // En egresosMesActual, sólo para los egresos con propiedad CajaCodigo = 2, Reemplazar la propiedad Total por el valor de Total multiplicado por CotizacionEspecial
                egresosMesActual.forEach(egreso => {
                    if (egreso.CajaCodigo === 2) {
                        egreso.Total = egreso.Total * egreso.CotizacionEspecial;
                    }
                });

                setEgresosMesActual(egresosMesActual);

                // Calcular la suma total de los egresos del mes actual
                const total = egresosMesActual.reduce((acc, egreso) => acc + egreso.Total, 0);
                setTotalEgresosMesActual(total);

                // Filtrar los egresos del mes anterior y guardarlos en egresosMesAnterior
                const mesAnterior = mesActual === 1 ? 12 : mesActual - 1;
                const anioAnterior = mesActual === 1 ? anioActual - 1 : anioActual;
                const egresosMesAnterior = data.filter(
                    egreso => egreso.Fecha.includes(`${anioAnterior}-${mesAnterior.toString().padStart(2, '0')}`)
                ).map(egreso => ({
                    ...egreso,
                    Total: parseFloat(egreso.Total),
                    CotizacionEspecial: egreso.CajaCodigo === 2 ? parseFloat(egreso.CotizacionEspecial) : egreso.CotizacionEspecial
                }));

                // En egresosMesAnterior, sólo para los egresos con propiedad CajaCodigo = 2, Reemplazar la propiedad Total por el valor de Total multiplicado por CotizacionEspecial
                egresosMesAnterior.forEach(egreso => {
                    if (egreso.CajaCodigo === 2) {
                        egreso.Total = egreso.Total * egreso.CotizacionEspecial;
                    }
                });

                setEgresosMesAnterior(egresosMesAnterior);

                // Calcular la suma total de los egresos del mes anterior
                const totalAnterior = egresosMesAnterior.reduce((acc, egreso) => acc + egreso.Total, 0);
                setTotalEgresosMesAnterior(totalAnterior);


            } catch (error) {
                console.log(error);
            }
        }
        obtenerComprobantesEgresos();
    }, []);

    return (
        <dataContext.Provider value={{
            mesActual,
            anioActual,
            clientes,
            setClientes,
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
            isLoading,
            setIsLoading,
            usuario,
            setUsuario,
            contadorCotizaciones,
            setContadorCotizaciones,
            cotizaciones,
            setCotizaciones,
            contactos,
            setContactos,
            listasDePrecios,
            setListasDePrecios,
            comprasDetalladas,
            setComprasDetalladas,
            articulosConStock,
            setArticulosConStock,
            valorTotalStock,
            setValorTotalStock,
            totalGananciasMensual,
            setTotalGananciasMensual,
            porentajeGananciasMensual,
            setPorcentajeGananciasMensual,
            egresos,
            setEgresos,
            egresosMesActual,
            setEgresosMesActual,
            egresosMesAnterior,
            setEgresosMesAnterior,
            totalEgresosMesActual,
            setTotalEgresosMesActual,
            totalEgresosMesAnterior,
            setTotalEgresosMesAnterior,
        }}>
            {children}
        </dataContext.Provider>
    );
};

export default DataContextProvider;