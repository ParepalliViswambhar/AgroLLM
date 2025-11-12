import React, { useRef, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ChatPage from './pages/ChatPage';
import AuthCallback from './pages/AuthCallback';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  const synthRef = useRef(null);

  useEffect(() => {
    // Store the current ref value in a variable
    const currentSynth = synthRef.current;
    
    return () => {
      // Use the stored variable in cleanup
      if (currentSynth) {
        // Cleanup logic here if needed
      }
    };
  }, []);

  return (
    <ThemeProvider>
            <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

