import { useEffect, useState, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import ProductCard from '../../components/Clients/ProductCard';
import { getProductList } from '../../utils/hlfApi/chaincode/Client/getProductList';
import LoadingCard from '../../components/LoadingCard';

const Products = () => {
  const { user, token, isAuthenticated, userIdentity } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      const products = await getProductList(token);
      setProducts(products);
      setIsLoading(false)
    };

    fetchProducts();
  }, [isAuthenticated, userIdentity, token]);

  if (isLoading) {
    // Mostrar tarjeta de carga
    return (
      <LoadingCard className="min-h-screen w-full " />
      
    )
  }

  return (
    <div className="bg-brandOne min-h-screen w-full">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="sr-only">Products</h2>
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {products.map(product => (
             <ProductCard key={`${product.id}-${product.merchantId}`} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;