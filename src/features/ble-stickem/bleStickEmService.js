/**
 * BLE Stick 'Em Service
 * Cấu hình UUID GATT, giải mã gói tin UTF-8 / Hex và phân tích JSON từ kit Stick 'Em
 */

export const BLE_CONFIG = {
  SERVICE_UUID: '0000ffe0-0000-1000-8000-00805f9b34fb',
  NOTIFY_CHAR_UUID: '0000ffe2-0000-1000-8000-00805f9b34fb',
};

export const isWebBluetoothSupported = () => {
  return typeof navigator !== 'undefined' && Boolean(navigator.bluetooth);
};

export const decodeBleDataView = (value) => {
  const decoder = new TextDecoder('utf-8');
  const text = decoder.decode(value).trim();

  const bytes = [];
  for (let i = 0; i < value.byteLength; i++) {
    bytes.push('0x' + value.getUint8(i).toString(16).padStart(2, '0'));
  }
  const hexStr = bytes.join(' ');

  return { text, hexStr, byteLength: value.byteLength };
};

const SENSOR_METADATA_MAP = [
  { pattern: /^touch(\d*)$/i, type: 'touch', getLabel: (m) => `Cảm ứng Touch ${m[1] || ''}`.trim() },
  { pattern: /^btn|button(\d*)$/i, type: 'touch', getLabel: (m) => `Nút nhấn ${m[1] || ''}`.trim() },
  { pattern: /^ultrasonic(\d*)$/i, type: 'distance', max: 400, unit: 'cm', getLabel: (m) => `Siêu âm Ultrasonic ${m[1] || ''}`.trim() },
  { pattern: /^distance(\d*)$/i, type: 'distance', max: 400, unit: 'cm', getLabel: (m) => `Khoảng cách ${m[1] || ''}`.trim() },
  { pattern: /^temp(erature)?$/i, type: 'number', unit: '°C', getLabel: () => 'Nhiệt độ' },
  { pattern: /^hum(idity)?$/i, type: 'number', unit: '%', getLabel: () => 'Độ ẩm' },
  { pattern: /^light|ldr|lux$/i, type: 'number', unit: 'lux', getLabel: () => 'Ánh sáng' },
];

/**
 * Phân tích chuỗi JSON từ Stick 'Em thành metadata hệ thống + danh sách cảm biến trực quan
 */
export const parseStickEmPayload = (text) => {
  if (!text) {
    return { isJson: false, rawText: '', meta: {}, sensors: [], summaryText: '' };
  }

  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { isJson: false, rawText: text, meta: {}, sensors: [], summaryText: text };
    }

    const meta = {};
    const sensors = [];
    const summaryParts = [];

    Object.entries(parsed).forEach(([key, value]) => {
      if (key.startsWith('_')) {
        const cleanKey = key.slice(1);
        meta[cleanKey] = value;
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

      summaryParts.push(`${key}: ${value}`);
    });

    return {
      isJson: true,
      rawObject: parsed,
      meta,
      sensors,
      summaryText: summaryParts.join('  •  '),
    };
  } catch {
    return { isJson: false, rawText: text, meta: {}, sensors: [], summaryText: text };
  }
};
