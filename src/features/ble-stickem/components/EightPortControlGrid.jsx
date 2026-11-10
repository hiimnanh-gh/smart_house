import React, { useRef } from 'react';
import {
  ScanSearch,
  Cpu,
  Zap,
  Square,
  Power,
  RotateCcw,
  RotateCw,
  CheckCircle2,
} from 'lucide-react';
import { PORT_FORMAT_OPTIONS } from '../bleStickEmService';
import { RangeSlider } from '../../../components/common/RangeSlider';
import { sound } from '../../../utils/soundEffects';
import './EightPortControlGrid.css';

const QUICK_ANGLES = [0, 90, 180];

export const EightPortControlGrid = ({
  eightPorts = [],
  detectedModules = [],
  selectedPortNum = 1,
  probingPortNum = null,
  portCommandFormat = 'stickem_mv',
  isProbingPort = false,
  snapBack = true,
  lastScanTime = null,
  disabled = true,
  isConnected = false,
  onScanPorts,
  onSelectPort,
  onConfirmPort,
  onChangeFormat,
  onChangePortMode,
  onSendPortCommand,
  onRotatePort,
  onProbePort,
  onStopProbe,
}) => {
  const holdPortRef = useRef(null);

  const handlePortSpinStart = (portNum, dir) => {
    if (disabled || !onRotatePort) return;
    sound.playClick();
    holdPortRef.current = portNum;
    onRotatePort(portNum, dir);
  };

  const handlePortSpinEnd = (portNum) => {
    if (disabled || !snapBack || !onRotatePort || holdPortRef.current !== portNum) return;
    holdPortRef.current = null;
    onRotatePort(portNum, 'neutral');
  };

  return (
    <div className="eight-port-section glass-panel">
      {/* Header + Scan button */}
      <div className="eight-port-header">
        <div className="ep-title-wrap">
          <div className="ep-icon-badge">
            <Cpu size={20} />
          </div>
          <div>
            <h3>Chi Tiết 8 Chân Cắm &amp; Cảm Biến (C1 – C8)</h3>
            <p>
              Điều khiển độc lập từng chân 1–8 theo xung PWM chuẩn control.stickem.sg (1000–2000 µs)
            </p>
          </div>
        </div>

        <div className="ep-scan-actions">
          {lastScanTime && (
            <span className="scan-time-hint">Quét lúc: {lastScanTime}</span>
          )}
          <button
            type="button"
            className="btn-scan-ports"
            onClick={onScanPorts}
            disabled={!isConnected}
          >
            <ScanSearch size={16} />
            Quét Cảm Biến (scanAll,)
          </button>
        </div>
      </div>

      {/* Detected Modules Banner */}
      <div className="detected-modules-bar">
        <span className="dm-label">Đang nhận tín hiệu cắm trên kit:</span>
        {detectedModules.length === 0 ? (
          <span className="dm-empty">
            Chưa phát hiện module đầu vào nào (hãy kết nối BLE hoặc bấm Quét Cảm Biến)
          </span>
        ) : (
          <div className="dm-pills-list">
            {detectedModules.map((mod) => (
              <span key={mod.key} className="dm-pill">
                <span className="dm-dot"></span>
                <strong>{mod.key}:</strong> {String(mod.value)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Port Command Format + Auto Probe Toolbar */}
      <div className="ep-format-toolbar">
        <div className="ep-format-left">
          <span className="ep-fmt-label">Kiểu lệnh gửi từng chân:</span>
          <select
            className="ep-format-select"
            value={portCommandFormat}
            onChange={(e) => onChangeFormat(e.target.value)}
            disabled={disabled}
          >
            {PORT_FORMAT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label} — {opt.desc}
              </option>
            ))}
          </select>
        </div>

        <div className="ep-probe-group">
          {isProbingPort ? (
            <button
              type="button"
              className="btn-ep-stop-probe"
              onClick={onStopProbe}
            >
              <Square size={13} /> Dừng Dò Chân {probingPortNum || selectedPortNum}
            </button>
          ) : (
            <button
              type="button"
              className="btn-ep-probe"
              onClick={() => onProbePort(selectedPortNum, 180)}
              disabled={disabled}
              title={`Thử các giao thức khác nhau cho Chân ${selectedPortNum}`}
            >
              <Zap size={14} /> Dò Giao Thức Chân {selectedPortNum}
            </button>
          )}
        </div>
      </div>

      {/* 8-Port Cards Grid */}
      <div className="eight-ports-grid">
        {eightPorts.map((portItem) => {
          const isSelected = portItem.port === selectedPortNum;
          const isProbingThis = probingPortNum === portItem.port;
          const hasDetected = Boolean(portItem.detectedKey);
          const isServoMode = portItem.mode === 'servo';

          return (
            <div
              key={portItem.port}
              className={`port-slot-card ${isSelected ? 'selected' : ''} ${
                isProbingThis ? 'probing-active' : ''
              } ${hasDetected ? 'has-detected' : ''} ${disabled ? 'slot-disabled' : ''}`}
              onClick={() => onSelectPort(portItem.port)}
            >
              <div className="slot-head">
                <div className="slot-id-wrap">
                  <div className="slot-title-badges">
                    <span className="slot-num-badge">CHÂN {portItem.port}</span>
                    {isProbingThis && (
                      <span className="slot-probing-pill">ĐANG THỬ</span>
                    )}
                  </div>
                  {hasDetected && (
                    <span className="slot-detected-tag">
                      {portItem.detectedKey}: {String(portItem.detectedValue)}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  className="slot-mode-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playClick();
                    onChangePortMode(portItem.port, isServoMode ? 'digital' : 'servo');
                  }}
                  title="Đổi chế độ điều khiển chân (Servo / Bật-Tắt)"
                >
                  {isServoMode ? 'Servo' : 'Digital'}
                </button>
              </div>

              {isProbingThis && onConfirmPort && (
                <button
                  type="button"
                  className="btn-slot-confirm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConfirmPort(portItem.port);
                  }}
                >
                  <CheckCircle2 size={13} /> Đây rồi! Chọn Chân {portItem.port}
                </button>
              )}

              {isServoMode ? (
                <div className="slot-servo-controls" onClick={(e) => e.stopPropagation()}>
                  <div className="slot-val-row">
                    <span className="slot-val-label">PWM: {portItem.pwm || 1500}µs</span>
                    <span className="slot-val-number">{portItem.value}°</span>
                  </div>

                  {/* Nút xoay trực tiếp CCW / Dừng / CW ngay trên thẻ chân */}
                  {onRotatePort && (
                    <div className="slot-spin-row">
                      <button
                        type="button"
                        className="slot-spin-btn ccw"
                        disabled={disabled}
                        onPointerDown={() => handlePortSpinStart(portItem.port, 'ccw')}
                        onPointerUp={() => handlePortSpinEnd(portItem.port)}
                        onPointerCancel={() => handlePortSpinEnd(portItem.port)}
                        onPointerLeave={() => handlePortSpinEnd(portItem.port)}
                        title="Xoay ngược (CCW)"
                      >
                        <RotateCcw size={13} />
                      </button>
                      <button
                        type="button"
                        className="slot-spin-btn stop"
                        disabled={disabled}
                        onClick={() => {
                          sound.playClick();
                          onRotatePort(portItem.port, 'neutral');
                        }}
                        title="Dừng (1500µs)"
                      >
                        <Square size={11} />
                      </button>
                      <button
                        type="button"
                        className="slot-spin-btn cw"
                        disabled={disabled}
                        onPointerDown={() => handlePortSpinStart(portItem.port, 'cw')}
                        onPointerUp={() => handlePortSpinEnd(portItem.port)}
                        onPointerCancel={() => handlePortSpinEnd(portItem.port)}
                        onPointerLeave={() => handlePortSpinEnd(portItem.port)}
                        title="Xoay thuận (CW)"
                      >
                        <RotateCw size={13} />
                      </button>
                    </div>
                  )}

                  <RangeSlider
                    min={0}
                    max={180}
                    step={5}
                    unit=""
                    value={portItem.value}
                    onChange={(val) => onSendPortCommand(portItem.port, val)}
                    disabled={disabled}
                  />

                  <div className="slot-quick-row">
                    {QUICK_ANGLES.map((ang) => (
                      <button
                        key={ang}
                        type="button"
                        className={`slot-angle-btn ${portItem.value === ang ? 'active' : ''}`}
                        onClick={() => {
                          sound.playClick();
                          onSendPortCommand(portItem.port, ang);
                        }}
                        disabled={disabled}
                      >
                        {ang}°
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="slot-digital-controls" onClick={(e) => e.stopPropagation()}>
                  <div className="slot-val-row">
                    <span className="slot-val-label">Trạng thái</span>
                    <span className={`slot-digital-state ${portItem.isOn ? 'on' : ''}`}>
                      {portItem.isOn ? 'BẬT (2000)' : 'TẮT (1500)'}
                    </span>
                  </div>

                  <div className="slot-digital-btns">
                    <button
                      type="button"
                      className={`btn-dig on ${portItem.isOn ? 'active' : ''}`}
                      onClick={() => {
                        sound.playToggle(true);
                        onSendPortCommand(portItem.port, 1);
                      }}
                      disabled={disabled}
                    >
                      <Power size={13} /> BẬT
                    </button>
                    <button
                      type="button"
                      className={`btn-dig off ${!portItem.isOn ? 'active' : ''}`}
                      onClick={() => {
                        sound.playToggle(false);
                        onSendPortCommand(portItem.port, 0);
                      }}
                      disabled={disabled}
                    >
                      TẮT
                    </button>
                  </div>
                </div>
              )}

              <div className="slot-footer">
                <button
                  type="button"
                  className="btn-slot-probe"
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playClick();
                    onProbePort(portItem.port, 180);
                  }}
                  disabled={disabled || isProbingPort}
                >
                  <Zap size={12} /> Dò Chân {portItem.port}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

