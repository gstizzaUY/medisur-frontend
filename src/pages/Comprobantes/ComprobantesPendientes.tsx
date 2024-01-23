
import React from 'react';
import { useMemo } from 'react';
import { dataContext } from '../../hooks/DataContext';
import clienteAxios from '../../functions/clienteAxios';

import Breadcrumb from '../../components/Breadcrumb';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Box, Button } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import currency from "currency.js";

const ComprobantesPendientes = () => {
    const { comprobantesPendientes, setComprobantesPendientes } = React.useContext(dataContext);
    const data = comprobantesPendientes;

    const obtenerFacturaPDF = async (row) => {
        try {
            const { data } = await clienteAxios.post(`${import.meta.env.VITE_API_URL}/facturas/facturaPDF`, {
                "RegistroId": row.original.RegistroId
            });
            console.log(data);
            // Descargar el pdf de la url que viene en data
            window.open(data);
        } catch (error) {
            console.log(error);
        }
    }

    const columns = useMemo(
        () => [
            {
                accessorKey: 'Numero',
                header: 'Número',
                size: 50,
            },
            {
                accessorKey: 'Emitido',
                header: 'Emitido',
                size: 40,
            },
            {
                accessorKey: 'Fecha',
                header: 'Fecha',
                sortDescFirst: true,
                size: 100,
            },
            {
                accessorKey: 'ComprobanteNombre',
                header: 'Comprobante',
                size: 50,
            },
            {
                accessorKey: 'ClienteNombre',
                header: 'Cliente',
                size: 150,
            },
            {
                accessorKey: 'Total',
                header: 'Total',
                size: 90,
                Cell: ({ cell }) => (
                    <div className="text-right">
                        {currency(cell.getValue().slice(0, -3), { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format()}
                    </div>
                ),
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
        renderRowActions: ({ row }) => (
            <Box>
                <IconButton onClick={() => { obtenerFacturaPDF(row) }}>
                    <RemoveRedEyeIcon />
                </IconButton>
            </Box>
        ),
        initialState: {
            density: 'compact',
            sorting: [
                { id: 'Fecha', desc: true },
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
            <Breadcrumb pageName="Comprobantes Pendientes" />
            <MaterialReactTable
                table={table}
            />
        </>
    );

};

export default ComprobantesPendientes