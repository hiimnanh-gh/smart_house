import React, { useState } from 'react';
import { useSmartHome } from '../../context/SmartHomeContext';
import { PowerFlowDiagram } from './components/PowerFlowDiagram';
import { SensorSplineChart } from './components/SensorSplineChart';
import { generateHistoricalTelemetry, exportTelemetryToCsv } from './analyticsService';
import { Download, TrendingUp, Cpu, Flame, Droplets, Zap } from 'lucide-react';
import './AnalyticsPage.css';

export const AnalyticsPage = () => {
  const { sensors, addLog } = useSmartHome();
  const [telemetryData] = useState(() => generateHistoricalTelemetry());

  const handleExport = () => {
    exportTelemetryToCsv(telemetryData);
    addLog('Đã trích xuất dữ liệu cảm biến IoT 24 giờ ra tệp tin CSV', 'success');
  };

  return (
    <div className="analytics-page animate-fade-in">
      <div className="analytics-page-header">
        <div>
          <h1 className="page-title">Phân Tích Năng Lượng & Dữ Liệu Cảm Biến</h1>
          <p className="page-subtitle">
            Báo cáo vi lưới điện mặt trời Hybrid, biểu đồ sóng thời gian thực và trích xuất dữ liệu
          </p>
        </div>

        <button className="btn-export-csv" onClick={handleExport}>
          <Download size={16} /> Xuất Dữ Liệu CSV
        </button>
      </div>

      {/* Microgrid Solar & Battery Flow */}
      <PowerFlowDiagram currentConsumption={sensors.power?.currentKw || 1.68} />

      {/* 24-Hour Telemetry Spline Chart */}
      <SensorSplineChart telemetryData={telemetryData} />

      {/* Historical Stat Aggregates */}
      <div className="aggregates-grid">
        <div className="agg-card glass-panel">
          <div className="agg-icon-box rose">
            <Flame size={20} />
          </div>
          <div className="agg-info">
            <span className="agg-lbl">Nhiệt độ đỉnh 24h</span>
            <span className="agg-val">31.2°C (12:45 trưa)</span>
          </div>
        </div>

        <div className="agg-card glass-panel">
          <div className="agg-icon-box cyan">
            <Droplets size={20} />
          </div>
          <div className="agg-info">
            <span className="agg-lbl">Độ ẩm trung bình ngày</span>
            <span className="agg-val">68% (Đạt chuẩn)</span>
          </div>
        </div>

        <div className="agg-card glass-panel">
          <div className="agg-icon-box amber">
            <Zap size={20} />
          </div>
          <div className="agg-info">
            <span className="agg-lbl">Sản lượng Solar trong ngày</span>
            <span className="agg-val">22.4 kWh (+14% so TB)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

