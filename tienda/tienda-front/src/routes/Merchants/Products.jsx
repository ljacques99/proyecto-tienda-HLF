import { useContext, useState, useEffect } from 'react';
import AuthContext from '../../context/AuthContext';
import { getProductListByMerchant } from '../../utils/hlfApi/chaincode/Merchant/getProductListByMerchant';
import { getMyProductList } from '../../utils/hlfApi/chaincode/Merchant/getMyProductList';
import { addProduct } from '../../utils/hlfApi/chaincode/Merchant/addProduct'
import { deleteProduct } from '../../utils/hlfApi/chaincode/Merchant/deleteProduct'
import ProductCard from '../../components/Merchants/ProductCard';
import LoadingCard from '../../components/LoadingCard';

const Products = () => {
  const { token, userIdentity } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [productAdded, setProductAdded] = useState(false)
  const [productRemoved, setProductRemoved] = useState(false)
  const [newProduct, setNewProduct] = useState({
    id: '',
    name: '',
    price: '',
    imageURL: ''
  });

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // const productList = await getProductListByMerchant(userIdentity, token);
        const productList = await getMyProductList(token);
        setProducts(productList);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [userIdentity, token, productAdded]);

  // Handle form submission
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await addProduct(newProduct, token);
      setProducts([...products, newProduct]);
      setNewProduct({ id: '', name: '', price: '', imageURL: '' }); // Reset form
      setProductAdded(true)
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id, token);
      setProducts(products.filter(product => product.id !== id));
      setProductRemoved(true)
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <div className="min-h-screen w-full">
      <h2 className="text-2xl font-bold text-center mb-8">Your Products</h2>
      {/* Product Grid */}
      <div className="mx-auto max-w-7xl lg:px-8 py-16">
        
        {isLoading ? (
          <LoadingCard className="h-80" />
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} onDelete={() => handleDeleteProduct(product.id)} />
            ))}
          </div>
        )}
      </div>

      {/* Add Product Form */}
      <div className="max-w-2xl mx-auto mt-16 bg-white shadow-xl rounded-lg p-8">
        <h3 className="text-xl font-bold mb-4">Add New Product</h3>
        <form className="space-y-4" onSubmit={handleAddProduct}>
          {/* Product ID */}
          <div>
            <label htmlFor="id" className="block mb-2 text-sm font-medium text-gray-900">Product ID *</label>
            <input
              type="text"
              id="id"
              name="id"
              value={newProduct.id}
              onChange={e => setNewProduct({...newProduct, id: e.target.value})}
              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:outline-brandOne block w-full p-2.5"
              required
            />
          </div>
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">Product Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={newProduct.name}
              onChange={e => setNewProduct({...newProduct, name: e.target.value})}
              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:outline-brandOne block w-full p-2.5"
              required
            />
          </div>
          {/* Product Price */}
          <div>
            <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900">Price *</label>
            <input
              type="text"
              id="price"
              name="price"
              value={newProduct.price}
              onChange={e => setNewProduct({...newProduct, price: e.target.value})}
              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:outline-brandOne block w-full p-2.5"
              required
            />
          </div>
          {/* Image URL */}
          <div>
            <label htmlFor="imageURL" className="block mb-2 text-sm font-medium text-gray-900">Image URL *</label>
            <input
              type="text"
              id="imageURL"
              name="imageURL"
              value={newProduct.imageURL}
              onChange={e => setNewProduct({...newProduct, imageURL: e.target.value})}
              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:outline-brandOne block w-full p-2.5"
              required
            />
          </div>
          <button type="submit" className="w-full text-brandTwo bg-brandOne hover:bg-brandTwo hover:text-white focus:ring-4 focus:outline-none focus:ring-brandOne font-medium rounded-lg text-sm px-5 py-2.5 text-center">
            ADD PRODUCT
          </button>
        </form>
      </div>
    </div>
  );
};

export default Products;