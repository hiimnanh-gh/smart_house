import React from 'react';
import { LightCard } from './LightCard';
import { calculateRoomLightingPower } from '../lightingService';
import './RoomLightingGroup.css';

export const RoomLightingGroup = ({
  roomName,
  lights,
  onToggleLight,
  onBrightnessChange,
  onSelectRgb,
  onToggleRoom,
}) => {
  const roomStats = calculateRoomLightingPower(lights, roomName);
  const isAllOn = roomStats.active === roomStats.total && roomStats.total > 0;

  return (
    <div className="room-lighting-group">
      <div className="group-header">
        <div className="group-title-info">
          <h3>{roomName}</h3>
          <span className="group-stats-badge">
            {roomStats.active}/{roomStats.total} đèn đang sáng • {roomStats.watt}W
          </span>
        </div>

        <div className="group-actions">
          <button
            className={`btn-room-toggle ${isAllOn ? 'btn-active' : ''}`}
            onClick={() => onToggleRoom(roomName, !isAllOn)}
          >
            {isAllOn ? 'Tắt Hết Đèn Phòng' : 'Bật Hết Đèn Phòng'}
          </button>
        </div>
      </div>

      <div className="lights-grid">
        {lights
          .filter((l) => l.room === roomName)
          .map((light) => (
            <LightCard
              key={light.id}
              light={light}
              onToggle={onToggleLight}
              onBrightnessChange={onBrightnessChange}
              onSelectRgb={onSelectRgb}
            />
          ))}
      </div>
    </div>
  );
};

