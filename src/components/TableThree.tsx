import React, { useEffect } from 'react';
import { dataContext } from '../hooks/DataContext';
import { useMemo } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Box, Button, useTheme } from '@mui/material';
import currency from "currency.js";


const TableThree = () => {
  const { items, setItems } = React.useContext(dataContext);
  const { listaArticulos, setListaArticulos } = React.useContext(dataContext);



  const data = items;
  const columns = useMemo(
    () => [
      {
        accessorKey: 'ArticuloCodigo', //access nested data with dot notation
        header: 'Código',
        size: 50,
        muiTableHeadCellProps: {
          align: 'right',
        },
      },
      {
        accessorKey: 'ArticuloNombre',
        header: 'Nombre',
        sortDescFirst: true,
        size: 100,
        muiTableHeadCellProps: {
          align: 'center',
        },
        muiTableBodyCellProps: {
          align: 'center',
      },
      },
      {
        accessorKey: 'StockActual',
        header: 'Stock',
        size: 100,
        muiTableHeadCellProps: {
          align: 'center',
        },
        muiTableBodyCellProps: {
          align: 'center',
      },
        // Eliminar los últimos 6 digitos
        Cell: ({ cell }) => (
          <Box>
            {cell.getValue() ? cell.getValue().slice(0, -6) : ''}
          </Box>
        ),
      },
      {
        accessorKey: 'PrecioCosto',
        header: 'Costo',
        size: 90,
        muiTableHeadCellProps: {
          align: 'center',
        },
        muiTableBodyCellProps: {
          align: 'center',
      },
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
    ],
    [data],
  );

  const table = useMaterialReactTable({
    columns,
    localization: MRT_Localization_ES,
    data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    enableTopToolbar: true,
    globalFilterFn: 'contains', //turn off fuzzy matching and use simple contains filter function
    enableGlobalFilterRankedResults: true,
    initialState: {
      density: 'compact',
      sorting: [
        { id: 'ArticuloNombre', desc: false },
      ],
      renderTopToolbarCustomActions: ({ table }) => (
        <Button >
          Clear All Sorting
        </Button>
      ),
      columnVisibility: {
        'ArticuloCodigo': false,
    },
    },
  });



  return  (
    <>
      <MaterialReactTable
        table={table}
      />
    </>
  );


};

export default TableThree;