import { useContext } from 'react';
import { dataContext } from '../hooks/DataContext';
import currency from 'currency.js';
import Inventory2Icon from '@mui/icons-material/Inventory2';

const CardFive = () => {
    const { valorTotalStock } = useContext(dataContext);

    // Modificación para mostrar "calculando..." mientras valorTotalStock no esté definido
    const valorMostrar = valorTotalStock ? currency(valorTotalStock, { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format() : "Calculando...";    return (
        <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                        <Inventory2Icon className="text-primary" />
                    </div>
                    <div>
                        <h5 className="text-md font-semibold text-black dark:text-white">Stock Valorizado</h5>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Inventario actual
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-1.5">
                <div className="flex justify-between items-center py-1.5 px-3 bg-primary bg-opacity-10 rounded dark:bg-opacity-30">
                    <span className="text-sm font-semibold text-black dark:text-white">Valor total:</span>
                    <h4 className="text-title-md font-bold text-primary dark:text-white">
                        {valorMostrar}
                    </h4>
                </div>
            </div>
        </div>
    );
};

export default CardFive;