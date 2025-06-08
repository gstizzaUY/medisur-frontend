import { useContext } from 'react';
import { dataContext } from '../hooks/DataContext';
import currency from 'currency.js';
import MonetizationOnSharpIcon from '@mui/icons-material/MonetizationOnSharp';

const CardSix = () => {
    const { mesActual, anioActual, totalGananciasMensual, porentajeGananciasMensual } = useContext(dataContext);

    return (
        <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                        <MonetizationOnSharpIcon className="text-primary" />
                    </div>
                    <div>
                        <h5 className="text-md font-semibold text-black dark:text-white">Ganancias</h5>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {mesActual === 1 ? "Enero" : mesActual === 2 ? "Febrero" : mesActual === 3 ? "Marzo" : mesActual === 4 ? "Abril" : mesActual === 5 ? "Mayo" : mesActual === 6 ? "Junio" : mesActual === 7 ? "Julio" : mesActual === 8 ? "Agosto" : mesActual === 9 ? "Septiembre" : mesActual === 10 ? "Octubre" : mesActual === 11 ? "Noviembre" : "Diciembre"}{' '}{anioActual}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-1.5">
                <div className="flex justify-between items-center py-1.5 px-3 bg-gray-50 rounded dark:bg-boxdark-2">
                    <span className="text-sm font-semibold text-black dark:text-white">Monto:</span>
                    <h4 className="text-title-md font-bold text-black dark:text-white">
                        {currency(totalGananciasMensual, { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format()}
                    </h4>
                </div>
                
                <div className="flex justify-between items-center py-1.5 px-3 bg-primary bg-opacity-10 rounded dark:bg-opacity-30">
                    <span className="text-sm font-semibold text-black dark:text-white">Margen:</span>
                    <h4 className="text-title-md font-bold text-primary dark:text-white">
                        {porentajeGananciasMensual.toFixed(2).replace('.', ',')} %
                    </h4>
                </div>
            </div>
        </div>
    );
};

export default CardSix;