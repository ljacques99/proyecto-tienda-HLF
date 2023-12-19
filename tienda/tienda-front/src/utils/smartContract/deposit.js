import { smartContractAPI } from "./config";

export const deposit = async(walletAddress, args, verifyToken) => {
    const functionData = {
        method: 'deposit',
        args: [args] || [],
        signerType: 'public'
    }

    return await smartContractAPI(walletAddress, functionData, verifyToken)
}