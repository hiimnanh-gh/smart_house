import React, { useState } from 'react';
import { Cpu, Power } from 'lucide-react';
import { ESP32_GPIO_PINS } from '../iotDebugService';
import { sound } from '../../../utils/soundEffects';
import './GpioPinMatrix.css';

export const GpioPinMatrix = ({ onToggleGpio }) => {
  const [pins, setPins] = useState(ESP32_GPIO_PINS);

  const handleToggle = (pinName) => {
    sound.playClick();
    setPins((prev) =>
      prev.map((p) => {
        if (p.pin === pinName && p.mode === 'OUTPUT') {
          const next = !p.state;
          if (onToggleGpio) onToggleGpio(pinName, next);
          return { ...p, state: next };
        }
        return p;
      })
    );
  };

  return (
    <div className="gpio-matrix-card glass-panel">
      <div className="gpio-card-head">
        <div className="head-left">
          <Cpu size={20} className="chip-icon" />
          <div>
            <h4>ESP32-S3 Hardware Pinout Matrix</h4>
            <p>Trạng thái chân logic GPIO vi điều khiển phần cứng</p>
          </div>
        </div>
        <span className="chip-badge">3.3V Logic Level</span>
      </div>

      <div className="pins-grid">
        {pins.map((pin) => (
          <div
            key={pin.pin}
            className={`pin-node-box ${pin.state ? 'state-high' : 'state-low'} ${
              pin.mode === 'OUTPUT' ? 'interactive' : 'readonly'
            }`}
            onClick={() => handleToggle(pin.pin)}
            title={pin.mode === 'OUTPUT' ? 'Nhấp để đổi mức HIGH/LOW' : 'Chân ngõ vào (Read-only)'}
          >
            <div className="pin-top">
              <span className="pin-num">{pin.pin}</span>
              <span className={`pin-level-badge ${pin.state ? 'high' : 'low'}`}>
                {pin.state ? 'HIGH (1)' : 'LOW (0)'}
              </span>
            </div>

            <div className="pin-bottom">
              <span className="pin-alias">{pin.name}</span>
              <span className="pin-mode-tag">{pin.mode}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

