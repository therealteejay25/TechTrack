// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'staff';
  department?: string;
  phone?: string;
  isActive: boolean;
}

export interface Organization {
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
}

// Device types
export interface Device {
  _id: string;
  orgId: string;
  assetTag: string;
  brand: string;
  model: string;
  serialNumber: string;
  processor?: string;
  ram?: string;
  storage?: string;
  os?: string;
  osVersion?: string;
  macAddress?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  warrantyExpiry?: string;
  condition: 'new' | 'good' | 'fair' | 'poor';
  status: 'available' | 'assigned' | 'maintenance' | 'retired';
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  systemInfo?: {
    userAgent?: string;
    language?: string;
    languages?: string;
    timezone?: string;
    screenColorDepth?: number;
    screenPixelDepth?: number;
    cookieEnabled?: boolean;
    onlineStatus?: boolean;
    hardwareConcurrency?: number;
    maxTouchPoints?: number;
    connectionType?: string;
    connectionDownlink?: number;
    browserName?: string;
    browserVersion?: string;
    devicePixelRatio?: number;
    screenOrientation?: string;
    deviceMemory?: number;
    collectedAt?: string;
    localTime?: string;
    utcOffset?: number;
    detectedScreenRes?: string;
    detectedHostname?: string;
  };
}

// Assignment types
export interface Assignment {
  _id: string;
  orgId: string;
  deviceId: Device | string;
  userId: User | string;
  assignedBy: User | string;
  assignedAt: string;
  returnedAt?: string;
  isActive: boolean;
  detectedOs?: string;
  detectedOsVersion?: string;
  detectedRam?: string;
  detectedScreenRes?: string;
  detectedHostname?: string;
  otpVerifiedAt?: string;
  accessories?: string;
  conditionAtAssignment?: string;
  adminNotes?: string;
  status: 'pending_admin' | 'confirmed' | 'returned';
  acknowledgementMethod: string;
  createdAt: string;
  updatedAt: string;
}

// Audit log types
export interface AuditLog {
  _id: string;
  orgId: string;
  actorId?: string;
  actorName: string;
  action: string;
  targetType: 'device' | 'user' | 'assignment' | 'org';
  targetId: string;
  details?: any;
  createdAt: string;
}

// Dashboard stats
export interface DashboardStats {
  devices: {
    available: number;
    assigned: number;
    maintenance: number;
    retired: number;
  };
  totalDevices: number;
  totalActiveMembers: number;
  activeAssignmentsCount: number;
  pendingAssignmentsCount: number;
  recentAuditLogs: AuditLog[];
}
