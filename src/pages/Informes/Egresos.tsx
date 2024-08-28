import React, { useEffect, useMemo, useState } from 'react';
import { dataContext } from '../../hooks/DataContext';
import Breadcrumb from '../../components/Breadcrumb';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { Box, Stack } from '@mui/material';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import currency from "currency.js";

const Egresos = () => {
    const { mesActual, anioActual, egresos } = React.useContext(dataContext);
    let [egresosDelMes, setEgresosDelMes] = useState([]);
    let [totalEgresos, setTotalEgresos] = useState(0);

    useEffect(() => {
        // Convertir mesActual a una cadena de dos dígitos
        const mesActualStr = mesActual.toString().padStart(2, '0');

        // Filtrar los egresos del mes actual y año actual, donde la propiedad Fecha es un string con formato "yyyy-mm-dd"
        const egresosMesActual = egresos.filter(
            egreso => egreso.Fecha.includes(`${anioActual}-${mesActualStr}`)
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

        setEgresosDelMes(egresosMesActual);

        // Calcular la suma total de los egresos
        const total = egresosMesActual.reduce((acc, egreso) => acc + egreso.Total, 0);
        setTotalEgresos(total);

    }, [mesActual, anioActual, egresos]);

    const columns = useMemo(
        () => [
            {
                accessorKey: 'Fecha',
                header: 'Fecha',
                size: 120,
            },
            {
                accessorKey: 'ComprobanteTipoNombre',
                header: 'Comprobante',
                size: 170,
            },
            {
                accessorKey: 'Serie',
                header: 'Serie',
                size: 20,
            },
            {
                accessorKey: 'Numero',
                header: 'Número',
                size: 50,
            },
            {
                accessorKey: 'Descripcion',
                header: 'Descripción',
                size: 400,
                muiTableHeadCellProps: {
                    align: 'left',
                },
                muiTableBodyCellProps: {
                    align: 'left',
                },
            },
            {
                accessorKey: 'ConceptoNombre',
                header: 'Concepto',
                size: 150,
                muiTableHeadCellProps: {
                    align: 'left',
                },
                muiTableBodyCellProps: {
                    align: 'left',
                },
            },
            {
                accessorKey: 'Total',
                header: 'Total IVA INCL.',
                size: 200,
                muiTableHeadCellProps: {
                    align: 'right',
                },
                muiTableBodyCellProps: {
                    align: 'right',
                },
                muiTableFooterCellProps: {
                    align: 'right',
                },
                Cell: ({ cell }) => (
                    <div>
                        {currency(cell.getValue(), { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format()}
                    </div>
                ),
                Footer: () => (
                    <div>
                        <Box sx={{ fontWeight: 'bold' }}>
                            {currency(totalEgresos, { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format()}
                        </Box>
                    </div>
                ),
            },
        ],
        [totalEgresos]
    );

    const table = useMaterialReactTable({
        columns,
        layoutMode: 'grid-no-grow',
        localization: MRT_Localization_ES,
        data: egresosDelMes,
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
                'ComprobanteTipoNombre': false,
                'Serie': false,
                'Numero': false,
            },
            sorting: [
                { id: 'Fecha', desc: true },
            ],
        },
    });

    return (
        <>
            <Breadcrumb pageName={`Egresos`} />
            <MaterialReactTable
                table={table}
            />
        </>
    );
};

export default Egresos;