import React from 'react';
import { Lock, Unlock, BatteryMedium, KeyRound, ShieldAlert } from 'lucide-react';
import { sound } from '../../../utils/soundEffects';
import './DoorLockWidget.css';

export const DoorLockWidget = ({ doors = [], onToggleLock }) => {
  const handleToggle = (doorId, isCurrentlyLocked) => {
    if (isCurrentlyLocked) {
      sound.playClick();
    } else {
      sound.playSuccess();
    }
    onToggleLock(doorId);
  };

  return (
    <div className="door-locks-section glass-panel">
      <div className="locks-header">
        <div className="locks-title">
          <KeyRound size={20} className="locks-icon" />
          <div>
            <h4>Khóa Cửa Thông Minh Sinh Trắc Học</h4>
            <p>Bảo vệ cửa chính, cửa ban công & gara bằng mã hóa AES-128</p>
          </div>
        </div>
      </div>

      <div className="locks-grid">
        {doors.map((door) => (
          <div
            key={door.id}
            className={`lock-card ${door.isLocked ? 'locked' : 'unlocked'}`}
          >
            <div className="lock-card-header">
              <div className="lock-icon-circle">
                {door.isLocked ? <Lock size={22} /> : <Unlock size={22} />}
              </div>
              <div className="battery-status">
                <BatteryMedium size={16} />
                <span>{door.battery}%</span>
              </div>
            </div>

            <div className="lock-card-body">
              <h4 className="door-name">{door.name}</h4>
              <span className="door-location">{door.location}</span>
              <span className="last-unlock-info">Mở lần cuối: {door.lastUnlock}</span>
            </div>

            <div className="lock-card-footer">
              <button
                className={`btn-toggle-lock ${door.isLocked ? 'btn-unlock' : 'btn-lock'}`}
                onClick={() => handleToggle(door.id, door.isLocked)}
              >
                {door.isLocked ? 'Mở Khóa Chốt' : 'Khóa Chốt Ngay'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

