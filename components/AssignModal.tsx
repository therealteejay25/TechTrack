'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Copy, Check, Clock } from 'lucide-react';
import { membersApi, assignmentsApi } from '@/lib/api';
import type { User } from '@/lib/types';

interface AssignModalProps {
  onClose: () => void;
}

export default function AssignModal({ onClose }: AssignModalProps) {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [members, setMembers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [otp, setOtp] = useState('');
  const [otpId, setOtpId] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [targetUser, setTargetUser] = useState<{ name: string; email: string } | null>(null);

  const [copiedOtp, setCopiedOtp] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const [timeRemaining, setTimeRemaining] = useState('');

  const [assignmentCreated, setAssignmentCreated] = useState(false);
  const [assignmentId, setAssignmentId] = useState('');

  const portalUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/portal`
      : '/portal';

  /*
  =========================
  Fetch staff members
  =========================
  */

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await membersApi.list({ role: 'staff' });
        setMembers(data.users.filter((u: User) => u.isActive));
      } catch (error) {
        console.error('Failed to fetch members:', error);
        setError('Failed to load staff members');
      }
    };

    fetchMembers();
  }, []);

  /*
  =========================
  Countdown timer
  =========================
  */

  useEffect(() => {
    if (!expiresAt) return;

    const timer = setInterval(() => {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Expired');
        clearInterval(timer);
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  /*
  =========================
  Poll for assignment
  =========================
  */

  useEffect(() => {
    if (step !== 2 || !otpId || assignmentCreated) return;

    const poll = setInterval(async () => {
      try {
        if (expiresAt && new Date() > expiresAt) {
          clearInterval(poll);
          return;
        }

        const data = await assignmentsApi.getPending();

        const assignment = data.assignments.find(
          (a: any) => (a.userId?._id || a.userId) === selectedUserId
        );

        if (assignment) {
          setAssignmentCreated(true);
          setAssignmentId(assignment._id);
          clearInterval(poll);
        }
      } catch {
        // silent fail
      }
    }, 5000);

    return () => clearInterval(poll);
  }, [step, otpId, selectedUserId, expiresAt, assignmentCreated]);

  /*
  =========================
  Generate OTP
  =========================
  */

  const handleGenerateOtp = async () => {
    if (!selectedUserId) {
      setError('Please select a staff member');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await membersApi.generateOtp(selectedUserId);

      setOtp(data.otp);
      setOtpId(data.otpId);
      setExpiresAt(new Date(data.expiresAt));
      setTargetUser(data.targetUser);

      setStep(2);
    } catch (err: any) {
      console.error('Generate OTP error:', err);
      setError(err.response?.data?.error || 'Failed to generate OTP');
    } finally {
      setLoading(false);
    }
  };

  /*
  =========================
  Clipboard helper
  =========================
  */

  const copyToClipboard = async (text: string, type: 'otp' | 'url') => {
    try {
      await navigator.clipboard.writeText(text);

      if (type === 'otp') {
        setCopiedOtp(true);
        setTimeout(() => setCopiedOtp(false), 2000);
      } else {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      }
    } catch {
      console.error('Copy failed');
    }
  };

  /*
  =========================
  UI
  =========================
  */

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}

        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Add New Device
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Select staff and generate a portal OTP
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* STEP 1 */}

          {step === 1 && (
            <div className="space-y-4">

              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Staff Member
                </label>

                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Choose staff...</option>

                  {members.map((member) => {
                    // Handle both _id and id fields for compatibility
                    const memberId = member.id || (member as any)._id;
                    return (
                      <option key={memberId} value={memberId}>
                        {member.name} ({member.email})
                        {member.department && ` - ${member.department}`}
                      </option>
                    );
                  })}
                </select>

              </div>

              <button
                onClick={handleGenerateOtp}
                disabled={!selectedUserId || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate OTP'}
              </button>
            </div>
          )}

          {/* STEP 2 */}

          {step === 2 && !assignmentCreated && (
            <div className="space-y-6">

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                Share this code with{' '}
                <span className="font-semibold">
                  {targetUser?.name}
                </span>
              </div>

              {/* OTP */}

              <div className="space-y-2">
                <label className="text-sm font-medium">OTP Code</label>

                <div className="flex items-center gap-2">

                  <div className="flex-1 border-2 border-gray-300 rounded-lg p-4 text-center bg-gray-50">
                    <p className="text-4xl font-mono font-bold tracking-widest">
                      {otp}
                    </p>
                  </div>

                  <button
                    onClick={() => copyToClipboard(otp, 'otp')}
                    className="p-3 bg-gray-100 rounded-lg"
                  >
                    {copiedOtp ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* PORTAL URL */}

              <div className="space-y-2">

                <label className="text-sm font-medium">
                  Portal URL
                </label>

                <div className="flex gap-2">

                  <input
                    readOnly
                    value={portalUrl}
                    className="flex-1 border rounded-lg px-3 py-2 bg-gray-50 text-sm"
                  />

                  <button
                    onClick={() => copyToClipboard(portalUrl, 'url')}
                    className="p-2 bg-gray-100 rounded-lg"
                  >
                    {copiedUrl ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* COUNTDOWN */}

              <div className="flex items-center justify-center text-gray-600 gap-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  Expires in{' '}
                  <span className="font-mono font-medium">
                    {timeRemaining}
                  </span>
                </span>
              </div>

              <p className="text-center text-gray-500 text-sm animate-pulse">
                Waiting for staff to complete portal...
              </p>
            </div>
          )}

          {/* COMPLETED */}

          {assignmentCreated && (
            <div className="space-y-4 text-center">

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">

                <div className="flex justify-center mb-3">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                </div>

                <h3 className="font-bold text-green-900">
                  Device Info Collected
                </h3>

                <p className="text-green-700 text-sm mt-1">
                  {targetUser?.name} completed the portal.
                </p>
              </div>

              <button
                onClick={() =>
                  router.push(`/assignments/${assignmentId}`)
                }
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
              >
                Review Assignment
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}