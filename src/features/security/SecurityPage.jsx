import React from 'react';
import { useSmartHome } from '../../context/SmartHomeContext';
import { CameraView } from './components/CameraView';
import { DoorLockWidget } from './components/DoorLockWidget';
import { AlarmSystem } from './components/AlarmSystem';
import { ActivityLog } from './components/ActivityLog';
import { getSecurityHealth } from './securityService';
import { ShieldCheck, ShieldAlert, Lock, Video } from 'lucide-react';
import './SecurityPage.css';

export const SecurityPage = () => {
  const {
    security,
    toggleDoorLock,
    setSecurityArmedMode,
    toggleAlarmSiren,
    logs,
  } = useSmartHome();

  const health = getSecurityHealth(security.doors, security.cameras, security.armed);

  return (
    <div className="security-page animate-fade-in">
      <div className="security-page-header">
        <div>
          <h1 className="page-title">Hệ Thống An Ninh & Giám Sát</h1>
          <p className="page-subtitle">
            Bảo vệ toàn diện ngôi nhà 24/7 với khóa thông minh, camera AI và phát hiện xâm nhập
          </p>
        </div>

        <div className="security-status-badge">
          {health.isFullySecured ? (
            <span className="badge-secure">
              <ShieldCheck size={16} /> AN NINH TỐI ĐA
            </span>
          ) : (
            <span className="badge-caution">
              <ShieldAlert size={16} /> CẦN CHÚ Ý
            </span>
          )}
        </div>
      </div>

      {/* KPI Overview */}
      <div className="security-kpis-grid">
        <div className="sec-kpi-card glass-panel">
          <div className="sec-icon-box green">
            <Lock size={20} />
          </div>
          <div>
            <span className="sec-lbl">Cửa đã khóa an toàn</span>
            <span className="sec-val">{health.lockedDoorsCount} / {health.totalDoors}</span>
          </div>
        </div>

        <div className="sec-kpi-card glass-panel">
          <div className="sec-icon-box cyan">
            <Video size={20} />
          </div>
          <div>
            <span className="sec-lbl">Camera trực tuyến</span>
            <span className="sec-val">{health.onlineCamsCount} / {health.totalCams}</span>
          </div>
        </div>

        <div className="sec-kpi-card glass-panel">
          <div className="sec-icon-box amber">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="sec-lbl">Chế độ hiện tại</span>
            <span className="sec-val">[{security.mode.toUpperCase()}]</span>
          </div>
        </div>
      </div>

      {/* Main Security Sections */}
      <div className="security-main-layout">
        <div className="sec-layout-left">
          <AlarmSystem
            securityData={security}
            onSelectMode={setSecurityArmedMode}
            onToggleSiren={toggleAlarmSiren}
          />
          <DoorLockWidget
            doors={security.doors}
            onToggleLock={toggleDoorLock}
          />
          <ActivityLog logs={logs} />
        </div>

        <div className="sec-layout-right">
          <CameraView cameras={security.cameras} />
        </div>
      </div>
    </div>
  );
};

