/**
 * Analytics Service
 * Tạo dữ liệu lịch sử cảm biến 24 giờ, phân tích mức tiêu thụ và hàm xuất CSV
 */

export const generateHistoricalTelemetry = () => {
  const points = [];
  const hours = [
    '00:00', '02:00', '04:00', '06:00', '08:00', '10:00',
    '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'
  ];

  // Base temps during day/night
  const baseTemps = [22.1, 21.8, 21.5, 23.0, 25.4, 28.2, 31.0, 30.5, 29.1, 27.2, 25.0, 23.4];
  const baseHums = [78, 80, 82, 75, 68, 58, 52, 54, 62, 70, 74, 76];
  const basePower = [0.6, 0.5, 0.4, 1.2, 2.1, 1.8, 2.4, 1.7, 3.2, 3.8, 2.9, 1.1];

  hours.forEach((time, i) => {
    points.push({
      time,
      temp: baseTemps[i],
      hum: baseHums[i],
      power: basePower[i],
    });
  });

  return points;
};

export const exportTelemetryToCsv = (data) => {
  let csvContent = 'data:text/csv;charset=utf-8,ThoiGian,NhietDo_C,DoAm_PhanTram,CongSuat_kW\n';
  data.forEach((row) => {
    csvContent += `${row.time},${row.temp},${row.hum},${row.power}\n`;
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `smarthome_telemetry_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

