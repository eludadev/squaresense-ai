'use client';

import { cn } from '@/lib/utils';
import styles from '@/styles/new-chart-button.module.scss';
import { SparklesIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function NewChartButton({ onClick }: { onClick?: () => void }) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (buttonRef.current === null) return;

    const createSVG = (width: number, height: number, radius: number) => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

      const rectangle = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'rect',
      );

      svg.setAttributeNS(
        'http://www.w3.org/2000/svg',
        'viewBox',
        `0 0 ${width} ${height}`,
      );

      rectangle.setAttribute('x', '0');
      rectangle.setAttribute('y', '0');
      rectangle.setAttribute('width', '100%');
      rectangle.setAttribute('height', '100%');
      rectangle.setAttribute('rx', `${radius}`);
      rectangle.setAttribute('ry', `${radius}`);
      rectangle.setAttribute('pathLength', '10');

      svg.appendChild(rectangle);

      return svg;
    };

    const button = buttonRef.current;

    const style = getComputedStyle(button);

    const lines = document.createElement('div');

    lines.classList.add(styles.lines);

    const groupTop = document.createElement('div');
    const groupBottom = document.createElement('div');

    const svg = createSVG(
      button.offsetWidth,
      button.offsetHeight,
      parseInt(style.borderRadius, 10),
    );

    groupTop.appendChild(svg);
    groupTop.appendChild(svg.cloneNode(true));
    groupTop.appendChild(svg.cloneNode(true));
    groupTop.appendChild(svg.cloneNode(true));

    groupBottom.appendChild(svg.cloneNode(true));
    groupBottom.appendChild(svg.cloneNode(true));
    groupBottom.appendChild(svg.cloneNode(true));
    groupBottom.appendChild(svg.cloneNode(true));

    lines.appendChild(groupTop);
    lines.appendChild(groupBottom);

    button.appendChild(lines);

    const handlePointerEnter = () => {
      button.classList.add(styles.start);
    };

    const handleAnimationEnd = () => {
      button.classList.remove(styles.start);
    };

    button.addEventListener('pointerenter', handlePointerEnter);
    svg.addEventListener('animationend', handleAnimationEnd);

    return () => {
      button.removeEventListener('pointerenter', handlePointerEnter);
      svg.removeEventListener('animationend', handleAnimationEnd);
    };
  }, [buttonRef]);

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={cn(styles.sketchButton, 'font-semibold flex items-center')}
    >
      <SparklesIcon className="w-4 h-4 mr-2 !animate-none" />
      <span className="h-[1.40rem]">New Chart</span>
    </button>
  );
}
