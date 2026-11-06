import React from 'react';
import { CloudSun, Wind, Droplets, Compass } from 'lucide-react';
import './WeatherWidget.css';

export const WeatherWidget = ({ outdoorData = {} }) => {
  const { temp = 31.5, hum = 74, pressure = 1012, uv = 5 } = outdoorData;

  return (
    <div className="weather-widget glass-panel">
      <div className="weather-header">
        <div className="weather-location">
          <h4>Thời Tiết Ngoài Trời</h4>
          <p>Hà Nội, Việt Nam • Trạm khí tượng sân thượng</p>
        </div>
        <div className="weather-icon-badge">
          <CloudSun size={32} className="weather-icon" />
        </div>
      </div>

      <div className="weather-main">
        <div className="weather-temp-box">
          <span className="temp-number">{temp}</span>
          <span className="temp-degree">°C</span>
        </div>
        <div className="weather-condition">
          <span className="cond-title">Nhiều mây, gió nhẹ</span>
          <span className="cond-sub">Chỉ số UV: {uv} (Mức vừa phải)</span>
        </div>
      </div>

      <div className="weather-details-grid">
        <div className="weather-detail-item">
          <Droplets size={16} className="detail-icon" />
          <div className="detail-meta">
            <span className="detail-label">Độ ẩm ngoài</span>
            <span className="detail-val">{hum}%</span>
          </div>
        </div>

        <div className="weather-detail-item">
          <Wind size={16} className="detail-icon" />
          <div className="detail-meta">
            <span className="detail-label">Tốc độ gió</span>
            <span className="detail-val">12 km/h Đông Bắc</span>
          </div>
        </div>

        <div className="weather-detail-item">
          <Compass size={16} className="detail-icon" />
          <div className="detail-meta">
            <span className="detail-label">Áp suất khí quyển</span>
            <span className="detail-val">{pressure} hPa</span>
          </div>
        </div>
      </div>
    </div>
  );
};

