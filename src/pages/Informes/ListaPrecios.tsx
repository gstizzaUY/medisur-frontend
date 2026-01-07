import { useContext, useState, useMemo, useCallback } from 'react';
import { dataContext } from '../../hooks/DataContext';
import Breadcrumb from '../../components/Breadcrumb';
import Select from 'react-select';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Button, CircularProgress, Box } from '@mui/material';
import currency from "currency.js";
import axios from 'axios';

const ListaPrecios = () => {
    const { listasDePrecios } = useContext(dataContext);
    const [listaDePreciosSeleccionada, setListaDePreciosSeleccionada] = useState(null);
    const [articulosConPrecio, setArticulosConPrecio] = useState([]);
    const [loading, setLoading] = useState(false);



    const listaDePreciosOptions = useMemo(() => listasDePrecios.reduce((unique, listaDePrecios) => {
        const isDuplicate = unique.some(option => option.value === listaDePrecios.PrecioVentaCodigo && option.label === listaDePrecios.PrecioVentaNombre);
        if (!isDuplicate) {
            unique.push({ value: listaDePrecios.PrecioVentaCodigo, label: listaDePrecios.PrecioVentaNombre });
        }
        return unique;
    }, []), [listasDePrecios]);



    const handleChangeListaDePrecios = useCallback((selectedOption) => {
        setListaDePreciosSeleccionada(selectedOption ? selectedOption : undefined);
    }, []);



    const handleConsultar = useCallback(async () => {
        setArticulosConPrecio([]);
        setLoading(true);
        if (!listaDePreciosSeleccionada) {
            console.error('No se ha seleccionado ninguna lista de precios');
            setLoading(false);
            return;
        }
        const listaArticulosConPrecio = await axios.post(`${import.meta.env.VITE_API_URL}/facturas/lista-precios`, {
            listaDePrecios: listaDePreciosSeleccionada.value,
        });
        const filteredData = listaArticulosConPrecio.data.filter(articulo => articulo.PrecioSinIVA !== "0.00000");
        setArticulosConPrecio(filteredData);
        setLoading(false);
    }, [listaDePreciosSeleccionada]);

    const exportarPDF = async (data) => {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/facturas/lista-precios/exportar-pdf`, {
            data: articulosConPrecio,
            lista: listaDePreciosSeleccionada
        });
        window.open(response.data.data.url, '_blank');
    };



    const data = useMemo(() => {
        let result = [];
        for (let i = 0; i < articulosConPrecio.length; i++) {
            let articulo = articulosConPrecio[i];
            // Convertir PrecioSinIVA a número, independientemente si es string o número
            const precio = typeof articulo.PrecioSinIVA === 'string' 
                ? Number(articulo.PrecioSinIVA.slice(0, -3)) 
                : Number(articulo.PrecioSinIVA);
            
            result.push({
                Codigo: articulo.Codigo,
                Nombre: articulo.Nombre,
                PrecioSinIVA: currency(precio, { symbol: '$ ', precision: 2, separator: '.', decimal: ',' }).format(),
            });
        }
        // eliminar duplicados de result
        result = result.reduce((unique, o) => {
            if (!unique.some(obj => obj.Codigo === o.Codigo)) {
                unique.push(o);
            }
            return unique;
        }, []);
        return result;
    }, [articulosConPrecio]);



    const columns = useMemo(
        () => [
            {
                accessorKey: 'Codigo',
                header: 'Código',
                size: 50,
            },
            {
                accessorKey: 'Nombre',
                header: 'Nombre',
                size: 50,
            },
            {
                accessorKey: 'PrecioSinIVA',
                header: 'Precio Sin IVA',
                size: 50,
            },
        ],
        []
    );

    const table = useMaterialReactTable({
        columns,
        localization: MRT_Localization_ES,
        data,
        enableStickyHeader: false,
        enableStickyFooter: false,
        muiTableContainerProps: { sx: { maxHeight: 430 } },
        enableTopToolbar: true,
        positionActionsColumn: "last",
        globalFilterFn: 'contains',
        enableGlobalFilterRankedResults: true,
        initialState: {
            pagination: { pageIndex: 0, pageSize: 100 },
            density: 'compact',
            columnVisibility: {
                'Codigo': false,
            },
            sorting: [
                { id: 'Nombre', desc: false },
            ],
        },
        renderTopToolbarCustomActions: ({ table }) => (
            <Box sx={{ display: 'flex', gap: '1rem', p: '4px' }}>
                {articulosConPrecio.length > 0 && (
                    <Button
                        style={{ backgroundColor: '#00aaad', color: 'white' }}
                        onClick={() => {
                            // Exportar Lista de Precios
                            exportarPDF(data);
                        }}
                        variant="contained"
                        disabled={articulosConPrecio.length === 0}
                    >
                        Exportar PDF
                    </Button>
                )}
            </Box>
        ),
    });

    return (
        <>
            <Breadcrumb pageName="Listas de Precios" />
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
                        placeholder="Seleccione una Lista de Precios"
                        defaultValue={listasDePrecios[0]}
                        isClearable={true}
                        isSearchable={true}
                        name="cliente"
                        options={listaDePreciosOptions}
                        onChange={handleChangeListaDePrecios}
                    />
                </div>
                <div className="col-span-12 md:col-span-6">
                    <Button
                        style={{ backgroundColor: '#00aaad', color: 'white' }}
                        variant="contained"
                        className="mb-2"
                        onClick={handleConsultar}>
                        Consultar
                        {loading && <CircularProgress size={24} style={{ color: 'white', marginLeft: '5px' }} />}
                    </Button>
                </div>
            </div>
            <MaterialReactTable
                table={table}
            />
        </>
    );
};

export default ListaPrecios;