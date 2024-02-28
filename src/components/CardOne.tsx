import React from 'react';
import { useContext, useState, useEffect } from 'react';
import { dataContext } from '../hooks/DataContext';
import currency from 'currency.js';
import MonetizationOnSharpIcon from '@mui/icons-material/MonetizationOnSharp';


const CardOne = () => {
const {mesActual, setMesActual} = React.useContext(dataContext);
const {anioActual, setAnioActual} = React.useContext(dataContext);
const {totalFacturadoMesActual, setTotalFacturadoMesActual} = React.useContext(dataContext);







  return (
    <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
      < MonetizationOnSharpIcon className="text-primary" />
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-title-md font-bold text-black dark:text-white">
          {currency(totalFacturadoMesActual,  { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format()}
          </h4>
          {/* Escribir el mes actual en formato texto, tomando como dato el estado de mesActual */}
          <span className="text-sm font-medium">Facturación: { mesActual === 1 ? "Enero" : mesActual === 2 ? "Febrero" : mesActual === 3 ? "Marzo" : mesActual === 4 ? "Abril" : mesActual === 5 ? "Mayo" : mesActual === 6 ? "Junio" : mesActual === 7 ? "Julio" : mesActual === 8 ? "Agosto" : mesActual === 9 ? "Septiembre" : mesActual === 10 ? "Octubre" : mesActual === 11 ? "Noviembre" : "Diciembre" }{' '}{anioActual} </span>
        </div>

        {/* <span className="flex items-center gap-1 text-sm font-medium text-meta-3">
          0.43%
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

export default CardOne;
