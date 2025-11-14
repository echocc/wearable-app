'use client';

import { useEffect, useRef } from 'react';
import embed from 'vega-embed';

interface VegaChartProps {
  spec: any;
  className?: string;
}

export default function VegaChart({ spec, className = '' }: VegaChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && spec) {
      embed(containerRef.current, spec, {
        actions: {
          export: true,
          source: false,
          compiled: false,
          editor: false,
        },
        theme: 'latimes',
      }).catch((error) => {
        console.error('Error rendering Vega chart:', error);
      });
    }
  }, [spec]);

  return <div ref={containerRef} className={className} />;
}
