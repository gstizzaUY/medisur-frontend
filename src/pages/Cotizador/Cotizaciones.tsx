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
import RefreshIcon from '@mui/icons-material/Refresh';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useState } from 'react';


const FormElements = () => {
    const { cotizaciones, setCotizaciones } = React.useContext(dataContext);
    const data = cotizaciones;
    const [open, setOpen] = useState(false);
    const [cotizacionAEliminar, setCotizacionAEliminar] = useState(null);
    const [regenerandoPdf, setRegenerandoPdf] = useState(false);


    const handleOpen = (id) => {
        setCotizacionAEliminar(id);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    //* Función para verificar si la cotización tiene más de 15 días
    const tieneMasDe15Dias = (fechaCotizacion) => {
        const fecha = new Date(fechaCotizacion);
        const hoy = new Date();
        const diferenciaDias = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
        return diferenciaDias > 15;
    };

    //* Función para ver PDF (con regeneración automática si es necesario)
    const verPDF = async (cotizacion) => {
        // Si la cotización tiene menos de 15 días, usar la URL existente
        if (!tieneMasDe15Dias(cotizacion.fecha_cotizacion)) {
            window.open(cotizacion.url_pdf, '_blank');
            return;
        }

        // Si tiene más de 15 días, regenerar el PDF
        try {
            setRegenerandoPdf(true);

            const response = await clienteAxios.post(`/cotizador/regenerar-pdf/${cotizacion._id}`);

            if (response.data && response.data.url) {
                // Actualizar la cotización en el estado local
                const cotizacionesActualizadas = cotizaciones.map(cot =>
                    cot._id === cotizacion._id
                        ? { ...cot, url_pdf: response.data.url }
                        : cot
                );
                setCotizaciones(cotizacionesActualizadas);

                // Abrir el PDF regenerado
                window.open(response.data.url, '_blank');
            }
        } catch (error) {
            console.error('Error al regenerar PDF:', error);
            alert('Error al regenerar el PDF. Intenta nuevamente.');
        } finally {
            setRegenerandoPdf(false);
        }
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
        enableStickyHeader: true,
        enableStickyFooter: true,
        muiTableContainerProps: { sx: { maxHeight: 430 } },
        renderRowActions: ({ row }) => (
            <Box>
                <IconButton
                    style={{
                        color: '#00aaad'
                    }}
                    onClick={() => verPDF(row.original)}
                    disabled={regenerandoPdf}
                    title="Ver PDF"
                >
                    <RemoveRedEyeIcon />
                </IconButton>
                <IconButton
                    style={{ color: '#C70039' }}
                    onClick={() => eliminarCotizacion(row.original._id)} >
                    <DeleteIcon />
                </IconButton>
            </Box>
        ),
        //add custom action buttons to top-left of top toolbar
        renderTopToolbarCustomActions: ({ table }) => (
            <Box sx={{ display: 'flex', gap: '1rem', p: '4px' }}>
                <Button
                    style={{ backgroundColor: '#00aaad', color: 'white' }}
                    onClick={() => {
                        // Recargar página
                        window.location.reload();
                    }}
                    variant="contained"
                >
                    Actualizar Listado
                </Button>
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