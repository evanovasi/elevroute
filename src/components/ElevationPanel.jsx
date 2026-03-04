'use client';

import { useEffect, useRef, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useRouteStore, COLORS } from '@/stores/routeStore';
import { hexRgb } from '@/utils/math';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

export default function ElevationPanel() {
  const allRoutes = useRouteStore((s) => s.allRoutes);
  const activeRouteIndex = useRouteStore((s) => s.activeRouteIndex);
  const route = allRoutes[activeRouteIndex];

  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const indicatorRef = useRef(null);
  const tooltipRef = useRef(null);
  const [simDistance, setSimDistance] = useState(null);

  // Register for simulation updates
  useEffect(() => {
    const checkRef = () => {
      if (window.__elevroute_onSimUpdate) {
        window.__elevroute_onSimUpdate.current = (distanceMeters) => {
          setSimDistance(distanceMeters);
        };
      }
    };
    checkRef();
    const interval = setInterval(checkRef, 500);
    return () => clearInterval(interval);
  }, []);

  // Update indicator position
  useEffect(() => {
    if (!chartRef.current || !indicatorRef.current || !tooltipRef.current || !route) return;

    if (simDistance === null) {
      indicatorRef.current.style.display = 'none';
      tooltipRef.current.style.display = 'none';
      return;
    }

    const chart = chartRef.current;
    const xScale = chart.scales?.x;
    if (!xScale) return;

    const distanceKm = simDistance / 1000;
    const pixel = xScale.getPixelForValue(distanceKm);

    const canvasEl = chart.canvas;
    const containerEl = containerRef.current;
    if (!canvasEl || !containerEl) return;

    const canvasRect = canvasEl.getBoundingClientRect();
    const containerRect = containerEl.getBoundingClientRect();
    const left = pixel + (canvasRect.left - containerRect.left);

    indicatorRef.current.style.display = 'block';
    indicatorRef.current.style.left = left + 'px';

    // Elevation at distance
    const elevs = route.elevations;
    const total = route.dist;
    let elev = elevs[0];
    if (simDistance >= total) elev = elevs[elevs.length - 1];
    else if (simDistance > 0) {
      const step = total / (elevs.length - 1);
      const index = simDistance / step;
      const i1 = Math.floor(index);
      const i2 = Math.min(i1 + 1, elevs.length - 1);
      const frac = index - i1;
      elev = elevs[i1] + (elevs[i2] - elevs[i1]) * frac;
    }

    tooltipRef.current.style.display = 'block';
    tooltipRef.current.innerHTML = `${distanceKm.toFixed(2)} km, ${Math.round(elev)} mdpl`;
    let tooltipLeft = left + 10;
    const tooltipWidth = tooltipRef.current.offsetWidth;
    const containerWidth = containerRect.width;
    if (tooltipLeft + tooltipWidth > containerWidth - 10) tooltipLeft = left - tooltipWidth - 10;
    if (tooltipLeft < 10) tooltipLeft = 10;
    tooltipRef.current.style.left = tooltipLeft + 'px';
    tooltipRef.current.style.top = '10px';
  }, [simDistance, route]);

  if (!route || allRoutes.length === 0) return null;

  const elevs = route.elevations;
  const n = elevs.length;
  const totalDist = route.dist;
  const step = totalDist / (n - 1);
  const dataPoints = [];
  for (let i = 0; i < n; i++) {
    dataPoints.push({ x: (i * step) / 1000, y: elevs[i] });
  }
  const color = COLORS[activeRouteIndex] || '#FF2C2C';
  const rgb = hexRgb(color);

  const chartData = {
    datasets: [{
      label: 'Elevasi (m)',
      data: dataPoints,
      borderColor: color,
      backgroundColor: (ctx) => {
        const chart = ctx.chart;
        const { ctx: c, chartArea } = chart;
        if (!chartArea) return `rgba(${rgb},.35)`;
        const grad = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        grad.addColorStop(0, `rgba(${rgb},.35)`);
        grad.addColorStop(1, `rgba(${rgb},0)`);
        return grad;
      },
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.3,
      fill: true,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a2220',
        borderColor: '#2a3a36',
        borderWidth: 1,
        titleColor: '#6b8a82',
        bodyColor: '#e8f0ee',
        callbacks: {
          label: (c) => '  ' + Math.round(c.raw.y) + ' mdpl',
        },
      },
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: { display: true, text: 'Jarak (km)', color: '#6b8a82', font: { family: 'DM Mono', size: 10 } },
        grid: { color: 'rgba(42,58,54,.6)' },
        ticks: { color: '#6b8a82', font: { family: 'DM Mono', size: 10 }, maxTicksLimit: 8, maxRotation: 0 },
      },
      y: {
        title: { display: true, text: 'Elevasi (m)', color: '#6b8a82', font: { family: 'DM Mono', size: 10 } },
        grid: { color: 'rgba(42,58,54,.6)' },
        ticks: { color: '#6b8a82', font: { family: 'DM Mono', size: 10 }, callback: (v) => v + ' m' },
      },
    },
  };

  return (
    <div className="bottom-panel" style={{ display: 'flex', position: 'relative' }}>
      <div className="bottom-header">
        <div className="bottom-title">📈 Profil Elevasi</div>
        <div className="bottom-stats">
          <div className="b-stat"><span className="val" style={{ color: '#FF2C2C' }}>↑{route.gain}m</span> <span className="lbl">gain</span></div>
          <div className="b-stat"><span className="val" style={{ color: '#00c9ff' }}>↓{route.loss}m</span> <span className="lbl">loss</span></div>
          <div className="b-stat"><span className="val" style={{ color: '#ffb347' }}>{route.maxG}%</span> <span className="lbl">max grade</span></div>
          <div className="b-stat"><span className="val">{Math.round(Math.min(...elevs))}m</span> <span className="lbl">min elev</span></div>
          <div className="b-stat"><span className="val">{Math.round(Math.max(...elevs))}m</span> <span className="lbl">max elev</span></div>
        </div>
      </div>
      <div ref={containerRef} style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <Line ref={chartRef} data={chartData} options={chartOptions} />
        <div ref={indicatorRef} style={{
          position: 'absolute', top: 0, bottom: 0, width: '2px', background: '#ff2c2c',
          transform: 'translateX(-50%)', display: 'none', pointerEvents: 'none', zIndex: 10,
        }}></div>
        <div ref={tooltipRef} style={{
          position: 'absolute', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '4px 8px',
          borderRadius: '4px', fontSize: '11px', fontFamily: "'DM Mono', monospace",
          pointerEvents: 'none', display: 'none', zIndex: 30, whiteSpace: 'nowrap',
        }}></div>
      </div>
    </div>
  );
}
