import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './TopAppBar.module.css';

interface TopAppBarProps {
  title: string;
  showBackButton?: boolean;
}

const TopAppBar: React.FC<TopAppBarProps> = ({ title, showBackButton }) => {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.leftGroup}>
          {showBackButton ? (
            <button 
              className={styles.iconButton} 
              onClick={() => navigate(-1)}
              aria-label="Back"
              style={{ marginRight: '8px' }}
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          ) : (
            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--color-primary)' }}>
              account_circle
            </span>
          )}
          <h1 className={styles.title}>{title}</h1>
        </div>
        {/* <button className={styles.iconButton}>
          <span className="material-symbols-outlined">notifications</span>
        </button> */}
      </div>
    </header>
  );
};

export default TopAppBar;
