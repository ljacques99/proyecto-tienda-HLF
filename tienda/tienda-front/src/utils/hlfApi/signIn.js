
export const signIn = async (userType, formData) => {
    try {
      const BASE_URL = userType === 'business' ? 'http://localhost:3003' : 'http://localhost:3004';
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
  
      if (!response && !response.ok) {
        throw console.log(`Error: ${response.statusText}`);
      }

      return await response.json()
    } catch (error) {
      console.error('Error:', error);
      return null; // O manejar el error de una manera que se ajuste a tu aplicación
    }
};

export const signInWithWallet = async (userType, formData) => {
    try {
      const BASE_URL = userType === 'business' ? 'http://localhost:3003' : 'http://localhost:3004';
      const response = await fetch(`${BASE_URL}/auth/loginV2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
  
      if (!response && !response.ok) {
        throw console.log(`Error: ${response.statusText}`);
      }

      return await response.json()
    } catch (error) {
      console.error('Error:', error);
      return null; // O manejar el error de una manera que se ajuste a tu aplicación
    }
};

