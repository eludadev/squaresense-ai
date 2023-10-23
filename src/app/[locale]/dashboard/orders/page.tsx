'use client';

import SpinnerIcon from '@/vectors/spinner';
import DataActions from '@/components/data-actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from './data-table';
import { generateColumns } from './columns';
import useOrders from '@/hooks/useOrders';
import { useContext, useEffect, useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { type Order } from '@/lib/types';
import useCustomers from '@/hooks/useCustomers';
import { LightbulbIcon, LineChartIcon } from 'lucide-react';
import ChartsGrid from '@/components/charts-grid';
import NewChart from '@/components/new-chart';
import OrderFrequency from '@/components/order-frequency';
import OrdersSourceChart from '@/components/orders-source-chart';
import OrdersChart from '@/components/orders-chart';
import GeneratedChart from '@/components/generated-chart';
import ChartsContext from '@/context/charts';
import { v4 as uuidv4 } from 'uuid';
import GridContext from '@/context/grid';

export default function OrdersPage() {
  const { data: customerData } = useCustomers();
  const { data, isLoading } = useOrders();

  const [columns, setColumns] = useState<ColumnDef<Order>[]>(
    generateColumns(customerData?.customers),
  );

  useEffect(() => {
    setColumns(generateColumns(customerData?.customers));
  }, [customerData]);

  const { generatedOrders: generated, setGeneratedOrders: setGenerated } =
    useContext(ChartsContext);
  const { layoutOrders: layout, setLayoutOrders: setLayout } =
    useContext(GridContext);

  async function handleGenerateChart(
    description: string,
    type: 'bar' | 'line' | 'pie',
  ) {
    const id = uuidv4();

    setGenerated((generated) => [
      ...generated,
      {
        id,
        type,
        prompt: description,
        datasets: ['catalog', 'orders', 'customers'],
      },
    ]);

    setLayout((layout) => [
      ...layout,
      {
        i: id,
        x: 0,
        y: 20 + (layout.length - 1) * 10,
        w: 12,
        h: 10,
      },
    ]);
  }

  return (
    <Tabs defaultValue="data">
      <div className="flex justify-between items-end py-2">
        <TabsList>
          <TabsTrigger value="data">
            <LineChartIcon className="w-4 h-4 mr-2" /> Data
          </TabsTrigger>
          <TabsTrigger value="charts">
            <LightbulbIcon className="w-4 h-4 mr-2" />
            Charts & Insights
          </TabsTrigger>
        </TabsList>
        <DataActions
          isLoading={isLoading}
          urls={['/api/orders', '/api/customers']}
        />
      </div>
      <TabsContent value="data">
        {isLoading || data === undefined ? (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            {isLoading && (
              <SpinnerIcon className="w-4 h-4 mx-auto my-4 animate-spin" />
            )}
            <span>A list of orders.</span>
          </div>
        ) : (
          <DataTable columns={columns} data={data.orders} />
        )}
      </TabsContent>
      <TabsContent value="charts">
        <div className="px-12 py-10 space-y-4 mb-24">
          <div className="ml-2">
            <NewChart
              onCreate={(description, type) =>
                handleGenerateChart(description, type)
              }
            />
          </div>
          <ChartsGrid layout={layout} onLayoutChange={setLayout}>
            <div key="order-frequency">
              <OrderFrequency />
            </div>
            <div key="order-sources">
              <OrdersSourceChart />
            </div>
            <div key="orders-chart">
              <OrdersChart />
            </div>
            {...generated.map((chart) => (
              <div key={chart.id}>
                <GeneratedChart
                  chart={chart}
                  setChart={(chart) => {
                    setGenerated((generated) => {
                      const updatedItems = generated.map((item) => {
                        if (item.id === chart.id) {
                          // If the item's ID matches the ID of the new item, update it
                          return chart;
                        }
                        return item; // Return unchanged items
                      });
                      return updatedItems;
                    });
                  }}
                  onDelete={() => {
                    setGenerated((generated) => {
                      const updatedItems = generated.filter(
                        (item) => item.id !== chart.id,
                      );
                      return updatedItems;
                    });
                    setLayout((layout) => {
                      const updatedItems = layout.filter(
                        (item) => item.i !== chart.id,
                      );
                      return updatedItems;
                    });
                  }}
                />
              </div>
            ))}
          </ChartsGrid>
        </div>
      </TabsContent>
    </Tabs>
  );
}
