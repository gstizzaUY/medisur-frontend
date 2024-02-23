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
  const { facturasClientes, setFacturasClientes } = React.useContext(dataContext);
  const data = facturasClientes;

  const obtenerFacturaPDF = async (row) => {
    try {
      const { data } = await clienteAxios.post(`${import.meta.env.VITE_API_URL}/facturas/factura-pdf`, {
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
        accessorKey: 'Fecha',
        header: 'Fecha',
        sortDescFirst: true,
        size: 100,
      },
      {
        accessorKey: 'ComprobanteNombre',
        header: 'Tipo',
        size: 150,
      },
      {
        accessorKey: 'ClienteNombre',
        header: 'Cliente',
        size: 130,
      },
      {
        accessorKey: 'ClienteZonaCodigo',
        header: 'Zona',
        size: 90,
      },
      {
        accessorKey: 'Subtotal',
        header: '$ s/iva',
        size: 90,
        muiTableBodyCellProps: {
          align: 'right',
      },
        Cell: ({ cell }) => (
          <div>
            {currency(cell.getValue().slice(0, -3), { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format()}
          </div>
        ),
      },
      {
        accessorKey: 'Total',
        header: 'Total c/iva',
        size: 90,
        muiTableBodyCellProps: {
          align: 'right',
      },
        Cell: ({ cell }) => (
          <div>
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
    globalFilterFn: 'contains', //turn off fuzzy matching and use simple contains filter function
    enableGlobalFilterRankedResults: true,
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
        { id: 'Numero', desc: true },
      ],
      renderTopToolbarCustomActions: ({ table }) => (
        <Button >
          Clear All Sorting
        </Button>
      ),
      columnVisibility: {
        'Subtotal': false,
    },
    },
  });


  return (
    <>
      <Breadcrumb pageName="Facturas" />
      <MaterialReactTable
        table={table}
      />
    </>
  );

};

export default FormElements;