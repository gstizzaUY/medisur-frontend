import React, { useEffect, useMemo, useState } from 'react';
import { dataContext } from '../../hooks/DataContext';
import Breadcrumb from '../../components/Breadcrumb';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import currency from "currency.js";

const GananciasPorArticulo = () => {
    const { mesActual, anioActual, ventasDetalladas, listaArticulos } = React.useContext(dataContext);
    const [data, setData] = useState([]);

    useEffect(() => {
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
            console.log(acc);
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
                Costo: currency(costoTotal, { symbol: "$ ", separator: ".", decimal: "," }).format(),
                Precio: currency(precioVentaTotal, { symbol: "$ ", separator: ".", decimal: "," }).format(),
                Ganancia: currency(gananciaTotal, { symbol: "$ ", separator: ".", decimal: "," }).format(),
                Porcentaje: ((gananciaTotal / costoTotal) * 100).toFixed(2).replace('.', ',') + '%'
            };
        });

        setData(dataFinal);
    }, [mesActual, anioActual, ventasDetalladas, listaArticulos]);

    // Obtener el nombre del mes actual en español
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const fechaActual = new Date();
    const nombreMesActual = meses[fechaActual.getMonth()];
    const anioActualTexto = fechaActual.getFullYear();


    const columns = useMemo(
        () => [
            {
                accessorKey: 'Codigo',
                header: 'Código',
                size: 100,
            },
            {
                accessorKey: 'Nombre',
                header: 'Nombre',
                sortDescFirst: true,
                size: 370,
            },
            {
                accessorKey: 'Cantidad',
                header: 'Cantidad',
                size: 130,
                muiTableHeadCellProps: {
                    align: 'right',
                },
                muiTableBodyCellProps: {
                    align: 'right',
                },
            },
            {
                accessorKey: 'Costo',
                header: 'Costo',
                size: 120,
                muiTableHeadCellProps: {
                    align: 'right',
                },
                muiTableBodyCellProps: {
                    align: 'right',
                },
            },
            {
                accessorKey: 'Precio',
                header: 'Precio',
                size: 160,
                muiTableHeadCellProps: {
                    align: 'right',
                },
                muiTableBodyCellProps: {
                    align: 'right',
                },
            },
            {
                accessorKey: 'Ganancia',
                header: 'Ganancia',
                size: 170,
                muiTableHeadCellProps: {
                    align: 'right',
                },
                muiTableBodyCellProps: {
                    align: 'right',
                },
            },
            {
                accessorKey: 'Porcentaje',
                header: 'Porcentaje',
                size: 180,
                muiTableHeadCellProps: {
                    align: 'right',
                },
                muiTableBodyCellProps: {
                    align: 'right',
                },
            },
        ],
        []
    );

    const table = useMaterialReactTable({
        columns,
        layoutMode: 'grid-no-grow',
        localization: MRT_Localization_ES,
        data,
        enableTopToolbar: true,
        globalFilterFn: 'contains',
        enableGlobalFilterRankedResults: true,
        enableStickyHeader: true,
        enableStickyFooter: true,
        muiTableContainerProps: { sx: { maxHeight: 430 } },
        initialState: {
            pagination: { pageIndex: 0, pageSize: 100 },
            density: 'compact',
            columnVisibility: {
                'Codigo': false,
            },
            sorting: [
                { id: 'Nombre', desc: false },
            ],
        },
    });

    return (
        <>
            <Breadcrumb pageName={`Ganancias por Artículo - ${nombreMesActual} ${anioActualTexto}`} />
            <MaterialReactTable
                table={table}
            />
        </>
    );
};

export default GananciasPorArticulo;