import React, { useState } from 'react';
import './AddDeviceModal.css';

export const AddDeviceModal = ({ onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('Phòng khách');
  const [icon, setIcon] = useState('tv');
  const [powerWatt, setPowerWatt] = useState(100);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      room,
      icon,
      powerWatt: Number(powerWatt) || 50,
      statusText: 'Mới thêm',
    });
    onClose();
  };

  return (
    <form className="add-device-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Tên thiết bị</label>
        <input
          type="text"
          className="form-input"
          placeholder="Ví dụ: Máy Pha Cà Phê DeLonghi"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group flex-1">
          <label className="form-label">Vị trí phòng</label>
          <select
            className="form-select"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          >
            <option value="Phòng khách">Phòng khách</option>
            <option value="Phòng ngủ">Phòng ngủ</option>
            <option value="Nhà bếp">Nhà bếp</option>
            <option value="Phòng tắm">Phòng tắm</option>
            <option value="Sân vườn">Sân vườn</option>
            <option value="Gara">Gara</option>
          </select>
        </div>

        <div className="form-group flex-1">
          <label className="form-label">Biểu tượng</label>
          <select
            className="form-select"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          >
            <option value="tv">Tivi / Màn hình</option>
            <option value="bot">Robot dọn dẹp</option>
            <option value="heater">Bình nước nóng</option>
            <option value="blinds">Rèm cửa tự động</option>
            <option value="dishwasher">Máy rửa bát</option>
            <option value="sprinkler">Tưới cây</option>
            <option value="garage">Cửa cuốn gara</option>
            <option value="plug">Ổ cắm thông minh</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Công suất tiêu thụ định mức (Watts)</label>
        <input
          type="number"
          className="form-input"
          value={powerWatt}
          onChange={(e) => setPowerWatt(e.target.value)}
          min="1"
          max="5000"
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onClose}>
          Hủy bỏ
        </button>
        <button type="submit" className="btn-submit">
          Lưu Thiết Bị
        </button>
      </div>
    </form>
  );
};

