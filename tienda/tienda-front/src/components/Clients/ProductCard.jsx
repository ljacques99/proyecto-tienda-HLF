import { useBasket } from '../../context/BasketContext';
import Notification from '../Notification';
import { useState } from 'react'
import { formatPrice } from '../../utils/functions/formatPrice';
import token from '../../assets/logo/token.png'

const ProductCard = ({ product }) => {
  const { addToBasket } = useBasket();
  const [showNotification, setShowNotification] = useState(false);

  const handleAddToBasket = () => {
    addToBasket(product);
    // Mostrar notificación emergente
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000)
  };

  return (
    <div className="block rounded-lg bg-white shadow-md text-center transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg h-full flex flex-col">
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-t-lg bg-white-200 p-2">
        <img src={product.imageURL} alt={product.name} className="aspect-square object-cover object-center" />
      </div>
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
          <p className="mt-1 text-lg font-medium text-gray-900">
              {formatPrice(product.priceInt)} 
            <img className="inline relative object-top w-5 h-5 ml-1 mt-[-3.5px]" src={token} alt="token"/>
          </p>
          
        </div>
        <button className="mt-4 w-full text-white bg-brandTwo hover:bg-opacity-75 focus:ring-0 focus:outline-none focus:ring-brandTwo font-medium rounded-lg text-sm px-5 py-2.5 text-center" onClick={handleAddToBasket}>
          Añadir a la cesta
        </button>


      {showNotification && (
        <Notification
          message="Producto añadido a la cesta"
          imageUrl={product.imageURL}
          onClose={() => setShowNotification(false)}
        />
      )}
      </div>
    </div>
  );
};
export default ProductCard;