import React from 'react';
import { useState } from "react";
import { dataContext } from '../../hooks/DataContext';
import { useMemo } from 'react';
import Breadcrumb from '../../components/Breadcrumb';
import currency from "currency.js";
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Box, Button, useTheme } from '@mui/material';
import { NavLink } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import clienteAxios from '../../functions/clienteAxios';


// import NewFactura from '../components/Facturas/NewFactura';

const FormElements = () => {
  const { facturasClientes, setFacturasClientes } = React.useContext(dataContext);
  const [mostrarNewFactura, setMostrarNewFactura] = useState(false);
  const theme = useTheme();
  const data = facturasClientes;

  const obtenerFacturaPDF = async ( row ) => {
    console.log("row", row.original.RegistroId);
    
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
        Cell: ({ cell }) => (
          <div className="text-right">
            {currency(cell.getValue().slice(0, -3), { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format()}
          </div>
        ),
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
    positionActionsColumn: "last",
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box>
        <IconButton onClick={() => {obtenerFacturaPDF( row )} }>
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



  return  (
    <>
    <Breadcrumb pageName="Facturas" />
      <MaterialReactTable
        table={table}
      />
    </>
  );


};

export default FormElements;