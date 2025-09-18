import React, { useContext, useMemo, useEffect, useState } from 'react';
import { dataContext } from '../../hooks/DataContext';
import Breadcrumb from '../../components/Breadcrumb';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import currency from 'currency.js';
import dayjs from 'dayjs';
import clienteAxios from '../../functions/clienteAxios';

const Margenes = () => {
    const { facturasClientes, ventasDetalladas, listaArticulos } = useContext(dataContext);

    const [costosHistoricos, setCostosHistoricos] = useState<any>({});
    const [loading, setLoading] = useState<boolean>(true);

    // Función auxiliar para determinar el color según el margen
    const getMarginColor = (margin: number): string => {
        if (margin < 20) return '#FF0000'; // Rojo
        if (margin <= 50) return '#000000'; // Negro
        return '#008000'; // Verde
    };

    // Función para comprobar si hoy es el último día del mes
    const isLastDayOfMonth = (date: dayjs.Dayjs): boolean => {
        return date.isSame(date.endOf('month'), 'day');
    };

    // Función para guardar los costos históricos manualmente
    const saveCostosHistoricos = async () => {
        try {
            console.log('🔄 Guardando costos históricos del mes actual...');
            
            // Usar la lista de artículos actual con sus costos
            const mesActual = dayjs().format('MM/YY');
            
            // Enviar la lista completa de artículos con sus costos actuales
            const response = await clienteAxios.post(`${import.meta.env.VITE_API_URL}/costos/costos-historicos`, { 
                listaArticulos: listaArticulos, // Lista completa de artículos con Codigo y Costo
                mesAño: mesActual // Mes actual en formato MM/YY
            });
            
            console.log('✅ Costos históricos guardados correctamente:', response.data);
            
            // Recargar los costos históricos para actualizar la vista
            const updatedCostos = await clienteAxios.get(`${import.meta.env.VITE_API_URL}/costos/costos-historicos`);
            setCostosHistoricos(updatedCostos.data);
            
        } catch (error) {
            console.error('❌ Error al guardar los costos históricos', error);
        }
    };

    // Recuperar los costos históricos desde el backend
    useEffect(() => {
        const fetchCostosHistoricos = async () => {
            try {
                const response = await clienteAxios.get(`${import.meta.env.VITE_API_URL}/costos/costos-historicos`);
                setCostosHistoricos(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error al obtener los costos históricos', error);
                setLoading(false);
            }
        };

        fetchCostosHistoricos();
    }, []);

    // Revisar si es el último día del mes y guardar los márgenes
    // useEffect(() => {
    //     const today = dayjs();
    //     if (isLastDayOfMonth(today)) {
    //         saveMarginsToBackend();
    //     }
    // }, []);

    // Modificar el useMemo de data
    const data = useMemo(() => {
        const margenesPorCliente = {};
        const mesActual = dayjs().format('MM/YY');

        // Procesar todas las ventas (no solo las actuales)
        ventasDetalladas.forEach(venta => {
            const mesVenta = dayjs(venta.FacturaRegistroFecha).format('MM/YY');
            const cliente = venta.ClienteNombre;
            const zona = venta.ZonaCodigo;

            if (!margenesPorCliente[cliente]) {
                margenesPorCliente[cliente] = {
                    ClienteZonaCodigo: zona,
                    ventasPorMes: {}
                };
            }

            if (!margenesPorCliente[cliente].ventasPorMes[mesVenta]) {
                margenesPorCliente[cliente].ventasPorMes[mesVenta] = {
                    totalVentas: 0,
                    ventasPorArticulo: {}
                };
            }

            const cantidad = parseFloat(venta.LineaCantidad);
            const precioVenta = parseFloat(venta.LineaPrecio);
            const articuloCodigo = venta.ArticuloCodigo;

            if (!margenesPorCliente[cliente].ventasPorMes[mesVenta].ventasPorArticulo[articuloCodigo]) {
                margenesPorCliente[cliente].ventasPorMes[mesVenta].ventasPorArticulo[articuloCodigo] = {
                    cantidad: 0,
                    venta: 0
                };
            }

            margenesPorCliente[cliente].ventasPorMes[mesVenta].totalVentas += cantidad * precioVenta;
            margenesPorCliente[cliente].ventasPorMes[mesVenta].ventasPorArticulo[articuloCodigo].cantidad += cantidad;
            margenesPorCliente[cliente].ventasPorMes[mesVenta].ventasPorArticulo[articuloCodigo].venta += cantidad * precioVenta;
        });

        const result = Object.entries(margenesPorCliente).map(([cliente, data]) => {
            const resultRow = {
                nombre: cliente,
                ClienteZonaCodigo: data.ClienteZonaCodigo
            };

            for (let i = 0; i < 12; i++) {
                const fecha = dayjs().subtract(i, 'month');
                const mesAnio = fecha.format('MM/YY');
                // Usar el mismo formato para datos históricos que para datos actuales
                const mesAnioHistorico = fecha.format('MM/YY');

                const ventasMes = data.ventasPorMes[mesAnio];

                // En el mes actual, modificar:
                if (mesAnio === mesActual) {
                    // Para el mes actual usamos los costos actuales
                    let totalVentas = 0;
                    let totalCosto = 0;

                    if (ventasMes) {
                        Object.entries(ventasMes.ventasPorArticulo).forEach(([articuloCodigo, datos]) => {
                            const articulo = listaArticulos.find(art => art.Codigo === articuloCodigo);
                            if (articulo) {
                                totalVentas += datos.venta;
                                totalCosto += datos.cantidad * parseFloat(articulo.Costo || '0');
                            }
                        });
                    }

                    resultRow[mesAnio] = {
                        value: totalVentas === 0 || totalCosto === 0 ? '' : `${((totalVentas - totalCosto) / totalCosto * 100).toFixed(2).replace('.', ',')}%`,
                        color: totalVentas === 0 || totalCosto === 0 ? '#000000' : getMarginColor((totalVentas - totalCosto) / totalCosto * 100),
                        rawValue: totalVentas === 0 || totalCosto === 0 ? 0 : (totalVentas - totalCosto) / totalCosto * 100
                    };

                } else {
                    // Para meses anteriores usamos los costos históricos
                    let totalVentas = 0;
                    let totalCosto = 0;

                    if (ventasMes) {
                        Object.entries(ventasMes.ventasPorArticulo).forEach(([articuloCodigo, datos]) => {
                            const costoHistorico = costosHistoricos[articuloCodigo]?.[mesAnioHistorico];
                            if (costoHistorico) {
                                totalVentas += datos.venta;
                                totalCosto += datos.cantidad * parseFloat(costoHistorico);
                            }
                        });

                        resultRow[mesAnio] = {
                            value: totalVentas === 0 || totalCosto === 0 ? '' : `${((totalVentas - totalCosto) / totalCosto * 100).toFixed(2).replace('.', ',')}%`,
                            color: totalVentas === 0 || totalCosto === 0 ? '#000000' : getMarginColor((totalVentas - totalCosto) / totalCosto * 100),
                            rawValue: totalVentas === 0 || totalCosto === 0 ? 0 : (totalVentas - totalCosto) / totalCosto * 100
                        };
                    } else {
                        resultRow[mesAnio] = {
                            value: '',
                            color: '#000000',
                            rawValue: 0
                        };
                    }
                }
            }

            return resultRow;
        });

        return result;
    }, [ventasDetalladas, listaArticulos, costosHistoricos]);

    const columns = useMemo(() => {
        const cols = [
            {
                id: 'zona',
                accessorKey: 'ClienteZonaCodigo',
                header: 'Zona',
                size: 90,
                enableSorting: true,
                Cell: ({ cell }) => (
                    <div style={{ textAlign: 'center' }}>
                        {cell.getValue()}
                    </div>
                ),
                Header: () => (
                    <div style={{
                        textAlign: 'right',
                        color: 'black',
                        fontWeight: 'bold'
                    }}>
                        Zona
                    </div>
                )
            },
            {
                accessorKey: 'nombre',
                header: 'Cliente',
                size: 180 // Reducir de 200 a 180 para optimizar espacio con 12 meses
            }
        ];

        // Agregar columnas para los últimos 12 meses
        for (let i = 0; i < 12; i++) {
            const fecha = dayjs().subtract(i, 'month');
            const mesAnio = fecha.format('MM/YY');
            cols.push({
                accessorKey: mesAnio,
                header: mesAnio,
                size: 80, // Reducir de 100 a 80 para acomodar 12 meses
                muiTableHeadCellProps: { align: 'right' },
                muiTableBodyCellProps: { align: 'right' },
                Cell: ({ cell }) => {
                    const value = cell.getValue();
                    return (
                        <div style={{
                            textAlign: 'right',
                            color: value.color
                        }}>
                            {value.value}
                        </div>
                    );
                },
                sortingFn: (rowA, rowB, columnId) => {
                    return rowA.original[columnId].rawValue - rowB.original[columnId].rawValue;
                }
            });
        }

        return cols;


    }, [costosHistoricos]);

    const table = useMaterialReactTable({
        columns,
        data,
        layoutMode: 'grid-no-grow',
        localization: MRT_Localization_ES,
        enableTopToolbar: true,
        enableGlobalFilterRankedResults: true,
        enableStickyHeader: true,
        muiTableContainerProps: { sx: { maxHeight: 430 } },
        initialState: {
            pagination: { pageIndex: 0, pageSize: 100 },
            density: 'compact',
            sorting: [{ id: 'nombre', desc: false }]
        },
        renderTopToolbarCustomActions: () => (
            <button
                onClick={saveCostosHistoricos}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
                style={{ marginRight: '10px' }}
            >
                <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                </svg>
                Guardar costos del mes actual
            </button>
        )
    });

    return (
        <>
            <Breadcrumb pageName="Márgenes por Cliente" />
            {loading ? (
                <p>Cargando...</p>
            ) : (
                <MaterialReactTable table={table} />
            )}
        </>
    );
};

export default Margenes;
