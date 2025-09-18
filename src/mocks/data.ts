import { Hotel, Room, Alert, KpiData, TelemetryData } from '@/types';

// Mock Hotels Data
export const mockHotels: Hotel[] = [
  { id: 'hotel_1', name: '東京グランドホテル', region: '東京', roomsCount: 200 },
  { id: 'hotel_2', name: '大阪ロイヤルイン', region: '大阪', roomsCount: 150 },
  { id: 'hotel_3', name: '名古屋シティホテル', region: '名古屋', roomsCount: 100 },
];

// Generate Mock Rooms Data
export const generateMockRooms = (hotelId: string, count: number = 50): Room[] => {
  const rooms: Room[] = [];
  
  for (let i = 1; i <= count; i++) {
    const roomNumber = (200 + i).toString();
    const hasReservation = Math.random() > 0.3; // 70% chance of having reservation
    const deviceStatus: 'online' | 'offline' | 'error' = 
      Math.random() > 0.8 ? 'offline' : Math.random() > 0.95 ? 'error' : 'online';
    
    const setTemp = 22 + Math.random() * 6; // 22-28°C
    const actualTemp = setTemp + (Math.random() - 0.5) * 4; // ±2°C variation
    
    const room: Room = {
      id: `room_${hotelId}_${roomNumber}`,
      number: roomNumber,
      device: {
        id: `dev_${roomNumber}_ac`,
        model: `AC-X${Math.floor(Math.random() * 3) + 1}`,
        status: deviceStatus,
        set_temperature_c: Math.round(setTemp * 10) / 10,
        actual_temperature_c: Math.round(actualTemp * 10) / 10,
        last_seen: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Within last hour
        signal_strength: -40 - Math.random() * 40, // -40 to -80 dBm
      },
      reservation: hasReservation ? {
        reservation_id: `res_${1000 + i}`,
        guest_masked: `${['田中', '佐藤', '鈴木', '高橋', '渡辺'][Math.floor(Math.random() * 5)]} ○○`,
        check_in: new Date(Date.now() + Math.random() * 86400000).toISOString(),
        preferences: {
          temperature_c: Math.round(setTemp),
          arrival_preheat_minutes: 30,
        },
      } : null,
      commands: [],
      telemetry: generateTelemetryData(setTemp, actualTemp),
    };
    
    rooms.push(room);
  }
  
  return rooms;
};

// Generate telemetry data for past 24 hours
const generateTelemetryData = (setTemp: number, currentTemp: number): TelemetryData[] => {
  const data: TelemetryData[] = [];
  const now = new Date();
  
  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000); // Every hour for 24h
    const temp = currentTemp + (Math.random() - 0.5) * 2; // ±1°C variation
    
    data.push({
      timestamp: timestamp.toISOString(),
      actual: Math.round(temp * 10) / 10,
      set: Math.round(setTemp * 10) / 10,
    });
  }
  
  return data;
};

// Mock Alerts Data
export const mockAlerts: Alert[] = [
  {
    id: 'alert_1',
    severity: 'high',
    hotel_id: 'hotel_1',
    room_id: 'room_hotel_1_201',
    hotel_name: '東京グランドホテル',
    room_number: '201',
    message: 'エアコンが30分間応答していません',
    created_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    resolved: false,
  },
  {
    id: 'alert_2',
    severity: 'medium',
    hotel_id: 'hotel_1',
    room_id: 'room_hotel_1_305',
    hotel_name: '東京グランドホテル',
    room_number: '305',
    message: '設定温度と実測温度の差が大きすぎます (設定: 24°C, 実測: 29°C)',
    created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    resolved: false,
  },
  {
    id: 'alert_3',
    severity: 'low',
    hotel_id: 'hotel_2',
    room_id: 'room_hotel_2_102',
    hotel_name: '大阪ロイヤルイン',
    room_number: '102',
    message: '信号強度が弱くなっています (-78 dBm)',
    created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    resolved: false,
  },
];

// Mock KPI Data
export const mockKpiData: KpiData = {
  totalRooms: 450,
  onlineRooms: 423,
  pendingCommands: 7,
  todayArrivals: 89,
};
