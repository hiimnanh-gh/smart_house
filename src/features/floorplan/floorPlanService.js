/**
 * Floor Plan Service
 * Quản lý toạ độ và phân vùng bản đồ mặt bằng 2D của căn nhà
 */

export const ROOM_ZONES = [
  {
    id: 'living',
    name: 'Phòng Khách',
    area: '32 m²',
    x: '15%',
    y: '20%',
    width: '45%',
    height: '42%',
    tempKey: 'livingRoom',
    lightFilter: 'Phòng khách',
    deviceFilter: 'Phòng khách',
    colorAccent: '#38bdf8',
  },
  {
    id: 'bedroom',
    name: 'Phòng Ngủ Master',
    area: '24 m²',
    x: '62%',
    y: '20%',
    width: '35%',
    height: '42%',
    tempKey: 'bedroom',
    lightFilter: 'Phòng ngủ',
    deviceFilter: 'Phòng ngủ',
    colorAccent: '#8b5cf6',
  },
  {
    id: 'kitchen',
    name: 'Bếp & Phòng Ăn',
    area: '20 m²',
    x: '15%',
    y: '64%',
    width: '35%',
    height: '32%',
    tempKey: 'kitchen',
    lightFilter: 'Nhà bếp',
    deviceFilter: 'Nhà bếp',
    colorAccent: '#f59e0b',
  },
  {
    id: 'garden',
    name: 'Sân Vườn & Ban Công',
    area: '18 m²',
    x: '52%',
    y: '64%',
    width: '45%',
    height: '32%',
    tempKey: 'outdoor',
    lightFilter: 'Sân vườn',
    deviceFilter: 'Sân vườn',
    colorAccent: '#10b981',
  },
];

