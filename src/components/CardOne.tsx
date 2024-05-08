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
      </div>
    </div>
  );
};

export default CardOne;