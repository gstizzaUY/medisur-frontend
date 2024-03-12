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
import DeleteIcon from '@mui/icons-material/Delete';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useState } from 'react';


const FormElements = () => {
    const { cotizaciones, setCotizaciones } = React.useContext(dataContext);
    const data = cotizaciones;
    const [open, setOpen] = useState(false);
    const [cotizacionAEliminar, setCotizacionAEliminar] = useState(null);


    const handleOpen = (id) => {
        setCotizacionAEliminar(id);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    //* Eliminar Cotización
    const eliminarCotizacion = async (id) => {
        if (!open) {
            handleOpen(id);
            return;
        }
        try {
            await clienteAxios.delete(`/cotizador/eliminar/${id}`);
            const nuevasCotizaciones = cotizaciones.filter(cotizacion => cotizacion._id !== id);
            setCotizaciones(nuevasCotizaciones);
        } catch (error) {
            console.error(error);
        }
        handleClose();
    };

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
                <IconButton onClick={() => eliminarCotizacion(row.original._id)} >
                    <DeleteIcon />
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
                        <Dialog
                open={open}
                onClose={handleClose}
            >
                <DialogTitle>
                    {"Eliminar Cotización"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {"¿Estás seguro de que quieres eliminar esta cotización?"}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>
                        {"Cancelar"}
                    </Button>
                    <Button onClick={() => eliminarCotizacion(cotizacionAEliminar)} autoFocus>
                        {"Eliminar"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );

};

export default FormElements;