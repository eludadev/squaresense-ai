'use client';

import { type ChartData, Chart as ChartJS, registerables } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import ChartWrapper, { ChartSize } from './chart-wrapper';
import { useEffect, useState } from 'react';
import { groupBy } from 'lodash';
import { randomColor } from '@/lib/utils';
import Color from 'colorjs.io';
import TriggerPrompt from './trigger-prompt';
import useOrders from '@/hooks/useOrders';

ChartJS.register(...registerables);

export default function OrdersSourceChart() {
  const [data, setData] = useState<ChartData<'pie', number[], string>>();
  const { data: orderData, isLoading } = useOrders();

  useEffect(() => {
    if (orderData?.orders !== undefined) {
      const ordersGroupedBySource = groupBy(
        orderData.orders,
        (item) => item.source ?? 'Uncategorized',
      );

      const colors = Object.keys(ordersGroupedBySource).map(() => {
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
        labels: Object.keys(ordersGroupedBySource),
        datasets: [
          {
            label: '# of Orders',
            data: Object.values(ordersGroupedBySource).map(
              (orders) => orders.length,
            ),
            backgroundColor: colors.map((color) => color.bg),
            borderColor: colors.map((color) => color.border),
            borderWidth: 1,
          },
        ],
      };

      setData(newData);
    }
  }, [orderData]);

  return (
    <ChartWrapper
      prompt="Analyse my store's order source distribution. Help me where your customers make their purchases and optimize marketing strategies. Keep it brief."
      isLoading={isLoading}
      size={ChartSize.MEDIUM}
      title="Order Source Distribution"
      description="Analyze sales channels. Discover where your customers make their purchases and optimize marketing strategies."
    >
      {data !== undefined && (
        <Pie data={data} options={{ devicePixelRatio: 4 }} />
      )}
      <TriggerPrompt
        className="mt-4 "
        label="Are there any emerging sales channels that we should pay more attention to?"
        prompt="Are there any emerging sales channels that we should pay more attention to?"
      />
    </ChartWrapper>
  );
}
