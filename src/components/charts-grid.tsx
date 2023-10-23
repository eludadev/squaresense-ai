'use client';

import GridLayout, { type Layout } from 'react-grid-layout';
import { type ReactNode } from 'react';

export default function ChartsGrid({
  children,
  layout,
  onLayoutChange,
}: {
  children?: ReactNode;
  layout?: Layout[];
  onLayoutChange?: (layout: Layout[]) => void;
}) {
  return (
    <GridLayout
      onDragStart={(l, o, n, p, e) => e.preventDefault()}
      onDrag={(l, o, n, p, e) => e.preventDefault()}
      onDragStop={(l, o, n, p, e) => e.preventDefault()}
      layout={layout}
      cols={12}
      rowHeight={30}
      width={1200}
      onLayoutChange={onLayoutChange}
    >
      {children}
    </GridLayout>
  );
}
