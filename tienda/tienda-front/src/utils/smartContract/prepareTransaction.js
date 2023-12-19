import { smartContractAPI } from "./config";

export const prepareTransaction = async(methodName, args, verifyToken) => {
    const functionData = {
        method: methodName,
        args: [args] || [],
        signerType: 'public'
    }

    return await smartContractAPI(functionData, verifyToken)
}