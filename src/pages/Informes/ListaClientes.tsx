import React from 'react';
import { useMemo } from 'react';
import { dataContext } from '../../hooks/DataContext';
import Breadcrumb from '../../components/Breadcrumb';

import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Box, Button } from '@mui/material';

const FormElements = () => {
    const { clientes, setClientes } = React.useContext(dataContext);
    const data = clientes;


    const columns = useMemo(
        () => [
            {
                accessorKey: 'Nombre',
                header: 'Nombre',
                size: 50,
            },
            {
                accessorKey: 'EmailAdministracion',
                header: 'Email',
                size: 80,
            },
            {
                accessorKey: 'CondicionNombre',
                header: 'Condición',
                size: 50,
            },
            {
                accessorKey: 'PrecioVentaNombre',
                header: 'Lista',
                size: 90,
            },
            {
                accessorKey: 'VendedorNombre',
                header: 'Vendedor',
                size: 50,
            },
        ],
        [data],
    );

    const table = useMaterialReactTable({
        columns,
        localization: MRT_Localization_ES,
        data,
        enableStickyHeader: true,
        enableStickyFooter: true,
        muiTableContainerProps: { sx: { maxHeight: 430 } },
        enableTopToolbar: true,
        positionActionsColumn: "last",
        enableRowActions: false,
        globalFilterFn: 'contains', //turn off fuzzy matching and use simple contains filter function
        enableGlobalFilterRankedResults: true,
        initialState: {
            pagination: { pageIndex: 0, pageSize: 100 },
            density: 'compact',
            sorting: [
                { id: 'Nombre', desc: true },
            ],
            renderTopToolbarCustomActions: ({ table }) => (
                <Button >
                    Clear All Sorting
                </Button>
            ),
        },
    });


    return (
        <>
            <Breadcrumb pageName="Lista Clientes" />
            <MaterialReactTable
                table={table}
            />
        </>
    );

};

export default FormElements;