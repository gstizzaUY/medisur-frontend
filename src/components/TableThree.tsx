import React, { useEffect } from 'react';
import { dataContext } from '../hooks/DataContext';
import { useMemo } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Box, Button, useTheme } from '@mui/material';
import currency from "currency.js";

// import NewFactura from '../components/Facturas/NewFactura';

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
      },
      {
        accessorKey: 'ArticuloNombre',
        header: 'Nombre',
        sortDescFirst: true,
        size: 100,
      },
      {
        accessorKey: 'StockActual',
        header: 'Stock',
        size: 90,
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
        Cell: ({ cell }) => {
          const cellValue = cell.getValue();
          if (cellValue) {
            return (
              <div>
                {
                  (() => {
                    const numberValue = parseFloat(cellValue);
                    let formattedValue = cellValue;

                    if (numberValue <= 0.99) {
                      return currency(numberValue, { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format();
                    }
                    return currency(numberValue, { symbol: "$ ", separator: ".", decimal: "," }).format();
                  })()
                }
              </div>
            );
          } else {
            return (
              <div>
                {currency(0, { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format()}
              </div>
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