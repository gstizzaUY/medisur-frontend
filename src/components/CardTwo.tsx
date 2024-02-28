import React from 'react';
import { useContext, useEffect } from 'react';
import { dataContext } from '../hooks/DataContext';
import currency from 'currency.js';
import CardTravelIcon from '@mui/icons-material/CardTravel';

const CardTwo = () => {
  const { mesActual, setMesActual } = useContext(dataContext);
  const { anioActual, setAnioActual } = useContext(dataContext);
  const { totalFacturadoMesAnterior, setTotalFacturadoMesAnterior } = useContext(dataContext);

  


  return (
    <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
      < CardTravelIcon className="text-primary" />
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-title-md font-bold text-black dark:text-white">
          {currency(totalFacturadoMesAnterior,  { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format()}
          </h4>
          <span className="text-sm font-medium">
            Facturación: { mesActual === 1 ? "Diciembre" : mesActual === 2 ? "Enero" : mesActual === 3 ? "Febrero" : mesActual === 4 ? "Marzo" : mesActual === 5 ? "Abril" : mesActual === 6 ? "Mayo" : mesActual === 7 ? "Junio" : mesActual === 8 ? "Julio" : mesActual === 9 ? "Agosto" : mesActual === 10 ? "Septiembre" : mesActual === 11 ? "Octubre" : "Noviembre" }{' '}{ mesActual === 1 ? anioActual - 1 : anioActual }
          </span>
        </div>

        {/* <span className="flex items-center gap-1 text-sm font-medium text-meta-3">
          4.35%
          <svg
            className="fill-meta-3"
            width="10"
            height="11"
            viewBox="0 0 10 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.35716 2.47737L0.908974 5.82987L5.0443e-07 4.94612L5 0.0848689L10 4.94612L9.09103 5.82987L5.64284 2.47737L5.64284 10.0849L4.35716 10.0849L4.35716 2.47737Z"
              fill=""
            />
          </svg>
        </span> */}
      </div>
    </div>
  );
};

export default CardTwo;
