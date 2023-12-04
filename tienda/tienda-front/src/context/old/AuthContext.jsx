import { createContext, useContext, useState, useEffect } from "react";
import localforage from "localforage";
import { decodeJWT } from "../hooks/jwtAuth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({ user: null, token: null });

  useEffect(() => {
    const checkToken = async () => {
      const token = await localforage.getItem("jwt");
      if (token) {
        const user = decodeJWT(token);
        setAuthState({ user, token });
      }
    };

    checkToken();
  }, []);

  const login = (jwtToken) => {
    const user = decodeJWT(jwtToken);
    setAuthState({ user, token: jwtToken });
  };

  const logout = () => {
    setAuthState({ user: null, token: null });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;