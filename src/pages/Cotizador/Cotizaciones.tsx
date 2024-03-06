import React from 'react';
import { useMemo } from 'react';
import { dataContext } from '../../hooks/DataContext';
import Breadcrumb from '../../components/Breadcrumb';
import clienteAxios from '../../functions/clienteAxios';

import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Box, Button } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import currency from "currency.js";

const FormElements = () => {
    const { cotizaciones, setCotizaciones } = React.useContext(dataContext);
    const data = cotizaciones;

    const columns = useMemo(
        () => [
            {
                accessorKey: 'numero_cotizacion',
                header: 'Número',
                size: 50,
            },
            {
                accessorKey: 'fecha_cotizacion',
                header: 'Fecha',
                sortDescFirst: true,
                size: 50,
                Cell: ({ cell }) => (
                    <div>
                        {new Date(cell.getValue()).toLocaleDateString()}
                    </div>
                ),
            },
            {
                accessorKey: 'lead.nombre_lead',
                header: 'Cliente',
                size: 60,
            },
            {
                accessorKey: 'total',
                header: 'Total',
                size: 90,
                // Cell: ({ cell }) => (
                //     <div className="text-right">
                //         {currency(cell.getValue().slice(0, -3), { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format()}
                //     </div>
                // ),
            },
            {
                accessorKey: 'usuario',
                header: 'Usuario',
                size: 130,
            },
        ],
        [data],
    );

    const table = useMaterialReactTable({
        columns,
        localization: MRT_Localization_ES,
        data,
        enableTopToolbar: true,
        positionActionsColumn: "last",
        enableRowActions: true,
        globalFilterFn: 'contains', //turn off fuzzy matching and use simple contains filter function
        enableGlobalFilterRankedResults: true,
        enableStickyHeader : true,
        enableStickyFooter: true,
        muiTableContainerProps: { sx: { maxHeight: 430 } },
        renderRowActions: ({ row }) => (
            <Box>
                <IconButton onClick={() => window.open(`${row.original.url_pdf}`, '_blank')} >
                    <RemoveRedEyeIcon />
                </IconButton>
            </Box>
        ),
        initialState: {
            pagination: { pageIndex: 0, pageSize: 100 },
            density: 'compact',
            sorting: [
                // ordenar por numero_cotizacion de forma descendente si los números son de la forma 0000014, 0000015, 0000016, etc.
                {
                    id: 'numero_cotizacion',
                    desc: true,
                },
            ],
            renderTopToolbarCustomActions: ({ table }) => (
                <Button >
                    Clear All Sorting
                </Button>
            ),
            columnVisibility: {
                'Subtotal': false,
                'numero_cotizacion': false,
                'total': false,
            },
        },
    });


    return (
        <>
            <Breadcrumb pageName="Cotizaciones" />
            <MaterialReactTable
                table={table}
            />
        </>
    );

};

export default FormElements;