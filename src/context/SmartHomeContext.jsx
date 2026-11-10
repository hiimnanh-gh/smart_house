import React, { createContext, useContext, useState, useEffect } from 'react';
import { iotBridge } from '../services/iotBridgeService';
import { bleStickEmStore } from '../features/ble-stickem/bleStickEmService';

const SmartHomeContext = createContext();

const INITIAL_SENSORS = {
  livingRoom: { temp: 26.4, hum: 62, aqi: 38, co2: 450, motion: false },
  bedroom: { temp: 24.2, hum: 56, aqi: 28, co2: 410, motion: false },
  kitchen: { temp: 27.8, hum: 68, aqi: 65, co2: 520, gasLeak: false },
  outdoor: { temp: 31.5, hum: 74, pressure: 1012, uv: 5 },
  power: { currentKw: 1.68, dailyKwh: 14.8, monthlyKwh: 342 },
};

const INITIAL_LIGHTS = [
  { id: 'light-1', name: 'Đèn trần Phòng khách', room: 'Phòng khách', isOn: true, brightness: 85, color: '#fef08a', watt: 36, type: 'ceiling' },
  { id: 'light-2', name: 'Đèn Chùm Pha lê', room: 'Phòng khách', isOn: false, brightness: 60, color: '#fcd34d', watt: 48, type: 'chandelier' },
  { id: 'light-3', name: 'LED Hắt Tường RGB', room: 'Phòng khách', isOn: true, brightness: 90, color: '#06b6d4', watt: 24, type: 'rgb' },
  { id: 'light-4', name: 'Đèn Bếp & Bàn ăn', room: 'Nhà bếp', isOn: true, brightness: 100, color: '#ffffff', watt: 32, type: 'downlight' },
  { id: 'light-5', name: 'Đèn Ngủ Master', room: 'Phòng ngủ', isOn: false, brightness: 30, color: '#fdba74', watt: 12, type: 'ambient' },
  { id: 'light-6', name: 'Đèn Đọc sách', room: 'Phòng ngủ', isOn: false, brightness: 50, color: '#ffffff', watt: 9, type: 'desk' },
  { id: 'light-7', name: 'Đèn Sân Vườn Cổng', room: 'Sân vườn', isOn: true, brightness: 100, color: '#fef3c7', watt: 50, type: 'floodlight' },
];

const INITIAL_CLIMATE = {
  acLiving: { isOn: true, mode: 'cool', targetTemp: 24, fanSpeed: 'mid', swing: true, eco: true },
  acBedroom: { isOn: false, mode: 'cool', targetTemp: 26, fanSpeed: 'low', swing: false, eco: false },
  livingFan: { isOn: true, speed: 2, maxSpeed: 4 },
  bedroomFan: { isOn: false, speed: 1, maxSpeed: 3 },
  airPurifier: { isOn: true, mode: 'auto', filterLife: 92 },
  dehumidifier: { isOn: false, targetHum: 55 },
};

const INITIAL_DEVICES = [
  { id: 'dev-1', name: 'Smart TV QLED 65"', room: 'Phòng khách', isOn: true, statusText: 'Đang phát Netflix', powerWatt: 110, icon: 'tv' },
  { id: 'dev-2', name: 'Robot Hút bụi Deebot', room: 'Phòng khách', isOn: true, statusText: 'Đang dọn dẹp (Pin 78%)', powerWatt: 45, icon: 'bot' },
  { id: 'dev-3', name: 'Bình Nước Nóng Ariston', room: 'Phòng tắm', isOn: false, statusText: 'Tắt - 42°C sẵn sàng', powerWatt: 2500, icon: 'heater' },
  { id: 'dev-4', name: 'Rèm Cửa Tự Động', room: 'Phòng khách', isOn: true, openPercent: 80, statusText: 'Mở 80%', powerWatt: 25, icon: 'blinds' },
  { id: 'dev-5', name: 'Máy Rửa Bát Bosch', room: 'Nhà bếp', isOn: false, statusText: 'Chế độ chờ', powerWatt: 5, icon: 'dishwasher' },
  { id: 'dev-6', name: 'Hệ Thống Tưới Cây Tự Động', room: 'Sân vườn', isOn: false, statusText: 'Lần tưới kế: 17:30', powerWatt: 30, icon: 'sprinkler' },
  { id: 'dev-7', name: 'Cửa Cuốn Thông Minh', room: 'Gara', isOn: false, isOpen: false, statusText: 'Đã đóng kín', powerWatt: 80, icon: 'garage' },
];

const INITIAL_SECURITY = {
  armed: true,
  mode: 'home', // 'away', 'home', 'disarmed'
  siren: false,
  doors: [
    { id: 'door-1', name: 'Cửa Chính Vân Tay', location: 'Cổng vào', isLocked: true, battery: 92, lastUnlock: '12:40 trưa' },
    { id: 'door-2', name: 'Cửa Gara Ô Tô', location: 'Gara', isLocked: true, battery: 88, lastUnlock: '08:15 sáng' },
    { id: 'door-3', name: 'Cửa Ban Công Tầng 2', location: 'Phòng ngủ', isLocked: true, battery: 95, lastUnlock: 'Hôm qua' },
  ],
  cameras: [
    { id: 'cam-1', name: 'Camera Cổng Chính', location: 'Cổng trước', isOnline: true, status: 'Phát hiện chuyển động gần' },
    { id: 'cam-2', name: 'Camera Phòng Khách', location: 'Phòng khách', isOnline: true, status: 'Bình thường' },
    { id: 'cam-3', name: 'Camera Sân Sau & Hồ Cá', location: 'Sân sau', isOnline: true, status: 'Bình thường' },
    { id: 'cam-4', name: 'Camera Gara Xe', location: 'Gara', isOnline: true, status: 'Bình thường' },
  ],
};

const INITIAL_SCENES = [
  { id: 'scene-home', name: 'Về Nhà', desc: 'Bật đèn phòng khách, điều hòa 25°C, mở rèm 80%', icon: 'home', active: true },
  { id: 'scene-away', name: 'Rời Nhà', desc: 'Tắt toàn bộ đèn & điều hòa, khóa cửa, kích hoạt an ninh', icon: 'shield', active: false },
  { id: 'scene-night', name: 'Ngủ Ngon', desc: 'Tắt đèn chính, bật đèn ngủ 20%, điều hòa 26°C êm dịu', icon: 'moon', active: false },
  { id: 'scene-party', name: 'Tiệc Tùng', desc: 'Bật LED RGB đổi màu, quạt gió tối đa, loa phát nhạc', icon: 'sparkles', active: false },
  { id: 'scene-cinema', name: 'Xem Phim', desc: 'Đóng rèm 100%, đèn mờ 15%, mở TV QLED', icon: 'film', active: false },
];

export const SmartHomeProvider = ({ children }) => {
  const [sensors, setSensors] = useState(() => {
    const saved = localStorage.getItem('smarthome_sensors');
    return saved ? JSON.parse(saved) : INITIAL_SENSORS;
  });

  const [lights, setLights] = useState(() => {
    const saved = localStorage.getItem('smarthome_lights');
    return saved ? JSON.parse(saved) : INITIAL_LIGHTS;
  });

  const [climate, setClimate] = useState(() => {
    const saved = localStorage.getItem('smarthome_climate');
    return saved ? JSON.parse(saved) : INITIAL_CLIMATE;
  });

  const [devices, setDevices] = useState(() => {
    const saved = localStorage.getItem('smarthome_devices');
    return saved ? JSON.parse(saved) : INITIAL_DEVICES;
  });

  const [security, setSecurity] = useState(() => {
    const saved = localStorage.getItem('smarthome_security');
    return saved ? JSON.parse(saved) : INITIAL_SECURITY;
  });

  const [scenes, setScenes] = useState(() => {
    const saved = localStorage.getItem('smarthome_scenes');
    return saved ? JSON.parse(saved) : INITIAL_SCENES;
  });

  const [activeScene, setActiveScene] = useState('scene-home');
  const [isSimulating, setIsSimulating] = useState(true);
  const [hardwareStatus, setHardwareStatus] = useState('DISCONNECTED');
  const [hardwareMeta, setHardwareMeta] = useState({
    url: 'ws://192.168.1.120:81',
    rssi: -58,
    freeHeap: 284,
    node: 'ESP32_LIVING_ROOM',
  });
  const [logs, setLogs] = useState([
    { id: 1, time: '14:38:12', text: 'Hệ thống khởi động thành công', type: 'info' },
    { id: 2, time: '14:35:00', text: 'Nhiệt độ phòng khách duy trì ổn định ở 26.4°C', type: 'success' },
    { id: 3, time: '14:30:22', text: 'Cửa chính xác thực vân tay Admin thành công', type: 'security' },
  ]);

  // Lắng nghe gói tin từ kết nối phần cứng ESP32 thực tế
  useEffect(() => {
    const unsubscribe = iotBridge.subscribe((event, data) => {
      if (event === 'status_change') {
        setHardwareStatus(data.status);
        if (data.url) {
          setHardwareMeta((prev) => ({ ...prev, url: data.url }));
        }
      } else if (event === 'packet_rx') {
        if (data.type === 'TELEMETRY' && data.temp !== undefined) {
          setSensors((prev) => ({
            ...prev,
            livingRoom: {
              ...prev.livingRoom,
              temp: data.temp,
              hum: data.hum ?? prev.livingRoom.hum,
            },
          }));
          setHardwareMeta((prev) => ({
            ...prev,
            rssi: data.rssi ?? prev.rssi,
            freeHeap: data.freeHeap ? Math.round(data.freeHeap / 1024) : prev.freeHeap,
            node: data.node ?? prev.node,
          }));
          addLog(`Nhận cảm biến từ ESP32 thực tế: ${data.temp}°C, ${data.hum}%`, 'success');
        } else if (data.type === 'INIT_STATE') {
          if (typeof data.lightState === 'boolean') {
            setLights((prev) =>
              prev.map((l) => (l.id === 'light-1' ? { ...l, isOn: data.lightState } : l))
            );
          }
          if (typeof data.fanState === 'boolean') {
            setClimate((prev) => ({
              ...prev,
              livingFan: { ...prev.livingFan, isOn: data.fanState },
            }));
          }
          if (typeof data.sirenState === 'boolean') {
            setSecurity((prev) => ({ ...prev, siren: data.sirenState }));
          }
          addLog('Đã đồng bộ trạng thái GPIO ban đầu từ ESP32', 'info');
        }
      } else if (event === 'log') {
        addLog(data.text, data.type);
      }
    });

    return () => unsubscribe();
  }, []);

  // Đồng bộ nhiệt độ / độ ẩm từ cảm biến BLE (Stick 'Em / Chiendeptry) lên Dashboard
  useEffect(() => {
    bleStickEmStore.setClimateSyncHandler(({ temp, hum }) => {
      setIsSimulating(false);
      setSensors((prev) => ({
        ...prev,
        livingRoom: {
          ...prev.livingRoom,
          temp: temp !== undefined ? temp : prev.livingRoom.temp,
          hum: hum !== undefined ? hum : prev.livingRoom.hum,
        },
      }));
    });

    return () => bleStickEmStore.setClimateSyncHandler(null);
  }, []);

  const connectHardware = (url) => {
    setIsSimulating(false);
    iotBridge.connect(url);
  };

  const disconnectHardware = () => {
    iotBridge.disconnect();
  };

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('smarthome_sensors', JSON.stringify(sensors));
  }, [sensors]);

  useEffect(() => {
    localStorage.setItem('smarthome_lights', JSON.stringify(lights));
  }, [lights]);

  useEffect(() => {
    localStorage.setItem('smarthome_climate', JSON.stringify(climate));
  }, [climate]);

  useEffect(() => {
    localStorage.setItem('smarthome_devices', JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem('smarthome_security', JSON.stringify(security));
  }, [security]);

  const addLog = (text, type = 'info') => {
    const now = new Date();
    const time = now.toTimeString().split(' ')[0];
    setLogs((prev) => [{ id: Date.now(), time, text, type }, ...prev.slice(0, 19)]);
  };

  // Real-time sensor simulation ticks
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setSensors((prev) => {
        const deltaTemp = (Math.random() - 0.5) * 0.2;
        const deltaHum = Math.floor((Math.random() - 0.5) * 3);
        const deltaAqi = Math.floor((Math.random() - 0.5) * 2);
        const deltaPower = (Math.random() - 0.5) * 0.08;

        const newLivingTemp = Math.max(18, Math.min(35, +(prev.livingRoom.temp + deltaTemp).toFixed(1)));
        const newLivingHum = Math.max(30, Math.min(95, prev.livingRoom.hum + deltaHum));
        const newAqi = Math.max(10, Math.min(150, prev.livingRoom.aqi + deltaAqi));
        const newPower = Math.max(0.5, Math.min(5.0, +(prev.power.currentKw + deltaPower).toFixed(2)));

        return {
          ...prev,
          livingRoom: {
            ...prev.livingRoom,
            temp: newLivingTemp,
            hum: newLivingHum,
            aqi: newAqi,
          },
          power: {
            ...prev.power,
            currentKw: newPower,
          },
        };
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Actions for Lights
  const toggleLight = (id) => {
    setLights((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const newState = !l.isOn;
          addLog(`Đèn "${l.name}" vừa ${newState ? 'bật' : 'tắt'}`, newState ? 'success' : 'info');
          iotBridge.sendCommand('TOGGLE_LIGHT', id, newState);
          return { ...l, isOn: newState };
        }
        return l;
      })
    );
  };

  const updateLightBrightness = (id, brightness) => {
    setLights((prev) =>
      prev.map((l) => (l.id === id ? { ...l, brightness, isOn: brightness > 0 ? true : l.isOn } : l))
    );
  };

  const updateLightColor = (id, color) => {
    setLights((prev) =>
      prev.map((l) => (l.id === id ? { ...l, color } : l))
    );
  };

  const toggleAllLightsInRoom = (room, state) => {
    setLights((prev) =>
      prev.map((l) => (l.room === room ? { ...l, isOn: state } : l))
    );
    addLog(`Đã ${state ? 'bật' : 'tắt'} toàn bộ đèn khu vực ${room}`, 'info');
  };

  // Actions for Climate
  const updateAcSetting = (zone, key, value) => {
    setClimate((prev) => ({
      ...prev,
      [zone]: {
        ...prev[zone],
        [key]: value,
      },
    }));
    addLog(`Điều hòa (${zone}): cập nhật ${key} = ${value}`, 'info');
  };

  const toggleClimateDevice = (zone) => {
    setClimate((prev) => {
      const currentState = prev[zone]?.isOn;
      const newState = !currentState;
      addLog(`Thiết bị làm mát (${zone}) đã ${newState ? 'bật' : 'tắt'}`, 'info');
      iotBridge.sendCommand('TOGGLE_FAN', zone, newState);
      return {
        ...prev,
        [zone]: {
          ...prev[zone],
          isOn: newState,
        },
      };
    });
  };

  // Actions for Devices / Appliances
  const toggleDevice = (id) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const nextState = !d.isOn;
          addLog(`Thiết bị "${d.name}" đã ${nextState ? 'kích hoạt' : 'tắt'}`, nextState ? 'success' : 'info');
          return {
            ...d,
            isOn: nextState,
            statusText: nextState ? 'Đang hoạt động' : 'Tắt',
          };
        }
        return d;
      })
    );
  };

  const updateDevicePercent = (id, openPercent) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, openPercent, statusText: `Mở ${openPercent}%` } : d))
    );
  };

  const addCustomDevice = (newDev) => {
    const item = {
      id: `dev-${Date.now()}`,
      ...newDev,
      isOn: false,
    };
    setDevices((prev) => [...prev, item]);
    addLog(`Đã thêm thiết bị mới: "${item.name}"`, 'success');
  };

  const removeDevice = (id) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
    addLog(`Đã gỡ thiết bị ID ${id}`, 'warning');
  };

  // Actions for Security
  const toggleDoorLock = (doorId) => {
    setSecurity((prev) => ({
      ...prev,
      doors: prev.doors.map((door) => {
        if (door.id === doorId) {
          const nextState = !door.isLocked;
          addLog(`${door.name} vừa được ${nextState ? 'KHÓA CHỐT' : 'MỞ KHÓA'}`, nextState ? 'security' : 'warning');
          iotBridge.sendCommand('DOOR_LOCK', doorId, nextState);
          return {
            ...door,
            isLocked: nextState,
            lastUnlock: nextState ? door.lastUnlock : 'Vừa xong',
          };
        }
        return door;
      }),
    }));
  };

  const setSecurityArmedMode = (mode) => {
    setSecurity((prev) => ({
      ...prev,
      armed: mode !== 'disarmed',
      mode,
    }));
    addLog(`Chế độ an ninh chuyển sang: [${mode.toUpperCase()}]`, 'security');
  };

  const toggleAlarmSiren = () => {
    setSecurity((prev) => {
      const nextSiren = !prev.siren;
      addLog(nextSiren ? 'CÒI BÁO ĐỘNG KHẨN CẤP ĐÃ ĐƯỢC KÍCH HOẠT!' : 'Đã tắt còi báo động', nextSiren ? 'danger' : 'info');
      iotBridge.sendCommand('ALARM_SIREN', 'buzzer', nextSiren);
      return {
        ...prev,
        siren: nextSiren,
      };
    });
  };

  // Actions for Scenes
  const activateScene = (sceneId) => {
    setActiveScene(sceneId);
    if (sceneId === 'scene-away') {
      // Turn off lights, close door, lock
      setLights((prev) => prev.map((l) => ({ ...l, isOn: false })));
      setClimate((prev) => ({
        ...prev,
        acLiving: { ...prev.acLiving, isOn: false },
        acBedroom: { ...prev.acBedroom, isOn: false },
      }));
      setSecurity((prev) => ({ ...prev, armed: true, mode: 'away' }));
      addLog('Đã kích hoạt kịch bản: "Rời Nhà" (Tắt hết điện, kích hoạt an ninh tối đa)', 'warning');
    } else if (sceneId === 'scene-home') {
      setLights((prev) =>
        prev.map((l) => (l.room === 'Phòng khách' ? { ...l, isOn: true, brightness: 80 } : l))
      );
      setClimate((prev) => ({
        ...prev,
        acLiving: { ...prev.acLiving, isOn: true, targetTemp: 24 },
      }));
      setSecurity((prev) => ({ ...prev, armed: true, mode: 'home' }));
      addLog('Đã kích hoạt kịch bản: "Về Nhà" (Bật đèn ấm cúng & điều hòa)', 'success');
    } else if (sceneId === 'scene-night') {
      setLights((prev) =>
        prev.map((l) => (l.type === 'ambient' ? { ...l, isOn: true, brightness: 25 } : { ...l, isOn: false }))
      );
      setClimate((prev) => ({
        ...prev,
        acBedroom: { ...prev.acBedroom, isOn: true, targetTemp: 26, fanSpeed: 'low' },
        acLiving: { ...prev.acLiving, isOn: false },
      }));
      addLog('Đã kích hoạt kịch bản: "Ngủ Ngon" (Đèn ngủ dịu mát, nhiệt độ phòng 26°C)', 'info');
    } else if (sceneId === 'scene-party') {
      setLights((prev) =>
        prev.map((l) => ({ ...l, isOn: true, brightness: 100, color: '#ec4899' }))
      );
      addLog('Đã kích hoạt kịch bản: "Tiệc Tùng" (Chế độ ánh sáng sôi động)', 'success');
    } else if (sceneId === 'scene-cinema') {
      setLights((prev) =>
        prev.map((l) => (l.type === 'rgb' ? { ...l, isOn: true, brightness: 20, color: '#0284c7' } : { ...l, isOn: false }))
      );
      setDevices((prev) =>
        prev.map((d) => (d.icon === 'tv' ? { ...d, isOn: true } : d))
      );
      addLog('Đã kích hoạt kịch bản: "Xem Phim" (Giảm sáng, rèm đóng, mở TV)', 'info');
    }
  };

  return (
    <SmartHomeContext.Provider
      value={{
        sensors,
        lights,
        climate,
        devices,
        security,
        scenes,
        activeScene,
        logs,
        isSimulating,
        setIsSimulating,
        hardwareStatus,
        hardwareMeta,
        connectHardware,
        disconnectHardware,
        toggleLight,
        updateLightBrightness,
        updateLightColor,
        toggleAllLightsInRoom,
        updateAcSetting,
        toggleClimateDevice,
        toggleDevice,
        updateDevicePercent,
        addCustomDevice,
        removeDevice,
        toggleDoorLock,
        setSecurityArmedMode,
        toggleAlarmSiren,
        activateScene,
        addLog,
      }}
    >
      {children}
    </SmartHomeContext.Provider>
  );
};

export const useSmartHome = () => {
  const context = useContext(SmartHomeContext);
  if (!context) {
    throw new Error('useSmartHome must be used within a SmartHomeProvider');
  }
  return context;
};

