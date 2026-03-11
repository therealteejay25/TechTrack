'use client';

import { useState, useEffect, useCallback } from 'react';
import { authApi } from './api';
import type { User, Organization } from './types';

interface AuthData {
  user: User;
  org: Organization;
}

export async function getCurrentUser(): Promise<AuthData | null> {
  try {
    const data = await authApi.me();
    return data;
  } catch (error) {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCurrentUser();
      if (data) {
        setUser(data.user);
        setOrg(data.org);
      } else {
        setUser(null);
        setOrg(null);
      }
    } catch (error) {
      setUser(null);
      setOrg(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    org,
    loading,
    refetch: fetchUser
  };
}
