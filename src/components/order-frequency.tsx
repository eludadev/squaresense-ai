'use client';

import { Chart as ChartJS, registerables } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import useCustomers from '@/hooks/useCustomers';
import ChartWrapper, { ChartSize } from './chart-wrapper';

ChartJS.register(...registerables);

function calculateAge(birthday: string): number {
  const today = new Date();
  const birthDate = new Date(birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

interface Bucket {
  label: string;
  data: number[];
  backgroundColor: string;
}

export default function OrderFrequency() {
  const { data: customerData } = useCustomers();
  const data = customerData?.customers;

  const [ageGroups, setAgeGroups] = useState<Bucket>();
  const labels = ['<18', '18-24', '25-34', '35-44', '45-54', '55+'];

  useEffect(() => {
    if (data !== undefined) {
      const ageCounts: Record<string, number> = {};

      labels.forEach((label) => {
        ageCounts[label] = 0;
      });

      data.forEach((customer) => {
        if (customer.birthday !== undefined) {
          const age = calculateAge(customer.birthday);

          // Determine the label for this customer's age
          let label = '55+';

          if (age < 18) {
            label = '<18';
          } else if (age >= 18 && age <= 24) {
            label = '18-24';
          } else if (age >= 25 && age <= 34) {
            label = '25-34';
          } else if (age >= 35 && age <= 44) {
            label = '35-44';
          } else if (age >= 45 && age <= 54) {
            label = '45-54';
          }

          // Increment the count for the corresponding label
          ageCounts[label]++;
        }
      });

      setAgeGroups({
        label: 'Customers',
        data: Object.values(ageCounts),
        backgroundColor: '#60a5fa',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const isLoading = data === undefined || ageGroups === undefined;

  return (
    <ChartWrapper
      prompt="Analyse my store's order frequency. Help me identify how different age groups engage with my products. Keep it brief."
      isLoading={isLoading}
      size={ChartSize.SMALL}
      title="Order Frequency Histogram"
      description="Analyze purchasing habits by age. Identify how different age groups engage with your products."
    >
      {!isLoading && (
        <Bar
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: false,
              },
            },
            devicePixelRatio: 4,
          }}
          data={{
            datasets: [ageGroups],
            labels: labels,
          }}
        />
      )}
    </ChartWrapper>
  );
}
