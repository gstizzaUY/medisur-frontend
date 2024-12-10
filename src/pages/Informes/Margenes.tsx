import React, { useContext, useMemo } from 'react';
import { dataContext } from '../../hooks/DataContext';
import Breadcrumb from '../../components/Breadcrumb';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import currency from "currency.js";
import dayjs from 'dayjs';

const Margenes = () => {
    const { facturasClientes, ventasDetalladas, listaArticulos } = useContext(dataContext);

    const data = useMemo(() => {
        const margenesPorCliente = {};
        console.log("Datos iniciales:", ventasDetalladas[0]); // Ver si hay zona en los datos


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
            console.log("Fila procesada:", resultRow); // Ver el resultado

            // Obtener últimos 6 meses
            for (let i = 0; i < 7; i++) {
                const fecha = dayjs().subtract(i, 'month');
                const mesAnio = fecha.format('MM/YY');
                const mesData = data.ventasPorMes[mesAnio];

                if (mesData && mesData.totalCosto > 0) {
                    const margen = ((mesData.totalVentas - mesData.totalCosto) / mesData.totalVentas * 100);
                    resultRow[mesAnio] = `${margen.toFixed(2).replace('.', ',')}%`;
                } else {
                    resultRow[mesAnio] = '-';
                }
            }

            return resultRow;
        });

        return result;
    }, [ventasDetalladas, listaArticulos]);

    const columns = useMemo(() => {
        const cols = [
            {
                id: 'zona', // Agregar un id explícito
                accessorKey: 'ClienteZonaCodigo',
                header: 'Zona',
                size: 90,
                enableSorting: true, // Habilitar explícitamente el ordenamiento
                Cell: ({ cell }) => ( // Renderizar celda explícitamente
                    <div style={{ textAlign: 'center' }}>
                        {cell.getValue()}
                    </div>
                ),
                Header: () => ( // Renderizar header explícitamente
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
                muiTableBodyCellProps: { align: 'right' }
            });
        }
        console.log("Configuración de columnas:", cols);
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