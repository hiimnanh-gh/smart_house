import React from 'react';
import { useSmartHome } from '../../context/SmartHomeContext';
import { PacketTerminal } from './components/PacketTerminal';
import { GpioPinMatrix } from './components/GpioPinMatrix';
import { Cpu, Wifi, Activity, Terminal, ShieldAlert } from 'lucide-react';
import './IotDebugPage.css';

export const IotDebugPage = () => {
  const { addLog } = useSmartHome();

  const handleCommandSent = (cmd) => {
    addLog(`Đã gửi lệnh vi điều khiển: "${cmd}"`, 'info');
  };

  const handleGpioToggle = (pinName, state) => {
    addLog(`Đổi mức logic ${pinName} -> ${state ? 'HIGH' : 'LOW'}`, 'info');
  };

  return (
    <div className="iot-debug-page animate-fade-in">
      <div className="iot-debug-header">
        <div>
          <h1 className="page-title">Bảng Kiểm Thử Nhúng & Giao Thức IoT</h1>
          <p className="page-subtitle">
            Giám sát luồng gói tin Serial/MQTT, kiểm thử mức logic chân GPIO và tương tác trực tiếp với vi điều khiển
          </p>
        </div>
      </div>

      {/* Embedded Hardware KPIs */}
      <div className="mcu-specs-banner glass-panel">
        <div className="spec-item">
          <Cpu size={20} className="spec-icon esp" />
          <div className="spec-meta">
            <span className="spec-lbl">Chip vi điều khiển</span>
            <span className="spec-val">ESP32-S3 Dual-Core 240MHz</span>
          </div>
        </div>

        <div className="spec-divider"></div>

        <div className="spec-item">
          <Wifi size={20} className="spec-icon wifi" />
          <div className="spec-meta">
            <span className="spec-lbl">Tín hiệu WiFi RSSI</span>
            <span className="spec-val">-58 dBm (Tuyệt vời)</span>
          </div>
        </div>

        <div className="spec-divider"></div>

        <div className="spec-item">
          <Activity size={20} className="spec-icon heap" />
          <div className="spec-meta">
            <span className="spec-lbl">Bộ nhớ Free Heap RAM</span>
            <span className="spec-val">284 KB / 512 KB</span>
          </div>
        </div>
      </div>

      {/* Real-time Serial / MQTT Stream Console */}
      <PacketTerminal onSendCommand={handleCommandSent} />

      {/* GPIO Pinout Test Matrix */}
      <GpioPinMatrix onToggleGpio={handleGpioToggle} />
    </div>
  );
};

