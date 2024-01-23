import React, { ReactNode } from "react";
import { useState, useEffect } from "react";
import clienteAxios from '../functions/clienteAxios';
import currency from 'currency.js';

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
    const [selectedItem, setSelectedItem] = useState({});
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



    //* Obtener clientes
    useEffect(() => {
        const obtenerClientes = async () => {
            try {
                const clientes = await clienteAxios.get(`${import.meta.env.VITE_API_URL}/facturas/clientes`);
                setClientes([...clientes.data as Cliente[]]);
            } catch (error) {
                console.log(error);
            }
        }
        obtenerClientes();
    }, []);

    //* Obtener lista de artículos
    useEffect(() => {
        const obtenerArticulos = async () => {
            try {
                const { data } = await clienteAxios.get(`${import.meta.env.VITE_API_URL}/facturas/listaArticulos`);
                console.log(data);
                setListaArticulos(data);
            } catch (error) {
                console.log(error);
            }
        }
        obtenerArticulos();
    }, []);

    useEffect(() => {
        const obtenerItems = async () => {
            try {
                const { data } = await clienteAxios.get(`${import.meta.env.VITE_API_URL}/facturas/items`);
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
                const listaComprobantes = await clienteAxios.get(`${import.meta.env.VITE_API_URL}/facturas/comprobantes`);
                setComprobantes([...listaComprobantes.data as Comprobantes[]]);
            } catch (error) {
                console.log(error);
            }
        }
        obtenerComprobantes();
    }, []);

    //* Obtener las facturas de los clientes de los últimos 3 meses
    useEffect(() => {
        const obtenerFacturas = async () => {
            try {
                const { data } = await clienteAxios.post(`${import.meta.env.VITE_API_URL}/facturas/facturasClientes`, {
                    // mes actual
                    "Mes": mesActual,
                    "Anio": anioActual,
                });
                setFacturasClientes(data);

                const facturasClientesMesActual = data.filter(factura => factura.Fecha.substring(5, 7) == mesActual && factura.Fecha.substring(0, 4) == anioActual);
                const totalMes = facturasClientesMesActual.reduce((total, factura) => total + Number(factura.Total), 0);
                setTotalFacturadoMesActual(totalMes);

                const facturasClientesMesAnterior = data.filter(factura => factura.Fecha.substring(5, 7) == (mesActual === 1 ? 12 : mesActual - 1) && factura.Fecha.substring(0, 4) == (mesActual === 1 ? anioActual - 1 : anioActual));
                const totalMesAnterior = facturasClientesMesAnterior.reduce((total, factura) => total + Number(factura.Total), 0);
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
                const { data } = await clienteAxios.post(`${import.meta.env.VITE_API_URL}/facturas/comprobantesPendientes`);
                setComprobantesPendientes(data);
            } catch (error) {
                console.log(error);
            }
        }
        obtenerComprobantesPendientes();
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
        }}>
            {children}
        </dataContext.Provider>
    );
};

export default DataContextProvider;