import React from 'react';
import { useSmartHome } from '../../context/SmartHomeContext';
import { GatewayConfig } from './components/GatewayConfig';
import { SensorThresholds } from './components/SensorThresholds';
import { ShieldCheck, HardDrive, Wifi, Sliders } from 'lucide-react';
import './SettingsPage.css';

export const SettingsPage = () => {
  const { addLog } = useSmartHome();

  return (
    <div className="settings-page animate-fade-in">
      <div className="settings-page-header">
        <div>
          <h1 className="page-title">Cấu Hình Hệ Thống & Gateway Hub</h1>
          <p className="page-subtitle">
            Quản trị kết nối mạng vi điều khiển, giao thức IoT và thông số hoạt động của toàn bộ ngôi nhà
          </p>
        </div>
      </div>

      <div className="settings-sections">
        <GatewayConfig />
        <SensorThresholds onSaveNotify={(msg) => addLog(msg, 'success')} />
      </div>
    </div>
  );
};

