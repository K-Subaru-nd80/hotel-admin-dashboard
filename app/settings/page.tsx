'use client';

import { useState, useEffect } from 'react';
import { 
  HomeIcon, 
  BellIcon, 
  EnvelopeIcon, 
  CogIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface Settings {
  notifications: {
    email: string;
    slack_webhook: string;
    enable_email: boolean;
    enable_slack: boolean;
  };
  thresholds: {
    last_seen_minutes: number;
    temperature_delta_c: number;
    signal_strength_dbm: number;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    notifications: {
      email: '',
      slack_webhook: '',
      enable_email: true,
      enable_slack: false,
    },
    thresholds: {
      last_seen_minutes: 30,
      temperature_delta_c: 3,
      signal_strength_dbm: -75,
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('hotel_admin_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage (in real app, would save to server)
      localStorage.setItem('hotel_admin_settings', JSON.stringify(settings));
      
      setSaveMessage('設定が保存されました');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch {
      setSaveMessage('保存中にエラーが発生しました');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (section: keyof Settings, key: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <HomeIcon className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">設定</h1>
            </div>
            <nav className="flex space-x-8">
              <a href="/dashboard" className="text-gray-600 hover:text-gray-900">ダッシュボード</a>
              <a href="/hotels" className="text-gray-600 hover:text-gray-900">ホテル一覧</a>
              <a href="/alerts" className="text-gray-600 hover:text-gray-900">アラート</a>
              <a href="/settings" className="text-blue-600 font-medium">設定</a>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSave} className="space-y-8">
          {/* Notifications Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <BellIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">通知設定</h2>
            </div>

            <div className="space-y-6">
              {/* Email Settings */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <EnvelopeIcon className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-900">メール通知</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="enable-email"
                      checked={settings.notifications.enable_email}
                      onChange={(e) => handleInputChange('notifications', 'enable_email', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enable-email" className="text-sm font-medium text-gray-700">
                      メール通知を有効にする
                    </label>
                  </div>
                  
                  {settings.notifications.enable_email && (
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        通知先メールアドレス
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={settings.notifications.email}
                        onChange={(e) => handleInputChange('notifications', 'email', e.target.value)}
                        placeholder="admin@example.com"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required={settings.notifications.enable_email}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Slack Settings */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <CogIcon className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-900">Slack通知</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="enable-slack"
                      checked={settings.notifications.enable_slack}
                      onChange={(e) => handleInputChange('notifications', 'enable_slack', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enable-slack" className="text-sm font-medium text-gray-700">
                      Slack通知を有効にする
                    </label>
                  </div>
                  
                  {settings.notifications.enable_slack && (
                    <div>
                      <label htmlFor="slack-webhook" className="block text-sm font-medium text-gray-700 mb-1">
                        SlackウェブフックURL
                      </label>
                      <input
                        type="url"
                        id="slack-webhook"
                        value={settings.notifications.slack_webhook}
                        onChange={(e) => handleInputChange('notifications', 'slack_webhook', e.target.value)}
                        placeholder="https://hooks.slack.com/services/..."
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required={settings.notifications.enable_slack}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Thresholds Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <CogIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">閾値設定</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="last-seen" className="block text-sm font-medium text-gray-700 mb-1">
                  最終確認時間 (分)
                </label>
                <input
                  type="number"
                  id="last-seen"
                  value={settings.thresholds.last_seen_minutes}
                  onChange={(e) => handleInputChange('thresholds', 'last_seen_minutes', parseInt(e.target.value))}
                  min="1"
                  max="180"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  この時間を超えてデバイスからの応答がない場合アラート
                </p>
              </div>

              <div>
                <label htmlFor="temp-delta" className="block text-sm font-medium text-gray-700 mb-1">
                  温度差 (°C)
                </label>
                <input
                  type="number"
                  id="temp-delta"
                  value={settings.thresholds.temperature_delta_c}
                  onChange={(e) => handleInputChange('thresholds', 'temperature_delta_c', parseFloat(e.target.value))}
                  min="0.5"
                  max="10"
                  step="0.5"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  設定温度と実測温度の差がこの値を超えた場合アラート
                </p>
              </div>

              <div>
                <label htmlFor="signal-strength" className="block text-sm font-medium text-gray-700 mb-1">
                  信号強度 (dBm)
                </label>
                <input
                  type="number"
                  id="signal-strength"
                  value={settings.thresholds.signal_strength_dbm}
                  onChange={(e) => handleInputChange('thresholds', 'signal_strength_dbm', parseInt(e.target.value))}
                  min="-100"
                  max="-30"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  信号強度がこの値を下回った場合アラート
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between">
            <div>
              {saveMessage && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckIcon className="w-5 h-5" />
                  <span className="text-sm">{saveMessage}</span>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {isSaving ? '保存中...' : '設定を保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
