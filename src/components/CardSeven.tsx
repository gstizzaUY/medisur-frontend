import { useContext } from 'react';
import { dataContext } from '../hooks/DataContext';
import currency from 'currency.js';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';


const CardSeven = () => {
    const { mesActual, anioActual, totalEgresosMesActual } = useContext(dataContext);

    console.log(totalEgresosMesActual);


    return (
        <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                < ArrowCircleLeftIcon className="text-primary" />
            </div>

            <div className="mt-4 flex items-end justify-between">
                <div>
                    <h4 className="text-title-md font-bold text-black dark:text-white">
                        {currency(totalEgresosMesActual, { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format()}
                    </h4>
                    {/* Escribir el mes actual en formato texto, tomando como dato el estado de mesActual */}
                    <span className="text-sm font-medium">Egresos: {mesActual === 1 ? "Enero" : mesActual === 2 ? "Febrero" : mesActual === 3 ? "Marzo" : mesActual === 4 ? "Abril" : mesActual === 5 ? "Mayo" : mesActual === 6 ? "Junio" : mesActual === 7 ? "Julio" : mesActual === 8 ? "Agosto" : mesActual === 9 ? "Septiembre" : mesActual === 10 ? "Octubre" : mesActual === 11 ? "Noviembre" : "Diciembre"}{' '}{anioActual} </span>
                </div>
            </div>
        </div>
    );
};

export default CardSeven;