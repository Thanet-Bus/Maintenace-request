import React from 'react';
import styles from './TopAppBar.module.css';

interface TopAppBarProps {
  title: string;
}

const TopAppBar: React.FC<TopAppBarProps> = ({ title }) => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.leftGroup}>
          <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--color-primary)' }}>
            account_circle
          </span>
          <h1 className={styles.title}>{title}</h1>
        </div>
        <button className={styles.iconButton}>
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </div>
    </header>
  );
};

export default TopAppBar;
