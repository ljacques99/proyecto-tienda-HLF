import { createContext, useContext, useState, useEffect } from 'react';
import { signIn, signInWithWallet } from '../utils/hlfApi/signIn'
import { getMyIdentity } from '../utils/hlfApi/chaincode/getMyIdentity';
import localforage from 'localforage';
import { jwtDecode } from "jwt-decode";
import { createJWT } from '../hooks/jwtAuth'

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({ 
    user: null, 
    token: null,
    error: null,
    isAuthenticated: false,
    userType: null,
    userIdentity: null 
  });

  const [isIdentityLoading, setIsIdentityLoading] = useState(null);

  useEffect(() => {
    const updateIdentity = async () => {
      if (!authState.token || authState.userIdentity) return;
      const identity = await getMyIdentity(authState.userType, authState.token);
      setAuthState(prevState => ({
        ...prevState,
        userIdentity: identity.id.toString()
      }));
      setIsIdentityLoading(false);
    };

    if (isIdentityLoading) {
      updateIdentity();
    }
  }, [isIdentityLoading, authState.token, authState.userType, authState.userIdentity]);

  // useEffect(() => {
  //   console.log(authState); // Esto se ejecutará después de que authState se haya actualizado.
  // }, [authState]);

  useEffect(() => {
    const verifyJWT = async () => {
      const token = await localforage.getItem('jwt');
      if (token && token.split('.').length === 3) {
        try {
            const decodedToken = jwtDecode(token);
            const expiryTime = decodedToken.exp;
            const userType = decodedToken.mspID === "Org1MSP" ? "business" : "client";
            if (Date.now() < expiryTime * 1000) {
              // Valid token that has not expired
              setAuthState({ 
                user: decodedToken.username, 
                token: token, 
                error: null,
                isAuthenticated: true,
                userType: userType,
                userIdentity: null
              });
              setIsIdentityLoading(true)
            } else {
              // Expired token
              await localforage.removeItem('jwt');
              setAuthState({ 
                user: null, 
                token: token, 
                error: null,
                isAuthenticated: false,
                userType: null,
                userIdentity: null 
              });
            }
        } catch (error) {
            console.error('Error al decodificar el token:', error);
            await localforage.removeItem('jwt');
            setAuthState({ 
              user: null, 
              token: null, 
              error: error.message || error.toString(),
              isAuthenticated: false,
              userType: null,
              userIdentity: null 
            });
        }
      } else {          
        await localforage.removeItem('jwt');
        setAuthState({ 
          user: null, 
          token: null, 
          error: null,
          isAuthenticated: false,
          userType: null,
          userIdentity: null 
        });
      }
    }
  
    verifyJWT();
  }, []);

  const login = async (username, password) => {
    try {
      const userType = await localforage.getItem('userType');
      const response = await signIn(userType, { username, password })
      
      if (response && response.token) {
        await localforage.setItem('jwt', response.token); // Guardar el token en localforage
        setAuthState({ ...authState, 
          user: username, 
          token: response.token, 
          error: null,
          isAuthenticated: true,
          userType: null 
        });
        return true
      } else {
        throw new Error('Acceso denegado');
      }
    } catch (error) {
      setAuthState({ ...authState, error: error.message });
    }
  };

  const loginWithWallet = async (userType) => {
    try {
      //const userType = await localforage.getItem('userType');
      const { ethereum } = window;
      if (!ethereum) {
        throw new Error('Metamask is not installed')
      }
      const accounts = await ethereum.request({ method: "eth_accounts" });
      const userAddress = accounts[0]
      const response = await signInWithWallet(userType, { walletAddress: userAddress })

      if (response && response.token) {
        const decodedToken = jwtDecode(response.token);
        const addressJWT = await createJWT(decodedToken.walletAddress, decodedToken)
        // console.log("SERVER", response.token)
        // console.log("METAMASK", addressJWT)
        if (!addressJWT) throw new Error('Acceso no verificado')
        await localforage.setItem('jwt', response.token);
        setAuthState({ ...authState, 
          user: decodedToken.username, 
          token: response.token, 
          error: null,
          isAuthenticated: true,
          userType: userType,
          userIdentity: null 
        });
        return true
      } else {
        throw new Error('Acceso denegado');
      }
    } catch (error) {
      setAuthState({ ...authState, error: error.message });
    }
  };

  const logout = async () => {
    await localforage.removeItem('jwt');
    setAuthState({ 
      user: null, 
      jwt: null, 
      error: null,
      isAuthenticated: false,
      userType: null,
      userIdentity: null 
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, loginWithWallet, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;