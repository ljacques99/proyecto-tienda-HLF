const BASE_URL = 'http://localhost:3003';

// Obtener todos los productos
const getAllProducts = async () => {
  try {
    const request = {
      user: "user-org1",
      fcn: "getProductList"
    }
    const response = await fetch(`${BASE_URL}/consult`, {
      method: 'POST',
      body: JSON.stringify(request),
      headers : {'Content-type': 'application/json'}
    }).then(res => res.json())
    /* if (!response.ok) {
      console.log("hay error", response)
      throw new Error('Error fetching products');
    } */
    console.log("response", response)
    return await response;
  } catch (error) {
    console.error('Error:', error);
  }
};

const result = await getAllProducts()
console.log(result)