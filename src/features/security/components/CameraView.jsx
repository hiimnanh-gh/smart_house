import React, { useState } from 'react';
import { Video, Maximize2, Circle, Eye, Moon, Camera, Compass } from 'lucide-react';
import { sound } from '../../../utils/soundEffects';
import './CameraView.css';

export const CameraView = ({ cameras = [] }) => {
  const [nightVision, setNightVision] = useState(false);
  const [aiDetection, setAiDetection] = useState(true);
  const [selectedCam, setSelectedCam] = useState(cameras[0]?.id || 'cam-1');

  const handleToggleNightVision = () => {
    sound.playClick();
    setNightVision(!nightVision);
  };

  const handleToggleAi = () => {
    sound.playClick();
    setAiDetection(!aiDetection);
  };

  return (
    <div className={`camera-view-container glass-panel ${nightVision ? 'night-vision-mode' : ''}`}>
      <div className="camera-view-header">
        <div className="header-meta">
          <Video size={20} className="header-cctv-icon" />
          <div>
            <h4>Hệ Thống Camera AI Giám Sát Nhận Diện 2K</h4>
            <p>Tự động phát hiện người, phương tiện & chuyển động bất thường qua AI Edge Computing</p>
          </div>
        </div>

        <div className="cam-global-controls">
          <button
            className={`btn-cam-filter ${nightVision ? 'active' : ''}`}
            onClick={handleToggleNightVision}
            title="Chế độ nhìn ban đêm hồng ngoại"
          >
            <Moon size={14} /> Hồng Ngoại Ban Đêm
          </button>

          <button
            className={`btn-cam-filter ${aiDetection ? 'active' : ''}`}
            onClick={handleToggleAi}
            title="Bật/Tắt khung AI nhận diện mục tiêu"
          >
            <Eye size={14} /> Nhận Diện AI Edge
          </button>
        </div>
      </div>

      <div className="cameras-grid">
        {cameras.map((cam, idx) => {
          const isMain = cam.id === selectedCam;
          return (
            <div
              key={cam.id}
              className={`camera-frame ${isMain ? 'highlighted-cam' : ''}`}
              onClick={() => setSelectedCam(cam.id)}
            >
              <div className="camera-screen">
                {/* Simulated camera feed graphics */}
                <div className="camera-overlay-top">
                  <span className="cam-name-badge">{cam.name}</span>
                  <div className="top-right-badges">
                    {aiDetection && (
                      <span className="ai-edge-badge">AI Edge: Active</span>
                    )}
                    <span className="rec-badge">
                      <Circle size={8} className="rec-dot" /> REC
                    </span>
                  </div>
                </div>

                {/* AI Object Bounding Boxes Simulation */}
                {aiDetection && idx === 0 && (
                  <div className="ai-bounding-box person-box">
                    <span className="ai-tag">Người (98.4%)</span>
                  </div>
                )}

                {aiDetection && idx === 2 && (
                  <div className="ai-bounding-box pet-box">
                    <span className="ai-tag">Thú cưng (92.1%)</span>
                  </div>
                )}

                {/* Center crosshair */}
                <div className="cam-target-box"></div>

                <div className="camera-overlay-bottom">
                  <span className="cam-time">
                    {new Date().toLocaleTimeString('vi-VN')} • FPS 30 • 2560x1440
                  </span>
                  <div className="bottom-btns">
                    <button
                      className="cam-mini-btn"
                      title="Chụp ảnh trích xuất"
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playClick();
                      }}
                    >
                      <Camera size={13} />
                    </button>
                    <button
                      className="cam-mini-btn"
                      title="Phóng to luồng"
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playClick();
                      }}
                    >
                      <Maximize2 size={13} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="camera-meta-bar">
                <span className="cam-loc">{cam.location}</span>
                <span className="cam-status-text">{cam.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
