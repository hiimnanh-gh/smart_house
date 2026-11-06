import React, { useState } from 'react';
import './CreateSceneModal.css';

export const CreateSceneModal = ({ onAddRule, onClose }) => {
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('Nhiệt độ phòng > 30°C');
  const [action, setAction] = useState('Bật điều hòa 23°C');
  const [category, setCategory] = useState('climate');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddRule({
      id: `rule-${Date.now()}`,
      name: name.trim(),
      trigger,
      action,
      isActive: true,
      category,
    });
    onClose();
  };

  return (
    <form className="create-rule-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Tên quy tắc tự động hóa</label>
        <input
          type="text"
          className="form-input"
          placeholder="Ví dụ: Bật đèn lối đi khi có người"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Điều kiện kích hoạt (NẾU...)</label>
        <input
          type="text"
          className="form-input"
          value={trigger}
          onChange={(e) => setTrigger(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Hành động thực thi (THÌ...)</label>
        <input
          type="text"
          className="form-input"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Phân nhóm</label>
        <select
          className="form-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="climate">Nhiệt độ & Khí hậu</option>
          <option value="security">An ninh & Khóa</option>
          <option value="energy">Tiết kiệm năng lượng</option>
        </select>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onClose}>
          Hủy bỏ
        </button>
        <button type="submit" className="btn-submit">
          Lưu Kịch Bản
        </button>
      </div>
    </form>
  );
};

