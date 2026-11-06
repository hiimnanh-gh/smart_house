/**
 * Climate & Sensor Service
 * Logic phân tích ngưỡng thoải mái nhiệt độ, độ ẩm và khuyến nghị điều hòa
 */

export const getComfortLevel = (temp, hum) => {
  if (temp < 20) return { status: 'cold', text: 'Se lạnh', advice: 'Nên bật chế độ sưởi hoặc tăng nhiệt độ' };
  if (temp > 28) return { status: 'hot', text: 'Nóng', advice: 'Nên hạ nhiệt độ điều hòa hoặc bật thêm quạt' };
  if (hum > 70) return { status: 'humid', text: 'Độ ẩm cao', advice: 'Nên bật chế độ Dry (hút ẩm)' };
  if (hum < 40) return { status: 'dry', text: 'Không khí khô', advice: 'Nên bật máy phun sương bù ẩm' };
  return { status: 'optimal', text: 'Rất thoải mái', advice: 'Nhiệt độ và độ ẩm ở mức lý tưởng cho sức khỏe' };
};

export const AC_MODES = [
  { id: 'cool', label: 'Làm Lạnh (Cool)', icon: 'Snowflake' },
  { id: 'heat', label: 'Sưởi Ấm (Heat)', icon: 'Flame' },
  { id: 'dry', label: 'Hút Ẩm (Dry)', icon: 'Droplets' },
  { id: 'fan', label: 'Quạt Gió (Fan)', icon: 'Wind' },
  { id: 'auto', label: 'Tự Động (Auto)', icon: 'Sparkles' },
];

export const FAN_SPEEDS = [
  { id: 'low', label: 'Êm Ái (Thấp)' },
  { id: 'mid', label: 'Vừa Phải' },
  { id: 'high', label: 'Cực Đại' },
  { id: 'auto', label: 'Tự Động' },
];

