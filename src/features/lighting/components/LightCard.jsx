import React from 'react';
import { Lightbulb, Sliders, Palette } from 'lucide-react';
import { ToggleSwitch } from '../../../components/common/ToggleSwitch';
import { RangeSlider } from '../../../components/common/RangeSlider';
import './LightCard.css';

export const LightCard = ({
  light,
  onToggle,
  onBrightnessChange,
  onSelectRgb,
}) => {
  const currentWatt = light.isOn
    ? Math.round((light.watt * light.brightness) / 100)
    : 0;

  return (
    <div
      className={`light-card glass-panel ${light.isOn ? 'is-on' : 'is-off'}`}
      style={{
        '--light-glow-color': light.isOn ? light.color : 'transparent',
      }}
    >
      <div className="light-card-header">
        <div className="light-avatar-box">
          <Lightbulb
            size={24}
            className="bulb-icon"
            style={{ color: light.isOn ? light.color : '#64748b' }}
          />
        </div>
        <ToggleSwitch
          size="md"
          checked={light.isOn}
          onChange={() => onToggle(light.id)}
        />
      </div>

      <div className="light-card-content">
        <div className="light-title-row">
          <h4 className="light-name">{light.name}</h4>
          <span className="light-watt-badge">{currentWatt}W</span>
        </div>
        <span className="light-room-tag">{light.room}</span>
      </div>

      <div className="light-controls">
        <RangeSlider
          label="Độ sáng"
          min={1}
          max={100}
          value={light.brightness}
          onChange={(val) => onBrightnessChange(light.id, val)}
          disabled={!light.isOn}
        />

        {light.type === 'rgb' && (
          <button
            className="rgb-customize-btn"
            onClick={() => onSelectRgb(light)}
            disabled={!light.isOn}
          >
            <Palette size={15} />
            <span>Đổi màu RGB</span>
            <span
              className="color-dot-indicator"
              style={{ backgroundColor: light.color }}
            ></span>
          </button>
        )}
      </div>
    </div>
  );
};

