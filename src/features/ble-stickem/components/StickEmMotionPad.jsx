import React, { useEffect, useRef } from 'react';
import {
  RotateCcw,
  RotateCw,
  Square,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Radar,
  ScanSearch,
  CheckCircle2,
  Gauge,
  OctagonX,
} from 'lucide-react';
import { STICKEM_SPEEDS } from '../bleStickEmService';
import { sound } from '../../../utils/soundEffects';
import './StickEmMotionPad.css';

const PORT_NUMS = [1, 2, 3, 4, 5, 6, 7, 8];
const ANGLE_STEPS = [
  { deg: 0, pwm: 1000 },
  { deg: 45, pwm: 1250 },
  { deg: 90, pwm: 1500 },
  { deg: 135, pwm: 1750 },
  { deg: 180, pwm: 2000 },
];

export const StickEmMotionPad = ({
  disabled = true,
  isConnected = false,
  selectedPortNum = 1,
  probingPortNum = null,
  isProbingPort = false,
  speedLevel = 'medium',
  snapBack = true,
  eightPorts = [],
  driveConfig = { leftPorts: [1], rightPorts: [2], invertPorts: [] },
  activeDriveAction = 'neutral',
  onSelectPort,
  onAutoDetectPort,
  onStopProbe,
  onConfirmPort,
  onScanSensors,
  onChangeSpeed,
  onToggleSnapBack,
  onUpdateDriveConfig,
  onRotatePort,
  onSendPortAngle,
  onDrive,
  onStopAll,
}) => {
  const activeHoldRef = useRef(null);
  const keyActiveRef = useRef(null);
  const handlersRef = useRef({ onRotatePort, onDrive, onStopAll, selectedPortNum, snapBack });
  handlersRef.current = { onRotatePort, onDrive, onStopAll, selectedPortNum, snapBack };

  const selectedPortData =
    eightPorts.find((p) => p.port === selectedPortNum) || { pwm: 1500, value: 90 };
  const leftPort = driveConfig?.leftPorts?.[0] || 1;
  const rightPort = driveConfig?.rightPorts?.[0] || 2;
  const invertSet = new Set((driveConfig?.invertPorts || []).map(Number));

  // Hỗ trợ điều khiển bàn phím kiểu control.stickem.sg (Q/E xoay chân đang chọn, WASD/Arrows di chuyển)
  useEffect(() => {
    if (disabled || !isConnected) return undefined;

    const isEditable = (el) => {
      if (!el) return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
    };

    const handleKeyDown = (e) => {
      if (e.repeat || isEditable(e.target)) return;
      const { selectedPortNum: port, onRotatePort: rot, onDrive: drv, onStopAll: stop } = handlersRef.current;
      const code = e.code;

      if (code === 'KeyQ') {
        keyActiveRef.current = { type: 'rot', port };
        rot(port, 'ccw');
      } else if (code === 'KeyE') {
        keyActiveRef.current = { type: 'rot', port };
        rot(port, 'cw');
      } else if (code === 'KeyW' || code === 'ArrowUp') {
        e.preventDefault();
        keyActiveRef.current = { type: 'drive' };
        drv('forward');
      } else if (code === 'KeyS' || code === 'ArrowDown') {
        e.preventDefault();
        keyActiveRef.current = { type: 'drive' };
        drv('backward');
      } else if (code === 'KeyA' || code === 'ArrowLeft') {
        e.preventDefault();
        keyActiveRef.current = { type: 'drive' };
        drv('left');
      } else if (code === 'KeyD' || code === 'ArrowRight') {
        e.preventDefault();
        keyActiveRef.current = { type: 'drive' };
        drv('right');
      } else if (code === 'Space') {
        e.preventDefault();
        stop();
      }
    };

    const handleKeyUp = (e) => {
      const { snapBack: shouldSnap, onRotatePort: rot, onDrive: drv } = handlersRef.current;
      if (isEditable(e.target) || !shouldSnap) return;
      const code = e.code;
      if (
        (code === 'KeyQ' || code === 'KeyE') &&
        keyActiveRef.current?.type === 'rot'
      ) {
        const stopPort = keyActiveRef.current.port;
        keyActiveRef.current = null;
        rot(stopPort, 'neutral');
      } else if (
        ['KeyW', 'KeyS', 'KeyA', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(
          code
        ) &&
        keyActiveRef.current?.type === 'drive'
      ) {
        keyActiveRef.current = null;
        drv('neutral');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [disabled, isConnected]);

  const startHoldRotation = (dir) => {
    if (disabled) return;
    sound.playClick();
    activeHoldRef.current = { kind: 'rot', dir };
    onRotatePort(selectedPortNum, dir);
  };

  const endHoldRotation = () => {
    if (disabled || !snapBack || activeHoldRef.current?.kind !== 'rot') return;
    activeHoldRef.current = null;
    onRotatePort(selectedPortNum, 'neutral');
  };

  const startHoldDrive = (action) => {
    if (disabled) return;
    sound.playClick();
    activeHoldRef.current = { kind: 'drive', action };
    onDrive(action);
  };

  const endHoldDrive = () => {
    if (disabled || !snapBack || activeHoldRef.current?.kind !== 'drive') return;
    activeHoldRef.current = null;
    onDrive('neutral');
  };

  const toggleInvertPort = (port) => {
    const next = new Set(invertSet);
    if (next.has(port)) next.delete(port);
    else next.add(port);
    onUpdateDriveConfig({ invertPorts: Array.from(next) });
  };

  return (
    <div className={`stickem-motion-panel glass-panel ${disabled ? 'motion-disabled' : ''}`}>
      {/* Hàng 1: Dò chân tự động + Tốc độ + Chế độ nhả nút + Dừng khẩn cấp */}
      <div className="motion-topbar">
        <div className="motion-scan-group">
          {!isProbingPort ? (
            <button
              type="button"
              className="btn-auto-detect"
              onClick={onAutoDetectPort}
              disabled={disabled}
            >
              <Radar size={16} />
              Tự Động Dò Chân (1 → 8)
            </button>
          ) : (
            <div className="probing-live-box">
              <span className="probing-pulse-badge">
                Đang nhấp thử CHÂN {probingPortNum || selectedPortNum}...
              </span>
              <button
                type="button"
                className="btn-confirm-port"
                onClick={() => onConfirmPort(probingPortNum || selectedPortNum)}
              >
                <CheckCircle2 size={15} />
                Servo đang quay ở Chân {probingPortNum || selectedPortNum}!
              </button>
              <button type="button" className="btn-stop-detect" onClick={onStopProbe}>
                <Square size={13} /> Dừng dò
              </button>
            </div>
          )}

          <button
            type="button"
            className="btn-scan-sensors"
            onClick={onScanSensors}
            disabled={!isConnected}
            title="Gửi lệnh scanAll, chuẩn control.stickem.sg để đọc cảm biến"
          >
            <ScanSearch size={15} /> Quét Cảm Biến
          </button>
        </div>

        <div className="motion-settings-group">
          <div className="speed-pill-group" title="Tốc độ xung PWM theo control.stickem.sg">
            <Gauge size={14} className="spd-icon" />
            {Object.entries(STICKEM_SPEEDS).map(([key, val]) => (
              <button
                key={key}
                type="button"
                className={`spd-pill ${speedLevel === key ? 'active' : ''}`}
                onClick={() => {
                  sound.playClick();
                  onChangeSpeed(key);
                }}
              >
                {key === 'slow' ? 'Chậm' : key === 'medium' ? 'Vừa' : 'Nhanh'} ({val})
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`snap-mode-btn ${snapBack ? 'snap' : 'stay'}`}
            onClick={() => {
              sound.playClick();
              onToggleSnapBack(!snapBack);
            }}
            title="SNAP BACK: thả nút tự dừng về 1500 | STAY PUT: giữ nguyên lệnh xoay"
          >
            {snapBack ? 'Thả nút: TỰ DỪNG' : 'Thả nút: GIỮ XOAY'}
          </button>

          <button
            type="button"
            className="btn-stop-all"
            onClick={onStopAll}
            disabled={disabled}
          >
            <OctagonX size={15} /> DỪNG TẤT CẢ
          </button>
        </div>
      </div>

      {/* Hàng 2: 2 khu điều khiển trực quan */}
      <div className="motion-controls-grid">
        {/* Cột Trái: Điều khiển xoay Servo / Motor cho Chân Đang Chọn */}
        <div className="motion-box single-port-box">
          <div className="mbox-header">
            <div>
              <h4>Xoay Trực Tiếp Chân Đang Chọn</h4>
              <p>
                Đang chọn <strong>CHÂN {selectedPortNum}</strong> • PWM hiện tại:{' '}
                <code>{selectedPortData.pwm || 1500} µs</code> (phím <code>Q</code> / <code>E</code>)
              </p>
            </div>
          </div>

          <div className="quick-port-pills">
            {PORT_NUMS.map((p) => (
              <button
                key={p}
                type="button"
                className={`qport-pill ${selectedPortNum === p ? 'active' : ''} ${
                  probingPortNum === p ? 'probing' : ''
                }`}
                onClick={() => {
                  sound.playClick();
                  onSelectPort(p);
                }}
              >
                C{p}
              </button>
            ))}
          </div>

          <div className="rotate-pad-row">
            <button
              type="button"
              className="btn-rotate ccw"
              disabled={disabled}
              onPointerDown={() => startHoldRotation('ccw')}
              onPointerUp={endHoldRotation}
              onPointerCancel={endHoldRotation}
              onPointerLeave={endHoldRotation}
            >
              <RotateCcw size={22} />
              <span>Xoay Ngược</span>
              <small>CCW (Q)</small>
            </button>

            <button
              type="button"
              className="btn-rotate stop"
              disabled={disabled}
              onClick={() => {
                sound.playClick();
                onRotatePort(selectedPortNum, 'neutral');
              }}
            >
              <Square size={18} />
              <span>Dừng / Giữa</span>
              <small>1500 µs</small>
            </button>

            <button
              type="button"
              className="btn-rotate cw"
              disabled={disabled}
              onPointerDown={() => startHoldRotation('cw')}
              onPointerUp={endHoldRotation}
              onPointerCancel={endHoldRotation}
              onPointerLeave={endHoldRotation}
            >
              <RotateCw size={22} />
              <span>Xoay Thuận</span>
              <small>CW (E)</small>
            </button>
          </div>

          <div className="servo-angle-quick-bar">
            <span className="sa-label">Đặt góc Servo 180°:</span>
            {ANGLE_STEPS.map((item) => (
              <button
                key={item.deg}
                type="button"
                className={`sa-btn ${
                  selectedPortData.pwm === item.pwm ? 'active' : ''
                }`}
                disabled={disabled}
                onClick={() => {
                  sound.playClick();
                  onSendPortAngle(selectedPortNum, item.deg);
                }}
              >
                {item.deg}° <small>({item.pwm})</small>
              </button>
            ))}
          </div>
        </div>

        {/* Cột Phải: Cụm Nút Di Chuyển Robot 4 Hướng (D-Pad control.stickem.sg) */}
        <div className="motion-box dpad-box">
          <div className="mbox-header">
            <div>
              <h4>Cụm Nút Di Chuyển (D-Pad Robot)</h4>
              <p>Phím mũi tên hoặc W A S D • Nhấn giữ để chạy, nhả nút để dừng</p>
            </div>
          </div>

          <div className="drive-ports-config">
            <div className="drv-select-item">
              <label>Chân Trái:</label>
              <select
                value={leftPort}
                onChange={(e) => onUpdateDriveConfig({ leftPorts: [Number(e.target.value)] })}
              >
                {PORT_NUMS.map((p) => (
                  <option key={p} value={p}>
                    Chân {p}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={`btn-invert-mini ${invertSet.has(leftPort) ? 'active' : ''}`}
                onClick={() => toggleInvertPort(leftPort)}
                title="Đảo chiều chân Trái"
              >
                Đảo
              </button>
            </div>

            <div className="drv-select-item">
              <label>Chân Phải:</label>
              <select
                value={rightPort}
                onChange={(e) => onUpdateDriveConfig({ rightPorts: [Number(e.target.value)] })}
              >
                {PORT_NUMS.map((p) => (
                  <option key={p} value={p}>
                    Chân {p}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={`btn-invert-mini ${invertSet.has(rightPort) ? 'active' : ''}`}
                onClick={() => toggleInvertPort(rightPort)}
                title="Đảo chiều chân Phải"
              >
                Đảo
              </button>
            </div>
          </div>

          <div className="dpad-cross-grid">
            <div className="dpad-spacer" />
            <button
              type="button"
              className={`dpad-btn up ${activeDriveAction === 'forward' ? 'active' : ''}`}
              disabled={disabled}
              onPointerDown={() => startHoldDrive('forward')}
              onPointerUp={endHoldDrive}
              onPointerCancel={endHoldDrive}
              onPointerLeave={endHoldDrive}
            >
              <ArrowUp size={22} />
              <span>Tiến (W)</span>
            </button>
            <div className="dpad-spacer" />

            <button
              type="button"
              className={`dpad-btn left ${activeDriveAction === 'left' ? 'active' : ''}`}
              disabled={disabled}
              onPointerDown={() => startHoldDrive('left')}
              onPointerUp={endHoldDrive}
              onPointerCancel={endHoldDrive}
              onPointerLeave={endHoldDrive}
            >
              <ArrowLeft size={22} />
              <span>Trái (A)</span>
            </button>

            <button
              type="button"
              className="dpad-btn center-stop"
              disabled={disabled}
              onClick={() => {
                sound.playClick();
                onDrive('neutral');
              }}
            >
              <Square size={18} />
              <span>Dừng</span>
            </button>

            <button
              type="button"
              className={`dpad-btn right ${activeDriveAction === 'right' ? 'active' : ''}`}
              disabled={disabled}
              onPointerDown={() => startHoldDrive('right')}
              onPointerUp={endHoldDrive}
              onPointerCancel={endHoldDrive}
              onPointerLeave={endHoldDrive}
            >
              <ArrowRight size={22} />
              <span>Phải (D)</span>
            </button>

            <div className="dpad-spacer" />
            <button
              type="button"
              className={`dpad-btn down ${activeDriveAction === 'backward' ? 'active' : ''}`}
              disabled={disabled}
              onPointerDown={() => startHoldDrive('backward')}
              onPointerUp={endHoldDrive}
              onPointerCancel={endHoldDrive}
              onPointerLeave={endHoldDrive}
            >
              <ArrowDown size={22} />
              <span>Lùi (S)</span>
            </button>
            <div className="dpad-spacer" />
          </div>
        </div>
      </div>
    </div>
  );
};
