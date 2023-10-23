import { Dispatch, SetStateAction, createContext } from 'react';
import { Layout } from 'react-grid-layout';

interface GridContextType {
  layoutOrders: Layout[];
  layoutCatalog: Layout[];
  layoutCustomers: Layout[];

  setLayoutOrders: Dispatch<SetStateAction<Layout[]>>;
  setLayoutCatalog: Dispatch<SetStateAction<Layout[]>>;
  setLayoutCustomers: Dispatch<SetStateAction<Layout[]>>;
}

const GridContext = createContext<GridContextType>({
  layoutOrders: [],
  setLayoutOrders: () => {},

  layoutCatalog: [],
  setLayoutCatalog: () => {},

  layoutCustomers: [],
  setLayoutCustomers: () => {},
});
export default GridContext;
