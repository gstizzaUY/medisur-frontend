import React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { dataContext } from '../../hooks/DataContext';
import Select from 'react-select';
import currency from 'currency.js';
import Snackbar from '@mui/material/Snackbar';
import { Box, Button } from '@mui/material';
import Breadcrumb from '../../components/Breadcrumb';

const NuevaCotizacion = () => {
  const { contadorCotizaciones, setContadorCotizaciones, clientes, items, usuario, articulos, listaArticulos } = React.useContext(dataContext);
  const [openModal, setOpenModal] = React.useState(false);
  const [precio, setPrecio] = useState('');
  const [color, setColor] = useState('text-gray-700');
  const fechaActual = new Date().toISOString().slice(0, 10);
  const [totalIVA, setTotalIVA] = useState(0);
  const [snakBarOpen, setSnakBarOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [cotizacion, setCotizacion] = useState({});
  const [selectedFechaCotizacion, setSelectedFechaCotizacion] = useState(new Date().toISOString().slice(0, 10));
  const [productos, setProductos] = useState([]);
  const [selectedProducto, setSelectedProducto] = useState();
  const [selectedCantidadProducto, setSelectedCantidadProducto] = useState(1);
  const [ultimoPrecioProducto, setUltimoPrecioProducto] = useState(0);
  const [precioCostoProducto, setPrecioCostoProducto] = useState(0);
  const [precioVentaProducto, setPrecioVentaProducto] = useState(0);
  const [notaCotizacion, setNotaCotizacion] = useState('');
  const [referencia, setReferencia] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInput, setModalInput] = useState({ nombre: '', email: '' });

  //* OBTENER PRECIO DE COSTO DEL PRODUCTO //
  useEffect(() => {
    const obtenerPrecioCostoProducto = async () => {
      if (selectedProducto?.ArticuloCodigo) {
        try {
          const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/facturas/item/costo`, { ArticuloCodigo: selectedProducto.ArticuloCodigo });
          setPrecioCostoProducto(data);
        } catch (error) {
          console.log(error);
        }
      } else {
        setPrecioCostoProducto(0);
      }
    }
    obtenerPrecioCostoProducto();
  }, [selectedProducto]);

  //* OBTENER ÚLTIMO PRECIO
  useEffect(() => {
    const obtenerUltimoPrecio = async () => {
      if (selectedProducto?.ArticuloCodigo && selectedLead?.Codigo) {
        try {
          const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/facturas/item/ultimoPrecio`, { ArticuloCodigo: selectedProducto.ArticuloCodigo, Codigo: selectedLead.Codigo });
          setUltimoPrecioProducto(data);
        } catch (error) {
          console.log(error);
        }
      } else {
        setUltimoPrecioProducto(0);
      }
    }
    obtenerUltimoPrecio();
  }, [selectedLead, selectedProducto]);

  //* OPCIONES SELECTS //
  const clienteOptions = clientes.map(cliente => ({ value: cliente.Nombre, label: cliente.Nombre }));
  const itemOptions = items.map(item => ({ value: item.ArticuloNombre, label: item.ArticuloNombre }));

  //* CONTROL SELECT CLIENTE //
  const handleChangeCliente = selectedOption => {
    if (selectedOption) {
      setSelectedLead(clientes.find(cliente => cliente.Nombre === selectedOption.value));
    } else {
      setSelectedLead({});
    }
  };
  //* CONTROL SELECT FECHA  //
  const handleChangeFecha = (e) => {
    // tranformar la fecha en un string con formato yyyymmdd
    const fecha = e.target.value;
    const fechaCotizacion = fecha.split('-');
    const fechaCotizacionString = fechaCotizacion[0] + fechaCotizacion[1] + fechaCotizacion[2];
    setSelectedFechaCotizacion(fechaCotizacionString);
  }
  //* CONTROL SELECT ITEMS //
  const handleChangeItem = selectedOption => {
    setSelectedProducto(items.find(item => item.ArticuloNombre === selectedOption.value));
  };
  //* CONTROL ELIMINAR ARTÍCULOS
  const handleEliminarProducto = (index) => {
    // Encontrar el producto a eliminar en la lista de productos
    const productoAEliminar = productos.find((producto, productoIndex) => productoIndex === index);
    // Calcular el total del IVA y restarlo al estado totalIVA, teniendo en cuenta el IVACodigo de producto: 1 = 10%, 2 = 22%, 3 = 0%
    if (productoAEliminar.IVACodigo === 1) {
      setTotalIVA(totalIVA - (productoAEliminar.total * 0.1));
    } else if (productoAEliminar.IVACodigo === 2) {
      setTotalIVA(totalIVA - (productoAEliminar.total * 0.22));
    } else if (productoAEliminar.IVACodigo === 3) {
      setTotalIVA(totalIVA - 0);
    }
    // Eliminar el producto del estado de productos
    const productoFiltrados = productos.filter((producto, productoIndex) => productoIndex !== index);
    setProductos(productoFiltrados);
  };
  //* CONTROL CAMBIO DE PRECIO
  const handlePrecioChange = (event) => {
    let inputValue = event.target.value;
    // Remover el símbolo $ si existe
    inputValue = inputValue.replace('$', '');
    // Permitir solo números y dos decimales, y permitir la entrada de una parte decimal sin un número entero antes de ella
    if (/^\d*\.?\d{0,2}$/.test(inputValue)) {
      // Agregar el símbolo $
      inputValue = inputValue;
      setPrecio(inputValue);
      // Eliminar el signo $  de inputValue
      inputValue = inputValue.replace('$', '');
      setPrecioVentaProducto(inputValue);
      // Cambiar el color del texto en función del valor del precio
      const precioNumerico = parseFloat(inputValue.replace('$', ''));
      if (precioNumerico >= precioCostoProducto * 1.5) {
        setColor('text-meta-3');
      } else if (precioNumerico >= precioCostoProducto * 1.2) {
        setColor('text-black');
      } else if (precioNumerico < precioCostoProducto) {
        setColor('text-danger');
      }
    }
  };

  //* CONTROL REFERENCIA
  const handleChangeReferencia = (e) => {
    setReferencia(e.target.value);
  };

  //* CONTROL COLOR DE TEXTO
  function getColor(ultimoPrecioProducto, precioCostoProducto) {
    if (ultimoPrecioProducto >= precioCostoProducto * 1.5) {
      return 'text-meta-3';
    } else if (ultimoPrecioProducto >= precioCostoProducto * 1.2) {
      return 'text-black';
    } else {
      return 'text-danger';
    }
  }

  //* AGREGAR LINEAS A LA COTIZACIÓN
  const handleAgregarProducto = () => {

    // Buscar el selectedProducto en listaArticulos y obtener el iVACodigo
    const ivaSelectedProducto = listaArticulos.find(producto => producto.Codigo === selectedProducto.ArticuloCodigo);

    // Agregar el nuevo artículo al estado de los artículos
    setProductos(prevProductos => [...prevProductos, {
      CodigoArticulo: selectedProducto.ArticuloCodigo,
      NombreArticulo: selectedProducto.ArticuloNombre,
      Cantidad: selectedCantidadProducto,
      // Convertir el precio a número y formatearlo con dos decimales
      PrecioUnitario: typeof precioVentaProducto === 'string'
        ? Number(precioVentaProducto.replace('$', '')).toLocaleString('es-UY', { minimumFractionDigits: 2 })
        : precioVentaProducto,
      IVACodigo: ivaSelectedProducto.IVACodigo,
      total: precioVentaProducto * selectedCantidadProducto,
      Notas: ""
    }]);
    // Calcular el total del IVA y agregarlo al estado totalIVA, teniendo en cuenta el IVACodigo de producto: 1 = 10%, 2 = 22%, 3 = 0%
    if (ivaSelectedProducto.IVACodigo === 1) {
      setTotalIVA(totalIVA + (precioVentaProducto * selectedCantidadProducto * 0.1));
    } else if (ivaSelectedProducto.IVACodigo === 2) {
      setTotalIVA(totalIVA + (precioVentaProducto * selectedCantidadProducto * 0.22));
    } else if (ivaSelectedProducto.IVACodigo === 3) {
      setTotalIVA(totalIVA + 0);
    }
    handleCloseModal();
    limpiarFormularioAgregarProducto();
  };

  //* CONTRSTUIR LA COTIZACIÓN
  useEffect(() => {
    // Eliminar el campo articuloNombre,costo y total del array articulos y eliminar el signo $ del precio
    const articulosSinNombre = articulos.map(({ NombreArticulo, costo, total, IVACodigo, ...rest }) => ({ ...rest, PrecioUnitario: precioVentaProducto.replace('$', '') }));
    // convertir el campo precio a número de la forma 1234.56 del array articulos
    articulosSinNombre.forEach(articulo => articulo.PrecioUnitario = parseFloat(articulo.PrecioUnitario.replace(',', '.')));

    // Construir el objeto cotización
    setCotizacion({
      numero_cotizacion: String(parseInt(contadorCotizaciones, 10) + 1).padStart(7, '0'),
      fecha_cotizacion: selectedFechaCotizacion,
      lead: selectedLead ? {
        codigo_lead: selectedLead.Codigo,
        nombre_lead: selectedLead.Nombre,
        email_lead: selectedLead.EmailAdministracion,
      } : null,
      referencia: referencia,
      productos: productos,
      url_pdf: '',
      subtotal: currency(Math.round((productos.reduce((acc, producto) => acc + (producto.total * 100), 0) / 100)), { symbol: "$ ", separator: ".", decimal: "," }).format(),
      iva: currency(Math.round(totalIVA), { symbol: "$ ", separator: ".", decimal: "," }).format(),
      total: currency(Math.round((productos.reduce((acc, producto) => acc + (producto.total * 100), 0) / 100) + totalIVA), { symbol: "$ ", separator: ".", decimal: "," }).format(),
      notas: notaCotizacion,
      usuario: `${usuario.nombre} ${usuario.apellido}`,
    });
  }, [selectedLead, productos, precioVentaProducto, notaCotizacion, selectedFechaCotizacion, referencia]);

  //* ENVIAR COTIZACIÓN
  const handleEnviarCotizacion = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/cotizador/nueva-cotizacion`, { cotizacion });
      window.open(response.data.data.url);
      if (response.status === 200) {
        setSnakBarOpen(true);
        // Actualizar el contador de cotizaciones
        setContadorCotizaciones(parseInt(contadorCotizaciones, 10) + 1);
      }
      setTimeout(() => {
        setSnakBarOpen(false);
      }
        , 2000);


      limpiarFormularioCrearCotizacion();
      handleCloseModal();
    } catch (error) {
      console.log(error);
    }
  }
  //* LIMPIAR FORMULARIO AGREGAR ARTÍCULO
  const limpiarFormularioAgregarProducto = () => {
    setSelectedProducto(null);
    setSelectedCantidadProducto(1);
    setPrecio('');
    setColor('text-gray-700');
  };
  //* LIMPIAR FORMULARIO CREAR COTIZACIÓN
  const limpiarFormularioCrearCotizacion = () => {
    setNotaCotizacion('');
    setSelectedLead(null);
    setProductos([]);
    setNotaCotizacion('');
    setSelectedProducto(null);
    setSelectedCantidadProducto(1);
    setPrecio('');
    setTotalIVA(0);
    setColor('text-gray-700');
    setReferencia('');
    // recargar la página
    window.location.reload();
  };



  const handleOpenModal2 = () => {
    setModalOpen(true);
    const modal = document.querySelector('#modal2');
    modal.classList.remove('hidden');
  };
  const handleModalInputChange = (e) => {
    setModalInput({
      ...modalInput,
      [e.target.name]: e.target.value,
    });
  };
  const handleAdd = () => {
    setModalOpen(false);
    // Agregar la clase hidden al modal
    const modal = document.querySelector('#modal2');
    modal.classList.add('hidden');
    // Eliminar la clase fixed al body
    const body = document.querySelector('body');
    body.classList.remove('fixed');

    // Limpiar el formulario
    setModalInput({ nombre: '', email: '' });


    // Crear un nuevo lead
    const nombre = modalInput.nombre;
    const email = modalInput.email;
    const codigo = Math.floor(Math.random() * 100000);
    // setCotizacion({
    //   ...cotizacion,
    //   lead: {
    //     nombre_lead: nombre,
    //     email_lead: email,
    //     codigo_lead: codigo,
    //   }
    // });
    setSelectedLead({ Nombre: nombre, EmailAdministracion: email, Codigo: codigo });
  };

  const handleCloseModal2 = () => {
    setModalOpen(false);
    // Agregar la clase hidden al modal
    const modal = document.querySelector('#modal2');
    modal.classList.add('hidden');
    // Eliminar la clase fixed al body
    const body = document.querySelector('body');
    body.classList.remove('fixed');
    // Limpiar el formulario
    setModalInput({ nombre: '', email: '' });
  };

  //* CONTROL ABRIR MODAL //
  const handleOpenModal = () => {
    setOpenModal(true);
    // Eliminar la clase hidden del modal
    const modal = document.querySelector('#modal');
    modal.classList.remove('hidden');
  }
  //* CONTROL CERRAR MODAL //
  const handleCloseModal = () => {
    setOpenModal(false);
    // Agregar la clase hidden al modal
    const modal = document.querySelector('#modal');
    modal.classList.add('hidden');
    // Eliminar la clase fixed al body
    const body = document.querySelector('body');
    body.classList.remove('fixed');
  }


  return (
    <>
      {/* Centrar Snackbar */}
      <Snackbar
        open={snakBarOpen}
        autoHideDuration={3500}
        message="Cotización creada correctamente"
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
      <Breadcrumb pageName="Nueva Cotización" />
      {/* Incluir el número de cotización */}
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold text-gray-800"></h1>
        <p className="text-gray-800 pb-1">Cotización N° {String(parseInt(contadorCotizaciones, 10) + 1).padStart(7, '0')}</p>
      </div>

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
              defaultValue={selectedLead}
              isClearable={true}
              isSearchable={true}
              name="cliente"
              options={clienteOptions}
              onChange={handleChangeCliente}
            />
          </div>

          <div className="col-span-6 md:col-span-6">
            <Button color="primary" variant="contained" onClick={handleOpenModal2}>
              Nuevo Cliente
            </Button>
            {modalOpen && (
              <div className="modal">
                <input
                  type="text"
                  name="nombre"
                  value={modalInput.nombre}
                  onChange={handleModalInputChange}
                />
                <input
                  type="email"
                  name="email"
                  value={modalInput.email}
                  onChange={handleModalInputChange}
                />
                <button onClick={handleAdd}>Agregar</button>
              </div>
            )}
          </div>

          {/* Columna 2 */}
          <div className="col-span-12 md:col-span-6">
            <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500 js-datepicker" type="date" defaultValue={fechaActual} autoComplete="on" onChange={handleChangeFecha} />
          </div>

          {/* Agregar Input para la referencia */}
          <div className="col-span-12 md:col-span-6">
            <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" type="text" value={referencia} placeholder="Referencia" onChange={handleChangeReferencia} />
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
        {productos.map((producto, index) => (
          <div key={index} className="flex pt-3 pb-3 border-b">
            <div className="flex-1 ">
              <p className="text-gray-800">{producto.NombreArticulo}</p>
            </div>

            <div className="px-1 w-20 text-right">
              <p className="text-gray-800">{producto.Cantidad}</p>
            </div>

            <div className="w-32 text-right">
              <p className="text-gray-800">
                {currency(producto.PrecioUnitario, { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format()}
              </p>
            </div>

            <div className="w-32 text-right">
              <p className="text-gray-800">
                {currency(producto.total, { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format()}
              </p>

            </div>

            <div className="px-5 w-30" style={{ textAlign: 'right' }}>
              <Button
                color="error"
                onClick={() => handleEliminarProducto(index)}
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
              {currency(Math.round((productos.reduce((acc, producto) => acc + (producto.total * 100), 0) / 100)), { symbol: "$ ", separator: ".", decimal: "," }).format()}
            </p>
            <p className="text-gray-800">
              {currency(Math.round(totalIVA), { symbol: "$ ", separator: ".", decimal: "," }).format()}
            </p>
            <p className="text-gray-800">
              {currency(Math.round((productos.reduce((acc, producto) => acc + (producto.total * 100), 0) / 100) + totalIVA), { symbol: "$ ", separator: ".", decimal: "," }).format()}
            </p>
          </div>

          <div className="px-1 w-20 text-right">
          </div>
        </div>

        <div className="flex-1 mt-5">
          <textarea className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full md:w-1/2 py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500 resize-none" type="text" placeholder="Condiciones:" onChange={(e) => setNotaCotizacion(e.target.value)}></textarea>
        </div>

        <div className="relative inline-block mt-5">
          <Box>
            <Button
              color="primary"
              onClick={handleEnviarCotizacion}
              disabled={productos.length === 0}
              variant="contained"
            >
              Crear Cotización
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
                  defaultValue={selectedProducto}
                  // value={selectedProducto}
                  isClearable={true}
                  isSearchable={true}
                  name="item"
                  onChange={handleChangeItem}
                  options={itemOptions}

                />
              </div>

              <div className="flex">
                <div className="mb-4 w-32 mr-1">
                  <label className="text-right text-gray-800 block mb-1 font-bold text-sm uppercase tracking-wide">Costo</label>
                  <input
                    className="text-right text-sm mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-3 px-1 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    type="text"
                    // eliminar los últimos 3 dígitos 
                    value={currency((Number(precioCostoProducto)).toString().replace('.', ','), { symbol: "$ ", separator: ".", decimal: "," }).format()}
                    readOnly />
                </div>

                <div className="mb-4 w-32 mr-1">
                  <label className="text-right text-gray-800 block mb-1 font-bold text-sm uppercase tracking-wide">+20%</label>
                  <input
                    className="text-right text-sm mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-3 px-1 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    type="text"
                    value={currency((Number(precioCostoProducto * 1.2)).toString().replace('.', ','), { symbol: "$ ", separator: ".", decimal: "," }).format()}
                    readOnly
                  />
                </div>

                <div className="mb-4 w-32 mr-1">
                  <label className="text-right text-gray-800 block mb-1 font-bold text-sm uppercase tracking-wide">+50%</label>
                  <input
                    className="text-right text-sm mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-3 px-1 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    type="text"
                    value={currency((Number(precioCostoProducto * 1.5)).toString().replace('.', ','), { symbol: "$ ", separator: ".", decimal: "," }).format()}
                    readOnly
                  />
                </div>

                <div className="mb-4 w-32">
                  <label className="text-right text-gray-800 block mb-1 font-bold text-sm uppercase tracking-wide">Ultimo</label>
                  <input className={`text-right text-sm mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-3 px-1 leading-tight focus:outline-none focus:bg-white focus:border-blue-500 ${getColor(ultimoPrecioProducto, precioCostoProducto)}`}
                    type="text"
                    value={currency((Number(ultimoPrecioProducto)).toString().replace('.', ','), { symbol: "$ ", separator: ".", decimal: "," }).format()}
                    readOnly />
                </div>
              </div>

              <div className="flex justify-end">
                <div className="mb-4 w-28 text-right">


                  {/* <div className="relative">
                    <label className="text-gray-800 block mb-1 font-bold text-sm uppercase tracking-wide ">Cantidad</label>
                    <input
                      className="text-right text-sm  mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-3 px-1 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                      type="number"
                      // defaultValue={1}
                      value={selectedCantidadProducto}
                      onChange={(e) => setSelectedCantidadProducto(e.target.value)} min={1} />
                  </div> */}

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
                    onClick={handleAgregarProducto}
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





        {/* Modal 2 */}
        <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }} id="modal2" className="fixed z-40 top-0 right-0 left-0 bottom-0 h-full w-full hidden">
          <div className="p-4 max-w-xl mx-auto left-0 right-0 overflow-hidden mt-24">
            <div className="shadow w-full rounded-lg bg-white overflow-hidden block p-3">
              <h2 className="font-bold text-2xl mb-6 text-gray-800 border-b pb-2">Agregar Cliente</h2>
              <div className="mb-3">
                <label className="text-gray-800 block mb-1 font-bold text-xs uppercase tracking-wide">Nombre o Razón Social: </label>
              </div>
              <div className="mb-3">
                <input
                  className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                  type="text"
                  placeholder="Nombre o Razón Social"
                  value={modalInput.nombre}
                  name="nombre"
                  onChange={handleModalInputChange}
                />
              </div>
              <div className="mb-3">
                <label className="text-gray-800 block mb-1 font-bold text-xs uppercase tracking-wide">Email: </label>
              </div>
              <div className="mb-3">

                <input
                  className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                  type="email"
                  placeholder="Email"
                  value={modalInput.email}
                  name="email"
                  onChange={handleModalInputChange}
                />
              </div>

              <div className="mt-4 text-right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <Button
                    color="primary"
                    onClick={handleCloseModal2}
                    variant="outlined"
                  >
                    Cancelar
                  </Button>

                  <Button
                    color="primary"
                    onClick={handleAdd}
                    variant="contained"
                  >
                    Agregar
                  </Button>
                </Box>

              </div>
            </div>
          </div>
        </div>
        {/* /Modal 2 */}
      </div>
    </>
  )

}

export default NuevaCotizacion;