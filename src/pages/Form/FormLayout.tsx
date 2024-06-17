import React, { useRef, useEffect, useState } from 'react';
import { dataContext } from '../../hooks/DataContext';
import axios from 'axios';
import Select from 'react-select';
import currency from 'currency.js';
import Snackbar from '@mui/material/Snackbar';
import { Box, Button } from '@mui/material';
import Breadcrumb from '../../components/Breadcrumb';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

const FormLayout = () => {
  const { clientes, selectedCliente, setSelectedCliente, comprobantes, selectedComprobante, setSelectedComprobante, selectedFechaFactura, setSelectedFechaFactura,
    selectedItem, setSelectedItem, ultimoPrecio, setUltimoPrecio, selectedCantidad, setSelectedCantidad, precioVenta, setPrecioVenta, articulos, setArticulos, notas,
    setNotas, listaArticulos, movimiento, setMovimiento, usuario } = React.useContext(dataContext);

  const [openModal, setOpenModal] = React.useState(false);
  const [precio, setPrecio] = useState('');
  const [color, setColor] = useState('text-gray-700');
  const [totalIVA, setTotalIVA] = useState(0);
  const [snakBarOpen, setSnakBarOpen] = useState(false);
  const [itemStock, setItemStock] = useState(0);
  const [stockFaltante, setStockFaltante] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const cantidadInputRef = useRef(null);
  const fechaActual = new Date().toISOString().slice(0, 10);
  const selectRef = useRef();


  // Establecer el valor de la fecha en formato "20240616"
  useEffect(() => {
    setSelectedFechaFactura(fechaActual.replace(/-/g, ''));
  }, []);


  // Recuperar datos almacenados en localStorage al cargar el componente
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('form_data'));
    if (storedData && articulos.length !== 0) {
      setSelectedCliente(storedData.selectedCliente);
      setSelectedComprobante(storedData.selectedComprobante);
      setSelectedFechaFactura(storedData.selectedFechaFactura);
      setSelectedItem(storedData.selectedItem);
      setSelectedCantidad(storedData.selectedCantidad);
      setPrecio(storedData.precio);
      setColor(storedData.color);
      setPrecioVenta(storedData.precioVenta);
      setArticulos(storedData.articulos);
      setTotalIVA(storedData.totalIVA);
      setNotas(storedData.notas);
      setStockFaltante(storedData.stockFaltante || []);
      setTotal(storedData.total);
      setSubtotal(storedData.subtotal);
    }
  }, []);


  // Guardar datos en localStorage cuando cambian
  useEffect(() => {
    const formData = { selectedCliente, selectedComprobante, selectedFechaFactura, selectedItem, selectedCantidad, precio, color, precioVenta, articulos, totalIVA, notas, stockFaltante, total, subtotal };
    localStorage.setItem('form_data', JSON.stringify(formData));
  }, [selectedCliente, selectedComprobante, selectedFechaFactura, selectedItem, selectedCantidad, precio, color, precioVenta, articulos, totalIVA, notas, stockFaltante, total, subtotal]);

  // Opciones Selects
  const clienteOptions = clientes.map(cliente => ({ value: cliente.Nombre, label: cliente.Nombre }));
  const itemOptions = listaArticulos.filter(item => item !== null && item !== undefined).map(item => ({ value: item.Nombre, label: item.Nombre }));
  const comprobanteOptions = comprobantes.filter(comprobante => comprobante.Nombre.includes('(CFE)') && !comprobante.Nombre.includes('Débito')).map(comprobante => ({ value: comprobante.Nombre, label: comprobante.Nombre }));

  // Control Select Cliente
  const handleChangeCliente = selectedOption => {
    if (selectedOption) {
      setSelectedCliente(clientes.find(cliente => cliente.Nombre === selectedOption.value));
    } else {
      setSelectedCliente(null);
    }
  };

  // Control Select Fecha
  const handleChangeFecha = (e) => {
    const fecha = e.target.value;
    const fechaFactura = fecha.split('-');
    const fechaFacturaString = fechaFactura[0] + fechaFactura[1] + fechaFactura[2];
    setSelectedFechaFactura(fechaFacturaString);
  }

  // Control Select Comprobantes
  const handleChangeComprobante = selectedOption => {
    setSelectedComprobante(comprobantes.find(comprobante => comprobante.Nombre === selectedOption.value));
  };

  // Control Select Items
  const handleChangeItem = selectedOption => {
    setSelectedItem(listaArticulos.find(item => item.Nombre === selectedOption.value));
  };

  // Eliminar un artículo de la lista de artículos
  const handleEliminarArticulo = (index) => {
    const articuloAEliminar = articulos.find((articulo, articuloIndex) => articuloIndex === index);
    // Calcular el total del IVA y restarlo al estado totalIVA, teniendo en cuenta el IVACodigo de articulo: 1 = 10%, 2 = 22%, 3 = 0%
    let nuevoIVA;
    if (articuloAEliminar.CodigoIVA === 1) {
      console.log('estoy en 1');
      nuevoIVA = totalIVA - (articuloAEliminar.total * 0.1);
    } else if (articuloAEliminar.CodigoIVA === 2) {
      console.log('estoy en 2');
      nuevoIVA = totalIVA - (articuloAEliminar.total * 0.22);
    } else if (articuloAEliminar.CodigoIVA === 3) {
      console.log('estoy en 3');
      nuevoIVA = totalIVA;
    }
    setTotalIVA(nuevoIVA);

    // Eliminar el artículo del estado articulos
    const articulosFiltrados = articulos.filter((articulo, articuloIndex) => articuloIndex !== index);
    setArticulos(articulosFiltrados);
    // Eliminar el artículo de stockFaltante si existe
    const stockFaltanteFiltrado = stockFaltante.filter((articulo, articuloIndex) => articuloIndex !== index);
    setStockFaltante(stockFaltanteFiltrado);

    // Recalcular el subtotal y el total
    const subtotal = articulosFiltrados.reduce((sum, articulo) => sum + articulo.total, 0);
    const total = subtotal + nuevoIVA; // Asegúrate de que totalIVA se haya actualizado correctamente
    // Actualizar el subtotal y el total en el estado
    setSubtotal(subtotal);
    setTotal(total);
  };

  // Controlar el cambio de precio y calcular el color del texto en función del valor del precio
  const handlePrecioChange = (event) => {
    let inputValue = event.target.value;
    inputValue = inputValue.replace('$', '');
    if (/^\d*\.?\d{0,2}$/.test(inputValue)) {
      inputValue = inputValue;
      setPrecio(inputValue);
      inputValue = inputValue.replace('$', '');
      setPrecioVenta(inputValue);
      const precioNumerico = parseFloat(inputValue.replace('$', ''));
      if (precioNumerico >= selectedItem.Costo * 1.5) {
        setColor('text-meta-3');
      } else if (precioNumerico >= selectedItem.Costo * 1.2) {
        setColor('text-black');
      } else if (precioNumerico < selectedItem.Costo) {
        setColor('text-danger');
      }
    }
  };

  // Obtener el último precio de un artículo para un cliente
  useEffect(() => {
    const obtenerUltimoPrecio = async () => {
      if (selectedItem?.Codigo && selectedCliente?.Codigo) {
        try {
          const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/facturas/item/ultimoPrecio`, { ArticuloCodigo: selectedItem.Codigo, Codigo: selectedCliente.Codigo });
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

  // Obtener el stock actual de un artículo
  useEffect(() => {
    const obtenerStock = async () => {
      if (selectedItem?.Codigo) {
        try {
          const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/facturas/item/stock`, { Codigo: selectedItem.Codigo });
          let stockEntero = 0;
          if (data.length > 0) {
            stockEntero = Math.floor(data[0].StockActual);
          }
          setItemStock(stockEntero);
        } catch (error) {
          console.log(error);
        }
      } else {
        setItemStock(0);
      }
    }
    obtenerStock();
  }, [selectedItem]);

  // Obtener el color del texto en función del valor del precio
  function getColor(ultimoPrecio, precioCosto) {
    if (ultimoPrecio >= precioCosto * 1.5) {
      return 'text-meta-3';
    } else if (ultimoPrecio >= precioCosto * 1.2) {
      return 'text-black';
    } else {
      return 'text-danger';
    }
  }

  // Agregar lineas de la factura
  const handleAgregarArticulo = () => {
    if (selectedCantidad > itemStock) {
      // Agregar el artículo a la lista de stock faltante
      setStockFaltante(prevStockFaltante => [...prevStockFaltante, { Nombre: selectedItem.Nombre, Cantidad: selectedCantidad - itemStock }]);
    };
    // Agregar el nuevo artículo al estado de los artículos
    setArticulos(prevArticulos => [...prevArticulos, {
      CodigoArticulo: selectedItem.Codigo,
      NombreArticulo: selectedItem.Nombre,
      Cantidad: currency(selectedCantidad, { precision: 2, separator: '.', decimal: ',' }).value,
      // Convertir el precio a número y formatearlo con dos decimales
      PrecioUnitario: Number(precioVenta.replace('$', '')).toLocaleString('es-UY', { minimumFractionDigits: 2 }),
      costo: selectedItem.Costo,
      CodigoIVA: selectedItem.IVACodigo,
      total: precioVenta * selectedCantidad,
      Notas: ""
    }]);
    // Calcular el total del IVA y agregarlo al estado totalIVA
    if (selectedItem.IVACodigo === 1) {
      setTotalIVA(totalIVA + (precioVenta * selectedCantidad * 0.1));
    } else if (selectedItem.IVACodigo === 2) {
      setTotalIVA(totalIVA + (precioVenta * selectedCantidad * 0.22));
    } else if (selectedItem.IVACodigo === 3) {
      setTotalIVA(totalIVA + 0);
    }
    handleCloseModal();
    limpiarFormularioAgregarArticulo();
  };

  // Contruir la factura
  useEffect(() => {
    // Eliminar el campo articuloNombre,costo y total del array articulos y eliminar el signo $ del precio
    const articulosSinNombre = articulos.map(({ NombreArticulo, costo, total, Stock, ...rest }) => ({ ...rest, PrecioUnitario: currency(rest.PrecioUnitario, { precision: 2, separator: '.', decimal: ',' }).value }));
    // Construir el objeto factura
    setMovimiento({
      CodigoComprobante: selectedComprobante.Codigo,
      Serie: "",
      Numero: 0,
      Fecha: selectedFechaFactura || fechaActual.replace(/-/g, ''),
      CodigoMoneda: 1,
      CodigoCliente: selectedCliente ? selectedCliente.Codigo : null,
      CodigoVendedor: selectedCliente ? selectedCliente.VendedorCodigo : null,
      CodigoPrecio: selectedCliente ? selectedCliente.PrecioVentaCodigo : null,
      CodigoCondicionPago: selectedCliente ? selectedCliente.CondicionCodigo : null,
      CodigoDepositoOrigen: (selectedComprobante.Codigo === 701 || selectedComprobante.Codigo === 703) ? 1 : 0,
      CodigoDepositoDestino: (selectedComprobante.Codigo === 702 || selectedComprobante.Codigo === 704) ? 1 : 0,
      Notas: notas,
      CodigoLocal: 1,
      CodigoUsuario: usuario.codigoZ,
      CodigoCaja: 1,
      Lineas: articulosSinNombre,
      FormasPago: [{
        CodigoFormaPago: 1,
        CodigoMonedaPago: 1
      }]
    });
  }, [selectedCliente, selectedComprobante, selectedFechaFactura, articulos, notas, precioVenta]);

  // Enviar la factura
  const handleEnviarFactura = async () => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/facturas/enviarFactura`, { movimiento });
      if (data.AgregarOut.Succeed === true) {
        setSnakBarOpen(true);
      }
      setTimeout(() => {
        setSnakBarOpen(false);
      }
        , 2000);
      limpiarFormularioEnviarFactura();
      handleCloseModal();
    } catch (error) {
      console.log(error);
    }
  }

  // Control abrir modal
  const handleOpenModal = () => {
    if (articulos.length >= 16) {
      alert('No se pueden agregar más de 16 artículos a una factura');
      return;
    }
    setOpenModal(true);
    const modal = document.querySelector('#modal');
    modal.classList.remove('hidden');
    if (selectRef.current) {
      selectRef.current.focus();
    }
  }

  // Control cerrar modal
  const handleCloseModal = () => {
    setOpenModal(false);
    const modal = document.querySelector('#modal');
    modal.classList.add('hidden');
    const body = document.querySelector('body');
    body.classList.remove('fixed');
  }

  // Limpiar formulario agregar artículo
  const limpiarFormularioAgregarArticulo = () => {
    setSelectedItem('');
    setSelectedCantidad('');
    setPrecio('');
    setColor('text-gray-700');
    setPrecioVenta('');
    setSubtotal(0);
    setTotal(0);
  };

  // Limpiar formulario enviar factura
  const limpiarFormularioEnviarFactura = () => {
    localStorage.removeItem('form_data');
    setSelectedCliente('');
    setSelectedComprobante('');
    setArticulos([]);
    setNotas('');
    setSelectedItem('');
    setSelectedCantidad('');
    setPrecio('');
    setPrecioVenta('');
    setColor('text-gray-700');
    setStockFaltante([]);
    setTotalIVA(0);
    window.location.reload();
  };

  return (
    <>
      <Snackbar
        open={snakBarOpen}
        autoHideDuration={2000}
        message="Factura Enviada Correctamente a ZSoftware"
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
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
              value={selectedCliente && { value: selectedCliente.Nombre, label: selectedCliente.Nombre }}
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
              value={selectedComprobante && { value: selectedComprobante.Nombre, label: selectedComprobante.Nombre }}
              isClearable={true}
              isSearchable={true}
              name="comprobante"
              options={comprobanteOptions}
              onChange={handleChangeComprobante}
            />
          </div>

          {/* Columna 2 */}
          <div className="col-span-12 md:col-span-6">
            <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500 js-datepicker" type="date" defaultValue={selectedFechaFactura ? selectedFechaFactura : fechaActual} autoComplete="on" onChange={handleChangeFecha} />
          </div>

          {/* Columna 3 */}
          <div className="col-span-12 md:col-span-6">

          </div>
        </div>

        <div className="flex border-b items-start pb-2">
          <div className="flex-1">
            <p className="text-gray-800 uppercase tracking-wide text-sm font-bold">Artículos
              <Button
                style={{ color: '#64748B', marginLeft: '10px', borderColor: '#64748B' }}
                variant="outlined"
                size='small'
              >
                {articulos.length}
              </Button>
            </p>
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
            <div className="flex-1">
              <p className="text-gray-800">{articulo.NombreArticulo}</p>
              <p className="text-gray-600">{articulo.Notas}</p>
            </div>

            <div className="px-1 w-20 text-right">
              <p className="text-gray-800">{articulo.Cantidad}</p>
            </div>

            <div className="w-32 text-right">
              <p className="text-gray-800">
                {currency(articulo.PrecioUnitario, { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format()}
              </p>
            </div>

            <div className="w-32 text-right">
              <p className="text-gray-800">
                {currency(articulo.total, { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format()}
              </p>
            </div>

            <div className="px-5 w-30" style={{ textAlign: 'right' }}>
              <IconButton
                style={{ color: '#C70039' }}
                onClick={() => handleEliminarArticulo(index)}
              >
                <DeleteIcon />
              </IconButton>
            </div>
          </div>
        ))}

        <Button sx={{ mt: 3, mb: 2, bgcolor: '#00aaad', p: 1, color: '#fff', '&:hover': { bgcolor: '#007d7f' } }}
          color="primary"
          onClick={handleOpenModal}
          variant="contained"
        >
          Agregar Artículo
        </Button>

        <div className="flex mt-15 pr-2 py-2">
          <div className="flex-1 px-1">
          <textarea className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full md:w-1/2 py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500 resize" type="text" placeholder="Notas" value={notas} onChange={(e) => setNotas(e.target.value)}></textarea>
          </div>

          <div className="px-1 w-32 text-right">
            <strong><p className="text-gray-800">Sub-total</p></strong>
            <strong><p className="text-gray-800">IVA</p></strong>
            <strong><p className="text-gray-800">Total</p></strong>
          </div>
          <div className="px-1 w-32 text-right">
            <p className="text-right text-gray-800">
              {currency(Math.round((articulos.reduce((acc, articulo) => acc + (articulo.total * 100), 0) / 100)), { symbol: "$ ", separator: ".", decimal: "," }).format()}
            </p>
            <p className="text-right text-gray-800">
              {currency(Math.round(totalIVA), { symbol: "$ ", separator: ".", decimal: "," }).format()}
            </p>
            <p className="text-right text-gray-800">
              {currency(Math.round((articulos.reduce((acc, articulo) => acc + (articulo.total * 100), 0) / 100) + totalIVA), { symbol: "$ ", separator: ".", decimal: "," }).format()}
            </p>
          </div>
          <div className="px-1 w-20 text-right">
          </div>
        </div>

        <div className="flex-1 mt-5 mb-5">
          {/* <textarea className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full md:w-1/2 py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500 resize-none" type="text" placeholder="Notas" value={notas} onChange={(e) => setNotas(e.target.value)}></textarea> */}
        </div>

        {/* renderizar una tabla con el stock faltante */}
        {stockFaltante.length > 0 && (
          <div className="flex mt-11 pr-9 py-2">
            <div className="flex-1 px-1">
              <p className="text-gray-800 uppercase tracking-wide text-sm font-bold">Stock Faltante</p>
            </div>
            <div className="px-1 w-32 text-right">
              <p className="text-gray-800 uppercase tracking-wide text-sm font-bold">Cantidad</p>
            </div>
          </div>
        )}

        {stockFaltante.map((articulo, index) => (
          <div key={index} className="flex pt-3 pb-3 border-b">
            <div className="flex-1">
              <p className="text-gray-800">{articulo.Nombre}</p>
            </div>
            <div className="px-9 w-32 text-right">
              <p className="text-gray-800">{articulo.Cantidad}</p>
            </div>
          </div>
        ))}

        <div className="relative inline-block mt-10">
          <Box>
            <Button
              color="primary"
              onClick={handleEnviarFactura}
              disabled={articulos.length === 0}
              variant="contained"
            >
              Enviar a Z-Software
            </Button>
          </Box>
        </div>

        {/* Modal */}
        <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }} id="modal" className="fixed z-40 top-0 right-0 left-0 bottom-0 h-full w-full hidden">
          <div className="p-4 max-w-xl mx-auto left-0 right-0 overflow-hidden mt-24">
            <div className="shadow w-full rounded-lg bg-white overflow-hidden block p-5">
              <div className="flex justify-end">
                <IconButton
                  variant="contained"
                  style={{ color: '#00AAAF', fontSize: 'large' }}
                  onClick={handleCloseModal} >
                  <HighlightOffIcon />
                </IconButton>
              </div>
              <h2 className="font-bold text-2xl mb-6 text-gray-800 border-b pb-2">
                Agregar Artículos
                <Button
                  style={{ color: '#64748B', marginLeft: '10px', borderColor: '#64748B' }}
                  variant="outlined"
                  size='small'
                >
                  {articulos.length}
                </Button>
              </h2>
              {/* Primera fila */}
              <div className="mb-4">
                <label className="text-gray-800 block mb-1 font-bold text-xs uppercase tracking-wide">Artículo</label>
                <Select
                  className="mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full  text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
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
                  value={selectedItem && { value: selectedItem.Nombre, label: selectedItem.Nombre }}
                  isClearable={true}
                  isSearchable={true}
                  name="item"
                  ref={selectRef}
                  options={itemOptions}
                  onChange={(selectedOption) => {
                    handleChangeItem(selectedOption);
                    if (cantidadInputRef.current) {
                      cantidadInputRef.current.focus();
                    }
                  }}
                />
              </div>
              {/* Segunda fila */}
              <div className="grid grid-cols-3 gap-4">
                <div className="mb-4">
                  <label className="text-right text-gray-800 block mb-1 font-bold text-xs uppercase tracking-wide">Costo</label>
                  <input
                    className="text-right text-sm mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-3 px-1 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    type="text"
                    value={selectedItem ? currency((Number(selectedItem.Costo)).toString().replace('.', ','), { symbol: "$ ", separator: ".", decimal: "," }).format() : ''}
                    readOnly />
                </div>
                <div className="mb-4">
                  <label className="text-right text-gray-800 block mb-1 font-bold text-xs uppercase tracking-wide">Stock</label>
                  <input
                    className={`text-right text-sm mb-1 border-2 border-gray-200 rounded w-full py-3 px-1 text-gray-700 leading-tight focus:outline-none  ${Number(itemStock) > 0 ? 'text-gray-800' : 'text-danger'}`}
                    type="text"
                    value={itemStock}
                    readOnly />
                </div>
                <div className="mb-4">
                  <label className="text-right text-gray-800 block mb-1 font-bold text-xs uppercase tracking-wide">Último Precio</label>
                  <input className={`text-right text-sm mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-3 px-1 leading-tight focus:outline-none focus:bg-white focus:border-blue-500 ${selectedItem ? getColor(ultimoPrecio, selectedItem.Costo) : ''}`} type="text"
                    value={currency((Number(ultimoPrecio)).toString().replace('.', ','), { symbol: "$ ", separator: ".", decimal: "," }).format()}
                    readOnly />
                </div>
              </div>
              {/* Tercera fila */}
              <div className="grid grid-cols-4 gap-4">
                <div className="mb-4">
                  <label className="text-right text-gray-800 block mb-1 font-bold text-xs uppercase tracking-wide">+20%</label>
                  <input
                    className="text-right text-sm mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-3 px-1 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    type="text"
                    value={selectedItem ? currency((Number(selectedItem.Costo * 1.2)).toString().replace('.', ','), { symbol: "$ ", separator: ".", decimal: "," }).format() : ''}
                    readOnly
                  />
                </div>
                <div className="mb-4">
                  <label className="text-right text-gray-800 block mb-1 font-bold text-xs uppercase tracking-wide">+30%</label>
                  <input
                    className="text-right text-sm mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-3 px-1 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    type="text"
                    value={selectedItem ? currency((Number(selectedItem.Costo * 1.3)).toString().replace('.', ','), { symbol: "$ ", separator: ".", decimal: "," }).format() : ''}
                    readOnly
                  />
                </div>
                <div className="mb-4">
                  <label className="text-right text-gray-800 block mb-1 font-bold text-xs uppercase tracking-wide">+40%</label>
                  <input
                    className="text-right text-sm mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-3 px-1 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    type="text"
                    value={selectedItem ? currency((Number(selectedItem.Costo * 1.4)).toString().replace('.', ','), { symbol: "$ ", separator: ".", decimal: "," }).format() : ''}
                    readOnly
                  />
                </div>
                <div className="mb-4">
                  <label className="text-right text-gray-800 block mb-1 font-bold text-xs uppercase tracking-wide">+50%</label>
                  <input
                    className="text-right text-sm mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-3 px-1 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    type="text"
                    value={selectedItem ? currency((Number(selectedItem.Costo * 1.5)).toString().replace('.', ','), { symbol: "$ ", separator: ".", decimal: "," }).format() : ''}
                    readOnly
                  />
                </div>
              </div>
              {/* Cuarta fila */}
              <div className="grid grid-cols-3 gap-4 items-end">
                <div>
                  <label className="text-right text-gray-800 block_mb-1 font-bold text-xs uppercase tracking-wide ">Cantidad</label>
                  <input
                    ref={cantidadInputRef}
                    className="text-right text-sm mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-3 px-1 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    type="number"
                    value={selectedCantidad}
                    onChange={(e) => setSelectedCantidad(e.target.value)}
                    required
                  />
                </div>
                <div className="relative">
                  <label className="text-right text-gray-800 block mb-1 font-bold text-xs uppercase tracking-wide">Precio</label>
                  <input
                    className={`text-right text-sm mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-3 px-1 leading-tight focus:outline-none focus:bg-white focus:border-blue-500 ${color}`}
                    placeholder={precio}
                    type="number"
                    value={precio}
                    onChange={handlePrecioChange}
                    required
                  />
                </div>
                <Button
                  style={{ backgroundColor: '#00aaad', color: 'white', marginBottom: '5px', padding: '10px' }}
                  onClick={handleAgregarArticulo}
                  variant="contained"
                  disabled={!selectedItem || !selectedCantidad || !precio}
                >
                  Agregar
                </Button>
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