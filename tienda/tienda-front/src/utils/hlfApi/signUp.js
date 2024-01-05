// Registrer a user in the HLF Organization
export const verifyAddressAuthority = async (userType, formData) => {
    try {
      console.log("userType", userType, "formData", formData)
      const BASE_URL = userType === 'business' ? 'http://localhost:3003' : 'http://localhost:3004';
      console.log('baseurl', BASE_URL)
      const response = await fetch(`${BASE_URL}/auth/wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
  
      if (!response && !response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      return await response.json();
    } catch (err) {
      console.error('Error:', err);
      return { error: err }; // O manejar el error de una manera que se ajuste a tu aplicación
    }
};
// Registrer a user in the HLF Organization
export const signUp = async (userType, formData, verifyAddressToken) => {
    try {
      const BASE_URL = userType === 'business' ? 'http://localhost:3003' : 'http://localhost:3004';
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${verifyAddressToken}`
        },
        body: JSON.stringify(formData)
      });
  
      if (!response && !response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Error:', err);
      return { error: err }; // O manejar el error de una manera que se ajuste a tu aplicación
    }
};