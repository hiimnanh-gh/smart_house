/**
 * Lighting Service
 * Quản lý logic chiếu sáng, bảng màu RGB preset và tính toán điện năng chiếu sáng
 */

export const COLOR_PRESETS = [
  { name: 'Vàng Ấm (Warm White)', hex: '#fef08a' },
  { name: 'Trắng Sáng (Daylight)', hex: '#ffffff' },
  { name: 'Hổ Phách (Sunset)', hex: '#f59e0b' },
  { name: 'Xanh Cyan (Cyber)', hex: '#06b6d4' },
  { name: 'Tím Neon (Party)', hex: '#8b5cf6' },
  { name: 'Hồng Lãng Mạn (Romantic)', hex: '#ec4899' },
  { name: 'Xanh Lá Tự Nhiên (Zen)', hex: '#10b981' },
];

export const calculateRoomLightingPower = (lights = [], roomName = '') => {
  const roomLights = lights.filter((l) => l.room === roomName);
  const activeCount = roomLights.filter((l) => l.isOn).length;
  const currentWatt = roomLights.reduce(
    (sum, l) => (l.isOn ? sum + Math.round((l.watt * l.brightness) / 100) : sum),
    0
  );

  return {
    total: roomLights.length,
    active: activeCount,
    watt: currentWatt,
  };
};

