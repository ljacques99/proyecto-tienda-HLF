import { useBasket } from '../../context/BasketContext';
import { checkOut } from '../../utils/functions/checkOut';
import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { formatPrice } from '../../utils/functions/formatPrice';
import tokenLogo from "../../assets/logo/token.png"

const Basket = () => {
  const { basketItems, addToBasket, removeFromBasket, removeCompletelyFromBasket, getTotalPrice } = useBasket();
  const { token, userIdentity } = useContext(AuthContext);

  // Calcular el subtotal de los elementos en la cesta
  const subtotal = basketItems.reduce((total, item) => total + item.priceInt, 0);

  const handleCheckOut = async () => {
    try {
      if (!basketItems) return
      await checkOut(basketItems, token)
    } catch (error) {
      console.error('Error creating Invoices', error);
    }
  };

  return (
    <div className="bg-white py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Shopping Cart</h2>
        <ul>
      {basketItems.map((item) => (
        <li key={`${item.id}-${item.merchantId}`} className="flex items-center py-6 space-x-6">
          <img src={item.imageURL} alt={item.name} className="h-24 w-24 object-cover object-center rounded-md" />
          <div className="flex flex-1 justify-between items-center">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900 py-1">{item.name}</span>
              <div className="flex items-center text-sm text-gray-600">
                Quantity: 
                <button 
                  onClick={() => removeFromBasket(item)}
                  className="bg-gray-200 text-gray-800 hover:bg-gray-300 ml-2 px-2 py-0.5 rounded"
                >
                  -
                </button>
                <span className="mx-2">{item.quantity}</span>
                <button 
                  onClick={() => addToBasket(item)}
                  className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-2 py-0.5 rounded"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-900">{formatPrice(item.priceInt * item.quantity)}</span>
              <img className="inline relative object-top w-4 h-4 ml-1 mt-0" src={tokenLogo} alt="token"/>
              <button 
                onClick={() => removeCompletelyFromBasket(item)} 
                className="ml-4 text-sm font-medium text-[#B6B6B6] hover:text-[#505050]"
              >
                Remove
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
        <div className="mt-8">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-900">Subtotal</span>
            <span className="text-sm font-medium text-gray-900">{formatPrice(getTotalPrice())}
            <img className="inline relative object-top w-4 h-4 ml-1 mt-[-3.5px]" src={tokenLogo} alt="token"/></span>
           
          </div>
          <p className="mt-1 text-sm text-gray-600">Shipping and taxes will be calculated at checkout.</p>
          <div className="mt-6">
            <button onClick={handleCheckOut} className="w-full bg-[#6AC8C8] border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-brandTwo hover:text-brandOne">CHECKOUT</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Basket;
