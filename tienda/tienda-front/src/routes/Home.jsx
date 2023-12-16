import { useNavigate } from 'react-router-dom';
import ClientsLogo from "../assets/images/Clients.png";
import BusinessLogo from "../assets/images/Business.png";
import ShopLogo from "../assets/logo/shop-logo.svg"; // Asegúrate de que la ruta es correcta
import localforage from 'localforage';

const Home = () => {
  const navigate = useNavigate();

  async function setRole(userType) {
    await localforage.setItem('userType', userType);
    const root = userType === 'client' ? 'store' : 'business'
    navigate(`/${root}`)
  }

  return (
    <div className="bg-brandOne min-h-screen w-full">
      {/* Bloque superior con el logo */}
      <div className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 pt-10 pb-10 sm:px-10 lg:pt-10 text-center">
          <img src={ShopLogo} alt="Shop Logo" className="mx-auto h-20 w-auto" />
          <header className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Ledger Products</h1>
            <p className="mt-2 text-sm font-semibold text-gray-400">
              From traditional to next generation shopping experience.
            </p>
          </header>
        </div>
      </div>

      {/* Tarjetas */}
      <div className="flex flex-wrap gap-4 justify-center p-10">
        {/* Tarjeta para Business */}
        <div className="block rounded-lg bg-white shadow-md p-6 w-80 cursor-pointer text-center transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg" onClick={() => setRole('business')}>
          <img className="rounded-t-lg mx-auto" src={BusinessLogo} alt="Business" />
          <div className="p-6">
            <h5 className="mb-2 text-xl font-medium leading-tight text-neutral-800">Business Access</h5>
            <p className="mb-4 text-base text-neutral-600">
              Access for businesses and product management.
            </p>
            <button type="button" className="mt-4 rounded bg-brandTwo w-full px-6 py-2.5 text-xs font-medium uppercase leading-normal text-white transition duration-150 ease-in-out hover:bg-primary-600 focus:outline-none focus:ring-0 active:bg-primary-700">
              Enter
            </button>
          </div>
        </div>

        {/* Tarjeta para Client */}
        <div className="block rounded-lg bg-white shadow-md p-6 w-80 cursor-pointer text-center transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg" onClick={() => setRole('client')}>
          <img className="rounded-t-lg mx-auto" src={ClientsLogo} alt="Client" />
          <div className="p-6">
            <h5 className="mb-2 text-xl font-medium leading-tight text-neutral-800">Client Access</h5>
            <p className="mb-4 text-base text-neutral-600">
              Access for customers and product exploration.
            </p>
            <button type="button" className="mt-4 rounded bg-brandOne w-full px-6 py-2.5 text-xs font-bold uppercase leading-normal text-brandTwo transition duration-150 ease-in-out hover:bg-primary-600 focus:outline-none focus:ring-0 active:bg-primary-700">
              Enter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
