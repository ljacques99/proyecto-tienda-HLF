import { ethers } from 'ethers';
import { config } from '../config';
import { promises as fs } from 'fs';
import BridgeUtils from '../utils/bridgeUtils';

class EthereumService {
    private provider: ethers.JsonRpcProvider;
    private signerOwner: ethers.Wallet;

    constructor() { 
        this.initialize();
    }

    private async initialize() {
        this.provider = new ethers.JsonRpcProvider(config.providerURL);
        //this.signerOwner = new ethers.Wallet(config.ownerPrivateKey, this.provider);
        await BridgeUtils.initialize();
    }

    public prepareContractTransaction(methodName: string, methodArgs: any[], userAddress: string) {
        return BridgeUtils.prepareTransactionData(methodName, methodArgs, userAddress);
    }

    /* public async handleSmartContractMethod(method: string, args: any[]) {
        const signer = this.signerOwner
        return BridgeUtils.sendTx(signer, method, ...args || []);
    } */

    public async getTransactionDetails(signedTransaction: string, signer: ethers.Signer): Promise<ethers.TransactionReceipt> {
        const tx = await this.provider.getTransaction(signedTransaction);
        return await tx.wait();
    }

    // public async changeCommission(signer: ethers.Signer, newCommission: number) {
    //     return await BridgeUtils.changeCommission(signer, newCommission);
    // }

    // public async commission(signer: ethers.Signer) {
    //     return await BridgeUtils.commission();
    // }

    // public async deposit(nonce: number, amount: number) {
    //     return await this.bridgeUtils.deposit(nonce, amount, {});
    // }

    // public async getBalance() {
    //     return await this.bridgeUtils.getBalance();
    // }

    // public async getFees() {
    //     return await this.bridgeUtils.getFees();
    // }

    // public async getNonce(sender: string) {
    //     return await this.bridgeUtils.getNonce(sender);
    // }

    // public async getTx(sender: string, txNumber: number) {
    //     return await this.bridgeUtils.getTx(sender, txNumber);
    // }

    // public async payFees() {
    //     return await this.bridgeUtils.payFees({});
    // }

    // public async totalBalance() {
    //     return await this.bridgeUtils.totalBalance();
    // }

    // public async withdraw(amount: number, to: string) {
    //     return await this.bridgeUtils.withdraw(amount, to, {});
    // }
}

export default new EthereumService();