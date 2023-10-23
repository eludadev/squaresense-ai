'use client';

import {
  type ChartArea,
  type ChartData,
  Chart as ChartJS,
  registerables,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';
import { useEffect, useRef, useState } from 'react';
import ChartWrapper from './chart-wrapper';
import useOrders from '@/hooks/useOrders';
import { isNumeric } from '@/lib/utils';

ChartJS.register(...registerables);

const colors = [
  'red',
  'orange',
  'yellow',
  'lime',
  'green',
  'teal',
  'blue',
  'purple',
];

function createGradient(ctx: CanvasRenderingContext2D, area: ChartArea) {
  const colorStart = faker.helpers.arrayElement(colors);
  const colorMid = faker.helpers.arrayElement(
    colors.filter((color) => color !== colorStart),
  );
  const colorEnd = faker.helpers.arrayElement(
    colors.filter((color) => color !== colorStart && color !== colorMid),
  );

  const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);

  gradient.addColorStop(0, colorStart);
  gradient.addColorStop(0.5, colorMid);
  gradient.addColorStop(1, colorEnd);

  return gradient;
}

export default function OrdersChart() {
  const chartRef = useRef<ChartJS>(null);
  const [chartData, setChartData] = useState<ChartData<'line'>>({
    datasets: [],
  });

  const { data, isLoading } = useOrders();

  useEffect(() => {
    const chart = chartRef.current;

    if (!chart || data?.orders === undefined) {
      return;
    }

    // Extract and convert dates to Date objects
    const orderDates = data.orders
      .filter((order) => order.createdAt !== undefined)
      .map((order) => new Date(order.createdAt as string).getTime());

    // Calculate the minimum and maximum dates
    const minDate = new Date(Math.min(...orderDates));
    const maxDate = new Date(Math.max(...orderDates));

    // Generate time periods within the range (e.g., monthly intervals)
    const timePeriods: {
      timePeriod: string;
      revenue: number;
    }[] = [];
    let currentDate = new Date(minDate);

    while (currentDate <= maxDate) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; // Add 1 to month (0-indexed)

      // Filter orders for the current time period based on year and month
      const ordersInPeriod = data.orders
        .filter((order) => order.createdAt !== undefined)
        .filter((order) => {
          const date = new Date(order.createdAt as string);

          const orderYear = date.getFullYear();
          const orderMonth = date.getMonth() + 1;
          return year === orderYear && month === orderMonth;
        });

      // Calculate revenue for the current time period
      const revenue = ordersInPeriod.reduce((acc, order) => {
        const amount = order.money?.amount || 0;
        const quantity = isNumeric(order.itemQuantity ?? '')
          ? parseInt(order.itemQuantity as string)
          : 1;
        return acc + amount * quantity;
      }, 0);

      // Format the time period label (e.g., '2023-01')
      const timePeriodLabel = `${year}-${String(month).padStart(2, '0')}`;

      // Store the revenue data for the current time period
      timePeriods.push({
        timePeriod: timePeriodLabel,
        revenue,
      });

      // Move to the next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Ensure a minimum of 9 time periods (if necessary)
    while (timePeriods.length < 9) {
      const lastTimePeriod = timePeriods[timePeriods.length - 1];
      const nextTimePeriod = new Date(lastTimePeriod?.timePeriod);
      nextTimePeriod.setMonth(nextTimePeriod.getMonth() + 1);

      const year = nextTimePeriod.getFullYear();
      const month = nextTimePeriod.getMonth() + 1;
      const timePeriodLabel = `${year}-${String(month).padStart(2, '0')}`;

      timePeriods.push({ timePeriod: timePeriodLabel, revenue: 0 });
    }

    const labels = timePeriods.map((period) => period.timePeriod);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Sales Volume',
          borderColor: createGradient(chart.ctx, chart.chartArea),
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 4,
          data: timePeriods.map((period) => period.revenue),
        },
      ],
    });
  }, [data]);

  return (
    <ChartWrapper
      prompt="Analyse my store's sales revenue trends over time. Keep it brief."
      isLoading={isLoading}
      title="Sales Revenue Over Time"
      description="Visualize sales revenue trends over time using a line chart."
    >
      <Chart
        ref={chartRef}
        type="line"
        data={chartData}
        options={{ devicePixelRatio: 4 }}
      />
    </ChartWrapper>
  );
}
