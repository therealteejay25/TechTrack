'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { dashboardApi } from '@/lib/api';
import type { DashboardStats } from '@/lib/types';
import { 
  Monitor, 
  Users, 
  CheckCircle, 
  UserCheck, 
  Clock,
  AlertTriangle,
  Package,
  FileText,
  UserPlus,
  Trash2,
  Settings
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'DEVICE_CREATED':
      case 'DEVICE_UPDATED':
        return Package;
      case 'DEVICE_ASSIGNED':
        return UserCheck;
      case 'DEVICE_RETURNED':
        return CheckCircle;
      case 'DEVICE_RETIRED':
        return Trash2;
      case 'OTP_GENERATED':
      case 'OTP_USED':
        return Clock;
      case 'USER_INVITED':
        return UserPlus;
      case 'USER_ROLE_CHANGED':
      case 'USER_DEACTIVATED':
        return Settings;
      default:
        return FileText;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'DEVICE_CREATED':
      case 'DEVICE_ASSIGNED':
      case 'USER_INVITED':
        return 'text-green-600 bg-green-50';
      case 'DEVICE_RETURNED':
        return 'text-blue-600 bg-blue-50';
      case 'DEVICE_RETIRED':
      case 'USER_DEACTIVATED':
        return 'text-red-600 bg-red-50';
      case 'OTP_GENERATED':
      case 'OTP_USED':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getActionDescription = (action: string) => {
    const descriptions: Record<string, string> = {
      'DEVICE_CREATED': 'created a device',
      'DEVICE_UPDATED': 'updated a device',
      'DEVICE_ASSIGNED': 'assigned a device',
      'DEVICE_RETURNED': 'returned a device',
      'DEVICE_RETIRED': 'retired a device',
      'OTP_GENERATED': 'generated an OTP',
      'OTP_USED': 'completed OTP verification',
      'USER_INVITED': 'invited a user',
      'USER_ROLE_CHANGED': 'changed user role',
      'USER_DEACTIVATED': 'deactivated a user'
    };
    return descriptions[action] || action.toLowerCase().replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load dashboard statistics</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Devices',
      value: stats.totalDevices,
      icon: Monitor,
      color: 'bg-blue-500'
    },
    {
      title: 'Available',
      value: stats.devices.available,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Assigned',
      value: stats.devices.assigned,
      icon: UserCheck,
      color: 'bg-orange-500'
    },
    {
      title: 'Pending Confirmation',
      value: stats.pendingAssignmentsCount,
      icon: Clock,
      color: 'bg-red-500'
    },
    {
      title: 'Team Members',
      value: stats.totalActiveMembers,
      icon: Users,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your device tracking system</p>
      </div>

      {/* Alert Banner for Pending Assignments */}
      {stats.pendingAssignmentsCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-red-900 font-medium">
                {stats.pendingAssignmentsCount} assignment{stats.pendingAssignmentsCount !== 1 ? 's' : ''} waiting for your confirmation
              </p>
              <p className="text-red-700 text-sm">
                Review and confirm device assignments to complete the process
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard/assignments?tab=pending')}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Review Now
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">{card.title}</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        {stats.recentAuditLogs.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No recent activity</p>
        ) : (
          <>
            <div className="space-y-3">
              {stats.recentAuditLogs.map((log) => {
                const Icon = getActionIcon(log.action);
                const colorClass = getActionColor(log.action);
                return (
                  <div key={log._id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{log.actorName}</span>
                        {' '}
                        <span className="text-gray-600">{getActionDescription(log.action)}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link
                href="/dashboard/audit"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View full audit log →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
