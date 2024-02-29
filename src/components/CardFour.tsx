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
    if (dayjs(comprobante.Fecha).add(comprobante.CondicionCodigo, 'day').isBefore(hoy)) {
      saldoVencido += parseFloat(comprobante.SaldoSigno.slice(0, -3));
    }
  });

  return (
    <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <p>Saldos Pendientes</p>
      <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
        <LocalFireDepartmentTwoToneIcon className="text-primary" />
      </div>
      <div className="mt-2 flex items-end justify-between">
          <div>
            <h4 className="text-title-md font-bold text-danger dark:text-white">
              {currency(saldoVencido, { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format()}
            </h4>
            <span className="text-sm font-medium">{currency(saldoTotal, { symbol: "$ ", precision: 2, separator: ".", decimal: "," }).format()}</span>
          </div>
      </div>
    </div>
  );
}

export default CardFour;
