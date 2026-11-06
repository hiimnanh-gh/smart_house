/**
 * Automation Service
 * Quản lý kịch bản thông minh (Scenes) và các luồng tự động IFTTT (If This Then That)
 */

export const INITIAL_AUTOMATION_RULES = [
  {
    id: 'rule-1',
    name: 'Tự Động Làm Mát Khi Trời Nóng',
    trigger: 'Cảm biến phòng khách > 28°C',
    action: 'Bật điều hòa 24°C + Bật quạt số 2',
    isActive: true,
    category: 'climate',
  },
  {
    id: 'rule-2',
    name: 'Khử Ẩm Tự Động Mùa Nồm',
    trigger: 'Độ ẩm không khí > 75%',
    action: 'Chuyển điều hòa sang chế độ Hút ẩm (Dry)',
    isActive: true,
    category: 'climate',
  },
  {
    id: 'rule-3',
    name: 'Bảo Vệ Đêm Khuya',
    trigger: 'Thời gian sau 23:00',
    action: 'Khóa toàn bộ các cửa & Bật cảm biến chuyển động',
    isActive: true,
    category: 'security',
  },
  {
    id: 'rule-4',
    name: 'Tắt Điện Khi Không Có Người',
    trigger: 'Không có chuyển động trong 30 phút',
    action: 'Tắt đèn phòng khách và đèn bếp',
    isActive: false,
    category: 'energy',
  },
];

