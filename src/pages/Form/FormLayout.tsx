import Breadcrumb from '../../components/Breadcrumb';

import React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { dataContext } from '../../hooks/DataContext';
import Select from 'react-select';
import { Box, Button } from '@mui/material';
import currency from 'currency.js';

const FormLayout = () => {
  const {
    clientes, 
    setClientes,
    selectedCliente,
    setSelectedCliente,
    comprobantes,
    setComprobantes,
    selectedComprobante,
    setSelectedComprobante,
    selectedFechaFactura,
    setSelectedFechaFactura,
    items,
    setItems,
    selectedItem,
    setSelectedItem,
    precioCosto,
    setPrecioCosto,
    ultimoPrecio,
    setUltimoPrecio,
    selectedCantidad,
    setSelectedCantidad,
    precioVenta,
    setPrecioVenta,
    articulos,
    setArticulos,
    notas,
    setNotas,
    movimiento,
    setMovimiento
  } = React.useContext(dataContext);
  const [openModal, setOpenModal] = React.useState(false);
  const [precio, setPrecio] = useState('');
  const [color, setColor] = useState('text-gray-700');
  const fechaActual = new Date().toISOString().slice(0, 10);

  // Abrir modal
  const handleOpenModal = () => {
    setOpenModal(true);
    // Eliminar la clase hidden del modal
    const modal = document.querySelector('#modal');
    modal.classList.remove('hidden');
  }
  // Cerrar Modal
  const handleCloseModal = () => {
    setOpenModal(false);
    // Agregar la clase hidden al modal
    const modal = document.querySelector('#modal');
    modal.classList.add('hidden');
    // Eliminar la clase fixed al body
    const body = document.querySelector('body');
    body.classList.remove('fixed');
  }
  //Captura Fecha de la factura
  const handleChangeFecha = (e) => {
    console.log(e.target.value);
    // tranformar la fecha en un string con formato yyyymmdd
    const fecha = e.target.value;
    const fechaFactura = fecha.split('-');
    const fechaFacturaString = fechaFactura[0] + fechaFactura[1] + fechaFactura[2];
    setSelectedFechaFactura(fechaFacturaString);
  }
  // Opciones de clientes para el select
  const clienteOptions = clientes.map(cliente => ({ value: cliente.Nombre, label: cliente.Nombre }));
  const handleChangeCliente = selectedOption => {
    setSelectedCliente(clientes.find(cliente => cliente.Nombre === selectedOption.value));
  };
  // Opciones de items para el select
  const itemOptions = items.map(item => ({ value: item.ArticuloNombre, label: item.ArticuloNombre }));
  const handleChangeItem = selectedOption => {
    setSelectedItem(items.find(item => item.ArticuloNombre === selectedOption.value));
  };
  // Opciones de comprobantes para el select
  const comprobanteOptions = comprobantes
    // Incluir los resultados que contengan la palabra 'Venta' y '(CFE)' pero no los que contengan 'Nota' y 'Devolución'
    .filter(comprobante => comprobante.Nombre.includes('Venta') && comprobante.Nombre.includes('(CFE)') && !comprobante.Nombre.includes('Nota') && !comprobante.Nombre.includes('Devolución'))
    .map(comprobante => ({ value: comprobante.Nombre, label: comprobante.Nombre }));
  const handleChangeComprobante = selectedOption => {
    setSelectedComprobante(comprobantes.find(comprobante => comprobante.Nombre === selectedOption.value));
  };

  const handleEliminarArticulo = (index) => {
    console.log(index);
    // Eliminar el artículo del array articulos
    const articulosFiltrados = articulos.filter((articulo, articuloIndex) => articuloIndex !== index);
    setArticulos(articulosFiltrados);
  };

  // Obtener Precio de Costo
  useEffect(() => {
    const obtenerPrecioCosto = async () => {
      if (selectedItem?.ArticuloCodigo) {
        try {
          const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/facturas/item/costo`, { ArticuloCodigo: selectedItem.ArticuloCodigo });
          //const { data } = clienteAxios.post(`/facturas/item/costo`, { ArticuloCodigo: selectedItem.ArticuloCodigo });
          setPrecioCosto(data);
        } catch (error) {
          console.log(error);
        }
      } else {
        setPrecioCosto(0);
      }
    }
    obtenerPrecioCosto();
  }, [selectedItem]);
  // Obtener último precio
  useEffect(() => {
    const obtenerUltimoPrecio = async () => {
      if (selectedItem?.ArticuloCodigo && selectedCliente?.Codigo) {
        try {
          const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/facturas/item/ultimoPrecio`, { ArticuloCodigo: selectedItem.ArticuloCodigo, Codigo: selectedCliente.Codigo });
          console.log('ultimo precio', data);
          // const { data } = clienteAxios.post(`/facturas/item/ultimoPrecio`, { ArticuloCodigo: selectedItem.ArticuloCodigo, Codigo: selectedCliente.Codigo });
          setUltimoPrecio(data);
        } catch (error) {
          console.log(error);
        }
      } else {
        setUltimoPrecio(0);
      }
    }
    obtenerUltimoPrecio();
  }, [selectedCliente, selectedItem]);

  function getColor(ultimoPrecio, precioCosto) {
    if (ultimoPrecio >= precioCosto * 1.5) {
      return 'text-meta-3';
    } else if (ultimoPrecio >= precioCosto * 1.2) {
      return 'text-black';
    } else {
      return 'text-danger';
    }
  }

  const handlePrecioChange = (event) => {
    let inputValue = event.target.value;
    // Remover el símbolo $ si existe
    inputValue = inputValue.replace('$', '');
    // Permitir solo números y dos decimales, y permitir la entrada de una parte decimal sin un número entero antes de ella
    if (/^\d*\.?\d{0,2}$/.test(inputValue.replace(',', '.'))) {
      // Reemplazar el punto por una coma
      inputValue = inputValue.replace('.', ',');
      // Agregar el símbolo $
      inputValue = inputValue;
      setPrecio(inputValue);
      // Eliminar el signo $  de inputValue y reemplazar la coma por un punto
      inputValue = inputValue.replace(',', '.').replace('$', '');
      setPrecioVenta(inputValue);
      // Cambiar el color del texto en función del valor del precio
      const precioNumerico = parseFloat(inputValue.replace(',', '.').replace('$', ''));
      if (precioNumerico >= precioCosto * 1.5) {
        setColor('text-meta-3');
      } else if (precioNumerico >= precioCosto * 1.2) {
        setColor('text-black');
      } else if (precioNumerico < precioCosto) {
        setColor('text-danger');
      }
    }
  };

  // Agregar artículo
  const handleAgregarArticulo = (articulo) => {
    // Agregar el nuevo artículo al estado de los artículos
    setArticulos(prevArticulos => [...prevArticulos, {
      CodigoArticulo: selectedItem.ArticuloCodigo,
      NombreArticulo: selectedItem.ArticuloNombre,
      Cantidad: selectedCantidad,
      // Convertir el precio a número y formatearlo con dos decimales
      PrecioUnitario: Number(precioVenta.replace('$', '')).toLocaleString('es-UY', { minimumFractionDigits: 2 }),
      costo: precioCosto,
      total: precioVenta * selectedCantidad,
      CodigoIVA: 2,
      Notas: ""
    }]);
    // Limpiar los campos del modal
    setSelectedItem({});
    setSelectedCantidad(1);
    setPrecio('');
    setColor('text-gray-700');
    // Cerrar el modal
    handleCloseModal();
  }

  // Generar Factura
  useEffect(() => {
    // Eliminar el campo articuloNombre,costo y total del array articulos y eliminar el signo $ del precio
    const articulosSinNombre = articulos.map(({ NombreArticulo, costo, total, ...rest }) => ({ ...rest, PrecioUnitario: precioVenta.replace('$', '') }));
    // convertir el campo precio a número de la forma 1234.56 del aaray articulos
    articulosSinNombre.forEach(articulo => articulo.PrecioUnitario = parseFloat(articulo.PrecioUnitario.replace(',', '.')));
    // Construir el objeto factura
    setMovimiento({
      CodigoComprobante: selectedComprobante.Codigo,
      Serie: "",
      Numero: 0,
      Fecha: selectedFechaFactura || fechaActual.replace(/-/g, ''),
      CodigoMoneda: 1,
      CodigoCliente: selectedCliente.Codigo,
      CodigoVendedor: selectedCliente.VendedorCodigo,
      CodigoPrecio: selectedCliente.PrecioVentaCodigo,
      CodigoCondicionPago: "30",
      CodigoDepositoOrigen: 1,
      CodigoDepositoDestino: 1,
      Notas: notas,
      CodigoLocal: 1,
      CodigoUsuario: 3,
      CodigoCaja: 1,
      Lineas: articulosSinNombre,
      FormasPago: [{
        CodigoFormaPago: 1,
        CodigoMonedaPago: 1
      }]
    });
  }, [selectedCliente, selectedComprobante, selectedFechaFactura, articulos, notas, precioVenta]);


  // Enviar Factura
  const handleEnviarFactura = async () => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/facturas/enviarFactura`, { movimiento });
      console.log(data);
      // Limpiar los campos del formulario
      setSelectedCliente({});
      setSelectedComprobante('');
      setSelectedFechaFactura('');
      setSelectedVendedor('');
      setArticulos([]);
      setNotas('');
      // Limpiar los campos del modal
      setSelectedItem({});
      setSelectedCantidad(1);
      setPrecio('');
      setColor('text-gray-700');
      // Cerrar el modal
      handleCloseModal();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <Breadcrumb pageName="Nueva Factura" />
      <div className=''>
        <div className="grid grid-cols-12 gap-4 mb-15">
          {/* Columna 1 */}
          <div className="col-span-12 md:col-span-6">
            <Select
              className="mb-3 bg-gray-200 appearance-none rounded w-full py-0 px-0 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
              styles={{
                control: (baseStyles, state) => ({
                  ...baseStyles,
                  backgroundColor: '#FFFFFF',
                  border: '2px',
                  '&:hover': { backgroundColor: '#FFFFFF' },
                }),
              }}
              placeholder="Seleccione un cliente"
              defaultValue={selectedCliente}
              isClearable={true}
              isSearchable={true}
              name="cliente"
              options={clienteOptions}
              onChange={handleChangeCliente}
            />
            <Select
              className="mb-3 bg-gray-200 appearance-none rounded w-full py-0 px-0 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-black"
              styles={{
                control: (baseStyles, state) => ({
                  ...baseStyles,
                  backgroundColor: '#FFFFFF',
                  border: '1px',
                  borderColor: '#000000',
                  '&:hover': { backgroundColor: '#FFFFFF' },
                }),
              }}
              placeholder="Seleccione un comprobante"
              defaultValue={selectedComprobante}
              isClearable={true}
              isSearchable={true}
              name="comprobante"
              options={comprobanteOptions}
              onChange={handleChangeComprobante}
            />
          </div>

          {/* Columna 2 */}
          <div className="col-span-12 md:col-span-6">
            <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500 js-datepicker" type="date" defaultValue={fechaActual} autoComplete="on" onChange={handleChangeFecha} />
          </div>

          {/* Columna 3 */}
          <div className="col-span-12 md:col-span-6">

          </div>
        </div>

        <div className="flex border-b items-start">
          <div className="flex-1">
            <p className="text-gray-800 uppercase tracking-wide text-sm font-bold">Artículos</p>
          </div>

          <div className="px-1 w-20 text-right">
            <p className="text-gray-800 uppercase tracking-wide text-sm font-bold">Cantidad</p>
          </div>


          <div className="w-32 text-center">
            <p className="leading-none">
              <span className="block uppercase tracking-wide text-sm font-bold text-gray-800">Precio</span>
            </p>
          </div>

          <div className="px-1 w-32 text-center">
            <p className="leading-none">
              <span className="block uppercase tracking-wide text-sm font-bold text-gray-800">Total</span>
            </p>
          </div>

          <div className="px-1 w-20 text-center">
          </div>
        </div>
        {articulos.map((articulo, index) => (
          <div key={index} className="flex pt-3 pb-3 border-b">
            <div className="flex-1 ">
              <p className="text-gray-800">{articulo.NombreArticulo}</p>
            </div>

            <div className="px-1 w-20 text-right">
              <p className="text-gray-800">{articulo.Cantidad}</p>
            </div>

            <div className="w-32 text-right">
              {/* <p className="text-gray-800">{articulo.PrecioUnitario}</p> */}
              <p className="text-gray-800">
                {currency(articulo.PrecioUnitario, { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format()}
              </p>
            </div>

            <div className="w-32 text-right">
              {/* <p className="text-gray-800">{articulo.total}</p> */}
              <p className="text-gray-800">
                {currency(articulo.total, { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format()}
              </p>

            </div>

            <div className="px-5 w-30" style={{textAlign: 'right'}}>
              <Button
                color="error"
                onClick={() => handleEliminarArticulo(index)}
                variant="contained"
                size="small"
              >
                Eliminar
              </Button>
            </div>
          </div>
        ))}

        <Button sx={{ mt: 3 }}
          color="primary"
          onClick={handleOpenModal}
          variant="contained"
        >
          Agregar Artículo
        </Button>


        {/* Manteniendo la resonsividad agregar un textarea para las notas de la factura sobre la izquierda y un apartado para el total y calculo de impuestos */}
        <div className="flex mt-6 pr-9  py-2">
          <div className="flex-1 px-1">
          </div>

          <div className="px-1 w-32 text-right">
            <strong><p className="text-gray-800">Subtotal</p></strong>
            <strong><p className="text-gray-800">IVA</p></strong>
            <strong><p className="text-gray-800">Total</p></strong>
          </div>

          <div className="px-1 w-32 text-right">
            <p className="text-gray-800">
              {currency(Math.round((articulos.reduce((acc, articulo) => acc + (articulo.total * 100), 0) / 100)), { symbol: "$ ", separator: ".", decimal: "," }).format()}
            </p>
            <p className="text-gray-800">
              {currency(Math.round((articulos.reduce((acc, articulo) => acc + (articulo.total * 100), 0) / 100) * 0.22), { symbol: "$ ", separator: ".", decimal: "," }).format()}
            </p>
            <p className="text-gray-800">
              {currency(Math.round((articulos.reduce((acc, articulo) => acc + (articulo.total * 100), 0) / 100) * 1.22), { symbol: "$ ", separator: ".", decimal: "," }).format()}
            </p>
          </div>

          <div className="px-1 w-20 text-right">
          </div>
        </div>

        <div className="flex-1 mt-5">
          <textarea className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full md:w-1/2 py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500 resize-none" type="text" placeholder="Notas" onChange={(e) => setNotas(e.target.value)}></textarea>
        </div>

        <div className="relative inline-block mt-5">
          <Box>
            <Button
              color="primary"
              onClick={handleEnviarFactura}
              disabled={articulos.length === 0}
              variant="contained"
            >
              Enviar
            </Button>
          </Box>
        </div>



        {/* Modal */}
        <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }} id="modal" className="fixed z-40 top-0 right-0 left-0 bottom-0 h-full w-full hidden">
          <div className="p-4 max-w-xl mx-auto left-0 right-0 overflow-hidden mt-24">

            <div className="shadow absolute right-0 top-0 w-10 h-10 rounded-full bg-white text-gray-500 hover:text-gray-800 inline-flex items-center justify-center cursor-pointer"
              onClick={handleCloseModal}>
              <svg className="fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M16.192 6.344L11.949 10.586 7.707 6.344 6.293 7.758 10.535 12 6.293 16.242 7.707 17.656 11.949 13.414 16.192 17.656 17.606 16.242 13.364 12 17.606 7.758z" />
              </svg>
            </div>

            <div className="shadow w-full rounded-lg bg-white overflow-hidden block p-3">
              <h2 className="font-bold text-2xl mb-6 text-gray-800 border-b pb-2">Agregar Artículos</h2>

              <div className="mb-4">
                <label className="text-gray-800 block mb-1 font-bold text-xs uppercase tracking-wide">Artículo</label>
                <Select
                  className="mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full  text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                  // classNamePrefix="select"
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      backgroundColor: '#E5E7EB',
                      border: '0px',
                      // Background color on focus
                      '&:hover': { backgroundColor: '#FFFFFF' },
                    }),
                  }}
                  placeholder="Seleccione un artículo"
                  defaultValue={selectedItem}
                  isClearable={true}
                  isSearchable={true}
                  name="item"
                  options={itemOptions}
                  onChange={handleChangeItem}
                />
              </div>

              <div className="flex">
                <div className="mb-4 w-32 mr-1">
                  <label className="text-right text-gray-800 block mb-1 font-bold text-sm uppercase tracking-wide">Costo</label>
                  <input 
                  className="text-right text-sm mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-3 px-1 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    type="text"
                    // eliminar los últimos 3 dígitos 
                    value={currency((Number(precioCosto)).toString().replace('.', ','), { symbol: "$ ", separator: ".", decimal: "," }).format()}
                    readOnly />
                </div>

                <div className="mb-4 w-32 mr-1">
                  <label className="text-right text-gray-800 block mb-1 font-bold text-sm uppercase tracking-wide">+20%</label>
                  <input
                    className="text-right text-sm mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-3 px-1 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    type="text"
                    value={currency((Number(precioCosto * 1.2)).toString().replace('.', ','), { symbol: "$ ", separator: ".", decimal: "," }).format()}
                    readOnly
                  />
                </div>

                <div className="mb-4 w-32 mr-1">
                  <label className="text-right text-gray-800 block mb-1 font-bold text-sm uppercase tracking-wide">+50%</label>
                  <input
                    className="text-right text-sm mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-3 px-1 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    type="text"
                    value={currency((Number(precioCosto * 1.5)).toString().replace('.', ','), { symbol: "$ ", separator: ".", decimal: "," }).format()}
                    readOnly
                  />
                </div>

                <div className="mb-4 w-32">
                  <label className="text-right text-gray-800 block mb-1 font-bold text-sm uppercase tracking-wide">Ultimo</label>
                  <input className={`text-right text-sm mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-3 px-1 leading-tight focus:outline-none focus:bg-white focus:border-blue-500 ${getColor(ultimoPrecio, precioCosto)}`}
                    type="text"
                    value={currency((Number(ultimoPrecio)).toString().replace('.', ','), { symbol: "$ ", separator: ".", decimal: "," }).format()}
                    readOnly />
                </div>
              </div>

              <div className="flex justify-end">
                <div className="mb-4 w-28 text-right">

                  <div className="relative">
                    <label className="text-gray-800 block mb-1 font-bold text-sm uppercase tracking-wide ">Cantidad</label>
                    <input 
                    className="text-right text-sm  mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-3 px-1 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" 
                    type="number" 
                    defaultValue={1} 
                    onChange={(e) => setSelectedCantidad(e.target.value)} min={1} />
                  </div>

                  <div className="relative">
                    <label className="text-gray-800 block mb-1 font-bold text-sm uppercase tracking-wide ">Precio</label>
                    <input
                      className={`text-right text-sm mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-3 px-1 leading-tight focus:outline-none focus:bg-white focus:border-blue-500 ${color}`}
                      type="number"
                      value={precio}
                      onChange={handlePrecioChange}
                    />
                  </div>

                </div>
              </div>

              <div className="mt-4 text-right">

                {/* <button type="button" className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded shadow-sm mr-2" onClick={handleCloseModal}>
                                    Cancelar
                                </button> */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <Button
                    color="primary"
                    onClick={handleCloseModal}
                    variant="outlined"
                  >
                    Cancelar
                  </Button>

                  <Button
                    color="primary"
                    onClick={handleAgregarArticulo}
                    variant="contained"
                  >
                    Agregar
                  </Button>
                </Box>

              </div>
            </div>
          </div>
        </div>
        {/* /Modal */}
      </div>
    </>
  )
}

export default FormLayout;
