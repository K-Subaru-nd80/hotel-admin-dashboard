import type { Meta, StoryObj } from '@storybook/react';
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
  telemetry: [],
};

const meta: Meta<typeof RoomCard> = {
  title: 'Components/RoomCard',
  component: RoomCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'ホテル部屋の状態を表示するカードコンポーネント',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onOpen: { action: 'opened' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    room: mockRoom,
    onOpen: () => {},
  },
};

export const VacantRoom: Story = {
  args: {
    room: {
      ...mockRoom,
      reservation: null,
    },
    onOpen: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: '空室状態の部屋カード',
      },
    },
  },
};

export const OfflineDevice: Story = {
  args: {
    room: {
      ...mockRoom,
      device: {
        ...mockRoom.device,
        status: 'offline',
      },
    },
    onOpen: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'デバイスがオフライン状態の部屋カード',
      },
    },
  },
};

export const ErrorDevice: Story = {
  args: {
    room: {
      ...mockRoom,
      device: {
        ...mockRoom.device,
        status: 'error',
      },
    },
    onOpen: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'デバイスにエラーが発生している部屋カード',
      },
    },
  },
};

export const TemperatureDifference: Story = {
  args: {
    room: {
      ...mockRoom,
      device: {
        ...mockRoom.device,
        set_temperature_c: 24,
        actual_temperature_c: 20, // 4度の差
      },
    },
    onOpen: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: '設定温度と実測温度に大きな差がある部屋カード（警告表示）',
      },
    },
  },
};

export const WeakSignal: Story = {
  args: {
    room: {
      ...mockRoom,
      device: {
        ...mockRoom.device,
        signal_strength: -78, // 弱い信号
      },
    },
    onOpen: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: '信号強度が弱い部屋カード',
      },
    },
  },
};
