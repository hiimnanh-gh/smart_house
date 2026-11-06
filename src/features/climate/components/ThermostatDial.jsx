import React from 'react';
import { Plus, Minus, Power, Snowflake, Flame, Droplets } from 'lucide-react';
import { sound } from '../../../utils/soundEffects';
import './ThermostatDial.css';

export const ThermostatDial = ({
  targetTemp = 24,
  ambientTemp = 26.4,
  isOn = true,
  mode = 'cool',
  onTempChange,
  onTogglePower,
}) => {
  const handleIncrease = () => {
    if (targetTemp < 30) {
      sound.playClick();
      onTempChange(targetTemp + 1);
    }
  };

  const handleDecrease = () => {
    if (targetTemp > 16) {
      sound.playClick();
      onTempChange(targetTemp - 1);
    }
  };

  // Calculate percentage of dial for 16°C to 30°C
  const percentage = Math.round(((targetTemp - 16) / (30 - 16)) * 100);

  return (
    <div className={`thermostat-card glass-panel ${isOn ? 'active' : 'off'}`}>
      <div className="thermostat-header">
        <div>
          <h3>Bộ Điều Nhiệt Trung Tâm</h3>
          <p>Điều hòa Daikin Inverter - Phòng Khách</p>
        </div>
        <button
          className={`thermostat-power-btn ${isOn ? 'power-on' : ''}`}
          onClick={onTogglePower}
          title={isOn ? 'Tắt điều hòa' : 'Bật điều hòa'}
        >
          <Power size={20} />
        </button>
      </div>

      <div className="thermostat-dial-wrapper">
        <div
          className="dial-ring-outer"
          style={{
            background: isOn
              ? `conic-gradient(from 180deg, #38bdf8 0%, #06b6d4 ${percentage}%, #1e293b ${percentage}%, #1e293b 100%)`
              : '#1e293b',
          }}
        >
          <div className="dial-ring-inner">
            <span className="dial-mode-badge">
              {mode === 'cool' && <Snowflake size={14} />}
              {mode === 'heat' && <Flame size={14} />}
              {mode === 'dry' && <Droplets size={14} />}
              <span className="dial-mode-text">{mode.toUpperCase()}</span>
            </span>

            <div className="dial-temp-display">
              <span className="dial-target-val">{isOn ? targetTemp : '--'}</span>
              <span className="dial-unit">°C</span>
            </div>

            <div className="dial-ambient">
              <span>Hiện tại: </span>
              <strong>{ambientTemp}°C</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="dial-controls">
        <button
          className="dial-adjust-btn"
          onClick={handleDecrease}
          disabled={!isOn || targetTemp <= 16}
          aria-label="Giảm nhiệt độ"
        >
          <Minus size={22} />
        </button>

        <span className="dial-range-hint">Dải cài đặt: 16°C - 30°C</span>

        <button
          className="dial-adjust-btn"
          onClick={handleIncrease}
          disabled={!isOn || targetTemp >= 30}
          aria-label="Tăng nhiệt độ"
        >
          <Plus size={22} />
        </button>
      </div>
    </div>
  );
};

