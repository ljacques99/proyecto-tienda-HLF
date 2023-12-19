import { readChaincodeTokenUserId } from "../transaction";

export const ClientAccountID = async (verifyToken) => {
    const functionData = { 
        fcn: "ClientAccountID", 
        args: []
    }    
    return await readChaincodeTokenUserId(functionData, verifyToken)
};