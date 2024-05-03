import React from 'react';
import { useMemo } from 'react';
import { dataContext } from '../../hooks/DataContext';
import Breadcrumb from '../../components/Breadcrumb';

import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Box, Button } from '@mui/material';

const FormElements = () => {
    const { contactos, setContactos } = React.useContext(dataContext);
    
    // Construir un nuevo objeto donde se filtran los contactos con la propiedad "ContactoActivo" es "S" y guardarlo en la variable "data"
    const data = useMemo(() => contactos.filter((contacto) => contacto.ContactoActivo === 'S'), [contactos]);


    const columns = useMemo(
        () => [
            {
                accessorKey: 'ZonaCodigo',
                header: 'Zona',
                size: 50,
            },
            {
                accessorKey: 'RazonSocial',
                header: 'Razón Social',
                size: 50,
            },
            {
                accessorKey: 'Direccion',
                header: 'Dirección',
                size: 50,
            },
            {
                accessorKey: 'Localidad',
                header: 'Localidad',
                size: 50,
            },
            {
                accessorKey: 'DepartamentoCodigo',
                header: 'Departamento',
                size: 50,
            },
            {
                accessorKey: 'RUT',
                header: 'RUT',
                size: 60,
            },
            {
                accessorKey: 'Celular',
                header: 'Celular',
                size: 50,
            },
            {
                accessorKey: 'Telefono',
                header: 'Telefono',
                size: 50,
            },
            {
                accessorKey: 'Email1',
                header: 'Email 1',
                size: 80,
            },
            {
                accessorKey: 'Email2',
                header: 'Email 2',
                size: 80,
            },
            {
                accessorKey: 'Notas',
                header: 'Notas',
                size: 80,
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
        positionGlobalFilter: 'left', //show the global filter on the left side of the top toolbar
        initialState: {
            showGlobalFilter: true, //show the global filter by default
            pagination: { pageIndex: 0, pageSize: 100 },
            density: 'compact',
            sorting: [
                { id: 'RazonSocial', desc: false },
            ],
            columnVisibility: { DepartamentoCodigo: false },
            renderTopToolbarCustomActions: ({ table }) => (
                <Button >
                    Clear All Sorting
                </Button>
            ),
        },
    });


    return (
        <>
            <Breadcrumb pageName="Contactos Activos" />
            <MaterialReactTable
                table={table}
            />
        </>
    );

};

export default FormElements;