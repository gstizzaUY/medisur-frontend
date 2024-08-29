import React, { useContext, useMemo, useEffect, useState } from 'react';
import { dataContext } from '../../hooks/DataContext';
import Breadcrumb from '../../components/Breadcrumb';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import currency from "currency.js";
import dayjs from 'dayjs';

const EgresosPorConcepto = () => {
    const { mesActual, anioActual, egresos } = useContext(dataContext);
    const [filteredEgresos, setFilteredEgresos] = useState([]);

    useEffect(() => {
        const updatedEgresos = egresos.map(egreso => {
            if (egreso.CajaCodigo === 2) {
                return {
                    ...egreso,
                    Total: egreso.Total * egreso.CotizacionEspecial
                };
            }
            return egreso;
        });
        setFilteredEgresos(updatedEgresos);
    }, [egresos]);

    const data = useMemo(() => {
        const egresosPorMes = {};

        filteredEgresos.forEach(egreso => {
            const mesAnio = dayjs(egreso.Fecha).format('MM/YY');
            const concepto = egreso.ConceptoNombre;
            if (!egresosPorMes[concepto]) {
                egresosPorMes[concepto] = {};
            }
            if (!egresosPorMes[concepto][mesAnio]) {
                egresosPorMes[concepto][mesAnio] = 0;
            }
            let totalEgreso = parseFloat(egreso.Total);
            egresosPorMes[concepto][mesAnio] += totalEgreso;
        });

        for (let concepto in egresosPorMes) {
            for (let mesAnio in egresosPorMes[concepto]) {
                egresosPorMes[concepto][mesAnio] = `${currency(egresosPorMes[concepto][mesAnio], { symbol: '$ ', precision: 2, separator: ".", decimal: "," }).format()}`;
            }
        }
        console.log('Egresos por concepto:', egresosPorMes);
        return Object.entries(egresosPorMes).map(([concepto, egresos]) => ({ concepto, ...egresos }));
    }, [filteredEgresos]);

    const columns = useMemo(() => {
        const cols = [
            {
                accessorKey: 'concepto',
                header: 'Concepto',
                sortDescFirst: true,
                size: 200
            },
        ];

        const totals = {};

        for (let i = 0; i < 12; i++) {
            let mes = mesActual - i;
            let anio = anioActual;
            if (mes < 1) {
                mes += 12;
                anio -= 1;
            }
            const mesAni = `${mes.toString().padStart(2, '0')}/${anio.toString().slice(-2)}`;
            totals[mesAni] = filteredEgresos.reduce((acc, egreso) => {
                const egresoMesAnio = dayjs(egreso.Fecha).format('MM/YY');
                if (egresoMesAnio === mesAni) {
                    acc += parseFloat(egreso.Total);
                }
                return acc;
            }, 0);

            cols.push(
                {
                    accessorKey: mesAni,
                    header: `${mesAni}`,
                    size: 140,
                    disableFilters: true,
                    muiTableHeadCellProps: {
                        align: 'right',
                    },
                    muiTableBodyCellProps: {
                        align: 'right',
                    },
                    Footer: () => (
                        <div style={{ textAlign: 'right', fontWeight: 'bold', color: 'red', fontSize: '16px' }}>
                            {currency(totals[mesAni], { symbol: '$ ', precision: 2, separator: ".", decimal: "," }).format()}
                        </div>
                    ),
                }
            );
        }
        return cols;
    }, [mesActual, anioActual, filteredEgresos]);

    const table = useMaterialReactTable({
        columns,
        data,
        localization: MRT_Localization_ES,
        enableTopToolbar: true,
        positionActionsColumn: "last",
        globalFilterFn: 'contains',
        enableGlobalFilterRankedResults: true,
        enableStickyHeader: true,
        enableStickyFooter: true,
        muiTableContainerProps: { sx: { maxHeight: 430 } },
        initialState: {
            pagination: { pageIndex: 0, pageSize: 100 },
            density: 'compact',
            sorting: [
                { id: 'concepto', desc: false },
            ],
            columnVisibility: {
                'codigo': false,
            },
        },
    });

    return (
        <>
            <Breadcrumb pageName="Egresos por Concepto" />
            <MaterialReactTable
                table={table}
            />
        </>
    );
};

export default EgresosPorConcepto;