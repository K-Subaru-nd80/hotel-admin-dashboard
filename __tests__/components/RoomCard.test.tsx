import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RoomCard } from '@/components/RoomCard';
import { Room } from '@/types';

const mockRoom: Room = {
  id: 'room_test_201',
  number: '201',
  device: {
    id: 'dev_201_ac',
    model: 'AC-X1',
    status: 'online',
    set_temperature_c: 24,
    actual_temperature_c: 23.5,
    last_seen: '2025-09-08T10:30:00Z',
    signal_strength: -65,
  },
  reservation: {
    reservation_id: 'res_1001',
    guest_masked: '田中 ○○',
    check_in: '2025-09-08T15:00:00Z',
    preferences: {
      temperature_c: 24,
    },
  },
  commands: [],
};

const mockOnOpen = jest.fn();

describe('RoomCard', () => {
  beforeEach(() => {
    mockOnOpen.mockClear();
  });

  it('部屋番号が正しく表示される', () => {
    render(<RoomCard room={mockRoom} onOpen={mockOnOpen} />);
    expect(screen.getByText('部屋 201')).toBeInTheDocument();
  });

  it('デバイスステータスが表示される', () => {
    render(<RoomCard room={mockRoom} onOpen={mockOnOpen} />);
    expect(screen.getByText('online')).toBeInTheDocument();
  });

  it('設定温度と実測温度が表示される', () => {
    render(<RoomCard room={mockRoom} onOpen={mockOnOpen} />);
    expect(screen.getByText('24.0°C')).toBeInTheDocument(); // 設定温度
    expect(screen.getByText('23.5°C')).toBeInTheDocument(); // 実測温度
  });

  it('予約情報が表示される', () => {
    render(<RoomCard room={mockRoom} onOpen={mockOnOpen} />);
    expect(screen.getByText('田中 ○○')).toBeInTheDocument();
  });

  it('空室の場合「空室」と表示される', () => {
    const emptyRoom = { ...mockRoom, reservation: null };
    render(<RoomCard room={emptyRoom} onOpen={mockOnOpen} />);
    expect(screen.getByText('空室')).toBeInTheDocument();
  });

  it('カードクリックでonOpenが呼ばれる', () => {
    render(<RoomCard room={mockRoom} onOpen={mockOnOpen} />);
    const card = screen.getByRole('button');
    fireEvent.click(card);
    expect(mockOnOpen).toHaveBeenCalledWith(mockRoom);
  });

  it('EnterキーでもonOpenが呼ばれる', () => {
    render(<RoomCard room={mockRoom} onOpen={mockOnOpen} />);
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(mockOnOpen).toHaveBeenCalledWith(mockRoom);
  });

  it('温度差が大きい場合警告が表示される', () => {
    const roomWithTempDiff = {
      ...mockRoom,
      device: {
        ...mockRoom.device,
        set_temperature_c: 24,
        actual_temperature_c: 20, // 4度の差
      },
    };
    render(<RoomCard room={roomWithTempDiff} onOpen={mockOnOpen} />);
    expect(screen.getByText('温度差が大きすぎます')).toBeInTheDocument();
  });

  it('オフラインデバイスは適切なスタイルが適用される', () => {
    const offlineRoom = {
      ...mockRoom,
      device: {
        ...mockRoom.device,
        status: 'offline' as const,
      },
    };
    render(<RoomCard room={offlineRoom} onOpen={mockOnOpen} />);
    expect(screen.getByText('offline')).toBeInTheDocument();
  });
});
