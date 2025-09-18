'use client';

import { useState, useEffect } from 'react';
import { Hotel, Room } from '@/types';
import { HotelSelector } from '@/components/HotelSelector';
import { RoomCard } from '@/components/RoomCard';
import { RoomDetailModal } from '@/components/RoomDetailModal';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  HomeIcon 
} from '@heroicons/react/24/outline';

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  // Load hotels on mount
  useEffect(() => {
    const loadHotels = async () => {
      try {
        const response = await fetch('/api/hotels');
        const data = await response.json();
        setHotels(data);
      } catch (error) {
        console.error('Failed to load hotels:', error);
      }
    };
    loadHotels();
  }, []);

  // Load rooms when hotel is selected
  useEffect(() => {
    const loadRooms = async () => {
      if (!selectedHotelId) {
        setRooms([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/hotels/${selectedHotelId}/rooms`);
        const data = await response.json();
        setRooms(data);
      } catch (error) {
        console.error('Failed to load rooms:', error);
      } finally {
        setLoading(false);
      }
    };
    loadRooms();
  }, [selectedHotelId]);

  // Filter rooms based on search and status
  useEffect(() => {
    let filtered = rooms;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(room => 
        room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.reservation?.reservation_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.reservation?.guest_masked.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'occupied') {
        filtered = filtered.filter(room => room.reservation !== null);
      } else if (statusFilter === 'vacant') {
        filtered = filtered.filter(room => room.reservation === null);
      } else {
        filtered = filtered.filter(room => room.device.status === statusFilter);
      }
    }

    setFilteredRooms(filtered);
  }, [rooms, searchTerm, statusFilter]);

  const handleSendCommand = async (roomId: string, command: { type: string; payload: Record<string, unknown> }) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/commands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });

      if (response.ok) {
        const newCommand = await response.json();
        
        // Update room commands
        setRooms(prevRooms => 
          prevRooms.map(room => {
            if (room.id === roomId) {
              const updatedCommands = [...room.commands, {
                ...newCommand,
                command_id: newCommand.command_id,
                type: command.type,
                payload: command.payload,
                status: 'pending' as const,
                scheduled_at: new Date().toISOString(),
              }];
              
              return { ...room, commands: updatedCommands };
            }
            return room;
          })
        );

        // Simulate ACK after 1-2 seconds
        setTimeout(() => {
          setRooms(prevRooms => 
            prevRooms.map(room => {
              if (room.id === roomId) {
                const updatedCommands = room.commands.map(cmd => 
                  cmd.command_id === newCommand.command_id
                    ? { ...cmd, status: 'acked' as const, acked_at: new Date().toISOString() }
                    : cmd
                );
                
                // Update device temperature if it's a temperature command
                const updatedDevice = command.type === 'set_temperature' 
                  ? { ...room.device, set_temperature_c: command.payload.temperature_c as number }
                  : room.device;

                return { ...room, commands: updatedCommands, device: updatedDevice };
              }
              return room;
            })
          );

          // Update selected room if it's the same room
          if (selectedRoom && selectedRoom.id === roomId) {
            setSelectedRoom(prevRoom => {
              if (!prevRoom) return prevRoom;
              const updatedCommands = prevRoom.commands.map(cmd => 
                cmd.command_id === newCommand.command_id
                  ? { ...cmd, status: 'acked' as const, acked_at: new Date().toISOString() }
                  : cmd
              );
              
              const updatedDevice = command.type === 'set_temperature' 
                ? { ...prevRoom.device, set_temperature_c: command.payload.temperature_c as number }
                : prevRoom.device;

              return { ...prevRoom, commands: updatedCommands, device: updatedDevice };
            });
          }
        }, 1500 + Math.random() * 1000); // 1.5-2.5 seconds delay
      }
    } catch (error) {
      console.error('Failed to send command:', error);
    }
  };

  const handleRoomOpen = (room: Room) => {
    setSelectedRoom(room);
  };

  const handleModalClose = () => {
    setSelectedRoom(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <HomeIcon className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">ホテル管理</h1>
            </div>
            <nav className="flex space-x-8">
              <a href="/dashboard" className="text-gray-600 hover:text-gray-900">ダッシュボード</a>
              <a href="/hotels" className="text-blue-600 font-medium">ホテル一覧</a>
              <a href="/alerts" className="text-gray-600 hover:text-gray-900">アラート</a>
              <a href="/settings" className="text-gray-600 hover:text-gray-900">設定</a>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Hotel Selector */}
            <div>
              <HotelSelector 
                hotels={hotels}
                value={selectedHotelId}
                onChange={setSelectedHotelId}
              />
            </div>

            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                検索
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="search"
                  type="text"
                  placeholder="部屋番号、予約ID、宿泊者名..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
                >
                  <option value="all">すべて</option>
                  <option value="online">オンライン</option>
                  <option value="offline">オフライン</option>
                  <option value="error">エラー</option>
                  <option value="occupied">入居中</option>
                  <option value="vacant">空室</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Room Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">部屋情報を読み込み中...</p>
          </div>
        ) : filteredRooms.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-gray-600">
              {filteredRooms.length} 件の部屋が見つかりました
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onOpen={handleRoomOpen}
                />
              ))}
            </div>
          </>
        ) : selectedHotelId ? (
          <div className="text-center py-12">
            <p className="text-gray-600">条件に一致する部屋が見つかりません</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">ホテルを選択してください</p>
          </div>
        )}
      </div>

      {/* Room Detail Modal */}
      {selectedRoom && (
        <RoomDetailModal
          room={selectedRoom}
          isOpen={true}
          onClose={handleModalClose}
          onSendCommand={handleSendCommand}
        />
      )}
    </div>
  );
}
