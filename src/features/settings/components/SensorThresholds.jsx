import React, { useState } from 'react';
import { Sliders, BellRing, Save } from 'lucide-react';
import { RangeSlider } from '../../../components/common/RangeSlider';
import { DEFAULT_THRESHOLDS } from '../settingsService';
import './SensorThresholds.css';

export const SensorThresholds = ({ onSaveNotify }) => {
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    if (onSaveNotify) onSaveNotify('Đã cập nhật ngưỡng cảnh báo an toàn cảm biến');
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="thresholds-card glass-panel">
      <div className="th-head">
        <div className="th-title">
          <BellRing size={22} className="th-icon" />
          <div>
            <h4>Ngưỡng Kích Hoạt Cảnh Báo An Toàn</h4>
            <p>Hệ thống tự động phát chuông hoặc gửi thông báo khi cảm biến chạm ngưỡng</p>
          </div>
        </div>
      </div>

      <div className="th-sliders-grid">
        <RangeSlider
          label="Cảnh báo nhiệt độ quá cao"
          min={25}
          max={45}
          unit="°C"
          value={thresholds.maxTemp}
          onChange={(val) => setThresholds({ ...thresholds, maxTemp: val })}
        />

        <RangeSlider
          label="Cảnh báo nhiệt độ quá lạnh"
          min={10}
          max={22}
          unit="°C"
          value={thresholds.minTemp}
          onChange={(val) => setThresholds({ ...thresholds, minTemp: val })}
        />

        <RangeSlider
          label="Cảnh báo độ ẩm quá ẩm (Nguy cơ nấm mốc)"
          min={60}
          max={95}
          unit="%"
          value={thresholds.maxHum}
          onChange={(val) => setThresholds({ ...thresholds, maxHum: val })}
        />

        <RangeSlider
          label="Cảnh báo ô nhiễm bụi mịn AQI"
          min={50}
          max={200}
          unit=" AQI"
          value={thresholds.maxAqi}
          onChange={(val) => setThresholds({ ...thresholds, maxAqi: val })}
        />
      </div>

      <div className="th-footer">
        <span className="th-note">
          {isSaved ? '✓ Đã lưu thành công vào bộ nhớ Hub' : 'Các thông số có hiệu lực lập tức'}
        </span>
        <button className="btn-save-thresholds" onClick={handleSave}>
          <Save size={16} /> Lưu Cấu Hình Ngưỡng
        </button>
      </div>
    </div>
  );
};

