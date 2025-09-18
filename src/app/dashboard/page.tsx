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
        // Simulate KPI data loading
        const mockKpiData: KpiData = {
          totalRooms: 450,
          onlineRooms: 423,
          pendingCommands: 7,
          todayArrivals: 89,
        };
        setKpiData(mockKpiData);

        // Load alerts
        const alertsResponse = await fetch('/api/alerts');
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.filter((alert: Alert) => !alert.resolved));
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setKpiData(prev => prev ? {
        ...prev,
        onlineRooms: prev.totalRooms - Math.floor(Math.random() * 10),
        pendingCommands: Math.floor(Math.random() * 15),
      } : null);
    }, 5000);

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
                label="総部屋数"
                value={kpiData.totalRooms}
                hint="全ホテル合計"
              />
              <KpiCard
                label="オンライン部屋数"
                value={kpiData.onlineRooms}
                hint={`${((kpiData.onlineRooms / kpiData.totalRooms) * 100).toFixed(1)}% オンライン`}
              />
              <KpiCard
                label="未ACKコマンド"
                value={kpiData.pendingCommands}
                hint="要確認"
              />
              <KpiCard
                label="本日到着数"
                value={kpiData.todayArrivals}
                hint="チェックイン予定"
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Today's Arrivals */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <UserGroupIcon className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">本日の到着予定</h2>
              </div>
              <div className="space-y-3">
                {[
                  { reservationId: 'res_1001', room: '201', time: '15:00', guest: '田中 ○○', temp: '24°C' },
                  { reservationId: 'res_1002', room: '305', time: '16:30', guest: '佐藤 ○○', temp: '26°C' },
                  { reservationId: 'res_1003', room: '412', time: '17:00', guest: '鈴木 ○○', temp: '22°C' },
                  { reservationId: 'res_1004', room: '208', time: '18:15', guest: '高橋 ○○', temp: '25°C' },
                ].map((arrival) => (
                  <div key={arrival.reservationId} className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{arrival.time}</span>
                      </div>
                      <div>
                        <p className="font-medium">部屋 {arrival.room}</p>
                        <p className="text-sm text-gray-600">{arrival.guest}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">希望温度</p>
                      <p className="font-medium text-blue-600">{arrival.temp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">システム状況</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-md">
                  <WifiIcon className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600">オンライン率</p>
                    <p className="text-lg font-semibold text-green-900">
                      {kpiData ? ((kpiData.onlineRooms / kpiData.totalRooms) * 100).toFixed(1) : '0'}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-md">
                  <HomeIcon className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600">稼働率</p>
                    <p className="text-lg font-semibold text-blue-900">78%</p>
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
