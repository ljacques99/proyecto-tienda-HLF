import { writeChaincodeToken } from "../transaction";

export const Burn = async (amount, verifyToken) => {
    const functionData = { 
        fcn: "Burn", 
        args: [amount]
    }    
    return await writeChaincodeToken(functionData, verifyToken)
};