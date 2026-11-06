import React, { useState } from 'react';
import { useSmartHome } from '../../context/SmartHomeContext';
import { ThermostatDial } from './components/ThermostatDial';
import { SensorGauge } from './components/SensorGauge';
import { AirConditionerControl } from './components/AirConditionerControl';
import { AirQualityCard } from './components/AirQualityCard';
import './ClimatePage.css';

export const ClimatePage = () => {
  const {
    sensors,
    climate,
    updateAcSetting,
    toggleClimateDevice,
  } = useSmartHome();

  const [selectedZone, setSelectedZone] = useState('acLiving'); // 'acLiving' | 'acBedroom'

  const currentAc = climate[selectedZone] || climate.acLiving;
  const currentAmbientTemp =
    selectedZone === 'acLiving'
      ? sensors.livingRoom?.temp || 26.4
      : sensors.bedroom?.temp || 24.2;

  return (
    <div className="climate-page animate-fade-in">
      <div className="climate-page-header">
        <div>
          <h1 className="page-title">Quản Lý Nhiệt Độ, Độ Ẩm & Khí Hậu</h1>
          <p className="page-subtitle">
            Hệ thống điều hòa nhiệt độ Inverter thông minh, giám sát môi trường sống đa vùng
          </p>
        </div>

        {/* Zone switcher tabs */}
        <div className="zone-switcher glass-panel">
          <button
            className={`zone-tab-btn ${selectedZone === 'acLiving' ? 'active' : ''}`}
            onClick={() => setSelectedZone('acLiving')}
          >
            Phòng Khách ({sensors.livingRoom?.temp}°C)
          </button>
          <button
            className={`zone-tab-btn ${selectedZone === 'acBedroom' ? 'active' : ''}`}
            onClick={() => setSelectedZone('acBedroom')}
          >
            Phòng Ngủ Master ({sensors.bedroom?.temp}°C)
          </button>
        </div>
      </div>

      <div className="climate-main-grid">
        {/* Left Column: Dial & Air Quality */}
        <div className="climate-col-left">
          <ThermostatDial
            targetTemp={currentAc.targetTemp}
            ambientTemp={currentAmbientTemp}
            isOn={currentAc.isOn}
            mode={currentAc.mode}
            onTempChange={(newTemp) => updateAcSetting(selectedZone, 'targetTemp', newTemp)}
            onTogglePower={() => toggleClimateDevice(selectedZone)}
          />

          <AirQualityCard
            aqi={sensors.livingRoom?.aqi || 38}
            co2={sensors.livingRoom?.co2 || 450}
            purifierData={climate.airPurifier}
            onTogglePurifier={() => toggleClimateDevice('airPurifier')}
          />
        </div>

        {/* Right Column: AC Granular Controls & Multiple Room Gauges */}
        <div className="climate-col-right">
          <AirConditionerControl
            acData={currentAc}
            onUpdateSetting={(key, val) => updateAcSetting(selectedZone, key, val)}
            disabled={!currentAc.isOn}
          />

          <div className="gauges-section">
            <h3 className="section-title">Cảm Biến Môi Trường Theo Từng Khu Vực</h3>
            <div className="gauges-grid">
              <SensorGauge
                title="Phòng Khách"
                temp={sensors.livingRoom?.temp || 26.4}
                hum={sensors.livingRoom?.hum || 62}
                zoneKey="living"
              />
              <SensorGauge
                title="Phòng Ngủ Master"
                temp={sensors.bedroom?.temp || 24.2}
                hum={sensors.bedroom?.hum || 56}
                zoneKey="bedroom"
              />
              <SensorGauge
                title="Nhà Bếp & Bàn Ăn"
                temp={sensors.kitchen?.temp || 27.8}
                hum={sensors.kitchen?.hum || 68}
                zoneKey="kitchen"
              />
              <SensorGauge
                title="Khu Vực Ngoài Trời"
                temp={sensors.outdoor?.temp || 31.5}
                hum={sensors.outdoor?.hum || 74}
                zoneKey="outdoor"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

