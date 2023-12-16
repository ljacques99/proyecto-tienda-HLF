import { useContext, useState, useEffect } from 'react';
import AuthContext from '../../context/AuthContext';
import { getMerchant } from '../../utils/hlfApi/chaincode/Merchant/getMerchant';
import { addMerchant } from '../../utils/hlfApi/chaincode/Merchant/addMerchant';
import adminProfile from '../../assets/images/adminProfile.png'
import LoadingCard from '../../components/LoadingCard'

const backProfile = "https://cutewallpaper.org/27/black-white-mountain-wallpaper/1023518377.jpg"

const Dashboard = () => {
  const { user, token, isAuthenticated, userIdentity } = useContext(AuthContext);
  const [merchant, setMerchant] = useState(null);
  const [isMerchantRegistered, setIsMerchantRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMerchant = async () => {
      try {
        setIsLoading(true);
        if (!userIdentity) return setIsLoading(false)
        const result = await getMerchant(userIdentity.toString(), token);
        if (!result[0]?.message.includes("error")) {
          setMerchant(true);
          setIsMerchantRegistered(true);
        } else {
          setIsMerchantRegistered(false);
        }
      } catch (error) {
        console.error('Error fetching merchant:', error);
        setIsMerchantRegistered(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchMerchant();
    }
  }, [isAuthenticated, userIdentity, token]);

  const handleRegisterMerchant = async () => {
    try {
      if (user && token) {
      const registration = await addMerchant(user, token)
      if (!registration) return
      setIsMerchantRegistered(true)
      setMerchant(true)
      }
    } catch (error) {
      console.error("Error registrando al usuario", error);
    }
  };

  if (isLoading) {
    // Mostrar tarjeta de carga
    return (
      <LoadingCard className="max-w-2xl mx-4 h-80 sm:max-w-sm md:max-w-sm lg:max-w-sm xl:max-w-sm sm:mx-auto md:mx-auto lg:mx-auto xl:mx-auto mt-16 shadow-xl rounded-lg" />
    )
  }

  return (
    <div className="max-w-2xl mx-4 sm:max-w-sm md:max-w-sm lg:max-w-sm xl:max-w-sm sm:mx-auto md:mx-auto lg:mx-auto xl:mx-auto mt-16 bg-white shadow-xl rounded-lg text-gray-900">
      <div className="rounded-t-lg h-32 overflow-hidden">
        {/* Imagen de cabecera */}
        <img className="object-cover object-top w-full" src={backProfile} alt='Imagen Cabecera' />
      </div>
      <div className="mx-auto w-32 h-32 relative -mt-16 border-4 border-white rounded-full overflow-hidden">
        {/* Imagen del perfil */}
        <img className="object-cover object-center w-auto" src={adminProfile} alt='Imagen Perfil' />
      </div>
      <div className="text-center mt-2">
        {/* Título y descripción */}
        <h2 className="font-semibold">{user}</h2>
        {isMerchantRegistered ? <p className="text-green-500">Registered Merchant</p> : <p className="text-red-500">Unegistered Merchant</p>}
      </div>
      <div className="py-4 mt-2 text-gray-700 flex items-center justify-around">
        {/* Opcional: Información adicional del usuario o estadísticas */}
      </div>
      <div className="p-4 border-t mx-8 mt-2">
        {/* Botón condicional */}
        {isMerchantRegistered ? (
          <div className="text-center"></div>
        ) : (
          <button onClick={handleRegisterMerchant} className="w-1/2 block mx-auto rounded-full bg-gray-900 hover:shadow-lg font-semibold text-white px-6 py-2">
            Register
          </button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;