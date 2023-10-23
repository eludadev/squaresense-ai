import { Customer, type Catalog, type Order } from './types';
import { faker } from '@faker-js/faker';
import { hslToHex, randomColor } from './utils';
import { locationDatabase } from './database';

// Function to generate random Catalog data
export function generateRandomProductData(length: number): Catalog[] {
  const products: Catalog[] = [];

  for (let i = 0; i < length; i++) {
    const product: Catalog = {
      id: `#${faker.string.uuid()}`,
      title: faker.commerce.productName(),
      color: hslToHex(randomColor()),
      price: faker.commerce.price(),
      money: {
        amount: faker.number.int({ min: 1, max: 1000 }),
        currency: 'USD',
      },
      description: faker.lorem.sentence(),
      variations: Array.from(
        { length: faker.number.int({ min: 1, max: 5 }) },
        () => ({
          id: `#${faker.string.uuid()}`,
        }),
      ),
      category: faker.commerce.department(),
    };

    products.push(product);
  }

  return products;
}

// Function to generate random Order data with matching variation IDs
export function generateRandomOrderItemData(
  productData: Catalog[],
  customers: Customer[],
  length: number,
): Order[] {
  const orderItems: Order[] = [];
  const orderSources = ['Brick-and-Mortar', 'Online', undefined];

  if (productData.length === 0 || customers.length === 0) return [];

  for (let i = 0; i < length; i++) {
    const randomProduct = faker.helpers.arrayElement(productData);
    const variationId = faker.helpers.arrayElement(randomProduct.variations).id;
    const randomCustomer = faker.helpers.arrayElement(customers);

    const orderItem: Order = {
      id: faker.string.uuid(),
      price: randomProduct.price,
      money: randomProduct.money,
      itemId: variationId,
      source: faker.helpers.arrayElement(orderSources),
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      itemName: randomProduct.title,
      customerId: randomCustomer.id, // Link order item to a random customer
      itemQuantity: String(faker.number.int({ min: 1, max: 10 })),
    };

    orderItems.push(orderItem);
  }

  return orderItems;
}

// Function to generate random Customer data
export function generateRandomCustomerData(length: number): Customer[] {
  const customers: Customer[] = [];

  for (let i = 0; i < length; i++) {
    const randomLocality = faker.helpers.arrayElement(
      Object.keys(locationDatabase),
    );

    const birthday = faker.date
      .between({
        from: '1950-01-01',
        to: '2005-12-31',
      })
      .toISOString()
      .split('T')[0];

    const customer: Customer = {
      id: faker.string.uuid(),
      givenName: faker.person.firstName(),
      familyName: faker.person.lastName(),
      birthday, // Format: YYYY-MM-DD
      createdAt: faker.date.recent().toISOString(),
      email: faker.internet.email(),
      address: faker.location.streetAddress(),
      locality: randomLocality,
      postalCode: faker.location.zipCode(),
      country: faker.location.countryCode(),
    };

    customers.push(customer);
  }

  return customers;
}
