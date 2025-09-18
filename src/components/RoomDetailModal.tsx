'use client';

import { RoomDetailModalProps } from '@/types';
import { useState, useRef, useEffect } from 'react';
import { 
  XMarkIcon, 
  PaperAirplaneIcon,
  UserIcon,
  CpuChipIcon,
  ClockIcon,
  SignalIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { TelemetryChart } from './TelemetryChart';
import classNames from 'classnames';

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({ 
  room, 
  isOpen, 
  onClose, 
  onSendCommand 
}) => {
  const [temperature, setTemperature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!temperature || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSendCommand(room.id, {
        type: 'set_temperature',
        payload: { temperature_c: parseFloat(temperature) }
      });
      setTemperature('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-600';
      case 'offline':
        return 'text-gray-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getCommandStatusColor = (status: string) => {
    switch (status) {
      case 'acked':
        return 'bg-green-50 text-green-800';
      case 'pending':
        return 'bg-yellow-50 text-yellow-800';
      case 'failed':
        return 'bg-red-50 text-red-800';
      default:
        return 'bg-gray-50 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
            部屋 {room.number} 詳細
          </h2>
          <button
            ref={firstFocusableRef}
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="モーダルを閉じる"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Reservation Block */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <UserIcon className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">予約情報</h3>
            </div>
            {room.reservation ? (
              <div className="space-y-2">
                <p><span className="font-medium">予約ID:</span> {room.reservation.reservation_id}</p>
                <p><span className="font-medium">宿泊者:</span> {room.reservation.guest_masked}</p>
                <p><span className="font-medium">チェックイン:</span> {new Date(room.reservation.check_in).toLocaleString('ja-JP')}</p>
                {room.reservation.preferences?.temperature_c && (
                  <p><span className="font-medium">希望温度:</span> {room.reservation.preferences.temperature_c}°C</p>
                )}
              </div>
            ) : (
              <p className="text-blue-700">現在空室です</p>
            )}
          </div>

          {/* Device Block */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <CpuChipIcon className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">デバイス情報</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">モデル</p>
                <p className="font-medium">{room.device.model}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ステータス</p>
                <p className={classNames('font-medium', getStatusColor(room.device.status))}>
                  {room.device.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">最終確認</p>
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    {new Date(room.device.last_seen).toLocaleString('ja-JP', {
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">信号強度</p>
                <div className="flex items-center gap-1">
                  <SignalIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{room.device.signal_strength?.toFixed(0)} dBm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry Chart */}
          {room.telemetry && room.telemetry.length > 0 && (
            <TelemetryChart data={room.telemetry} />
          )}

          {/* Manual Control Panel */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">手動制御</h3>
            <form onSubmit={handleSubmit} className="flex gap-4 items-end">
              <div className="flex-1">
                <label htmlFor="temperature-input" className="block text-sm font-medium text-gray-700 mb-1">
                  設定温度 (°C)
                </label>
                <input
                  id="temperature-input"
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="例: 24"
                  min="16"
                  max="30"
                  step="0.5"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="submit"
                disabled={!temperature || isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                aria-label="温度設定コマンドを送信"
              >
                {isSubmitting ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <PaperAirplaneIcon className="w-4 h-4" />
                )}
                {isSubmitting ? '送信中...' : '送信'}
              </button>
            </form>
          </div>

          {/* Command History */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">コマンド履歴</h3>
            {room.commands.length > 0 ? (
              <div className="space-y-2">
                {room.commands.slice(-5).map((command) => (
                  <div key={command.command_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{command.type}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(command.scheduled_at).toLocaleString('ja-JP')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={classNames(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        getCommandStatusColor(command.status)
                      )}>
                        {command.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">コマンド履歴がありません</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
