import { HotelSelectorProps } from '@/types';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export const HotelSelector: React.FC<HotelSelectorProps> = ({ hotels, value, onChange }) => {
  const selectedHotel = hotels.find(h => h.id === value);

  return (
    <div className="relative">
      <label htmlFor="hotel-select" className="block text-sm font-medium text-gray-700 mb-2">
        ホテル選択
      </label>
      <div className="relative">
        <select
          id="hotel-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none pr-10"
          aria-label="ホテルを選択してください"
        >
          <option value="">ホテルを選択...</option>
          {hotels.map((hotel) => (
            <option key={hotel.id} value={hotel.id}>
              {hotel.name} ({hotel.region}) - {hotel.roomsCount}部屋
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      {selectedHotel && (
        <div className="mt-2 text-sm text-gray-600">
          選択中: {selectedHotel.name} ({selectedHotel.region})
        </div>
      )}
    </div>
  );
};
