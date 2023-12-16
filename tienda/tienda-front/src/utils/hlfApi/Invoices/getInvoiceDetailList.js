import { readChaincode } from "../transaction";

export const getInvoiceDetailList = async (invoiceNumber, verifyToken) => {
    const functionData = { 
        fcn: "getInvoiceDetailList", 
        args: [invoiceNumber]
    }    
    return await readChaincode('client', functionData, verifyToken)
};