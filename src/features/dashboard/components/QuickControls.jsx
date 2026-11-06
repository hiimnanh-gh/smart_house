import React from 'react';
import { Lightbulb, Fan, Snowflake, Lock, Unlock, Bot, Blinds } from 'lucide-react';
import { ToggleSwitch } from '../../../components/common/ToggleSwitch';
import './QuickControls.css';

export const QuickControls = ({
  lights,
  onToggleLight,
  climate,
  onToggleClimate,
  security,
  onToggleDoorLock,
  devices,
  onToggleDevice,
}) => {
  const livingLight = lights.find((l) => l.id === 'light-1') || lights[0];
  const livingAc = climate.acLiving;
  const livingFan = climate.livingFan;
  const mainDoor = security.doors.find((d) => d.id === 'door-1');
  const robot = devices.find((d) => d.icon === 'bot');
  const blinds = devices.find((d) => d.icon === 'blinds');

  return (
    <div className="quick-controls-wrapper glass-panel">
      <div className="quick-controls-header">
        <div>
          <h3>Điều Khiển Nhanh</h3>
          <p>Các nút bấm thao tác tức thời cho thiết bị trọng yếu</p>
        </div>
      </div>

      <div className="quick-buttons-grid">
        {/* Light 1 */}
        {livingLight && (
          <div className={`quick-card ${livingLight.isOn ? 'active' : ''}`}>
            <div className="quick-card-top">
              <div className="quick-icon-box light-icon">
                <Lightbulb size={22} />
              </div>
              <ToggleSwitch
                size="sm"
                checked={livingLight.isOn}
                onChange={() => onToggleLight(livingLight.id)}
              />
            </div>
            <div className="quick-card-info">
              <h4>{livingLight.name}</h4>
              <span className="quick-status">{livingLight.isOn ? `Sáng ${livingLight.brightness}%` : 'Đang tắt'}</span>
            </div>
          </div>
        )}

        {/* AC Living */}
        {livingAc && (
          <div className={`quick-card ${livingAc.isOn ? 'active' : ''}`}>
            <div className="quick-card-top">
              <div className="quick-icon-box ac-icon">
                <Snowflake size={22} />
              </div>
              <ToggleSwitch
                size="sm"
                checked={livingAc.isOn}
                onChange={() => onToggleClimate('acLiving')}
              />
            </div>
            <div className="quick-card-info">
              <h4>Điều Hòa Phòng Khách</h4>
              <span className="quick-status">{livingAc.isOn ? `${livingAc.targetTemp}°C • Làm lạnh` : 'Đang tắt'}</span>
            </div>
          </div>
        )}

        {/* Living Fan */}
        {livingFan && (
          <div className={`quick-card ${livingFan.isOn ? 'active' : ''}`}>
            <div className="quick-card-top">
              <div className="quick-icon-box fan-icon">
                <Fan size={22} className={livingFan.isOn ? 'fan-rotating' : ''} />
              </div>
              <ToggleSwitch
                size="sm"
                checked={livingFan.isOn}
                onChange={() => onToggleClimate('livingFan')}
              />
            </div>
            <div className="quick-card-info">
              <h4>Quạt Trần Thông Minh</h4>
              <span className="quick-status">{livingFan.isOn ? `Cấp gió ${livingFan.speed}/4` : 'Đang dừng'}</span>
            </div>
          </div>
        )}

        {/* Main Door */}
        {mainDoor && (
          <div
            className={`quick-card clickable ${mainDoor.isLocked ? 'locked' : 'unlocked'}`}
            onClick={() => onToggleDoorLock(mainDoor.id)}
          >
            <div className="quick-card-top">
              <div className="quick-icon-box lock-icon">
                {mainDoor.isLocked ? <Lock size={22} /> : <Unlock size={22} />}
              </div>
              <span className={`lock-chip ${mainDoor.isLocked ? 'chip-locked' : 'chip-open'}`}>
                {mainDoor.isLocked ? 'Đã khóa chốt' : 'Mở khóa'}
              </span>
            </div>
            <div className="quick-card-info">
              <h4>{mainDoor.name}</h4>
              <span className="quick-status">Chạm để {mainDoor.isLocked ? 'mở khóa' : 'khóa chốt'}</span>
            </div>
          </div>
        )}

        {/* Robot cleaner */}
        {robot && (
          <div className={`quick-card ${robot.isOn ? 'active' : ''}`}>
            <div className="quick-card-top">
              <div className="quick-icon-box robot-icon">
                <Bot size={22} />
              </div>
              <ToggleSwitch
                size="sm"
                checked={robot.isOn}
                onChange={() => onToggleDevice(robot.id)}
              />
            </div>
            <div className="quick-card-info">
              <h4>{robot.name}</h4>
              <span className="quick-status">{robot.statusText}</span>
            </div>
          </div>
        )}

        {/* Blinds */}
        {blinds && (
          <div className={`quick-card ${blinds.isOn ? 'active' : ''}`}>
            <div className="quick-card-top">
              <div className="quick-icon-box blinds-icon">
                <Blinds size={22} />
              </div>
              <ToggleSwitch
                size="sm"
                checked={blinds.isOn}
                onChange={() => onToggleDevice(blinds.id)}
              />
            </div>
            <div className="quick-card-info">
              <h4>{blinds.name}</h4>
              <span className="quick-status">{blinds.statusText}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

