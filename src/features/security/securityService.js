/**
 * Security Service
 * Quản lý trạng thái an ninh, khóa vân tay và camera giám sát
 */

export const ARM_MODES = [
  { id: 'away', label: 'Vắng Nhà (Tối Đa)', desc: 'Bật cảm biến chuyển động và chuông cảnh báo', icon: 'ShieldAlert' },
  { id: 'home', label: 'Ở Nhà (Bảo Vệ)', desc: 'Khóa cửa vòng ngoài, tắt cảm biến trong nhà', icon: 'ShieldCheck' },
  { id: 'disarmed', label: 'Vô Hiệu Hóa', desc: 'Tắt toàn bộ hệ thống báo động', icon: 'ShieldOff' },
];

export const getSecurityHealth = (doors = [], cameras = [], armed = false) => {
  const allLocked = doors.every((d) => d.isLocked);
  const onlineCams = cameras.filter((c) => c.isOnline).length;

  return {
    isFullySecured: allLocked && armed,
    lockedDoorsCount: doors.filter((d) => d.isLocked).length,
    totalDoors: doors.length,
    onlineCamsCount: onlineCams,
    totalCams: cameras.length,
  };
};

