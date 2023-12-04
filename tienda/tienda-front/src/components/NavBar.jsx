import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImage from '../assets/images/shop-logo.png'
import logOnIcon from '../assets/icons/login-on.png';
import logOffIcon from '../assets/icons/login-off.png';

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <nav className="flex items-center justify-between bg-white p-4"> 
      <div onClick={() => navigate('/')} className="cursor-pointer">
        <img src={logoImage} alt="LedgerProducts Logo" className="h-10 w-auto" />
      </div>

      {user ? (
        <div className="flex items-center gap-4">
          <div className="cursor-pointer" onClick={() => navigate('/products')}>
            Productos
          </div>
          <div className="cursor-pointer" onClick={() => navigate('/shop')}>
            Tienda
          </div>
          <div className="cursor-pointer" onClick={() => navigate('/basket')}>
            Cesta
          </div>
          <div onClick={() => { /* Aquí deberías manejar el logout o perfil del usuario */ }}>
            <img src={logOnIcon} alt="User Logged In" className="h-10 w-auto" />
          </div>
        </div>
      ) : (
        <div className="cursor-pointer" onClick={() => navigate('/login')}>
          <img src={logOffIcon} alt="Login" className="h-10 w-auto" />
        </div>
      )}
    </nav>
  );
};

export default Navbar;