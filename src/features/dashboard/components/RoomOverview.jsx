import React from 'react';
import { Sofa, Bed, UtensilsCrossed, Trees, Thermometer, Droplets, Lightbulb } from 'lucide-react';
import './RoomOverview.css';

export const RoomOverview = ({ lights, sensors, onToggleRoomLights }) => {
  const rooms = [
    {
      id: 'living',
      name: 'Phòng Khách',
      icon: Sofa,
      temp: sensors.livingRoom?.temp || 26.4,
      hum: sensors.livingRoom?.hum || 62,
      lights: lights.filter((l) => l.room === 'Phòng khách'),
    },
    {
      id: 'bed',
      name: 'Phòng Ngủ Master',
      icon: Bed,
      temp: sensors.bedroom?.temp || 24.2,
      hum: sensors.bedroom?.hum || 56,
      lights: lights.filter((l) => l.room === 'Phòng ngủ'),
    },
    {
      id: 'kitchen',
      name: 'Bếp & Phòng Ăn',
      icon: UtensilsCrossed,
      temp: sensors.kitchen?.temp || 27.8,
      hum: sensors.kitchen?.hum || 68,
      lights: lights.filter((l) => l.room === 'Nhà bếp'),
    },
    {
      id: 'garden',
      name: 'Sân Vườn & Cổng',
      icon: Trees,
      temp: sensors.outdoor?.temp || 31.5,
      hum: sensors.outdoor?.hum || 74,
      lights: lights.filter((l) => l.room === 'Sân vườn'),
    },
  ];

  return (
    <div className="room-overview-section">
      <div className="section-title-wrap">
        <h3>Các Khu Vực Trong Nhà</h3>
        <p>Theo dõi nhiệt độ, độ ẩm và trạng thái đèn theo từng phòng</p>
      </div>

      <div className="rooms-grid">
        {rooms.map((room) => {
          const Icon = room.icon;
          const activeLights = room.lights.filter((l) => l.isOn).length;
          const allLightsOn = room.lights.length > 0 && activeLights === room.lights.length;

          return (
            <div key={room.id} className="room-card glass-panel">
              <div className="room-card-head">
                <div className="room-badge-box">
                  <Icon size={20} className="room-badge-icon" />
                  <span className="room-name">{room.name}</span>
                </div>
                {room.lights.length > 0 && (
                  <button
                    className={`room-quick-light-btn ${activeLights > 0 ? 'lights-on' : ''}`}
                    onClick={() => onToggleRoomLights(room.name, !allLightsOn)}
                    title={allLightsOn ? 'Tắt toàn bộ đèn phòng này' : 'Bật toàn bộ đèn phòng này'}
                  >
                    <Lightbulb size={15} />
                    <span>{activeLights}/{room.lights.length} đèn</span>
                  </button>
                )}
              </div>

              <div className="room-metrics">
                <div className="room-sensor-pill">
                  <Thermometer size={15} className="pill-icon temp-icon" />
                  <span className="pill-text">{room.temp}°C</span>
                </div>
                <div className="room-sensor-pill">
                  <Droplets size={15} className="pill-icon hum-icon" />
                  <span className="pill-text">{room.hum}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

