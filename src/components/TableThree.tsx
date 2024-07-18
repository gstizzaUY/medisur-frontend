import React, { useContext, useMemo, useEffect, useState } from 'react';
import clienteAxios from '../functions/clienteAxios';
import { dataContext } from '../hooks/DataContext';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Box } from '@mui/material';
import currency from "currency.js";

const TableThree = () => {
  const { listaArticulos, comprasDetalladas } = React.useContext(dataContext);
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
        let articulosMap = new Map();
        listaArticulos.filter(articulo => articulo !== null).forEach(articulo => {
          if (articulo) {
            const item = data.find(item => item.ArticuloCodigo === articulo.Codigo);
            const articuloConStock = item ? { ...articulo, Stock: item.StockActual } : { ...articulo, Stock: "0.00000" };
            articulosMap.set(articulo.Codigo, articuloConStock);
          }
        });

        articulosMap.forEach((articulo, codigo) => {
          const comprasFiltradas = comprasDetalladas.filter(compra => compra.ArticuloCodigo === codigo);
          if (comprasFiltradas.length > 0) {
            const fechaUltimaCompra = comprasFiltradas.reduce((acumulador, compra) => {
              const fecha = new Date(compra.FacturaFecha);
              return fecha > acumulador ? fecha : acumulador;
            }, new Date(0));
            articulo.FechaRegistro = fechaUltimaCompra.toISOString().split('T')[0];
            articulo.ProveedorNombre = comprasFiltradas[0].ProveedorNombre;
          } else {
            articulo.FechaRegistro = "";
            articulo.ProveedorNombre = "";
          }

          const stock = parseFloat(articulo.Stock);
          const costo = parseFloat(articulo.Costo);
          articulo.StockValorizado = stock * costo;
        });
        setArticulosConStock([...articulosMap.values()]);

      } catch (error) {
        console.log(error);
      }
    };
    obtenerItems();
  }, [ listaArticulos, comprasDetalladas ]);

    
  const data = listaArticulos;

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
        size: 340,
      },
      {
        accessorKey: 'Stock',
        header: 'Stock',
        size: 130,
        muiTableHeadCellProps: {
          align: 'right',
        },
        muiTableBodyCellProps: {
          align: 'right',
        },
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
        muiTableHeadCellProps: {
          align: 'right',
        },
        muiTableBodyCellProps: {
          align: 'right',
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
      {
        accessorKey: 'CostoFecha',
        header: 'Costo Fecha',
        size: 120,
      },
      {
        accessorKey: 'FechaRegistro',
        header: 'Última Compra',
        size: 170,
        muiTableHeadCellProps: {
          align: 'right',
        },
        muiTableBodyCellProps: {
          align: 'right',
        },
      },
      {
        accessorKey: 'ProveedorNombre',
        header: 'Proveedor',
        size: 180,
      },
      {
        accessorKey: 'StockValorizado',
        header: 'Stock Valorizado',
        size: 180,
        muiTableHeadCellProps: {
          align: 'right',
        },
        muiTableBodyCellProps: {
          align: 'right',
        },
        muiTableFooterCellProps: {
          align: 'right',
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