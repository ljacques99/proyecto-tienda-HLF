import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({ user: null, token: null, error: null });

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:3005/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: { 'Content-type': 'application/json' },
      });

      if (response.ok) {
        setAuthState({ ...authState, user: username, token: 'your-jwt-token', error: null });
        return true
      } else {
        throw new Error('Acceso denegado');
      }
    } catch (error) {
      setAuthState({ ...authState, error: error.message });
    }
  };

  const logout = () => {
    setAuthState({ user: null, token: null, error: null });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
