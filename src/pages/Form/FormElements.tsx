import Breadcrumb from '../../components/Breadcrumb';
import React from 'react';
import { useState } from "react";
import { dataContext } from '../../hooks/DataContext';
import { useMemo } from 'react';
import currency from "currency.js";
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Box, Button, useTheme } from '@mui/material';

// import NewFactura from '../components/Facturas/NewFactura';

const FormElements = () => {
  const { facturasClientes, setFacturasClientes } = React.useContext(dataContext);
  const [mostrarNewFactura, setMostrarNewFactura] = useState(false);
  const theme = useTheme();
  const data = facturasClientes;

  const columns = useMemo(
    () => [
      {
        accessorKey: 'Numero', //access nested data with dot notation
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
        accessorKey: 'ComprobanteNombre', //normal accessorKey
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
      // {
      //   accessorKey: 'VendedorNombre',
      //   header: 'Vendedor',
      //   size: 50,
      // },
      {
        accessorKey: 'Subtotal',
        header: '$ s/iva',
        size: 90,
      },

      {
        accessorKey: 'Total',
        header: '$ c/iva',
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
    data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    enableTopToolbar: true,
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



  return  (
    <>
    <Breadcrumb pageName="Facturas" />
      <Box
        sx={(theme) => ({
          display: 'flex',
          backgroundColor: 'inherit',
          borderRadius: '4px',
          flexDirection: 'row',
          gap: '16px',
          justifyContent: 'space-between',
          padding: '18px 4px',
          '@media max-width: 768px': {
            flexDirection: 'column',
          },
        })}
      >
        <Box>
          <Button
            color="primary"
            onClick={() => { setMostrarNewFactura(true) }}
            variant="contained"
          >
            Nueva Factura
          </Button>
        </Box>
      </Box>
      <MaterialReactTable
        table={table}
      />
    </>
  );


};

export default FormElements;