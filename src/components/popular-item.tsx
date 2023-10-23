'use client';

import useCatalog from '@/hooks/useCatalog';
import ChartWrapper, { ChartSize } from './chart-wrapper';
import TriggerPrompt from './trigger-prompt';
import useOrders from '@/hooks/useOrders';
import useCustomers from '@/hooks/useCustomers';
import { useEffect, useState } from 'react';
import { isNumeric } from '@/lib/utils';
import { type Catalog } from '@/lib/types';
import { PackageOpenIcon } from 'lucide-react';

export default function PopularItem() {
  const { data, isLoading } = useCatalog();
  const { data: orderData, isLoading: isOrdersLoading } = useOrders();
  const { data: customersData, isLoading: isCustomersLoading } = useCustomers();

  const [popularProduct, setPopularProduct] = useState<Catalog>();

  useEffect(() => {
    const productsWithVolume: {
      product: Catalog;
      volume: number;
    }[] = [];

    if (
      data?.items !== undefined &&
      orderData?.orders !== undefined &&
      customersData?.customers !== undefined
    ) {
      for (const row of data.items) {
        const quantities = orderData.orders
          .filter((order) => {
            return (
              order.itemId !== undefined &&
              row.variations
                .map((variation) => variation.id)
                .includes(order.itemId)
            );
          })
          .map((order) =>
            order.itemQuantity !== undefined && isNumeric(order.itemQuantity)
              ? parseInt(order.itemQuantity)
              : 0,
          );

        const totalQuantity = quantities.reduce((a, b) => a + b, 0);
        productsWithVolume.push({
          product: row,
          volume: totalQuantity,
        });
      }

      const sortedProducts = productsWithVolume.sort((a, b) =>
        a.volume < b.volume ? -1 : a.volume > b.volume ? 1 : 0,
      );

      if (sortedProducts.length > 0) {
        const mostPopularProduct = sortedProducts[sortedProducts.length - 1];
        setPopularProduct(mostPopularProduct.product);
      }
    }
  }, [data, orderData, customersData]);

  return (
    <ChartWrapper
      prompt={`The most popular item is ${popularProduct?.title}. Analyse my most popular item. Give me the results. Keep it brief.`}
      isLoading={
        isLoading ||
        isCustomersLoading ||
        isOrdersLoading ||
        popularProduct === undefined
      }
      size={ChartSize.MEDIUM}
      title="Your Most Popular Item"
      description="Discover your best-selling product. Identify the top-performing item in your inventory, helping you focus on what customers love most."
    >
      {popularProduct !== undefined && (
        <>
          <div className="flex flex-col items-center mt-4 mb-6">
            <div
              className="w-48 h-48 rounded-xl bg-muted grid place-items-center"
              style={{ backgroundColor: popularProduct.color }}
            >
              <PackageOpenIcon className="w-12 h-12" />
            </div>
            <p className="font-bold text-sm my-1">{popularProduct.title}</p>
            <p className="font-normal text-xs text-muted-foreground">
              {popularProduct.description}
            </p>
          </div>
          <TriggerPrompt
            label="Why is this so popular?"
            prompt={`Explain why ${popularProduct.title} is popular`}
          />
        </>
      )}
    </ChartWrapper>
  );
}
