import React from 'react';
import { Thermometer, Droplets } from 'lucide-react';
import { getComfortLevel } from '../climateService';
import './SensorGauge.css';

export const SensorGauge = ({ title, temp = 25, hum = 60, zoneKey = 'living' }) => {
  const comfort = getComfortLevel(temp, hum);

  // Temperature percent between 15°C and 40°C
  const tempPercent = Math.min(100, Math.max(0, ((temp - 15) / (40 - 15)) * 100));
  // Humidity percent between 0% and 100%
  const humPercent = hum;

  return (
    <div className="sensor-gauge-card glass-panel">
      <div className="gauge-header">
        <h4>{title}</h4>
        <span className={`comfort-badge ${comfort.status}`}>
          {comfort.text}
        </span>
      </div>

      <div className="gauge-bars">
        {/* Temperature Meter */}
        <div className="gauge-meter-item">
          <div className="meter-head">
            <span className="meter-label">
              <Thermometer size={14} className="meter-icon temp" /> Nhiệt độ
            </span>
            <span className="meter-val temp-val">{temp}°C</span>
          </div>
          <div className="meter-track">
            <div
              className="meter-fill temp-fill"
              style={{ width: `${tempPercent}%` }}
            ></div>
          </div>
          <div className="meter-scale">
            <span>15°C</span>
            <span>25°C</span>
            <span>40°C</span>
          </div>
        </div>

        {/* Humidity Meter */}
        <div className="gauge-meter-item">
          <div className="meter-head">
            <span className="meter-label">
              <Droplets size={14} className="meter-icon hum" /> Độ ẩm không khí
            </span>
            <span className="meter-val hum-val">{hum}%</span>
          </div>
          <div className="meter-track">
            <div
              className="meter-fill hum-fill"
              style={{ width: `${humPercent}%` }}
            ></div>
          </div>
          <div className="meter-scale">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      <div className="gauge-advice">
        <span className="advice-dot"></span>
        <span className="advice-text">{comfort.advice}</span>
      </div>
    </div>
  );
};

