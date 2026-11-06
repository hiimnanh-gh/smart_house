import React, { useState } from 'react';
import { Wifi, Server, CheckCircle2, RefreshCw } from 'lucide-react';
import { DEFAULT_GATEWAY_CONFIG } from '../settingsService';
import './GatewayConfig.css';

export const GatewayConfig = () => {
  const [config, setConfig] = useState(DEFAULT_GATEWAY_CONFIG);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult({
        success: true,
        latency: '18ms',
        message: 'Kết nối MQTT Broker thành công! 34 thiết bị phản hồi',
      });
    }, 1200);
  };

  return (
    <div className="gateway-config-card glass-panel">
      <div className="gw-head">
        <div className="gw-title">
          <Server size={22} className="gw-icon" />
          <div>
            <h4>Cấu Hình Cổng Kết Nối MQTT & Zigbee Hub</h4>
            <p>Giao thức truyền thông hai chiều giữa Dashboard và vi điều khiển ESP32 / Arduino</p>
          </div>
        </div>
        <span className="badge-live">Gateway Hoạt Động</span>
      </div>

      <div className="gw-form-grid">
        <div className="gw-field">
          <label className="gw-label">Địa chỉ MQTT Broker (IP/Domain)</label>
          <input
            type="text"
            className="gw-input"
            value={config.brokerUrl}
            onChange={(e) => setConfig({ ...config, brokerUrl: e.target.value })}
          />
        </div>

        <div className="gw-field">
          <label className="gw-label">Cổng kết nối (Port)</label>
          <input
            type="number"
            className="gw-input"
            value={config.port}
            onChange={(e) => setConfig({ ...config, port: Number(e.target.value) })}
          />
        </div>

        <div className="gw-field">
          <label className="gw-label">Kênh sóng Zigbee 3.0</label>
          <input
            type="number"
            className="gw-input"
            value={config.zigbeeChannel}
            onChange={(e) => setConfig({ ...config, zigbeeChannel: Number(e.target.value) })}
          />
        </div>

        <div className="gw-field">
          <label className="gw-label">Phiên bản Firmware Hub</label>
          <input
            type="text"
            className="gw-input"
            value={config.firmwareVersion}
            disabled
          />
        </div>
      </div>

      {testResult && (
        <div className={`ping-result-box ${testResult.success ? 'success' : 'fail'}`}>
          <CheckCircle2 size={18} />
          <span>{testResult.message} (Độ trễ: {testResult.latency})</span>
        </div>
      )}

      <div className="gw-footer">
        <span className="uptime-text">Thời gian hoạt động liên tục: {config.uptime}</span>
        <button
          className="btn-test-ping"
          onClick={handleTestConnection}
          disabled={isTesting}
        >
          <RefreshCw size={15} className={isTesting ? 'spinning' : ''} />
          {isTesting ? 'Đang Kiểm Tra...' : 'Kiểm Tra Kết Nối (Ping)'}
        </button>
      </div>
    </div>
  );
};

