/**
 * Dashboard Service
 * Xử lý dữ liệu tổng hợp, tính toán điện năng và phân loại trạng thái thiết bị
 */

export const calculateOverviewStats = (lights = [], devices = [], climate = {}, sensors = {}) => {
  const activeLights = lights.filter((l) => l.isOn).length;
  const activeDevices = devices.filter((d) => d.isOn).length;
  
  // Tổng công suất đang tiêu thụ (W)
  const lightsWatt = lights.reduce((sum, l) => (l.isOn ? sum + (l.watt * (l.brightness / 100)) : sum), 0);
  const devicesWatt = devices.reduce((sum, d) => (d.isOn ? sum + (d.powerWatt || 0) : sum), 0);
  const climateWatt = (climate.acLiving?.isOn ? 1200 : 0) + (climate.acBedroom?.isOn ? 900 : 0) + (climate.livingFan?.isOn ? 55 : 0);
  
  const totalKw = +((lightsWatt + devicesWatt + climateWatt) / 1000).toFixed(2);

  return {
    activeLightsCount: activeLights,
    totalLightsCount: lights.length,
    activeDevicesCount: activeDevices,
    totalDevicesCount: devices.length,
    totalKw,
    temperatureAvg: sensors.livingRoom?.temp || 26.0,
    humidityAvg: sensors.livingRoom?.hum || 60,
  };
};

export const getAqiLevel = (aqiValue) => {
  if (aqiValue <= 50) return { label: 'Tốt (Trong Lành)', color: 'emerald', status: 'positive' };
  if (aqiValue <= 100) return { label: 'Trung Bình', color: 'amber', status: 'neutral' };
  return { label: 'Kém (Cần Lọc Khí)', color: 'rose', status: 'negative' };
};

