import { readChaincode } from "../transaction";

export const getInvoiceDetail = async (invoiceNumber, lineNumber, verifyToken) => {
    const functionData = { 
        fcn: "getInvoiceDetail", 
        args: [invoiceNumber, lineNumber]
    }    
    return await readChaincode('client', functionData, verifyToken)
};