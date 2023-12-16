import { readChaincode } from "../transaction";

export const getMyIdentity = async (userType, verifyToken) => {

    const functionData = { 
        fcn: "getMyIdentity", 
        args: [ "" ]
    }
    
    return await readChaincode(userType, functionData, verifyToken)
    // try {
    //   const BASE_URL = userType === 'business' ? 'http://localhost:3003' : 'http://localhost:3004';
      
    //   const functionData = { 
    //       fcn: "getMyIdentity", 
    //       args: [ "" ]
    //     }
    //   const response = await fetch(`${BASE_URL}/tx/consult`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `${verifyToken}`
    //     },
    //     body: JSON.stringify(functionData)
    //   });
  
    //   if (!response && !response.ok) {
    //     throw console.log(`Error: ${response.statusText}`);
    //   }

    //   return await response.json()
    // } catch (error) {
    //   console.error('Error:', error);
    //   return null; // O manejar el error de una manera que se ajuste a tu aplicación
    // }
};