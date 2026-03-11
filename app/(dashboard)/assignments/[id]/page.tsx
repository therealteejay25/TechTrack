'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { assignmentsApi } from '@/lib/api';
import { useAuthContext } from '../../layout';
import type { Assignment } from '@/lib/types';
import { format } from 'date-fns';
import clsx from 'clsx';

export default function AssignmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthContext();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [returning, setReturning] = useState(false);

  // Form state for confirmation
  const [accessories, setAccessories] = useState('');
  const [conditionAtAssignment, setConditionAtAssignment] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const fetchAssignment = async () => {
    try {
      const data = await assignmentsApi.get(assignmentId);
      setAssignment(data.assignment);
    } catch (error) {
      console.error('Failed to fetch assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const handleConfirm = async () => {
    if (!assignment) return;

    setConfirming(true);
    try {
      await assignmentsApi.confirm(assignmentId, {
        accessories,
        conditionAtAssignment,
        adminNotes
      });
      await fetchAssignment();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to confirm assignment');
    } finally {
      setConfirming(false);
    }
  };

  const handleReturn = async () => {
    if (!assignment || !confirm('Are you sure you want to return this device?')) return;

    setReturning(true);
    try {
      await assignmentsApi.markReturned(assignmentId, adminNotes);
      await fetchAssignment();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to return device');
    } finally {
      setReturning(false);
    }
  };

  const canManageAssignments = user?.role === 'admin' || user?.role === 'super_admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Assignment not found</p>
      </div>
    );
  }

  const device = assignment.deviceId as any;
  const assignedUser = assignment.userId as any;
  const assignedBy = assignment.assignedBy as any;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/dashboard/assignments')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Assignments</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Assignment Details</h1>
      </div>

      {/* Status Banner */}
      {assignment.status === 'pending_admin' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start space-x-3">
          <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-yellow-900">Pending Confirmation</h3>
            <p className="text-yellow-700 text-sm mt-1">
              Staff member has completed the OTP verification. Review the information below and confirm the assignment.
            </p>
          </div>
        </div>
      )}

      {/* Device Info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Device Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Asset Tag</label>
            <p className="font-medium text-gray-900">{device.assetTag}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Brand & Model</label>
            <p className="font-medium text-gray-900">{device.brand} {device.model}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Serial Number</label>
            <p className="font-medium text-gray-900">{device.serialNumber}</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Assigned To</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <p className="font-medium text-gray-900">{assignedUser.name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <p className="font-medium text-gray-900">{assignedUser.email}</p>
          </div>
          {assignedUser.department && (
            <div>
              <label className="text-sm text-gray-600">Department</label>
              <p className="font-medium text-gray-900">{assignedUser.department}</p>
            </div>
          )}
        </div>
      </div>

      {/* Auto-Detected Information */}
      {(assignment.detectedOs || assignment.detectedRam) && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Auto-Detected Information</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-900">
              This information was automatically collected when the staff member verified the device.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignment.detectedOs && (
              <div>
                <label className="text-sm text-gray-600">Operating System</label>
                <p className="font-medium text-gray-900">{assignment.detectedOs}</p>
              </div>
            )}
            {assignment.detectedOsVersion && (
              <div>
                <label className="text-sm text-gray-600">OS Version</label>
                <p className="font-medium text-gray-900">{assignment.detectedOsVersion}</p>
              </div>
            )}
            {assignment.detectedRam && (
              <div>
                <label className="text-sm text-gray-600">RAM</label>
                <p className="font-medium text-gray-900">{assignment.detectedRam}</p>
              </div>
            )}
            {assignment.detectedScreenRes && (
              <div>
                <label className="text-sm text-gray-600">Screen Resolution</label>
                <p className="font-medium text-gray-900">{assignment.detectedScreenRes}</p>
              </div>
            )}
            {assignment.detectedHostname && (
              <div>
                <label className="text-sm text-gray-600">Hostname</label>
                <p className="font-medium text-gray-900">{assignment.detectedHostname}</p>
              </div>
            )}
          </div>
          {assignment.otpVerifiedAt && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="text-sm text-gray-600">Verified At</label>
              <p className="font-medium text-gray-900">
                {format(new Date(assignment.otpVerifiedAt), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Form (only for pending assignments) */}
      {assignment.status === 'pending_admin' && canManageAssignments && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Confirm Assignment</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accessories
              </label>
              <input
                type="text"
                value={accessories}
                onChange={(e) => setAccessories(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Charger, mouse, laptop bag, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition at Assignment
              </label>
              <select
                value={conditionAtAssignment}
                onChange={(e) => setConditionAtAssignment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select condition...</option>
                <option value="new">New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional notes..."
              />
            </div>

            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {confirming ? 'Confirming...' : 'Confirm Assignment'}
            </button>
          </div>
        </div>
      )}

      {/* Assignment Details (for confirmed assignments) */}
      {assignment.status === 'confirmed' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Assignment Details</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Assigned Date</label>
              <p className="font-medium text-gray-900">
                {format(new Date(assignment.assignedAt), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Assigned By</label>
              <p className="font-medium text-gray-900">{assignedBy.name}</p>
            </div>
            {assignment.accessories && (
              <div>
                <label className="text-sm text-gray-600">Accessories</label>
                <p className="font-medium text-gray-900">{assignment.accessories}</p>
              </div>
            )}
            {assignment.conditionAtAssignment && (
              <div>
                <label className="text-sm text-gray-600">Condition at Assignment</label>
                <p className="font-medium text-gray-900 capitalize">{assignment.conditionAtAssignment}</p>
              </div>
            )}
            {assignment.adminNotes && (
              <div>
                <label className="text-sm text-gray-600">Admin Notes</label>
                <p className="font-medium text-gray-900">{assignment.adminNotes}</p>
              </div>
            )}

            {assignment.isActive && canManageAssignments && (
              <button
                onClick={handleReturn}
                disabled={returning}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {returning ? 'Returning...' : 'Return Device'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Returned Info */}
      {assignment.status === 'returned' && assignment.returnedAt && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Return Information</h2>
          <div>
            <label className="text-sm text-gray-600">Returned Date</label>
            <p className="font-medium text-gray-900">
              {format(new Date(assignment.returnedAt), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
