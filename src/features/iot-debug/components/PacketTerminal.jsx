import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Pause, Play, Trash2, Send } from 'lucide-react';
import { INITIAL_PACKETS } from '../iotDebugService';
import { iotBridge } from '../../../services/iotBridgeService';
import { sound } from '../../../utils/soundEffects';
import './PacketTerminal.css';

const formatPacketTime = () => {
  const now = new Date();
  return `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;
};

export const PacketTerminal = ({ hardwareStatus = 'DISCONNECTED', onSendCommand }) => {
  const [packets, setPackets] = useState(INITIAL_PACKETS);
  const [isStreaming, setIsStreaming] = useState(true);
  const [inputCmd, setInputCmd] = useState('');
  const [baudRate, setBaudRate] = useState('115200');
  const terminalEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (isStreaming) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [packets, isStreaming]);

  // Lắng nghe gói tin thật từ iotBridge (WebSocket TX/RX)
  useEffect(() => {
    const unsubscribe = iotBridge.subscribe((event, data) => {
      if (event === 'packet_rx') {
        const pkt = {
          id: Date.now() + Math.random(),
          time: formatPacketTime(),
          dir: 'RX',
          topic: data.type ? `esp32/${data.type.toLowerCase()}` : 'esp32/ws/rx',
          payload: typeof data === 'string' ? data : JSON.stringify(data),
        };
        setPackets((prev) => [...prev.slice(-40), pkt]);
      } else if (event === 'packet_tx') {
        const pkt = {
          id: Date.now() + Math.random(),
          time: formatPacketTime(),
          dir: 'TX',
          topic: data.simulated ? 'esp32/sim/tx' : 'esp32/ws/tx',
          payload: JSON.stringify(data),
        };
        setPackets((prev) => [...prev.slice(-40), pkt]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Periodic random packet simulation (chỉ chạy khi chưa kết nối ESP32 thật)
  useEffect(() => {
    if (!isStreaming || hardwareStatus === 'CONNECTED') return;

    const interval = setInterval(() => {
      const tempVal = (25.5 + (Math.random() - 0.5) * 1.5).toFixed(1);
      const humVal = Math.round(60 + (Math.random() - 0.5) * 6);

      const newPkt = {
        id: Date.now(),
        time: formatPacketTime(),
        dir: 'RX',
        topic: 'esp32/dht22/stream',
        payload: `{"temp":${tempVal},"hum":${humVal},"vcc":3.28}`,
      };

      setPackets((prev) => [...prev.slice(-40), newPkt]);
    }, 3500);

    return () => clearInterval(interval);
  }, [isStreaming, hardwareStatus]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputCmd.trim()) return;

    sound.playClick();
    const cmdText = inputCmd.trim();
    iotBridge.sendCommand('RAW_CLI', 'serial', cmdText);
    if (onSendCommand) onSendCommand(cmdText);
    setInputCmd('');
  };

  const handleClear = () => {
    setPackets([]);
    sound.playClick();
  };

  return (
    <div className="packet-terminal-card glass-panel">
      <div className="terminal-topbar">
        <div className="topbar-left">
          <Terminal size={18} className="terminal-green-icon" />
          <span className="terminal-title">Serial / WebSocket Stream Console</span>
          <span className="baud-tag">{baudRate} 8-N-1</span>
        </div>

        <div className="topbar-actions">
          <select
            className="baud-select"
            value={baudRate}
            onChange={(e) => setBaudRate(e.target.value)}
          >
            <option value="9600">9600 baud</option>
            <option value="115200">115200 baud</option>
            <option value="921600">921600 baud</option>
          </select>

          <button
            className={`btn-stream-toggle ${isStreaming ? 'streaming' : ''}`}
            onClick={() => setIsStreaming(!isStreaming)}
            title={isStreaming ? 'Tạm dừng cuộn' : 'Tiếp tục cuộn'}
          >
            {isStreaming ? <Pause size={14} /> : <Play size={14} />}
            <span>{isStreaming ? 'Pause' : 'Resume'}</span>
          </button>

          <button className="btn-clear-term" onClick={handleClear} title="Xóa màn hình">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Terminal Screen */}
      <div className="terminal-screen-box">
        {packets.map((pkt) => (
          <div key={pkt.id} className="packet-line">
            <span className="pkt-time">{pkt.time}</span>
            <span className={`pkt-badge ${pkt.dir}`}>{pkt.dir}</span>
            <span className="pkt-topic">[{pkt.topic}]</span>
            <span className="pkt-payload">{pkt.payload}</span>
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Command Input Bar */}
      <form className="terminal-input-bar" onSubmit={handleSend}>
        <span className="cli-prompt">&gt;</span>
        <input
          type="text"
          className="cli-input"
          placeholder="Nhập lệnh Serial / AT Command / MQTT Topic... (VD: AT+STATUS, GPIO_WRITE 2 1)"
          value={inputCmd}
          onChange={(e) => setInputCmd(e.target.value)}
        />
        <button type="submit" className="btn-cli-send">
          <Send size={15} /> Gửi Lệnh
        </button>
      </form>
    </div>
  );
};
