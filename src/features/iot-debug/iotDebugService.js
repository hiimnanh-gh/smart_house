/**
 * Embedded IoT Debug Service
 * Giả lập gói tin truyền nhận vi điều khiển ESP32 / STM32 qua Serial & MQTT
 */

export const INITIAL_PACKETS = [
  { id: 1, time: '15:02:11.204', dir: 'RX', topic: 'esp32/dht22/telemetry', payload: '{"node_id":"ESP32-S3-01","temp":26.4,"hum":62.0,"rssi":-58}' },
  { id: 2, time: '15:02:11.218', dir: 'TX', topic: 'esp32/actuator/ack', payload: '{"status":"ACK","code":200}' },
  { id: 3, time: '15:02:15.650', dir: 'RX', topic: 'esp32/door/lock_state', payload: '{"door_id":"door-1","locked":true,"battery":92}' },
  { id: 4, time: '15:02:18.012', dir: 'RX', topic: 'esp32/power/pzem004t', payload: '{"voltage":224.5,"current":7.52,"power_kw":1.68,"frequency":50.0}' },
  { id: 5, time: '15:02:22.400', dir: 'TX', topic: 'esp32/relay/cmd', payload: '{"relay_pin":14,"state":1}' },
];

export const ESP32_GPIO_PINS = [
  { pin: 'GPIO 2', name: 'LED Status', mode: 'OUTPUT', state: true },
  { pin: 'GPIO 4', name: 'DHT22 Data In', mode: 'INPUT_PULLUP', state: true },
  { pin: 'GPIO 5', name: 'Relay Đèn Trực Tiếp', mode: 'OUTPUT', state: true },
  { pin: 'GPIO 12', name: 'Còi Báo Động Buzzer', mode: 'OUTPUT', state: false },
  { pin: 'GPIO 13', name: 'Cảm Biến PIR Chuyển Động', mode: 'INPUT', state: false },
  { pin: 'GPIO 18', name: 'I2C SCL (Màn OLED)', mode: 'I2C', state: true },
  { pin: 'GPIO 19', name: 'I2C SDA (Màn OLED)', mode: 'I2C', state: true },
  { pin: 'GPIO 21', name: 'UART TX (Debug PC)', mode: 'UART', state: true },
];

