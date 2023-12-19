import { Burn } from "../hlfApi/token/Burn";
import { withdrawBridge } from "../hlfApi/transaction";
import { ClientAccountID } from "../hlfApi/token/ClientAccountID";
import { getMyIdentity } from "../hlfApi/chaincode/getMyIdentity";

export const withdrawFromHLF = async (amount, verifyToken) => {
    try {

        const nonce = await Burn(amount, verifyToken)
        if (!nonce) throw new Error("something went wrong with the Burn nonce")

        const userID = await getMyIdentity('client', verifyToken)
        if (!userID) throw new Error("couldn't find a user Id match ")

        const withdrawData = {
            args: [ 
                userID.id, nonce.toString()
            ]
        }
        console.log(withdrawData)
        const response = await withdrawBridge(withdrawData, verifyToken) 
        console.log(response)
        return 
    } catch (error) {
        console.error("Error in depositToHLF:", error);
        throw error;
    }
};