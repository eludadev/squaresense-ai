'use client';

import type { ChartData, ChartArea } from 'chart.js';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';
import { useEffect, useRef, useState } from 'react';
import ChartWrapper from './chart-wrapper';
import useOrders from '@/hooks/useOrders';
import useCatalog from '@/hooks/useCatalog';

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

export default function CatalogChart() {
  const chartRef = useRef<ChartJS>(null);
  const [chartData, setChartData] = useState<ChartData<'bar'>>({
    datasets: [],
  });

  const { data, isLoading } = useOrders();
  const { data: catalogData, isLoading: isCatalogLoading } = useCatalog();

  useEffect(() => {
    const chart = chartRef.current;

    if (
      !chart ||
      data?.orders === undefined ||
      catalogData?.items === undefined
    ) {
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
      popularityData: { product: string | undefined; popularity: number }[];
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

      // Initialize an empty map to track product popularity for the current time period
      const popularityMap = new Map<string, number>();

      // Calculate popularity for each product in the current time period
      ordersInPeriod.forEach((order) => {
        const productId = order.itemId;
        const quantitySold = parseInt(order.itemQuantity ?? '0');

        if (productId === undefined) return;

        if (!popularityMap.has(productId)) {
          popularityMap.set(productId, 0);
        }

        popularityMap.set(
          productId,
          (popularityMap.get(productId) as number) + quantitySold,
        );
      });

      // Sort products by popularity in descending order for the current time period
      const sortedProducts = Array.from(popularityMap.entries()).sort(
        (a, b) => b[1] - a[1],
      );

      // Select the top three products by popularity for the current time period
      const topThreeProducts = sortedProducts.slice(0, 3);

      // Create the product popularity data for the current time period
      const productPopularityData = topThreeProducts.map(
        ([productId, popularity]) => ({
          product:
            catalogData.items.find((product) =>
              product.variations.map((x) => x.id).includes(productId),
            )?.title ?? '-',
          popularity,
        }),
      );

      // Store the popularity data for the current time period
      timePeriods.push({
        timePeriod: `${year}-${String(month).padStart(2, '0')}`,
        popularityData: productPopularityData,
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

      timePeriods.push({ timePeriod: timePeriodLabel, popularityData: [] });
    }

    const labels = timePeriods.map((period) => period.timePeriod);
    const popularityPerProduct: {
      product: string | undefined;
      popularityData: { timePeriod: string; popularity: number }[];
    }[] = [];

    timePeriods.forEach((period) => {
      period.popularityData.forEach((entry) => {
        const existingProductEntry = popularityPerProduct.find(
          (item) => item.product === entry.product,
        );

        if (existingProductEntry) {
          existingProductEntry.popularityData.push({
            timePeriod: period.timePeriod,
            popularity: entry.popularity,
          });
        } else {
          popularityPerProduct.push({
            product: entry.product,
            popularityData: [
              {
                timePeriod: period.timePeriod,
                popularity: entry.popularity,
              },
            ],
          });
        }
      });
    });

    setChartData({
      labels,
      datasets: popularityPerProduct.map((item) => ({
        label: item.product,
        borderColor: createGradient(chart.ctx, chart.chartArea),
        data: item.popularityData.map((x) => x.popularity),
      })),
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, catalogData]);

  return (
    <ChartWrapper
      prompt="Analyse my store's product popularity over time. Keep it brief."
      isLoading={isLoading || isCatalogLoading}
      title="Product Popularity Over Time"
      description="Visualize product popularity trends over time using line charts to identify seasonal variations."
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
