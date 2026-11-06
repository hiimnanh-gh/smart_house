import React from 'react';
import {
  Tv2,
  Bot,
  Flame,
  Blinds,
  Utensils,
  Droplets,
  Warehouse,
  Zap,
  Trash2,
} from 'lucide-react';
import { ToggleSwitch } from '../../../components/common/ToggleSwitch';
import { RangeSlider } from '../../../components/common/RangeSlider';
import './ApplianceCard.css';

const ICONS = {
  tv: Tv2,
  bot: Bot,
  heater: Flame,
  blinds: Blinds,
  dishwasher: Utensils,
  sprinkler: Droplets,
  garage: Warehouse,
  plug: Zap,
};

export const ApplianceCard = ({
  device,
  onToggle,
  onUpdatePercent,
  onRemove,
}) => {
  const Icon = ICONS[device.icon] || Zap;

  return (
    <div className={`appliance-card glass-panel ${device.isOn ? 'active' : ''}`}>
      <div className="card-top">
        <div className="device-icon-box">
          <Icon size={24} className="device-svg-icon" />
        </div>
        <div className="top-actions">
          <ToggleSwitch
            size="md"
            checked={device.isOn}
            onChange={() => onToggle(device.id)}
          />
        </div>
      </div>

      <div className="card-main">
        <div className="title-row">
          <h4 className="device-name">{device.name}</h4>
          <span className="device-watt-tag">{device.powerWatt}W</span>
        </div>
        <div className="meta-row">
          <span className="room-label">{device.room}</span>
          <span className="status-label">{device.statusText}</span>
        </div>
      </div>

      {device.icon === 'blinds' && (
        <div className="curtain-slider-area">
          <RangeSlider
            label="Độ mở rèm"
            min={0}
            max={100}
            value={device.openPercent || 0}
            onChange={(val) => onUpdatePercent(device.id, val)}
            disabled={!device.isOn}
          />
        </div>
      )}

      <div className="card-footer">
        <span className="power-indicator">
          <span className={`dot ${device.isOn ? 'on' : 'off'}`}></span>
          {device.isOn ? 'Đang tiêu thụ điện' : 'Chế độ chờ (Standby)'}
        </span>
        {onRemove && (
          <button
            className="btn-trash"
            onClick={() => onRemove(device.id)}
            title="Xóa thiết bị này"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
};

