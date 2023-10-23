'use client';

import ChartWrapper from './chart-wrapper';
import useContext from '@/hooks/useContext';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Bar, Chart, Pie } from 'react-chartjs-2';
import TriggerPrompt from './trigger-prompt';
import { type GeneratedChart } from '@/context/charts';
import { useEffect, useRef } from 'react';

ChartJS.register(...registerables);

export default function GeneratedChart({
  chart,
  setChart,
  onDelete,
}: {
  chart: GeneratedChart;
  setChart: (chart: GeneratedChart) => void;
  onDelete: () => void;
}) {
  const { context } = useContext();
  const isLoading = chart.chart === undefined;

  const isGeneratingRef = useRef(false);

  async function refresh() {
    setChart({
      ...chart,
      chart: undefined,
    });

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/charts`, {
      method: 'POST',
      body: JSON.stringify({
        context,
        prompt: chart.prompt,
        type: chart.type,
      }),
    });

    try {
      const { content } = await res.json();
      const {
        title,
        description,
        speakPrompt,
        data: { datasets, labels },
      } = JSON.parse(content);

      setChart({
        ...chart,
        chart: {
          title,
          description,
          speakPrompt,
          labels,
          datasets,
        },
      });
    } catch {
      refresh();
    }
  }

  useEffect(() => {
    if (!chart.chart && !isGeneratingRef.current) {
      isGeneratingRef.current = true;
      refresh();
    }
  });

  function DrawnChart(): JSX.Element {
    switch (chart.type) {
      case 'bar':
        return (
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
              datasets: chart.chart?.datasets,
              labels: chart.chart?.labels,
            }}
          />
        );
      case 'line':
        return (
          <Chart
            type="line"
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
              datasets: chart.chart?.datasets,
              labels: chart.chart?.labels,
            }}
          />
        );
      case 'pie':
        return (
          <Pie
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
              datasets: chart.chart?.datasets,
              labels: chart.chart?.labels,
            }}
          />
        );
    }
  }

  return (
    <ChartWrapper
      isGenerated
      title={chart.chart?.title ?? ''}
      prompt={chart.chart?.speakPrompt ?? ''}
      isLoading={isLoading}
      description={chart.chart?.description ?? ''}
      onDelete={onDelete}
      onReload={refresh}
    >
      {!isLoading && (
        <div className="space-y-4">
          <DrawnChart />
          <TriggerPrompt
            label={chart.chart?.speakPrompt ?? ''}
            prompt={chart.chart?.speakPrompt ?? ''}
          />
        </div>
      )}
    </ChartWrapper>
  );
}
