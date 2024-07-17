import React, { useEffect } from 'react';
import { dataContext } from '../hooks/DataContext';
import currency from "currency.js";

const TableOne = () => {
  const { valorTotalStock } = React.useContext(dataContext);
  const { top10ArticulosValorizados } = React.useContext(dataContext);


  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Top 5 Artículos Valorizados
      </h4>

      <div className="flex flex-col">
        <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-5">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Artículo
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Stock
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Valor
            </h5>
          </div>
        </div>

        <div className="grid grid-cols-3 border-b border-stroke dark:border-strokedark sm:grid-cols-5">
          <div className="flex items-center gap-3 p-2.5 xl:p-5">
            <div className="flex-shrink-0">
            </div>
            <p className="text-black dark:text-white sm:block">{ top10ArticulosValorizados[0]?.Nombre  }</p>
          </div>

          <div className="flex items-center justify-center p-2.5 xl:p-5">
            <p className="text-black dark:text-white">{ top10ArticulosValorizados[0]?.Stock }</p>
          </div>

          <div className="flex items-center justify-center p-2.5 xl:p-5">
            <p className="text-meta-3">{ top10ArticulosValorizados[0]?.StockValorizado }</p>
          </div>
        </div>

        <div className="grid grid-cols-3 border-b border-stroke dark:border-strokedark sm:grid-cols-5">
          <div className="flex items-center gap-3 p-2.5 xl:p-5">
            <div className="flex-shrink-0">
            </div>
            <p className="text-black dark:text-white sm:block">
              { top10ArticulosValorizados[1]?.Nombre }
            </p>
          </div>

          <div className="flex items-center justify-center p-2.5 xl:p-5">
            <p className="text-black dark:text-white">
              { top10ArticulosValorizados[1]?.Stock }
            </p>
          </div>

          <div className="flex items-center justify-center p-2.5 xl:p-5">
            <p className="text-meta-3">
              { top10ArticulosValorizados[1]?.StockValorizado }
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 border-b border-stroke dark:border-strokedark sm:grid-cols-5">
          <div className="flex items-center gap-3 p-2.5 xl:p-5">
            <div className="flex-shrink-0">
            </div>
            <p className="text-black dark:text-white sm:block">
              { top10ArticulosValorizados[2]?.Nombre }
            </p>
          </div>

          <div className="flex items-center justify-center p-2.5 xl:p-5">
            <p className="text-black dark:text-white">
              { top10ArticulosValorizados[2]?.Stock }
            </p>
          </div>

          <div className="flex items-center justify-center p-2.5 xl:p-5">
            <p className="text-meta-3">
              { top10ArticulosValorizados[2]?.StockValorizado }
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 border-b border-stroke dark:border-strokedark sm:grid-cols-5">
          <div className="flex items-center gap-3 p-2.5 xl:p-5">
            <div className="flex-shrink-0">
            </div>
            <p className="text-black dark:text-white sm:block">
              { top10ArticulosValorizados[3]?.Nombre }
            </p>
          </div>

          <div className="flex items-center justify-center p-2.5 xl:p-5">
            <p className="text-black dark:text-white">
              { top10ArticulosValorizados[3]?.Stock }
            </p>
          </div>

          <div className="flex items-center justify-center p-2.5 xl:p-5">
            <p className="text-meta-3">
              { top10ArticulosValorizados[3]?.StockValorizado }
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5">
          <div className="flex items-center gap-3 p-2.5 xl:p-5">
            <div className="flex-shrink-0">
            </div>
            <p className="text-black dark:text-white sm:block">
              { top10ArticulosValorizados[4]?.Nombre }
            </p>
          </div>

          <div className="flex items-center justify-center p-2.5 xl:p-5">
            <p className="text-black dark:text-white">
              { top10ArticulosValorizados[4]?.Stock }
            </p>
          </div>

          <div className="flex items-center justify-center p-2.5 xl:p-5">
            <p className="text-meta-3">
              { top10ArticulosValorizados[4]?.StockValorizado }
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TableOne;
