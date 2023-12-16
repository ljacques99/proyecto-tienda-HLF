// BusinessNavbar.jsx
import { useNavigate } from 'react-router-dom';
import logoImage from '../../assets/logo/businessLogo.svg';
import { useAuth } from '../../context/AuthContext';

const BusinessNavbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <nav className="flex flex-col h-screen bg-brandTwo p-4 text-white">
      <div onClick={() => navigate('/')} className="cursor-pointer mb-4">
        <img src={logoImage} alt="LedgerProducts Logo" className="h-10 w-auto" />
      </div>

      {user ? (
        <>
          <button onClick={() => navigate('/business/dashboard')} className="mb-2">
            Dashboard
          </button>
          <button onClick={() => navigate('/business/dashboard/products')} className="mb-2">
            Products
          </button>
          <button onClick={() => navigate('/business/dashboard/invoices')} className="mb-2">
            Invoices
          </button>
          {/* Otros botones o enlaces del menú */}
          <button onClick={logout} className="mt-auto">
            Logout
          </button>
        </>
      ) : (
        <div onClick={() => navigate('/business/login')} className="mt-auto cursor-pointer">
          
        </div>
      )}
    </nav>
  );
};

export default BusinessNavbar;