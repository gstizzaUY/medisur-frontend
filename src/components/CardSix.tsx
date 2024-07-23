import { useContext } from 'react';
import { dataContext } from '../hooks/DataContext';
import currency from 'currency.js';
import MonetizationOnSharpIcon from '@mui/icons-material/MonetizationOnSharp';

const CardOne = () => {
    const { mesActual, anioActual, totalGananciasMensual, porentajeGananciasMensual } = useContext(dataContext);

    return (
        <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <p>Ganancias</p>
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <MonetizationOnSharpIcon className="text-primary" />
            </div>

            {/* Contenedor de ganancias y porcentaje */}
            <div className="mt-4 flex justify-between items-center">
                <h4 className="text-title-md font-bold text-black dark:text-white">
                    {currency(totalGananciasMensual, { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format()}
                </h4>
                <h4 className="text-title-md font-bold text-black dark:text-white">
                    {porentajeGananciasMensual.toFixed(2).replace('.', ',')} %
                </h4>
            </div>

            {/* Contenedor del mes */}
            <div className="text-left">
                <span className="text-sm font-medium">
                    {mesActual === 1 ? "Enero" : mesActual === 2 ? "Febrero" : mesActual === 3 ? "Marzo" : mesActual === 4 ? "Abril" : mesActual === 5 ? "Mayo" : mesActual === 6 ? "Junio" : mesActual === 7 ? "Julio" : mesActual === 8 ? "Agosto" : mesActual === 9 ? "Septiembre" : mesActual === 10 ? "Octubre" : mesActual === 11 ? "Noviembre" : "Diciembre"}{' '}{anioActual}
                </span>
            </div>
        </div>
    );
};

export default CardOne;