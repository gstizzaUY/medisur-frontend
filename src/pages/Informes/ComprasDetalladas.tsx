import { useContext, useState, useEffect, useMemo } from 'react';
import { dataContext } from '../../hooks/DataContext';
import Breadcrumb from '../../components/Breadcrumb';
import Select from 'react-select';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Button } from '@mui/material';
import currency from "currency.js";
import dayjs from 'dayjs';

const ComprasDetalladas = () => {
    const { mesActual, anioActual, contactos, comprasDetalladas } = useContext(dataContext);
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState(() => {
        const proveedorGuardado = localStorage.getItem('proveedorSeleccionado');
        return proveedorGuardado ? JSON.parse(proveedorGuardado) : undefined;
    });
    const [comprasFiltradasAgrupadas, setComrasFiltradasAgrupadas] = useState(() => {
        const datosTablaGuardados = localStorage.getItem('datosTabla');
        return datosTablaGuardados ? JSON.parse(datosTablaGuardados) : {};
    });
    const [data, setData] = useState([]);
    const proveedores = contactos.filter(contacto => contacto.EsProveedor === "S");
    const proveedoresOptions = proveedores.map(proveedor => ({ value: proveedor.Nombre, label: proveedor.Nombre }));

    const handleChangeProveedor = selectedOption => {
        const proveedor = proveedores.find(proveedor => proveedor.Nombre === selectedOption.value);
        setProveedorSeleccionado(proveedor);
        localStorage.setItem('proveedorSeleccionado', JSON.stringify(proveedor));
    };

    const handleConsultar = () => {
        if (!proveedorSeleccionado) {
            console.error('No se ha seleccionado ningún proveedor');
            return;
        }
        const comprasFiltradas = comprasDetalladas.filter(compra => compra.ProveedorCodigo === proveedorSeleccionado.Codigo);
        const comprasAgrupadas = comprasFiltradas.reduce((acumulador, compra) => {
            const fecha = dayjs(compra.FacturaFecha);
            const mesAni = `${fecha.month() + 1}-${fecha.year()}`;
            const moneda = compra.MonedaCodigo === 2 ? 'dolares' : 'pesos';
            let productoExistente = acumulador[`${compra.ArticuloCodigo}-${moneda}`];
            if (!productoExistente) {
                productoExistente = {
                    codigo: compra.ArticuloCodigo,
                    nombre: compra.ArticuloNombre,
                    Cantidad: {},
                    Precio: {},
                    MonedaCodigo: compra.MonedaCodigo,
                    count: 0,
                };
                acumulador[`${compra.ArticuloCodigo}-${moneda}`] = productoExistente;
            }
            const precioProducto = Number(compra.LineaSubtotal) / Number(compra.LineaCantidad);
            productoExistente.Cantidad[mesAni] = (productoExistente.Cantidad[mesAni] || 0) + Number(compra.LineaCantidad);
            productoExistente.Precio[mesAni] = precioProducto;
            productoExistente.count += 1;
            return acumulador;
        }, {});

        setComrasFiltradasAgrupadas(Object.values(comprasAgrupadas));
        localStorage.setItem('datosTabla', JSON.stringify(Object.values(comprasAgrupadas)));
    };

    useEffect(() => {
        const data = Object.values(comprasFiltradasAgrupadas).map(producto => {
            const { codigo, nombre, Cantidad, Precio, MonedaCodigo } = producto;
            const row = { codigo, nombre };

            for (let mesAni in Cantidad) {
                let [mes, anio] = mesAni.split('-');
                mes = mes.padStart(2, '0');
                anio = anio.slice(-2);
                const newMesAni = `${mes}/${anio}`;
                const monedaSimbolo = MonedaCodigo === 2 ? "U$S " : "$ ";
                const decimales = MonedaCodigo === 2 ? 3 : 2;
                const precioFormateado = currency(Precio[mesAni], { symbol: monedaSimbolo, separator: ".", decimal: ",", precision: decimales }).format();
                row[`Cantidad_${newMesAni}`] = `${Cantidad[mesAni]} (${precioFormateado})`;
            }
            return row;
        });
        setData(data);
    }, [comprasFiltradasAgrupadas]);

    const columns = useMemo(() => {
        const cols = [
            { accessorKey: 'codigo', header: 'Código', size: 50 },
            { accessorKey: 'nombre', header: 'Nombre del Artículo', sortDescFirst: true, size: 200 },
        ];
        for (let i = 0; i < 12; i++) {
            let mes = mesActual - i;
            let anio = anioActual;
            if (mes < 1) {
                mes += 12;
                anio -= 1;
            }
            const mesAni = `${mes.toString().padStart(2, '0')}/${anio.toString().slice(-2)}`;
            cols.push({ accessorKey: `Cantidad_${mesAni}`, header: `${mesAni}`, size: 140 });
        }
        return cols;
    }, [mesActual, anioActual]);

    const table = useMaterialReactTable({
        columns,
        data,
        localization: MRT_Localization_ES,
        enableTopToolbar: false,
        positionActionsColumn: "last",
        globalFilterFn: 'contains',
        enableGlobalFilterRankedResults: true,
        enableStickyHeader: true,
        enableStickyFooter: true,
        muiTableContainerProps: { sx: { maxHeight: 430 } },
        initialState: {
            pagination: { pageIndex: 0, pageSize: 100 },
            density: 'compact',
            sorting: [
                { id: 'nombre', desc: false },
            ],
            columnVisibility: {
                'codigo': false,
            },
        },
    });

    return (
        <>
            <Breadcrumb pageName="Compras Detalladas" />
            <div className="grid grid-cols-12 gap-4 mb-6">
                <div className="col-span-12 md:col-span-6">
                    <Select
                        className="z-50 bg-gray-200 appearance-none rounded w-full py-0 px-0 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                        styles={{
                            control: (baseStyles, state) => ({
                                ...baseStyles,
                                backgroundColor: '#FFFFFF',
                                border: '2px',
                                '&:hover': { backgroundColor: '#FFFFFF' },
                            }),
                        }}
                        placeholder="Seleccione un Proveedor"
                        defaultValue={proveedoresOptions.find(option => option.value === proveedorSeleccionado?.Nombre) || ''}
                        isClearable={true}
                        isSearchable={true}
                        name="cliente"
                        options={proveedoresOptions}
                        onChange={handleChangeProveedor}
                    />
                </div>
                <div className="col-span-12 md:col-span-6">
                    <Button
                        style={{ backgroundColor: '#00aaad', color: 'white' }}
                        variant="contained"
                        className="mb-2"
                        onClick={handleConsultar}>
                        Consultar
                    </Button>
                </div>
            </div>
            <MaterialReactTable
                table={table}
            />
        </>
    );
};

export default ComprasDetalladas;