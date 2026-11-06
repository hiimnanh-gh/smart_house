import React, { useState } from 'react';
import { useSmartHome } from '../../context/SmartHomeContext';
import { ApplianceCard } from './components/ApplianceCard';
import { AddDeviceModal } from './components/AddDeviceModal';
import { DeviceScheduleList } from './components/DeviceScheduleList';
import { Modal } from '../../components/common/Modal';
import { Plus, Tv2, Zap, Power } from 'lucide-react';
import './DevicesPage.css';

export const DevicesPage = () => {
  const {
    devices,
    toggleDevice,
    updateDevicePercent,
    addCustomDevice,
    removeDevice,
  } = useSmartHome();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRoomFilter, setSelectedRoomFilter] = useState('ALL');

  const roomsList = Array.from(new Set(devices.map((d) => d.room)));
  const activeCount = devices.filter((d) => d.isOn).length;
  const totalWatts = devices.reduce(
    (sum, d) => (d.isOn ? sum + (d.powerWatt || 0) : sum),
    0
  );

  const filteredDevices =
    selectedRoomFilter === 'ALL'
      ? devices
      : devices.filter((d) => d.room === selectedRoomFilter);

  return (
    <div className="devices-page animate-fade-in">
      <div className="devices-page-header">
        <div>
          <h1 className="page-title">Quản Lý Thiết Bị Điện & Tiện Ích</h1>
          <p className="page-subtitle">
            Điều khiển TV, rèm cửa, máy hút bụi, bình nóng lạnh và các thiết bị ngoại vi thông minh
          </p>
        </div>

        <button className="btn-add-device" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} /> Thêm Thiết Bị Mới
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="devices-summary-row">
        <div className="summary-chip glass-panel">
          <div className="summary-icon-box cyan">
            <Tv2 size={20} />
          </div>
          <div className="summary-meta">
            <span className="summary-lbl">Thiết bị đang chạy</span>
            <span className="summary-val">{activeCount} / {devices.length}</span>
          </div>
        </div>

        <div className="summary-chip glass-panel">
          <div className="summary-icon-box amber">
            <Zap size={20} />
          </div>
          <div className="summary-meta">
            <span className="summary-lbl">Công suất phụ tải</span>
            <span className="summary-val">{totalWatts} W</span>
          </div>
        </div>

        <div className="summary-chip glass-panel">
          <div className="summary-icon-box emerald">
            <Power size={20} />
          </div>
          <div className="summary-meta">
            <span className="summary-lbl">Chế độ tiết kiệm phụ tải</span>
            <span className="summary-val">Bật (Active)</span>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="room-filters">
        <button
          className={`filter-chip ${selectedRoomFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => setSelectedRoomFilter('ALL')}
        >
          Tất Cả ({devices.length})
        </button>
        {roomsList.map((r) => (
          <button
            key={r}
            className={`filter-chip ${selectedRoomFilter === r ? 'active' : ''}`}
            onClick={() => setSelectedRoomFilter(r)}
          >
            {r} ({devices.filter((d) => d.room === r).length})
          </button>
        ))}
      </div>

      {/* Grid of Appliance Cards */}
      <div className="appliances-grid">
        {filteredDevices.map((device) => (
          <ApplianceCard
            key={device.id}
            device={device}
            onToggle={toggleDevice}
            onUpdatePercent={updateDevicePercent}
            onRemove={removeDevice}
          />
        ))}
      </div>

      {/* Schedule list */}
      <DeviceScheduleList />

      {/* Add Device Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm Thiết Bị Mới Vào Hệ Thống"
      >
        <AddDeviceModal
          onAdd={addCustomDevice}
          onClose={() => setIsAddModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

