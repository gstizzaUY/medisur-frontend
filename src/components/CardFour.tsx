import React from 'react';
import { dataContext } from '../hooks/DataContext';
import dayjs from 'dayjs';
import currency from 'currency.js';
import LocalFireDepartmentTwoToneIcon from '@mui/icons-material/LocalFireDepartmentTwoTone';

const CardFour = () => {
  const { comprobantesPendientes, setComprobantesPendientes } = React.useContext(dataContext);
  const hoy = dayjs().format('YYYY-MM-DD');

  // Crear dos variables: saldoTotal y saldoVencido. Por cada comprobante sumar SaldoSigno y asignarlo a saldoTotal. Si el comprobante está vencido sumar SaldoSigno a saldoVencido. 
  // Para saber si el comprobante está vencido, verificar la fecha en Fecha, verificar CondicionCodigo que da el número de días de crédito y restarle a hoy la fecha de vencimiento. Si el resultado es negativo, el comprobante está vencido. Sumar todos los comprobantes vencidos y asignar el resultado a saldoVencido.
  let saldoTotal = 0;
  let saldoVencido = 0;
  comprobantesPendientes.forEach((comprobante) => {
    saldoTotal += parseFloat(comprobante.SaldoSigno.slice(0, -3));
    // if (dayjs(comprobante.Fecha).add(comprobante.CondicionCodigo, 'day').isBefore(hoy)) {
    //   saldoVencido += parseFloat(comprobante.SaldoSigno.slice(0, -3));
    // }
    if (dayjs(comprobante.Fecha).add(60, 'day').isBefore(hoy)) {
      saldoVencido += parseFloat(comprobante.SaldoSigno.slice(0, -3));
    }
  });

  return (
    <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <LocalFireDepartmentTwoToneIcon className="text-primary" />
          </div>
          <div>
            <h5 className="text-md font-semibold text-black dark:text-white">Saldos Pendientes</h5>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Cuentas por cobrar
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-1.5">
        <div className="flex justify-between items-center py-1.5 px-3 bg-gray-50 rounded dark:bg-boxdark-2">
          <span className="text-sm font-semibold text-black dark:text-white">Total:</span>
          <h4 className="text-title-md font-bold text-black dark:text-white">
            {currency(saldoTotal, { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format()}
          </h4>
        </div>
        
        <div className="flex justify-between items-center py-1.5 px-3 bg-red-50 rounded dark:bg-red-900 dark:bg-opacity-20">
          <span className="text-sm font-semibold text-red-700 dark:text-red-300">Vencido:</span>
          <h4 className="text-title-md font-bold text-red-700 dark:text-red-300">
            {currency(saldoVencido, { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format()}
          </h4>
        </div>
      </div>
    </div>
  );
}

export default CardFour;
