import React, { useEffect } from 'react';
import clienteAxios from '../functions/clienteAxios';
import { dataContext } from '../hooks/DataContext';
import { useMemo } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Box, Button } from '@mui/material';
import currency from "currency.js";

const TableThree = () => {
  const { listaArticulos } = React.useContext(dataContext);
  const { comprasDetalladas } = React.useContext(dataContext);
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

        // A artículos con stock, agregar la fecha de la última compra. Buscar para cada artículo la última compra detallada a partir de la
        // propiedad "FacturaFecha", tomar la última fecha de compra y agregarla a la propiedad "FechaRegistro"
        articulosConStock.forEach(articulo => {
          const comprasFiltradas = comprasDetalladas.filter(compra => compra.ArticuloCodigo === articulo.Codigo);
          if (comprasFiltradas.length > 0) {
            const fechaUltimaCompra = comprasFiltradas.reduce((acumulador, compra) => {
              const fecha = new Date(compra.FacturaFecha);
              return fecha > acumulador ? fecha : acumulador;
            }, new Date(0));
            articulo.FechaRegistro = fechaUltimaCompra.toISOString().split('T')[0];
            articulo.ProveedorNombre = comprasFiltradas[0].ProveedorNombre;
          } else {
            articulo.FechaRegistro = ""; // Dejar en blanco si no hay compras
            articulo.ProveedorNombre = ""; // Dejar en blanco si no hay compras
          }
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
        size: 150,
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
        size: 150,
      },
      {
        accessorKey: 'FechaRegistro',
        header: 'Última Compra',
        size: 180,
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