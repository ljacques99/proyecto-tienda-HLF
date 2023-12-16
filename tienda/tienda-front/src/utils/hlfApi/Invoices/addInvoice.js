import { writeChaincode } from "../transaction";

export const addInvoice = async (merchantId, linesString, verifyToken) => {
    const functionData = { 
        fcn: "addInvoice", 
        args: [merchantId, linesString]
    }    
    return await writeChaincode('client', functionData, verifyToken)
};