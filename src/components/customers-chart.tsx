'use client';

import {
  Chart as ChartJS,
  registerables,
  type ChartData,
  type ChartArea,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';
import { useEffect, useRef, useState } from 'react';
import ChartWrapper from './chart-wrapper';
import useOrders from '@/hooks/useOrders';
import useCustomers from '@/hooks/useCustomers';
import { Customer } from '@/lib/types';

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

export default function CustomersChart() {
  const chartRef = useRef<ChartJS>(null);
  const [chartData, setChartData] = useState<ChartData<'line'>>({
    datasets: [],
  });

  const { data: ordersData, isLoading: isOrdersLoading } = useOrders();
  const { data: customersData, isLoading: isCustomersLoading } = useCustomers();

  useEffect(() => {
    const chart = chartRef.current;

    if (
      !chart ||
      ordersData?.orders === undefined ||
      customersData?.customers === undefined
    ) {
      return;
    }

    // Calculate Customer Lifetime Value for each customer
    const customerLifetimeValues: {
      customer: Customer;
      clv: number;
    }[] = [];

    customersData.customers.forEach((customer) => {
      const customerId = customer.id;
      const customerOrders = ordersData.orders.filter(
        (order) => order.customerId === customerId,
      );

      const customerRevenue = customerOrders.reduce(
        (acc, order) => acc + (order.money?.amount || 0),
        0,
      );

      // Calculate CLV (e.g., average revenue per customer)
      const clv = customerRevenue / customerOrders.length;

      customerLifetimeValues.push({ customer, clv });
    });

    // Sort customers by CLV in descending order
    customerLifetimeValues.sort((a, b) => b.clv - a.clv);

    // Extract top customers (e.g., top 10) for the chart
    const topCustomers = customerLifetimeValues.slice(0, 10);

    const labels = topCustomers.map((customer) => customer.customer.givenName);
    const clvData = topCustomers.map((customer) => customer.clv);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Customer Lifetime Value',
          borderColor: createGradient(chart.ctx, chart.chartArea),
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 4,
          data: clvData,
        },
      ],
    });
  }, [ordersData, customersData]);

  return (
    <ChartWrapper
      prompt="Analyse my customers' lifetime value (CLV) based on their average revenue per order. Keep it brief."
      isLoading={isOrdersLoading || isCustomersLoading}
      title="Customer Lifetime Value"
      description="Visualize the Customer Lifetime Value (CLV) of top customers based on their average revenue per order."
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
