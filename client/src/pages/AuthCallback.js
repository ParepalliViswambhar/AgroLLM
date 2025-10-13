import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userInfo = params.get('userInfo');

    if (userInfo) {
      // Decode and parse the user info
      const decodedUserInfo = decodeURIComponent(userInfo);
      const parsedUserInfo = JSON.parse(decodedUserInfo);
      // Store it in localStorage
      localStorage.setItem('userInfo', decodedUserInfo);
      // Redirect based on user role
      if (parsedUserInfo.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/chat');
      }
    } else {
      // Handle error or redirect to login
      navigate('/login');
    }
  }, [navigate, location]);

  return <div>Loading...</div>;
};

export default AuthCallback;
