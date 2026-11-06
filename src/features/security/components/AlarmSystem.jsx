import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldOff, AlertOctagon } from 'lucide-react';
import { ARM_MODES } from '../securityService';
import './AlarmSystem.css';

export const AlarmSystem = ({
  securityData = {},
  onSelectMode,
  onToggleSiren,
}) => {
  const { mode = 'home', siren = false, armed = true } = securityData;

  const modeIcons = {
    away: ShieldAlert,
    home: ShieldCheck,
    disarmed: ShieldOff,
  };

  return (
    <div className="alarm-system-box glass-panel">
      <div className="alarm-top">
        <div>
          <h4>Trạng Thái & Chế Độ An Ninh</h4>
          <p>Kích hoạt hàng rào bảo vệ đa lớp bằng cảm biến chuyển động & cửa</p>
        </div>
      </div>

      <div className="arm-modes-grid">
        {ARM_MODES.map((item) => {
          const Icon = modeIcons[item.id] || ShieldCheck;
          const isSelected = mode === item.id;
          return (
            <div
              key={item.id}
              className={`mode-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectMode(item.id)}
            >
              <div className="mode-icon-circle">
                <Icon size={24} />
              </div>
              <div className="mode-text">
                <span className="mode-title">{item.label}</span>
                <span className="mode-desc">{item.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Emergency Siren action */}
      <div className="siren-alert-panel">
        <div className="siren-desc">
          <AlertOctagon size={24} className="siren-icon" />
          <div>
            <span className="siren-title">Còi Báo Động Khẩn Cấp (Siren 110dB)</span>
            <span className="siren-sub">Phát chuông báo động toàn bộ hệ thống loa và gửi tin khẩn</span>
          </div>
        </div>
        <button
          className={`btn-siren-trigger ${siren ? 'triggered' : ''}`}
          onClick={onToggleSiren}
        >
          {siren ? 'DỪNG CÒI BÁO ĐỘNG' : 'KÍCH HOẠT CÒI KHẨN'}
        </button>
      </div>
    </div>
  );
};

