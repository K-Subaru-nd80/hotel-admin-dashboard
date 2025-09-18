import { RoomCardProps } from '@/types';
import { 
  WifiIcon, 
  ExclamationTriangleIcon, 
  UserIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import classNames from 'classnames';

export const RoomCard: React.FC<RoomCardProps> = ({ room, onOpen }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-50 text-green-800 ring-green-500';
      case 'offline':
        return 'bg-gray-50 text-gray-800 ring-gray-500';
      case 'error':
        return 'bg-red-50 text-red-800 ring-red-500';
      default:
        return 'bg-gray-50 text-gray-800 ring-gray-500';
    }
  };

  const getSignalStrength = (strength?: number) => {
    if (!strength) return 'N/A';
    if (strength > -50) return '強';
    if (strength > -70) return '中';
    return '弱';
  };

  return (
    <div 
      className="bg-white rounded-lg shadow p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onOpen(room)}
      role="button"
      tabIndex={0}
      aria-label={`部屋 ${room.number} の詳細を開く`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(room);
        }
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <HomeIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">部屋 {room.number}</h3>
        </div>
        <div className={classNames(
          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ring-1 ring-inset',
          getStatusColor(room.device.status)
        )}>
          {room.device.status}
        </div>
      </div>

      {/* Temperature Info */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-sm text-gray-600">設定温度</p>
          <p className="text-xl font-semibold text-blue-600">
            {room.device.set_temperature_c?.toFixed(1) || 'N/A'}°C
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">実測温度</p>
          <p className="text-xl font-semibold text-green-600">
            {room.device.actual_temperature_c.toFixed(1)}°C
          </p>
        </div>
      </div>

      {/* Reservation Info */}
      {room.reservation ? (
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md mb-3">
          <UserIcon className="w-4 h-4 text-blue-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">{room.reservation.guest_masked}</p>
            <p className="text-xs text-blue-700">
              チェックイン: {new Date(room.reservation.check_in).toLocaleString('ja-JP', {
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-2 bg-gray-50 rounded-md mb-3">
          <p className="text-sm text-gray-600 text-center">空室</p>
        </div>
      )}

      {/* Device Info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <WifiIcon className="w-4 h-4" />
          <span>信号: {getSignalStrength(room.device.signal_strength)}</span>
        </div>
        <div>
          <span>{room.device.model}</span>
        </div>
      </div>

      {/* Warning for temperature difference */}
      {room.device.set_temperature_c && 
       Math.abs(room.device.actual_temperature_c - room.device.set_temperature_c) > 3 && (
        <div className="flex items-center gap-1 mt-2 p-2 bg-yellow-50 rounded-md">
          <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
          <span className="text-xs text-yellow-800">温度差が大きすぎます</span>
        </div>
      )}
    </div>
  );
};
