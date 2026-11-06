import React from 'react';
import {
  Thermometer,
  Droplets,
  Wind,
  Zap,
  Lightbulb,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { useSmartHome } from '../../context/SmartHomeContext';
import { StatCard } from '../../components/common/StatCard';
import { QuickControls } from './components/QuickControls';
import { WeatherWidget } from './components/WeatherWidget';
import { EnergyConsumption } from './components/EnergyConsumption';
import { RoomOverview } from './components/RoomOverview';
import { calculateOverviewStats, getAqiLevel } from './dashboardService';
import './DashboardPage.css';

export const DashboardPage = () => {
  const {
    sensors,
    lights,
    climate,
    devices,
    security,
    toggleLight,
    toggleClimateDevice,
    toggleDoorLock,
    toggleDevice,
    toggleAllLightsInRoom,
  } = useSmartHome();

  const stats = calculateOverviewStats(lights, devices, climate, sensors);
  const aqiInfo = getAqiLevel(sensors.livingRoom?.aqi || 42);

  return (
    <div className="dashboard-page animate-fade-in">
      {/* Top Banner / Welcome */}
      <div className="dashboard-welcome">
        <div>
          <h1 className="page-title">Bảng Điều Khiển Trung Tâm</h1>
          <p className="page-subtitle">
            Hệ thống nhà thông minh vận hành tự động • <span className="highlight-text">{stats.activeLightsCount} đèn</span> và <span className="highlight-text">{stats.activeDevicesCount} thiết bị</span> đang bật
          </p>
        </div>
        <div className="system-health-pill">
          <span className="badge-live">Hệ Thống Trực Tuyến</span>
        </div>
      </div>

      {/* Primary Telemetry Stat Cards */}
      <div className="stats-grid">
        <StatCard
          icon={Thermometer}
          title="Nhiệt Độ Phòng Khách"
          value={sensors.livingRoom?.temp || 26.4}
          unit="°C"
          color="rose"
          subtext="Mục tiêu điều hòa: 24.0°C"
          trend={{ text: 'Mát mẻ', type: 'positive' }}
        />

        <StatCard
          icon={Droplets}
          title="Độ Ẩm Không Khí"
          value={sensors.livingRoom?.hum || 62}
          unit="%"
          color="cyan"
          subtext="Ngưỡng lý tưởng (50% - 65%)"
          trend={{ text: 'Lý tưởng', type: 'positive' }}
        />

        <StatCard
          icon={Wind}
          title="Chất Lượng Không Khí AQI"
          value={sensors.livingRoom?.aqi || 38}
          unit="AQI"
          color={aqiInfo.color}
          subtext="Máy lọc khí HEPA đang chạy"
          trend={{ text: aqiInfo.label, type: aqiInfo.status }}
        />

        <StatCard
          icon={Zap}
          title="Công Suất Tiêu Thụ"
          value={sensors.power?.currentKw || 1.68}
          unit="kW"
          color="amber"
          subtext={`Đã dùng hôm nay: ${sensors.power?.dailyKwh || 14.8} kWh`}
          trend={{ text: 'Tiết kiệm', type: 'positive' }}
        />
      </div>

      {/* Main Grid: Quick Controls & Weather/Energy */}
      <div className="dashboard-main-grid">
        <div className="dashboard-col-main">
          <QuickControls
            lights={lights}
            onToggleLight={toggleLight}
            climate={climate}
            onToggleClimate={toggleClimateDevice}
            security={security}
            onToggleDoorLock={toggleDoorLock}
            devices={devices}
            onToggleDevice={toggleDevice}
          />

          <RoomOverview
            lights={lights}
            sensors={sensors}
            onToggleRoomLights={toggleAllLightsInRoom}
          />
        </div>

        <div className="dashboard-col-side">
          <WeatherWidget outdoorData={sensors.outdoor} />
          <EnergyConsumption powerData={sensors.power} currentKw={sensors.power?.currentKw || 1.68} />
        </div>
      </div>
    </div>
  );
};

