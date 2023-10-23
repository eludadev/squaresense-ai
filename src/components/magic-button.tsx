'use client';

import gsap from 'gsap';
import { type ReactNode, useEffect, useRef } from 'react';
import styles from '@/styles/magic-button.module.scss';
import { cn } from '@/lib/utils';

export default function MagicButton({
  onClick,
  children,
  dotsAmount,
}: {
  onClick?: () => void;
  children: ReactNode;
  dotsAmount: number;
}) {
  const buttonRef = useRef<HTMLButtonElement>();

  useEffect(() => {
    const createSVG = (
      width: number,
      height: number,
      className: string,
      childType: string,
      childAttributes: any,
    ) => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

      svg.classList.add(className);

      const child = document.createElementNS(
        'http://www.w3.org/2000/svg',
        childType,
      );

      svg.setAttributeNS(
        'http://www.w3.org/2000/svg',
        'viewBox',
        `0 0 ${width} ${height}`,
      );

      for (const attr in childAttributes) {
        child.setAttribute(attr, childAttributes[attr]);
      }

      svg.appendChild(child);

      return { svg, child };
    };

    if (buttonRef.current !== undefined) {
      const button = buttonRef.current;

      const width = button.offsetWidth;
      const height = button.offsetHeight;

      const style = getComputedStyle(button);

      const { svg, child: circle } = createSVG(
        width,
        height,
        styles['dots'],
        'circle',
        {
          cx: '0',
          cy: '0',
          r: '0',
        },
      );

      const strokeGroup = document.createElement('div');
      strokeGroup.classList.add(styles['stroke']);

      const { svg: stroke } = createSVG(width, height, 'stroke-line', 'rect', {
        x: '0',
        y: '0',
        width: '100%',
        height: '100%',
        rx: parseInt(style.borderRadius, 10),
        ry: parseInt(style.borderRadius, 10),
        pathLength: '10',
      });

      button.appendChild(svg);

      strokeGroup.appendChild(stroke);
      strokeGroup.appendChild(stroke.cloneNode(true));

      button.appendChild(strokeGroup);

      const timeline = gsap.timeline({ paused: true });

      for (var i = 0; i < dotsAmount; i++) {
        var p = circle.cloneNode(true);
        svg.appendChild(p);

        gsap.set(p, {
          attr: {
            cx: gsap.utils.random(width * 0.4, width * 0.55),
            cy: height * 0.5,
            r: 0,
          },
        });

        var durationRandom = gsap.utils.random(10, 12);

        var tl = gsap.timeline();

        tl.to(
          p,
          {
            duration: durationRandom,
            rotation: i % 2 === 0 ? 200 : -200,
            attr: {
              r: gsap.utils.random(0.75, 1.5),
              cy: (width / 2) * gsap.utils.random(1.25, 1.75),
            },
            physics2D: {
              angle: -90,
              gravity: gsap.utils.random(-4, -8),
              velocity: gsap.utils.random(10, 25),
            },
          },
          '-=' + durationRandom / 2,
        ).to(
          p,
          {
            duration: durationRandom / 3,
            attr: {
              r: 0,
            },
          },
          '-=' + durationRandom / 4,
        );

        timeline.add(tl, i / 3);
      }

      svg.removeChild(circle);

      const finalTimeline = gsap.to(timeline, {
        duration: 10,
        repeat: -1,
        time: timeline.duration(),
        paused: true,
      });

      const stars = gsap.to(button, {
        repeat: -1,
        repeatDelay: 0.75,
        paused: true,
        keyframes: [
          {
            '--generate-button-star-2-scale': '.5',
            '--generate-button-star-2-opacity': '.25',
            '--generate-button-star-3-scale': '1.25',
            '--generate-button-star-3-opacity': '1',
            duration: 0.3,
          },
          {
            '--generate-button-star-1-scale': '1.5',
            '--generate-button-star-1-opacity': '.5',
            '--generate-button-star-2-scale': '.5',
            '--generate-button-star-3-scale': '1',
            '--generate-button-star-3-opacity': '.5',
            duration: 0.3,
          },
          {
            '--generate-button-star-1-scale': '1',
            '--generate-button-star-1-opacity': '.25',
            '--generate-button-star-2-scale': '1.15',
            '--generate-button-star-2-opacity': '1',
            duration: 0.3,
          },
          {
            '--generate-button-star-2-scale': '1',
            duration: 0.35,
          },
        ],
      });

      button.addEventListener('pointerenter', () => {
        gsap.to(button, {
          '--generate-button-dots-opacity': '.5',
          duration: 0.25,
          onStart: () => {
            finalTimeline.restart().play();
            setTimeout(() => stars.restart().play(), 500);
          },
        });
      });

      gsap.to(button, {
        '--generate-button-dots-opacity': '0',
        duration: 0.25,
        onStart: () => {
          finalTimeline.restart().play();
          setTimeout(() => stars.restart().play(), 500);
        },
      });

      button.addEventListener('pointerleave', () => {
        gsap.to(button, {
          '--generate-button-dots-opacity': '0',
          '--generate-button-star-1-opacity': '.25',
          '--generate-button-star-1-scale': '1',
          '--generate-button-star-2-opacity': '1',
          '--generate-button-star-2-scale': '1',
          '--generate-button-star-3-opacity': '.5',
          '--generate-button-star-3-scale': '1',
          duration: 0.15,
          onComplete: () => {
            finalTimeline.pause();
            stars.pause();
          },
        });
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <button
      onClick={onClick}
      className={cn(styles['generate-button'], 'bg-primary-foreground')}
      ref={(ref) => {
        if (ref !== null) {
          buttonRef.current = ref;
        }
      }}
    >
      <svg className={styles['icon']} viewBox="0 0 24 26">
        <path d="M5.16515 2.62145L5.8075 0.999247C5.83876 0.919722 5.9154 0.866699 6.00112 0.866699C6.08683 0.866699 6.16347 0.919722 6.19473 0.999247L6.83708 2.62145L8.44145 3.27094C8.5201 3.30254 8.57254 3.38003 8.57254 3.4667C8.57254 3.55337 8.5201 3.63085 8.44145 3.66246L6.83708 4.31195L6.19473 5.93415C6.16347 6.0147 6.08683 6.0667 6.00112 6.0667C5.9154 6.0667 5.83876 6.0147 5.8075 5.93415L5.16515 4.31195L3.56078 3.66246C3.48112 3.63085 3.42969 3.55337 3.42969 3.4667C3.42969 3.38003 3.48112 3.30254 3.56078 3.27094L5.16515 2.62145Z" />
        <path d="M11.2362 9.43967C11.5502 9.30067 11.8015 9.05025 11.9405 8.73617L13.5494 5.11725C13.7169 4.74204 14.0887 4.5 14.5 4.5C14.9112 4.5 15.2839 4.74204 15.4506 5.11725L17.0603 8.73617C17.1985 9.05025 17.4497 9.3015 17.7638 9.43967L21.3827 11.0494C21.7579 11.2161 22 11.5887 22 12C22 12.4112 21.7579 12.7831 21.3827 12.9506L17.7638 14.5595C17.4497 14.6985 17.1993 14.9497 17.0603 15.2638L15.4506 18.8827C15.2839 19.2579 14.9112 19.5 14.5 19.5C14.0887 19.5 13.7169 19.2579 13.5494 18.8827L11.9405 15.2638C11.8015 14.9497 11.5502 14.6985 11.2362 14.5595L7.61725 12.9506C7.24204 12.7831 7 12.4112 7 12C7 11.5887 7.24204 11.2161 7.61725 11.0494L11.2362 9.43967Z" />
        <path d="M4.60728 19.392L5.67703 16.6875C5.72997 16.5541 5.85854 16.4666 6.00056 16.4666C6.14258 16.4666 6.27031 16.5541 6.32325 16.6875L7.39299 19.392L10.0678 20.4736C10.1997 20.5271 10.2863 20.6563 10.2863 20.7999C10.2863 20.9435 10.1997 21.0735 10.0678 21.1271L7.39299 22.2087L6.32325 24.9123C6.27031 25.0457 6.14258 25.1332 6.00056 25.1332C5.85854 25.1332 5.72997 25.0457 5.67703 24.9123L4.60728 22.2087L1.93333 21.1271C1.8014 21.0735 1.71484 20.9435 1.71484 20.7999C1.71484 20.6563 1.8014 20.5271 1.93333 20.4736L4.60728 19.392Z" />
      </svg>
      <span className="before:bg-gradient-to-r before:from-transparent before:to-primary-foreground">
        {children}
      </span>
    </button>
  );
}
