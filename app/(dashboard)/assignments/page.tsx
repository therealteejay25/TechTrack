'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { assignmentsApi } from '@/lib/api';
import { useAuthContext } from '../layout';
import type { Assignment } from '@/lib/types';
import { format } from 'date-fns';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { Suspense } from 'react';

function AssignmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthContext();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'active' | 'returned'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Check for tab query parameter
    const tab = searchParams.get('tab');
    if (tab === 'pending') {
      setActiveTab('pending');
    }
  }, [searchParams]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pending') {
        const data = await assignmentsApi.getPending();
        setAssignments(data.assignments);
        setTotalPages(1);
      } else {
        const params: any = { page, limit: 20 };
        
        if (activeTab === 'active') {
          params.isActive = true;
          params.status = 'confirmed';
        } else if (activeTab === 'returned') {
          params.status = 'returned';
        }

        const data = await assignmentsApi.list(params);
        setAssignments(data.assignments);
        setTotalPages(data.pages);
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [activeTab, page]);

  const getStatusBadge = (assignment: Assignment) => {
    if (assignment.status === 'pending_admin') {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending Confirmation
        </span>
      );
    } else if (assignment.status === 'confirmed' && assignment.isActive) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </span>
      );
    } else if (assignment.status === 'returned') {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          <XCircle className="w-3 h-3 mr-1" />
          Returned
        </span>
      );
    }
    return null;
  };

  const canManageAssignments = user?.role === 'admin' || user?.role === 'super_admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
        <p className="text-gray-600 mt-1">Manage device assignments and confirmations</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-2">
        <div className="flex space-x-2 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('all');
              setPage(1);
            }}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap',
              activeTab === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            All
          </button>
          {canManageAssignments && (
            <button
              onClick={() => {
                setActiveTab('pending');
                setPage(1);
              }}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap',
                activeTab === 'pending'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              Pending Confirmation
            </button>
          )}
          <button
            onClick={() => {
              setActiveTab('active');
              setPage(1);
            }}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap',
              activeTab === 'active'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            Active
          </button>
          <button
            onClick={() => {
              setActiveTab('returned');
              setPage(1);
            }}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap',
              activeTab === 'returned'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            Returned
          </button>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No assignments found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assignments.map((assignment) => {
                    const device = assignment.deviceId as any;
                    const assignedUser = assignment.userId as any;
                    
                    return (
                      <tr
                        key={assignment._id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/assignments/${assignment._id}`)}
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {device.assetTag}
                          </div>
                          <div className="text-sm text-gray-500">
                            {device.brand} {device.model}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {assignedUser.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {assignedUser.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {format(new Date(assignment.assignedAt), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(assignment)}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/assignments/${assignment._id}`);
                            }}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            {assignment.status === 'pending_admin' ? 'Review' : 'View Details'}
                          </button>
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

export default function AssignmentsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AssignmentsContent />
    </Suspense>
  );
}
