import useCatalog from './useCatalog';
import useCustomers from './useCustomers';
import useOrders from './useOrders';

export default function useContext() {
  const { data: ordersData } = useOrders();
  const { data: catalogData } = useCatalog();
  const { data: customersData } = useCustomers();

  return {
    context: {
      orders: ordersData?.orders ?? [],
      customers: customersData?.customers ?? [],
      catalog: catalogData?.items ?? [],
    },
  };
}
