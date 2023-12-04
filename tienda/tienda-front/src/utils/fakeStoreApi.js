const BASE_URL = 'https://fakestoreapi.com';

// Obtener todos los productos
export const getAllProducts = async () => {
  try {
    const response = await fetch(`${BASE_URL}/products`);
    if (!response.ok) {
      throw new Error('Error fetching products');
    }
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
