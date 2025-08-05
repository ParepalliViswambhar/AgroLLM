import React from 'react';
import styles from './ThemeToggle.module.css';

const ThemeToggle = ({ theme, onToggle }) => {
  return (
    <div className={styles.toggleContainer}>
      <span className={styles.label}>Light</span>
      <label className={styles.switch}>
        <input type="checkbox" checked={theme === 'dark'} onChange={onToggle} />
        <span className={styles.slider}></span>
      </label>
      <span className={styles.label}>Dark</span>
    </div>
  );
};

export default ThemeToggle;
