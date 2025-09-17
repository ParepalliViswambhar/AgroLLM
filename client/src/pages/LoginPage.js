import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { RiLockPasswordFill } from 'react-icons/ri';
import { login } from '../services/api';
import styles from './Auth.module.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    login({ email, password })
      .then((response) => {
        localStorage.setItem('userInfo', JSON.stringify(response.data));
        navigate('/chat');
      })
      .catch((error) => {
        console.error('Login failed:', error);
        // You can add user-facing error handling here
      });
  };

  const handleGoogleLogin = () => {
    // This will be the endpoint for our Google OAuth strategy
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <div className={styles.splitContainer}>
      <div className={styles.splitLeft}>
        <img src="/farm-bg.png" alt="Plant" className={styles.plantImage} />
      </div>
      <div className={styles.splitRight}>
        <div className={styles.authCard}>
          <h2 className={styles.title}>Welcome back!</h2>
          <p className={styles.subtitle}>Enter your credentials to access your account</p>
          <form onSubmit={handleLogin}>
            <div className={styles.inputGroup}>
              <MdEmail className={styles.icon} />
              <input
                type="email"
                placeholder="Email address"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <RiLockPasswordFill className={styles.icon} />
              <input
                type="password"
                placeholder="Password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className={styles.button}>
              Login
            </button>
          </form>
          <div className={styles.divider}>OR</div>
          <button onClick={handleGoogleLogin} className={`${styles.button} ${styles.googleButton}`}>
            <FaGoogle />
            <span>Sign in with Google</span>
          </button>
          <p className={styles.footerText}>
            Don't have an account? <Link to="/signup" className={styles.link}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

