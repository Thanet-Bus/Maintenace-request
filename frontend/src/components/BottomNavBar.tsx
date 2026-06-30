import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './BottomNavBar.module.css';
import type { User } from '../types/types';

const getCurrentUser = (): User | null => {
  try {
    const rawUser = localStorage.getItem('user');
    return rawUser ? (JSON.parse(rawUser) as User) : null;
  } catch {
    return null;
  }
};

const BottomNavBar: React.FC = () => {
  const currentUser = getCurrentUser();
  const isTechOrAdmin = currentUser?.role === 'TECH';
  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => isActive ? styles.activeItem : styles.item}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>home</span>
          <span className={styles.label}>Home</span>
        </NavLink>
        
        {isTechOrAdmin && (
          <NavLink 
            to="/tasks" 
            className={({ isActive }) => isActive ? styles.activeItem : styles.item}
          >
            <span className="material-symbols-outlined">engineering</span>
            <span className={styles.label}>Tasks</span>
          </NavLink>
        )}
      
        <NavLink 
          to="/history" 
          className={({ isActive }) => isActive ? styles.activeItem : styles.item}
        >
          <span className="material-symbols-outlined">history</span>
          <span className={styles.label}>History</span>
        </NavLink>
        
        {/* <NavLink 
          to="/profile" 
          className={({ isActive }) => isActive ? styles.activeItem : styles.item}
        >
          <span className="material-symbols-outlined">person</span>
          <span className={styles.label}>Profile</span>
        </NavLink> */}
      </div>
    </nav>
  );
};

export default BottomNavBar;
