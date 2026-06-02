export const getStatusBadge = (status: string, isAdmin: boolean = false) => {
  switch (status) {
    case 'PENDING':
      return { 
        label: 'รอดำเนินการ', 
        icon: 'pending', 
        color: isAdmin ? 'var(--color-tertiary)' : 'var(--color-tertiary-container)' 
      };
    case 'ASSIGNED':
      return { 
        label: isAdmin ? 'มอบหมายแล้ว' : 'รับงาน', 
        icon: 'pending', 
        color: isAdmin ? 'var(--color-status-assigned)' : 'var(--color-tertiary-container)' 
      };
    case 'IN_PROGRESS':
      return { 
        label: 'กำลังซ่อม', 
        icon: 'build', 
        color: 'var(--color-primary)' 
      };
    case 'COMPLETED':
      return { 
        label: 'เสร็จสิ้น', 
        icon: 'check_circle', 
        color: 'var(--color-outline)' 
      };
    case 'ON_HOLD':
      return { 
        label: 'พักงาน', 
        icon: 'pause_circle', 
        color: 'var(--color-status-onhold)' 
      };
    case 'CANCELLED':
      return { 
        label: 'ยกเลิก', 
        icon: 'cancel', 
        color: 'var(--color-error)' 
      };
    default:
      return { 
        label: status, 
        icon: 'info', 
        color: 'var(--color-on-surface-variant)' 
      };
  }
};