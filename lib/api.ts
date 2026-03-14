import axios from 'axios';
import type { User, Organization, Device, Assignment, AuditLog, DashboardStats } from './types';

const api = axios.create({
  baseURL: '/api',  // ✅ Now same-origin — no more cross-site cookie issues
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// // Response interceptor for handling 401 errors
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401 && typeof window !== 'undefined') {
//       // Only redirect if not already on login page
//       if (!window.location.pathname.includes('/login')) {
//         window.location.href = '/login';
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// Auth API
export const authApi = {
  register: async (data: { orgName: string; name: string; email: string; password: string }) => {
    const response = await api.post<{ user: User; org: Organization }>('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post<{ user: User; org: Organization }>('/auth/login', data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post<{ success: boolean }>('/auth/logout');
    return response.data;
  },

  me: async () => {
    const response = await api.get<{ user: User; org: Organization }>('/auth/me');
    return response.data;
  },

  acceptInvite: async (data: { token: string; name: string; password: string }) => {
    const response = await api.post<{ user: User }>('/auth/accept-invite', data);
    return response.data;
  }
};

// Devices API
export const devicesApi = {
  list: async (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    const response = await api.get<{ devices: Device[]; total: number; page: number; pages: number }>('/devices', { params });
    return response.data;
  },

  create: async (data: Partial<Device>) => {
    const response = await api.post<{ device: Device }>('/devices', data);
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get<{ device: Device; currentAssignment?: Assignment }>(`/devices/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<Device>) => {
    const response = await api.patch<{ device: Device }>(`/devices/${id}`, data);
    return response.data;
  },

  remove: async (id: string) => {
    const response = await api.delete<{ device: Device }>(`/devices/${id}`);
    return response.data;
  },

  generateOtp: async (id: string, targetUserId: string) => {
    const response = await api.post<{ otp: string; expiresAt: string; otpId: string; targetUser: { name: string; email: string } }>(
      `/devices/${id}/generate-otp`,
      { targetUserId }
    );
    return response.data;
  },

  getHistory: async (id: string) => {
    const response = await api.get<{ history: Assignment[] }>(`/devices/${id}/history`);
    return response.data;
  }
};

// Portal API (public endpoints)
export const portalApi = {
  verifyOtp: async (otp: string) => {
    const response = await api.post<{
      otpId: string;
      targetUser: { name: string; email: string; department?: string };
      orgId: string;
    }>('/portal/verify-otp', { otp });
    return response.data;
  },

  submit: async (data: {
    otpId: string;
    otp: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
    processor?: string;
    ram?: string;
    storage?: string;
    detectedOs?: string;
    detectedOsVersion?: string;
    detectedRam?: string;
    detectedScreenRes?: string;
    detectedHostname?: string;
  }) => {
    const response = await api.post<{ success: boolean; assignmentId: string; deviceId: string }>('/portal/submit', data);
    return response.data;
  }
};

// Assignments API
export const assignmentsApi = {
  list: async (params?: { isActive?: boolean; status?: string; page?: number; limit?: number }) => {
    const response = await api.get<{ assignments: Assignment[]; total: number; page: number; pages: number }>('/assignments', { params });
    return response.data;
  },

  getPending: async () => {
    const response = await api.get<{ assignments: Assignment[] }>('/assignments/pending');
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get<{ assignment: Assignment }>(`/assignments/${id}`);
    return response.data;
  },

  confirm: async (id: string, data: { accessories?: string; conditionAtAssignment?: string; adminNotes?: string }) => {
    const response = await api.patch<{ assignment: Assignment }>(`/assignments/${id}/confirm`, data);
    return response.data;
  },

  markReturned: async (id: string, notes?: string) => {
    const response = await api.post<{ assignment: Assignment }>(`/assignments/${id}/return`, { notes });
    return response.data;
  }
};

// Members API
export const membersApi = {
  list: async (params?: { role?: string }) => {
    const response = await api.get<{ users: User[] }>('/members', { params });
    return response.data;
  },

  invite: async (data: { email: string; role: 'admin' | 'staff' }) => {
    const response = await api.post<{ inviteLink: string; user: User }>('/members/invite', data);
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get<{ user: User; assignments: Assignment[] }>(`/members/${id}`);
    return response.data;
  },

  updateRole: async (id: string, role: string) => {
    const response = await api.patch<{ user: User }>(`/members/${id}/role`, { role });
    return response.data;
  },

  deactivate: async (id: string) => {
    const response = await api.delete<{ success: boolean; user: User }>(`/members/${id}`);
    return response.data;
  },

  generateOtp: async (id: string) => {
    const response = await api.post<{ otp: string; expiresAt: string; otpId: string; targetUser: { name: string; email: string } }>(
      `/members/${id}/generate-otp`
    );
    return response.data;
  }
};

// Dashboard API
export const dashboardApi = {
  getStats: async () => {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  }
};

// Audit API
export const auditApi = {
  list: async (params?: { action?: string; targetType?: string; actorId?: string; page?: number; limit?: number }) => {
    const response = await api.get<{ logs: AuditLog[]; total: number; page: number; pages: number }>('/audit', { params });
    return response.data;
  }
};

// Organization API
export const organizationApi = {
  get: async () => {
    const response = await api.get<{
      organization: {
        id: string;
        name: string;
        slug: string;
        logo?: string;
        description?: string;
        website?: string;
        email?: string;
        phone?: string;
        address?: string;
        city?: string;
        country?: string;
        timezone?: string;
        createdAt: string;
        updatedAt: string;
      };
      stats: {
        totalMembers: number;
        activeDevices: number;
        pendingAssignments: number;
      };
    }>('/organization');
    return response.data;
  },

  update: async (data: {
    name: string;
    description?: string;
    website?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    timezone?: string;
  }) => {
    const response = await api.put<{
      organization: {
        id: string;
        name: string;
        slug: string;
        logo?: string;
        description?: string;
        website?: string;
        email?: string;
        phone?: string;
        address?: string;
        city?: string;
        country?: string;
        timezone?: string;
        createdAt: string;
        updatedAt: string;
      };
    }>('/organization', data);
    return response.data;
  },

  uploadLogo: async (logoData: string) => {
    const response = await api.post<{ logoUrl: string }>('/organization/logo', { logoData });
    return response.data;
  },

  removeLogo: async () => {
    const response = await api.delete<{ success: boolean }>('/organization/logo');
    return response.data;
  }
};

export default api;
