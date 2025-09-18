'use client';

import { useState, useEffect } from 'react';
import { Alert } from '@/types';
import { 
  ExclamationTriangleIcon,
  CheckIcon,
  ArrowUpIcon,
  HomeIcon,
  FunnelIcon 
} from '@heroicons/react/24/outline';
import classNames from 'classnames';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const response = await fetch('/api/alerts');
        const data = await response.json();
        setAlerts(data);
      } catch (error) {
        console.error('Failed to load alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();

    // Simulate new alerts
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every 5 seconds
        const newAlert: Alert = {
          id: `alert_${Date.now()}`,
          severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
          hotel_id: 'hotel_1',
          room_id: `room_${Math.floor(Math.random() * 100) + 200}`,
          hotel_name: '東京グランドホテル',
          room_number: `${Math.floor(Math.random() * 100) + 200}`,
          message: [
            '温度設定が応答していません',
            '信号強度が低下しています',
            '予期しないデバイス再起動が発生しました'
          ][Math.floor(Math.random() * 3)],
          created_at: new Date().toISOString(),
          resolved: false,
        };
        setAlerts(prev => [newAlert, ...prev]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Filter alerts
  useEffect(() => {
    let filtered = alerts;

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(alert => !alert.resolved);
    } else if (statusFilter === 'resolved') {
      filtered = filtered.filter(alert => alert.resolved);
    }

    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(alert => alert.severity === severityFilter);
    }

    // Sort by created_at (newest first)
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setFilteredAlerts(filtered);
  }, [alerts, severityFilter, statusFilter]);

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

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5" />;
    }
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, resolved: true }
          : alert
      )
    );
  };

  const handleEscalateAlert = (alertId: string) => {
    // In a real app, this would send to management system
    console.log('Escalating alert:', alertId);
    alert('アラートをエスカレーションしました');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">アラートを読み込み中...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">アラート管理</h1>
            </div>
            <nav className="flex space-x-8">
              <a href="/dashboard" className="text-gray-600 hover:text-gray-900">ダッシュボード</a>
              <a href="/hotels" className="text-gray-600 hover:text-gray-900">ホテル一覧</a>
              <a href="/alerts" className="text-blue-600 font-medium">アラート</a>
              <a href="/settings" className="text-gray-600 hover:text-gray-900">設定</a>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">フィルタ:</span>
            </div>
            
            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">すべて</option>
                <option value="active">未解決</option>
                <option value="resolved">解決済み</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全重要度</option>
                <option value="critical">緊急</option>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              {filteredAlerts.length} 件のアラート
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={classNames(
                  'bg-white rounded-lg shadow p-6 border-l-4',
                  alert.resolved ? 'opacity-60' : '',
                  alert.severity === 'critical' ? 'border-l-red-500' :
                  alert.severity === 'high' ? 'border-l-orange-500' :
                  alert.severity === 'medium' ? 'border-l-yellow-500' :
                  'border-l-blue-500'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={classNames(
                      'p-2 rounded-full',
                      getSeverityColor(alert.severity)
                    )}>
                      {getSeverityIcon(alert.severity)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {alert.hotel_name} - 部屋 {alert.room_number}
                        </h3>
                        <span className={classNames(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          getSeverityColor(alert.severity)
                        )}>
                          {alert.severity}
                        </span>
                        {alert.resolved && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            解決済み
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-700 mb-3">{alert.message}</p>
                      
                      <p className="text-sm text-gray-500">
                        発生時刻: {new Date(alert.created_at).toLocaleString('ja-JP')}
                      </p>
                    </div>
                  </div>

                  {!alert.resolved && (
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm"
                        aria-label="アラートを解決する"
                      >
                        <CheckIcon className="w-4 h-4" />
                        解決
                      </button>
                      <button
                        onClick={() => handleEscalateAlert(alert.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm"
                        aria-label="アラートをエスカレーションする"
                      >
                        <ArrowUpIcon className="w-4 h-4" />
                        エスカレーション
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {statusFilter === 'active' 
                  ? '未解決のアラートはありません' 
                  : '条件に一致するアラートがありません'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
