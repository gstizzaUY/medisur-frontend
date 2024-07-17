import React, { useEffect } from 'react';
import { dataContext } from '../hooks/DataContext';
import { useMemo } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Box } from '@mui/material';
import currency from "currency.js";

const TableThree = () => {
  const { listaArticulos } = React.useContext(dataContext);
  const { articulosConStock } = React.useContext(dataContext);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'Codigo', //access nested data with dot notation
        header: 'Código',
        size: 100,
      },
      {
        accessorKey: 'Nombre',
        header: 'Nombre',
        sortDescFirst: true,
        size: 370,
      },
      {
        accessorKey: 'Stock',
        header: 'Stock',
        size: 130,
        // Eliminar los últimos 6 digitos
        Cell: ({ cell }) => (
          <Box>
            {cell.getValue() ? cell.getValue().slice(0, -6) : ''}
          </Box>
        ),
      },

      {
        accessorKey: 'Costo',
        header: 'Costo',
        size: 120,
        Cell: ({ cell }) => {
          const cellValue = cell.getValue();
          if (cellValue) {
            return (
              <Box >
                {
                  (() => {
                    const numberValue = parseFloat(cellValue);
                    if (numberValue <= 0.99) {
                      return currency(numberValue, { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format();
                    }
                    return currency(numberValue, { symbol: "$ ", separator: ".", decimal: "," }).format();
                  })()
                }
              </Box>
            );
          } else {
            return (
              <Box>
                {currency(0, { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format()}
              </Box>
            );
          }
        },
      },
      {
        accessorKey: 'CostoFecha',
        header: 'Costo Fecha',
        size: 120,
      },
      {
        accessorKey: 'FechaRegistro',
        header: 'Última Compra',
        size: 170,
      },
      {
        accessorKey: 'ProveedorNombre',
        header: 'Proveedor',
        size: 180,
      },
      {
        accessorKey: 'StockValorizado',
        header: 'Stock Valorizado',
        size: 150,
        Cell: ({ cell }) => (
          <Box>
            {cell.getValue()}
          </Box>
        ),
      },
    ],
    [listaArticulos],
  );

  const table = useMaterialReactTable({
    columns,
    layoutMode: 'grid-no-grow',
    localization: MRT_Localization_ES,
    data: articulosConStock, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    enableTopToolbar: true,
    globalFilterFn: 'contains', //turn off fuzzy matching and use simple contains filter function
    enableGlobalFilterRankedResults: true,
    enableStickyHeader: true,
    enableStickyFooter: true,
    muiTableContainerProps: { sx: { maxHeight: 430 } },
    initialState: {
      pagination: { pageIndex: 0, pageSize: 100 },
      density: 'compact',
      columnVisibility: {
        'Codigo': false,
        'CostoFecha': false,
      },
    },


  });



  return (
    <>
      <MaterialReactTable
        table={table}
      />
    </>
  );


};

export default TableThree;