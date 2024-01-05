import { ethers } from 'ethers';
import { config } from '../config';
import { promises as fs } from 'fs';

/* interface SmartContractJson {
    name: string;
    address: string,
    abi: any[]
} */

export class BridgeUtils {
    private static abi: any[];
    private static contractAddress: string;
    //private static bridgeContract: SmartContractJson

    static async initialize() {
        //const contracts = JSON.parse(await fs.readFile(config.bridgeContractPath, 'utf8'));
        //BridgeUtils.bridgeContract = contracts.find((contract: any) => contract.name === 'Bridge');
        BridgeUtils.abi = JSON.parse(await fs.readFile(config.abiFilePath, 'utf8'));
        BridgeUtils.contractAddress = Buffer.from(await fs.readFile(config.contractAddressPath)).toString();
    }

    public static async sendTx(signer: ethers.Signer, methodName: string, args?: any[], overrides?: any) {
        const contract = new ethers.Contract(BridgeUtils.contractAddress, BridgeUtils.abi, signer);
        if (!contract[methodName]) {
            throw new Error(`Método ${methodName} no encontrado en el contrato`);
        }
        if (args && args.length > 0) {
            return contract[methodName](...args, { ...overrides });
        } else {
            return contract[methodName]();
        }
    }

    public static prepareTransactionData(methodName: string, methodArgs: any[], userAddress: string) {
        const provider = new ethers.JsonRpcProvider(config.providerURL);
        const contract = new ethers.Contract(BridgeUtils.contractAddress, BridgeUtils.abi, provider);
        const txData = contract.interface.encodeFunctionData(methodName, methodArgs);

        const transaction = {
            to: BridgeUtils.contractAddress,
            from: userAddress,
            data: txData,
            // .....gasLimit, gasPrice, etc.
        };

        return transaction;
    }

    /* static async changeCommission(signer: ethers.Signer, newCommission: number) {
        return await BridgeUtils.sendTx(signer, 'changeCommission', [newCommission]);
    } */

    static async commission(signer: ethers.Signer) {
        return await BridgeUtils.sendTx(signer, 'commission');
    }

    static async deposit(signer: ethers.Signer, nonce: string, amount: string, overrides?: any[]) {
        const amountParsed = ethers.parseEther(amount.toString());
        return await BridgeUtils.sendTx(signer, 'deposit', [nonce], { amountParsed, ...overrides || [] });
    }

    static async getBalance(signer: ethers.Signer) {
        return await BridgeUtils.sendTx(signer, 'getBalance');
    }
    
    static async getFees(signer: ethers.Signer) {
        return await BridgeUtils.sendTx(signer, 'getFees');
    }
    
    static async getNonce(signer: ethers.Signer, sender: ethers.AddressLike) {
        return await BridgeUtils.sendTx(signer, 'getNonce', [sender])
    }
    
    static async getTx(signer: ethers.Signer, sender: ethers.AddressLike, txNumber: string) {        
        return await BridgeUtils.sendTx(signer, 'getTx', [sender, txNumber]);
    }
    
    /* static async payFees(signer: ethers.Signer) {        
        return await BridgeUtils.sendTx(signer, 'payFees');
    } */
    
    static async totalBalance(signer: ethers.Signer) {        
        return await BridgeUtils.sendTx(signer, 'totalBalance');
    }
    
    /* static async withdraw(signer: ethers.Signer, amount: string, to: ethers.AddressLike, overrides?: any) {
        const amountParsed = ethers.parseEther(amount.toString());        
        return await BridgeUtils.sendTx(signer, 'withdraw', [amountParsed, to], overrides || []);
    } */
}

export default BridgeUtils;