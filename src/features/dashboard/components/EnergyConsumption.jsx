import React from 'react';
import { Zap, TrendingDown, DollarSign } from 'lucide-react';
import './EnergyConsumption.css';

export const EnergyConsumption = ({ powerData = {}, currentKw = 1.68 }) => {
  const { dailyKwh = 14.8, monthlyKwh = 342 } = powerData;
  const estimatedCost = (dailyKwh * 2500).toLocaleString('vi-VN'); // VNĐ

  // 12 hours mock bars
  const hoursData = [
    { time: '02h', kw: 0.8 },
    { time: '04h', kw: 0.6 },
    { time: '06h', kw: 1.2 },
    { time: '08h', kw: 2.1 },
    { time: '10h', kw: 1.5 },
    { time: '12h', kw: 2.8 },
    { time: '14h', kw: currentKw },
    { time: '16h', kw: 1.9 },
    { time: '18h', kw: 3.4 },
    { time: '20h', kw: 3.1 },
    { time: '22h', kw: 2.2 },
    { time: '24h', kw: 1.1 },
  ];

  const maxKw = 4.0;

  return (
    <div className="energy-card glass-panel">
      <div className="energy-header">
        <div className="energy-title-box">
          <div className="energy-zap-icon">
            <Zap size={20} />
          </div>
          <div>
            <h4>Tiêu Thụ Năng Lượng Điện</h4>
            <p>Giám sát phụ tải & chi phí thời gian thực</p>
          </div>
        </div>
        <div className="energy-badge">
          <TrendingDown size={14} />
          <span>-8.5% so với hôm qua</span>
        </div>
      </div>

      <div className="energy-metrics-row">
        <div className="metric-box">
          <span className="metric-lbl">Công suất tức thời</span>
          <div className="metric-val-wrap">
            <span className="metric-num highlight">{currentKw}</span>
            <span className="metric-unit">kW</span>
          </div>
        </div>

        <div className="metric-box">
          <span className="metric-lbl">Tổng hôm nay</span>
          <div className="metric-val-wrap">
            <span className="metric-num">{dailyKwh}</span>
            <span className="metric-unit">kWh</span>
          </div>
        </div>

        <div className="metric-box">
          <span className="metric-lbl">Chi phí ước tính / ngày</span>
          <div className="metric-val-wrap">
            <span className="metric-num font-sm">{estimatedCost}</span>
            <span className="metric-unit">đ</span>
          </div>
        </div>
      </div>

      {/* Hourly Bar Chart */}
      <div className="energy-chart-container">
        <div className="chart-bars-wrap">
          {hoursData.map((item, idx) => {
            const heightPercent = Math.min(100, Math.round((item.kw / maxKw) * 100));
            const isCurrent = item.time === '14h';
            return (
              <div key={idx} className="chart-column">
                <div className="bar-track">
                  <div
                    className={`bar-fill ${isCurrent ? 'current-bar' : ''}`}
                    style={{ height: `${heightPercent}%` }}
                    title={`${item.time}: ${item.kw} kW`}
                  ></div>
                </div>
                <span className={`bar-label ${isCurrent ? 'current-label' : ''}`}>{item.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

