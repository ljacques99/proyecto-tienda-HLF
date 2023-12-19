import { readChaincodeToken } from "../transaction";

export const getAddress = async (address, verifyToken) => {
    const functionData = { 
        fcn: "getAddress", 
        args: [address]
    }    
    return await readChaincodeToken(functionData, verifyToken)
};