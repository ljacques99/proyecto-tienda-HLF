import { useBasket } from '../context/BasketContext';

const Basket = () => {
  const { basketItems, removeFromBasket } = useBasket();

  // Calcular el subtotal de los elementos en la cesta
  const subtotal = basketItems.reduce((total, item) => total + item.price, 0);

  return (
    <div className="bg-white py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Shopping Cart</h2>
        <ul role="list" className="mt-8 divide-y divide-gray-200">
          {basketItems.map((item) => (
            <li key={item.id} className="flex items-center py-6 space-x-6">
              <img src={item.image} alt={item.title} className="h-24 w-24 object-cover object-center rounded-md" />
              <div className="flex flex-1 justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">{item.title}</span>
                  <span className="text-sm text-gray-600">{item.options}</span> {/* Replace with item options like size or color */}
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">${item.price}</span>
                  <button onClick={() => removeFromBasket(item.id)} className="ml-4 text-sm font-medium text-indigo-600 hover:text-indigo-500">Remove</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-900">Subtotal</span>
            <span className="text-sm font-medium text-gray-900">${subtotal.toFixed(2)}</span>
          </div>
          <p className="mt-1 text-sm text-gray-600">Shipping and taxes will be calculated at checkout.</p>
          <div className="mt-6">
            <button className="w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700">Checkout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Basket;
