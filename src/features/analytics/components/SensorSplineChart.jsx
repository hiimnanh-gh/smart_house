import React, { useState } from 'react';
import { Thermometer, Droplets, Zap } from 'lucide-react';
import './SensorSplineChart.css';

export const SensorSplineChart = ({ telemetryData = [] }) => {
  const [activeMetric, setActiveMetric] = useState('temp'); // 'temp' | 'hum' | 'power'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (telemetryData.length === 0) return null;

  const width = 800;
  const height = 260;
  const paddingX = 40;
  const paddingY = 30;

  // Determine min and max based on active metric
  let minVal, maxVal, unit, strokeColor, fillColor;
  if (activeMetric === 'temp') {
    minVal = 18;
    maxVal = 35;
    unit = '°C';
    strokeColor = '#f43f5e';
    fillColor = 'rgba(244, 63, 94, 0.15)';
  } else if (activeMetric === 'hum') {
    minVal = 40;
    maxVal = 95;
    unit = '%';
    strokeColor = '#38bdf8';
    fillColor = 'rgba(56, 189, 248, 0.15)';
  } else {
    minVal = 0;
    maxVal = 5.0;
    unit = ' kW';
    strokeColor = '#f59e0b';
    fillColor = 'rgba(245, 158, 11, 0.15)';
  }

  // Calculate coordinates
  const points = telemetryData.map((d, i) => {
    const val = d[activeMetric];
    const x = paddingX + (i / (telemetryData.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - ((val - minVal) / (maxVal - minVal)) * (height - 2 * paddingY);
    return { x, y, val, time: d.time };
  });

  // Construct smooth SVG path using Catmull-Rom or bezier
  const dPath = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = arr[i - 1];
    const cp1x = prev.x + (point.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (point.x - prev.x) / 2;
    const cp2y = point.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`;
  }, '');

  const areaPath = `${dPath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="spline-chart-card glass-panel">
      <div className="chart-head">
        <div>
          <h4>Biểu Đồ Lịch Sử Dữ Liệu 24 Giờ</h4>
          <p>Dữ liệu trích xuất từ bộ nhớ đệm Flash vi điều khiển ESP32</p>
        </div>

        <div className="metric-tabs">
          <button
            className={`metric-tab ${activeMetric === 'temp' ? 'active temp' : ''}`}
            onClick={() => setActiveMetric('temp')}
          >
            <Thermometer size={14} /> Nhiệt Độ
          </button>
          <button
            className={`metric-tab ${activeMetric === 'hum' ? 'active hum' : ''}`}
            onClick={() => setActiveMetric('hum')}
          >
            <Droplets size={14} /> Độ Ẩm
          </button>
          <button
            className={`metric-tab ${activeMetric === 'power' ? 'active power' : ''}`}
            onClick={() => setActiveMetric('power')}
          >
            <Zap size={14} /> Phụ Tải kW
          </button>
        </div>
      </div>

      <div className="svg-container">
        <svg viewBox={`0 0 ${width} ${height}`} className="responsive-svg">
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = paddingY + pct * (height - 2 * paddingY);
            const labelVal = (maxVal - pct * (maxVal - minVal)).toFixed(1);
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {labelVal}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill={fillColor} />

          {/* Glowing Stroke line */}
          <path
            d={dPath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="3"
            style={{ filter: `drop-shadow(0 0 6px ${strokeColor})` }}
          />

          {/* Data points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hoveredPoint?.time === p.time ? '6' : '3.5'}
              fill="#ffffff"
              stroke={strokeColor}
              strokeWidth="2"
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
              style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
            />
          ))}

          {/* X-axis time labels */}
          {points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              fill="#64748b"
              fontSize="10"
              fontFamily="monospace"
            >
              {p.time}
            </text>
          ))}
        </svg>

        {hoveredPoint && (
          <div className="chart-tooltip glass-panel">
            <span className="tooltip-time">{hoveredPoint.time}</span>
            <span className="tooltip-val" style={{ color: strokeColor }}>
              {hoveredPoint.val} {unit}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

