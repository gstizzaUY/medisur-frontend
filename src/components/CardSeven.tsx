import { useContext } from 'react';
import { dataContext } from '../hooks/DataContext';
import currency from 'currency.js';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';


const CardSeven = () => {
    const { mesActual, anioActual, totalEgresosMesActual } = useContext(dataContext);

    console.log(totalEgresosMesActual);

    return (
        <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                        <ArrowCircleLeftIcon className="text-primary" />
                    </div>
                    <div>
                        <h5 className="text-md font-semibold text-black dark:text-white">Egresos</h5>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {mesActual === 1 ? "Enero" : mesActual === 2 ? "Febrero" : mesActual === 3 ? "Marzo" : mesActual === 4 ? "Abril" : mesActual === 5 ? "Mayo" : mesActual === 6 ? "Junio" : mesActual === 7 ? "Julio" : mesActual === 8 ? "Agosto" : mesActual === 9 ? "Septiembre" : mesActual === 10 ? "Octubre" : mesActual === 11 ? "Noviembre" : "Diciembre"}{' '}{anioActual}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-1.5">
                <div className="flex justify-between items-center py-1.5 px-3 bg-red-50 rounded dark:bg-red-900 dark:bg-opacity-20">
                    <span className="text-sm font-semibold text-red-700 dark:text-red-300">Total:</span>
                    <h4 className="text-title-md font-bold text-red-700 dark:text-red-300">
                        {currency(totalEgresosMesActual, { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format()}
                    </h4>
                </div>
            </div>
        </div>
    );
};

export default CardSeven;