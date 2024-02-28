import React, {useEffect} from 'react';
import clienteAxios from '../functions/clienteAxios';
import { dataContext } from '../hooks/DataContext';
import { useMemo } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Box, Button } from '@mui/material';
import currency from "currency.js";

const TableThree = () => {
  const { listaArticulos, setListaArticulos } = React.useContext(dataContext);
  const [ articulosConStock, setArticulosConStock ] = React.useState([{}]);
  

      //* Obtener items y agregar Stock de cada
      useEffect(() => {
        const obtenerItems = async () => {
            try {
                const { data } = await clienteAxios.get(`${import.meta.env.VITE_API_URL}/facturas/items`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const articulosConStock = listaArticulos.filter(articulo => articulo !== null).map(articulo => {
                    if (articulo) {
                        const item = data.find(item => item.ArticuloCodigo === articulo.Codigo);
                        // Crear una nueva copia de item y modificar PrecioCosto
                        return item ? { ...articulo, Stock: item.StockActual } : { ...articulo, Stock: "0.00000" };
                    }
                    return null;
                });
                setArticulosConStock(articulosConStock);

            } catch (error) {
                console.log(error);
            }
        }
            obtenerItems();
    }, [listaArticulos]);


  const data = listaArticulos;
  const columns = useMemo(
    () => [
      {
        accessorKey: 'Codigo', //access nested data with dot notation
        header: 'Código',
        size: 20,
      },
      {
        accessorKey: 'Nombre',
        header: 'Nombre',
        sortDescFirst: true,
        size: 410,
      },
      {
        accessorKey: 'Stock',
        header: 'Stock',
        size: 120,
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
        size: 130,
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
        header: 'Fecha',
        size: 120,
      },
      {
        accessorKey: 'ProveedorNombre',
        header: 'Proveedor',
        size: 150,
      }
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