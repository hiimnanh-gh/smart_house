import React from 'react';
import { Wind, ShieldCheck, Gauge, RefreshCw } from 'lucide-react';
import { ToggleSwitch } from '../../../components/common/ToggleSwitch';
import './AirQualityCard.css';

export const AirQualityCard = ({
  aqi = 38,
  co2 = 450,
  purifierData = {},
  onTogglePurifier,
}) => {
  const { isOn = true, filterLife = 92 } = purifierData;

  return (
    <div className="air-quality-card glass-panel">
      <div className="card-top-row">
        <div className="title-area">
          <div className="aqi-icon-badge">
            <Wind size={22} />
          </div>
          <div>
            <h4>Chất Lượng Không Khí & Lọc HEPA</h4>
            <p>Cảm biến đo nồng độ hạt mịn PM2.5 & khí CO2</p>
          </div>
        </div>
        <ToggleSwitch
          size="sm"
          checked={isOn}
          onChange={onTogglePurifier}
          label={isOn ? 'Máy lọc BẬT' : 'Máy lọc TẮT'}
        />
      </div>

      <div className="aqi-stats-grid">
        <div className="aqi-stat-box">
          <span className="aqi-label">Chỉ số AQI</span>
          <div className="aqi-number-wrap">
            <span className="aqi-number">{aqi}</span>
            <span className="aqi-grade">Tốt</span>
          </div>
        </div>

        <div className="aqi-stat-box">
          <span className="aqi-label">Bụi Mịn PM2.5</span>
          <div className="aqi-number-wrap">
            <span className="aqi-number">{Math.round(aqi * 0.45)}</span>
            <span className="aqi-grade">µg/m³</span>
          </div>
        </div>

        <div className="aqi-stat-box">
          <span className="aqi-label">Nồng Độ CO2</span>
          <div className="aqi-number-wrap">
            <span className="aqi-number">{co2}</span>
            <span className="aqi-grade">PPM</span>
          </div>
        </div>
      </div>

      {/* Filter Life */}
      <div className="filter-life-section">
        <div className="filter-head">
          <span className="filter-name">
            <RefreshCw size={14} /> Tuổi thọ lõi lọc than hoạt tính
          </span>
          <span className="filter-percent">{filterLife}%</span>
        </div>
        <div className="filter-bar-track">
          <div
            className="filter-bar-fill"
            style={{ width: `${filterLife}%` }}
          ></div>
        </div>
        <span className="filter-hint">Khuyến nghị thay lõi lọc sau khoảng 180 ngày nữa</span>
      </div>
    </div>
  );
};

