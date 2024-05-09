import React, { useContext, useState, useEffect, useMemo } from 'react';
import { dataContext } from '../../hooks/DataContext';
import Breadcrumb from '../../components/Breadcrumb';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import currency from "currency.js";
import dayjs from 'dayjs';

const Facturacion = () => {
    const { mesActual, anioActual, facturasClientes, setFacturasClientes } = useContext(dataContext);

const data = useMemo(() => {
    const facturacionPorMes = {};
    facturasClientes.forEach(factura => {
        const mesAnio = dayjs(factura.Fecha).format('MM/YY');
        const cliente = factura.ClienteNombre;
        const zona = factura.ClienteZonaCodigo;
        if (!facturacionPorMes[cliente]) {
            facturacionPorMes[cliente] = { ClienteZonaCodigo: zona };
        }
        if (!facturacionPorMes[cliente][mesAnio]) {
            facturacionPorMes[cliente][mesAnio] = 0
        }
        let totalFactura = parseFloat(factura.TotalSigno);
        if (factura.ComprobanteCodigo === 701 || factura.ComprobanteCodigo === 703 || factura.ComprobanteCodigo === 702 || factura.ComprobanteCodigo === 704) {
            facturacionPorMes[cliente][mesAnio] += totalFactura;
        }
    });

    for (let cliente in facturacionPorMes) {
        for (let mesAnio in facturacionPorMes[cliente]) {
            if (mesAnio !== 'ClienteZonaCodigo') {
                facturacionPorMes[cliente][mesAnio] = `${currency(facturacionPorMes[cliente][mesAnio], { symbol: '$ ', precision: 2, separator: ".", decimal: "," }).format()}`;
            }
        }
    }

    return Object.entries(facturacionPorMes).map(([cliente, facturacion]) => ({ nombre: cliente,  ...facturacion }));
}, [facturasClientes]);

    const columns = useMemo(() => {
        const cols = [
            { accessorKey: 'ClienteZonaCodigo', header: 'Zona', sortDescFirst: true, size: 50 },
            { accessorKey: 'nombre', header: 'Cliente', sortDescFirst: true, size: 200 },
        ];
        for (let i = 0; i < 7; i++) {
            let mes = mesActual - i;
            let anio = anioActual;
            if (mes < 1) {
                mes += 12;
                anio -= 1;
            }
            const mesAni = `${mes.toString().padStart(2, '0')}/${anio.toString().slice(-2)}`;
            cols.push({ accessorKey: mesAni, header: `${mesAni}`, size: 140, disableFilters: true });
        }
        return cols;
    }, [mesActual, anioActual]);

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
                { id: 'nombre', desc: false },
            ],
            columnVisibility: {
                'codigo': false,
            },
        },
    });

    return (
        <>
            <Breadcrumb pageName="Facturación" />
            <MaterialReactTable
                table={table}
            />
        </>
    );

};

export default Facturacion;