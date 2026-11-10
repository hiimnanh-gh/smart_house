import React, { useState } from 'react';
import { Wifi, WifiOff, Plug } from 'lucide-react';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { sound } from '../../../utils/soundEffects';
import './HardwareConnector.css';

const STATUS_BADGE_MAP = {
  CONNECTED: { status: 'active', text: 'Đã kết nối ESP32' },
  CONNECTING: { status: 'warning', text: 'Đang kết nối...' },
  ERROR: { status: 'danger', text: 'Lỗi kết nối' },
  DISCONNECTED: { status: 'inactive', text: 'Chưa kết nối (Chế độ mô phỏng)' },
};

export const HardwareConnector = ({
  hardwareStatus,
  defaultUrl = 'ws://192.168.1.120:81',
  onConnect,
  onDisconnect,
}) => {
  const [wsUrl, setWsUrl] = useState(defaultUrl);
  const badgeInfo = STATUS_BADGE_MAP[hardwareStatus] || STATUS_BADGE_MAP.DISCONNECTED;
  const isConnected = hardwareStatus === 'CONNECTED';
  const isConnecting = hardwareStatus === 'CONNECTING';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!wsUrl.trim()) return;
    sound.playClick();
    if (isConnected) {
      onDisconnect();
    } else {
      onConnect(wsUrl.trim());
    }
  };

  return (
    <div className="hw-connector-card glass-panel">
      <div className="hw-connector-top">
        <div className="hw-connector-info">
          <div className={`hw-icon-badge ${isConnected ? 'connected' : ''}`}>
            <Plug size={20} />
          </div>
          <div>
            <h4>Kết Nối Trực Tiếp Vi Điều Khiển (WebSocket LAN)</h4>
            <p>Nhập địa chỉ WebSocket của ESP32 chạy firmware cổng 81 để nhận cảm biến & điều khiển relay thật</p>
          </div>
        </div>
        <StatusBadge status={badgeInfo.status} text={badgeInfo.text} size="md" />
      </div>

      <form className="hw-connector-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="hw-url-input"
          value={wsUrl}
          onChange={(e) => setWsUrl(e.target.value)}
          placeholder="ws://192.168.1.120:81"
          disabled={isConnected || isConnecting}
        />

        {isConnected ? (
          <button
            type="submit"
            className="btn-hw-action disconnect"
          >
            <WifiOff size={16} /> Ngắt Kết Nối
          </button>
        ) : (
          <button
            type="submit"
            className="btn-hw-action connect"
            disabled={isConnecting || !wsUrl.trim()}
          >
            <Wifi size={16} /> {isConnecting ? 'Đang Kết Nối...' : 'Kết Nối Phần Cứng'}
          </button>
        )}
      </form>
    </div>
  );
};

