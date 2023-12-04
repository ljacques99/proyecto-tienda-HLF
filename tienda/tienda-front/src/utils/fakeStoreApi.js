//const BASE_URL = 'https://fakestoreapi.com';
const BASE_URL = 'http://localhost:3003';

// Obtener todos los productos
export const getAllProducts = async () => {
  try {
    const request = {
      user: "user-org1",
      fcn: "getProductList"
    }
    const response = await fetch(`${BASE_URL}/consult`, {
      method: 'POST',
      body: JSON.stringify(request),
      headers : {'Content-type': 'application/json'}
    })
    if (!response.ok) {
      console.log("hay error", response)
      throw new Error('Error fetching products');
    }
    console.log("response", response)
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
  }
};

// Obtener un producto específico por ID
export const getProductById = async (productId) => {
  try {
    const response = await fetch(`${BASE_URL}/products/${productId}`);
    if (!response.ok) {
      throw new Error(`Error fetching product with ID: ${productId}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
  }
};

// Ejemplo de más funciones que podrías necesitar:
// - Obtener categorías de productos
// - Obtener productos por categoría
// - etc.
