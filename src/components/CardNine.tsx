import { useContext } from 'react';
import { dataContext } from '../hooks/DataContext';
import currency from 'currency.js';
import PercentIcon from '@mui/icons-material/Percent';

const CardNine = () => {
    const { mesActual, anioActual, totalEgresosMesAnterior, totalEgresosMesActual } = useContext(dataContext);

    return (
        <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                        <PercentIcon className="text-primary" />
                    </div>
                    <div>
                        <h5 className="text-md font-semibold text-black dark:text-white">Variación Egresos</h5>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Mes actual vs anterior
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-1.5">
                <div className="flex justify-between items-center py-1.5 px-3 bg-red-50 rounded dark:bg-red-900 dark:bg-opacity-20">
                    <span className="text-sm font-semibold text-red-700 dark:text-red-300">Porcentaje:</span>
                    <h4 className="text-title-md font-bold text-red-700 dark:text-red-300">
                        {currency(((totalEgresosMesActual / totalEgresosMesAnterior) -1) * 100, { symbol: "", precision: 2, separator: ".", decimal: "," }).format()}{' '}%
                    </h4>
                </div>
            </div>
        </div>
    );
};

export default CardNine;
