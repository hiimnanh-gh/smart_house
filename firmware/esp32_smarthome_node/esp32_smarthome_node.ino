/**
 * ============================================================================
 * ESP32 SMART HOME PRO - FIRMWARE KẾT NỐI WEBSOCKET TRỰC TIẾP VỚI FRONTEND
 * ============================================================================
 * Dự án: Test Nhúng / Hệ Thống Điều Khiển Nhà Thông Minh
 * Vi điều khiển: ESP32-WROOM-32 / ESP32-S3 / NodeMCU ESP8266
 * Thư viện yêu cầu:
 *   - WiFi.h (Có sẵn trong ESP32 Core)
 *   - WebSocketsServer by Markus Sattler (Cài từ Arduino Library Manager)
 *   - ArduinoJson (v6 trở lên)
 *   - DHT sensor library by Adafruit
 * ============================================================================
 */

#include <WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>
#include <DHT.h>

// 1. CẤU HÌNH WIFI MẠNG LAN CỦA BẠN
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// 2. KHỞI TẠO CẢM BIẾN & CHÂN NGOẠI VI
#define DHTPIN 4          // Chân nối cảm biến nhiệt độ & độ ẩm DHT22 / DHT11
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

#define RELAY_LIGHT_PIN  5   // Chân Relay Đèn chính (Active LOW hoặc HIGH)
#define RELAY_FAN_PIN    18  // Chân Relay Quạt / Điều hòa
#define LED_STATUS_PIN   2   // LED báo trạng thái kết nối trên board ESP32
#define BUZZER_ALARM_PIN 12  // Còi báo động khẩn cấp

// 3. KHỞI TẠO WEBSOCKET SERVER TRÊN CỔNG 81
WebSocketsServer webSocket = WebSocketsServer(81);

unsigned long lastSensorRead = 0;
const unsigned long SENSOR_INTERVAL = 3000; // Đọc cảm biến mỗi 3 giây

// ============================================================================
// HÀM XỬ LÝ SỰ KIỆN TỪ FRONTEND GỬI TỚI
// ============================================================================
void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Frontend đã ngắt kết nối!\n", num);
      digitalWrite(LED_STATUS_PIN, LOW);
      break;

    case WStype_CONNECTED: {
      IPAddress ip = webSocket.remoteIP(num);
      Serial.printf("[%u] Frontend đã kết nối từ IP: %d.%d.%d.%d\n", num, ip[0], ip[1], ip[2], ip[3]);
      digitalWrite(LED_STATUS_PIN, HIGH);

      // Gửi ngay trạng thái ban đầu tới FE
      sendInitialState(num);
      break;
    }

    case WStype_TEXT: {
      Serial.printf("[%u] Lệnh nhận từ Frontend: %s\n", num, payload);

      // Giải mã JSON từ Frontend
      StaticJsonDocument<256> doc;
      DeserializationError error = deserializeJson(doc, payload);

      if (!error) {
        const char* cmd = doc["cmd"];
        const char* target = doc["target"];
        bool val = doc["value"];

        if (strcmp(cmd, "TOGGLE_LIGHT") == 0) {
          digitalWrite(RELAY_LIGHT_PIN, val ? HIGH : LOW);
          Serial.printf("-> Đã %s Đèn (Chân GPIO %d)\n", val ? "BẬT" : "TẮT", RELAY_LIGHT_PIN);
        } 
        else if (strcmp(cmd, "TOGGLE_FAN") == 0) {
          digitalWrite(RELAY_FAN_PIN, val ? HIGH : LOW);
          Serial.printf("-> Đã %s Quạt (Chân GPIO %d)\n", val ? "BẬT" : "TẮT", RELAY_FAN_PIN);
        }
        else if (strcmp(cmd, "ALARM_SIREN") == 0) {
          digitalWrite(BUZZER_ALARM_PIN, val ? HIGH : LOW);
          Serial.printf("-> Còi báo động: %s\n", val ? "BẬT" : "TẮT");
        }

        // Báo nhận thành công (ACK) về lại cho Frontend
        StaticJsonDocument<128> ack;
        ack["status"] = "OK";
        ack["target"] = target;
        ack["state"] = val;
        String ackStr;
        serializeJson(ack, ackStr);
        webSocket.broadcastTXT(ackStr);
      }
      break;
    }

    default:
      break;
  }
}

// Gửi trạng thái hiện tại khi Frontend vừa mở tab
void sendInitialState(uint8_t num) {
  StaticJsonDocument<256> doc;
  doc["type"] = "INIT_STATE";
  doc["lightState"] = digitalRead(RELAY_LIGHT_PIN) == HIGH;
  doc["fanState"] = digitalRead(RELAY_FAN_PIN) == HIGH;
  doc["sirenState"] = digitalRead(BUZZER_ALARM_PIN) == HIGH;

  String out;
  serializeJson(doc, out);
  webSocket.sendTXT(num, out);
}

// ============================================================================
// SETUP
// ============================================================================
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n=== SMART HOME PRO - ESP32 EMBEDDED NODE ===");

  // Cấu hình GPIO
  pinMode(RELAY_LIGHT_PIN, OUTPUT);
  pinMode(RELAY_FAN_PIN, OUTPUT);
  pinMode(BUZZER_ALARM_PIN, OUTPUT);
  pinMode(LED_STATUS_PIN, OUTPUT);

  digitalWrite(RELAY_LIGHT_PIN, LOW);
  digitalWrite(RELAY_FAN_PIN, LOW);
  digitalWrite(BUZZER_ALARM_PIN, LOW);
  digitalWrite(LED_STATUS_PIN, LOW);

  // Khởi động cảm biến DHT
  dht.begin();

  // Kết nối WiFi
  Serial.printf("Đang kết nối vào mạng WiFi: %s ...\n", ssid);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print(".");
    digitalWrite(LED_STATUS_PIN, !digitalRead(LED_STATUS_PIN));
  }

  Serial.println("\n✓ ĐÃ KẾT NỐI WIFI THÀNH CÔNG!");
  Serial.print("-> Địa chỉ IP của ESP32: ");
  Serial.println(WiFi.localIP());
  Serial.println("-> Cổng WebSocket: ws://" + WiFi.localIP().toString() + ":81");

  // Khởi động máy chủ WebSocket
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}

// ============================================================================
// VÒNG LẶP CHÍNH (LOOP)
// ============================================================================
void loop() {
  webSocket.loop();

  // Định kỳ đọc cảm biến và bắn gói tin JSON thời gian thực về Frontend
  unsigned long now = millis();
  if (now - lastSensorRead >= SENSOR_INTERVAL) {
    lastSensorRead = now;

    float hum = dht.readHumidity();
    float temp = dht.readTemperature();

    // Nếu cảm biến bị lỗi chân, tạo dữ liệu fallback
    if (isnan(hum) || isnan(temp)) {
      temp = 26.5;
      hum = 63.0;
    }

    // Đóng gói JSON gửi tới Frontend
    StaticJsonDocument<256> doc;
    doc["type"] = "TELEMETRY";
    doc["node"] = "ESP32_LIVING_ROOM";
    doc["temp"] = round(temp * 10) / 10.0;
    doc["hum"] = round(hum * 10) / 10.0;
    doc["freeHeap"] = ESP.getFreeHeap();
    doc["rssi"] = WiFi.RSSI();

    String jsonStr;
    serializeJson(doc, jsonStr);

    // Gửi gói tin broadcast tới tất cả các trình duyệt đang mở Dashboard
    webSocket.broadcastTXT(jsonStr);
    Serial.printf("[TX Gửi FE]: %s\n", jsonStr.c_str());
  }
}
