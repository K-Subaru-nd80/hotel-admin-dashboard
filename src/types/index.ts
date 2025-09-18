// Hotel Admin Dashboard Types

export type DeviceStatus = 'online' | 'offline' | 'error';
export type CommandStatus = 'pending' | 'acked' | 'failed';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Hotel {
  id: string;
  name: string;
  region: string;
  roomsCount: number;
}

export interface Device {
  id: string;
  model: string;
  status: DeviceStatus;
  set_temperature_c?: number;
  actual_temperature_c: number;
  last_seen: string;
  signal_strength?: number;
}

export interface Reservation {
  reservation_id: string;
  guest_masked: string;
  check_in: string;
  check_out?: string;
  preferences?: {
    temperature_c?: number;
    arrival_preheat_minutes?: number;
  };
}

export interface Command {
  command_id: string;
  type: string;
  payload: Record<string, unknown>;
  status: CommandStatus;
  scheduled_at: string;
  acked_at?: string;
}

export interface TelemetryData {
  timestamp: string;
  actual: number;
  set?: number;
}

export interface Room {
  id: string;
  number: string;
  device: Device;
  reservation?: Reservation | null;
  commands: Command[];
  telemetry?: TelemetryData[];
}

export interface Alert {
  id: string;
  severity: AlertSeverity;
  hotel_id: string;
  room_id: string;
  hotel_name: string;
  room_number: string;
  message: string;
  created_at: string;
  resolved: boolean;
}

export interface KpiData {
  totalRooms: number;
  onlineRooms: number;
  pendingCommands: number;
  todayArrivals: number;
}

// Component Props Types
export interface KpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

export interface HotelSelectorProps {
  hotels: Hotel[];
  value: string;
  onChange: (hotelId: string) => void;
}

export interface RoomCardProps {
  room: Room;
  onOpen: (room: Room) => void;
}

export interface RoomDetailModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
  onSendCommand: (roomId: string, command: { type: string; payload: Record<string, unknown> }) => void;
}

export interface TelemetryChartProps {
  data: TelemetryData[];
}
