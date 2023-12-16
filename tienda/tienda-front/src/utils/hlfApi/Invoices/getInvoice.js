import { readChaincode } from "../transaction";

export const getInvoice = async (invoiceNumber, verifyToken) => {
    const functionData = { 
        fcn: "getInvoice", 
        args: [invoiceNumber]
    }    
    return await readChaincode('client', functionData, verifyToken)
};