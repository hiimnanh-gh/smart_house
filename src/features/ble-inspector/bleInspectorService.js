/**
 * BLE Packet Inspector Service
 * Hỗ trợ tìm kiếm, lọc và xuất dữ liệu kiểm tra gói tin BLE truyền lên
 */

export const filterAuditPackets = (packets = [], query = '') => {
  const q = query.trim().toLowerCase();
  if (!q) return packets;

  return packets.filter(
    (pkt) =>
      pkt.rawText?.toLowerCase().includes(q) ||
      pkt.hexStr?.toLowerCase().includes(q) ||
      pkt.time?.toLowerCase().includes(q) ||
      String(pkt.seq).includes(q)
  );
};

export const exportAuditToJson = (packets = []) => {
  const payload = packets.map((pkt) => ({
    seq: pkt.seq,
    time: pkt.time,
    byteLength: pkt.byteLength,
    intervalMs: pkt.intervalMs,
    isValidJson: pkt.isValidJson,
    rawText: pkt.rawText,
    parsedObject: pkt.parsed?.rawObject || null,
    hexFrame: pkt.hexStr,
  }));

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ble_stickem_packets_${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportAuditToCsv = (packets = []) => {
  const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
  const rows = [
    ['STT', 'ThoiGian', 'ChuKy_ms', 'KichThuoc_Bytes', 'HopLe_JSON', 'DuLieuGoc', 'HexFrame'].join(','),
  ];

  packets.forEach((pkt) => {
    rows.push(
      [
        pkt.seq,
        escapeCsv(pkt.time),
        pkt.intervalMs ?? '',
        pkt.byteLength,
        pkt.isValidJson ? 'JSON' : 'RAW',
        escapeCsv(pkt.rawText),
        escapeCsv(pkt.hexStr),
      ].join(',')
    );
  });

  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ble_stickem_packets_${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

