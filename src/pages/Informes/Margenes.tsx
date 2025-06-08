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

    // Función para guardar los márgenes en el backend
    const saveMarginsToBackend = async () => {
        try {
            const mesActual = dayjs().format('MM/YY');
            const margenPorCliente = {};

            // Generar márgenes para cada cliente
            ventasDetalladas.forEach(venta => {
                const mesVenta = dayjs(venta.FacturaRegistroFecha).format('MM/YY');
                if (mesVenta !== mesActual) return;

                const cliente = venta.ClienteNombre;
                if (!margenPorCliente[cliente]) {
                    margenPorCliente[cliente] = {
                        totalVentas: 0,
                        totalCosto: 0
                    };
                }

                // Calcular venta y costo del artículo
                const cantidad = parseFloat(venta.LineaCantidad);
                const precioVenta = parseFloat(venta.LineaPrecio);
                const articulo = listaArticulos.find(art => art.Codigo === venta.ArticuloCodigo);
                const costo = parseFloat(articulo?.Costo || 0);

                margenPorCliente[cliente].totalVentas += cantidad * precioVenta;
                margenPorCliente[cliente].totalCosto += cantidad * costo;
            });

            const costos = Object.entries(margenPorCliente).map(([cliente, data]) => {
                const margen = data.totalVentas === 0
                    ? 0
                    : ((data.totalVentas - data.totalCosto) / data.totalCosto * 100);
                return {
                    cliente,
                    margen: margen.toFixed(2)
                };
            });

            // Guardar los márgenes en el backend
            await clienteAxios.post(`${import.meta.env.VITE_API_URL}/costos/costos-historicos`, { listaArticulos: costos });
            console.log('Márgenes guardados correctamente.');
        } catch (error) {
            console.error('Error al guardar los márgenes', error);
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

            for (let i = 0; i < 7; i++) {
                const fecha = dayjs().subtract(i, 'month');
                const mesAnio = fecha.format('MM/YY');
                const mesAnioHistorico = fecha.format('M/YY');

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
                size: 200
            }
        ];

        // Agregar columnas para los últimos 6 meses
        for (let i = 0; i < 7; i++) {
            const fecha = dayjs().subtract(i, 'month');
            const mesAnio = fecha.format('MM/YY');
            cols.push({
                accessorKey: mesAnio,
                header: mesAnio,
                size: 100,
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
                onClick={saveMarginsToBackend}
                className="btn-primary"
                style={{ marginRight: '10px' }}
            >
                Guardar márgenes manualmente
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
