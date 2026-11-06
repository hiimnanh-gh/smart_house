# 🏡 SmartHome Ultra - Hệ Thống Điều Khiển Nhà Thông Minh Đẳng Cấp Cao

Hệ thống Frontend điều khiển nhà thông minh cao cấp được phát triển bằng **React + Vite**, áp dụng mô hình kiến trúc **Feature-Driven Architecture** chuẩn quốc tế, mang phong cách giao diện tương lai **Cyber Dark / Glassmorphism / JARVIS HUD** với đầy đủ âm thanh xúc giác (Tactile Audio), điều khiển giọng nói AI, bản đồ mặt bằng 2D/3D và trạm kiểm thử nhúng vi điều khiển ESP32.

---

## 🌟 Những Nâng Cấp Đẳng Cấp Vượt Trội

1. **🤖 Trợ Lý Ảo Giọng Nói JARVIS AI (Voice Assistant Hologram HUD)**:
   - Quả cầu Hologram phát sáng chuyển động xoay 3D với hiệu ứng nhịp thở âm thanh.
   - Hỗ trợ nhận diện giọng nói qua microphone (Web Speech API) và phím tắt khẩu lệnh thông minh: *"Bật tất cả đèn"*, *"Đặt điều hòa 22 độ"*, *"Khóa toàn bộ cửa"*, *"Kịch bản xem phim"*, *"Báo cáo nhiệt độ"*.
   - Phản hồi bằng tin nhắn thị giác và hiệu ứng âm thanh Sci-Fi tức thì.

2. **🔊 Động Cơ Âm Thanh Xúc Giác Đẳng Cấp (Web Audio API Synthesizer)**:
   - Tự động tổng hợp sóng âm thanh đa tần số trong trình duyệt mà **không cần tải file MP3 ngoài**:
     - Âm thanh click công tắc vi mô (Micro Haptic Click).
     - Hợp âm thăng hoa khi Bật thiết bị và tone đóng dịu êm khi Tắt thiết bị.
     - Âm thanh Sci-Fi khi kích hoạt kịch bản thành công.
     - Còi báo động an ninh khẩn cấp đa tần số.
   - Có nút bật/tắt toàn bộ hiệu ứng âm thanh trực tiếp trên thanh Navbar.

3. **🗺️ Mặt Bằng Căn Hộ 2D/3D Tương Tác (Interactive Floor Plan)**:
   - Lưới toạ độ kiến trúc Blueprint với ánh sáng phòng thay đổi động theo trạng thái đèn thực tế.
   - Điểm nút đèn (Hotspot nodes) gắn trực tiếp trên bản đồ phòng, bấm là đổi trạng thái và màu sắc.
   - Bảng thanh tra phòng (Room Inspector) hiển thị cảm biến và thiết bị phụ tải theo từng khu vực.

4. **⚡ Sơ Đồ Vi Lưới Điện Mặt Trời Hybrid (Microgrid Power Flow HUD)**:
   - Mô phỏng trực quan luồng năng lượng với **hạt electron chuyển động liên tục**: Pin Mặt Trời ☀️ ➔ Biến tần Hybrid Inverter ⚡ ➔ Pin lưu trữ ESS 🔋 ➔ Phụ tải nhà 🏠 ➔ Lưới điện EVN 🌐.

5. **📈 Biểu Đồ Sóng Dữ Liệu Lịch Sử 24 Giờ & Xuất File CSV**:
   - Biểu đồ đường cong Bezier Spline mượt mà cho Nhiệt độ (°C), Độ ẩm (%) và Phụ tải (kW).
   - Tooltip tương tác tại từng mốc thời gian và nút bấm **Xuất tệp tin CSV** chỉ bằng 1 chạm.

6. **🛠️ Trạm Kiểm Thử Nhúng & Giao Thức Vi Điều Khiển (Embedded IoT Console)**:
   - Dành riêng cho phân hệ **Test Nhúng**:
     - Màn hình Serial / MQTT Packet Terminal hiển thị gói tin thời gian thực với mã màu RX/TX.
     - Khung nhập lệnh AT Command / Publish topic MQTT trực tiếp xuống ESP32.
     - Bảng ma trận điều khiển trạng thái logic chân phần cứng **ESP32-S3 GPIO Pins** (Mức HIGH / LOW).

---

## 📁 Cấu Trúc Thư Mục Phân Hệ (10 Features Chuyên Biệt)

```
Frontend/
├── src/
│   ├── utils/
│   │   └── soundEffects.js              # Bộ tổng hợp âm thanh Web Audio API
│   ├── context/
│   │   └── SmartHomeContext.jsx         # Quản lý State toàn cục & Live Telemetry
│   ├── routes/
│   │   └── AppRoutes.jsx                # Định tuyến React Router DOM
│   ├── components/
│   │   ├── common/
│   │   │   └── AiVoiceAssistant.jsx     # Trợ lý giọng nói JARVIS AI
│   │   └── layout/
│   │       ├── Navbar.jsx               # Navbar cao cấp có nút JARVIS & Sound FX
│   │       └── Sidebar.jsx              # Menu bên hông 10 phân hệ chức năng
│   │
│   └── features/                        # 10 PHÂN HỆ ĐỘC LẬP:
│       ├── dashboard/                   # 1. Tổng quan hệ thống & nút bấm nhanh
│       ├── floorplan/                   # 2. Mặt bằng 2D/3D tương tác kiến trúc
│       ├── climate/                     # 3. Điều hòa, độ ẩm, nhiệt độ đa vùng
│       ├── lighting/                    # 4. Chiếu sáng Dimmer & đổi màu LED RGB
│       ├── devices/                     # 5. Thiết bị điện, rèm cửa, robot hút bụi
│       ├── security/                    # 6. Khóa vân tay, 4 camera 2K & còi khẩn
│       ├── analytics/                   # 7. Sơ đồ điện mặt trời & biểu đồ sóng 24h
│       ├── automation/                  # 8. Kịch bản thông minh & quy tắc IFTTT
│       ├── iot-debug/                   # 9. Giám sát gói tin nhúng & GPIO ESP32
│       └── settings/                    # 10. Cấu hình MQTT Broker & ngưỡng cảnh báo
```

---

## 🚀 Khởi Chạy Dự Án

```bash
# Cài đặt thư viện (nếu mở trên máy mới)
npm install

# Khởi chạy máy chủ phát triển
npm run dev
```

Truy cập: **`http://localhost:5173/`**
