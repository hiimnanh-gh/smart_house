import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  ThermometerSnowflake,
  Lightbulb,
  Tv2,
  ShieldCheck,
  LineChart,
  Cpu,
  Terminal,
  Settings,
  Home,
  Wifi,
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/', label: 'Tổng Quan Hệ Thống', icon: LayoutDashboard },
  { to: '/floorplan', label: 'Mặt Bằng Nhà 2D/3D', icon: MapPin },
  { to: '/climate', label: 'Nhiệt Độ & Khí Hậu', icon: ThermometerSnowflake },
  { to: '/lighting', label: 'Hệ Thống Chiếu Sáng', icon: Lightbulb },
  { to: '/devices', label: 'Thiết Bị Điện', icon: Tv2 },
  { to: '/security', label: 'An Ninh & Camera', icon: ShieldCheck },
  { to: '/analytics', label: 'Phân Tích & Solar', icon: LineChart },
  { to: '/automation', label: 'Tự Động & Hẹn Giờ', icon: Cpu },
  { to: '/iot-debug', label: 'Kiểm Thử Nhúng ESP32', icon: Terminal },
  { to: '/settings', label: 'Cấu Hình & Gateway', icon: Settings },
];

export const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <aside className={`sidebar glass-panel ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon-box">
            <Home className="brand-icon" size={24} />
          </div>
          <div className="brand-text">
            <h2>SmartHome <span className="brand-badge">ULTRA</span></h2>
            <p>Hệ Sinh Thái IoT Đẳng Cấp</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group-label">TRUNG TÂM ĐIỀU HÀNH</div>
          <ul className="nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to} className="nav-item">
                  <NavLink
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={19} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="gateway-status">
            <div className="gateway-indicator">
              <Wifi size={14} className="wifi-icon" />
              <span className="gateway-pulse"></span>
            </div>
            <div className="gateway-info">
              <span className="gateway-label">ESP32-S3 / MQTT Hub</span>
              <span className="gateway-ip">192.168.1.120:1883</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
