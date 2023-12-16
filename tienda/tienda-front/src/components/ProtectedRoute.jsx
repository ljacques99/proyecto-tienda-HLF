import { useContext } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ children, userTypeRequired, redirectIfAuthenticated, redirectPath = '/' }) => {
  const { isAuthenticated, userType } = useContext(AuthContext);

  // console.log({
  //   isAuthenticated: isAuthenticated,
  //   userTypeRequired: userTypeRequired,
  //   userType: userType,
  //   redirectIfAuthenticated: redirectIfAuthenticated,
  //   redirectPath: redirectPath
  // })
  const location = useLocation()

  // Si el usuario no está autenticado y la ruta no requiere estar autenticado, muestra el contenido
  if (!isAuthenticated && !userTypeRequired) {
    return children || <Outlet />;
  }

  // Verificar si ya estamos en la ruta de redirección deseada
  const isAlreadyAtTarget = (userType === 'business' && location.pathname === '/business/dashboard') || (userType === 'client' && location.pathname === '/store');

  // if (!isAuthenticated && redirectIfAuthenticated) {
  //   // Si el usuario debe estar autenticado y no lo está, redirige al path de login
  //   return <Navigate to={redirectPath} state={{ from: location }} replace />;
  // }

  // Redirige si el usuario no está autenticado
  if (!isAuthenticated && !redirectIfAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Redirige si el usuario no tiene el tipo requerido
  if (userTypeRequired && userType !== userTypeRequired) {
    return <Navigate to={redirectPath} replace />;
  }

  // Redirige si el usuario ya está autenticado y no debería estar aquí (como en las rutas de login/signup)
  if (isAuthenticated && redirectIfAuthenticated && !isAlreadyAtTarget) {
    const redirectTarget = userType === 'business' ? '/business/dashboard' : '/store';
    return <Navigate to={redirectTarget} replace />;
  }

  return children || <Outlet />;
};

export default ProtectedRoute;