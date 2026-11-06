import React, { useState } from 'react';
import { useSmartHome } from '../../context/SmartHomeContext';
import { FloorMap } from './components/FloorMap';
import { ROOM_ZONES } from './floorPlanService';
import { Lightbulb, Tv2, Wind, Droplets, Thermometer, Sliders } from 'lucide-react';
import { ToggleSwitch } from '../../components/common/ToggleSwitch';
import { RangeSlider } from '../../components/common/RangeSlider';
import './FloorPlanPage.css';

export const FloorPlanPage = () => {
  const {
    sensors,
    lights,
    devices,
    climate,
    toggleLight,
    updateLightBrightness,
    toggleDevice,
    toggleClimateDevice,
  } = useSmartHome();

  const [selectedZone, setSelectedZone] = useState(ROOM_ZONES[0]);

  const zoneLights = lights.filter((l) => l.room === selectedZone.lightFilter);
  const zoneDevices = devices.filter((d) => d.room === selectedZone.deviceFilter);
  const zoneSensor = sensors[selectedZone.tempKey] || {};

  return (
    <div className="floorplan-page animate-fade-in">
      <div className="floorplan-page-header">
        <div>
          <h1 className="page-title">Mặt Bằng Nhà 2D/3D & Không Gian Thực Tế</h1>
          <p className="page-subtitle">
            Mô phỏng kiến trúc căn hộ trực quan, giám sát và điều khiển thiết bị tại chỗ theo vị trí thực tế
          </p>
        </div>
      </div>

      <div className="floorplan-main-layout">
        {/* Left: Interactive 2D Map */}
        <div className="map-view-column">
          <FloorMap
            sensors={sensors}
            lights={lights}
            devices={devices}
            climate={climate}
            selectedRoomId={selectedZone.id}
            onSelectRoom={(zone) => setSelectedZone(zone)}
            onToggleLight={toggleLight}
          />
        </div>

        {/* Right: Selected Room Live Hub Panel */}
        <div className="room-inspector-column glass-panel">
          <div className="inspector-head">
            <div>
              <span className="inspector-badge">Đang Chọn Khu Vực</span>
              <h3 className="inspector-room-name">{selectedZone.name}</h3>
              <span className="inspector-area">Diện tích: {selectedZone.area}</span>
            </div>
          </div>

          {/* Quick Metrics of Room */}
          <div className="inspector-metrics-grid">
            <div className="ins-metric-item">
              <Thermometer size={16} className="metric-icon temp" />
              <div>
                <span className="ins-val">{zoneSensor.temp || 26}°C</span>
                <span className="ins-lbl">Nhiệt độ</span>
              </div>
            </div>

            <div className="ins-metric-item">
              <Droplets size={16} className="metric-icon hum" />
              <div>
                <span className="ins-val">{zoneSensor.hum || 62}%</span>
                <span className="ins-lbl">Độ ẩm</span>
              </div>
            </div>
          </div>

          {/* Lights in this room */}
          <div className="inspector-devices-group">
            <h4 className="group-title">
              <Lightbulb size={16} /> Đèn trong phòng ({zoneLights.length})
            </h4>
            <div className="ins-items-list">
              {zoneLights.length === 0 ? (
                <span className="no-items-text">Không có đèn ở khu vực này</span>
              ) : (
                zoneLights.map((light) => (
                  <div key={light.id} className="ins-device-row">
                    <div className="ins-row-left">
                      <span className="ins-dev-name">{light.name}</span>
                      <span className="ins-dev-status">
                        {light.isOn ? `Đang bật (${light.brightness}%)` : 'Tắt'}
                      </span>
                    </div>
                    <ToggleSwitch
                      size="sm"
                      checked={light.isOn}
                      onChange={() => toggleLight(light.id)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Appliances in this room */}
          <div className="inspector-devices-group">
            <h4 className="group-title">
              <Tv2 size={16} /> Thiết bị phụ tải ({zoneDevices.length})
            </h4>
            <div className="ins-items-list">
              {zoneDevices.length === 0 ? (
                <span className="no-items-text">Không có thiết bị phụ tải</span>
              ) : (
                zoneDevices.map((dev) => (
                  <div key={dev.id} className="ins-device-row">
                    <div className="ins-row-left">
                      <span className="ins-dev-name">{dev.name}</span>
                      <span className="ins-dev-status">{dev.statusText}</span>
                    </div>
                    <ToggleSwitch
                      size="sm"
                      checked={dev.isOn}
                      onChange={() => toggleDevice(dev.id)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

