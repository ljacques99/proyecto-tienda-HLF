export const readChaincode = async (userType, formData, verifyToken) => {
    const BASE_URL = userType === 'business' ? 'http://localhost:3003' : 'http://localhost:3004';
    
    try {
    const response = await fetch(`${BASE_URL}/tx/consult`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${verifyToken}`,
          'x-contract-name': 'TiendaContract'
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
}

export const writeChaincode = async (userType, formData, verifyToken) => {
    const BASE_URL = userType === 'business' ? 'http://localhost:3003' : 'http://localhost:3004';
    
    try {
    const response = await fetch(`${BASE_URL}/tx/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${verifyToken}`,
          'x-contract-name': 'TiendaContract'
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
}

export const readChaincodeToken = async (formData, verifyToken) => {
    const BASE_URL = 'http://localhost:3005'
    
    try {
    const response = await fetch(`${BASE_URL}/tx/consult`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${verifyToken}`,
          'x-contract-name': 'TokenERC20Contract'
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
}

export const writeChaincodeToken = async (formData, verifyToken) => {
    const BASE_URL = 'http://localhost:3005'
    
    try {
    const response = await fetch(`${BASE_URL}/tx/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${verifyToken}`,
          'x-contract-name': 'TokenERC20Contract'
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
}