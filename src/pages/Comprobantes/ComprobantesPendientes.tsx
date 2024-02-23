import React, { useEffect, useState } from 'react';
import { useMemo } from 'react';

import Breadcrumb from '../../components/Breadcrumb';
import currency from "currency.js";
import clienteAxios from '../../functions/clienteAxios';

import { MaterialReactTable, useMaterialReactTable, createMRTColumnHelper } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';

import { Box, Button } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

import { dataContext } from '../../hooks/DataContext';

const columnHelper = createMRTColumnHelper();


const ComprobantesPendientes = () => {
    const { comprobantesPendientes, setComprobantesPendientes } = React.useContext(dataContext);
    const { diaActual, setDiaActual } = React.useContext(dataContext);
    const { diaVencimiento, setDiaVencimiento } = React.useContext(dataContext);
    const { facturasVencidas, setFacturasVencidas } = React.useContext(dataContext);
    const data = comprobantesPendientes;

    const handleExportRows = async (rows) => {
        console.log(rows);
        // Enviar los datos al servidor para obtener la url del PDF
        try {
            const response = await clienteAxios.post(`${import.meta.env.VITE_API_URL}/facturas/informes/comprobantes-pendientes`, { rows });
            console.log(response);
            window.open(response.data.data.url);
        } catch (error) {
            console.log(error);
        }
    };





    //* OBTENER TOTAL DE FACTURAS POR CLIENTE
    const totalDeFacturasPorCliente = (id) => {
        let totalPorCliente = {};
        data.forEach((comprobante) => {
            if (totalPorCliente[comprobante.ClienteCodigo]) {
                totalPorCliente[comprobante.ClienteCodigo] += parseFloat(comprobante.Total.slice(0, -3));
            } else {
                totalPorCliente[comprobante.ClienteCodigo] = parseFloat(comprobante.Total.slice(0, -3));
            }
        });
        return currency(totalPorCliente[id], { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format();
    }


    //* OBTENER EL TOTAL DEL MONTO DE LAS FACTURAS VENCIDAS POR CLIENTE
    const totalFacturasVencidasPorCliente = (id) => {
        let totalPorCliente = {};
        facturasVencidas.forEach((comprobante) => {
            if (totalPorCliente[comprobante.ClienteCodigo]) {
                totalPorCliente[comprobante.ClienteCodigo] += parseFloat(comprobante.SaldoSigno.slice(0, -3));
            } else {
                totalPorCliente[comprobante.ClienteCodigo] = parseFloat(comprobante.SaldoSigno.slice(0, -3));
            }
        });
        return currency(totalPorCliente[id], { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format();
    }


    //* OBTENER EL PDF DEL COMPROBANTE
    const obtenerFacturaPDF = async (row) => {
        try {
            const { data } = await clienteAxios.post(`${import.meta.env.VITE_API_URL}/facturas/factura-pdf`, {
                "RegistroId": row.original.RegistroId
            });
            // Descargar el pdf de la url que viene en data
            window.open(data);
        } catch (error) {
            console.log(error);
        }
    }


    const columns = useMemo(
        () => [
            {
                header: 'Número',
                accessorKey: 'Numero',
                size: 10,
            },
            {
                header: 'Cliente',
                accessorKey: 'ClienteNombre',
                size: 50,
                grow: false,
            },
            {
                header: 'Fecha',
                accessorKey: 'Fecha',
                size: 10,
            },
            {
                header: 'Zona',
                accessorKey: 'ClienteZona',
                size: 10,

            },
            {
                accessorKey: 'Total',
                header: 'Total',
                size: 50,
                Cell: ({ cell }) => (
                    <div >
                        {currency(cell.getValue().slice(0, -3), { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format()}
                    </div>
                ),
            },
            {
                accessorKey: 'SaldoSigno',
                header: 'Saldo',
                size: 50,
                Cell: ({ cell }) => (
                    <div >
                        {currency(cell.getValue().slice(0, -3), { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format()}
                    </div>
                ),
            },

            {
                accessorKey: 'FechaVencimiento',
                header: 'V.',
                size: 30,
                // Comparar propiedad Fecha (en formato string) con fechaVencimiento (en formato Date)
                Cell: ({ cell }) => (
                    <div>
                        {new Date(cell.row.original.Fecha) < new Date(diaVencimiento) ? 'S' : 'N'}
                    </div>
                ),

            },
            {
                header: 'R.',
                accessorKey: 'Resumen',
                aggregationFn: ['count'],
                size: 30,
                //required to render an aggregated cell, show the average salary in the group
                AggregatedCell: ({ cell }) => (
                    <>
                        Total Facturado: {' '}
                        <Box sx={{ color: 'success.main', fontWeight: 'bold' }}>
                            {totalDeFacturasPorCliente(cell.row.original.ClienteCodigo)}
                        </Box>
                        Saldo Vencido: {' '}
                        <Box sx={{ color: 'error.main', fontWeight: 'bold' }}>
                            {totalFacturasVencidasPorCliente(cell.row.original.ClienteCodigo)}
                        </Box>
                    </>
                ),
            },
        ],
        [],
    );


    const table = useMaterialReactTable({
        localization: MRT_Localization_ES,
        columns,
        data,
        enableRowSelection: true,
        enableGrouping: true,
        enableStickyHeader: true,
        // enableGlobalFilterRankedResults: true,
        enableRowActions: true,
        initialState: {
            density: 'compact',
            expanded: false, //expand all groups by default
            grouping: ['ClienteNombre'], //an array of columns to group by by default (can be multiple)
            pagination: { pageIndex: 0, pageSize: 20 },
            sorting: [{ id: 'ClienteNombre', desc: false }], //sort by state by default
            columnVisibility: {
                'ClienteZona': false,
            },
        },
        muiToolbarAlertBannerChipProps: { color: 'primary' },
        muiTableContainerProps: { sx: { maxHeight: 700 } },
        globalFilterFn: 'contains', //turn off fuzzy matching and use simple contains filter function
        positionActionsColumn: "last",
        positionToolbarAlertBanner: 'bottom',
        renderTopToolbarCustomActions: ({ table }) => (
            <Box
                sx={{
                    display: 'flex',
                    gap: '16px',
                    padding: '8px',
                    flexWrap: 'wrap',
                }}
            >
                <Button
                    disabled={
                        !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
                    }
                    //only export selected rows
                    onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
                    startIcon={<FileDownloadIcon />}
                >
                    EXPORTAR SELECCIONADOS
                </Button>
            </Box>
        ),
        renderRowActions: ({ row }) => (
            <Box>
                <IconButton onClick={() => { obtenerFacturaPDF(row) }}>
                    <RemoveRedEyeIcon />
                </IconButton>
            </Box>
        ),
    });


    return (
        <>
            <Breadcrumb pageName="Comprobantes Pendientes" />
            <MaterialReactTable table={table} />
        </>
    );

};

export default ComprobantesPendientes;