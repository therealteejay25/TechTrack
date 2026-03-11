'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Copy, Check, Key, X } from 'lucide-react'
import { membersApi } from '@/lib/api'
import { useAuthContext } from '../layout'
import type { User } from '@/lib/types'
import clsx from 'clsx'

export default function MembersPage() {
  const { user: currentUser } = useAuthContext()

  const [members, setMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<User | null>(null)

  const canManageMembers =
    currentUser?.role === 'admin' || currentUser?.role === 'super_admin'

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const data = await membersApi.list()
      setMembers(data.users)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const handleGenerateOtp = (member: User) => {
    setSelectedMember(member)
    setShowOtpModal(true)
  }

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800'
      case 'admin':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getAvatarColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-500'
      case 'admin':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin'
      case 'admin':
        return 'Admin'
      default:
        return 'Staff'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-600">
            Manage your organization's team and assign devices
          </p>
        </div>

        {canManageMembers && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <UserPlus size={18} />
            Invite Member
          </button>
        )}
      </div>

      {/* Members Grid */}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <div
              key={member.id}
              className={clsx(
                'bg-white rounded-xl shadow-sm p-6',
                member.isActive
                  ? 'hover:shadow-md transition'
                  : 'opacity-60'
              )}
            >
              {/* Avatar */}

              <div className="flex items-center gap-4 mb-4">
                <div
                  className={clsx(
                    'w-12 h-12 rounded-full text-white flex items-center justify-center font-bold',
                    getAvatarColor(member.role)
                  )}
                >
                  {getInitials(member.name)}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    {member.name}
                  </h3>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </div>

              {/* Role */}

              <div className="mb-3">
                <span
                  className={clsx(
                    'px-3 py-1 text-sm rounded-lg font-medium',
                    getRoleColor(member.role)
                  )}
                >
                  {getRoleLabel(member.role)}
                </span>
              </div>

              {/* Department */}

              {member.department && (
                <p className="text-sm text-gray-600 mb-3">
                  {member.department}
                </p>
              )}

              {/* Status */}

              <div className="mb-4">
                {member.isActive ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Active
                  </span>
                ) : (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    Inactive
                  </span>
                )}
              </div>

              {/* Actions */}

              {canManageMembers && member.role === 'staff' && (
                <button
                  onClick={() => handleGenerateOtp(member)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Key size={16} />
                  Assign Device
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showInviteModal && (
        <InviteModal
          onClose={() => setShowInviteModal(false)}
          onSuccess={fetchMembers}
        />
      )}
    </div>
  )
}

interface InviteModalProps {
  onClose: () => void
  onSuccess: () => void
}

function InviteModal({ onClose, onSuccess }: InviteModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'staff'>('staff')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError('Email required')
      return
    }

    setLoading(true)

    try {
      const data = await membersApi.invite({ email, role })
      setInviteLink(data.inviteLink)
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to send invite')
    } finally {
      setLoading(false)
    }
  }

  const copy = async () => {
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">

        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="font-semibold text-lg">Invite Member</h2>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6">

          {!inviteLink ? (

            <form onSubmit={handleSubmit} className="space-y-4">

              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}

              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />

              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as 'admin' | 'staff')
                }
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>

              <button
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg"
              >
                {loading ? 'Sending...' : 'Send Invite'}
              </button>

            </form>

          ) : (

            <div className="space-y-4">

              <div className="bg-green-50 border border-green-200 p-3 rounded-lg flex items-center gap-2">
                <Check size={16} />
                Invite created
              </div>

              <div className="flex gap-2">
                <input
                  readOnly
                  value={inviteLink}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                />

                <button
                  onClick={copy}
                  className="bg-blue-600 text-white px-3 rounded-lg"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>

            </div>

          )}

        </div>
      </div>
    </div>
  )
}