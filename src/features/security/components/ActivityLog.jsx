import React from 'react';
import { History, Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import './ActivityLog.css';

export const ActivityLog = ({ logs = [] }) => {
  const getLogIcon = (type) => {
    switch (type) {
      case 'security':
        return <Shield size={16} className="log-type-icon security" />;
      case 'danger':
        return <AlertTriangle size={16} className="log-type-icon danger" />;
      case 'success':
        return <CheckCircle size={16} className="log-type-icon success" />;
      default:
        return <Info size={16} className="log-type-icon info" />;
    }
  };

  return (
    <div className="activity-log-box glass-panel">
      <div className="log-head">
        <div className="head-title">
          <History size={20} className="history-icon" />
          <div>
            <h4>Nhật Ký An Ninh & Sự Kiện Cảm Biến</h4>
            <p>Ghi nhận thời gian thực các lần mở khóa, cảnh báo và chuyển động</p>
          </div>
        </div>
      </div>

      <div className="activity-list">
        {logs.map((log) => (
          <div key={log.id} className="activity-row">
            <div className="activity-icon-wrap">
              {getLogIcon(log.type)}
            </div>
            <div className="activity-content">
              <span className="activity-message">{log.text}</span>
            </div>
            <span className="activity-timestamp">{log.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

