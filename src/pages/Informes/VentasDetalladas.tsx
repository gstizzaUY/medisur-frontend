import React from 'react';
import { useMemo } from 'react';
import { dataContext } from '../../hooks/DataContext';
import Breadcrumb from '../../components/Breadcrumb';
import Select from 'react-select';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Button } from '@mui/material';
import currency from "currency.js";

const VentasDetalladas = () => {
    const { mesActual, setMesActual } = React.useContext(dataContext);
    const { anioActual, setAnioActual } = React.useContext(dataContext);
    const { clientes, setClientes } = React.useContext(dataContext);
    const { ventasDetalladas, setVentasDetalladas } = React.useContext(dataContext);
    const [clienteSeleccionado, setClienteSeleccionado] = React.useState(undefined);
    const [ventasFiltradas, setVentasFiltradas] = React.useState({});
    const [ventasFiltradasAgrupadas, setVentasFiltradasAgrupadas] = React.useState({});
    const [data, setData] = React.useState([]);


    const clienteOptions = clientes.map(cliente => ({ value: cliente.Nombre, label: cliente.Nombre }));
    const handleChangeCliente = selectedOption => {
        setClienteSeleccionado(clientes.find(cliente => cliente.Nombre === selectedOption.value));
    };

    const handleConsultar = () => {
        // Verificar si clienteSeleccionado es undefined
        if (!clienteSeleccionado) {
            console.error('No se ha seleccionado ningún cliente');
            return;
        }

        // filtrar de ventasDetalladas por clienteSeleccionado
        const ventasFiltradas = ventasDetalladas.filter(venta => venta.ClienteCodigo === clienteSeleccionado.Codigo);
        setVentasFiltradas(ventasFiltradas);

        // Usando la propiedad "FacturaRegistroFecha" de cada venta, por cada producto las ventas de ese producto por cada mes
        const ventasFiltradasAgrupadas = ventasFiltradas.reduce((acumulador, venta) => {
            const fecha = new Date(venta.FacturaRegistroFecha);
            const mes = fecha.getMonth() + 1; // Ajuste para obtener el mes correcto
            const anio = fecha.getFullYear();
            const mesAni = `${mes}-${anio}`;

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
            productoExistente.Precio[mesAni].total += Number(venta.LineaPrecio) * Number(venta.LineaCantidad); // Multiplicar el precio por la cantidad
            productoExistente.Precio[mesAni].count += Number(venta.LineaCantidad); // Sumar la cantidad a count

            return acumulador;
        }, {});

        // Calcular el promedio de los precios
        for (let codigo in ventasFiltradasAgrupadas) {
            let producto = ventasFiltradasAgrupadas[codigo];
            for (let mesAni in producto.Precio) {
                if (producto.Precio[mesAni].count) {
                    producto.Precio[mesAni] = producto.Precio[mesAni].total / producto.Precio[mesAni].count;
                }
            }
        }
        setVentasFiltradasAgrupadas(Object.values(ventasFiltradasAgrupadas));
    }


    React.useEffect(() => {
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
        for (let i = 0; i < 5; i++) {
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
        localization: MRT_Localization_ES,
        data,
        enableTopToolbar: false,
        positionActionsColumn: "last",
        globalFilterFn: 'contains', //turn off fuzzy matching and use simple contains filter function
        enableGlobalFilterRankedResults: true,
        initialState: {
            density: 'compact',
            pagination: {
                pageSize: 10,
            },
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
                {/* Columna 1 */}
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
                        defaultValue={clienteOptions[0]}
                        isClearable={true}
                        isSearchable={true}
                        name="cliente"
                        options={clienteOptions}
                        onChange={handleChangeCliente}
                    />
                </div>
                {/* Agregar botón "Consultar" 2 */}
                <div className="col-span-12 md:col-span-6">
                    <Button variant="contained" className="mb-2" onClick={handleConsultar}>
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