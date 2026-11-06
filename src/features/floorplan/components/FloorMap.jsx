import React, { useState } from 'react';
import { ROOM_ZONES } from '../floorPlanService';
import { Lightbulb, Thermometer, Droplets, Wind, Layers, Box, Compass } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState('3d'); // '2d' | '3d'
  const [showHeatmap, setShowHeatmap] = useState(false);

  return (
    <div className="floor-map-card glass-panel">
      <div className="floor-map-header">
        <div>
          <h3>Mặt Bằng Căn Hộ Tương Tác Không Gian 2D/3D</h3>
          <p>Mô hình kiến trúc không gian ba chiều với phản chiếu ánh sáng và luồng khí thực tế</p>
        </div>

        <div className="map-view-controls">
          <div className="view-mode-toggle">
            <button
              className={`mode-btn-pill ${viewMode === '2d' ? 'active' : ''}`}
              onClick={() => setViewMode('2d')}
            >
              <Layers size={14} /> Bản Vẽ 2D
            </button>
            <button
              className={`mode-btn-pill ${viewMode === '3d' ? 'active' : ''}`}
              onClick={() => setViewMode('3d')}
            >
              <Box size={14} /> Không Gian 3D
            </button>
          </div>

          <button
            className={`btn-heatmap-toggle ${showHeatmap ? 'active' : ''}`}
            onClick={() => setShowHeatmap(!showHeatmap)}
            title="Bật/Tắt bản đồ nhiệt độ"
          >
            <Compass size={14} /> Bản Đồ Nhiệt
          </button>
        </div>
      </div>

      <div className={`floor-canvas-container perspective-${viewMode} ${showHeatmap ? 'heatmap-active' : ''}`}>
        <div className="isometric-stage">
          <div className="blueprint-grid">
            {ROOM_ZONES.map((zone) => {
              const isSelected = selectedRoomId === zone.id;
              const sensorData = sensors[zone.tempKey] || {};
              const roomLights = lights.filter((l) => l.room === zone.lightFilter);
              const activeLights = roomLights.filter((l) => l.isOn);
              const hasActiveLight = activeLights.length > 0;
              const mainLightColor = hasActiveLight ? activeLights[0].color : 'transparent';

              return (
                <div
                  key={zone.id}
                  className={`room-zone-block ${isSelected ? 'selected' : ''} ${hasActiveLight ? 'light-illuminated' : ''}`}
                  style={{
                    top: zone.y,
                    left: zone.x,
                    width: zone.width,
                    height: zone.height,
                    '--accent': zone.colorAccent,
                    '--room-ambient-glow': mainLightColor,
                  }}
                  onClick={() => onSelectRoom(zone)}
                >
                  {/* 3D Extruded Wall Borders */}
                  <div className="wall-extrusion top-wall"></div>
                  <div className="wall-extrusion left-wall"></div>

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

                  {/* Lights & Devices Hotspots Layer */}
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
                          title={`${l.name} (${l.isOn ? 'BẬT' : 'TẮT'})`}
                        >
                          <Lightbulb size={13} />
                          {l.isOn && <span className="hologram-beacon"></span>}
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
    </div>
  );
};

