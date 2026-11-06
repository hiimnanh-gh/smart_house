/**
 * Settings & Gateway Service
 * Cấu hình kết nối MQTT Broker, Zigbee Hub và ngưỡng cảnh báo cảm biến
 */

export const DEFAULT_GATEWAY_CONFIG = {
  brokerUrl: 'mqtt://192.168.1.120',
  port: 1883,
  clientPrefix: 'smarthome_master_node',
  zigbeeChannel: 15,
  firmwareVersion: 'v2.8.4-stable (ESP32-S3)',
  uptime: '14 ngày, 6 giờ, 22 phút',
};

export const DEFAULT_THRESHOLDS = {
  maxTemp: 32,
  minTemp: 18,
  maxHum: 75,
  maxAqi: 100,
};

