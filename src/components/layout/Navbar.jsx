import React, { useState, useEffect } from 'react';
import {
  Menu,
  Bell,
  Activity,
  ShieldAlert,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useSmartHome } from '../../context/SmartHomeContext';
import { AiVoiceAssistant } from '../common/AiVoiceAssistant';
import { sound } from '../../utils/soundEffects';
import './Navbar.css';

export const Navbar = ({ onToggleSidebar }) => {
  const {
    activeScene,
    activateScene,
    scenes,
    isSimulating,
    setIsSimulating,
    security,
    toggleAlarmSiren,
    logs,
  } = useSmartHome();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showLogsDropdown, setShowLogsDropdown] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setEnabled(next);
    if (next) sound.playClick();
  };

  const handleSceneClick = (sceneId) => {
    sound.playSuccess();
    activateScene(sceneId);
  };

  const handleSirenClick = () => {
    sound.playAlarm();
    toggleAlarmSiren();
  };

  const formattedTime = currentTime.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const formattedDate = currentTime.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
  });

  return (
    <>
      <header className="navbar glass-panel">
        <div className="navbar-left">
          <button
            className="menu-btn"
            onClick={onToggleSidebar}
            aria-label="Mở menu"
          >
            <Menu size={22} />
          </button>

          <div className="datetime-display">
            <span className="time-val">{formattedTime}</span>
            <span className="date-val">{formattedDate}</span>
          </div>

          {/* Quick Scenes selector */}
          <div className="scene-chips">
            {scenes.slice(0, 4).map((scene) => (
              <button
                key={scene.id}
                className={`scene-chip ${activeScene === scene.id ? 'active' : ''}`}
                onClick={() => handleSceneClick(scene.id)}
              >
                {scene.name}
              </button>
            ))}
          </div>
        </div>

        <div className="navbar-right">
          {/* AI Voice Assistant Launcher */}
          <button
            className="ai-assistant-btn"
            onClick={() => {
              sound.playClick();
              setIsAiOpen(true);
            }}
          >
            <Sparkles size={16} className="sparkle-glow" />
            <span className="btn-text">JARVIS AI</span>
          </button>

          {/* Audio FX Toggle */}
          <button
            className={`sound-fx-btn ${soundEnabled ? 'active' : 'muted'}`}
            onClick={handleToggleSound}
            title={soundEnabled ? 'Tắt hiệu ứng âm thanh' : 'Bật hiệu ứng âm thanh'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Real-time simulation toggle */}
          <button
            className={`telemetry-btn ${isSimulating ? 'active' : ''}`}
            onClick={() => {
              sound.playClick();
              setIsSimulating(!isSimulating);
            }}
            title={isSimulating ? 'Tạm dừng mô phỏng cảm biến' : 'Bật luồng cảm biến thời gian thực'}
          >
            <Activity size={16} className={isSimulating ? 'icon-spin' : ''} />
            <span className="btn-text">IoT Live: {isSimulating ? 'BẬT' : 'DỪNG'}</span>
          </button>

          {/* Emergency Siren button */}
          <button
            className={`siren-btn ${security.siren ? 'blinking' : ''}`}
            onClick={handleSirenClick}
            title={security.siren ? 'Tắt còi báo động khẩn' : 'Bật còi báo động khẩn'}
          >
            <ShieldAlert size={18} />
            <span className="btn-text">{security.siren ? 'BÁO ĐỘNG!' : 'Còi khẩn'}</span>
          </button>

          {/* Logs / Notifications Dropdown */}
          <div className="logs-dropdown-container">
            <button
              className="icon-action-btn"
              onClick={() => {
                sound.playClick();
                setShowLogsDropdown(!showLogsDropdown);
              }}
              aria-label="Thông báo và nhật ký"
            >
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>

            {showLogsDropdown && (
              <div className="logs-dropdown glass-panel">
                <div className="logs-header">
                  <h4>Nhật Ký Sự Kiện Gần Đây</h4>
                  <span className="logs-count">{logs.length} sự kiện</span>
                </div>
                <div className="logs-list">
                  {logs.slice(0, 6).map((log) => (
                    <div key={log.id} className={`log-item log-type-${log.type}`}>
                      <span className="log-time">{log.time}</span>
                      <span className="log-text">{log.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* AI Assistant Modal */}
      <AiVoiceAssistant isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </>
  );
};
