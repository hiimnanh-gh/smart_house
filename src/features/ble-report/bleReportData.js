/**
 * Tổng hợp báo cáo các chức năng đã triển khai cùng mã nguồn thực tế (Vite ?raw import)
 * Mọi đoạn code hiển thị trên trang Báo Cáo được trích xuất trực tiếp từ file nguồn hiện hành.
 */

import bleStickEmServiceRaw from '../ble-stickem/bleStickEmService.js?raw';
import bleStickEmPageRaw from '../ble-stickem/BleStickEmPage.jsx?raw';
import stickEmMotionPadRaw from '../ble-stickem/components/StickEmMotionPad.jsx?raw';
import eightPortGridRaw from '../ble-stickem/components/EightPortControlGrid.jsx?raw';
import bleInspectorPageRaw from '../ble-inspector/BleInspectorPage.jsx?raw';
import bleInspectorServiceRaw from '../ble-inspector/bleInspectorService.js?raw';
import smartHomeContextRaw from '../../context/SmartHomeContext.jsx?raw';
import iotBridgeServiceRaw from '../../services/iotBridgeService.js?raw';
import hardwareConnectorRaw from '../iot-debug/components/HardwareConnector.jsx?raw';
import iotDebugPageRaw from '../iot-debug/IotDebugPage.jsx?raw';
import packetTerminalRaw from '../iot-debug/components/PacketTerminal.jsx?raw';

const normalizeEol = (text) => String(text || '').replace(/\r\n/g, '\n');

export const extractSection = (rawSource, startMarker, endMarker = null) => {
  const normalized = normalizeEol(rawSource);
  const allLines = normalized.split('\n');

  if (!startMarker) {
    return {
      code: normalized.trimEnd(),
      fullCode: normalized.trimEnd(),
      startLine: 1,
      endLine: allLines.length,
      totalFileLines: allLines.length,
    };
  }

  const startIdx = normalized.indexOf(startMarker);
  if (startIdx === -1) {
    return {
      code: normalized.trimEnd(),
      fullCode: normalized.trimEnd(),
      startLine: 1,
      endLine: allLines.length,
      totalFileLines: allLines.length,
    };
  }

  const startLine = normalized.slice(0, startIdx).split('\n').length;
  let endIdx = normalized.length;

  if (endMarker) {
    const foundEnd = normalized.indexOf(endMarker, startIdx + startMarker.length);
    if (foundEnd !== -1) {
      endIdx = foundEnd;
    }
  }

  const sliced = normalized.slice(startIdx, endIdx).trimEnd();
  const slicedLineCount = sliced.split('\n').length;

  return {
    code: sliced,
    fullCode: normalized.trimEnd(),
    startLine,
    endLine: startLine + slicedLineCount - 1,
    totalFileLines: allLines.length,
  };
};

export const REPORT_CATEGORIES = [
  { id: 'all', label: 'Tất cả chức năng' },
  { id: 'ble-core', label: 'Kết nối & Giao thức BLE' },
  { id: 'stickem-control', label: "Điều khiển Stick 'Em (8 chân)" },
  { id: 'debug-iot', label: 'Kiểm tra gói tin & Nhúng ESP32' },
];

export const REPORT_FEATURES = [
  {
    id: 'ble-gatt-connection',
    index: '01',
    category: 'ble-core',
    title: "Kết nối Web Bluetooth (BLE) & Quản lý GATT Stick 'Em",
    summary:
      "Thiết lập kết nối trực tiếp tới kit Stick 'Em (Chiendeptry) qua Web Bluetooth API, liệt kê toàn bộ characteristic trong service 0xFFE0, đọc phiên bản firmware (0xFFE3), mở Notify (0xFFE2) và chọn cổng Write (0xFFE1) kèm cơ chế tự khôi phục trạng thái khi ngắt kết nối.",
    highlights: [
      "Tự động lọc riêng board Stick 'Em theo prefix chuẩn U+2800 (\\u2800) giống hệt trang control.stickem.sg (kèm dự phòng 'Stick' / 'Chiendeptry'), không hiện thiết bị Bluetooth rác xung quanh.",
      'Tự loại bỏ ký tự ẩn U+2800 khi hiển thị tên board và tự quét characteristic GATT (READ, WRITE, WRITE_NO_RSP, NOTIFY).',
      'Cho phép chuyển đổi cổng ghi và chế độ WithResponse / NoResponse trực tiếp trên UI.',
      'Bắt sự kiện gattserverdisconnected để reset buffer RX, xóa ref cổng ghi và khóa nút điều khiển.',
    ],
    protocols: ['Web Bluetooth API', 'Service 0xFFE0', 'Write 0xFFE1', 'Notify 0xFFE2', 'FW 0xFFE3'],
    files: [
      'src/features/ble-stickem/bleStickEmService.js',
      'src/features/ble-stickem/BleStickEmPage.jsx',
    ],
    codeBlocks: [
      {
        tabLabel: 'Service: GATT & Kết nối',
        filePath: 'src/features/ble-stickem/bleStickEmService.js',
        ...extractSection(
          bleStickEmServiceRaw,
          '  buildRequestDeviceOptions() {',
          '  buildServoPayload('
        ),
      },
      {
        tabLabel: 'UI: Ref & Ngắt kết nối',
        filePath: 'src/features/ble-stickem/BleStickEmPage.jsx',
        ...extractSection(
          bleStickEmPageRaw,
          '  // Lưu instance Write Characteristic (0xFFE1) vào useRef để gửi lệnh tức thì',
          '  const statusLightClass ='
        ),
      },
    ],
  },
  {
    id: 'stickem-pwm-protocol',
    index: '02',
    category: 'ble-core',
    title: "Giao thức xung PWM Stick 'Em v1.3.x (mv:...) & Hàng đợi FIFO",
    summary:
      'Chuyển hóa góc Servo (0°–180°) hoặc tốc độ xoay (-10..+10) thành định dạng lệnh gốc của trang control.stickem.sg (chuỗi ASCII mv:p1:p2:p3:p4:p5:p6:p7:p8:-, kết thúc bằng dấu phẩy, dải 1000–2000 µs) và xếp lịch tuần tự qua hàng đợi FIFO chống lỗi nghẽn GATT.',
    highlights: [
      'Ánh xạ PWM chính xác theo control.stickem.sg: 0° = 1000 µs, 90°/Dừng = 1500 µs, 180° = 2000 µs.',
      'Mức tốc độ STICKEM_SPEEDS chuẩn: Chậm (4 → 1300/1700), Vừa (7 → 1150/1850), Nhanh (10 → 1000/2000).',
      'Hàng đợi FIFO enqueueCommand / processCommandQueue đảm bảo lệnh nhấn-giữ và nhả nút được gửi đủ theo thứ tự.',
      'Hỗ trợ cả định dạng Legacy (#n,val), JSON và Text dự phòng khi kiểm thử firmware khác.',
    ],
    protocols: ['mv:p1..p8:-,', 'stopAll,', 'scanAll,', '#port,speed', 'FIFO Queue'],
    files: ['src/features/ble-stickem/bleStickEmService.js'],
    codeBlocks: [
      {
        tabLabel: 'Hằng số & Hàm đóng gói PWM',
        filePath: 'src/features/ble-stickem/bleStickEmService.js',
        ...extractSection(
          bleStickEmServiceRaw,
          'export const BLE_CONFIG = {',
          'export const isWebBluetoothSupported ='
        ),
      },
      {
        tabLabel: 'Payload & sendServoCommand',
        filePath: 'src/features/ble-stickem/bleStickEmService.js',
        ...extractSection(
          bleStickEmServiceRaw,
          '  buildServoPayload(',
          '  buildPortPayload('
        ),
      },
    ],
  },
  {
    id: 'auto-detect-port',
    index: '03',
    category: 'stickem-control',
    title: 'Tự động dò chân đang cắm (Chân 1 → Chân 8) & Quét cảm biến',
    summary:
      'Vì cổng Servo/Motor 3 chân không có dây hồi tiếp ID, hệ thống tự động quét tuần tự từ Chân 1 đến Chân 8 bằng cặp xung xoay thuận/ngược tối đa (2000 µs → 1000 µs → 1500 µs), phát sáng thẻ chân tương ứng và cho phép người dùng xác nhận khóa chân chỉ với 1 lần bấm.',
    highlights: [
      'autoDetectActivePort() quét lần lượt từng cổng C1..C8, mỗi chân nhấp đảo 2 chiều giúp cả Servo 180° và 360° đều dễ nhận biết.',
      'confirmDetectedPort() lập tức dừng quá trình quét, gửi stopAll, và gắn chân vừa thấy quay vào bảng điều khiển chính.',
      'scanPluggedPorts() tổng hợp các cảm biến báo lên từ telemetry (Touch1, Touch2, Ultrasonic...) và hỗ trợ lệnh scanAll,.',
      'probePortFormats() hỗ trợ thử nhanh 8 giao thức khác nhau trên riêng 1 chân khi cần debug firmware lạ.',
    ],
    protocols: ['Auto Sweep C1→C8', '2000 ↔ 1000 µs', 'scanAll,', 'stopAll,'],
    files: ['src/features/ble-stickem/bleStickEmService.js'],
    codeBlocks: [
      {
        tabLabel: 'Service: Dò chân & Dò giao thức',
        filePath: 'src/features/ble-stickem/bleStickEmService.js',
        ...extractSection(
          bleStickEmServiceRaw,
          '  /**\n   * Quét cảm biến đang cắm bằng lệnh chuẩn scanAll,',
          '  async sendTextCommand('
        ),
      },
    ],
  },
  {
    id: 'motion-pad-dpad',
    index: '04',
    category: 'stickem-control',
    title: 'Nút xoay Servo & Cụm D-Pad di chuyển kiểu control.stickem.sg',
    summary:
      'Giao diện điều khiển trực tiếp gồm cụm nút Xoay Ngược (CCW) / Dừng / Xoay Thuận cho chân đang chọn, hàng nút góc 0°–180°, và cụm D-Pad 4 hướng Tiến/Lùi/Trái/Phải có cấu hình chân bánh Trái/Phải + đảo chiều, chế độ SNAP BACK / STAY PUT và điều khiển bàn phím (Q/E, WASD, Mũi tên).',
    highlights: [
      'Sử dụng Pointer Events (onPointerDown / onPointerUp / onPointerCancel) chống lặp sự kiện cảm ứng và không sót lệnh nhả.',
      'Chế độ SNAP BACK mặc định tự gửi mức 1500 µs (dừng) khi thả chuột/phím; STAY PUT giữ nguyên trạng thái xoay.',
      'Điều khiển đa hướng driveRobot() tính vi sai hai bánh (Trái/Phải) và áp dụng đảo cực PWM 3000 - pwm nếu cần.',
      'Phím tắt Q/E (xoay chân chọn), W/A/S/D hoặc Mũi tên (di chuyển D-Pad), phím Space để dừng khẩn cấp stopAll,.',
    ],
    protocols: ['Pointer Hold/Release', 'SNAP BACK / STAY PUT', 'WASD / Q-E', 'Differential Drive'],
    files: [
      'src/features/ble-stickem/components/StickEmMotionPad.jsx',
      'src/features/ble-stickem/bleStickEmService.js',
    ],
    codeBlocks: [
      {
        tabLabel: 'UI: StickEmMotionPad',
        filePath: 'src/features/ble-stickem/components/StickEmMotionPad.jsx',
        ...extractSection(
          stickEmMotionPadRaw,
          'export const StickEmMotionPad = ({',
          '  return ('
        ),
      },
      {
        tabLabel: 'Service: rotatePort & driveRobot',
        filePath: 'src/features/ble-stickem/bleStickEmService.js',
        ...extractSection(
          bleStickEmServiceRaw,
          '  rotatePort(',
          '  /**\n   * Quét cảm biến đang cắm bằng lệnh chuẩn scanAll,'
        ),
      },
    ],
  },
  {
    id: 'eight-port-grid',
    index: '05',
    category: 'stickem-control',
    title: 'Bảng điều khiển độc lập từng chân trong 8 cổng (Chân 1 – Chân 8)',
    summary:
      'Hiển thị đồng thời trạng thái cả 8 chân cắm (C1..C8) dạng lưới: mỗi thẻ cho phép chuyển đổi giữa chế độ Servo (thanh trượt 0–180°, nút 0°/90°/180°, 3 nút xoay CCW/Stop/CW) và Digital (BẬT/TẮT), chọn trong 11 kiểu payload gửi lệnh và gắn nhãn cảm biến nếu chân có dữ liệu phản hồi.',
    highlights: [
      'Hiển thị trực quan giá trị PWM (µs) và góc tương ứng trên từng chân.',
      'Làm nổi bật thẻ chân đang thử trong lúc tự động dò kèm nút xác nhận Chọn Chân N ngay trên thẻ.',
      'Thanh hiển thị danh sách toàn bộ module đang phát tín hiệu từ kit (ví dụ Touch1, Touch2, Ultrasonic).',
    ],
    protocols: ['8 Independent Ports', 'Servo / Digital Toggle', '11 Command Formats'],
    files: [
      'src/features/ble-stickem/components/EightPortControlGrid.jsx',
      'src/features/ble-stickem/bleStickEmService.js',
    ],
    codeBlocks: [
      {
        tabLabel: 'UI: EightPortControlGrid',
        filePath: 'src/features/ble-stickem/components/EightPortControlGrid.jsx',
        ...extractSection(
          eightPortGridRaw,
          'export const EightPortControlGrid = ({',
          null
        ),
      },
      {
        tabLabel: 'Service: buildPortPayload & sendPortCommand',
        filePath: 'src/features/ble-stickem/bleStickEmService.js',
        ...extractSection(
          bleStickEmServiceRaw,
          '  buildPortPayload(',
          '  rotatePort('
        ),
      },
    ],
  },
  {
    id: 'telemetry-parser-terminal',
    index: '06',
    category: 'ble-core',
    title: 'Bộ đệm & Giải mã dữ liệu cảm biến (JSON / Key-Value / Hex) + Terminal Log',
    summary:
      'Đọc song song UTF-8 và mảng byte Hex từ characteristic 0xFFE2, tự động ghép mảnh gói tin bị chia nhỏ (hỗ trợ cả JSON không có ký tự xuống dòng như Stick \'Em v1.3.4 lẫn chuỗi Key-Value có dấu phẩy/xuống dòng), cập nhật thẻ cảm biến và hiển thị Terminal 15 bản tin gần nhất.',
    highlights: [
      'Xử lý chuẩn trường hợp gói JSON đóng ngoặc } không kèm \\n bằng buffer theo dõi {...} và timer fallback 80ms.',
      'Tự nhận diện và hiển thị động các cảm biến Touch (Chạm), Ultrasonic (Khoảng cách cm), Nhiệt độ, Độ ẩm, Analog A0, Servo.',
      'Tùy chọn đồng bộ giá trị Nhiệt độ / Độ ẩm nhận từ BLE lên SmartHomeContext toàn cục.',
    ],
    protocols: ['JSON Telemetry', 'Key-Value Parser', 'Hex Byte Array', 'RX Reassembly Buffer'],
    files: [
      'src/features/ble-stickem/bleStickEmService.js',
      'src/context/SmartHomeContext.jsx',
    ],
    codeBlocks: [
      {
        tabLabel: 'Parser JSON / Key-Value & Hex',
        filePath: 'src/features/ble-stickem/bleStickEmService.js',
        ...extractSection(
          bleStickEmServiceRaw,
          'export const decodeBleDataView = (value) => {',
          'const formatTimeWithMs ='
        ),
      },
      {
        tabLabel: 'Bộ đệm RX & applyDecodedPacket',
        filePath: 'src/features/ble-stickem/bleStickEmService.js',
        ...extractSection(
          bleStickEmServiceRaw,
          '  applyDecodedPacket(text, hexStr, byteLength) {',
          '  handleDisconnected()'
        ),
      },
      {
        tabLabel: 'Đồng bộ Dashboard (Context)',
        filePath: 'src/context/SmartHomeContext.jsx',
        ...extractSection(
          smartHomeContextRaw,
          "  // Đồng bộ nhiệt độ / độ ẩm từ cảm biến BLE (Stick 'Em / Chiendeptry) lên Dashboard",
          '  const connectHardware ='
        ),
      },
    ],
  },
  {
    id: 'ble-packet-inspector',
    index: '07',
    category: 'debug-iot',
    title: 'Trang kiểm tra dữ liệu truyền lên (/ble-inspector)',
    summary:
      'Trang kiểm toán chuyên sâu lưu tới 100 gói tin truyền lên từ thiết bị BLE với thời gian chính xác tới mili-giây, đo chu kỳ truyền giữa các gói (intervalMs), tỷ lệ parse JSON thành công, đối chiếu bảng cây key-value với khung Hex thô và hỗ trợ xuất file JSON / CSV.',
    highlights: [
      'Chế độ Tạm dừng (Freeze) để đứng yên soi từng byte mà không bị gói mới trôi mất.',
      'Hiển thị Metadata firmware (_firmwareVersion, _programStatus), trường cảm biến bóc tách và frame Hex byte.',
      'Tìm kiếm lịch sử theo STT, thời gian, nội dung thô hoặc chuỗi Hex và xuất file báo cáo .json / .csv.',
    ],
    protocols: ['100-Packet History', 'CSV / JSON Export', 'Frame Diff & Freeze'],
    files: [
      'src/features/ble-inspector/BleInspectorPage.jsx',
      'src/features/ble-inspector/bleInspectorService.js',
    ],
    codeBlocks: [
      {
        tabLabel: 'Service: Lọc & Xuất JSON/CSV',
        filePath: 'src/features/ble-inspector/bleInspectorService.js',
        ...extractSection(bleInspectorServiceRaw, null, null),
      },
      {
        tabLabel: 'UI: BleInspectorPage (Logic)',
        filePath: 'src/features/ble-inspector/BleInspectorPage.jsx',
        ...extractSection(
          bleInspectorPageRaw,
          'export const BleInspectorPage = () => {',
          '  return ('
        ),
      },
    ],
  },
  {
    id: 'esp32-websocket-bridge',
    index: '08',
    category: 'debug-iot',
    title: 'Cầu nối phần cứng ESP32 qua WebSocket LAN (/iot-debug)',
    summary:
      'Kết nối trực tiếp tới vi điều khiển ESP32 / ESP8266 chạy WebSocket server trong mạng LAN (mặc định ws://192.168.1.120:81) để nhận luồng JSON cảm biến, gửi lệnh điều khiển chân GPIO/Relay và tự chuyển sang phản hồi giả lập khi ngoại tuyến.',
    highlights: [
      'Mẫu Pub/Sub đa thuê bao (subscribe / notify) thông báo trạng thái DISCONNECTED / CONNECTING / CONNECTED / ERROR.',
      'Hỗ trợ đóng gói lệnh JSON { cmd, target, value, timestamp } gửi thẳng xuống ESP32.',
      'Giao diện HardwareConnector cho phép nhập IP WebSocket LAN và theo dõi badge trạng thái trực tiếp.',
    ],
    protocols: ['WebSocket LAN :81', 'ESP32 JSON Bridge', 'GPIO & CLI Terminal', 'Offline Sim Mode'],
    files: [
      'src/services/iotBridgeService.js',
      'src/features/iot-debug/components/HardwareConnector.jsx',
      'src/features/iot-debug/IotDebugPage.jsx',
      'src/features/iot-debug/components/PacketTerminal.jsx',
    ],
    codeBlocks: [
      {
        tabLabel: 'Service: iotBridgeService',
        filePath: 'src/services/iotBridgeService.js',
        ...extractSection(iotBridgeServiceRaw, null, null),
      },
      {
        tabLabel: 'UI: HardwareConnector',
        filePath: 'src/features/iot-debug/components/HardwareConnector.jsx',
        ...extractSection(hardwareConnectorRaw, null, null),
      },
      {
        tabLabel: 'UI: IotDebugPage (GPIO & WS)',
        filePath: 'src/features/iot-debug/IotDebugPage.jsx',
        ...extractSection(iotDebugPageRaw, 'export const IotDebugPage = () => {', null),
      },
      {
        tabLabel: 'UI: PacketTerminal (RX/TX)',
        filePath: 'src/features/iot-debug/components/PacketTerminal.jsx',
        ...extractSection(packetTerminalRaw, 'export const PacketTerminal = ({', '  return ('),
      },
    ],
  },
];

export const buildMarkdownReport = (features = REPORT_FEATURES) => {
  const lines = [
    "# BÁO CÁO TỔNG HỢP CHỨC NĂNG & MÃ NGUỒN — HỆ THỐNG BLE STICK 'EM & IOT",
    '',
    `Ngày xuất báo cáo: ${new Date().toLocaleString('vi-VN')}`,
    `Tổng số chức năng: ${features.length}`,
    '',
    '---',
    '',
  ];

  features.forEach((feat) => {
    lines.push(`## ${feat.index}. ${feat.title}`);
    lines.push('');
    lines.push(`**Mô tả:** ${feat.summary}`);
    lines.push('');
    lines.push(`**Giao thức / Công nghệ:** ${feat.protocols.join(' • ')}`);
    lines.push('');
    lines.push('**Điểm kỹ thuật chính:**');
    feat.highlights.forEach((h) => lines.push(`- ${h}`));
    lines.push('');
    feat.codeBlocks.forEach((blk) => {
      lines.push(`### ${blk.tabLabel} (\`${blk.filePath}\` — Dòng ${blk.startLine}–${blk.endLine})`);
      lines.push('```javascript');
      lines.push(blk.code);
      lines.push('```');
      lines.push('');
    });
    lines.push('---');
    lines.push('');
  });

  return lines.join('\n');
};

