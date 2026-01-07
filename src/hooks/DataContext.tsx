import React, { ReactNode } from "react";
import { useState, useEffect } from "react";
import clienteAxios from '../functions/clienteAxios';
import dayjs from 'dayjs';

export const dataContext = React.createContext({});

type DataContextProviderProps = {
    children: ReactNode;
};

type Cliente = {
    "AbreviacionMoneda": string,
    "Activo": string,
    "CategoriaCodigo": string,
    "CategoriaNombre": string,
    "Codigo": string,
    "CodigoContable": string,
    "ComprobantesPorCliente": string,
    "CondicionCodigo": string,
    "CondicionNombre": string,
    "EmailAdministracion": string,
    "ExentoIVA": string,
    "FechaRegistro": string,
    "LocalCodigo": number,
    "LocalNombre": string,
    "MonedaCodigo": number,
    "Nombre": string,
    "PorcentajeDto1": number,
    "PorcentajeDto2": number,
    "PorcentajeDto3": number,
    "PrecioVentaCodigo": string,
    "PrecioVentaNombre": string,
    "SimboloMoneda": string,
    "TextoPredefinidoAbreviacion": string,
    "TextoPredefinidoCodigo": string,
    "TextoPredefinidoNombre": string,
    "TopACreditoDias": number,
    "TopeCreditoMonto": string,
    "VendedorCodigo": string,
    "VendedorNombre": string,
};

type Comprobantes = {
    "Abreviacion": string,
    "Activo": string,
    "CFE": string,
    "Codigo": number,
    "ComprobanteGastos": string,
    "ComprobanteResguardo": string,
    "ConceptoOgligatorio": string,
    "Contingencia": string,
    "DepositoDestinoCodigo": number,
    "DepositoDestinoNombre": string,
    "DepositoOrigenCodigo": number,
    "DepositoOrigenNombre": string,
    "Exportacion": string,
    "FormaPagoCodigo": number,
    "FormatoCodigo": string,
    "FormatoNombre": string,
    "IVA": string,
    "IncluirEnFichaComprobantes": string,
    "IncluirEnLibros": string,
    "LocalCodigo": number,
    "LocalNombre": string,
    "Nombre": string,
    "NotaDebito": string,
    "Notas": string,
    "NumeradorCodigo": string,
    "NumeradorNombre": string,
    "PendienteFacturacionRemision": string,
    "PermiteSalidasSinStock": string,
    "RemitoInterno": string,
    "SolicitaDatosReparto": string,
    "Tipo": number,
    "TipoNombre": string,
    "TomarParaActualizarCostos": string,
};

interface Factura {
    ClienteCodigo: string;
    ClienteZonaCodigo: string;
    Fecha: string;
    ComprobanteCodigo: number;
    Total: string;
    Subtotal: string;
    IVA: string;
}

interface ComprobantePendiente {
    ClienteCodigo: string;
    Fecha: string;
    CondicionCodigo: string;
    ClienteZona?: string;
    Vencido?: boolean;
}

interface Articulo {
    Codigo: string;
    Nombre: string;
    Costo: string;
    Stock?: string;
    StockValorizado?: number;
    FechaRegistro?: string;
    ProveedorNombre?: string;
}

interface VentaDetallada {
    FacturaMes: number;
    FacturaAnio: number;
    ArticuloCodigo: string;
    LineaCantidad: string;
    LineaPrecio: string;
}

interface Egreso {
    Fecha: string;
    CajaCodigo: number;
    SubTotal: number;
    CotizacionEspecial: number | string;
}

interface ItemStock {
    ArticuloCodigo: string;
    StockActual: string;
}

const DataContextProvider = ({ children }: DataContextProviderProps) => {
    const [usuario, setUsuario] = useState({} as any);
    const [diaActual, setDiaActual] = React.useState<string>('');
    const [diaVencimiento, setDiaVencimiento] = React.useState<string>('');
    const mesActual = new Date().getMonth() + 1;
    const anioActual = new Date().getFullYear();
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [comprobantes, setComprobantes] = useState<Comprobantes[]>([]);
    const [precioCosto, setPrecioCosto] = useState(0);
    const [precioVenta, setPrecioVenta] = useState(0);
    const [ultimoPrecio, setUltimoPrecio] = useState(0);
    const [articulos, setArticulos] = useState<any[]>([]);
    const [notas, setNotas] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedCliente, setSelectedCliente] = useState('');
    const [selectedCantidad, setSelectedCantidad] = useState('');
    const [selectedComprobante, setSelectedComprobante] = useState('');
    const [selectedFechaFactura, setSelectedFechaFactura] = useState('');
    const [movimiento, setMovimiento] = useState({});
    const [facturasClientes, setFacturasClientes] = useState<Factura[]>([]);
    const [totalFacturadoMesActual, setTotalFacturadoMesActual] = useState(0);
    const [subtotalFacturadoMesActual, setSubtotalFacturadoMesActual] = useState(0);
    const [ivaFacturadoMesActual, setIvaFacturadoMesActual] = useState(0);
    const [totalFacturadoMesAnterior, setTotalFacturadoMesAnterior] = useState(0);
    const [subTotalFacturadoMesAnterior, setSubTotalFacturadoMesAnterior] = useState(0);
    const [ivaFacturadoMesAnterior, setIvaFacturadoMesAnterior] = useState(0);
    const [comprobantesPendientes, setComprobantesPendientes] = useState<ComprobantePendiente[]>([]);
    const [listaArticulos, setListaArticulos] = useState<Articulo[]>([]);
    const [ventasDetalladas, setVentasDetalladas] = useState<VentaDetallada[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [contadorCotizaciones, setContadorCotizaciones] = React.useState('');
    const [cotizaciones, setCotizaciones] = React.useState<any[]>([]);
    const [contactos, setContactos] = React.useState<any[]>([]);
    const [listasDePrecios, setListasDePrecios] = React.useState<any[]>([]);
    const [comprasDetalladas, setComprasDetalladas] = React.useState<any[]>([]);
    const [articulosConStock, setArticulosConStock] = React.useState<Articulo[]>([]);
    const [valorTotalStock, setValorTotalStock] = React.useState(0);
    const [totalGananciasMensual, setTotalGananciasMensual] = React.useState(0);
    const [porentajeGananciasMensual, setPorcentajeGananciasMensual] = React.useState(0);
    const [egresos, setEgresos] = React.useState<Egreso[]>([]);
    const [egresosMesActual, setEgresosMesActual] = React.useState<Egreso[]>([]);
    const [egresosMesAnterior, setEgresosMesAnterior] = React.useState<Egreso[]>([]);
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
        setDiaVencimiento(new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    }, []);

    //* OBTENER CLIENTES
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

    //* OBTENER LISTA DE ARTÍCULOS
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

    //* Obtener las facturas de los clientes
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
                const facturasClientesMesActual = data.filter((factura: Factura) => factura.Fecha.substring(5, 7) == String(mesActual).padStart(2, '0') && factura.Fecha.substring(0, 4) == String(anioActual));
                const ventasMesActual = facturasClientesMesActual.filter((factura: Factura) => factura.ComprobanteCodigo === 701 || factura.ComprobanteCodigo === 703);
                const totalVentasMesActual = ventasMesActual.reduce((total: number, factura: Factura) => total + Number(factura.Total), 0);
                const devolucionesMesActual = facturasClientesMesActual.filter((factura: Factura) => factura.ComprobanteCodigo === 702 || factura.ComprobanteCodigo === 704);
                const totalDevolucionesMesActual = devolucionesMesActual.reduce((total: number, factura: Factura) => total + Number(factura.Total), 0);
                const totalMesActual = totalVentasMesActual - totalDevolucionesMesActual;
                setTotalFacturadoMesActual(totalMesActual);

                const subtotalVentasMesActual = ventasMesActual.reduce((total: number, factura: Factura) => total + Number(factura.Subtotal), 0);
                const subtotalDevolucionesMesActual = devolucionesMesActual.reduce((total: number, factura: Factura) => total + Number(factura.Subtotal), 0);
                const SubTotalMesActual = subtotalVentasMesActual - subtotalDevolucionesMesActual;
                setSubtotalFacturadoMesActual(SubTotalMesActual);

                const ivaVentasMesActual = ventasMesActual.reduce((total: number, factura: Factura) => total + Number(factura.IVA), 0);
                const ivaDevolucionesMesActual = devolucionesMesActual.reduce((total: number, factura: Factura) => total + Number(factura.IVA), 0);
                const IVA_MesActual = ivaVentasMesActual - ivaDevolucionesMesActual;
                setIvaFacturadoMesActual(IVA_MesActual);

                //* FACTURAS MES ANTERIOR
                const facturasClientesMesAnterior = data.filter((factura: Factura) => factura.Fecha.substring(5, 7) == String(mesActual === 1 ? 12 : mesActual - 1).padStart(2, '0') && factura.Fecha.substring(0, 4) == String(mesActual === 1 ? anioActual - 1 : anioActual));
                const ventasMesAnterior = facturasClientesMesAnterior.filter((factura: Factura) => factura.ComprobanteCodigo === 701 || factura.ComprobanteCodigo === 703);
                const totalVentasMesAnterior = ventasMesAnterior.reduce((total: number, factura: Factura) => total + Number(factura.Total), 0);
                const devolucionesMesAnterior = facturasClientesMesAnterior.filter((factura: Factura) => factura.ComprobanteCodigo === 702 || factura.ComprobanteCodigo === 704);
                const totalDevolucionesMesAnterior = devolucionesMesAnterior.reduce((total: number, factura: Factura) => total + Number(factura.Total), 0);
                const totalMesAnterior = totalVentasMesAnterior - totalDevolucionesMesAnterior;
                setTotalFacturadoMesAnterior(totalMesAnterior);

                const subtotalVentasMesAnterior = ventasMesAnterior.reduce((total: number, factura: Factura) => total + Number(factura.Subtotal), 0);
                const subtotalDevolucionesMesAnterior = devolucionesMesAnterior.reduce((total: number, factura: Factura) => total + Number(factura.Subtotal), 0);
                const SubTotalMesAnterior = subtotalVentasMesAnterior - subtotalDevolucionesMesAnterior;
                setSubTotalFacturadoMesAnterior(SubTotalMesAnterior);

                const ivaVentasMesAnterior = ventasMesAnterior.reduce((total: number, factura: Factura) => total + Number(factura.IVA), 0);
                const ivaDevolucionesMesAnterior = devolucionesMesAnterior.reduce((total: number, factura: Factura) => total + Number(factura.IVA), 0);
                const IVA_MesAnterior = ivaVentasMesAnterior - ivaDevolucionesMesAnterior;
                setIvaFacturadoMesAnterior(IVA_MesAnterior);

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

                const comprobantesPendientes = data.map((comprobante: ComprobantePendiente) => {
                    const facturaCliente = facturasClientes.find(factura => factura.ClienteCodigo === comprobante.ClienteCodigo);
                    return facturaCliente ? { ...comprobante, ClienteZona: facturaCliente.ClienteZonaCodigo } : { ...comprobante, ClienteZona: '' };
                });

                const hoy = dayjs().format('YYYY-MM-DD');
                const comprobantesPendientesConVencimiento = comprobantesPendientes.map((comprobante: ComprobantePendiente) => {
                    const fechaVencimiento = dayjs(comprobante.Fecha).add(60, 'day').format('YYYY-MM-DD');
                    const vencido = fechaVencimiento < hoy;
                    return vencido ? { ...comprobante, Vencido: true } : { ...comprobante, Vencido: false };
                });

                setComprobantesPendientes(comprobantesPendientesConVencimiento);
                setIsLoading(false);
            } catch (error) {
                console.log(error);
            }
        }
        obtenerComprobantesPendientes();
    }, [facturasClientes]);

    //* Obtener ventas detalladas
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

    //* Obtener Cotizaciones
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
                const dataMap = new Map<string, ItemStock>(data.map((item: ItemStock) => [item.ArticuloCodigo, item]));

                let articulosMap = new Map<string, Articulo>();
                listaArticulos.filter(articulo => articulo !== null).forEach(articulo => {
                    const item = dataMap.get(articulo.Codigo);
                    const articuloConStock: Articulo = item ? { ...articulo, Stock: item.StockActual } : { ...articulo, Stock: "0.00000" };
                    articulosMap.set(articulo.Codigo, articuloConStock);
                });

                articulosMap.forEach((articulo: Articulo, codigo: string) => {
                    const comprasFiltradas = comprasDetalladas.filter((compra: any) => compra.ArticuloCodigo === codigo);
                    if (comprasFiltradas.length > 0) {
                        const fechaUltimaCompra = comprasFiltradas.reduce((acumulador: Date, compra: any) => {
                            const fecha = new Date(compra.FacturaFecha);
                            return fecha > acumulador ? fecha : acumulador;
                        }, new Date(0));
                        articulo.FechaRegistro = fechaUltimaCompra.toISOString().split('T')[0];
                        articulo.ProveedorNombre = comprasFiltradas[0].ProveedorNombre;
                    } else {
                        articulo.FechaRegistro = "";
                        articulo.ProveedorNombre = "";
                    }
                    const stock = parseFloat(articulo.Stock || '0');
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
        const valorTotal = articulosConStock.reduce((total: number, articulo: Articulo) => total + Number(articulo.StockValorizado || 0), 0);
        setValorTotalStock(valorTotal);
    }, [articulosConStock]);

    //* GANANCIAS POR ARTÍCULO
    useEffect(() => {
        const obtenerGananciaTotalMes = async () => {
            const ventasDelMes = ventasDetalladas.filter(
                (venta: VentaDetallada) => venta.FacturaMes === mesActual && venta.FacturaAnio === anioActual
            );

            const agrupadasPorArticulo = ventasDelMes.reduce((acc: any, venta: VentaDetallada) => {
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
                const articulo = listaArticulos.find((art: Articulo) => art.Codigo === codigo);
                const costoUnitario = parseFloat(articulo?.Costo || '0');
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

                const egresosMesActual = data.filter(
                    (egreso: Egreso) => egreso.Fecha.includes(`${anioActual}-${mesActual.toString().padStart(2, '0')}`)
                ).map((egreso: Egreso) => ({
                    ...egreso,
                    SubTotal: parseFloat(String(egreso.SubTotal)),
                    CotizacionEspecial: egreso.CajaCodigo === 2 ? parseFloat(String(egreso.CotizacionEspecial)) : egreso.CotizacionEspecial
                }));

                egresosMesActual.forEach((egreso: Egreso) => {
                    if (egreso.CajaCodigo === 2) {
                        egreso.SubTotal = egreso.SubTotal * Number(egreso.CotizacionEspecial);
                    }
                });

                setEgresosMesActual(egresosMesActual);

                const total = egresosMesActual.reduce((acc: number, egreso: Egreso) => acc + egreso.SubTotal, 0);
                setTotalEgresosMesActual(total);

                const mesAnterior = mesActual === 1 ? 12 : mesActual - 1;
                const anioAnterior = mesActual === 1 ? anioActual - 1 : anioActual;
                const egresosMesAnterior = data.filter(
                    (egreso: Egreso) => egreso.Fecha.includes(`${anioAnterior}-${mesAnterior.toString().padStart(2, '0')}`)
                ).map((egreso: Egreso) => ({
                    ...egreso,
                    SubTotal: parseFloat(String(egreso.SubTotal)),
                    CotizacionEspecial: egreso.CajaCodigo === 2 ? parseFloat(String(egreso.CotizacionEspecial)) : egreso.CotizacionEspecial
                }));

                egresosMesAnterior.forEach((egreso: Egreso) => {
                    if (egreso.CajaCodigo === 2) {
                        egreso.SubTotal = egreso.SubTotal * Number(egreso.CotizacionEspecial);
                    }
                });

                setEgresosMesAnterior(egresosMesAnterior);

                const totalAnterior = egresosMesAnterior.reduce((acc: number, egreso: Egreso) => acc + egreso.SubTotal, 0);
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
            subtotalFacturadoMesActual,
            setSubtotalFacturadoMesActual,
            ivaFacturadoMesActual,
            setIvaFacturadoMesActual,
            subTotalFacturadoMesAnterior,
            setSubTotalFacturadoMesAnterior,
            ivaFacturadoMesAnterior,
            setIvaFacturadoMesAnterior,
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