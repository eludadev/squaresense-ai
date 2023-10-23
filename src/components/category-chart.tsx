'use client';

import { Chart as ChartJS, registerables, type ChartData } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import ChartWrapper, { ChartSize } from './chart-wrapper';
import useCatalog from '@/hooks/useCatalog';
import { useEffect, useState } from 'react';
import { groupBy } from 'lodash';
import { randomColor } from '@/lib/utils';
import Color from 'colorjs.io';

ChartJS.register(...registerables);

export default function CategoryChart() {
  const [data, setData] = useState<ChartData<'pie', number[], string>>();
  const { data: catalogData, isLoading } = useCatalog();

  useEffect(() => {
    if (catalogData?.items !== undefined) {
      const productsGroupedByCategory = groupBy(
        catalogData.items,
        (item) => item.category ?? 'Uncategorized',
      );

      const colors = Object.keys(productsGroupedByCategory).map(() => {
        const baseColorHsl = randomColor();

        const bgColor = new Color(baseColorHsl);
        bgColor.alpha = 0.5;

        const borderColor = new Color(baseColorHsl);
        borderColor.lch.l = 10;

        return {
          bg: bgColor.to('srgb').toString(),
          border: borderColor.to('srgb').toString(),
        };
      });

      const newData: ChartData<'pie', number[], string> = {
        labels: Object.keys(productsGroupedByCategory),
        datasets: [
          {
            label: '# of Products',
            data: Object.values(productsGroupedByCategory).map(
              (products) => products.length,
            ),
            backgroundColor: colors.map((color) => color.bg),
            borderColor: colors.map((color) => color.border),
            borderWidth: 1,
          },
        ],
      };

      setData(newData);
    }
  }, [catalogData]);

  return (
    <ChartWrapper
      prompt="Analyse my store's category distribution. Keep it brief."
      isLoading={isLoading}
      size={ChartSize.MEDIUM}
      title="Category Distribution"
      description="Shows the distribution of products across different categories, helping identify your most popular product categories."
    >
      {data !== undefined && (
        <Pie data={data} options={{ devicePixelRatio: 4 }} />
      )}
    </ChartWrapper>
  );
}
