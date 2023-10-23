'use client';

import { type ChartData, Chart as ChartJS, registerables } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartWrapper, { ChartSize } from './chart-wrapper';
import useCatalog from '@/hooks/useCatalog';
import { useEffect, useState } from 'react';
import { createBins } from '@/lib/utils';

ChartJS.register(...registerables);

export default function PriceDistributionHistogram() {
  const [data, setData] =
    useState<ChartData<'bar', (number | [number, number] | null)[], unknown>>();
  const { data: catalogData, isLoading } = useCatalog();

  useEffect(() => {
    if (catalogData !== undefined && catalogData.items !== undefined) {
      const prices = catalogData.items
        .map((x) => x.money?.amount)
        .filter((x) => x !== undefined) as number[];
      const bins = createBins(prices, 5);

      const newData: ChartData<
        'bar',
        (number | [number, number] | null)[],
        unknown
      > = {
        labels: bins.map(
          (bin) => `$ ${bin.range[0].toFixed(2)} - ${bin.range[1].toFixed(2)}`,
        ),
        datasets: [
          {
            label: 'Products',
            backgroundColor: '#38bdf8',
            data: bins.map((bin) => bin.count),
          },
        ],
      };

      setData(newData);
    }
  }, [catalogData]);

  return (
    <ChartWrapper
      prompt="Analyse my store's price distribution. That is the number of products that fall into price bins. Keep it brief."
      isLoading={isLoading}
      size={ChartSize.NORMAL}
      title="Price Distribution Histogram"
      description="Closely examine the price distribution of your products. This chart offers a visual breakdown of product prices, helping you identify pricing trends, popular price ranges, and potential pricing strategies."
    >
      {data !== undefined && (
        <Bar
          options={{
            responsive: true,
            devicePixelRatio: 4,
          }}
          data={data}
        />
      )}
    </ChartWrapper>
  );
}
