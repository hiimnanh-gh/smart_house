import React from 'react';
import './RangeSlider.css';

export const RangeSlider = ({
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  unit = '%',
  label = '',
  disabled = false,
}) => {
  return (
    <div className={`range-slider-group ${disabled ? 'disabled' : ''}`}>
      {(label || unit) && (
        <div className="range-slider-header">
          {label && <span className="range-slider-label">{label}</span>}
          <span className="range-slider-val">{value}{unit}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="range-slider-input"
        style={{
          background: `linear-gradient(to right, #38bdf8 0%, #38bdf8 ${(value - min) / (max - min) * 100}%, #334155 ${(value - min) / (max - min) * 100}%, #334155 100%)`
        }}
      />
    </div>
  );
};

