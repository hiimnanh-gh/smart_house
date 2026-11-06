/**
 * Real Hardware IoT Bridge Service
 * Kết nối WebSocket trực tiếp tới vi điều khiển ESP32 / ESP8266 / NodeMCU qua mạng LAN (Không qua trung gian Cloud)
 */

class IotBridgeService {
  constructor() {
    this.socket = null;
    this.status = 'DISCONNECTED'; // 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR'
    this.url = 'ws://192.168.1.120:81';
    this.subscribers = new Set();
    this.reconnectTimer = null;
  }

  // Đăng ký nhận thông báo trạng thái hoặc dữ liệu
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify(event, data) {
    this.subscribers.forEach((cb) => cb(event, data));
  }

  // Kết nối tới ESP32 WebSocket Server
  connect(url = this.url) {
    this.url = url;
    if (this.socket) {
      try {
        this.socket.close();
      } catch (e) {}
    }

    this.status = 'CONNECTING';
    this.notify('status_change', { status: this.status, url: this.url });

    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.status = 'CONNECTED';
        this.notify('status_change', { status: this.status, url: this.url });
        this.notify('log', { type: 'success', text: `Đã kết nối thành công tới phần cứng ESP32 tại ${url}` });
      };

      this.socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          this.notify('packet_rx', payload);
        } catch (err) {
          // Plain text message
          this.notify('packet_rx', { raw: event.data });
        }
      };

      this.socket.onerror = (err) => {
        this.status = 'ERROR';
        this.notify('status_change', { status: this.status, error: err });
        this.notify('log', { type: 'danger', text: `Lỗi kết nối WebSocket tới ${url}` });
      };

      this.socket.onclose = () => {
        this.status = 'DISCONNECTED';
        this.notify('status_change', { status: this.status, url: this.url });
      };
    } catch (e) {
      this.status = 'ERROR';
      this.notify('status_change', { status: this.status, error: e });
    }
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.status = 'DISCONNECTED';
    this.notify('status_change', { status: this.status });
  }

  // Gửi lệnh điều khiển phần cứng (Bật tắt relay, set dimmer, v.v.)
  sendCommand(action, targetId, value) {
    const packet = {
      cmd: action,
      target: targetId,
      value: value,
      timestamp: Date.now(),
    };

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(packet));
      this.notify('packet_tx', packet);
      return true;
    } else {
      // Mock echo when offline / testing
      this.notify('packet_tx', { ...packet, simulated: true });
      return false;
    }
  }
}

export const iotBridge = new IotBridgeService();
