import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { COLOR_PRESETS } from '../lightingService';
import './RgbColorPicker.css';

export const RgbColorPicker = ({ currentLight, onApplyColor, onClose }) => {
  const [selectedHex, setSelectedHex] = useState(currentLight?.color || '#38bdf8');

  if (!currentLight) return null;

  const handleSave = () => {
    onApplyColor(currentLight.id, selectedHex);
    onClose();
  };

  return (
    <div className="rgb-picker-body">
      <div className="rgb-preview-box" style={{ backgroundColor: selectedHex }}>
        <span className="rgb-preview-text">{currentLight.name}</span>
        <span className="rgb-preview-hex">{selectedHex}</span>
      </div>

      <div className="presets-list">
        <label className="picker-section-label">BẢNG MÀU PHỔ BIẾN</label>
        <div className="presets-grid">
          {COLOR_PRESETS.map((preset) => {
            const isChosen = selectedHex.toLowerCase() === preset.hex.toLowerCase();
            return (
              <button
                key={preset.hex}
                className={`preset-swatch ${isChosen ? 'chosen' : ''}`}
                style={{ backgroundColor: preset.hex }}
                onClick={() => setSelectedHex(preset.hex)}
                title={preset.name}
              >
                {isChosen && <Check size={16} className="swatch-check" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="custom-color-input-wrap">
        <label className="picker-section-label">CHỌN MÀU TỰ DO</label>
        <div className="native-picker-row">
          <input
            type="color"
            value={selectedHex}
            onChange={(e) => setSelectedHex(e.target.value)}
            className="native-color-input"
          />
          <input
            type="text"
            value={selectedHex}
            onChange={(e) => setSelectedHex(e.target.value)}
            className="hex-text-input"
            placeholder="#38bdf8"
          />
        </div>
      </div>

      <div className="picker-actions">
        <button className="picker-btn-cancel" onClick={onClose}>
          Hủy Bỏ
        </button>
        <button className="picker-btn-submit" onClick={handleSave}>
          Áp Dụng Màu
        </button>
      </div>
    </div>
  );
};

