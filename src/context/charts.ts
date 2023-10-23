import { Dispatch, SetStateAction, createContext } from 'react';

export interface GeneratedChart {
  id: string;
  type: 'bar' | 'line' | 'pie';
  prompt: string;
  datasets: ('orders' | 'customers' | 'catalog')[];

  chart?: {
    title: string;
    description: string;
    speakPrompt: string;
    datasets: any;
    labels: any;
  };
}

interface GeneratedChartType {
  generatedOrders: GeneratedChart[];
  generatedCatalog: GeneratedChart[];
  generatedCustomers: GeneratedChart[];

  setGeneratedOrders: Dispatch<SetStateAction<GeneratedChart[]>>;
  setGeneratedCatalog: Dispatch<SetStateAction<GeneratedChart[]>>;
  setGeneratedCustomers: Dispatch<SetStateAction<GeneratedChart[]>>;
}

const ChartsContext = createContext<GeneratedChartType>({
  generatedOrders: [],
  setGeneratedOrders: () => {},

  generatedCatalog: [],
  setGeneratedCatalog: () => {},

  generatedCustomers: [],
  setGeneratedCustomers: () => {},
});
export default ChartsContext;
