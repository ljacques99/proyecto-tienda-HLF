import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoStore from '../../assets/logo/logoStore.svg';
import logOnIcon from '../../assets/icons/loginOn.png';
import logOffIcon from '../../assets/icons/loginOff.png';
import logoBasket from '../../assets/icons/logoBasket.png'
import logoCesta from '../../assets/icons/logocesta2.png'
import logoWallet from '../../assets/icons/logowallet.png'

const ClientNavbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  // Efecto para escuchar clics fuera del menú desplegable
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="flex items-center justify-between bg-white p-4"> 
      {/* Sección Izquierda (Espacio vacío si no hay usuario) */}
      {user ? (
        <div className="flex-1 justify-start flex-1 gap-4">
        <div 
          className="cursor-pointer font-bold ml-4 pr-1 pl-1" 
          onClick={() => navigate('/store/products')}>
          PRODUCTS
        </div>
        </div>
      ) : (
        <div className="flex-1 justify-start flex-1 gap-4">
          <div>
          </div>
        </div>
      )}

      {/* Sección Central (Logo) */}
      {/* <div onClick={() => navigate('/store')} className="flex justify-center cursor-pointer flex-grw-0 pr-4 pl-4">
        <img src={logoStore} alt="LedgerProducts Logo" className="h-20 w-auto" />
      </div> */}
      <div onClick={() => navigate('/store')} className="content-center cursor-pointer flex-grw-0 pr-4 pl-4">
        <img src={logoStore} alt="LedgerProducts Logo" className="h-20 w-auto" />
      </div>

      {/* Sección Derecha (Cesta o Login) */}
      <div className="flex-1 justify-end flex">
      {user ? (
        <div className="flex items-center gap-4 mr-4">
           <div 
            className="cursor-pointer font-bold pr-1 pl-1" 
            onClick={() => navigate('/store/MATIC-LTK')}>
              <img className="w-8 h-8" src={logoWallet} alt="Wallet" />
          </div>
          <div 
            className="cursor-pointer font-bold pr-1 pl-1" 
            onClick={() => navigate('/store/basket')}>
              <img className="w-8 h-8" src={logoCesta} alt="Cesta" />
          </div>
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={toggleDropdown} 
              className="flex items-center text-sm font-medium text-gray-900 rounded-full hover:text-blue-600 focus:ring-0"
              type="button">
              <img className="w-8 h-8 rounded-full" src={logOnIcon} alt="user photo" />
              {/* Muestra el nombre del usuario aquí */}
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 z-50 bg-white text-base list-none divide-y divide-gray-100 rounded shadow my-4">
                <div className="px-4 py-3">
                  <span className="block text-sm">{user}</span>
                  {/* Muestra el email del usuario aquí si lo tienes */}
                </div>
                <ul className="py-1">
                  <li>
                    <button  onClick={() => navigate('/store/dashboard')} className="text-sm hover:bg-gray-100 text-gray-700 block w-full text-left px-4 py-2">Dashboard</button>
                  </li>
                  {/* <li>
                    <a href="#" className="text-sm hover:bg-gray-100 text-gray-700 block px-4 py-2">Settings</a>
                  </li>
                  <li>
                    <a href="#" className="text-sm hover:bg-gray-100 text-gray-700 block px-4 py-2">Earnings</a>
                  </li> */}
                  <li>
                    <button onClick={logout} className="text-sm hover:bg-gray-100 text-gray-700 block w-full text-left px-4 py-2">Sign out</button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
        
      ) : (
        <div className="flex items-center gap-4 mr-4">
           <div className="pr-1 pl-1">
          </div>
          <div className="pr-1 pl-1">
          </div>
          <div className="cursor-pointer" onClick={() => navigate(`/store/login`)}>
          <img src={logOffIcon} alt="Login" className="h-10 w-auto pr-1 pl-1" />
        </div>
        </div>
        
      )}
      </div>
    </nav>
  );
};

export default ClientNavbar;