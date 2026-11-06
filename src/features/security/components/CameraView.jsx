import React from 'react';
import { Video, Maximize2, Circle, AlertCircle } from 'lucide-react';
import './CameraView.css';

export const CameraView = ({ cameras = [] }) => {
  return (
    <div className="camera-view-container glass-panel">
      <div className="camera-view-header">
        <div className="header-meta">
          <Video size={20} className="header-cctv-icon" />
          <div>
            <h4>Hệ Thống Camera An Ninh Giám Sát</h4>
            <p>Trực tiếp độ phân giải 2K AI • Tự động nhận diện người và phương tiện</p>
          </div>
        </div>
        <span className="badge-live">Trực Tiếp (4 Luồng)</span>
      </div>

      <div className="cameras-grid">
        {cameras.map((cam, idx) => (
          <div key={cam.id} className="camera-frame">
            <div className="camera-screen">
              {/* Simulated camera feed graphics */}
              <div className="camera-overlay-top">
                <span className="cam-name-badge">{cam.name}</span>
                <span className="rec-badge">
                  <Circle size={8} className="rec-dot" /> REC
                </span>
              </div>

              {/* Grid guide overlay */}
              <div className="cam-target-box"></div>

              <div className="camera-overlay-bottom">
                <span className="cam-time">
                  {new Date().toLocaleTimeString('vi-VN')} • FPS 30
                </span>
                <button className="cam-expand-btn" title="Phóng to luồng">
                  <Maximize2 size={14} />
                </button>
              </div>
            </div>

            <div className="camera-meta-bar">
              <span className="cam-loc">{cam.location}</span>
              <span className="cam-status-text">{cam.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

