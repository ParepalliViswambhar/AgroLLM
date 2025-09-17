import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaUser } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { RiLockPasswordFill } from 'react-icons/ri';
import { signUp } from '../services/api';
import styles from './Auth.module.css';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    signUp({ name, email, password })
      .then((response) => {
        localStorage.setItem('userInfo', JSON.stringify(response.data));
        navigate('/chat');
      })
      .catch((error) => {
        console.error('Signup failed:', error);
        // You can add user-facing error handling here
      });
  };

  const handleGoogleSignup = () => {
    // This will be the endpoint for our Google OAuth strategy
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <div className={styles.splitContainer}>
      <div className={styles.splitLeft}>
        <img src="./farm-bg.png" alt="Plant" className={styles.plantImage} />
      </div>
      <div className={styles.splitRight}>
        <div className={styles.authCard}>
          <h2 className={styles.title}>Get Started Now</h2>
          <p className={styles.subtitle}>Create your credentials to access your account</p>
          <form onSubmit={handleSignup}>
            <div className={styles.inputGroup}>
              <FaUser className={styles.icon} />
              <input
                type="text"
                placeholder="Full Name"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
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
              Sign up
            </button>
          </form>
          <div className={styles.divider}>OR</div>
          <button onClick={handleGoogleSignup} className={`${styles.button} ${styles.googleButton}`}>
            <FaGoogle />
            <span>Sign up with Google</span>
          </button>
          <p className={styles.footerText}>
            Already have an account? <Link to="/login" className={styles.link}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

