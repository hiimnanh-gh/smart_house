import React, { useState, useEffect } from 'react';
import {
  FileSearch,
  Radio,
  BluetoothOff,
  Search,
  Download,
  Copy,
  Check,
  Trash2,
  Pause,
  Play,
  CheckCircle2,
  AlertCircle,
  Send,
} from 'lucide-react';
import { useSmartHome } from '../../context/SmartHomeContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useBleStickEm } from '../ble-stickem/bleStickEmService';
import {
  filterAuditPackets,
  exportAuditToJson,
  exportAuditToCsv,
} from './bleInspectorService';
import './BleInspectorPage.css';

export const BleInspectorPage = () => {
  const { addLog } = useSmartHome();
  const {
    status,
    connectionState,
    deviceInfo,
    canWrite,
    auditPackets,
    totalPackets,
    lastIntervalMs,
    connectDevice,
    disconnectDevice,
    clearHistory,
    sendTextCommand,
  } = useBleStickEm();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeq, setSelectedSeq] = useState(null);
  const [showHexColumn, setShowHexColumn] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [frozenPackets, setFrozenPackets] = useState([]);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (!isPaused) {
      setFrozenPackets(auditPackets);
    }
  }, [auditPackets, isPaused]);

  const activePackets = isPaused ? frozenPackets : auditPackets;
  const filteredPackets = filterAuditPackets(activePackets, searchQuery);

  // Mặc định chọn gói mới nhất nếu chưa chọn thủ công
  const inspectedPacket =
    activePackets.find((p) => p.seq === selectedSeq) || activePackets[0] || null;

  const isConnected = connectionState === 'active';

  const handleCopyRaw = async () => {
    if (!inspectedPacket?.rawText) return;
    try {
      await navigator.clipboard.writeText(inspectedPacket.rawText);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 1800);
    } catch {}
  };

  return (
    <div className="ble-inspector-page animate-fade-in">
      {/* Header */}
      <div className="inspector-page-header">
        <div>
          <h1 className="page-title">Kiểm Tra Thông Tin Truyền Lên (BLE Audit)</h1>
          <p className="page-subtitle">
            Đối chiếu từng gói tin gốc, độ dài byte, định dạng JSON và mã Hex truyền từ kit Stick &apos;Em
          </p>
        </div>

        <div className="inspector-header-actions">
          <StatusBadge status={connectionState} text={status} size="md" />
          {isConnected ? (
            <>
              <button
                className="btn-ins-connect"
                onClick={() => sendTextCommand('READ\n', false, null, addLog)}
                disabled={!canWrite}
                title="Gửi lệnh READ\n xuống 0xFFE1"
              >
                <Send size={14} /> Ping (READ)
              </button>
              <button
                className="btn-ins-disconnect"
                onClick={() => disconnectDevice(addLog)}
              >
                <BluetoothOff size={15} /> Ngắt Kết Nối
              </button>
            </>
          ) : (
            <button
              className="btn-ins-connect"
              onClick={() => connectDevice(addLog)}
            >
              <Radio size={15} /> Kết Nối BLE
            </button>
          )}
        </div>
      </div>

      {/* Audit KPI Strip */}
      <div className="audit-kpi-grid">
        <div className="audit-kpi-card glass-panel">
          <span className="kpi-lbl">Tổng gói tin đã nhận</span>
          <span className="kpi-val">{totalPackets}</span>
        </div>

        <div className="audit-kpi-card glass-panel">
          <span className="kpi-lbl">Chu kỳ truyền gần nhất</span>
          <span className="kpi-val">
            {lastIntervalMs !== null ? `${lastIntervalMs} ms` : '--'}
          </span>
        </div>

        <div className="audit-kpi-card glass-panel">
          <span className="kpi-lbl">Kích thước frame mới nhất</span>
          <span className="kpi-val">
            {inspectedPacket ? `${inspectedPacket.byteLength} bytes` : '0 bytes'}
          </span>
        </div>

        <div className="audit-kpi-card glass-panel">
          <span className="kpi-lbl">Thiết bị nguồn</span>
          <span className="kpi-val small">
            {deviceInfo ? deviceInfo.name : 'Chưa kết nối'}
          </span>
        </div>
      </div>

      {/* Top Selected Packet Deep Inspection */}
      <div className="packet-deep-inspector glass-panel">
        <div className="deep-head">
          <div className="deep-title-wrap">
            <FileSearch size={20} className="deep-icon" />
            <div>
              <h3>
                {inspectedPacket
                  ? `Chi Tiết Gói Tin #${inspectedPacket.seq} (${inspectedPacket.time})`
                  : 'Chi Tiết Gói Tin Truyền Lên'}
              </h3>
              <p>Nhấp vào bất kỳ dòng nào trong bảng lịch sử bên dưới để kiểm tra chi tiết gói đó</p>
            </div>
          </div>

          {inspectedPacket && (
            <div className="deep-badges">
              <span
                className={`json-valid-pill ${
                  inspectedPacket.isValidJson || inspectedPacket.parsed?.isKeyValue
                    ? 'valid'
                    : 'raw'
                }`}
              >
                {inspectedPacket.isValidJson ? (
                  <>
                    <CheckCircle2 size={14} /> JSON Hợp Lệ
                  </>
                ) : inspectedPacket.parsed?.isKeyValue ? (
                  <>
                    <CheckCircle2 size={14} /> KEY:VALUE Hợp Lệ
                  </>
                ) : (
                  <>
                    <AlertCircle size={14} /> Chuỗi Thô (Raw)
                  </>
                )}
              </span>

              <button className="btn-copy-raw" onClick={handleCopyRaw}>
                {copiedId ? <Check size={14} /> : <Copy size={14} />}
                {copiedId ? 'Đã chép' : 'Chép Raw'}
              </button>
            </div>
          )}
        </div>

        {!inspectedPacket ? (
          <div className="deep-empty-state">
            Chưa có gói tin nào truyền lên. Hãy kết nối BLE Stick &apos;Em để bắt đầu kiểm tra dữ liệu.
          </div>
        ) : (
          <div className="deep-content-grid">
            {/* Column 1: Parsed Key-Value Table */}
            <div className="deep-box">
              <span className="box-title">Bảng Đối Chiếu Trường Dữ Liệu</span>
              {(inspectedPacket.isValidJson || inspectedPacket.parsed?.isKeyValue) &&
              inspectedPacket.parsed?.rawObject ? (
                <div className="kv-table-wrap">
                  <table className="kv-table">
                    <thead>
                      <tr>
                        <th>Trường (Key)</th>
                        <th>Giá trị (Value)</th>
                        <th>Kiểu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(inspectedPacket.parsed.rawObject).map(([k, v]) => (
                        <tr key={k}>
                          <td className="kv-key">{k}</td>
                          <td className="kv-val">{String(v)}</td>
                          <td className="kv-type">{typeof v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <pre className="raw-preview-pre">{inspectedPacket.rawText || '(Trống)'}</pre>
              )}
            </div>

            {/* Column 2: Raw UTF-8 + Hex Frame */}
            <div className="deep-box">
              <span className="box-title">Chuỗi Gốc UTF-8 Nhận Được</span>
              <pre className="raw-preview-pre utf8">{inspectedPacket.rawText || '(Trống)'}</pre>

              <span className="box-title mt-sm">
                Frame Hex Thô ({inspectedPacket.byteLength} bytes)
              </span>
              <pre className="raw-preview-pre hex">{inspectedPacket.hexStr || '(Trống)'}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Packet Audit Table */}
      <div className="audit-table-card glass-panel">
        <div className="audit-toolbar">
          <div className="search-input-wrap">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="audit-search-input"
              placeholder="Tìm theo giá trị, tên trường, giờ hoặc Hex..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="toolbar-actions">
            <label className="hex-toggle-label">
              <input
                type="checkbox"
                checked={showHexColumn}
                onChange={(e) => setShowHexColumn(e.target.checked)}
              />
              <span>Hiện cột Hex</span>
            </label>

            <button
              className={`btn-tb ${isPaused ? 'paused' : ''}`}
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? <Play size={14} /> : <Pause size={14} />}
              {isPaused ? 'Tiếp tục' : 'Tạm dừng'}
            </button>

            <button
              className="btn-tb"
              onClick={() => exportAuditToCsv(activePackets)}
              disabled={activePackets.length === 0}
            >
              <Download size={14} /> CSV
            </button>

            <button
              className="btn-tb"
              onClick={() => exportAuditToJson(activePackets)}
              disabled={activePackets.length === 0}
            >
              <Download size={14} /> JSON
            </button>

            <button
              className="btn-tb danger"
              onClick={() => {
                clearHistory();
                setFrozenPackets([]);
                setSelectedSeq(null);
              }}
              disabled={activePackets.length === 0}
            >
              <Trash2 size={14} /> Xóa
            </button>
          </div>
        </div>

        <div className="audit-table-scroll">
          <table className="audit-table">
            <thead>
              <tr>
                <th>#STT</th>
                <th>Thời gian</th>
                <th>Chu kỳ</th>
                <th>Bytes</th>
                <th>Định dạng</th>
                <th>Nội dung gói tin truyền lên</th>
                {showHexColumn && <th>Mã Hex Frame</th>}
              </tr>
            </thead>
            <tbody>
              {filteredPackets.length === 0 ? (
                <tr>
                  <td colSpan={showHexColumn ? 7 : 6} className="empty-table-cell">
                    Không có gói tin nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredPackets.map((pkt) => {
                  const isRowSelected = inspectedPacket?.seq === pkt.seq;
                  return (
                    <tr
                      key={pkt.id}
                      className={isRowSelected ? 'selected-row' : ''}
                      onClick={() => setSelectedSeq(pkt.seq)}
                    >
                      <td className="mono-col">#{pkt.seq}</td>
                      <td className="mono-col">{pkt.time}</td>
                      <td className="mono-col">
                        {pkt.intervalMs !== null ? `${pkt.intervalMs}ms` : '--'}
                      </td>
                      <td className="mono-col">{pkt.byteLength}B</td>
                      <td>
                        <span
                          className={`fmt-badge ${
                            pkt.isValidJson || pkt.parsed?.isKeyValue ? 'json' : 'raw'
                          }`}
                        >
                          {pkt.isValidJson
                            ? 'JSON'
                            : pkt.parsed?.isKeyValue
                            ? 'KV'
                            : 'RAW'}
                        </span>
                      </td>
                      <td className="payload-cell">{pkt.rawText}</td>
                      {showHexColumn && <td className="hex-cell">{pkt.hexStr}</td>}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BleInspectorPage;

