import { deposit, getNonce } from "./BridgeFunctions"
import { addAddress } from "../hlfApi/token/addAddress"
import { Mint } from "../hlfApi/token/Mint"
import { ethers } from "ethers";

export const depositToHLF = async (walletAddress, verifyToken, amount, signerUser) => {
    try {
        if (!walletAddress) throw new Error("Wallet address is required.");

        const addAddressResult = await addAddress(walletAddress, verifyToken);
        console.log(addAddressResult);

        const nonce = await getNonce(walletAddress, signerUser);
        if (!nonce) throw new Error("Failed to obtain nonce.");

        const nonceTx = Number(nonce)
        console.log("Nonce: ", nonceTx)

        const depositToSC = await deposit(nonceTx, amount, signerUser);
        //if (!depositToSC || depositToSC.status !== 0) throw new Error("The deposit to smart contract failed.");
        console.log("Deposit: ", depositToSC)

        const mintResult = await Mint(walletAddress, nonceTx.toString(), verifyToken);
        console.log("Mint: ", mintResult)
        return mintResult;
    } catch (error) {
        console.error("Error in depositToHLF:", error);
        throw error;
    }
};