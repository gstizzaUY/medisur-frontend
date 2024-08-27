import React from 'react';
import { useContext, useEffect } from 'react';
import { dataContext } from '../hooks/DataContext';
import currency from 'currency.js';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';

const CardEight = () => {
    const { mesActual, anioActual, totalEgresosMesAnterior } = useContext(dataContext);


    return (
        <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                < AssignmentReturnIcon className="text-primary" />
            </div>

            <div className="mt-4 flex items-end justify-between">
                <div>
                    <h4 className="text-title-md font-bold text-black dark:text-white">
                        {currency(totalEgresosMesAnterior, { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format()}
                    </h4>
                    <span className="text-sm font-medium">
                        Egresos: {mesActual === 1 ? "Diciembre" : mesActual === 2 ? "Enero" : mesActual === 3 ? "Febrero" : mesActual === 4 ? "Marzo" : mesActual === 5 ? "Abril" : mesActual === 6 ? "Mayo" : mesActual === 7 ? "Junio" : mesActual === 8 ? "Julio" : mesActual === 9 ? "Agosto" : mesActual === 10 ? "Septiembre" : mesActual === 11 ? "Octubre" : "Noviembre"}{' '}{mesActual === 1 ? anioActual - 1 : anioActual}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CardEight;
