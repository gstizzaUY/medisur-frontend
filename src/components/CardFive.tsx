import { useContext } from 'react';
import { dataContext } from '../hooks/DataContext';
import currency from 'currency.js';
import Inventory2Icon from '@mui/icons-material/Inventory2';

const CardFive = () => {
    const { valorTotalStock } = useContext(dataContext);

    // Modificación para mostrar "calculando..." mientras valorTotalStock no esté definido
    const valorMostrar = valorTotalStock ? currency(valorTotalStock, { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format() : "Calculando...";

    return (
        <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <p>Stock Valorizado</p>
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <Inventory2Icon className="text-primary" />
            </div>

            <div className="mt-4 flex items-end justify-between">
                <div>
                    <h4 className="text-title-md font-bold text-black dark:text-white">
                        {valorMostrar}
                    </h4>
                    {/* Escribir el mes actual en formato texto, tomando como dato el estado de mesActual */}
                    {/* <span className="text-sm font-medium">Facturación: {mesActual === 1 ? "Enero" : mesActual === 2 ? "Febrero" : mesActual === 3 ? "Marzo" : mesActual === 4 ? "Abril" : mesActual === 5 ? "Mayo" : mesActual === 6 ? "Junio" : mesActual === 7 ? "Julio" : mesActual === 8 ? "Agosto" : mesActual === 9 ? "Septiembre" : mesActual === 10 ? "Octubre" : mesActual === 11 ? "Noviembre" : "Diciembre"}{' '}{anioActual} </span> */}
                </div>
            </div>
        </div>
    );
};

export default CardFive;