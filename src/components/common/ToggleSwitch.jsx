import React from 'react';
import { sound } from '../../utils/soundEffects';
import './ToggleSwitch.css';

export const ToggleSwitch = ({ checked, onChange, disabled = false, size = 'md', label = '' }) => {
  const handleChange = (e) => {
    const nextVal = e.target.checked;
    sound.playToggle(nextVal);
    onChange(nextVal);
  };

  return (
    <label className={`toggle-container ${size} ${disabled ? 'disabled' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
      />
      <span className="toggle-slider"></span>
      {label && <span className="toggle-label">{label}</span>}
    </label>
  );
};


