import { writeChaincodeToken } from "../transaction";

export const addAddress = async (address, verifyToken) => {
    const functionData = { 
        fcn: "addAddress", 
        args: [address]
    }    
    return await writeChaincodeToken(functionData, verifyToken)
};