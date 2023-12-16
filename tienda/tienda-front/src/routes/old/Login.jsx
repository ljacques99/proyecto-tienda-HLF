import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import localforage from 'localforage';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Simular la obtención del token JWT (debería ser reemplazado por tu lógica de autenticación)
  const authenticateUser = async () => {
    // Aquí se debería realizar la lógica real de autenticación
    // y obtener un JWT token
    return 'your-jwt-token';
  };

  const signOrLogin = async () => {
    let token = await localforage.getItem('jwt');

    if (token) {
      const decodedToken = jwtDecode(token);
      const expiryTime = decodedToken.exp;
      if (Date.now() >= expiryTime * 1000) {
        await localforage.removeItem('loggedIn');
        await localforage.removeItem('jwt');
        token = null;
      }
    }

    if (!token) {
      try {
        const authToken = await authenticateUser();
        await localforage.setItem('jwt', authToken);
        await localforage.setItem('loggedIn', true);
        setIsLoggedIn(true);
        navigate('/'); 
      } catch (error) {
        console.error('Login failed:', error);
      }
    } else {
      setIsLoggedIn(true);
      navigate('/');
    }
  };

  useEffect(() => {
    const checkLogin = async () => {
      const loggedIn = await localforage.getItem('loggedIn');
      if (!loggedIn) {
        try {
          await signOrLogin();
        } catch (error) {
          console.error('Error checking login:', error);
          await localforage.removeItem('jwt');
          await localforage.removeItem('loggedIn');
        }
      } else {
        setIsLoggedIn(true);
      }
    };

    checkLogin();
  }, []);

  // Aquí podrías añadir un botón de login o un formulario según sea necesario
  return (
    <div>
      {console.log("hello") && isLoggedIn ? (
        <p>Usuario autenticado. Redireccionando a Dashboard...</p>
      ) : (
        <button onClick={signOrLogin}>Login</button>
      )}
    </div>
  );
};

export default Login;