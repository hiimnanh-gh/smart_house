import React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../../../components/common/StatusBadge';
import './DeviceScheduleList.css';

export const DeviceScheduleList = () => {
  const activeSchedules = [
    { id: 1, title: 'Bật Bình Nóng Lạnh', time: '18:00 Hàng ngày', target: 'Phòng tắm Master', status: 'active' },
    { id: 2, title: 'Robot Quét Dọn Tầng 1', time: '09:00 Thứ 2, 4, 6', target: 'Phòng khách & Bếp', status: 'active' },
    { id: 3, title: 'Đóng Toàn Bộ Rèm Cửa', time: '19:30 Hàng ngày', target: 'Tất cả các phòng', status: 'active' },
    { id: 4, title: 'Tưới Cây Sân Vườn', time: '06:30 & 17:30', target: 'Khu vực Sân Vườn', status: 'active' },
  ];

  return (
    <div className="schedules-box glass-panel">
      <div className="schedules-header">
        <div className="schedules-title-wrap">
          <Clock size={20} className="clock-icon" />
          <div>
            <h4>Lịch Hẹn Giờ Thiết Bị Gia Dụng</h4>
            <p>Tự động bật/tắt thiết bị theo thời gian định trước</p>
          </div>
        </div>
      </div>

      <div className="schedules-list">
        {activeSchedules.map((sch) => (
          <div key={sch.id} className="schedule-entry">
            <div className="entry-left">
              <span className="entry-title">{sch.title}</span>
              <span className="entry-target">{sch.target}</span>
            </div>
            <div className="entry-right">
              <span className="entry-time">{sch.time}</span>
              <StatusBadge status="active" text="Đang kích hoạt" size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

