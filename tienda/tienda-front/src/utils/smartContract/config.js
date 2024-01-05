export const smartContractAPI = async (walletAddress, formData, verifyToken) => {
    const BASE_URL = 'http://localhost:3004'

    const address = !walletAddress ? "007" : walletAddress
    
    try {
    const response = await fetch(`${BASE_URL}/smartcontract/bridge/${address}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${verifyToken}`
        },
        body: JSON.stringify(formData)
      });
  
      if (!response && !response.ok) {
        throw console.log(`Error: ${response.statusText}`);
      }

      return await response
    } catch (error) {
      console.error('Error:', error);
      return null; // O manejar el error de una manera que se ajuste a tu aplicación
    }
}