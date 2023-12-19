import { smartContractAPI } from "./config";

export const getNonce = async(walletAddress, args, verifyToken) => {
    const functionData = {
        method: 'getNonce',
        args: [args] || [],
        signerType: 'owner'
    }

    return await smartContractAPI(walletAddress, functionData, verifyToken)
}