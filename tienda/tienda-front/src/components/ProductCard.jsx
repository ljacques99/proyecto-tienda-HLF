import { useBasket } from '../context/BasketContext';

const ProductCard = ({ product }) => {
  const { addToBasket } = useBasket();

  const handleAddToBasket = () => {
    addToBasket(product);
  };

  return (
    <div className="group">
      {/* <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
        <img src={product.image} alt={product.title} className="aspect-square object-cover object-center group-hover:opacity-75" />
      </div> */}
      <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
      <p className="mt-1 text-lg font-medium text-gray-900">${product.priceInt}</p>
      <button className="mt-4 w-full text-white bg-brandOne hover:bg-opacity-75 focus:ring-4 focus:outline-none focus:ring-brandOne font-medium rounded-lg text-sm px-5 py-2.5 text-center" onClick={handleAddToBasket}>
        Añadir a la cesta
      </button>
    </div>
  );
};

export default ProductCard;