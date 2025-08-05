import React from 'react';
import { Link } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';
import { FaUserPlus, FaLightbulb, FaChartLine } from 'react-icons/fa';
import { BsFillChatDotsFill } from 'react-icons/bs';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  return (
    <div className={styles.landingContainer}>
      <main className={styles.mainContent}>
        <section className={styles.heroSection}>
          <h2>Revolutionizing Agriculture with AI</h2>
          <p>
            Get instant, data-driven insights to optimize your farming practices, from crop management to market analysis.
          </p>
          <div className={styles.ctaButtons}>
            <Link to="/login" className={styles.ctaButton}><FiLogIn /><span>Login</span></Link>
            <Link to="/signup" className={`${styles.ctaButton} ${styles.secondary}`}><FaUserPlus /><span>Sign Up</span></Link>
          </div>
        </section>

        <section className={styles.featuresSection}>
          <h2>Features</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <FaLightbulb className={styles.featureIcon} />
              <h3>Smart Crop Advisory</h3>
              <p>Receive tailored advice on planting, irrigation, and pest control.</p>
            </div>
            <div className={styles.featureCard}>
              <FaChartLine className={styles.featureIcon} />
              <h3>Market Price Prediction</h3>
              <p>Stay ahead of the market with AI-driven price forecasts for your produce.</p>
            </div>
            <div className={styles.featureCard}>
              <BsFillChatDotsFill className={styles.featureIcon} />
              <h3>24/7 AI Chat</h3>
              <p>Have a question? Our AI chatbot is always available to help you out.</p>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
};

export default LandingPage;
