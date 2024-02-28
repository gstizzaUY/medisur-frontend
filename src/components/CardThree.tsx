import { useContext } from 'react';
import { dataContext } from '../hooks/DataContext';
import currency from 'currency.js';
import PriceCheckSharpIcon from '@mui/icons-material/PriceCheckSharp';

const CardThree = () => {
  const { totalFacturadoMesActual, setTotalFacturadoMesActual } = useContext(dataContext);
  const { totalFacturadoMesAnterior, setTotalFacturadoMesAnterior } = useContext(dataContext);


  return (
    <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
      < PriceCheckSharpIcon className="text-primary" />
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-title-md font-bold text-black dark:text-white">
          {currency( ((totalFacturadoMesActual / totalFacturadoMesAnterior) -1) * 100, { symbol: "", precision: 2, separator: ".", decimal: "," }).format()}{' '}%
          </h4>
          <span className="text-sm font-medium">Variación</span>
        </div>
      </div>
    </div>
  );
};

export default CardThree;
