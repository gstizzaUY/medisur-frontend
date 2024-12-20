import { ApexOptions } from 'apexcharts';
import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { dataContext } from '../hooks/DataContext';
import currency from "currency.js";
import dayjs from 'dayjs';

const options: ApexOptions = {
  legend: {
    show: false,
    position: 'top',
    horizontalAlign: 'left',
  },
  colors: ['#00aaad', '#80CAEE'],
  chart: {
    fontFamily: 'Satoshi, sans-serif',
    height: 335,
    type: 'area',
    dropShadow: {
      enabled: true,
      color: '#623CEA14',
      top: 10,
      blur: 4,
      left: 0,
      opacity: 0.1,
    },
    toolbar: {
      show: false,
    },
  },
  responsive: [
    {
      breakpoint: 1024,
      options: {
        chart: {
          height: 300,
        },
      },
    },
    {
      breakpoint: 1366,
      options: {
        chart: {
          height: 350,
        },
      },
    },
  ],
  stroke: {
    width: [2, 2],
    curve: 'straight',
  },
  grid: {
    xaxis: {
      lines: {
        show: true,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
      },
  },
  dataLabels: {
    enabled: false,
  },
  markers: {
    size: 4,
    colors: '#fff',
    strokeColors: ['#00aaad', '#80CAEE'],
    strokeWidth: 3,
    strokeOpacity: 0.9,
    strokeDashArray: 0,
    fillOpacity: 1,
    discrete: [],
    hover: {
      size: undefined,
      sizeOffset: 5,
    },
  },
  xaxis: {
    type: 'category',
    categories: [
      'Sep',
      'Oct',
      'Nov',
      'Dec',
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
    ],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    title: {
      style: {
        fontSize: '0px',
      },
    },
    min: 0,
    max: 6000000,
    labels: {
      formatter: (value: number) => currency(value, { separator: '.', decimal: ',' }).format(),
    },
  },
};

interface ChartOneState {
  series: {
    name: string;
    data: number[];
  }[];
}

const ChartOne: React.FC = () => {
  const { mesActual, anioActual, facturasClientes, egresos } = React.useContext(dataContext);
  const [state, setState] = useState<ChartOneState>({
    series: [
      {
        name: 'Facturación Neta',
        data: Array(12).fill(0),
      },
      {
        name: 'Egresos',
        data: Array(12).fill(0),
      },
    ],
    options: options,
  });

  const [visibleSeries, setVisibleSeries] = useState<string[]>(['Facturación Neta', 'Egresos']);

  const toggleSeriesVisibility = (seriesName: string) => {
    setVisibleSeries(prevVisibleSeries =>
      prevVisibleSeries.includes(seriesName)
        ? prevVisibleSeries.filter(name => name !== seriesName)
        : [...prevVisibleSeries, seriesName]
    );
  };

  // Función para generar los últimos 12 meses en formato 'MM/YY'
  function generateLast12Months() {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const month = dayjs().subtract(i, 'month').format('MM/YY');
      months.unshift(month);
    }
    return months;
  }

  useEffect(() => {
    const ventasPorMes = {};
    const devolucionesPorMes = {};
    const egresosPorMes = {};
  
    facturasClientes.forEach(factura => {
      const mesAnio = dayjs(factura.Fecha).format('MM/YY');
      let totalFactura = parseFloat(factura.Total);
      if (factura.ComprobanteCodigo === 701 || factura.ComprobanteCodigo === 703) {
        if (!ventasPorMes[mesAnio]) {
          ventasPorMes[mesAnio] = 0;
        }
        ventasPorMes[mesAnio] += totalFactura;
      } else if (factura.ComprobanteCodigo === 702 || factura.ComprobanteCodigo === 704) {
        if (!devolucionesPorMes[mesAnio]) {
          devolucionesPorMes[mesAnio] = 0;
        }
        devolucionesPorMes[mesAnio] += totalFactura;
      }
    });
  
    // Crear una copia de los egresos y modificar el valor de Total cuando CajaCodigo sea 2
    const egresosModificados = egresos.map(egreso => {
      if (egreso.CajaCodigo === 2) {
        return {
          ...egreso,
          Total: parseFloat(egreso.Total) * parseFloat(egreso.CotizacionEspecial),
        };
      }
      return egreso;
    });
  
    egresosModificados.forEach(egreso => {
      const mesAnio = dayjs(egreso.Fecha).format('MM/YY');
      let totalEgreso = parseFloat(egreso.Total);
      if (!egresosPorMes[mesAnio]) {
        egresosPorMes[mesAnio] = 0;
      }
      egresosPorMes[mesAnio] += totalEgreso;
    });
  
    const facturacionNetoPorMes = {};
    for (let mesAnio in ventasPorMes) {
      facturacionNetoPorMes[mesAnio] = ventasPorMes[mesAnio] - (devolucionesPorMes[mesAnio] || 0);
    }
  
    setState(prevState => ({
      ...prevState,
      series: [
        {
          name: 'Facturación Neta',
          data: Object.values(facturacionNetoPorMes).reverse(),
        },
        {
          name: 'Egresos',
          data: Object.values(egresosPorMes).reverse(),
        },
      ],
      options: {
        ...prevState.options,
        xaxis: {
          ...prevState.options.xaxis,
          categories: generateLast12Months(),
        },
      },
    }));
  }, [facturasClientes, egresos]);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          <div className="flex min-w-47.5 cursor-pointer" onClick={() => toggleSeriesVisibility('Facturación Neta')}>
            <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-secondary"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-primary">Facturación Neta</p>
            </div>
          </div>

          <div className="flex min-w-47.5 cursor-pointer" onClick={() => toggleSeriesVisibility('Egresos')}>
            <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-secondary"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-primary">Egresos</p>
            </div>
          </div>

        </div>
        <div className="flex w-full max-w-45 justify-end">
          <div className="inline-flex items-center rounded-md bg-whiter p-1.5 dark:bg-meta-4">
            <button className="rounded py-1 px-3 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark">
              Mensual
            </button>
          </div>
        </div>
      </div>

      <div>
        <div id="chartOne" className="-ml-5">
          <ReactApexChart
            options={state.options}
            series={state.series.filter(series => visibleSeries.includes(series.name))}
            type="area"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartOne;