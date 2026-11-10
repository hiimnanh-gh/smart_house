import React, { useState, useRef, useEffect, useCallback } from "react";
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
  Thermometer,
  Droplets,
  Sun,
  Cog,
  Minus,
  Plus,
  Send,
  Zap,
} from "lucide-react";
import { useSmartHome } from "../../context/SmartHomeContext";
import { ToggleSwitch } from "../../components/common/ToggleSwitch";
import { RangeSlider } from "../../components/common/RangeSlider";
import { EightPortControlGrid } from "./components/EightPortControlGrid";
import { StickEmMotionPad } from "./components/StickEmMotionPad";
import { sound } from "../../utils/soundEffects";
import { isWebBluetoothSupported, useBleStickEm } from "./bleStickEmService";
import "./BleStickEmPage.css";

const SERVO_PRESETS = [0, 45, 90, 135, 180];

export const BleStickEmPage = () => {
  const { addLog } = useSmartHome();
  const {
    status,
    connectionState,
    deviceInfo,
    canWrite,
    writeCharUuid,
    writeMode,
    gattCharacteristics,
    servoAngle,
    servoFormat,
    servoChannel,
    appendNewlineOnWrite,
    eightPorts,
    detectedModules,
    portCommandFormat,
    selectedPortNum,
    probingPortNum,
    isProbingPort,
    lastScanTime,
    speedLevel,
    snapBack,
    driveConfig,
    activeDriveAction,
    portsData,
    parsedPayload,
    rawData,
    unparsedRawText,
    hexData,
    terminalLogs,
    syncToDashboard,
    getWriteCharacteristic,
    connectDevice,
    disconnectDevice,
    clearHistory,
    setServoFormat,
    setServoChannel,
    setAppendNewlineOnWrite,
    setWriteMode,
    setActiveWriteCharacteristic,
    setSelectedPortNum,
    setPortCommandFormat,
    setPortMode,
    setSpeedLevel,
    setSnapBack,
    setDriveConfig,
    setServoAngleLocal,
    setSyncToDashboard,
    sendServoCommand: dispatchServoWrite,
    probeServoFormats,
    scanPluggedPorts,
    autoDetectActivePort,
    confirmDetectedPort,
    sendPortCommand,
    rotatePort,
    driveRobot,
    stopAllPorts,
    probePortFormats,
    stopPortProbe,
    sendTextCommand,
  } = useBleStickEm();

  // Lưu instance Write Characteristic (0xFFE1) vào useRef để gửi lệnh tức thì
  const writeCharRef = useRef(null);
  const lastWriteTimeRef = useRef(0);
  const trailingTimerRef = useRef(null);
  const pendingAngleRef = useRef(null);

  const [customCmd, setCustomCmd] = useState("mv:1850:-:-:-:-:-:-:-:-,");

  // Đồng bộ writeCharRef với kết nối hiện tại và reset về null khi mất kết nối
  useEffect(() => {
    if (connectionState === "active" && canWrite) {
      writeCharRef.current = getWriteCharacteristic();
    } else {
      writeCharRef.current = null;
      if (trailingTimerRef.current) {
        clearTimeout(trailingTimerRef.current);
        trailingTimerRef.current = null;
      }
    }
  }, [connectionState, canWrite, getWriteCharacteristic]);

  useEffect(() => {
    return () => {
      if (trailingTimerRef.current) {
        clearTimeout(trailingTimerRef.current);
      }
    };
  }, []);

  const isConnected = connectionState === "active";
  const servoDisabled = !isConnected || !canWrite;
  const metaEntries = Object.entries(parsedPayload?.meta || {});

  /**
   * Gửi lệnh điều khiển Servo xuống cổng 0xFFE1 với throttle + trailing debounce (100ms)
   * để chống nghẽn hàng đợi GATT khi người dùng kéo Slider liên tục
   */
  const sendServoCommand = useCallback(
    (targetAngle, immediate = false) => {
      const clamped = setServoAngleLocal(targetAngle);
      const writeChar = writeCharRef.current || getWriteCharacteristic();
      if (!isConnected || !writeChar) return;
      writeCharRef.current = writeChar;

      const THROTTLE_MS = 100;
      const now = Date.now();
      const elapsed = now - lastWriteTimeRef.current;

      if (trailingTimerRef.current) {
        clearTimeout(trailingTimerRef.current);
        trailingTimerRef.current = null;
      }

      if (immediate || elapsed >= THROTTLE_MS) {
        lastWriteTimeRef.current = now;
        pendingAngleRef.current = null;
        dispatchServoWrite(
          clamped,
          writeChar,
          servoFormat,
          addLog,
          servoChannel,
        );
      } else {
        pendingAngleRef.current = clamped;
        trailingTimerRef.current = setTimeout(() => {
          const finalAngle = pendingAngleRef.current;
          pendingAngleRef.current = null;
          const activeChar = writeCharRef.current || getWriteCharacteristic();
          if (finalAngle !== null && activeChar) {
            lastWriteTimeRef.current = Date.now();
            dispatchServoWrite(
              finalAngle,
              activeChar,
              servoFormat,
              addLog,
              servoChannel,
            );
          }
        }, THROTTLE_MS - elapsed);
      }
    },
    [
      isConnected,
      servoFormat,
      servoChannel,
      getWriteCharacteristic,
      setServoAngleLocal,
      dispatchServoWrite,
      addLog,
    ],
  );

  const handleConnect = async () => {
    const wChar = await connectDevice(addLog);
    if (wChar) {
      writeCharRef.current = wChar;
    }
  };

  const handleDisconnect = () => {
    writeCharRef.current = null;
    disconnectDevice(addLog);
  };

  const handleStepServo = (delta) => {
    if (servoDisabled) return;
    sound.playClick();
    sendServoCommand(servoAngle + delta, true);
  };

  const handlePresetServo = (presetAngle) => {
    if (servoDisabled) return;
    sound.playClick();
    sendServoCommand(presetAngle, true);
  };

  const handleSendCustom = (e) => {
    e.preventDefault();
    const activeChar = writeCharRef.current || getWriteCharacteristic();
    if (servoDisabled || !customCmd.trim() || !activeChar) return;
    sendTextCommand(customCmd.trim(), appendNewlineOnWrite, activeChar, addLog);
  };

  const handleProbeServo = () => {
    const activeChar = writeCharRef.current || getWriteCharacteristic();
    if (servoDisabled || !activeChar) return;
    sound.playClick();
    probeServoFormats(servoAngle, activeChar, addLog);
  };

  const statusLightClass =
    connectionState === "active"
      ? "dot-connected"
      : connectionState === "warning"
        ? "dot-connecting"
        : connectionState === "danger"
          ? "dot-error"
          : "dot-disconnected";

  return (
    <div className="ble-stickem-page animate-fade-in">
      {/* Header + Đèn trạng thái kết nối */}
      <div className="ble-page-header">
        <div>
          <h1 className="page-title">
            Điều Khiển &amp; Giám Sát BLE Stick 'Em
          </h1>
          <p className="page-subtitle">
            Kết nối trực tiếp kit Stick &apos;Em (&quot;Chiendeptry&quot;) qua
            Service 0xFFE0 • Write 0xFFE1 • Notify 0xFFE2
          </p>
        </div>

        <div className={`ble-status-lamp ${connectionState}`}>
          <span className={`lamp-dot ${statusLightClass}`}></span>
          <span className="lamp-text">{status}</span>
        </div>
      </div>

      {!isWebBluetoothSupported() && (
        <div className="ble-warning-banner glass-panel">
          <AlertTriangle size={20} className="warning-icon" />
          <div>
            <strong>Trình duyệt chưa hỗ trợ Web Bluetooth API.</strong>
            <p>
              Vui lòng dùng Google Chrome hoặc Microsoft Edge trên localhost
              hoặc HTTPS.
            </p>
          </div>
        </div>
      )}

      {/* Thẻ Kết Nối & Bộ Lọc BLE */}
      <div className="ble-control-card glass-panel">
        <div className="ble-control-top">
          <div className="ble-device-summary">
            <div
              className={`ble-icon-circle ${isConnected ? "connected" : ""}`}
            >
              {isConnected ? (
                <BluetoothConnected size={24} />
              ) : (
                <Bluetooth size={24} />
              )}
            </div>
            <div>
              <div className="device-title-row">
                <h3>
                  {deviceInfo
                    ? deviceInfo.name
                    : "Stick 'Em Robot Board (Tự lọc Bluetooth Stick 'Em)"}
                </h3>
                {metaEntries.map(([k, v]) => (
                  <span key={k} className="meta-pill">
                    {k}: <strong>{String(v)}</strong>
                  </span>
                ))}
              </div>
              <p className="ble-uuid-meta">
                Service <code>0xFFE0</code> • Write{" "}
                <code>
                  0x{(writeCharUuid || "").slice(4, 8).toUpperCase() || "FFE1"}
                </code>{" "}
                • Notify <code>0xFFE2</code>
              </p>
            </div>
          </div>

          <div className="ble-action-buttons">
            <button className="btn-ble-connect" onClick={handleConnect}>
              <Radio size={16} />
              {isConnected ? "Đổi Board Stick 'Em" : "Kết Nối Stick 'Em"}
            </button>

            {isConnected && (
              <button className="btn-ble-disconnect" onClick={handleDisconnect}>
                <BluetoothOff size={16} />
                Ngắt Kết Nối
              </button>
            )}
          </div>
        </div>

        <div className="ble-filter-toolbar">
          <div className="filter-mode-group">
            <span className="filter-label">
              Chỉ hiển thị thiết bị Stick &apos;Em khi quét, ẩn các thiết bị
              Bluetooth khác).
            </span>
          </div>

          <ToggleSwitch
            size="sm"
            checked={syncToDashboard}
            onChange={(val) => setSyncToDashboard(val)}
            label="Đồng bộ Nhiệt độ/Độ ẩm lên Dashboard"
          />
        </div>

        {gattCharacteristics.length > 0 && (
          <div className="ble-filter-toolbar" style={{ paddingTop: 10 }}>
            <div className="filter-mode-group">
              <span className="filter-label">Cổng ghi BLE:</span>
              {gattCharacteristics
                .filter((c) => c.canWrite)
                .map((c) => (
                  <button
                    key={c.uuid}
                    type="button"
                    className={`filter-pill-btn ${writeCharUuid === c.uuid ? "active" : ""}`}
                    onClick={() => setActiveWriteCharacteristic(c.uuid)}
                  >
                    {c.shortUuid} [{c.caps.join("/")}]
                  </button>
                ))}
              <span className="filter-label" style={{ marginLeft: 8 }}>
                Kiểu ghi:
              </span>
              <button
                type="button"
                className={`filter-pill-btn ${writeMode === "auto" ? "active" : ""}`}
                onClick={() => setWriteMode("auto")}
              >
                WithResponse (Chuẩn)
              </button>
              <button
                type="button"
                className={`filter-pill-btn ${writeMode === "withoutResponse" ? "active" : ""}`}
                onClick={() => setWriteMode("withoutResponse")}
              >
                NoResponse
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bảng Tự Động Dò Chân & Cụm Nút Di Chuyển/Xoay (kiểu control.stickem.sg) */}
      <StickEmMotionPad
        disabled={servoDisabled}
        isConnected={isConnected}
        selectedPortNum={selectedPortNum}
        probingPortNum={probingPortNum}
        isProbingPort={isProbingPort}
        speedLevel={speedLevel}
        snapBack={snapBack}
        eightPorts={eightPorts}
        driveConfig={driveConfig}
        activeDriveAction={activeDriveAction}
        onSelectPort={(p) => setSelectedPortNum(p)}
        onAutoDetectPort={() => autoDetectActivePort(addLog)}
        onStopProbe={stopPortProbe}
        onConfirmPort={(p) => confirmDetectedPort(p, addLog)}
        onScanSensors={() => scanPluggedPorts(addLog)}
        onChangeSpeed={(lvl) => setSpeedLevel(lvl)}
        onToggleSnapBack={(val) => setSnapBack(val)}
        onUpdateDriveConfig={(cfg) => setDriveConfig(cfg)}
        onRotatePort={(p, dir) => rotatePort(p, dir, null, addLog)}
        onSendPortAngle={(p, ang) => sendPortCommand(p, ang, null, addLog)}
        onDrive={(act) => driveRobot(act, addLog)}
        onStopAll={() => stopAllPorts(addLog)}
      />

      {/* Dashboard Card Bố Cục Chính: Điều Khiển Servo (Trái) + 4 Thẻ Cảm Biến (Phải) */}
      <div className="ble-main-dashboard-grid">
        {/* Card Điều Khiển Servo (0xFFE1) */}
        <div
          className={`servo-control-card glass-panel ${servoDisabled ? "controls-disabled" : ""}`}
        >
          <div className="servo-card-head">
            <div className="servo-title-group">
              <div className="servo-cog-box">
                <Cog size={20} className={!servoDisabled ? "cog-ready" : ""} />
              </div>
              <div>
                <h3>Điều Khiển Góc Servo — Chân {selectedPortNum}</h3>
                <p>
                  {servoDisabled
                    ? "Kết nối Bluetooth để mở khóa điều khiển"
                    : "Sẵn sàng gửi xung PWM / lệnh tới Servo"}
                </p>
              </div>
            </div>

            <div className="servo-angle-readout">
              <span className="angle-number">{servoAngle}</span>
              <span className="angle-deg">°</span>
            </div>
          </div>

          {/* Thanh trượt Slider 0 - 180° */}
          <div className="servo-slider-wrap">
            <RangeSlider
              label="Thanh trượt góc quay (0° – 180°)"
              min={0}
              max={180}
              step={1}
              unit="°"
              value={servoAngle}
              onChange={(val) => sendServoCommand(val, false)}
              disabled={servoDisabled}
            />
          </div>

          {/* Hai nút bước nhỏ -5° và +5° + Nút cố định 0, 45, 90, 135, 180 */}
          <div className="servo-buttons-row">
            <button
              type="button"
              className="btn-servo-step"
              onClick={() => handleStepServo(-5)}
              disabled={servoDisabled || servoAngle <= 0}
            >
              <Minus size={15} /> -5°
            </button>

            <div className="servo-presets-group">
              {SERVO_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`btn-servo-preset ${servoAngle === preset ? "active" : ""}`}
                  onClick={() => handlePresetServo(preset)}
                  disabled={servoDisabled}
                >
                  {preset}°
                </button>
              ))}
            </div>

            <button
              type="button"
              className="btn-servo-step"
              onClick={() => handleStepServo(5)}
              disabled={servoDisabled || servoAngle >= 180}
            >
              <Plus size={15} /> +5°
            </button>
          </div>

          {/* Chọn định dạng gói lệnh, kênh Stick 'Em & gửi lệnh tùy ý */}
          <div className="servo-footer-tools">
            <div className="format-selector">
              <span className="fmt-lbl">Định dạng:</span>
              <button
                type="button"
                className={`fmt-pill ${servoFormat === "stickem_mv" ? "active" : ""}`}
                onClick={() => setServoFormat("stickem_mv")}
                disabled={servoDisabled}
              >
                mv:PWM (Stick 'Em)
              </button>
              <button
                type="button"
                className={`fmt-pill ${servoFormat === "stickem_legacy" ? "active" : ""}`}
                onClick={() => setServoFormat("stickem_legacy")}
                disabled={servoDisabled}
              >
                #n,val (Legacy)
              </button>
              <button
                type="button"
                className={`fmt-pill ${servoFormat === "json_stickem" ? "active" : ""}`}
                onClick={() => setServoFormat("json_stickem")}
                disabled={servoDisabled}
              >
                {`JSON {"${servoChannel}":xx}`}
              </button>
              <button
                type="button"
                className={`fmt-pill ${servoFormat === "json" ? "active" : ""}`}
                onClick={() => setServoFormat("json")}
                disabled={servoDisabled}
              >
                {`{"servo":xx}`}
              </button>
              <button
                type="button"
                className={`fmt-pill ${servoFormat === "text" ? "active" : ""}`}
                onClick={() => setServoFormat("text")}
                disabled={servoDisabled}
              >
                SERVO:xx\n
              </button>
              <button
                type="button"
                className={`fmt-pill ${servoFormat === "bytes" ? "active" : ""}`}
                onClick={() => setServoFormat("bytes")}
                disabled={servoDisabled}
              >
                [0xFF, xx]
              </button>

              {servoFormat === "json_stickem" && (
                <select
                  className="servo-channel-select"
                  value={servoChannel}
                  onChange={(e) => setServoChannel(e.target.value)}
                  disabled={servoDisabled}
                  title="Chọn tên chân/cổng Servo trong firmware"
                >
                  <option value="Servo1">Servo1</option>
                  <option value="Servo2">Servo2</option>
                  <option value="Servo3">Servo3</option>
                  <option value="Servo">Servo</option>
                  <option value="servo">servo</option>
                </select>
              )}

              <label
                className="nl-checkbox-lbl"
                title="Thêm ký tự xuống dòng \\n cuối gói tin"
              >
                <input
                  type="checkbox"
                  checked={appendNewlineOnWrite}
                  onChange={(e) => setAppendNewlineOnWrite(e.target.checked)}
                  disabled={servoDisabled}
                />
                <span>+\n</span>
              </label>
            </div>

            <div className="servo-extra-actions">
              <button
                type="button"
                className="btn-probe-servo"
                onClick={handleProbeServo}
                disabled={servoDisabled}
                title="Tự động thử gửi các kiểu lệnh Servo (mv:, Legacy, JSON, Text) để xem kit phản ứng"
              >
                <Zap size={14} /> Dò Định Dạng
              </button>

              <form className="custom-write-form" onSubmit={handleSendCustom}>
                <input
                  type="text"
                  className="custom-cmd-input"
                  value={customCmd}
                  onChange={(e) => setCustomCmd(e.target.value)}
                  placeholder="vd: mv:1850:-:-:-:-:-:-:-:-, hoặc scanAll,"
                  disabled={servoDisabled}
                />
                <button
                  type="submit"
                  className="btn-send-cmd"
                  disabled={servoDisabled || !customCmd.trim()}
                >
                  <Send size={14} /> Gửi
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* 4 Thẻ Card Cảm Biến (0xFFE2) */}
        <div className="sensors-4cards-grid">
          <div className="port-card glass-panel temp">
            <div className="sensor-card-top">
              <span className="sensor-label">Nhiệt Độ</span>
              <div className="sensor-icon-wrap temp">
                <Thermometer size={18} />
              </div>
            </div>
            <div className="port-value-display">{portsData.temperature}</div>
            <span className="port-key-hint">TEMP / temp</span>
          </div>

          <div className="port-card glass-panel hum">
            <div className="sensor-card-top">
              <span className="sensor-label">Độ Ẩm</span>
              <div className="sensor-icon-wrap hum">
                <Droplets size={18} />
              </div>
            </div>
            <div className="port-value-display">{portsData.humidity}</div>
            <span className="port-key-hint">HUMI / humi</span>
          </div>

          <div className="port-card glass-panel light">
            <div className="sensor-card-top">
              <span className="sensor-label">Cảm Biến Analog / Quang</span>
              <div className="sensor-icon-wrap light">
                <Sun size={18} />
              </div>
            </div>
            <div className="port-value-display">{portsData.analogSensor}</div>
            <span className="port-key-hint">A0 / LIGHT</span>
          </div>

          <div className="port-card glass-panel servo">
            <div className="sensor-card-top">
              <span className="sensor-label">Góc Servo Phản Hồi</span>
              <div className="sensor-icon-wrap servo">
                <Cog size={18} />
              </div>
            </div>
            <div className="port-value-display">{portsData.servoAngle}</div>
            <span className="port-key-hint">SERVO / servo (từ kit)</span>
          </div>
        </div>
      </div>

      {/* Bảng quét & điều khiển độc lập 8 chân cắm (Chân 1 .. Chân 8) */}
      <EightPortControlGrid
        eightPorts={eightPorts}
        detectedModules={detectedModules}
        selectedPortNum={selectedPortNum}
        probingPortNum={probingPortNum}
        portCommandFormat={portCommandFormat}
        isProbingPort={isProbingPort}
        snapBack={snapBack}
        lastScanTime={lastScanTime}
        disabled={servoDisabled}
        isConnected={isConnected}
        onScanPorts={() => scanPluggedPorts(addLog)}
        onSelectPort={(p) => setSelectedPortNum(p)}
        onConfirmPort={(p) => confirmDetectedPort(p, addLog)}
        onChangeFormat={(fmt) => setPortCommandFormat(fmt)}
        onChangePortMode={(p, mode) => setPortMode(p, mode)}
        onSendPortCommand={(p, val) => sendPortCommand(p, val, null, addLog)}
        onRotatePort={(p, dir) => rotatePort(p, dir, null, addLog)}
        onProbePort={(p, angle) => probePortFormats(p, angle, addLog)}
        onStopProbe={stopPortProbe}
      />

      {/* Cảm biến mở rộng (Touch1, Touch2, Ultrasonic,...) nếu có */}
      {parsedPayload?.sensors?.length > 0 && (
        <div className="ble-sensors-section">
          <div className="section-heading-row">
            <h3>Cảm Biến Mở Rộng Stick &apos;Em</h3>
            <span className="sensor-count-hint">
              {parsedPayload.sensors.length} cảm biến đang nhận
            </span>
          </div>

          <div className="ble-sensors-grid">
            {parsedPayload.sensors.map((sensor) => {
              if (sensor.type === "touch") {
                const isTouched = Boolean(sensor.value);
                return (
                  <div
                    key={sensor.key}
                    className={`ble-sensor-card glass-panel touch-card ${
                      isTouched ? "touched" : ""
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
                        {isTouched ? "ĐANG CHẠM" : "CHƯA CHẠM"}
                      </span>
                      <span className="sensor-raw-num">
                        Giá trị: {String(sensor.value)}
                      </span>
                    </div>
                  </div>
                );
              }

              if (sensor.type === "distance") {
                const numericVal = Number(sensor.value) || 0;
                const pct = Math.min(
                  100,
                  Math.max(0, (numericVal / sensor.max) * 100),
                );
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
                    <span className="sensor-big-val">
                      {String(sensor.value)}
                    </span>
                    {sensor.unit && (
                      <span className="sensor-unit">{sensor.unit}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ô Dữ liệu thô + Khung Log Terminal nhỏ ở chân trang (15 bản tin gần nhất) */}
      <div className="ble-inspector-card glass-panel">
        <div className="raw-data-box">
          <div className="raw-data-row">
            <span className="raw-inline-label">Dữ liệu thô:</span>
            <code className="raw-inline-code">
              {unparsedRawText || rawData || "Chưa có dữ liệu"}
            </code>
          </div>
          {hexData && (
            <div className="raw-data-row hex-subrow">
              <span className="raw-inline-label">Hex thô:</span>
              <code className="raw-hex-code">{hexData}</code>
            </div>
          )}
        </div>

        <div className="inspector-topbar">
          <div className="log-footer-title">
            <Terminal size={16} className="log-term-icon" />
            <span>Nhật Ký Giao Tiếp BLE (15 bản tin nhận/gửi gần nhất)</span>
          </div>

          <button
            type="button"
            className="btn-log-ctrl clear"
            onClick={clearHistory}
            disabled={terminalLogs.length === 0}
          >
            <Trash2 size={13} /> Xóa Log
          </button>
        </div>

        <div className="ble-log-terminal compact">
          {terminalLogs.length === 0 ? (
            <div className="ble-log-empty">Chưa có bản tin nhận/gửi nào</div>
          ) : (
            terminalLogs.map((item) => (
              <div key={item.id} className="ble-log-line">
                <span className="ble-log-time">[{item.time}]</span>
                <span className={`ble-dir-badge dir-${item.dir.toLowerCase()}`}>
                  {item.dir}
                </span>
                <span className="ble-log-summary">{item.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BleStickEmPage;
