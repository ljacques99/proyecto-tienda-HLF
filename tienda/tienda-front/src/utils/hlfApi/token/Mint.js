import { writeChaincodeToken } from "../transaction";

export const Mint = async (address, nonce, verifyToken) => {
    const functionData = { 
        fcn: "Mint", 
        args: [address, nonce]
    }    
    return await writeChaincodeToken(functionData, verifyToken)
};