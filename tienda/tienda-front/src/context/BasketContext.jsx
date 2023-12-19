import { createContext, useContext, useState } from 'react';

const BasketContext = createContext();

export const BasketProvider = ({ children }) => {
  const [basketItems, setBasketItems] = useState([]);

  const getItemUniqueId = (item) => item.id + "-" + item.merchantId;

  const addToBasket = (itemToAdd) => {
    setBasketItems((prevItems) => {
      // Verifica si el item ya está en el carrito
      const uniqueIdToAdd = getItemUniqueId(itemToAdd);
      const existingItem = prevItems.find(item => getItemUniqueId(item) === uniqueIdToAdd);
      
      // Si ya está, incrementa la cantidad
      if (existingItem) {
        return prevItems.map(item =>
          getItemUniqueId(item) === uniqueIdToAdd
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      // Si no está, añade el nuevo item con cantidad inicial 1
      return [...prevItems, { ...itemToAdd, quantity: 1 }];
    });
  };

  const removeFromBasket = (itemToRemove) => {
    setBasketItems((prevItems) => {
      const uniqueIdToRemove = getItemUniqueId(itemToRemove);
      const existingItem = prevItems.find(item => getItemUniqueId(item) === uniqueIdToRemove);
      
      if (!existingItem) {
        return prevItems;
      }

      if (existingItem.quantity <= 1) {
        return prevItems.filter(item => getItemUniqueId(item) !== uniqueIdToRemove);
      }
      
      return prevItems.map(item =>
        getItemUniqueId(item) === uniqueIdToRemove
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  };

  const removeCompletelyFromBasket = (itemToRemove) => {
    const uniqueIdToRemove = getItemUniqueId(itemToRemove);
    setBasketItems(prevItems => prevItems.filter(item => getItemUniqueId(item) !== uniqueIdToRemove));
  };

  const clearBasket = () => {
    setBasketItems([]);
  };

  // Calcula el precio total
  const getTotalPrice = () => {
    return basketItems.reduce((total, item) => total + item.priceInt * item.quantity, 0);
  };

  return (
    <BasketContext.Provider value={{ basketItems, addToBasket, removeFromBasket, removeCompletelyFromBasket, clearBasket, getTotalPrice }}>
      {children}
    </BasketContext.Provider>
  );
};

export const useBasket = () => useContext(BasketContext);

export default BasketContext;
