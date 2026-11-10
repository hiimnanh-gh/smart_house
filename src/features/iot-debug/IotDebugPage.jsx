import React from "react";
import { useSmartHome } from "../../context/SmartHomeContext";
import { HardwareConnector } from "./components/HardwareConnector";
import { PacketTerminal } from "./components/PacketTerminal";
import { GpioPinMatrix } from "./components/GpioPinMatrix";
import { iotBridge } from "../../services/iotBridgeService";
import { Cpu, Wifi, Activity } from "lucide-react";
import "./IotDebugPage.css";

export const IotDebugPage = () => {
  const {
    addLog,
    hardwareStatus,
    hardwareMeta,
    connectHardware,
    disconnectHardware,
  } = useSmartHome();

  const handleCommandSent = (cmd) => {
    addLog(`Đã gửi lệnh vi điều khiển: "${cmd}"`, "info");
  };

  const handleGpioToggle = (pinName, state) => {
    iotBridge.sendCommand("GPIO_WRITE", pinName, state ? 1 : 0);
    addLog(`Đổi mức logic ${pinName} -> ${state ? "HIGH" : "LOW"}`, "info");
  };

  return (
    <div className="iot-debug-page animate-fade-in">
      <div className="iot-debug-header">
        <div>
          <h1 className="page-title">
            Bảng Kiểm Thử Nhúng &amp; Giao Thức IoT
          </h1>
          <p className="page-subtitle">
            Kết nối WebSocket trực tiếp với ESP32, giám sát luồng gói tin và
            kiểm thử chân GPIO phần cứng
          </p>
        </div>
      </div>

      {/* Real Hardware WebSocket Connector */}
      <HardwareConnector
        hardwareStatus={hardwareStatus}
        defaultUrl={hardwareMeta.url}
        onConnect={connectHardware}
        onDisconnect={disconnectHardware}
      />

      {/* Embedded Hardware KPIs */}
      <div className="mcu-specs-banner glass-panel">
        <div className="spec-item">
          <Cpu size={20} className="spec-icon esp" />
          <div className="spec-meta">
            <span className="spec-lbl">Node vi điều khiển</span>
            <span className="spec-val">{hardwareMeta.node}</span>
          </div>
        </div>

        <div className="spec-divider"></div>

        <div className="spec-item">
          <Wifi size={20} className="spec-icon wifi" />
          <div className="spec-meta">
            <span className="spec-lbl">Tín hiệu WiFi RSSI</span>
            <span className="spec-val">{hardwareMeta.rssi} dBm</span>
          </div>
        </div>

        <div className="spec-divider"></div>

        <div className="spec-item">
          <Activity size={20} className="spec-icon heap" />
          <div className="spec-meta">
            <span className="spec-lbl">Bộ nhớ Free Heap RAM</span>
            <span className="spec-val">
              {hardwareMeta.freeHeap} KB / 512 KB
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Serial / WebSocket Stream Console */}
      <PacketTerminal
        hardwareStatus={hardwareStatus}
        onSendCommand={handleCommandSent}
      />

      {/* GPIO Pinout Test Matrix */}
      <GpioPinMatrix onToggleGpio={handleGpioToggle} />
    </div>
  );
};
