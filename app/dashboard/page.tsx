'use client';

import { useState, useEffect } from 'react';
import { KpiCard } from '@/components/KpiCard';
import { KpiData, Alert } from '@/types';
import { 
  ExclamationTriangleIcon, 
  BellIcon,
  HomeIcon,
  WifiIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import classNames from 'classnames';

export default function DashboardPage() {
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial data
    const loadDashboardData = async () => {
      try {
        // Get real Pi API data - use hardcoded for client-side
        const piApiUrl = 'https://ectodermoidal-caryn-sanatory.ngrok-free.dev';
        let realRoomData = null;
        let realSettingsData = null;
        
        if (piApiUrl) {
          try {
            const [roomResponse, settingsResponse] = await Promise.all([
              fetch(`${piApiUrl}/info/room`, { 
                method: 'GET',
                signal: AbortSignal.timeout(5000)
              }),
              fetch(`${piApiUrl}/info/settings`, { 
                method: 'GET',
                signal: AbortSignal.timeout(5000)
              })
            ]);
            
            if (roomResponse.ok && settingsResponse.ok) {
              realRoomData = await roomResponse.json();
              realSettingsData = await settingsResponse.json();
            }
          } catch (error) {
            console.warn('Failed to fetch Pi API data, using mock data:', error);
          }
        }

        // Use real data or fallback to mock data
        const mockKpiData: KpiData = {
          totalRooms: 1, // 実際には1台のRaspberry Pi
          onlineRooms: realRoomData?.status === '200' ? 1 : 0,
          pendingCommands: 0, // Piが応答しているので未処理コマンドなし
          todayArrivals: realRoomData?.usr === 'SECHACKER' ? 1 : 0, // SECHACKER利用中
        };
        setKpiData(mockKpiData);

        // Load alerts - create real alert based on Pi data
        const alerts: Alert[] = [];
        
        if (realRoomData?.power === false) {
          alerts.push({
            id: 'pi_power_off',
            hotel_id: 'raspberry_pi_hotel',
            room_id: `room_${realRoomData.room || '512'}`,
            hotel_name: 'SecHack365実習室',
            room_number: realRoomData.room || '512',
            message: 'エアコンの電源がオフになっています',
            severity: 'high',
            resolved: false,
            created_at: new Date().toISOString(),
          });
        }
        
        if (realRoomData?.temparature && (realRoomData.temparature < 18 || realRoomData.temparature > 30)) {
          alerts.push({
            id: 'pi_temp_alert',
            hotel_id: 'raspberry_pi_hotel',
            room_id: `room_${realRoomData.room || '512'}`,
            hotel_name: 'SecHack365実習室',
            room_number: realRoomData.room || '512',
            message: `設定温度が実測温度の差が大きすぎます (設定: ${realRoomData.temparature}°C)`,
            severity: 'medium',
            resolved: false,
            created_at: new Date().toISOString(),
          });
        }
        
        if (!realRoomData) {
          alerts.push({
            id: 'pi_offline',
            hotel_id: 'raspberry_pi_hotel',
            room_id: 'room_512',
            hotel_name: 'SecHack365実習室',
            room_number: '512',
            message: 'Raspberry Pi デバイスとの通信が確立できません',
            severity: 'critical',
            resolved: false,
            created_at: new Date().toISOString(),
          });
        }

        try {
          // Load existing alerts from API
          const alertsResponse = await fetch('/api/alerts');
          const existingAlerts = await alertsResponse.json();
          alerts.push(...existingAlerts.filter((alert: Alert) => !alert.resolved));
        } catch (error) {
          console.warn('Failed to load API alerts:', error);
        }

        setAlerts(alerts);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();

    // Real-time updates from Pi API
    const interval = setInterval(async () => {
      const piApiUrl = 'https://ectodermoidal-caryn-sanatory.ngrok-free.dev';
      try {
        const response = await fetch(`${piApiUrl}/info/room`, { 
          method: 'GET',
          signal: AbortSignal.timeout(3000)
        });
        if (response.ok) {
          const data = await response.json();
          setKpiData(prev => prev ? {
            ...prev,
            onlineRooms: data.status === '200' ? 1 : 0,
            pendingCommands: 0, // リアルタイム通信成功
            todayArrivals: data.usr === 'SECHACKER' ? 1 : 0,
          } : null);
        }
      } catch (error) {
        // Connection failed - update status
        setKpiData(prev => prev ? {
          ...prev,
          onlineRooms: 0,
          pendingCommands: 1, // 通信エラーあり
        } : null);
      }
    }, 10000); // 10秒間隔で更新

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <HomeIcon className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">ホテル管理ダッシュボード</h1>
            </div>
            <nav className="flex space-x-8">
              <a href="/dashboard" className="text-blue-600 font-medium">ダッシュボード</a>
              <a href="/hotels" className="text-gray-600 hover:text-gray-900">ホテル一覧</a>
              <a href="/alerts" className="text-gray-600 hover:text-gray-900">アラート</a>
              <a href="/settings" className="text-gray-600 hover:text-gray-900">設定</a>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiData && (
            <>
              <KpiCard
                label="Raspberry Pi 台数"
                value={kpiData.totalRooms}
                hint="実習用デバイス"
              />
              <KpiCard
                label="オンライン デバイス数"
                value={kpiData.onlineRooms}
                hint={kpiData.totalRooms > 0 ? `${((kpiData.onlineRooms / kpiData.totalRooms) * 100).toFixed(1)}% オンライン` : 'オフライン'}
              />
              <KpiCard
                label="未ACK コマンド"
                value={kpiData.pendingCommands}
                hint="要確認"
              />
              <KpiCard
                label="アクティブ利用者"
                value={kpiData.todayArrivals}
                hint="現在利用中"
              />
            </>
          )}
        </div>        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Today's Usage Status */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <UserGroupIcon className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">現在の利用状況</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">稼働中</span>
                    </div>
                    <div>
                      <p className="font-medium">部屋 512</p>
                      <p className="text-sm text-gray-600">SECHACKER</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">現在温度</p>
                    <p className="font-medium text-blue-600">20°C</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                      <span className="font-medium">接続状態</span>
                    </div>
                    <div>
                      <p className="font-medium">raspberrypi 3B</p>
                      <p className="text-sm text-gray-600">デバイス ID: 00001</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">電源状態</p>
                    <p className="font-medium text-green-600">オン</p>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-md text-center text-gray-500 text-sm">
                  リアルタイム監視中 (10秒間隔更新)
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">システム状況</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-md">
                  <WifiIcon className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600">接続率</p>
                    <p className="text-lg font-semibold text-green-900">
                      {kpiData ? ((kpiData.onlineRooms / kpiData.totalRooms) * 100).toFixed(1) : '0'}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-md">
                  <HomeIcon className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600">デバイス数</p>
                    <p className="text-lg font-semibold text-blue-900">1台</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Alerts */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <BellIcon className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-semibold text-gray-900">最新アラート</h2>
              </div>
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className={classNames(
                      'p-3 rounded-md border',
                      getSeverityColor(alert.severity)
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <ExclamationTriangleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {alert.hotel_name} - 部屋{alert.room_number}
                        </p>
                        <p className="text-xs mt-1 leading-relaxed">{alert.message}</p>
                        <p className="text-xs mt-2 opacity-75">
                          {new Date(alert.created_at).toLocaleString('ja-JP', {
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <p className="text-gray-500 text-center py-8">新しいアラートはありません</p>
                )}
              </div>
              {alerts.length > 5 && (
                <div className="mt-4 text-center">
                  <a
                    href="/alerts"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    すべてのアラートを見る ({alerts.length})
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
