import { useState, useEffect } from 'react';
import localforage from 'localforage';
import { jwtDecode } from 'jwt-decode';

const useAuthStatus = () => {
  const [authStatus, setAuthStatus] = useState({
    isAuthenticated: false,
    userType: null,
  });

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = await localforage.getItem('jwt');
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          if (Date.now() < decodedToken.exp * 1000) {
            setAuthStatus({
              isAuthenticated: true,
              userType: decodedToken.userType,
            });
          }
        } catch (error) {
            return console.log(error)
        }
      }
    };

    checkAuthStatus();
  }, []);

  return authStatus;
};

export default useAuthStatus;