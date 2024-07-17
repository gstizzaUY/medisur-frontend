import { useContext, useState, useEffect, useMemo } from 'react';
import { dataContext } from '../../hooks/DataContext';
import Breadcrumb from '../../components/Breadcrumb';
import Select from 'react-select';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Button } from '@mui/material';
import currency from "currency.js";
import dayjs from 'dayjs';

const VentasDetalladas = () => {
    const { mesActual, anioActual, clientes, ventasDetalladas } = useContext(dataContext);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(() => {
        const clienteGuardado = localStorage.getItem('clienteSeleccionado');
        return clienteGuardado ? JSON.parse(clienteGuardado) : undefined;
    });
    const [ventasFiltradasAgrupadas, setVentasFiltradasAgrupadas] = useState(() => {
        const datosTablaClientes = localStorage.getItem('datosTablaClientes');
        return datosTablaClientes ? JSON.parse(datosTablaClientes) : {};
    });
    const [data, setData] = useState([]);
    const clienteOptions = clientes.map(cliente => ({ value: cliente.Nombre, label: cliente.Nombre }));


    const handleChangeCliente = selectedOption => {
        const cliente = clientes.find(cliente => cliente.Nombre === selectedOption.value);
        setClienteSeleccionado(cliente);
        localStorage.setItem('clienteSeleccionado', JSON.stringify(cliente));
    };

    const handleConsultar = () => {
        if (!clienteSeleccionado) {
            console.error('No se ha seleccionado ningún cliente');
            return;
        }
        const ventasFiltradas = ventasDetalladas.filter(venta => venta.ClienteCodigo === clienteSeleccionado.Codigo);
        const ventasAgrupadas = ventasFiltradas.reduce((acumulador, venta) => {
            const fecha = dayjs(venta.FacturaRegistroFecha);
            const mesAni = `${fecha.month() + 1}-${fecha.year()}`;
            let productoExistente = acumulador[venta.ArticuloCodigo];
            if (!productoExistente) {
                productoExistente = {
                    codigo: venta.ArticuloCodigo,
                    nombre: venta.ArticuloNombre,
                    Cantidad: {},
                    Precio: {}
                };
                acumulador[venta.ArticuloCodigo] = productoExistente;
            }
            if (!productoExistente.Cantidad[mesAni]) {
                productoExistente.Cantidad[mesAni] = 0;
                productoExistente.Precio[mesAni] = { total: 0, count: 0 };
            }
            productoExistente.Cantidad[mesAni] += Number(venta.LineaCantidad);
            productoExistente.Precio[mesAni].total += Number(venta.LineaPrecio) * Number(venta.LineaCantidad);
            productoExistente.Precio[mesAni].count += Number(venta.LineaCantidad);
            return acumulador;
        }, {});
        for (let codigo in ventasAgrupadas) {
            let producto = ventasAgrupadas[codigo];
            for (let mesAni in producto.Precio) {
                if (producto.Precio[mesAni].count) {
                    producto.Precio[mesAni] = producto.Precio[mesAni].total / producto.Precio[mesAni].count;
                }
            }
        }
        setVentasFiltradasAgrupadas(Object.values(ventasAgrupadas));
        localStorage.setItem('datosTablaClientes', JSON.stringify(Object.values(ventasAgrupadas)));
    }

    useEffect(() => {
        const data = Object.values(ventasFiltradasAgrupadas).map(producto => {
            const { codigo, nombre, Cantidad, Precio } = producto;
            const row = { codigo, nombre };

            for (let mesAni in Cantidad) {
                let [mes, anio] = mesAni.split('-');
                mes = mes.padStart(2, '0');
                anio = anio.slice(-2);
                const newMesAni = `${mes}/${anio}`;
                row[`Cantidad_${newMesAni}`] = `${Cantidad[mesAni]} (${currency(Precio[mesAni], { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format()})`;
            }
            return row;
        });
        setData(data);
    }, [ventasFiltradasAgrupadas]);

    const columns = useMemo(() => {
        const cols = [
            { accessorKey: 'codigo', header: 'Código', size: 50 },
            { accessorKey: 'nombre', header: 'Nombre del Artículo', sortDescFirst: true, size: 200 },
        ];
        for (let i = 0; i < 7; i++) {
            let mes = mesActual - i;
            let anio = anioActual;
            if (mes < 1) {
                mes += 12;
                anio -= 1;
            }
            const mesAni = `${mes.toString().padStart(2, '0')}/${anio.toString().slice(-2)}`;
            cols.push({ accessorKey: `Cantidad_${mesAni}`, header: `${mesAni}`, size: 140 });
        }
        return cols;
    }, [mesActual, anioActual]);

    const table = useMaterialReactTable({
        columns,
        data,
        localization: MRT_Localization_ES,
        enableTopToolbar: false,
        positionActionsColumn: "last",
        globalFilterFn: 'contains',
        enableGlobalFilterRankedResults: true,
        enableStickyHeader: true,
        enableStickyFooter: true,
        muiTableContainerProps: { sx: { maxHeight: 430 } },
        initialState: {
            pagination: { pageIndex: 0, pageSize: 100 },
            density: 'compact',
            sorting: [
                { id: 'nombre', desc: false },
            ],
            columnVisibility: {
                'codigo': false,
            },
        },
    });

    return (
        <>
            <Breadcrumb pageName="Ventas Detalladas" />
            <div className="grid grid-cols-12 gap-4 mb-6">
                <div className="col-span-12 md:col-span-6">
                    <Select
                        className="z-50 bg-gray-200 appearance-none rounded w-full py-0 px-0 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                        styles={{
                            control: (baseStyles, state) => ({
                                ...baseStyles,
                                backgroundColor: '#FFFFFF',
                                border: '2px',
                                '&:hover': { backgroundColor: '#FFFFFF' },
                            }),
                        }}
                        placeholder="Seleccione un cliente"
                        defaultValue={clienteOptions.find(cliente => cliente.value === clienteSeleccionado?.Nombre) || ''}
                        isClearable={true}
                        isSearchable={true}
                        name="cliente"
                        options={clienteOptions}
                        onChange={handleChangeCliente}
                    />
                </div>
                <div className="col-span-12 md:col-span-6">
                    <Button
                        style={{ backgroundColor: '#00aaad', color: 'white' }}
                        variant="contained"
                        className="mb-2"
                        onClick={handleConsultar}>
                        Consultar
                    </Button>
                </div>
            </div>
            <MaterialReactTable
                table={table}
            />
        </>
    );
};

export default VentasDetalladas;