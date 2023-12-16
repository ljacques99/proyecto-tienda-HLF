import { createContext, useContext, useState } from 'react';

const BasketContext = createContext();

export const BasketProvider = ({ children }) => {
  const [basketItems, setBasketItems] = useState([]);

  const addToBasket = (item) => {
    setBasketItems([...basketItems, item]);
  };

  const removeFromBasket = (itemId) => {
    setBasketItems(basketItems.filter(item => item.id !== itemId));
  };

  const clearBasket = () => {
    setBasketItems([]);
  };

  return (
    <BasketContext.Provider value={{ basketItems, addToBasket, removeFromBasket, clearBasket }}>
      {children}
    </BasketContext.Provider>
  );
};

export const useBasket = () => useContext(BasketContext);

export default BasketContext;