import React from 'react';
import { Snowflake, Flame, Droplets, Wind, Sparkles, MoveHorizontal, Leaf, Clock } from 'lucide-react';
import { AC_MODES, FAN_SPEEDS } from '../climateService';
import { ToggleSwitch } from '../../../components/common/ToggleSwitch';
import './AirConditionerControl.css';

export const AirConditionerControl = ({
  acData = {},
  onUpdateSetting,
  disabled = false,
}) => {
  const {
    mode = 'cool',
    fanSpeed = 'mid',
    swing = true,
    eco = true,
  } = acData;

  const modeIcons = {
    cool: Snowflake,
    heat: Flame,
    dry: Droplets,
    fan: Wind,
    auto: Sparkles,
  };

  return (
    <div className={`ac-control-panel glass-panel ${disabled ? 'disabled-panel' : ''}`}>
      <div className="panel-section-title">
        <h4>Chế Độ & Vận Hành Điều Hòa</h4>
        <p>Tuỳ chỉnh luồng gió, chế độ làm mát và tính năng thông minh</p>
      </div>

      {/* Mode selection buttons */}
      <div className="control-group">
        <label className="group-label">CHẾ ĐỘ HOẠT ĐỘNG</label>
        <div className="modes-buttons-grid">
          {AC_MODES.map((item) => {
            const Icon = modeIcons[item.id] || Snowflake;
            const isSelected = mode === item.id;
            return (
              <button
                key={item.id}
                className={`mode-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => onUpdateSetting('mode', item.id)}
                disabled={disabled}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fan Speed selection */}
      <div className="control-group">
        <label className="group-label">TỐC ĐỘ QUẠT GIÓ</label>
        <div className="speed-buttons-row">
          {FAN_SPEEDS.map((item) => {
            const isSelected = fanSpeed === item.id;
            return (
              <button
                key={item.id}
                className={`speed-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => onUpdateSetting('fanSpeed', item.id)}
                disabled={disabled}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Smart Toggles: Swing, Eco, Timer */}
      <div className="toggles-grid">
        <div className="smart-toggle-box">
          <div className="toggle-info">
            <MoveHorizontal size={18} className="toggle-icon-hint" />
            <div>
              <span className="toggle-title">Đảo Gió Tự Động</span>
              <span className="toggle-desc">Cánh vẫy 3D tuần hoàn</span>
            </div>
          </div>
          <ToggleSwitch
            checked={swing}
            onChange={(val) => onUpdateSetting('swing', val)}
            disabled={disabled}
          />
        </div>

        <div className="smart-toggle-box">
          <div className="toggle-info">
            <Leaf size={18} className="toggle-icon-hint eco" />
            <div>
              <span className="toggle-title">Chế Độ Tiết Kiệm (Eco)</span>
              <span className="toggle-desc">Giảm 25% điện năng</span>
            </div>
          </div>
          <ToggleSwitch
            checked={eco}
            onChange={(val) => onUpdateSetting('eco', val)}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

