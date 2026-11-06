import React from 'react';
import { Sun, BatteryCharging, Zap, Home, ArrowRight, ArrowDown } from 'lucide-react';
import './PowerFlowDiagram.css';

export const PowerFlowDiagram = ({ currentConsumption = 1.68 }) => {
  const solarProduction = 3.85; // kW
  const batteryLevel = 86; // %
  const gridExport = +(solarProduction - currentConsumption - 0.8).toFixed(2); // kW

  return (
    <div className="power-flow-card glass-panel">
      <div className="flow-card-header">
        <div>
          <h3>Sơ Đồ Dòng Năng Lượng & Điện Mặt Trời Hybrid</h3>
          <p>Hệ thống giám sát vi lưới điện Microgrid (Solar + Pin Lưu Trữ + Lưới EVN)</p>
        </div>
        <span className="badge-live">Tự Chủ Năng Lượng 92%</span>
      </div>

      <div className="flow-diagram-canvas">
        {/* Top: Solar Panels */}
        <div className="node-wrapper solar-node">
          <div className="flow-node solar">
            <Sun size={26} className="sun-icon-spin" />
            <div className="node-info">
              <span className="node-title">Pin Mặt Trời</span>
              <span className="node-power">+{solarProduction} kW</span>
            </div>
          </div>
          <div className="energy-pipe pipe-down">
            <span className="energy-particle particle-down"></span>
          </div>
        </div>

        {/* Middle Hub: Hybrid Inverter */}
        <div className="middle-flow-row">
          {/* Left: Battery */}
          <div className="node-wrapper battery-node">
            <div className="flow-node battery">
              <BatteryCharging size={26} className="battery-icon" />
              <div className="node-info">
                <span className="node-title">Pin Lưu Trữ (ESS)</span>
                <span className="node-power">{batteryLevel}% (Đang nạp 0.8kW)</span>
              </div>
            </div>
            <div className="energy-pipe pipe-right">
              <span className="energy-particle particle-right"></span>
            </div>
          </div>

          {/* Center: Inverter */}
          <div className="flow-node inverter-center">
            <div className="inverter-core">
              <Zap size={28} className="zap-pulse" />
              <span className="inverter-text">Biến Tần Hybrid 5kW</span>
            </div>
          </div>

          {/* Right: Grid */}
          <div className="node-wrapper grid-node">
            <div className="energy-pipe pipe-left">
              <span className="energy-particle particle-left"></span>
            </div>
            <div className="flow-node grid">
              <div className="node-info">
                <span className="node-title">Lưới Điện EVN</span>
                <span className="node-power">Phát lưới: {gridExport} kW</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Home Consumption */}
        <div className="node-wrapper home-node">
          <div className="energy-pipe pipe-down-home">
            <span className="energy-particle particle-down"></span>
          </div>
          <div className="flow-node home">
            <Home size={26} className="home-icon" />
            <div className="node-info">
              <span className="node-title">Phụ Tải Toàn Nhà</span>
              <span className="node-power highlight">Tiêu thụ: {currentConsumption} kW</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

