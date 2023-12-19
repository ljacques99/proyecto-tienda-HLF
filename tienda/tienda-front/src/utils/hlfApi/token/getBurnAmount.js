import { readChaincodeToken } from "../transaction";

export const getBurnAmount = async (user, nonce, verifyToken) => {
    const functionData = { 
        fcn: "getBurnAmount", 
        args: [user, nonce]
    }    
    return await readChaincodeToken(functionData, verifyToken)
};