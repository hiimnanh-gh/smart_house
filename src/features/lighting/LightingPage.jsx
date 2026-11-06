import React, { useState } from 'react';
import { useSmartHome } from '../../context/SmartHomeContext';
import { RoomLightingGroup } from './components/RoomLightingGroup';
import { RgbColorPicker } from './components/RgbColorPicker';
import { Modal } from '../../components/common/Modal';
import { Lightbulb, Zap, SlidersHorizontal, Sun } from 'lucide-react';
import './LightingPage.css';

export const LightingPage = () => {
  const {
    lights,
    toggleLight,
    updateLightBrightness,
    updateLightColor,
    toggleAllLightsInRoom,
  } = useSmartHome();

  const [rgbModalLight, setRgbModalLight] = useState(null);
  const [selectedRoomFilter, setSelectedRoomFilter] = useState('ALL');

  const roomsList = Array.from(new Set(lights.map((l) => l.room)));

  const totalLights = lights.length;
  const activeLights = lights.filter((l) => l.isOn).length;
  const totalLightingWatts = lights.reduce(
    (sum, l) => (l.isOn ? sum + Math.round((l.watt * l.brightness) / 100) : sum),
    0
  );

  const filteredRooms =
    selectedRoomFilter === 'ALL'
      ? roomsList
      : roomsList.filter((r) => r === selectedRoomFilter);

  const handleTurnAllOn = () => {
    lights.forEach((l) => {
      if (!l.isOn) toggleLight(l.id);
    });
  };

  const handleTurnAllOff = () => {
    lights.forEach((l) => {
      if (l.isOn) toggleLight(l.id);
    });
  };

  return (
    <div className="lighting-page animate-fade-in">
      <div className="lighting-page-header">
        <div>
          <h1 className="page-title">Hệ Thống Chiếu Sáng Thông Minh</h1>
          <p className="page-subtitle">
            Quản lý bóng đèn LED, đèn chùm, điều chỉnh độ sáng Dimmer và màu sắc dải LED RGB
          </p>
        </div>

        <div className="header-master-actions">
          <button className="btn-master-action on" onClick={handleTurnAllOn}>
            <Sun size={16} /> Bật Toàn Bộ ({totalLights})
          </button>
          <button className="btn-master-action off" onClick={handleTurnAllOff}>
            Tắt Toàn Bộ
          </button>
        </div>
      </div>

      {/* Lighting Metrics Banner */}
      <div className="lighting-stats-banner glass-panel">
        <div className="stat-pill-item">
          <Lightbulb size={20} className="stat-pill-icon light-active" />
          <div className="stat-pill-data">
            <span className="stat-pill-label">Bóng đèn đang bật</span>
            <span className="stat-pill-value">
              {activeLights} <span className="stat-pill-sub">/ {totalLights}</span>
            </span>
          </div>
        </div>

        <div className="stat-pill-divider"></div>

        <div className="stat-pill-item">
          <Zap size={20} className="stat-pill-icon power" />
          <div className="stat-pill-data">
            <span className="stat-pill-label">Công suất chiếu sáng</span>
            <span className="stat-pill-value">{totalLightingWatts} W</span>
          </div>
        </div>

        <div className="stat-pill-divider"></div>

        <div className="stat-pill-item">
          <SlidersHorizontal size={20} className="stat-pill-icon dimmer" />
          <div className="stat-pill-data">
            <span className="stat-pill-label">Độ sáng trung bình</span>
            <span className="stat-pill-value">
              {activeLights > 0
                ? Math.round(
                    lights
                      .filter((l) => l.isOn)
                      .reduce((sum, l) => sum + l.brightness, 0) / activeLights
                  )
                : 0}
              %
            </span>
          </div>
        </div>
      </div>

      {/* Filter by Room */}
      <div className="room-filters-bar">
        <button
          className={`filter-btn ${selectedRoomFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => setSelectedRoomFilter('ALL')}
        >
          Tất Cả Khu Vực ({lights.length})
        </button>
        {roomsList.map((room) => {
          const count = lights.filter((l) => l.room === room).length;
          return (
            <button
              key={room}
              className={`filter-btn ${selectedRoomFilter === room ? 'active' : ''}`}
              onClick={() => setSelectedRoomFilter(room)}
            >
              {room} ({count})
            </button>
          );
        })}
      </div>

      {/* Groups by Room */}
      <div className="lighting-groups-container">
        {filteredRooms.map((room) => (
          <RoomLightingGroup
            key={room}
            roomName={room}
            lights={lights}
            onToggleLight={toggleLight}
            onBrightnessChange={updateLightBrightness}
            onSelectRgb={(light) => setRgbModalLight(light)}
            onToggleRoom={toggleAllLightsInRoom}
          />
        ))}
      </div>

      {/* RGB Modal */}
      <Modal
        isOpen={Boolean(rgbModalLight)}
        onClose={() => setRgbModalLight(null)}
        title="Tùy Chỉnh Màu Sắc Đèn LED RGB"
      >
        <RgbColorPicker
          currentLight={rgbModalLight}
          onApplyColor={updateLightColor}
          onClose={() => setRgbModalLight(null)}
        />
      </Modal>
    </div>
  );
};

