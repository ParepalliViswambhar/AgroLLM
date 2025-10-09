import React, { useState } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { RiLockPasswordFill } from 'react-icons/ri';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { signUp } from '../services/api';
import GoogleIcon from '../components/common/GoogleIcon';
import styles from './Auth.module.css';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    signUp({ name, email, password })
      .then((response) => {
        localStorage.setItem('userInfo', JSON.stringify(response.data));
        navigate('/chat');
      })
      .catch((error) => {
        console.error('Signup failed:', error);
        const errorMessage = error.response?.data?.message || 'Signup failed. Please check your details and try again.';
        setError(errorMessage);
        setLoading(false);
      });
  };

  const handleGoogleSignup = () => { 
  const backendURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  window.location.href = `${backendURL}/api/auth/google`;
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
            {error && <div className={styles.errorMessage}>{error}</div>}
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
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className={styles.eyeIcon}
                onClick={() => setShowPassword((prev) => !prev)}
                style={{ position: 'absolute', right: '0.75rem', cursor: 'pointer', zIndex: 2 }}
                tabIndex={0}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                role="button"
              >
                {showPassword ? <BsEyeSlash size={20} /> : <BsEye size={20} /> }
              </span>
            </div>
            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? (
                <>
                  <AiOutlineLoading3Quarters className={styles.spinner} />
                  <span>Signing up...</span>
                </>
              ) : (
                'Sign up'
              )}
            </button>
          </form>
          <div className={styles.divider}>OR</div>
          <button onClick={handleGoogleSignup} className={`${styles.button} ${styles.googleButton}`}>
            <GoogleIcon size={20} />
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

