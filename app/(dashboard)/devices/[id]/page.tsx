'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Clock, User } from 'lucide-react';
import { devicesApi, assignmentsApi } from '@/lib/api';
import { useAuthContext } from '../../layout';
import type { Device, Assignment } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';
import AssignModal from '@/components/AssignModal';

export default function DeviceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthContext();
  const deviceId = params.id as string;

  const [device, setDevice] = useState<Device | null>(null);
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null);
  const [history, setHistory] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [returning, setReturning] = useState(false);

  const fetchDevice = async () => {
    try {
      const data = await devicesApi.get(deviceId);
      setDevice(data.device);
      setCurrentAssignment(data.currentAssignment || null);
    } catch (error) {
      console.error('Failed to fetch device:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const data = await devicesApi.getHistory(deviceId);
      setHistory(data.history);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchDevice(), fetchHistory()]);
      setLoading(false);
    };
    loadData();
  }, [deviceId]);

  const handleReturn = async () => {
    if (!currentAssignment || !confirm('Are you sure you want to return this device?')) return;

    setReturning(true);
    try {
      await assignmentsApi.markReturned(currentAssignment._id);
      await fetchDevice();
      await fetchHistory();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to return device');
    } finally {
      setReturning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      case 'retired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canManageDevices = user?.role === 'admin' || user?.role === 'super_admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Device not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/dashboard/devices')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Devices</span>
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{device.assetTag}</h1>
            <p className="text-gray-600 mt-1">
              {device.brand} {device.model}
            </p>
          </div>
          {canManageDevices && (
            <button
              onClick={() => router.push(`/dashboard/devices/${deviceId}/edit`)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div>
        <span
          className={clsx(
            'inline-block px-4 py-2 text-lg font-medium rounded-lg',
            getStatusColor(device.status)
          )}
        >
          {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
        </span>
      </div>

      {/* Pending Assignment Alert */}
      {currentAssignment && currentAssignment.status === 'pending_admin' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start space-x-3">
          <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-yellow-900">Waiting for Confirmation</h3>
            <p className="text-yellow-700 text-sm mt-1">
              Staff member has completed the OTP portal. Review and confirm the assignment.
            </p>
            <button
              onClick={() => router.push(`/dashboard/assignments/${currentAssignment._id}`)}
              className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Review Assignment
            </button>
          </div>
        </div>
      )}

      {/* Current Assignment Card */}
      {currentAssignment && currentAssignment.status === 'confirmed' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Current Assignment</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {(currentAssignment.userId as any).name}
                </p>
                <p className="text-sm text-gray-600">
                  {(currentAssignment.userId as any).email}
                </p>
                {(currentAssignment.userId as any).department && (
                  <p className="text-sm text-gray-600">
                    {(currentAssignment.userId as any).department}
                  </p>
                )}
              </div>
            </div>

            {/* Auto-detected specs */}
            {(currentAssignment.detectedOs || currentAssignment.detectedRam) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Auto-Detected Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {currentAssignment.detectedOs && (
                    <div>
                      <span className="text-gray-600">OS:</span>{' '}
                      <span className="text-gray-900">{currentAssignment.detectedOs}</span>
                    </div>
                  )}
                  {currentAssignment.detectedOsVersion && (
                    <div>
                      <span className="text-gray-600">Version:</span>{' '}
                      <span className="text-gray-900">{currentAssignment.detectedOsVersion}</span>
                    </div>
                  )}
                  {currentAssignment.detectedRam && (
                    <div>
                      <span className="text-gray-600">RAM:</span>{' '}
                      <span className="text-gray-900">{currentAssignment.detectedRam}</span>
                    </div>
                  )}
                  {currentAssignment.detectedScreenRes && (
                    <div>
                      <span className="text-gray-600">Screen:</span>{' '}
                      <span className="text-gray-900">{currentAssignment.detectedScreenRes}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="text-sm text-gray-600">
              Assigned {formatDistanceToNow(new Date(currentAssignment.assignedAt), { addSuffix: true })}
            </div>

            {canManageDevices && (
              <button
                onClick={handleReturn}
                disabled={returning}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {returning ? 'Returning...' : 'Return Device'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Device Info Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Device Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Serial Number</label>
            <p className="font-medium text-gray-900">{device.serialNumber}</p>
          </div>
          {device.processor && (
            <div>
              <label className="text-sm text-gray-600">Processor</label>
              <p className="font-medium text-gray-900">{device.processor}</p>
            </div>
          )}
          {device.ram && (
            <div>
              <label className="text-sm text-gray-600">RAM</label>
              <p className="font-medium text-gray-900">{device.ram}</p>
            </div>
          )}
          {device.storage && (
            <div>
              <label className="text-sm text-gray-600">Storage</label>
              <p className="font-medium text-gray-900">{device.storage}</p>
            </div>
          )}
          {device.os && (
            <div>
              <label className="text-sm text-gray-600">Operating System</label>
              <p className="font-medium text-gray-900">
                {device.os} {device.osVersion}
              </p>
            </div>
          )}
          {device.macAddress && (
            <div>
              <label className="text-sm text-gray-600">MAC Address</label>
              <p className="font-medium text-gray-900">{device.macAddress}</p>
            </div>
          )}
          <div>
            <label className="text-sm text-gray-600">Condition</label>
            <p className="font-medium text-gray-900 capitalize">{device.condition}</p>
          </div>
          {device.purchaseDate && (
            <div>
              <label className="text-sm text-gray-600">Purchase Date</label>
              <p className="font-medium text-gray-900">
                {format(new Date(device.purchaseDate), 'MMM d, yyyy')}
              </p>
            </div>
          )}
          {device.warrantyExpiry && (
            <div>
              <label className="text-sm text-gray-600">Warranty Expiry</label>
              <p className="font-medium text-gray-900">
                {format(new Date(device.warrantyExpiry), 'MMM d, yyyy')}
              </p>
            </div>
          )}
        </div>
        {device.notes && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="text-sm text-gray-600">Notes</label>
            <p className="text-gray-900 mt-1">{device.notes}</p>
          </div>
        )}
      </div>

      {/* Enhanced System Information */}
      {device.systemInfo && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">System Information</h2>
          <div className="space-y-6">
            
            {/* Browser & Environment */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Browser & Environment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                {device.systemInfo.browserName && (
                  <div>
                    <span className="text-gray-600">Browser:</span>{' '}
                    <span className="text-gray-900">
                      {device.systemInfo.browserName} {device.systemInfo.browserVersion}
                    </span>
                  </div>
                )}
                {device.systemInfo.language && (
                  <div>
                    <span className="text-gray-600">Language:</span>{' '}
                    <span className="text-gray-900">{device.systemInfo.language}</span>
                  </div>
                )}
                {device.systemInfo.timezone && (
                  <div>
                    <span className="text-gray-600">Timezone:</span>{' '}
                    <span className="text-gray-900">{device.systemInfo.timezone}</span>
                  </div>
                )}
                {device.systemInfo.cookieEnabled !== undefined && (
                  <div>
                    <span className="text-gray-600">Cookies:</span>{' '}
                    <span className="text-gray-900">
                      {device.systemInfo.cookieEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Hardware Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Hardware Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                {device.systemInfo.detectedScreenRes && (
                  <div>
                    <span className="text-gray-600">Screen Resolution:</span>{' '}
                    <span className="text-gray-900">{device.systemInfo.detectedScreenRes}</span>
                  </div>
                )}
                {device.systemInfo.devicePixelRatio && (
                  <div>
                    <span className="text-gray-600">Pixel Ratio:</span>{' '}
                    <span className="text-gray-900">{device.systemInfo.devicePixelRatio}x</span>
                  </div>
                )}
                {device.systemInfo.screenColorDepth && (
                  <div>
                    <span className="text-gray-600">Color Depth:</span>{' '}
                    <span className="text-gray-900">{device.systemInfo.screenColorDepth}-bit</span>
                  </div>
                )}
                {device.systemInfo.hardwareConcurrency && (
                  <div>
                    <span className="text-gray-600">CPU Cores:</span>{' '}
                    <span className="text-gray-900">{device.systemInfo.hardwareConcurrency}</span>
                  </div>
                )}
                {device.systemInfo.deviceMemory && (
                  <div>
                    <span className="text-gray-600">Device Memory:</span>{' '}
                    <span className="text-gray-900">{device.systemInfo.deviceMemory}GB</span>
                  </div>
                )}
                {device.systemInfo.maxTouchPoints && device.systemInfo.maxTouchPoints > 0 && (
                  <div>
                    <span className="text-gray-600">Touch Points:</span>{' '}
                    <span className="text-gray-900">{device.systemInfo.maxTouchPoints}</span>
                  </div>
                )}
                {device.systemInfo.screenOrientation && (
                  <div>
                    <span className="text-gray-600">Orientation:</span>{' '}
                    <span className="text-gray-900">{device.systemInfo.screenOrientation}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Network Information */}
            {(device.systemInfo.connectionType || device.systemInfo.connectionDownlink) && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Network Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  {device.systemInfo.connectionType && (
                    <div>
                      <span className="text-gray-600">Connection Type:</span>{' '}
                      <span className="text-gray-900">{device.systemInfo.connectionType}</span>
                    </div>
                  )}
                  {device.systemInfo.connectionDownlink && (
                    <div>
                      <span className="text-gray-600">Downlink Speed:</span>{' '}
                      <span className="text-gray-900">{device.systemInfo.connectionDownlink} Mbps</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Collection Information */}
            {device.systemInfo.collectedAt && (
              <div className="pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  System information collected on{' '}
                  {format(new Date(device.systemInfo.collectedAt), 'MMM d, yyyy \'at\' h:mm a')}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assign Device Button */}
      {canManageDevices && device.status === 'available' && (
        <button
          onClick={() => setShowAssignModal(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
        >
          Assign Device
        </button>
      )}

      {/* Assignment History */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Assignment History</h2>
        {history.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No assignment history</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Assigned
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Returned
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {history.map((assignment) => (
                  <tr key={assignment._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {(assignment.userId as any).name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {(assignment.userId as any).email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {format(new Date(assignment.assignedAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {assignment.returnedAt
                        ? format(new Date(assignment.returnedAt), 'MMM d, yyyy')
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          assignment.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : assignment.status === 'pending_admin'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        )}
                      >
                        {assignment.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <AssignModal
          onClose={() => {
            setShowAssignModal(false);
            fetchDevice();
            fetchHistory();
          }}
        />
      )}
    </div>
  );
}
