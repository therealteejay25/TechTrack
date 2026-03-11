'use client';

import { useState, useEffect } from 'react';
import { auditApi } from '@/lib/api';
import type { AuditLog } from '@/lib/types';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

const ACTION_TYPES = [
  { value: '', label: 'All Actions' },
  { value: 'DEVICE_CREATED', label: 'Device Created' },
  { value: 'DEVICE_UPDATED', label: 'Device Updated' },
  { value: 'DEVICE_ASSIGNED', label: 'Device Assigned' },
  { value: 'DEVICE_RETURNED', label: 'Device Returned' },
  { value: 'DEVICE_RETIRED', label: 'Device Retired' },
  { value: 'OTP_GENERATED', label: 'OTP Generated' },
  { value: 'OTP_USED', label: 'OTP Used' },
  { value: 'USER_INVITED', label: 'User Invited' },
  { value: 'USER_ROLE_CHANGED', label: 'User Role Changed' },
  { value: 'USER_DEACTIVATED', label: 'User Deactivated' }
];

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 50 };
      if (actionFilter) params.action = actionFilter;

      const data = await auditApi.list(params);
      setLogs(data.logs);
      setTotalPages(data.pages);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'DEVICE_ASSIGNED':
        return 'bg-green-100 text-green-800';
      case 'DEVICE_RETURNED':
        return 'bg-gray-100 text-gray-800';
      case 'USER_INVITED':
        return 'bg-blue-100 text-blue-800';
      case 'OTP_GENERATED':
        return 'bg-yellow-100 text-yellow-800';
      case 'OTP_USED':
        return 'bg-purple-100 text-purple-800';
      case 'DEVICE_RETIRED':
      case 'USER_DEACTIVATED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (action: string) => {
    return action.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const toggleExpanded = (logId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-gray-600 mt-1">Track all system activities and changes</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action Type
            </label>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ACTION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No audit logs found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log) => {
                    const isExpanded = expandedRows.has(log._id);
                    return (
                      <tr key={log._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{format(new Date(log.createdAt), 'MMM d, yyyy')}</div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(log.createdAt), 'h:mm a')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {log.actorName}
                          </div>
                          {(log.actorId as any)?.email && (
                            <div className="text-xs text-gray-500">
                              {(log.actorId as any).email}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={clsx(
                              'px-2 py-1 text-xs font-medium rounded-full',
                              getActionColor(log.action)
                            )}
                          >
                            {getActionLabel(log.action)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {log.targetType}
                        </td>
                        <td className="px-6 py-4">
                          {log.details && Object.keys(log.details).length > 0 ? (
                            <button
                              onClick={() => toggleExpanded(log._id)}
                              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                            >
                              <span>{isExpanded ? 'Hide' : 'Show'}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                          {isExpanded && log.details && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs">
                              <pre className="whitespace-pre-wrap text-gray-700">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
