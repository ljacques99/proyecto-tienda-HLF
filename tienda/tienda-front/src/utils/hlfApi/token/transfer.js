import { writeChaincodeToken } from "../transaction";

export const Transfer = async (to, amount, verifyToken) => {
    const functionData = { 
        fcn: "Transfer", 
        args: [to, amount]
    }    
    return await writeChaincodeToken(functionData, verifyToken)
};