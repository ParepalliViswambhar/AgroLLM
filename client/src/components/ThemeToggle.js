import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import styles from './ThemeToggle.module.css';

const ThemeToggle = ({ theme, onToggle }) => {
  return (
    <button className={styles.themeToggleButton} onClick={onToggle}>
      {theme === 'dark' ? <FaSun /> : <FaMoon />}
      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
};

export default ThemeToggle;
