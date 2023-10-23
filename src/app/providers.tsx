'use client';

import { useState, type ReactNode, useEffect } from 'react';
import AuthContext, { AuthState } from '@/context/auth';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import ChartsContext, { GeneratedChart } from '@/context/charts';
import GridContext from '@/context/grid';
import { Layout } from 'react-grid-layout';

function getInitialState(key: string, defaultValue: any): any {
  if (typeof window === 'undefined') return defaultValue;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

export function Providers({ children }: { children: ReactNode }) {
  const [isAuthenticating, toggleAuthenticating] = useState<AuthState>(
    AuthState.LOGGEDOUT,
  );

  const [genChartsOrders, setGenChartsOrders] = useState<GeneratedChart[]>(
    getInitialState('gen-charts-orders', []),
  );

  useEffect(() => {
    if (typeof window !== 'undefined')
      localStorage.setItem(
        'gen-charts-orders',
        JSON.stringify(genChartsOrders),
      );
  }, [genChartsOrders]);

  const [layoutOrders, setLayoutOrders] = useState<Layout[]>(
    getInitialState('layout-orders', [
      {
        i: 'order-frequency',
        x: 5,
        y: 0,
        w: 6,
        h: 10,
        static: false,
        minH: 10,
      },
      {
        i: 'order-sources',
        x: 0,
        y: 0,
        w: 5,
        h: 20,
      },
      {
        i: 'orders-chart',
        x: 5,
        y: 0,
        w: 6,
        h: 10,
      },
    ]),
  );

  useEffect(() => {
    if (typeof window !== 'undefined')
      localStorage.setItem('layout-orders', JSON.stringify(layoutOrders));
  }, [layoutOrders]);

  const [genChartsCatalog, setGenChartsCatalog] = useState<GeneratedChart[]>(
    getInitialState('gen-charts-catalog', []),
  );

  useEffect(() => {
    if (typeof window !== 'undefined')
      localStorage.setItem(
        'gen-charts-catalog',
        JSON.stringify(genChartsCatalog),
      );
  }, [genChartsCatalog]);

  const [layoutCatalog, setLayoutCatalog] = useState<Layout[]>(
    getInitialState('layout-catalog', [
      {
        i: 'popular-item',
        x: 0,
        y: 0,
        w: 4,
        h: 16,
      },
      {
        i: 'category-chart',
        x: 4,
        y: 0,
        w: 5,
        h: 16,
      },
      {
        i: 'price-distribution',
        x: 0,
        y: 16,
        w: 9,
        h: 14,
      },
      {
        i: 'catalog-chart',
        x: 0,
        y: 30,
        w: 9,
        h: 14,
      },
    ]),
  );

  useEffect(() => {
    if (typeof window !== 'undefined')
      localStorage.setItem('layout-catalog', JSON.stringify(layoutCatalog));
  }, [layoutCatalog]);

  const [genChartsCustomers, setGenChartsCustomers] = useState<
    GeneratedChart[]
  >(getInitialState('gen-charts-customers', []));

  useEffect(() => {
    if (typeof window !== 'undefined')
      localStorage.setItem(
        'gen-charts-customers',
        JSON.stringify(genChartsCustomers),
      );
  }, [genChartsCustomers]);

  const [layoutCustomers, setLayoutCustomers] = useState<Layout[]>(
    getInitialState('layout-customers', [
      {
        i: 'age-chart',
        x: 0,
        y: 0,
        w: 5,
        h: 10,
      },
      {
        i: 'globe-chart',
        x: 5,
        y: 0,
        w: 7,
        h: 21,
      },
      {
        i: 'customers-chart',
        x: 0,
        y: 10,
        w: 5,
        h: 11,
      },
    ]),
  );

  useEffect(() => {
    if (typeof window !== 'undefined')
      localStorage.setItem('layout-customers', JSON.stringify(layoutCustomers));
  }, [layoutCustomers]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticating,
        toggleAuthenticating,
      }}
    >
      <GridContext.Provider
        value={{
          layoutOrders,
          setLayoutOrders,
          layoutCatalog,
          setLayoutCatalog,
          layoutCustomers,
          setLayoutCustomers,
        }}
      >
        <ChartsContext.Provider
          value={{
            generatedOrders: genChartsOrders,
            generatedCatalog: genChartsCatalog,
            generatedCustomers: genChartsCustomers,
            setGeneratedOrders: setGenChartsOrders,
            setGeneratedCatalog: setGenChartsCatalog,
            setGeneratedCustomers: setGenChartsCustomers,
          }}
        >
          <TooltipProvider>{children}</TooltipProvider>
        </ChartsContext.Provider>
      </GridContext.Provider>
    </AuthContext.Provider>
  );
}
