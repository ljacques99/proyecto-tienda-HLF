import { readChaincodeToken } from "../transaction";

export const ClientAccountBalance = async (verifyToken) => {
    const functionData = { 
        fcn: "ClientAccountBalance", 
        args: []
    }    
    return await readChaincodeToken(functionData, verifyToken)
};