import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import styles from './Users.module.css';
import { useUsers, type UserRoleValue } from '../../hooks/admin/useUsers';
import type { User } from '../../types/types';

const getCurrentUser = (): User | null => {
  try {
    const rawUser = localStorage.getItem('user');
    return rawUser ? (JSON.parse(rawUser) as User) : null;
  } catch {
    return null;
  }
};

const Users: React.FC = () => {
  const {
    filteredUsers,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    roles,
    updatingUserId,
    successMessage,
    updateRole,
  } = useUsers();

  const currentUser = getCurrentUser();

  if (loading) {
    return (
      <AdminLayout>
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <span className="material-symbols-outlined">sync</span>
            <p>กำลังโหลดข้อมูลผู้ใช้...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <span className="material-symbols-outlined">error_outline</span>
            <p>{error}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const counts = {
    USER: filteredUsers.filter((user) => user.role === 'USER').length,
    ADMIN: filteredUsers.filter((user) => user.role === 'ADMIN').length,
    TECH: filteredUsers.filter((user) => user.role === 'TECH').length,
  };

  return (
    <AdminLayout>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>จัดการผู้ใช้งานและบทบาท</h1>
            <p className={styles.pageSubtitle}>
              ดูรายชื่อผู้ใช้ที่เข้าสู่ระบบด้วย LINE และกำหนดบทบาท USER, ADMIN, TECH ได้จากหน้านี้
            </p>
          </div>
        </div>

        <div className={styles.summaryGrid}>
          {roles.map((role) => (
            <div key={role} className={styles.summaryCard}>
              <span className="material-symbols-outlined">{role === 'ADMIN' ? 'admin_panel_settings' : role === 'TECH' ? 'engineering' : 'person'}</span>
              <div>
                <strong>{counts[role]}</strong>
                <span>{role}</span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.filterBar}>
          <div className={styles.searchWrapper}>
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="ค้นหาชื่อ, employee ID, LINE user ID"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as UserRoleValue | '')}
          >
            <option value="">ทุกบทบาท</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {successMessage && (
          <div className={styles.successMessage}>
            <span className="material-symbols-outlined">check_circle</span>
            {successMessage}
          </div>
        )}

        <div className={styles.tableCard}>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ผู้ใช้</th>
                  <th>ข้อมูลติดต่อ</th>
                  <th>LINE Account</th>
                  <th>บทบาทปัจจุบัน</th>
                  <th>เปลี่ยนบทบาท</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className={styles.emptyState}>
                        <span className="material-symbols-outlined">inbox</span>
                        <p>ไม่พบผู้ใช้ที่ตรงกับเงื่อนไข</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isUpdating = updatingUserId === user.id;
                    const isCurrentUser = currentUser?.id === user.id;

                    return (
                      <tr key={user.id}>
                        <td>
                          <div className={styles.userCell}>
                            {user.profile_image_url ? (
                              <img src={user.profile_image_url} alt={user.name} className={styles.avatar} />
                            ) : (
                              <div className={styles.avatarPlaceholder}>
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <strong>{user.name}</strong>
                              <span>{user.emp_id || 'ไม่มี employee ID'}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className={styles.contactCell}>
                            <span className="material-symbols-outlined">phone</span>
                            <span>{user.phone || 'ไม่ระบุเบอร์โทรศัพท์'}</span>
                          </div>
                        </td>
                        <td>
                          <span className={styles.lineId}>{user.line_user_id}</span>
                        </td>
                        <td>
                          <span className={`${styles.roleBadge} ${styles[`roleBadge${user.role}`]}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <div className={styles.roleEditor}>
                            <select
                              value={user.role}
                              disabled={isUpdating || isCurrentUser}
                              onChange={(event) => updateRole(user.id, event.target.value as UserRoleValue)}
                            >
                              {roles.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                            {isCurrentUser && (
                              <span className={styles.selfNote}>ไม่สามารถเปลี่ยนบทบาทตัวเอง</span>
                            )}
                            {isUpdating && (
                              <span className={styles.savingNote}>กำลังบันทึก...</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Users;
