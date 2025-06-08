import React from 'react';
import { useContext, useEffect } from 'react';
import { dataContext } from '../hooks/DataContext';
import currency from 'currency.js';
import CardTravelIcon from '@mui/icons-material/CardTravel';

const CardTwo = () => {
  const { mesActual, setMesActual } = useContext(dataContext);
  const { anioActual, setAnioActual } = useContext(dataContext);
  const { totalFacturadoMesAnterior, setTotalFacturadoMesAnterior, subTotalFacturadoMesAnterior, setSubTotalFacturadoMesAnterior, ivaFacturadoMesAnterior, setIvaFacturadoMesAnterior } = useContext(dataContext);

  


  return (
    <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <CardTravelIcon className="text-primary" />
          </div>
          <div>
            <h5 className="text-md font-semibold text-black dark:text-white">Facturación</h5>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              { mesActual === 1 ? "Diciembre" : mesActual === 2 ? "Enero" : mesActual === 3 ? "Febrero" : mesActual === 4 ? "Marzo" : mesActual === 5 ? "Abril" : mesActual === 6 ? "Mayo" : mesActual === 7 ? "Junio" : mesActual === 8 ? "Julio" : mesActual === 9 ? "Agosto" : mesActual === 10 ? "Septiembre" : mesActual === 11 ? "Octubre" : "Noviembre" }{' '}{ mesActual === 1 ? anioActual - 1 : anioActual }
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-1.5">
        <div className="flex justify-between items-center py-1.5 px-3 bg-gray-50 rounded dark:bg-boxdark-2">
          <span className="text-sm font-semibold text-black dark:text-white">Subtotal:</span>
          <h4 className="text-title-md font-bold text-black dark:text-white">
            {currency(subTotalFacturadoMesAnterior, {
              symbol: '$ ',
              precision: 2,
              separator: '.',
              decimal: ',',
            }).format()}
          </h4>
        </div>
        
        <div className="flex justify-between items-center py-1.5 px-3 bg-gray-50 rounded dark:bg-boxdark-2">
          <span className="text-sm font-semibold text-black dark:text-white">IVA:</span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {currency(ivaFacturadoMesAnterior, {
              symbol: '$ ',
              precision: 2,
              separator: '.',
              decimal: ',',
            }).format()}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-1.5 px-3 bg-primary bg-opacity-10 rounded dark:bg-opacity-30">
          <span className="text-sm font-semibold text-black dark:text-white">Total:</span>
          <h4 className="text-title-md font-bold text-primary dark:text-white">
            {currency(totalFacturadoMesAnterior, {
              symbol: '$ ',
              precision: 2,
              separator: '.',
              decimal: ',',
            }).format()}
          </h4>
        </div>
      </div>
    </div>
  );
};

export default CardTwo;
