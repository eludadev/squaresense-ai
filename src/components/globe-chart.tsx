import createGlobe from 'cobe';
import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import ChartWrapper, { ChartSize } from './chart-wrapper';
import useCustomers from '@/hooks/useCustomers';
import Phenomenon from 'phenomenon';
import { locationDatabase, type LocationCoordinates } from '@/lib/database';

export default function GlobeChart() {
  const canvasRef = useRef<HTMLCanvasElement>();
  const { data, isLoading } = useCustomers();

  const renderer = useRef<Phenomenon>();
  const [locationData, setLocationData] = useState<
    Record<
      string,
      {
        coordinates: LocationCoordinates;
        count: number;
      }
    >
  >({});

  useEffect(() => {
    if (data !== undefined) {
      const customers = data.customers;
      const locations: Record<
        string,
        {
          coordinates: LocationCoordinates;
          count: number;
        }
      > = {};
      for (const { locality } of customers) {
        if (
          locality !== undefined &&
          Object.keys(locationDatabase).includes(locality)
        ) {
          if (locations[locality] === undefined) {
            locations[locality] = {
              coordinates: locationDatabase[locality],
              count: 1,
            };
          } else {
            locations[locality].count += 1;
          }
        }
      }

      setLocationData(locations);
    }
  }, [data]);

  const locationToAngles = (lat: number, long: number) => {
    return [
      Math.PI - ((long * Math.PI) / 180 - Math.PI / 2),
      (lat * Math.PI) / 180,
    ];
  };
  const focusRef = useRef([0, 0]);

  useEffect(() => {
    renderer.current?.destroy();

    if (canvasRef.current !== undefined && locationData !== undefined) {
      const totalCount =
        Object.values(locationData)
          .map((x) => x.count)
          .reduce((a, b) => a + b, 0) ?? 1;

      let width = 0;
      let currentPhi = 0;
      let currentTheta = 0;
      const doublePi = Math.PI * 2;
      const onResize = () =>
        canvasRef.current && (width = canvasRef.current.offsetWidth);
      window.addEventListener('resize', onResize);
      onResize();
      renderer.current = createGlobe(canvasRef.current, {
        devicePixelRatio: 2,
        width: width * 2,
        height: width * 2,
        phi: 0,
        theta: 0.3,
        dark: 1,
        diffuse: 3,
        mapSamples: 16000,
        mapBrightness: 1.2,
        baseColor: [1, 1, 1],
        markerColor: [251 / 255, 200 / 255, 21 / 255],
        glowColor: [1.2, 1.2, 1.2],
        markers: Object.values(locationData).map((x) => ({
          location: [x.coordinates.lat, x.coordinates.long],
          size: x.count / totalCount,
        })),
        onRender: (state) => {
          state.phi = currentPhi;
          state.theta = currentTheta;
          const [focusPhi, focusTheta] = focusRef.current;
          const distPositive = (focusPhi - currentPhi + doublePi) % doublePi;
          const distNegative = (currentPhi - focusPhi + doublePi) % doublePi;
          // Control the speed
          if (distPositive < distNegative) {
            currentPhi += distPositive * 0.08;
          } else {
            currentPhi -= distNegative * 0.08;
          }
          currentTheta = currentTheta * 0.92 + focusTheta * 0.08;
          state.width = width * 2;
          state.height = width * 2;
        },
      });
      setTimeout(() => {
        if (canvasRef.current !== undefined) {
          canvasRef.current.style.opacity = '1';
        }
      });
      return () => renderer.current?.destroy();
    }
  }, [canvasRef, locationData]);

  return (
    <ChartWrapper
      prompt="Analyse my customers' location distribution. Help me discover hotspot areas. Keep it brief."
      isLoading={isLoading}
      title="Customer Location Map"
      description="Discover customer locations with our interactive map. Visualize customer distribution and hotspot areas."
      size={ChartSize.MEDIUM}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 600,
          aspectRatio: 1,
          margin: 'auto',
          position: 'relative',
        }}
      >
        <canvas
          ref={(ref) => {
            if (ref !== null) {
              canvasRef.current = ref;
            }
          }}
          style={{
            width: '100%',
            height: '100%',
            contain: 'layout paint size',
            opacity: 0,
            transition: 'opacity 1s ease',
          }}
        />
        <div
          className="flex flex-row flex-wrap justify-center items-center"
          style={{ gap: '.5rem' }}
        >
          {Object.entries(locationData).map(([name, data]) => (
            <Button
              key={name}
              className=""
              variant="ghost"
              onClick={() => {
                focusRef.current = locationToAngles(
                  data.coordinates.lat,
                  data.coordinates.long,
                );
              }}
            >
              📍 {name}
            </Button>
          ))}
        </div>
      </div>
    </ChartWrapper>
  );
}
