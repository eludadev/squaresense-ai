'use client';

import useCatalog from '@/hooks/useCatalog';
import SpinnerIcon from '@/vectors/spinner';
import DataActions from '@/components/data-actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CatalogChart from '@/components/catalog-chart';
import AIGenerate from '@/components/ai-chat';
import { DataTable } from './data-table';
import { generateColumns } from './columns';
import { LightbulbIcon, LineChartIcon, StarsIcon } from 'lucide-react';
import { generateColumns as generatePopularColumns } from './popular/columns';
import { type RowSelectionState, type ColumnDef } from '@tanstack/react-table';
import { Catalog } from '@/lib/types';
import { useContext, useEffect, useState } from 'react';
import useOrders from '@/hooks/useOrders';
import useCustomers from '@/hooks/useCustomers';
import PopularItem from '@/components/popular-item';
import CategoryChart from '@/components/category-chart';
import PriceDistributionHistogram from '@/components/price-distribution';
import NewChart from '@/components/new-chart';
import ChartsGrid from '@/components/charts-grid';
import ChartsContext from '@/context/charts';
import { v4 as uuidv4 } from 'uuid';
import GridContext from '@/context/grid';
import GeneratedChart from '@/components/generated-chart';

export default function CatalogPage() {
  const { data, isLoading } = useCatalog();
  const { data: orderData } = useOrders();
  const { data: customersData } = useCustomers();

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [popularRowSelection, setPopularRowSelection] =
    useState<RowSelectionState>({});

  const [popularColumns, setPopularColumns] = useState<ColumnDef<Catalog>[]>(
    generatePopularColumns(orderData?.orders, customersData?.customers),
  );

  const [tabValue, onTabValueChange] = useState('data');

  const [columns, setColumns] = useState<ColumnDef<Catalog>[]>(
    generateColumns(),
  );
  useEffect(() => {
    if (data?.items !== undefined) {
      setColumns(generateColumns(data?.items));
    }
  }, [data]);

  useEffect(() => {
    if (
      orderData?.orders !== undefined &&
      customersData?.customers !== undefined
    ) {
      setPopularColumns(
        generatePopularColumns(orderData.orders, customersData.customers),
      );
    }
  }, [orderData, customersData]);

  const { generatedCatalog: generated, setGeneratedCatalog: setGenerated } =
    useContext(ChartsContext);
  const { layoutCatalog: layout, setLayoutCatalog: setLayout } =
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
    <Tabs value={tabValue} onValueChange={onTabValueChange}>
      <div className="flex justify-between items-end py-2">
        <TabsList>
          <TabsTrigger value="data">
            <LineChartIcon className="w-4 h-4 mr-2" /> Data
          </TabsTrigger>
          <TabsTrigger value="popular">
            <StarsIcon className="w-4 h-4 mr-2" /> Popular
          </TabsTrigger>
          <TabsTrigger value="charts">
            <LightbulbIcon className="w-4 h-4 mr-2" />
            Charts & Insights
          </TabsTrigger>
        </TabsList>
        <DataActions
          allowDelete
          path="/api/catalog"
          isLoading={isLoading}
          urls={['/api/catalog', '/api/orders', '/api/customers']}
          selectedIds={
            tabValue === 'data'
              ? Object.keys(rowSelection)
              : tabValue === 'popular'
              ? Object.keys(popularRowSelection)
              : undefined
          }
        />
      </div>
      <TabsContent value="data">
        {isLoading || data === undefined ? (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            {isLoading && (
              <SpinnerIcon className="w-4 h-4 mx-auto my-4 animate-spin" />
            )}
            <span>A list of products.</span>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data.items}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
          />
        )}
      </TabsContent>
      <TabsContent value="popular">
        {isLoading || data === undefined ? (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            {isLoading && (
              <SpinnerIcon className="w-4 h-4 mx-auto my-4 animate-spin" />
            )}
            <span>A list of customers.</span>
          </div>
        ) : (
          <DataTable
            columns={popularColumns}
            data={data.items}
            rowSelection={popularRowSelection}
            setRowSelection={setPopularRowSelection}
          />
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
            <div key="popular-item">
              <PopularItem />
            </div>
            <div key="category-chart">
              <CategoryChart />
            </div>
            <div key="price-distribution">
              <PriceDistributionHistogram />
            </div>
            <div key="catalog-chart">
              <CatalogChart />
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
