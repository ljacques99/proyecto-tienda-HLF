import { useNavigate } from 'react-router-dom';
import logoImage from '../assets/logo/businessLogo.svg';
import landingImage from '../assets/images/businessLanding.png';

const Business = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-start h-screen bg-brandTwo text-white">
      {/* Logo */}
      <div className="mb-2 h-4 w-auto">

      </div>
      <img src={logoImage} onClick={() => navigate('/')} alt="Logo" className="cursor-pointer mb-10 h-20 w-auto" /> {/* Ajusta el tamaño del logo */}

      {/* Botones */}
      <div className="flex flex-col items-center w-3/4 max-w-xs"> {/* Ajusta el tamaño de los botones */}
        <button
          onClick={() => navigate('/business/login')}
          className="mb-4 w-full px-4 py-2 border-2 border-brandOne bg-brandTwo text-brandOne text-md uppercase font-semibold rounded-md"
        >
          Identify
        </button>
        <button
          onClick={() => navigate('/business/signup')}
          className="w-full px-4 py-2 bg-brandOne text-brandTwo text-md uppercase font-semibold rounded-md"
        >
          New Member
        </button>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col md:flex-row items-center justify-around w-full mt-6">
        <img
          src={landingImage}
          alt="Ecommerce New Way"
          className="w-full md:w-1/2 px-4"
          style={{ maxWidth: '550px' }}
        />
        <div className="text-left max-w-md px-4">
          <h1 className="text-3xl font-bold mb-4 whitespace-nowrap"> {/* Evita saltos de línea */}
            Ecommerce in a new way
          </h1>
          <p className="text-justify"> {/* Justifica el texto */}
            Welcome to a new era of digital commerce, where security meets convenience. Discover our selection of products and experience shopping like never before, all within the robust framework of Hyperledger Fabric.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Business;