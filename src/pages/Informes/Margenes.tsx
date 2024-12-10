import React, { useContext, useMemo } from 'react';
import { dataContext } from '../../hooks/DataContext';
import Breadcrumb from '../../components/Breadcrumb';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import currency from "currency.js";
import dayjs from 'dayjs';

const Margenes = () => {
    const { facturasClientes, ventasDetalladas, listaArticulos } = useContext(dataContext);

    // Función auxiliar para determinar el color según el margen
    const getMarginColor = (margin: number): string => {
        if (margin < 20) return '#FF0000'; // Rojo
        if (margin <= 50) return '#000000'; // Negro
        return '#008000'; // Verde
    };

    const data = useMemo(() => {
        const margenesPorCliente = {};

        // Agrupar ventas por cliente y mes
        ventasDetalladas.forEach(venta => {
            const mesAnio = dayjs(venta.FacturaRegistroFecha).format('MM/YY');
            const cliente = venta.ClienteNombre;
            const zona = venta.ZonaCodigo;

            if (!margenesPorCliente[cliente]) {
                margenesPorCliente[cliente] = { 
                    ClienteZonaCodigo: zona,
                    ventasPorMes: {}
                };
            }

            if (!margenesPorCliente[cliente].ventasPorMes[mesAnio]) {
                margenesPorCliente[cliente].ventasPorMes[mesAnio] = {
                    totalVentas: 0,
                    totalCosto: 0
                };
            }

            // Calcular venta y costo del artículo
            const cantidad = parseFloat(venta.LineaCantidad);
            const precioVenta = parseFloat(venta.LineaPrecio);
            const articulo = listaArticulos.find(art => art.Codigo === venta.ArticuloCodigo);
            const costo = parseFloat(articulo?.Costo || 0);

            // Acumular totales
            margenesPorCliente[cliente].ventasPorMes[mesAnio].totalVentas += cantidad * precioVenta;
            margenesPorCliente[cliente].ventasPorMes[mesAnio].totalCosto += cantidad * costo;
        });

        // Calcular márgenes por mes
        const result = Object.entries(margenesPorCliente).map(([cliente, data]) => {
            const resultRow = {
                nombre: cliente,
                ClienteZonaCodigo: data.ClienteZonaCodigo
            };

            // Obtener últimos 6 meses
            for (let i = 0; i < 7; i++) {
                const fecha = dayjs().subtract(i, 'month');
                const mesAnio = fecha.format('MM/YY');
                const mesData = data.ventasPorMes[mesAnio];

                if (mesData && mesData.totalCosto > 0) {
                    const margen = ((mesData.totalVentas - mesData.totalCosto) / mesData.totalVentas * 100);
                    resultRow[mesAnio] = {
                        value: `${margen.toFixed(2).replace('.', ',')}%`,
                        color: getMarginColor(margen),
                        rawValue: margen // Para ordenamiento
                    };
                } else {
                    resultRow[mesAnio] = {
                        value: '-',
                        color: '#000000',
                        rawValue: 0
                    };
                }
            }

            return resultRow;
        });

        return result;
    }, [ventasDetalladas, listaArticulos]);

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
    }, []);

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
        }
    });

    return (
        <>
            <Breadcrumb pageName="Márgenes por Cliente" />
            <MaterialReactTable table={table} />
        </>
    );
};

export default Margenes;