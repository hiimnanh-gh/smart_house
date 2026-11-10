import React, { useState, useRef, useEffect } from 'react';
import {
  Bluetooth,
  BluetoothConnected,
  BluetoothOff,
  Radio,
  Trash2,
  AlertTriangle,
  Terminal,
  Cpu,
  Hand,
  Ruler,
  Activity,
  Pause,
  Play,
  Code2,
} from 'lucide-react';
import { useSmartHome } from '../../context/SmartHomeContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { sound } from '../../utils/soundEffects';
import {
  BLE_CONFIG,
  decodeBleDataView,
  isWebBluetoothSupported,
  parseStickEmPayload,
} from './bleStickEmService';
import './BleStickEmPage.css';

export const BleStickEmPage = () => {
  const { addLog } = useSmartHome();

  const [status, setStatus] = useState('Chưa kết nối');
  const [connectionState, setConnectionState] = useState('inactive'); // 'inactive' | 'warning' | 'active' | 'danger'
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [parsedPayload, setParsedPayload] = useState(null);
  const [rawData, setRawData] = useState('');
  const [hexData, setHexData] = useState('');
  const [dataHistory, setDataHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('log'); // 'log' | 'raw'
  const [isLogPaused, setIsLogPaused] = useState(false);

  const deviceRef = useRef(null);
  const charRef = useRef(null);
  const rxBufferRef = useRef('');
  const isLogPausedRef = useRef(false);

  useEffect(() => {
    isLogPausedRef.current = isLogPaused;
  }, [isLogPaused]);

  const applyDecodedPacket = (text, hexStr) => {
    const parsed = parseStickEmPayload(text);
    setRawData(text || hexStr);
    setHexData(hexStr);
    setParsedPayload(parsed);

    if (!isLogPausedRef.current) {
      setDataHistory((prev) => [
        {
          id: Date.now() + Math.random(),
          time: new Date().toLocaleTimeString('vi-VN'),
          summary: parsed.summaryText || text || hexStr,
          isJson: parsed.isJson,
        },
        ...prev.slice(0, 29),
      ]);
    }
  };

  const handleCharacteristicChanged = (event) => {
    const { text, hexStr } = decodeBleDataView(event.target.value);

    // Xử lý gói tin JSON hoàn chỉnh hoặc bị phân mảnh qua BLE MTU
    if (text.startsWith('{') && !text.endsWith('}')) {
      rxBufferRef.current = text;
      return;
    }

    if (rxBufferRef.current) {
      const combined = rxBufferRef.current + text;
      if (combined.endsWith('}') || combined.length > 512) {
        rxBufferRef.current = '';
        applyDecodedPacket(combined, hexStr);
      } else {
        rxBufferRef.current = combined;
      }
      return;
    }

    applyDecodedPacket(text, hexStr);
  };

  const handleDisconnected = () => {
    setStatus('Mất kết nối Bluetooth!');
    setConnectionState('danger');
    rxBufferRef.current = '';
    addLog("Bluetooth Stick 'Em bị ngắt kết nối", 'warning');
  };

  useEffect(() => {
    return () => {
      if (charRef.current) {
        charRef.current.removeEventListener(
          'characteristicvaluechanged',
          handleCharacteristicChanged
        );
      }
      if (deviceRef.current) {
        deviceRef.current.removeEventListener(
          'gattserverdisconnected',
          handleDisconnected
        );
        if (deviceRef.current.gatt?.connected) {
          deviceRef.current.gatt.disconnect();
        }
      }
    };
  }, []);

  const connectDevice = async () => {
    if (!isWebBluetoothSupported()) {
      setStatus(
        'Trình duyệt không hỗ trợ Web Bluetooth (hãy dùng Chrome/Edge trên HTTPS hoặc localhost).'
      );
      setConnectionState('danger');
      return;
    }

    try {
      sound.playClick();
      setStatus('Đang tìm thiết bị...');
      setConnectionState('warning');
      rxBufferRef.current = '';

      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [BLE_CONFIG.SERVICE_UUID],
      });

      deviceRef.current = device;
      setDeviceInfo({
        name: device.name || 'Thiết bị BLE không tên',
        id: device.id,
      });

      setStatus(`Đang kết nối tới ${device.name || 'thiết bị'}...`);
      device.addEventListener('gattserverdisconnected', handleDisconnected);

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(BLE_CONFIG.SERVICE_UUID);
      const characteristic = await service.getCharacteristic(BLE_CONFIG.NOTIFY_CHAR_UUID);
      charRef.current = characteristic;

      await characteristic.startNotifications();
      characteristic.addEventListener(
        'characteristicvaluechanged',
        handleCharacteristicChanged
      );

      const connectedName = device.name || device.id;
      setStatus(`Đã kết nối với ${connectedName}`);
      setConnectionState('active');
      sound.playSuccess();
      addLog(`Đã kết nối BLE thành công tới ${connectedName}`, 'success');
    } catch (err) {
      setStatus(`Lỗi: ${err.message}`);
      setConnectionState('danger');
    }
  };

  const disconnectDevice = () => {
    sound.playClick();
    if (charRef.current) {
      charRef.current.removeEventListener(
        'characteristicvaluechanged',
        handleCharacteristicChanged
      );
      charRef.current = null;
    }
    if (deviceRef.current) {
      deviceRef.current.removeEventListener(
        'gattserverdisconnected',
        handleDisconnected
      );
      if (deviceRef.current.gatt?.connected) {
        deviceRef.current.gatt.disconnect();
      }
      deviceRef.current = null;
    }
    rxBufferRef.current = '';
    setStatus('Đã ngắt kết nối');
    setConnectionState('inactive');
    setDeviceInfo(null);
    addLog("Đã ngắt kết nối BLE Stick 'Em", 'info');
  };

  const clearHistory = () => {
    sound.playClick();
    setDataHistory([]);
  };

  const isConnected = connectionState === 'active';
  const metaEntries = Object.entries(parsedPayload?.meta || {});

  return (
    <div className="ble-stickem-page animate-fade-in">
      {/* Page Header */}
      <div className="ble-page-header">
        <div>
          <h1 className="page-title">Bộ Giám Sát Stick 'Em (BLE)</h1>
          <p className="page-subtitle">
            Giải mã trực quan dữ liệu cảm biến thời gian thực qua Web Bluetooth GATT
          </p>
        </div>
        <StatusBadge status={connectionState} text={status} size="md" />
      </div>

      {!isWebBluetoothSupported() && (
        <div className="ble-warning-banner glass-panel">
          <AlertTriangle size={20} className="warning-icon" />
          <div>
            <strong>Trình duyệt chưa hỗ trợ Web Bluetooth API.</strong>
            <p>Vui lòng mở bằng Google Chrome hoặc Microsoft Edge qua localhost hoặc HTTPS.</p>
          </div>
        </div>
      )}

      {/* Compact Connection & Device Info Bar */}
      <div className="ble-control-card glass-panel">
        <div className="ble-control-top">
          <div className="ble-device-summary">
            <div className={`ble-icon-circle ${isConnected ? 'connected' : ''}`}>
              {isConnected ? <BluetoothConnected size={24} /> : <Bluetooth size={24} />}
            </div>
            <div>
              <div className="device-title-row">
                <h3>{deviceInfo ? deviceInfo.name : "Chưa kết nối kit Stick 'Em"}</h3>
                {metaEntries.map(([k, v]) => (
                  <span key={k} className="meta-pill">
                    {k}: <strong>{String(v)}</strong>
                  </span>
                ))}
              </div>
              <p className="ble-uuid-meta">
                GATT Service <code>0xFFE0</code> • Notify <code>0xFFE2</code>
              </p>
            </div>
          </div>

          <div className="ble-action-buttons">
            <button className="btn-ble-connect" onClick={connectDevice}>
              <Radio size={16} />
              {isConnected ? 'Đổi Thiết Bị' : 'Kết Nối Thiết Bị'}
            </button>

            {isConnected && (
              <button className="btn-ble-disconnect" onClick={disconnectDevice}>
                <BluetoothOff size={16} />
                Ngắt Kết Nối
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Clean Parsed Sensor Cards */}
      <div className="ble-sensors-section">
        <div className="section-heading-row">
          <h3>Thông Số Cảm Biến Trực Tiếp</h3>
          <span className="sensor-count-hint">
            {parsedPayload?.isJson
              ? `${parsedPayload.sensors.length} cảm biến đang nhận`
              : 'Đang chờ khung dữ liệu JSON'}
          </span>
        </div>

        {!parsedPayload ? (
          <div className="ble-empty-sensors glass-panel">
            <Activity size={28} className="empty-icon" />
            <div>
              <h4>Chưa có dữ liệu cảm biến</h4>
              <p>Bấm &quot;Kết Nối Thiết Bị&quot; và chọn kit Stick &apos;Em để hiển thị thông số trực quan tại đây.</p>
            </div>
          </div>
        ) : parsedPayload.isJson && parsedPayload.sensors.length > 0 ? (
          <div className="ble-sensors-grid">
            {parsedPayload.sensors.map((sensor) => {
              if (sensor.type === 'touch') {
                const isTouched = Boolean(sensor.value);
                return (
                  <div
                    key={sensor.key}
                    className={`ble-sensor-card glass-panel touch-card ${
                      isTouched ? 'touched' : ''
                    }`}
                  >
                    <div className="sensor-card-top">
                      <span className="sensor-label">{sensor.label}</span>
                      <div className="sensor-icon-wrap touch">
                        <Hand size={18} />
                      </div>
                    </div>
                    <div className="touch-state-display">
                      <span className="touch-badge">
                        {isTouched ? 'ĐANG CHẠM' : 'CHƯA CHẠM'}
                      </span>
                      <span className="sensor-raw-num">Giá trị: {String(sensor.value)}</span>
                    </div>
                  </div>
                );
              }

              if (sensor.type === 'distance') {
                const numericVal = Number(sensor.value) || 0;
                const pct = Math.min(100, Math.max(0, (numericVal / sensor.max) * 100));
                return (
                  <div
                    key={sensor.key}
                    className="ble-sensor-card glass-panel distance-card"
                  >
                    <div className="sensor-card-top">
                      <span className="sensor-label">{sensor.label}</span>
                      <div className="sensor-icon-wrap distance">
                        <Ruler size={18} />
                      </div>
                    </div>
                    <div className="distance-value-row">
                      <span className="sensor-big-val">{numericVal}</span>
                      <span className="sensor-unit">{sensor.unit}</span>
                    </div>
                    <div className="distance-bar-track">
                      <div
                        className="distance-bar-fill"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={sensor.key} className="ble-sensor-card glass-panel">
                  <div className="sensor-card-top">
                    <span className="sensor-label">{sensor.label}</span>
                    <div className="sensor-icon-wrap default">
                      <Cpu size={18} />
                    </div>
                  </div>
                  <div className="distance-value-row">
                    <span className="sensor-big-val">{String(sensor.value)}</span>
                    {sensor.unit && <span className="sensor-unit">{sensor.unit}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="ble-plain-card glass-panel">
            <span className="plain-label">Dữ liệu văn bản thô</span>
            <p className="plain-value">{rawData}</p>
          </div>
        )}
      </div>

      {/* Tabbed Log & Raw Inspector Panel */}
      <div className="ble-inspector-card glass-panel">
        <div className="inspector-topbar">
          <div className="inspector-tabs">
            <button
              className={`inspector-tab-btn ${activeTab === 'log' ? 'active' : ''}`}
              onClick={() => setActiveTab('log')}
            >
              <Terminal size={15} />
              Nhật Ký Gói Tin ({dataHistory.length})
            </button>
            <button
              className={`inspector-tab-btn ${activeTab === 'raw' ? 'active' : ''}`}
              onClick={() => setActiveTab('raw')}
            >
              <Code2 size={15} />
              JSON &amp; Mã Hex Thô
            </button>
          </div>

          {activeTab === 'log' && (
            <div className="log-controls">
              <button
                className={`btn-log-ctrl ${isLogPaused ? 'paused' : ''}`}
                onClick={() => setIsLogPaused(!isLogPaused)}
              >
                {isLogPaused ? <Play size={13} /> : <Pause size={13} />}
                {isLogPaused ? 'Tiếp tục' : 'Tạm dừng'}
              </button>
              <button
                className="btn-log-ctrl clear"
                onClick={clearHistory}
                disabled={dataHistory.length === 0}
              >
                <Trash2 size={13} /> Xóa
              </button>
            </div>
          )}
        </div>

        {activeTab === 'log' ? (
          <div className="ble-log-terminal">
            {dataHistory.length === 0 ? (
              <div className="ble-log-empty">Chưa có gói tin nào được ghi nhận</div>
            ) : (
              dataHistory.map((item) => (
                <div key={item.id} className="ble-log-line">
                  <span className="ble-log-time">[{item.time}]</span>
                  <span className="ble-log-summary">{item.summary}</span>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="raw-inspector-grid">
            <div className="raw-pane">
              <span className="raw-pane-title">JSON Định Dạng Chuẩn (UTF-8)</span>
              <pre className="raw-code-box json">
                {parsedPayload?.isJson
                  ? JSON.stringify(parsedPayload.rawObject, null, 2)
                  : rawData || 'Chưa có dữ liệu'}
              </pre>
            </div>
            <div className="raw-pane">
              <span className="raw-pane-title">Mã Hex Byte Thô (Raw Frame)</span>
              <pre className="raw-code-box hex">
                {hexData || 'Chưa có dữ liệu Hex'}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BleStickEmPage;
