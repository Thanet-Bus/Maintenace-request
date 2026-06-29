import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../../utils/apiClient';
import type { User } from '../../types/types';

export type UserRoleValue = 'USER' | 'ADMIN' | 'TECH';

export const ROLE_LABELS: Record<UserRoleValue, string> = {
  USER: 'ผู้ใช้งาน',
  ADMIN: 'ผู้ดูแลระบบ',
  TECH: 'ช่างเทคนิค',
};

export const ROLE_DESCRIPTIONS: Record<UserRoleValue, string> = {
  USER: 'แจ้งซ่อม ติดตามงาน และประเมินผลงาน',
  ADMIN: 'จัดการใบแจ้งซ่อม มอบหมายงาน และกำหนดบทบาทผู้ใช้',
  TECH: 'รับงาน อัปเดตสถานะงาน และบันทึกผลการซ่อม',
};

const ROLES: UserRoleValue[] = ['USER', 'ADMIN', 'TECH'];

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRoleValue | ''>('');
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiClient('/users') as User[];
      setUsers(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRole = useCallback(async (userId: number, role: UserRoleValue) => {
    setUpdatingUserId(userId);
    setError(null);
    setSuccessMessage(null);

    try {
      await apiClient(`/users/${userId}`, {
        method: 'PATCH',
        data: { role },
      });

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId ? { ...user, role } : user
        )
      );
      setSuccessMessage(`อัปเดตบทบาทเป็น ${ROLE_LABELS[role]} แล้ว`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ไม่สามารถอัปเดตบทบาทได้';
      setError(message);
    } finally {
      setUpdatingUserId(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        const data = await apiClient('/users') as User[];
        if (!cancelled) {
          setUsers(data);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      user.name.toLowerCase().includes(query) ||
      user.emp_id?.toLowerCase().includes(query) ||
      user.line_user_id.toLowerCase().includes(query);
    const matchesRole = roleFilter === '' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return {
    users,
    filteredUsers,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    roles: ROLES,
    updatingUserId,
    successMessage,
    fetchUsers,
    updateRole,
  };
}
