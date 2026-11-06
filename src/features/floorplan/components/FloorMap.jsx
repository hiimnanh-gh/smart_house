import React from 'react';
import { ROOM_ZONES } from '../floorPlanService';
import { Lightbulb, Thermometer, Droplets, Tv, Wind, Maximize2 } from 'lucide-react';
import './FloorMap.css';

export const FloorMap = ({
  sensors,
  lights,
  devices,
  climate,
  selectedRoomId,
  onSelectRoom,
  onToggleLight,
}) => {
  return (
    <div className="floor-map-card glass-panel">
      <div className="floor-map-header">
        <div>
          <h3>Mặt Bằng Căn Hộ 2D Tương Tác</h3>
          <p>Nhấp vào từng phòng để xem chi tiết thiết bị & cảm biến tại chỗ</p>
        </div>
        <div className="map-legend">
          <span className="legend-item">
            <span className="legend-dot on"></span> Đèn đang bật
          </span>
          <span className="legend-item">
            <span className="legend-dot off"></span> Đèn đang tắt
          </span>
        </div>
      </div>

      <div className="floor-canvas-container">
        <div className="blueprint-grid">
          {ROOM_ZONES.map((zone) => {
            const isSelected = selectedRoomId === zone.id;
            const sensorData = sensors[zone.tempKey] || {};
            const roomLights = lights.filter((l) => l.room === zone.lightFilter);
            const activeLights = roomLights.filter((l) => l.isOn).length;

            return (
              <div
                key={zone.id}
                className={`room-zone-block ${isSelected ? 'selected' : ''}`}
                style={{
                  top: zone.y,
                  left: zone.x,
                  width: zone.width,
                  height: zone.height,
                  '--accent': zone.colorAccent,
                }}
                onClick={() => onSelectRoom(zone)}
              >
                <div className="zone-wall-border"></div>

                <div className="zone-info-top">
                  <span className="zone-title">{zone.name}</span>
                  <span className="zone-area-tag">{zone.area}</span>
                </div>

                {/* Sensor Telemetry Badges inside room */}
                <div className="zone-sensor-badges">
                  <div className="zone-badge temp">
                    <Thermometer size={13} />
                    <span>{sensorData.temp || 25}°C</span>
                  </div>
                  <div className="zone-badge hum">
                    <Droplets size={13} />
                    <span>{sensorData.hum || 60}%</span>
                  </div>
                </div>

                {/* Lights Hotspots */}
                <div className="zone-devices-layer">
                  <div className="light-nodes-wrap">
                    {roomLights.map((l) => (
                      <button
                        key={l.id}
                        className={`map-light-node ${l.isOn ? 'node-on' : 'node-off'}`}
                        style={{
                          '--bulb-color': l.isOn ? l.color : '#64748b',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLight(l.id);
                        }}
                        title={`${l.name} (${l.isOn ? 'BẬT' : 'TẮT'}) - Bấm để chuyển`}
                      >
                        <Lightbulb size={13} />
                      </button>
                    ))}
                  </div>

                  {zone.id === 'living' && climate.acLiving?.isOn && (
                    <div className="map-badge-ac">
                      <Wind size={12} className="spin-slow" />
                      <span>AC 24°C</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

