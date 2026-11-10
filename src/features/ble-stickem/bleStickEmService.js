import { useState, useEffect } from 'react';
import { sound } from '../../utils/soundEffects';

/**
 * BLE Stick 'Em ("Chiendeptry") Service & Persistent Store
 * - Service UUID: 0000ffe0-0000-1000-8000-00805f9b34fb
 * - Write Characteristic (Gửi lệnh điều khiển): 0000ffe1-0000-1000-8000-00805f9b34fb
 * - Notify Characteristic (Đọc dữ liệu): 0000ffe2-0000-1000-8000-00805f9b34fb
 */

export const BLE_CONFIG = {
  SERVICE_UUID: '0000ffe0-0000-1000-8000-00805f9b34fb',
  WRITE_CHAR_UUID: '0000ffe1-0000-1000-8000-00805f9b34fb',
  NOTIFY_CHAR_UUID: '0000ffe2-0000-1000-8000-00805f9b34fb',
  STICKEM_NAME_PREFIX: '\u2800', // Prefix Braille Blank chuẩn firmware control.stickem.sg
  DEFAULT_DEVICE_NAME: 'Chiendeptry',
};

export const formatFriendlyDeviceName = (rawName) => {
  const cleaned = String(rawName || '').replace(/\u2800/g, '').trim();
  return cleaned || "Stick 'Em Board";
};

export const INITIAL_PORTS_DATA = {
  temperature: '--',
  humidity: '--',
  analogSensor: '--',
  servoAngle: '--',
};

export const STICKEM_SPEEDS = {
  slow: 4,
  medium: 7,
  fast: 10,
};

export const angleToPwmUs = (angle) => {
  const clamped = Math.max(0, Math.min(180, Math.round(Number(angle) || 0)));
  return Math.round(1000 + (clamped / 180) * 1000);
};

export const speedToPwmUs = (speed) => Math.round(50 * speed + 1500);

export const invertPwmUs = (pwm) => 3000 - pwm;

export const buildStickEmMvCommand = (portSlots, duration = '-') => {
  const slots = Array.from({ length: 8 }, (_, i) => {
    const v = portSlots?.[i];
    return v === undefined || v === null ? '-' : v;
  });
  return `mv:${slots.join(':')}:${duration},`;
};

export const createInitialEightPorts = () =>
  Array.from({ length: 8 }, (_, idx) => ({
    port: idx + 1,
    label: `Chân ${idx + 1}`,
    mode: 'servo', // 'servo' | 'digital'
    value: 90,
    pwm: 1500,
    isOn: false,
    detectedKey: null,
    detectedValue: null,
  }));

export const PORT_FORMAT_OPTIONS = [
  { id: 'stickem_mv', label: 'mv:PWM:-:...- (Chuẩn Stick \'Em)', desc: 'Giao thức control.stickem.sg v1.3.x (1000-2000µs)' },
  { id: 'stickem_legacy', label: '#n,val (Legacy <v1.0)', desc: 'Firmware cũ Stick \'Em' },
  { id: 'json_servo_n', label: '{"Servo{n}":val}', desc: 'JSON (1..8)' },
  { id: 'json_servo_0', label: '{"Servo{n-1}":val}', desc: 'JSON (0..7)' },
  { id: 'json_port_n', label: '{"Port{n}":val}', desc: 'Port JSON (1..8)' },
  { id: 'json_p_n', label: '{"P{n}":val}', desc: 'Pin P{n} JSON' },
  { id: 'json_obj_servo', label: '{"servo":n,"angle":val}', desc: 'JSON Object Servo' },
  { id: 'json_obj_port', label: '{"port":n,"value":val}', desc: 'JSON Object Port' },
  { id: 'text_servo_n', label: 'SERVO{n}:val', desc: 'Text Servo{n}' },
  { id: 'text_servo_colon', label: 'SERVO:n:val', desc: 'Text Servo:n:val' },
  { id: 'bytes_3', label: '[0xFF, n, val]', desc: '3-Byte Binary' },
];

export const isWebBluetoothSupported = () => {
  return typeof navigator !== 'undefined' && Boolean(navigator.bluetooth);
};

/**
 * Đọc song song cả Text UTF-8 và mảng Hex raw từ DataView BLE
 */
export const decodeBleDataView = (value) => {
  const decoder = new TextDecoder('utf-8');
  const rawText = decoder.decode(value);
  const text = rawText.trim();

  const hexArray = [];
  for (let i = 0; i < value.byteLength; i++) {
    hexArray.push('0x' + value.getUint8(i).toString(16).padStart(2, '0'));
  }
  const hexStr = hexArray.join(' ');

  return { rawText, text, hexArray, hexStr, byteLength: value.byteLength };
};

const SENSOR_METADATA_MAP = [
  { pattern: /^touch(\d*)$/i, type: 'touch', getLabel: (m) => `Cảm ứng Touch ${m[1] || ''}`.trim() },
  { pattern: /^btn|button(\d*)$/i, type: 'touch', getLabel: (m) => `Nút nhấn ${m[1] || ''}`.trim() },
  { pattern: /^ultrasonic(\d*)$/i, type: 'distance', max: 400, unit: 'cm', getLabel: (m) => `Siêu âm Ultrasonic ${m[1] || ''}`.trim() },
  { pattern: /^distance(\d*)$/i, type: 'distance', max: 400, unit: 'cm', getLabel: (m) => `Khoảng cách ${m[1] || ''}`.trim() },
];

const mapKeyToMultiPort = (key, rawVal, targetPorts) => {
  const upperKey = key.toUpperCase();
  const strVal = String(rawVal).trim();

  if (upperKey === 'TEMP' || upperKey === 'TEMPERATURE') {
    targetPorts.temperature = strVal.includes('°') ? strVal : `${strVal} °C`;
    return true;
  }
  if (upperKey === 'HUMI' || upperKey === 'HUM' || upperKey === 'HUMIDITY') {
    targetPorts.humidity = strVal.includes('%') ? strVal : `${strVal} %`;
    return true;
  }
  if (upperKey === 'LIGHT' || upperKey === 'A0' || upperKey === 'ANALOG' || upperKey === 'ANALOGSENSOR') {
    targetPorts.analogSensor = strVal;
    return true;
  }
  if (upperKey === 'SERVO' || upperKey === 'SERVOANGLE') {
    targetPorts.servoAngle = strVal.includes('°') ? strVal : `${strVal}°`;
    return true;
  }
  return false;
};

/**
 * Parser tự động hỗ trợ cả JSON {"temp": ..., "humi": ..., "servo": ...}
 * và Key-Value "TEMP:xx,HUMI:yy,A0:zz"
 */
export const parseStickEmPayload = (text) => {
  if (!text) {
    return {
      isJson: false,
      isKeyValue: false,
      isParsed: false,
      rawText: '',
      meta: {},
      portsUpdate: {},
      numericClimate: {},
      servoNumeric: null,
      sensors: [],
      summaryText: '',
    };
  }

  const trimmed = text.trim();

  // 1. DẠNG JSON: {"temp": ..., "humi": ..., "servo": ...}
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const meta = {};
        const portsUpdate = {};
        const numericClimate = {};
        let servoNumeric = null;
        const sensors = [];
        const summaryParts = [];

        Object.entries(parsed).forEach(([key, value]) => {
          if (key.startsWith('_')) {
            meta[key.slice(1)] = value;
            return;
          }

          summaryParts.push(`${key}: ${value}`);

          const upperKey = key.toUpperCase();
          if ((upperKey === 'TEMP' || upperKey === 'TEMPERATURE') && !Number.isNaN(Number(value))) {
            numericClimate.temp = Number(value);
          }
          if ((upperKey === 'HUMI' || upperKey === 'HUM' || upperKey === 'HUMIDITY') && !Number.isNaN(Number(value))) {
            numericClimate.hum = Number(value);
          }
          if ((upperKey === 'SERVO' || upperKey === 'SERVOANGLE') && !Number.isNaN(Number(value))) {
            servoNumeric = Number(value);
          }

          if (mapKeyToMultiPort(key, value, portsUpdate)) {
            return;
          }

          let matchedRule = null;
          let matchResult = null;
          for (const rule of SENSOR_METADATA_MAP) {
            const res = key.match(rule.pattern);
            if (res) {
              matchedRule = rule;
              matchResult = res;
              break;
            }
          }

          if (matchedRule) {
            sensors.push({
              key,
              label: matchedRule.getLabel(matchResult),
              value,
              type: matchedRule.type,
              unit: matchedRule.unit || '',
              max: matchedRule.max || 100,
            });
          } else {
            sensors.push({
              key,
              label: key,
              value,
              type: typeof value === 'boolean' ? 'touch' : typeof value === 'number' ? 'number' : 'text',
              unit: '',
              max: 100,
            });
          }
        });

        return {
          isJson: true,
          isKeyValue: false,
          isParsed: true,
          rawObject: parsed,
          meta,
          portsUpdate,
          numericClimate,
          servoNumeric,
          sensors,
          summaryText: summaryParts.join(' • '),
        };
      }
    } catch {
      // Fall through if JSON incomplete/invalid
    }
  }

  // 2. DẠNG KEY-VALUE: "TEMP:xx,HUMI:yy,A0:zz"
  if (trimmed.includes(':')) {
    const items = trimmed.split(/[,;\n]/);
    const portsUpdate = {};
    const numericClimate = {};
    let servoNumeric = null;
    const extraSensors = [];
    const rawKvObj = {};
    const summaryParts = [];

    items.forEach((item) => {
      const colonIdx = item.indexOf(':');
      if (colonIdx === -1) return;
      const key = item.slice(0, colonIdx).trim();
      const val = item.slice(colonIdx + 1).trim();
      if (!key || !val) return;

      rawKvObj[key] = val;
      summaryParts.push(`${key}: ${val}`);

      const upperKey = key.toUpperCase();
      if ((upperKey === 'TEMP' || upperKey === 'TEMPERATURE') && !Number.isNaN(Number(val))) {
        numericClimate.temp = Number(val);
      }
      if ((upperKey === 'HUMI' || upperKey === 'HUM' || upperKey === 'HUMIDITY') && !Number.isNaN(Number(val))) {
        numericClimate.hum = Number(val);
      }
      if ((upperKey === 'SERVO' || upperKey === 'SERVOANGLE') && !Number.isNaN(Number(val))) {
        servoNumeric = Number(val);
      }

      if (!mapKeyToMultiPort(key, val, portsUpdate)) {
        extraSensors.push({
          key,
          label: key,
          value: val,
          type: Number.isNaN(Number(val)) ? 'text' : 'number',
          unit: '',
          max: 100,
        });
      }
    });

    if (summaryParts.length > 0) {
      return {
        isJson: false,
        isKeyValue: true,
        isParsed: true,
        rawObject: rawKvObj,
        meta: {},
        portsUpdate,
        numericClimate,
        servoNumeric,
        sensors: extraSensors,
        summaryText: summaryParts.join(' • '),
      };
    }
  }

  // 3. CHƯA PARSE ĐƯỢC -> TRẢ VỀ CHUỖI THÔ
  return {
    isJson: false,
    isKeyValue: false,
    isParsed: false,
    rawText: trimmed,
    meta: {},
    portsUpdate: {},
    numericClimate: {},
    servoNumeric: null,
    sensors: [],
    summaryText: trimmed,
  };
};

const formatTimeWithMs = () => {
  const now = new Date();
  const base = now.toLocaleTimeString('vi-VN', { hour12: false });
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  return `${base}.${ms}`;
};

class BleStickEmStore {
  constructor() {
    this.device = null;
    this.notifyCharacteristic = null;
    this.writeCharacteristic = null;
    this.characteristicMap = new Map();
    this.rxBuffer = '';
    this.hexBuffer = [];
    this.byteLengthBuffer = 0;
    this.flushTimer = null;
    this.isWriting = false;
    this.commandQueue = [];
    this.isQueueRunning = false;
    this.queuedServoWrite = null;
    this.queuedPortWrite = null;
    this.probeAborted = false;
    this.packetCounter = 0;
    this.lastTimestampMs = null;
    this.listeners = new Set();
    this.climateSyncCallback = null;

    this.state = {
      status: 'Chưa kết nối',
      connectionState: 'inactive', // 'inactive' | 'warning' | 'active' | 'danger'
      deviceInfo: null,
      canWrite: false,
      writeCharUuid: BLE_CONFIG.WRITE_CHAR_UUID,
      writeMode: 'auto', // 'auto' (WriteWithResponse như control.stickem.sg) | 'withResponse' | 'withoutResponse'
      gattCharacteristics: [],
      servoAngle: 90,
      servoFormat: 'stickem_mv', // 'stickem_mv' | 'stickem_legacy' | 'json_stickem' | 'json' | 'text' | 'bytes'
      servoChannel: 'Servo1', // 'Servo1' | 'Servo2' | 'Servo3' | 'Servo' | 'servo'
      appendNewlineOnWrite: false,
      eightPorts: createInitialEightPorts(),
      detectedModules: [],
      portCommandFormat: 'stickem_mv',
      selectedPortNum: 1,
      probingPortNum: null,
      isProbingPort: false,
      lastScanTime: null,
      speedLevel: 'medium', // 'slow' (4) | 'medium' (7) | 'fast' (10)
      snapBack: true, // true: nhả nút tự dừng (1500), false: giữ trạng thái
      driveConfig: {
        leftPorts: [1],
        rightPorts: [2],
        invertPorts: [],
      },
      activeDriveAction: 'neutral',
      portsData: { ...INITIAL_PORTS_DATA },
      parsedPayload: null,
      rawData: '',
      unparsedRawText: '',
      hexData: '',
      terminalLogs: [], // Tối đa 15 bản tin nhận/gửi gần nhất
      auditPackets: [], // Lưu tối đa 100 gói cho trang BleInspectorPage
      totalPackets: 0,
      lastIntervalMs: null,
      syncToDashboard: true,
    };

    this.handleCharacteristicChanged = this.handleCharacteristicChanged.bind(this);
    this.handleDisconnected = this.handleDisconnected.bind(this);
  }

  getState() {
    return this.state;
  }

  getWriteCharacteristic() {
    return this.writeCharacteristic;
  }

  setState(partial) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((cb) => cb(this.state));
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setClimateSyncHandler(cb) {
    this.climateSyncCallback = cb;
  }

  setServoFormat(servoFormat) {
    this.setState({ servoFormat });
  }

  setServoChannel(servoChannel) {
    this.setState({ servoChannel });
  }

  setAppendNewlineOnWrite(appendNewlineOnWrite) {
    this.setState({ appendNewlineOnWrite });
  }

  setWriteMode(writeMode) {
    this.setState({ writeMode });
  }

  setActiveWriteCharacteristic(uuid) {
    const found = this.characteristicMap.get(uuid);
    if (!found) return false;
    this.writeCharacteristic = found;
    this.setState({
      writeCharUuid: found.uuid,
      canWrite: Boolean(found.properties?.write || found.properties?.writeWithoutResponse),
    });
    this.pushTerminalLog('SYS', `Đổi cổng ghi sang 0x${found.uuid.slice(4, 8).toUpperCase()}`);
    return true;
  }

  setSelectedPortNum(selectedPortNum) {
    this.setState({ selectedPortNum });
  }

  setPortCommandFormat(portCommandFormat) {
    this.setState({ portCommandFormat });
  }

  setPortMode(portNum, mode) {
    this.setState({
      eightPorts: this.state.eightPorts.map((p) =>
        p.port === portNum ? { ...p, mode } : p
      ),
    });
  }

  setSpeedLevel(speedLevel) {
    if (STICKEM_SPEEDS[speedLevel]) {
      this.setState({ speedLevel });
    }
  }

  setSnapBack(snapBack) {
    this.setState({ snapBack: Boolean(snapBack) });
  }

  setDriveConfig(partialConfig) {
    this.setState({
      driveConfig: { ...this.state.driveConfig, ...partialConfig },
    });
  }

  setServoAngleLocal(angle) {
    const clamped = Math.max(0, Math.min(180, Math.round(angle)));
    this.setState({ servoAngle: clamped });
    return clamped;
  }

  setSyncToDashboard(enabled) {
    this.setState({ syncToDashboard: enabled });
  }

  pushTerminalLog(dir, message) {
    const entry = {
      id: Date.now() + Math.random(),
      time: formatTimeWithMs(),
      dir, // 'RX' | 'TX' | 'SYS' | 'ERR'
      message,
    };
    this.setState({
      terminalLogs: [entry, ...this.state.terminalLogs.slice(0, 14)],
    });
  }

  resetRxBuffer() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    this.rxBuffer = '';
    this.hexBuffer = [];
    this.byteLengthBuffer = 0;
  }

  applyDecodedPacket(text, hexStr, byteLength) {
    const nowMs = Date.now();
    const intervalMs = this.lastTimestampMs ? nowMs - this.lastTimestampMs : null;
    this.lastTimestampMs = nowMs;
    this.packetCounter += 1;

    const parsed = parseStickEmPayload(text);
    const timeMsLabel = formatTimeWithMs();

    const nextPortsData =
      Object.keys(parsed.portsUpdate).length > 0
        ? { ...this.state.portsData, ...parsed.portsUpdate }
        : this.state.portsData;

    // Cập nhật danh sách module đã phát hiện đang cắm từ payload thực tế
    let nextDetectedModules = this.state.detectedModules;
    let nextEightPorts = this.state.eightPorts;

    if (parsed.rawObject && typeof parsed.rawObject === 'object') {
      const moduleMap = new Map(
        this.state.detectedModules.map((m) => [m.key, m])
      );
      const portDirectUpdates = new Map();

      Object.entries(parsed.rawObject).forEach(([key, val]) => {
        if (key.startsWith('_')) return;
        moduleMap.set(key, {
          key,
          value: val,
          updatedAt: timeMsLabel,
        });

        // Kiểm tra nếu key có số chân 1..8 rõ ràng (vd: Port1, P1, Pin1, D1, Servo1)
        const portMatch = key.match(/^(?:port|pin|p|d|servo|s|ch|channel)(\d+)$/i);
        if (portMatch) {
          const pNum = Number(portMatch[1]);
          if (pNum >= 1 && pNum <= 8) {
            portDirectUpdates.set(pNum, { key, val });
          }
        }
      });

      nextDetectedModules = Array.from(moduleMap.values());
      if (portDirectUpdates.size > 0) {
        nextEightPorts = this.state.eightPorts.map((p) => {
          const hit = portDirectUpdates.get(p.port);
          return hit
            ? { ...p, detectedKey: hit.key, detectedValue: hit.val }
            : p;
        });
      }
    }

    if (
      this.state.syncToDashboard &&
      this.climateSyncCallback &&
      (parsed.numericClimate.temp !== undefined || parsed.numericClimate.hum !== undefined)
    ) {
      this.climateSyncCallback(parsed.numericClimate);
    }

    const newAuditItem = {
      seq: this.packetCounter,
      id: nowMs + Math.random(),
      time: timeMsLabel,
      timestampMs: nowMs,
      intervalMs,
      byteLength,
      rawText: text,
      hexStr,
      parsed,
      isValidJson: parsed.isJson,
    };

    const logDisplay = parsed.isParsed
      ? `${parsed.summaryText} (${byteLength}B)`
      : `Raw: "${text}" | Hex: ${hexStr}`;

    this.pushTerminalLog('RX', logDisplay);

    this.setState({
      rawData: text || hexStr,
      unparsedRawText: parsed.isParsed ? '' : text || hexStr,
      hexData: hexStr,
      portsData: nextPortsData,
      eightPorts: nextEightPorts,
      detectedModules: nextDetectedModules,
      parsedPayload: parsed,
      totalPackets: this.packetCounter,
      lastIntervalMs: intervalMs,
      auditPackets: [newAuditItem, ...this.state.auditPackets.slice(0, 99)],
    });
  }

  handleCharacteristicChanged(event) {
    const { rawText, hexStr, byteLength } = decodeBleDataView(event.target.value);

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    this.rxBuffer += rawText;
    this.hexBuffer.push(hexStr);
    this.byteLengthBuffer += byteLength;

    // 1. Tách các dòng hoàn chỉnh kết thúc bằng '\n'
    if (this.rxBuffer.includes('\n')) {
      const lines = this.rxBuffer.split('\n');
      const remainder = lines.pop() || '';
      const fullHex = this.hexBuffer.join(' ');
      const totalBytes = this.byteLengthBuffer;

      for (const line of lines) {
        const cleanLine = line.trim();
        if (cleanLine.length > 0) {
          this.applyDecodedPacket(cleanLine, fullHex, totalBytes);
        }
      }

      this.rxBuffer = remainder;
      this.hexBuffer = remainder ? [hexStr] : [];
      this.byteLengthBuffer = remainder ? remainder.length : 0;
      return;
    }

    // 2. Gói tin JSON hoàn chỉnh không có '\n'
    const trimmedBuf = this.rxBuffer.trim();
    if (trimmedBuf.startsWith('{') && trimmedBuf.endsWith('}')) {
      const fullHex = this.hexBuffer.join(' ');
      const totalBytes = this.byteLengthBuffer;
      this.resetRxBuffer();
      this.applyDecodedPacket(trimmedBuf, fullHex, totalBytes);
      return;
    }

    // 3. Ngăn tràn bộ đệm nếu gói tin dài bất thường
    if (this.rxBuffer.length > 512) {
      const fullHex = this.hexBuffer.join(' ');
      const totalBytes = this.byteLengthBuffer;
      this.resetRxBuffer();
      if (trimmedBuf) {
        this.applyDecodedPacket(trimmedBuf, fullHex, totalBytes);
      }
      return;
    }

    // 4. Fallback sau 80ms cho gói KEY:VALUE hoặc chuỗi thô không có '\n'
    if (!trimmedBuf.startsWith('{') && trimmedBuf.length > 0) {
      this.flushTimer = setTimeout(() => {
        const pendingText = this.rxBuffer.trim();
        const fullHex = this.hexBuffer.join(' ');
        const totalBytes = this.byteLengthBuffer;
        this.resetRxBuffer();
        if (pendingText) {
          this.applyDecodedPacket(pendingText, fullHex, totalBytes);
        }
      }, 80);
    }
  }

  handleDisconnected() {
    this.resetRxBuffer();
    this.writeCharacteristic = null;
    this.notifyCharacteristic = null;
    this.characteristicMap.clear();
    this.device = null;
    this.lastTimestampMs = null;
    this.isWriting = false;
    this.commandQueue = [];
    this.isQueueRunning = false;
    this.queuedServoWrite = null;
    this.queuedPortWrite = null;
    this.probeAborted = true;
    this.pushTerminalLog('ERR', 'Thiết bị BLE đã ngắt kết nối (gattserverdisconnected).');
    this.setState({
      status: 'Chưa kết nối',
      connectionState: 'inactive',
      deviceInfo: null,
      canWrite: false,
      gattCharacteristics: [],
      isProbingPort: false,
      probingPortNum: null,
      activeDriveAction: 'neutral',
    });
  }

  buildRequestDeviceOptions() {
    // Lọc đúng chuẩn control.stickem.sg (prefix U+2800) kèm tên board Stick 'Em, không quét full thiết bị Bluetooth khác
    return {
      filters: [
        { namePrefix: BLE_CONFIG.STICKEM_NAME_PREFIX },
        { namePrefix: 'Stick' },
        { name: BLE_CONFIG.DEFAULT_DEVICE_NAME },
      ],
      optionalServices: [BLE_CONFIG.SERVICE_UUID],
    };
  }

  async connectDevice(onLog) {
    if (!isWebBluetoothSupported()) {
      this.setState({
        status:
          'Trình duyệt không hỗ trợ Web Bluetooth (hãy dùng Chrome/Edge trên HTTPS hoặc localhost).',
        connectionState: 'danger',
      });
      return null;
    }

    const previousState = {
      status: this.state.status,
      connectionState: this.state.connectionState,
      wasConnected: Boolean(this.device?.gatt?.connected),
    };

    try {
      sound.playClick();
      this.pushTerminalLog('SYS', 'Đang quét tìm thiết bị BLE Stick \'Em...');
      this.setState({
        status: 'Đang kết nối...',
        connectionState: 'warning',
      });

      const options = this.buildRequestDeviceOptions();
      const device = await navigator.bluetooth.requestDevice(options);

      // Chỉ ngắt kết nối cũ sau khi người dùng chọn xong thiết bị mới
      this.cleanupListeners();
      this.resetRxBuffer();

      const friendlyName = formatFriendlyDeviceName(device.name || device.id);
      this.device = device;
      this.setState({
        deviceInfo: {
          name: friendlyName,
          id: device.id,
        },
        status: 'Đang kết nối...',
        connectionState: 'warning',
      });

      device.addEventListener('gattserverdisconnected', this.handleDisconnected);

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(BLE_CONFIG.SERVICE_UUID);

      // Quét danh sách characteristic trong service 0xFFE0 để lưu & log quyền
      let allChars = [];
      const gattCharacteristics = [];
      this.characteristicMap.clear();
      try {
        allChars = await service.getCharacteristics();
        allChars.forEach((c) => {
          this.characteristicMap.set(c.uuid, c);
          const caps = [];
          if (c.properties.read) caps.push('READ');
          if (c.properties.write) caps.push('WRITE');
          if (c.properties.writeWithoutResponse) caps.push('WRITE_NO_RSP');
          if (c.properties.notify) caps.push('NOTIFY');
          gattCharacteristics.push({
            uuid: c.uuid,
            shortUuid: `0x${c.uuid.slice(4, 8).toUpperCase()}`,
            canRead: Boolean(c.properties.read),
            canWrite: Boolean(c.properties.write || c.properties.writeWithoutResponse),
            canNotify: Boolean(c.properties.notify || c.properties.indicate),
            caps,
          });
          this.pushTerminalLog('SYS', `Char ${c.uuid.slice(4, 8).toUpperCase()} [${caps.join(', ')}]`);
        });
      } catch {
        // Bỏ qua nếu thiết bị không cho enumerate
      }

      // Đọc thêm Firmware Characteristic 0xFFE3 (nếu hỗ trợ, như control.stickem.sg)
      try {
        const fwChar = allChars.find((c) => c.uuid.slice(4, 8).toLowerCase() === 'ffe3');
        if (fwChar?.properties?.read) {
          const fwBuf = await fwChar.readValue();
          const fwStr = new TextDecoder('utf-8').decode(fwBuf).replace(/\0/g, '').trim();
          if (fwStr) {
            this.pushTerminalLog('SYS', `Firmware 0xFFE3: ${fwStr}`);
          }
        }
      } catch {
        // Không bắt buộc
      }

      // Lấy Write Characteristic (ưu tiên 0xFFE1 nếu có quyền ghi, fallback sang characteristic có quyền ghi)
      let canWrite = false;
      let writeCharUuid = BLE_CONFIG.WRITE_CHAR_UUID;
      try {
        const wChar = await service.getCharacteristic(BLE_CONFIG.WRITE_CHAR_UUID);
        if (!wChar.properties.write && !wChar.properties.writeWithoutResponse) {
          throw new Error('0xFFE1 không hỗ trợ quyền Write');
        }
        this.writeCharacteristic = wChar;
        canWrite = true;
      } catch {
        const fallbackWrite = allChars.find(
          (c) => c.properties.write || c.properties.writeWithoutResponse
        );
        if (fallbackWrite) {
          this.writeCharacteristic = fallbackWrite;
          writeCharUuid = fallbackWrite.uuid;
          canWrite = true;
          this.pushTerminalLog('SYS', `Dùng cổng ghi dự phòng: ${fallbackWrite.uuid.slice(4, 8).toUpperCase()}`);
        } else {
          this.writeCharacteristic = null;
          this.pushTerminalLog('ERR', 'Không tìm thấy characteristic có quyền ghi (0xFFE1).');
        }
      }

      // Lấy Notify Characteristic (ưu tiên 0xFFE2 nếu có quyền notify/indicate, fallback sang characteristic có notify)
      let rChar = null;
      try {
        const candidate = await service.getCharacteristic(BLE_CONFIG.NOTIFY_CHAR_UUID);
        if (candidate.properties.notify || candidate.properties.indicate) {
          rChar = candidate;
        }
      } catch {
        rChar = null;
      }
      if (!rChar) {
        rChar = allChars.find((c) => c.properties.notify || c.properties.indicate) || null;
      }
      if (!rChar) {
        throw new Error('Không tìm thấy characteristic Notify (0xFFE2)');
      }

      this.notifyCharacteristic = rChar;
      await rChar.startNotifications();
      rChar.addEventListener('characteristicvaluechanged', this.handleCharacteristicChanged);
      this.pushTerminalLog(
        'SYS',
        `Sẵn sàng: Notify ${rChar.uuid.slice(4, 8).toUpperCase()} • Write ${canWrite ? writeCharUuid.slice(4, 8).toUpperCase() : 'Không có'}`
      );

      const connectedName = formatFriendlyDeviceName(device.name || device.id);
      this.setState({
        status: `Đã kết nối (${connectedName})`,
        connectionState: 'active',
        canWrite,
        writeCharUuid,
        gattCharacteristics,
      });
      sound.playSuccess();
      if (onLog) onLog(`Đã kết nối BLE thành công tới ${connectedName}`, 'success');

      return this.writeCharacteristic;
    } catch (err) {
      if (err.name === 'NotFoundError' && previousState.wasConnected) {
        this.setState({
          status: previousState.status,
          connectionState: previousState.connectionState,
        });
        return this.writeCharacteristic;
      }
      const cancelled = err.name === 'NotFoundError';
      this.pushTerminalLog(
        cancelled ? 'SYS' : 'ERR',
        cancelled ? 'Đã hủy chọn thiết bị BLE.' : `Lỗi kết nối: ${err.message}`
      );
      this.setState({
        status: cancelled ? 'Chưa kết nối' : `Lỗi: ${err.message}`,
        connectionState: cancelled ? 'inactive' : 'danger',
      });
      return null;
    }
  }

  async writeBytes(charTarget, encodedBytes) {
    if (!charTarget) return false;
    const mode = this.state.writeMode;

    if (
      mode === 'withoutResponse' &&
      typeof charTarget.writeValueWithoutResponse === 'function' &&
      charTarget.properties?.writeWithoutResponse
    ) {
      await charTarget.writeValueWithoutResponse(encodedBytes);
      return true;
    }

    if (
      typeof charTarget.writeValueWithoutResponse === 'function' &&
      charTarget.properties?.writeWithoutResponse &&
      !charTarget.properties?.write
    ) {
      await charTarget.writeValueWithoutResponse(encodedBytes);
      return true;
    }

    if (
      typeof charTarget.writeValueWithResponse === 'function' &&
      charTarget.properties?.write
    ) {
      try {
        await charTarget.writeValueWithResponse(encodedBytes);
        return true;
      } catch (err) {
        if (
          typeof charTarget.writeValueWithoutResponse === 'function' &&
          charTarget.properties?.writeWithoutResponse
        ) {
          await charTarget.writeValueWithoutResponse(encodedBytes);
          return true;
        }
        throw err;
      }
    }

    await charTarget.writeValue(encodedBytes);
    return true;
  }

  /**
   * Hàng đợi FIFO gửi lệnh chuẩn theo kiến trúc addToQueue/execute của control.stickem.sg
   */
  enqueueCommand(cmdOrBytes, logLabel = null, onLog = null, charOverride = null) {
    const targetChar = charOverride || this.writeCharacteristic;
    if (!targetChar) {
      this.pushTerminalLog('ERR', 'Chưa kết nối cổng Write (0xFFE1).');
      return false;
    }

    const bytes =
      cmdOrBytes instanceof Uint8Array
        ? cmdOrBytes
        : new TextEncoder().encode(String(cmdOrBytes));
    const display =
      logLabel || (typeof cmdOrBytes === 'string' ? cmdOrBytes : `[${bytes.length} bytes]`);

    this.commandQueue.push({ bytes, targetChar, display, onLog });
    this.processCommandQueue();
    return true;
  }

  async processCommandQueue() {
    if (this.isQueueRunning) return;
    this.isQueueRunning = true;

    try {
      while (this.commandQueue.length > 0 && !this.isWriting) {
        const job = this.commandQueue[0];
        if (!job?.targetChar) {
          this.commandQueue.shift();
          continue;
        }
        this.isWriting = true;
        try {
          await this.writeBytes(job.targetChar, job.bytes);
          this.pushTerminalLog('TX', job.display);
          if (job.onLog) job.onLog(`BLE TX -> ${job.display}`, 'info');
          this.commandQueue.shift();
        } catch (err) {
          this.pushTerminalLog('ERR', `Lỗi ghi BLE (${job.display}): ${err.message}`);
          this.commandQueue.shift();
        } finally {
          this.isWriting = false;
        }
        if (this.commandQueue.length > 0) {
          await new Promise((r) => setTimeout(r, 8));
        }
      }
    } finally {
      this.isQueueRunning = false;
    }
  }

  buildServoPayload(angle, format, channel, appendNewline, portNum = 1) {
    const nl = appendNewline ? '\n' : '';
    if (format === 'stickem_mv') {
      const pwm = angleToPwmUs(angle);
      const slots = Array(8).fill('-');
      const idx = Math.max(0, Math.min(7, (Number(portNum) || 1) - 1));
      slots[idx] = pwm;
      const cmd = buildStickEmMvCommand(slots, '-');
      return {
        bytes: new TextEncoder().encode(cmd),
        label: `${cmd} (${angle}° -> ${pwm}µs)`,
      };
    }
    if (format === 'stickem_legacy') {
      const speed = Math.round(((angle - 90) / 90) * 10);
      const cmd = `#${portNum},${speed}`;
      return {
        bytes: new TextEncoder().encode(cmd),
        label: cmd,
      };
    }
    if (format === 'bytes') {
      return {
        bytes: new Uint8Array([0xff, angle]),
        label: `[0xFF, 0x${angle.toString(16).padStart(2, '0')}]`,
      };
    }
    if (format === 'json_stickem') {
      const jsonStr = JSON.stringify({ [channel]: angle }) + nl;
      return {
        bytes: new TextEncoder().encode(jsonStr),
        label: jsonStr.replace(/\n/g, '\\n'),
      };
    }
    if (format === 'json') {
      const jsonStr = JSON.stringify({ servo: angle }) + nl;
      return {
        bytes: new TextEncoder().encode(jsonStr),
        label: jsonStr.replace(/\n/g, '\\n'),
      };
    }
    const textCmd = `SERVO:${angle}\n`;
    return {
      bytes: new TextEncoder().encode(textCmd),
      label: `"SERVO:${angle}\\n"`,
    };
  }

  /**
   * Gửi lệnh điều khiển Servo xuống cổng ghi (0xFFE1):
   * Mặc định chuẩn control.stickem.sg (mv:PWM:-:...-), hỗ trợ legacy & JSON/Text/Byte
   */
  async sendServoCommand(
    angle,
    charOverride = null,
    formatOverride = null,
    onLog,
    channelOverride = null
  ) {
    const targetChar = charOverride || this.writeCharacteristic;
    const clampedAngle = Math.max(0, Math.min(180, Math.round(angle)));
    const portNum = this.state.selectedPortNum || 1;
    const pwm = angleToPwmUs(clampedAngle);

    this.setState({
      servoAngle: clampedAngle,
      eightPorts: this.state.eightPorts.map((p) =>
        p.port === portNum ? { ...p, value: clampedAngle, pwm } : p
      ),
    });

    if (!targetChar) {
      this.pushTerminalLog('ERR', 'Chưa kết nối cổng Write (0xFFE1).');
      return false;
    }

    const format = formatOverride || this.state.servoFormat;
    const channel = channelOverride || this.state.servoChannel;
    const appendNl = this.state.appendNewlineOnWrite;

    const { bytes, label } = this.buildServoPayload(
      clampedAngle,
      format,
      channel,
      appendNl,
      portNum
    );
    return this.enqueueCommand(bytes, `Servo Chân ${portNum} (${format}) -> ${label}`, onLog, targetChar);
  }

  /**
   * Thử lần lượt các định dạng phổ biến để tìm đúng định dạng firmware của kit nhận
   */
  async probeServoFormats(angle = 180, charOverride = null, onLog) {
    const targetChar = charOverride || this.writeCharacteristic;
    const clampedAngle = Math.max(0, Math.min(180, Math.round(angle)));
    const portNum = this.state.selectedPortNum || 1;
    if (!targetChar) {
      this.pushTerminalLog('ERR', 'Chưa kết nối cổng Write (0xFFE1).');
      return false;
    }

    const ch = this.state.servoChannel || 'Servo1';
    const slotsMax = Array(8).fill('-');
    slotsMax[portNum - 1] = 2000;
    const slotsMin = Array(8).fill('-');
    slotsMin[portNum - 1] = 1000;
    const mvMax = buildStickEmMvCommand(slotsMax, '-');
    const mvMin = buildStickEmMvCommand(slotsMin, '-');

    const candidates = [
      { label: `${mvMax} (Stick 'Em PWM Max)`, bytes: new TextEncoder().encode(mvMax) },
      { label: `${mvMin} (Stick 'Em PWM Min)`, bytes: new TextEncoder().encode(mvMin) },
      { label: `#${portNum},10 (Legacy)`, bytes: new TextEncoder().encode(`#${portNum},10`) },
      { label: `{"${ch}":${clampedAngle}}`, bytes: new TextEncoder().encode(`{"${ch}":${clampedAngle}}`) },
      { label: `SERVO:${clampedAngle}\\n`, bytes: new TextEncoder().encode(`SERVO:${clampedAngle}\n`) },
    ];

    this.pushTerminalLog('SYS', `Bắt đầu thử ${candidates.length} định dạng lệnh Servo...`);
    for (const c of candidates) {
      if (!this.writeCharacteristic) break;
      this.enqueueCommand(c.bytes, `Probe -> ${c.label}`, null, targetChar);
      await new Promise((r) => setTimeout(r, 280));
    }
    if (onLog) onLog(`Đã thử gửi ${candidates.length} định dạng Servo`, 'info');
    return true;
  }

  buildPortPayload(portNum, value, format, appendNewline = false, mode = 'servo') {
    const nl = appendNewline ? '\n' : '';
    const idxZero = portNum - 1;

    switch (format) {
      case 'stickem_mv': {
        const pwm = mode === 'digital' ? (value ? 2000 : 1500) : angleToPwmUs(value);
        const slots = Array(8).fill('-');
        slots[idxZero] = pwm;
        const str = buildStickEmMvCommand(slots, '-');
        return { bytes: new TextEncoder().encode(str), label: str };
      }
      case 'stickem_legacy': {
        const spd = mode === 'digital' ? (value ? 10 : 0) : Math.round(((value - 90) / 90) * 10);
        const str = `#${portNum},${spd}`;
        return { bytes: new TextEncoder().encode(str), label: str };
      }
      case 'json_servo_0': {
        const str = JSON.stringify({ [`Servo${idxZero}`]: value }) + nl;
        return { bytes: new TextEncoder().encode(str), label: str.replace(/\n/g, '\\n') };
      }
      case 'json_port_n': {
        const str = JSON.stringify({ [`Port${portNum}`]: value }) + nl;
        return { bytes: new TextEncoder().encode(str), label: str.replace(/\n/g, '\\n') };
      }
      case 'json_p_n': {
        const str = JSON.stringify({ [`P${portNum}`]: value }) + nl;
        return { bytes: new TextEncoder().encode(str), label: str.replace(/\n/g, '\\n') };
      }
      case 'json_obj_servo': {
        const str = JSON.stringify({ servo: portNum, angle: value }) + nl;
        return { bytes: new TextEncoder().encode(str), label: str.replace(/\n/g, '\\n') };
      }
      case 'json_obj_port': {
        const str = JSON.stringify({ port: portNum, value }) + nl;
        return { bytes: new TextEncoder().encode(str), label: str.replace(/\n/g, '\\n') };
      }
      case 'text_servo_n': {
        const str = `SERVO${portNum}:${value}\n`;
        return { bytes: new TextEncoder().encode(str), label: `"SERVO${portNum}:${value}\\n"` };
      }
      case 'text_servo_colon': {
        const str = `SERVO:${portNum}:${value}\n`;
        return { bytes: new TextEncoder().encode(str), label: `"SERVO:${portNum}:${value}\\n"` };
      }
      case 'bytes_3': {
        const clampedByte = Math.max(0, Math.min(255, Math.round(value)));
        return {
          bytes: new Uint8Array([0xff, portNum, clampedByte]),
          label: `[0xFF, 0x0${portNum}, 0x${clampedByte.toString(16).padStart(2, '0')}]`,
        };
      }
      case 'json_servo_n':
      default: {
        const str = JSON.stringify({ [`Servo${portNum}`]: value }) + nl;
        return { bytes: new TextEncoder().encode(str), label: str.replace(/\n/g, '\\n') };
      }
    }
  }

  /**
   * Điều khiển độc lập từng chân (Chân 1..8) theo góc/trạng thái
   */
  async sendPortCommand(portNum, rawValue, formatOverride = null, onLog) {
    const portObj = this.state.eightPorts.find((p) => p.port === portNum);
    const mode = portObj?.mode || 'servo';
    const nextValue =
      mode === 'digital'
        ? rawValue ? 1 : 0
        : Math.max(0, Math.min(180, Math.round(Number(rawValue))));
    const nextPwm = mode === 'digital' ? (nextValue ? 2000 : 1500) : angleToPwmUs(nextValue);

    this.setState({
      selectedPortNum: portNum,
      ...(mode === 'servo' ? { servoAngle: nextValue } : {}),
      eightPorts: this.state.eightPorts.map((p) =>
        p.port === portNum
          ? {
              ...p,
              value: mode === 'servo' ? nextValue : p.value,
              pwm: nextPwm,
              isOn: mode === 'digital' ? Boolean(nextValue) : p.isOn,
            }
          : p
      ),
    });

    const format = formatOverride || this.state.portCommandFormat;
    const appendNl = this.state.appendNewlineOnWrite;
    const { bytes, label } = this.buildPortPayload(portNum, nextValue, format, appendNl, mode);
    return this.enqueueCommand(bytes, `[Chân ${portNum}] -> ${label}`, onLog);
  }

  /**
   * Xoay trực tiếp một chân theo chiều & tốc độ chuẩn control.stickem.sg (mv:PWM:-:...-,)
   */
  rotatePort(portNum, direction = 'cw', speedOverride = null, onLog = null) {
    const spdLevel = speedOverride || this.state.speedLevel || 'medium';
    const spd = STICKEM_SPEEDS[spdLevel] ?? 7;
    const signedSpeed = direction === 'cw' ? spd : direction === 'ccw' ? -spd : 0;
    const pwm = speedToPwmUs(signedSpeed);
    const angleEq = Math.round(((pwm - 1000) / 1000) * 180);

    this.setState({
      selectedPortNum: portNum,
      servoAngle: angleEq,
      eightPorts: this.state.eightPorts.map((p) =>
        p.port === portNum ? { ...p, pwm, value: angleEq } : p
      ),
    });

    if (this.state.portCommandFormat === 'stickem_legacy') {
      const legacyCmd = `#${portNum},${signedSpeed}`;
      return this.enqueueCommand(legacyCmd, `[Chân ${portNum}] -> ${legacyCmd}`, onLog);
    }

    const slots = Array(8).fill('-');
    slots[portNum - 1] = pwm;
    const cmd = buildStickEmMvCommand(slots, '-');
    return this.enqueueCommand(cmd, `[Chân ${portNum}] (${direction.toUpperCase()}) -> ${cmd}`, onLog);
  }

  /**
   * Điều khiển cụm nút di chuyển Robot đa hướng giống control.stickem.sg
   */
  driveRobot(action = 'neutral', onLog = null) {
    const spd = STICKEM_SPEEDS[this.state.speedLevel] ?? 7;
    const { leftPorts = [1], rightPorts = [2], invertPorts = [] } = this.state.driveConfig || {};
    const invertSet = new Set(invertPorts.map(Number));

    const slots = Array(8).fill('-');
    const applyPwm = (port, rawPwm) => {
      if (port < 1 || port > 8) return;
      slots[port - 1] = invertSet.has(port) ? invertPwmUs(rawPwm) : rawPwm;
    };

    if (action === 'neutral' || action === 'stop') {
      leftPorts.forEach((p) => {
        if (p >= 1 && p <= 8) slots[p - 1] = 1500;
      });
      rightPorts.forEach((p) => {
        if (p >= 1 && p <= 8) slots[p - 1] = 1500;
      });
    } else if (action === 'forward') {
      leftPorts.forEach((p) => applyPwm(p, speedToPwmUs(spd)));
      rightPorts.forEach((p) => applyPwm(p, speedToPwmUs(-spd)));
    } else if (action === 'backward') {
      leftPorts.forEach((p) => applyPwm(p, speedToPwmUs(-spd)));
      rightPorts.forEach((p) => applyPwm(p, speedToPwmUs(spd)));
    } else if (action === 'left') {
      leftPorts.forEach((p) => applyPwm(p, speedToPwmUs(-spd)));
      rightPorts.forEach((p) => applyPwm(p, speedToPwmUs(-spd)));
    } else if (action === 'right') {
      leftPorts.forEach((p) => applyPwm(p, speedToPwmUs(spd)));
      rightPorts.forEach((p) => applyPwm(p, speedToPwmUs(spd)));
    }

    this.setState({
      activeDriveAction: action,
      eightPorts: this.state.eightPorts.map((p) =>
        typeof slots[p.port - 1] === 'number' ? { ...p, pwm: slots[p.port - 1] } : p
      ),
    });

    if (this.state.portCommandFormat === 'stickem_legacy') {
      let legacyCmd = '';
      slots.forEach((v, idx) => {
        if (typeof v === 'number') {
          legacyCmd += `#${idx + 1},${Math.round((v - 1500) / 50)}`;
        }
      });
      return this.enqueueCommand(legacyCmd || '#1,0#2,0', `[Drive ${action}] -> ${legacyCmd}`, onLog);
    }

    const cmd = buildStickEmMvCommand(slots, '-');
    return this.enqueueCommand(cmd, `[Di chuyển: ${action}] -> ${cmd}`, onLog);
  }

  stopAllPorts(onLog = null) {
    sound.playClick();
    this.probeAborted = true;
    this.setState({
      isProbingPort: false,
      probingPortNum: null,
      activeDriveAction: 'neutral',
      eightPorts: this.state.eightPorts.map((p) => ({ ...p, pwm: 1500 })),
    });
    const cmd =
      this.state.portCommandFormat === 'stickem_legacy'
        ? '#1,0#2,0#3,0#4,0#5,0#6,0#7,0#8,0'
        : 'stopAll,';
    return this.enqueueCommand(cmd, `[Dừng khẩn cấp] -> ${cmd}`, onLog);
  }

  /**
   * Quét cảm biến đang cắm bằng lệnh chuẩn scanAll, của control.stickem.sg
   */
  async scanPluggedPorts(onLog) {
    sound.playClick();
    const detected = this.state.detectedModules;
    const scanTime = formatTimeWithMs();

    this.setState({ lastScanTime: scanTime });

    if (detected.length > 0) {
      const listStr = detected.map((d) => `${d.key}=${d.value}`).join(', ');
      this.pushTerminalLog('SYS', `Cảm biến đang nhận (${detected.length}): ${listStr}`);
    } else {
      this.pushTerminalLog('SYS', 'Đang gửi "scanAll," để kit báo các cảm biến đang cắm...');
    }

    this.enqueueCommand('scanAll,', 'Quét cảm biến -> "scanAll,"', onLog);
  }

  stopPortProbe() {
    this.probeAborted = true;
    this.setState({ isProbingPort: false, probingPortNum: null });
    if (this.writeCharacteristic) {
      this.enqueueCommand('stopAll,', '[Dừng dò] -> stopAll,');
    }
  }

  confirmDetectedPort(portNum, onLog) {
    sound.playSuccess();
    this.probeAborted = true;
    this.setState({
      isProbingPort: false,
      probingPortNum: null,
      selectedPortNum: portNum,
      eightPorts: this.state.eightPorts.map((p) => ({ ...p, pwm: 1500 })),
    });
    if (this.writeCharacteristic) {
      this.enqueueCommand('stopAll,', `[Chọn Chân ${portNum}] -> stopAll,`);
    }
    this.pushTerminalLog('SYS', `Đã khóa điều khiển ở CHÂN ${portNum}! Dùng nút Xoay / Di chuyển để thử ngay.`);
    if (onLog) onLog(`Đã chọn CHÂN ${portNum} làm cổng điều khiển chính`, 'success');
  }

  /**
   * Tự động dò lần lượt từ Chân 1 -> Chân 8 bằng xung PWM mv:... để thấy Servo quay ở chân nào
   */
  async autoDetectActivePort(onLog) {
    if (!this.writeCharacteristic) {
      this.pushTerminalLog('ERR', 'Chưa kết nối cổng Write (0xFFE1).');
      return false;
    }
    sound.playClick();
    this.probeAborted = false;
    this.setState({ isProbingPort: true, probingPortNum: 1 });
    this.pushTerminalLog('SYS', 'Bắt đầu tự động dò Chân 1 → Chân 8 (hãy nhìn Servo nhúc nhích ở chân nào rồi bấm Chọn)...');

    for (let port = 1; port <= 8; port++) {
      if (this.probeAborted || !this.writeCharacteristic) break;
      this.setState({ probingPortNum: port, selectedPortNum: port });
      this.pushTerminalLog('SYS', `Đang nhấp thử CHÂN ${port}...`);

      // Nhấp xoay thuận tối đa (2000) -> ngược tối đa (1000) -> dừng (1500) để dễ quan sát nhất
      const cwSlots = Array(8).fill('-');
      cwSlots[port - 1] = 2000;
      const ccwSlots = Array(8).fill('-');
      ccwSlots[port - 1] = 1000;
      const stopSlots = Array(8).fill('-');
      stopSlots[port - 1] = 1500;

      const cwCmd = buildStickEmMvCommand(cwSlots, '-');
      this.enqueueCommand(cwCmd, `[Tự dò Chân ${port}] Xoay CW -> ${cwCmd}`);
      await new Promise((r) => setTimeout(r, 420));
      if (this.probeAborted || !this.writeCharacteristic) break;

      const ccwCmd = buildStickEmMvCommand(ccwSlots, '-');
      this.enqueueCommand(ccwCmd, `[Tự dò Chân ${port}] Xoay CCW -> ${ccwCmd}`);
      await new Promise((r) => setTimeout(r, 420));
      if (this.probeAborted || !this.writeCharacteristic) break;

      const stopCmd = buildStickEmMvCommand(stopSlots, '-');
      this.enqueueCommand(stopCmd, `[Tự dò Chân ${port}] Dừng -> 1500`);
      await new Promise((r) => setTimeout(r, 220));
    }

    const stoppedEarly = this.probeAborted;
    this.setState({ isProbingPort: false, probingPortNum: null });
    if (!stoppedEarly) {
      this.pushTerminalLog('SYS', 'Đã quét hết 8 chân (Chân 1 → Chân 8). Chọn chân vừa thấy Servo quay!');
      if (onLog) onLog('Hoàn tất tự động dò Chân 1 → Chân 8', 'info');
    }
    return true;
  }

  /**
   * Thử lần lượt các định dạng giao thức cho riêng một chân để kiểm tra tương thích firmware
   */
  async probePortFormats(portNum, targetAngle = 180, onLog) {
    if (!this.writeCharacteristic) {
      this.pushTerminalLog('ERR', 'Chưa kết nối cổng Write (0xFFE1).');
      return false;
    }

    const angle = Math.max(0, Math.min(180, Math.round(Number(targetAngle))));
    const idxZero = portNum - 1;
    const slotsMax = Array(8).fill('-');
    slotsMax[idxZero] = 2000;
    const slotsMin = Array(8).fill('-');
    slotsMin[idxZero] = 1000;
    const mvMax = buildStickEmMvCommand(slotsMax, '-');
    const mvMin = buildStickEmMvCommand(slotsMin, '-');

    const candidates = [
      { label: `${mvMax} (Stick 'Em CW)`, bytes: new TextEncoder().encode(mvMax) },
      { label: `${mvMin} (Stick 'Em CCW)`, bytes: new TextEncoder().encode(mvMin) },
      { label: `#${portNum},10 (Legacy)`, bytes: new TextEncoder().encode(`#${portNum},10`) },
      { label: `{"Servo${portNum}":${angle}}`, bytes: new TextEncoder().encode(`{"Servo${portNum}":${angle}}`) },
      { label: `{"Servo${idxZero}":${angle}}`, bytes: new TextEncoder().encode(`{"Servo${idxZero}":${angle}}`) },
      { label: `{"Port${portNum}":${angle}}`, bytes: new TextEncoder().encode(`{"Port${portNum}":${angle}}`) },
      { label: `SERVO${portNum}:${angle}\\n`, bytes: new TextEncoder().encode(`SERVO${portNum}:${angle}\n`) },
      { label: `[0xFF, ${portNum}, ${angle}]`, bytes: new Uint8Array([0xff, portNum, angle]) },
    ];

    this.probeAborted = false;
    this.setState({ isProbingPort: true, selectedPortNum: portNum, probingPortNum: portNum });
    this.pushTerminalLog('SYS', `Bắt đầu dò ${candidates.length} giao thức cho Chân ${portNum}...`);

    for (const c of candidates) {
      if (this.probeAborted || !this.writeCharacteristic) break;
      this.enqueueCommand(c.bytes, `[Dò Chân ${portNum}] -> ${c.label}`);
      await new Promise((r) => setTimeout(r, 280));
    }

    this.setState({ isProbingPort: false, probingPortNum: null });
    if (onLog) onLog(`Hoàn tất dò định dạng cho Chân ${portNum}`, 'info');
    return true;
  }

  async sendTextCommand(cmdText, appendNewline = false, charOverride = null, onLog) {
    const targetChar = charOverride || this.writeCharacteristic;
    if (!targetChar) {
      this.pushTerminalLog('ERR', 'Chưa kết nối cổng ghi 0xFFE1 để gửi lệnh.');
      return false;
    }

    sound.playClick();
    const payload =
      appendNewline && !cmdText.endsWith('\n') ? `${cmdText}\n` : cmdText;
    const displayPayload = payload.replace(/\n/g, '\\n');
    return this.enqueueCommand(payload, `Thủ công -> "${displayPayload}"`, onLog, targetChar);
  }

  cleanupListeners() {
    if (this.notifyCharacteristic) {
      this.notifyCharacteristic.removeEventListener(
        'characteristicvaluechanged',
        this.handleCharacteristicChanged
      );
      this.notifyCharacteristic = null;
    }
    this.writeCharacteristic = null;
    this.characteristicMap.clear();
    this.commandQueue = [];
    this.isQueueRunning = false;
    this.queuedServoWrite = null;
    this.queuedPortWrite = null;
    this.probeAborted = true;
    if (this.device) {
      this.device.removeEventListener(
        'gattserverdisconnected',
        this.handleDisconnected
      );
      if (this.device.gatt?.connected) {
        this.device.gatt.disconnect();
      }
      this.device = null;
    }
  }

  disconnectDevice(onLog) {
    sound.playClick();
    this.cleanupListeners();
    this.resetRxBuffer();
    this.lastTimestampMs = null;
    this.isWriting = false;
    this.queuedServoWrite = null;
    this.queuedPortWrite = null;
    this.pushTerminalLog('SYS', 'Đã ngắt kết nối Bluetooth.');
    this.setState({
      status: 'Chưa kết nối',
      connectionState: 'inactive',
      deviceInfo: null,
      canWrite: false,
      gattCharacteristics: [],
      isProbingPort: false,
      probingPortNum: null,
      activeDriveAction: 'neutral',
    });
    if (onLog) onLog("Đã ngắt kết nối BLE Stick 'Em", 'info');
  }

  clearHistory() {
    sound.playClick();
    this.setState({
      terminalLogs: [],
      auditPackets: [],
      totalPackets: 0,
      lastIntervalMs: null,
      portsData: { ...INITIAL_PORTS_DATA },
      eightPorts: createInitialEightPorts(),
      detectedModules: [],
      unparsedRawText: '',
    });
    this.packetCounter = 0;
  }
}

export const bleStickEmStore = new BleStickEmStore();

export const useBleStickEm = () => {
  const [bleState, setBleState] = useState(() => bleStickEmStore.getState());

  useEffect(() => {
    const unsubscribe = bleStickEmStore.subscribe(setBleState);
    return unsubscribe;
  }, []);

  return {
    ...bleState,
    getWriteCharacteristic: () => bleStickEmStore.getWriteCharacteristic(),
    connectDevice: (onLog) => bleStickEmStore.connectDevice(onLog),
    disconnectDevice: (onLog) => bleStickEmStore.disconnectDevice(onLog),
    clearHistory: () => bleStickEmStore.clearHistory(),
    setServoFormat: (fmt) => bleStickEmStore.setServoFormat(fmt),
    setServoChannel: (ch) => bleStickEmStore.setServoChannel(ch),
    setAppendNewlineOnWrite: (val) => bleStickEmStore.setAppendNewlineOnWrite(val),
    setWriteMode: (mode) => bleStickEmStore.setWriteMode(mode),
    setActiveWriteCharacteristic: (uuid) => bleStickEmStore.setActiveWriteCharacteristic(uuid),
    setSelectedPortNum: (p) => bleStickEmStore.setSelectedPortNum(p),
    setPortCommandFormat: (fmt) => bleStickEmStore.setPortCommandFormat(fmt),
    setPortMode: (p, mode) => bleStickEmStore.setPortMode(p, mode),
    setSpeedLevel: (lvl) => bleStickEmStore.setSpeedLevel(lvl),
    setSnapBack: (val) => bleStickEmStore.setSnapBack(val),
    setDriveConfig: (cfg) => bleStickEmStore.setDriveConfig(cfg),
    setServoAngleLocal: (angle) => bleStickEmStore.setServoAngleLocal(angle),
    setSyncToDashboard: (val) => bleStickEmStore.setSyncToDashboard(val),
    sendServoCommand: (angle, charRef, fmt, onLog, channel) =>
      bleStickEmStore.sendServoCommand(angle, charRef, fmt, onLog, channel),
    probeServoFormats: (angle, charRef, onLog) =>
      bleStickEmStore.probeServoFormats(angle, charRef, onLog),
    scanPluggedPorts: (onLog) => bleStickEmStore.scanPluggedPorts(onLog),
    autoDetectActivePort: (onLog) => bleStickEmStore.autoDetectActivePort(onLog),
    confirmDetectedPort: (portNum, onLog) => bleStickEmStore.confirmDetectedPort(portNum, onLog),
    sendPortCommand: (portNum, val, fmt, onLog) =>
      bleStickEmStore.sendPortCommand(portNum, val, fmt, onLog),
    rotatePort: (portNum, dir, speed, onLog) =>
      bleStickEmStore.rotatePort(portNum, dir, speed, onLog),
    driveRobot: (action, onLog) => bleStickEmStore.driveRobot(action, onLog),
    stopAllPorts: (onLog) => bleStickEmStore.stopAllPorts(onLog),
    probePortFormats: (portNum, angle, onLog) =>
      bleStickEmStore.probePortFormats(portNum, angle, onLog),
    stopPortProbe: () => bleStickEmStore.stopPortProbe(),
    sendTextCommand: (cmd, nl, charRef, onLog) =>
      bleStickEmStore.sendTextCommand(cmd, nl, charRef, onLog),
  };
};
