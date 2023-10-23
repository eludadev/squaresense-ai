export interface Catalog {
  id: string;
  title: string;
  color: string;
  price?: string;
  money?: {
    amount: number;
    currency: string;
  };
  description: string;
  variations: {
    id: string;
  }[];
  category?: string;
}

export interface CatalogData {
  items: Catalog[];
}

export interface Customer {
  id: string;
  givenName?: string;
  familyName?: string;
  birthday?: string;
  createdAt: string;
  email: string;
  address?: string;
  locality?: string;
  postalCode?: string;
  country?: string;
}

export interface CustomersData {
  customers: Customer[];
}

export interface Order {
  id: string;
  money?: {
    amount: number;
    currency: string;
  };
  source?: string;
  price?: string;
  itemId?: string;
  createdAt?: string;
  updatedAt?: string;
  itemName?: string;
  customerId?: string;
  itemQuantity?: string;
}

export interface OrdersData {
  orders: Order[];
}

export interface Merchant {
  id: string;
  name?: string;
  country: string;
  currency?: string;
}
