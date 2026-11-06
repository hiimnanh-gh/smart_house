import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, Send, Volume2, X, Command } from 'lucide-react';
import { useSmartHome } from '../../context/SmartHomeContext';
import { sound } from '../../utils/soundEffects';
import './AiVoiceAssistant.css';

const QUICK_COMMANDS = [
  'Bật tất cả đèn',
  'Tắt tất cả đèn',
  'Đặt điều hòa 22°C',
  'Kích hoạt kịch bản Xem Phim',
  'Khóa chốt toàn bộ cửa',
  'Báo cáo nhiệt độ',
];

export const AiVoiceAssistant = ({ isOpen, onClose }) => {
  const {
    sensors,
    lights,
    climate,
    security,
    toggleLight,
    updateAcSetting,
    activateScene,
    toggleDoorLock,
    addLog,
  } = useSmartHome();

  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [aiResponse, setAiResponse] = useState(
    'Xin chào! Tôi là Trợ Lý AI Điều Khiển SmartHome Pro. Bạn muốn tôi làm gì?'
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const processCommand = (cmdText) => {
    const text = cmdText.toLowerCase();
    setIsProcessing(true);
    sound.playClick();

    setTimeout(() => {
      let reply = '';

      if (text.includes('bật tất cả đèn') || text.includes('bật hết đèn')) {
        lights.forEach((l) => {
          if (!l.isOn) toggleLight(l.id);
        });
        reply = 'Đã bật toàn bộ hệ thống đèn trong nhà.';
        sound.playSuccess();
      } else if (text.includes('tắt tất cả đèn') || text.includes('tắt hết đèn')) {
        lights.forEach((l) => {
          if (l.isOn) toggleLight(l.id);
        });
        reply = 'Đã tắt toàn bộ bóng đèn để tiết kiệm điện năng.';
        sound.playToggle(false);
      } else if (text.includes('điều hòa 22') || text.includes('22 độ')) {
        updateAcSetting('acLiving', 'targetTemp', 22);
        updateAcSetting('acLiving', 'isOn', true);
        reply = 'Đã thiết lập điều hòa Phòng Khách về 22°C chế độ làm lạnh.';
        sound.playSuccess();
      } else if (text.includes('xem phim') || text.includes('cinema')) {
        activateScene('scene-cinema');
        reply = 'Đã kích hoạt kịch bản Xem Phim: Đóng rèm, giảm sáng 20%, bật TV QLED.';
        sound.playSuccess();
      } else if (text.includes('tiệc tùng') || text.includes('party')) {
        activateScene('scene-party');
        reply = 'Đã kích hoạt kịch bản Tiệc Tùng: Bật đèn LED RGB chuyển màu!';
        sound.playSuccess();
      } else if (text.includes('khóa') || text.includes('cửa')) {
        security.doors.forEach((d) => {
          if (!d.isLocked) toggleDoorLock(d.id);
        });
        reply = 'Toàn bộ cửa chính, cửa gara và ban công đã được khóa chốt an toàn.';
        sound.playSuccess();
      } else if (text.includes('nhiệt độ') || text.includes('báo cáo')) {
        reply = `Nhiệt độ phòng khách hiện tại là ${sensors.livingRoom.temp}°C, độ ẩm ${sensors.livingRoom.hum}%, chất lượng không khí AQI ${sensors.livingRoom.aqi} (Rất tốt).`;
        sound.playSuccess();
      } else {
        reply = `Đã nhận diện khẩu lệnh: "${cmdText}". Hệ thống đang xử lý và phân phối lệnh tới vi điều khiển trung tâm.`;
        sound.playClick();
      }

      setAiResponse(reply);
      addLog(`Trợ lý AI: ${reply}`, 'info');
      setIsProcessing(false);
      setInputText('');
    }, 600);
  };

  const handleStartListening = () => {
    // Check Web Speech API support
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        sound.playClick();
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        processCommand(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setAiResponse('Không thể nhận diện giọng nói hoặc micro bị chặn. Bạn hãy chọn câu lệnh nhanh bên dưới.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      // Mock listening animation for browsers without speech API
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        const randomCmd = QUICK_COMMANDS[Math.floor(Math.random() * QUICK_COMMANDS.length)];
        setInputText(randomCmd);
        processCommand(randomCmd);
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ai-assistant-modal-backdrop" onClick={onClose}>
      <div className="ai-assistant-hud glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="hud-header">
          <div className="hud-brand">
            <div className="hud-ai-icon">
              <Sparkles size={18} />
            </div>
            <div>
              <h3>JARVIS AI • Hệ Thống Trợ Lý Giọng Nói</h3>
              <p>Mô hình ngôn ngữ điều khiển phần cứng IoT thời gian thực</p>
            </div>
          </div>
          <button className="hud-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Central Glowing Hologram Orb */}
        <div className="hud-orb-container">
          <div className={`ai-hologram-orb ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}>
            <div className="orb-ring-1"></div>
            <div className="orb-ring-2"></div>
            <div className="orb-core">
              <Volume2 size={32} className="orb-icon" />
            </div>
          </div>
          <span className="orb-status-text">
            {isListening
              ? 'Đang lắng nghe giọng nói của bạn...'
              : isProcessing
              ? 'Đang phân tích và thực thi lệnh...'
              : 'Sẵn sàng nhận lệnh'}
          </span>
        </div>

        {/* AI Output Bubble */}
        <div className="hud-response-bubble">
          <p className="response-text">{aiResponse}</p>
        </div>

        {/* Voice Input & Text Input */}
        <div className="hud-input-row">
          <button
            className={`btn-hud-mic ${isListening ? 'active' : ''}`}
            onClick={handleStartListening}
            title="Bấm để nói khẩu lệnh"
          >
            {isListening ? <MicOff size={22} /> : <Mic size={22} />}
          </button>

          <input
            type="text"
            className="hud-text-input"
            placeholder="Hoặc nhập câu lệnh: ví dụ 'Bật đèn', 'Xem phim'..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputText.trim()) {
                processCommand(inputText);
              }
            }}
          />

          <button
            className="btn-hud-send"
            onClick={() => inputText.trim() && processCommand(inputText)}
            disabled={!inputText.trim()}
          >
            <Send size={18} />
          </button>
        </div>

        {/* Quick Command Chips */}
        <div className="hud-quick-section">
          <span className="quick-label">
            <Command size={13} /> Khẩu lệnh mẫu thông minh:
          </span>
          <div className="quick-chips-grid">
            {QUICK_COMMANDS.map((cmd, idx) => (
              <button
                key={idx}
                className="hud-command-chip"
                onClick={() => processCommand(cmd)}
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

